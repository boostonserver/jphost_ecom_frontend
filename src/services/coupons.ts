import { api } from "@/lib/api";
import type { Paginated } from "@/types/auth";

/*
 * Coupons, for staff (Phase 6).
 *
 * Everything here is a merchant's view. What a SHOPPER is told about a code is
 * a different, much smaller shape - `AppliedCoupon` in the cart service - and
 * the two are deliberately separate types rather than one with optional
 * fields, so "3 uses left" can never be one boolean away from a storefront
 * response.
 */

export type CouponType = "percent" | "fixed" | "free_shipping";

export interface Coupon {
  id: number;
  code: string;
  description: string | null;

  type: CouponType;
  type_label: string;
  /** Read as a percentage or an amount, depending on `type`. */
  value: string;
  min_order: string;
  /** Percentage coupons only. */
  max_discount: string | null;

  /** Null means unlimited on both. */
  usage_limit: number | null;
  per_customer_limit: number | null;
  first_order_only: boolean;

  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  /** Active AND inside its window right now — saves comparing dates by eye. */
  is_live: boolean;

  created_at: string | null;

  /** Present on the list and the detail view; absent on a freshly created one. */
  used?: number;
  total_discount?: string;
  remaining?: number | null;
}

export interface CouponUsage {
  id: number;
  order_number: string | null;
  customer: string | null;
  email: string;
  amount: string;
  status: "consumed" | "rolled_back";
  status_label: string;
  released_at: string | null;
  at: string | null;
}

export interface CouponInput {
  code: string;
  description?: string | null;
  type: CouponType;
  value: string;
  min_order?: string;
  max_discount?: string | null;
  usage_limit?: number | null;
  per_customer_limit?: number | null;
  first_order_only?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }

  return search.toString();
}

export const couponService = {
  list: (params: { q?: string; is_active?: string; per_page?: number } = {}) =>
    api.get<Paginated<Coupon>>(`/admin/coupons?${query(params)}`),

  show: (id: number) => api.get<Coupon>(`/admin/coupons/${id}`),

  create: (payload: CouponInput) => api.post<Coupon>("/admin/coupons", payload),

  update: (id: number, payload: Partial<CouponInput>) =>
    api.patch<Coupon>(`/admin/coupons/${id}`, payload),

  /** Refused once the code has been redeemed — deactivate instead. */
  remove: (id: number) => api.delete<null>(`/admin/coupons/${id}`),

  usages: (id: number) =>
    api.get<Paginated<CouponUsage>>(`/admin/coupons/${id}/usages`),
};
