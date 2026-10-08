"use client";

import { Banknote, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { CheckoutTotals } from "@/components/checkout/checkout-totals";
import { refreshCart, useCart } from "@/components/cart/use-cart";
import { formatMoney } from "@/components/catalog/price";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  checkoutService,
  type AddressInput,
  type CheckoutPayload,
  type CheckoutQuote,
} from "@/services/checkout";
import { addressService } from "@/services/customer";
import type { Address } from "@/types/customer";

/**
 * One page, three sections - not a wizard with URLs.
 *
 * A URL per step invites deep links into a half-built checkout and doubles the
 * state-restoration work. Keeping it on one page also keeps the re-quote loop
 * local: changing an address or a method re-quotes in place.
 *
 * The totals panel renders `data.lines` AS GIVEN. It never adds, re-labels or
 * hides a zero line it thinks is uninteresting - that is the structural
 * guarantee that the figure on screen is the figure the server computed
 * (engineering rule 2).
 */
export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();

  const [address, setAddress] = useState<AddressInput>({});
  const [savedAddressId, setSavedAddressId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("standard");
  const [payment, setPayment] = useState("cod");

  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<string | null>(null);

  const { data: districts } = useSWR(
    "/districts",
    async () => (await addressService.districts()).items,
  );

  const { data: savedAddresses } = useSWR(
    user ? "/me/addresses" : null,
    async () => (await addressService.list()).items,
  );

  const payload = useMemo<CheckoutPayload>(
    () => ({
      shipping_address:
        savedAddressId !== null ? { address_id: savedAddressId } : address,
      billing_address: { same_as_shipping: true },
      shipping_method: method,
      email: user ? undefined : email || undefined,
      notes: notes || undefined,
    }),
    [savedAddressId, address, method, email, notes, user],
  );

  /*
   * The method actually used, derived rather than synced.
   *
   * A merchant can turn a gateway off between the page loading and the order
   * being placed, and a stubbed one is never selectable at all - so rather
   * than writing corrections back into state from an effect (which cascades a
   * render), the chosen code simply falls through to the first usable method
   * whenever it is not one.
   */
  const usablePayments =
    quote?.payment_methods.filter((m) => m.available) ?? [];
  const effectivePayment =
    usablePayments.some((m) => m.code === payment) ||
    usablePayments.length === 0
      ? payment
      : usablePayments[0].code;

  const addressComplete =
    savedAddressId !== null ||
    Boolean(
      address.recipient_name &&
      address.phone &&
      address.district &&
      address.area &&
      address.address_line,
    );

  /*
   * Re-quote whenever anything that affects the price changes.
   *
   * Debounced, and the panel keeps its previous figures while a new quote is in
   * flight - jumping to zero and back on every keystroke reads as a broken
   * page.
   */
  const requote = useCallback(async () => {
    if (!cart || cart.items.length === 0) return;

    setQuoting(true);
    setError(null);

    try {
      setQuote(await checkoutService.quote(payload));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status !== 422) {
        setError(caught.displayMessage);
      }
    } finally {
      setQuoting(false);
    }
  }, [cart, payload]);

  useEffect(() => {
    const timer = window.setTimeout(() => void requote(), 300);
    return () => window.clearTimeout(timer);
  }, [requote]);

  async function place() {
    if (!quote) return;

    setPlacing(true);
    setError(null);
    setMismatch(null);

    try {
      const placed = await checkoutService.place({
        ...payload,
        payment_method: effectivePayment,
        // A CHECK, never an input: the server compares it and re-computes the
        // real figure regardless.
        expected_total: quote.grand_total,
      });

      await refreshCart();

      router.push(`/checkout/success?order=${placed.order.number}`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "total_mismatch") {
        // Re-quote in place and show what changed, rather than failing
        // outright - the shopper can accept the new figure in one click.
        const data = caught.data as { expected: string; actual: string };
        setMismatch(data.actual);
        await requote();
      } else if (
        caught instanceof ApiError &&
        caught.code === "insufficient_stock"
      ) {
        setError("Some items sold out while you were checking out.");
        await refreshCart();
      } else {
        setError(
          caught instanceof ApiError
            ? caught.displayMessage
            : "Could not place your order.",
        );
      }
    } finally {
      setPlacing(false);
    }
  }

  if (cartLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="mt-6 space-y-3 text-center">
        <p>Your bag is empty, so there is nothing to check out.</p>
        <ButtonLink href="/products">Browse the shop</ButtonLink>
      </Card>
    );
  }

  const currency = cart.summary.currency;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-6">
        {/* 1 — Delivery */}
        <Card className="space-y-4">
          <CardTitle>Delivery address</CardTitle>

          {user && savedAddresses && savedAddresses.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {savedAddresses.map((saved: Address) => (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => setSavedAddressId(saved.id)}
                  className={`rounded-lg border p-3 text-left text-sm ${
                    savedAddressId === saved.id
                      ? "border-primary bg-primary-soft"
                      : "border-border"
                  }`}
                >
                  <span className="font-medium">{saved.recipient_name}</span>
                  <span className="text-muted-foreground block text-xs">
                    {saved.address_line}, {saved.area}, {saved.district}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSavedAddressId(null)}
                className={`rounded-lg border border-dashed p-3 text-left text-sm ${
                  savedAddressId === null ? "border-primary" : "border-border"
                }`}
              >
                Use a different address
              </button>
            </div>
          )}

          {savedAddressId === null && (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="recipient_name"
                required
                value={address.recipient_name ?? ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, recipient_name: e.target.value }))
                }
              />
              <Field
                label="Phone"
                name="phone"
                required
                inputMode="tel"
                hint="The courier will call this number."
                value={address.phone ?? ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, phone: e.target.value }))
                }
              />

              {/* The shared Select, not a hand-rolled box: it carries the
                  same height and border treatment as Input, which is what
                  makes this cell line up with the one beside it. */}
              <div className="space-y-1.5">
                <label
                  htmlFor="district"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  District
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </label>
                <Select
                  id="district"
                  value={address.district ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, district: e.target.value }))
                  }
                >
                  <option value="">Choose a district…</option>
                  {districts?.map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              <Field
                label="Area"
                name="area"
                required
                hint="Thana, upazila or neighbourhood"
                value={address.area ?? ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, area: e.target.value }))
                }
              />

              <Field
                label="Address"
                name="address_line"
                required
                wrapperClassName="sm:col-span-2"
                value={address.address_line ?? ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, address_line: e.target.value }))
                }
              />

              <Field
                label="Postcode"
                name="postal_code"
                value={address.postal_code ?? ""}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, postal_code: e.target.value }))
                }
              />
            </div>
          )}

          {!user && (
            <Field
              label="Email"
              name="email"
              type="email"
              required
              hint="We will send your order confirmation here."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Card>

        {/* 2 — Delivery method and payment */}
        <Card className="space-y-4">
          <CardTitle>Delivery &amp; payment</CardTitle>

          {/*
            A radio group of one is not a choice, and rendering it as one reads
            as "we have pre-selected this for you" - which invites the shopper
            to look for the alternatives and find none. With a single option
            each, both of these state what will happen instead of pretending to
            ask. The chooser reappears by itself the moment a second option
            exists, which is what Phase 14 and a live gateway will add.
          */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Delivery</p>

            {(quote?.shipping_methods.length ?? 0) > 1 ? (
              quote?.shipping_methods.map((option) => (
                <label
                  key={option.code}
                  className="border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={method === option.code}
                    onChange={() => setMethod(option.code)}
                  />
                  <span className="flex-1">{option.label}</span>
                  <span className="tabular-nums">
                    {formatMoney(option.amount, currency)}
                  </span>
                </label>
              ))
            ) : quote?.shipping_methods[0] ? (
              <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
                <Truck className="text-muted-foreground size-4" aria-hidden />
                <span className="flex-1">
                  {quote.shipping_methods[0].label}
                </span>
                <span className="tabular-nums">
                  {formatMoney(quote.shipping_methods[0].amount, currency)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Payment</p>

            {(quote?.payment_methods.length ?? 0) > 1 ? (
              quote?.payment_methods.map((option) => (
                <label
                  key={option.code}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 text-sm",
                    option.available
                      ? "border-border cursor-pointer"
                      : // Shown, clearly marked, unselectable. A store can
                        // announce online payment before it works without any
                        // shopper reaching a button that fails.
                        "border-border/60 cursor-not-allowed opacity-60",
                    effectivePayment === option.code &&
                      option.available &&
                      "border-primary bg-primary-soft",
                  )}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={effectivePayment === option.code}
                    disabled={!option.available}
                    onChange={() => setPayment(option.code)}
                  />
                  <span className="flex-1">{option.label}</span>

                  {option.available ? (
                    option.code === "cod" ? (
                      <span className="text-muted-foreground text-xs">
                        Cash on delivery — pay the courier on arrival
                      </span>
                    ) : option.code === "bkash" ? (
                      <span className="text-pink-600 font-medium text-xs">
                        bKash payment
                      </span>
                    ) : option.code === "nagad" ? (
                      <span className="text-orange-600 font-medium text-xs">
                        Nagad payment
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Pay online
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {option.reason ?? "Unavailable"}
                    </span>
                  )}
                </label>
              ))
            ) : quote?.payment_methods[0] ? (
              <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3 text-sm">
                <Banknote
                  className="text-muted-foreground size-4"
                  aria-hidden
                />
                <span className="flex-1">{quote.payment_methods[0].label}</span>
                <span className="text-muted-foreground text-xs">
                  Pay the courier when your order arrives
                </span>
              </div>
            ) : null}
          </div>

          <Field
            label="Order notes"
            name="notes"
            hint="Optional — a landmark, or a time that suits you."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>
      </div>

      {/* 3 — Review */}
      <Card className="space-y-4 lg:sticky lg:top-24">
        <CardTitle>Your order</CardTitle>

        <ul className="divide-border divide-y text-sm">
          {cart.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="line-clamp-2-safe">
                  {line.variant?.product?.name}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {line.variant?.label ? `${line.variant.label} · ` : ""}
                  Qty {line.quantity}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">
                {formatMoney(line.line_total, currency)}
              </span>
            </li>
          ))}
        </ul>

        <CheckoutTotals quote={quote} currency={currency} pending={quoting} />

        {mismatch && (
          <div className="bg-warning-soft text-warning-foreground rounded-lg p-3 text-sm">
            The total changed to {formatMoney(mismatch, currency)} while you
            were checking out. Review it above and place your order again.
          </div>
        )}

        {error && <FormAlert message={error} />}

        <Button
          size="lg"
          className="w-full"
          disabled={
            placing ||
            quoting ||
            !addressComplete ||
            !quote?.checkout_ready ||
            (!user && !email)
          }
          onClick={() => void place()}
        >
          {placing ? "Placing your order…" : "Place order"}
        </Button>

        {!addressComplete && (
          <p className="text-muted-foreground text-center text-xs">
            Fill in your delivery address to continue.
          </p>
        )}

        {addressComplete && quote && !quote.checkout_ready && (
          <p className="text-muted-foreground text-center text-xs">
            Your bag needs attention before you can check out.{" "}
            <a href="/cart" className="underline">
              Review it
            </a>
          </p>
        )}
      </Card>
    </div>
  );
}
