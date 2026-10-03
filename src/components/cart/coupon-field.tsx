"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cartService, type AppliedCoupon } from "@/services/cart";
import { refreshCart } from "@/components/cart/use-cart";

/**
 * Where a shopper types a discount code.
 *
 * Two states, and the second is the one worth getting right. An APPLIED code
 * becomes a chip with what it saved beside it, because the saving is the thing
 * being confirmed. A REJECTED code stays in the input with the server's own
 * sentence under it — "add BDT 200 more to use this code", never "invalid
 * coupon" — since a shopper told what to do next will often do it.
 *
 * The field computes nothing. The saving shown here is the server's figure
 * (engineering rule 2); the browser's only contribution is the code.
 */
export function CouponField({
  coupon,
  currency,
}: {
  coupon: AppliedCoupon | null;
  currency: string;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(event: React.FormEvent) {
    event.preventDefault();

    if (code.trim() === "") return;

    setBusy(true);
    setError(null);

    try {
      await refreshCart(await cartService.applyCoupon(code.trim()));
      setCode("");
    } catch (caught) {
      // Only a code that does not exist throws; everything else comes back as
      // a cart carrying its own reason, which renders below.
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("code") ?? caught.displayMessage)
          : "Could not apply that code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);

    try {
      await refreshCart(await cartService.removeCoupon());
    } finally {
      setBusy(false);
    }
  }

  if (coupon?.applied) {
    return (
      <div className="border-border space-y-2 border-t pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold">{coupon.code}</p>
            {coupon.label && (
              <p className="text-muted-foreground text-xs">{coupon.label}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            className="text-muted-foreground shrink-0 text-xs underline"
          >
            Remove
          </button>
        </div>

        {/* A free-delivery code takes nothing off the goods, so saying
            "− BDT 0.00" would read as a coupon that did nothing. */}
        <p className="text-success text-sm font-medium">
          {coupon.free_shipping
            ? "Delivery is free on this order."
            : `You save ${currency} ${coupon.discount}`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="border-border space-y-2 border-t pt-3">
      <label htmlFor="coupon-code" className="text-sm font-medium">
        Discount code
      </label>

      <div className="flex gap-2">
        <input
          id="coupon-code"
          name="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          autoComplete="off"
          // Codes are stored and compared upper-cased, so showing them that way
          // means what the shopper types matches what they read off the flyer.
          className="border-input bg-background h-10 min-w-0 flex-1 rounded-md border px-3 text-sm uppercase"
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={busy || code.trim() === ""}
        >
          {busy ? "…" : "Apply"}
        </Button>
      </div>

      {/* The server's sentence, not ours. It knows the shortfall. */}
      {(error ?? coupon?.message) && (
        <p className="text-destructive text-xs">{error ?? coupon?.message}</p>
      )}
    </form>
  );
}
