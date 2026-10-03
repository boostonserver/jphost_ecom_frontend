import { api } from "@/lib/api";

/*
 * Cart client (Phase 8).
 *
 * Two things this deliberately does NOT do:
 *
 *   It never computes money. `unit_price`, `line_total` and `subtotal` all come
 *   from the server and are rendered as given (engineering rule 2). A browser
 *   deciding what something costs is the bug this whole architecture exists to
 *   prevent.
 *
 *   It never reduces a quantity on its own. An over-quantity line is reported,
 *   and `clamp()` fixes it only when the shopper asks.
 */

export type CartIssueCode =
  | "price_changed"
  | "insufficient_stock"
  | "out_of_stock"
  | "unavailable"
  | "max_quantity";

export interface CartIssue {
  code: CartIssueCode;
  /** price_changed */
  was?: string;
  now?: string;
  /** insufficient_stock */
  available?: number;
  /** max_quantity */
  max?: number;
}

export interface CartLine {
  id: number;
  quantity: number;
  /** Resolved server-side, right now — never the stored snapshot. */
  unit_price: string;
  line_total: string;
  base_price: string | null;
  is_discounted: boolean;
  variant: {
    id: number;
    sku: string;
    label: string | null;
    product: {
      id: number;
      name: string;
      slug: string;
      image: string | null;
    } | null;
  } | null;
  /** Attached to the line, so the UI can show the problem where it lives. */
  issues: CartIssue[];
}

export interface CartSummary {
  lines_count: number;
  items_count: number;
  subtotal: string;
  currency: string;
}

export type CouponRejection =
  | "coupon_not_found"
  | "coupon_inactive"
  | "coupon_not_started"
  | "coupon_expired"
  | "coupon_min_order"
  | "coupon_usage_limit"
  | "coupon_per_customer_limit"
  | "coupon_first_order_only";

/**
 * What the shopper is told about their code (Phase 6).
 *
 * `discount` is the server's figure, rendered as given. Note what is NOT here:
 * the usage limit and how many remain. That is a merchant's business, and the
 * API does not publish it.
 */
export interface AppliedCoupon {
  code: string;
  type: "percent" | "fixed" | "free_shipping" | null;
  /** "20% off, up to BDT 500" — composed server-side so every surface agrees. */
  label: string | null;
  discount: string;
  free_shipping: boolean;
  applied: boolean;
  reason: CouponRejection | null;
  /** The sentence to show. Already phrased for a shopper. */
  message: string | null;
}

export interface Cart {
  /** Guest carts only; null once signed in. */
  token: string | null;
  status: "active" | "merged" | "converted" | "abandoned";
  items: CartLine[];
  summary: CartSummary;
  issues: CartIssueCode[];
  /** Null when no code is attached. A REJECTED code still appears here. */
  coupon: AppliedCoupon | null;
  /** The single field checkout gates on. Computed server-side. */
  checkout_ready: boolean;
}

export interface ClampResult extends Cart {
  changes: { variant_id: number; from: number; to: number }[];
}

export interface MergeResult extends Cart {
  merge: { merged: boolean; moved: number; summed: number; clamped: number };
}

/*
 * The guest token lives in localStorage, not a cookie.
 *
 * A cookie would ride along with every asset request and invite CSRF thinking
 * about something that is not a credential — and it would make every storefront
 * page uncacheable. The key is tenant-namespaced so two stores open in one
 * browser cannot see each other's basket.
 */
const TOKEN_KEY = "cart_token";

function tokenKey(): string {
  const host = typeof window === "undefined" ? "" : window.location.host;
  return `${host}:${TOKEN_KEY}`;
}

export function readCartToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(tokenKey());
  } catch {
    // Private mode, or site data blocked. A shopper with no storage still gets
    // a working session-length cart — the token just lives in memory.
    return memoryToken;
  }
}

let memoryToken: string | null = null;

export function writeCartToken(token: string | null): void {
  memoryToken = token;

  if (typeof window === "undefined") return;

  try {
    if (token === null) window.localStorage.removeItem(tokenKey());
    else window.localStorage.setItem(tokenKey(), token);
  } catch {
    // Already held in memoryToken above.
  }
}

/** Attach the guest token, when there is one. */
function headers(): Record<string, string> {
  const token = readCartToken();
  return token ? { "X-Cart-Token": token } : {};
}

/**
 * Every call returns the WHOLE cart, so the client never merges a partial
 * response into its own copy and drifts from the server's view of the money.
 */
async function withToken<T extends Cart>(promise: Promise<T>): Promise<T> {
  const cart = await promise;

  // The server issues a token on the first add. Persisting it here — in one
  // place — is what keeps the basket alive across page loads.
  if (cart.token) writeCartToken(cart.token);

  return cart;
}

export const cartService = {
  get: () => withToken(api.get<Cart>("/cart", { headers: headers() })),

  addItem: (variantId: number, quantity = 1) =>
    withToken(
      api.post<Cart>(
        "/cart/items",
        { variant_id: variantId, quantity },
        { headers: headers() },
      ),
    ),

  updateItem: (itemId: number, quantity: number) =>
    withToken(
      api.patch<Cart>(
        `/cart/items/${itemId}`,
        { quantity },
        { headers: headers() },
      ),
    ),

  removeItem: (itemId: number) =>
    withToken(
      api.delete<Cart>(`/cart/items/${itemId}`, { headers: headers() }),
    ),

  clear: () => withToken(api.delete<Cart>("/cart", { headers: headers() })),

  revalidate: () =>
    withToken(api.post<Cart>("/cart/revalidate", {}, { headers: headers() })),

  acknowledgePrices: () =>
    withToken(
      api.post<Cart>("/cart/acknowledge-prices", {}, { headers: headers() }),
    ),

  clamp: () =>
    withToken(api.post<ClampResult>("/cart/clamp", {}, { headers: headers() })),

  /**
   * Attach a discount code.
   *
   * A code that does not exist throws (422 on `code`). Every other rejection
   * comes back as a normal cart with `coupon.applied: false` and a reason, so
   * the shopper sees their basket next to "add BDT 200 more" rather than an
   * error box where the basket used to be.
   */
  applyCoupon: (code: string) =>
    withToken(api.post<Cart>("/cart/coupon", { code }, { headers: headers() })),

  removeCoupon: () =>
    withToken(api.delete<Cart>("/cart/coupon", { headers: headers() })),

  /**
   * Called right after login. The guest token is consumed by the server and
   * stops resolving, so it is dropped locally too.
   */
  merge: async (): Promise<MergeResult | null> => {
    const token = readCartToken();
    if (!token) return null;

    const result = await api.post<MergeResult>("/cart/merge", { token });

    writeCartToken(null);

    return result;
  },
};
