"use client";

import { formatMoney } from "@/components/catalog/price";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CheckoutQuote } from "@/services/checkout";

/**
 * The server's totals, rendered as given.
 *
 * This component deliberately contains NO arithmetic. It does not sum the
 * lines, does not derive the grand total and does not hide a zero line it
 * thinks is uninteresting - a client that reconstructs totals is a client that
 * can disagree with the server about what someone is being charged
 * (engineering rule 2).
 *
 * The zero promotion, coupon and tax lines are shown because they are real
 * information: a merchant looking at their own checkout can see that tax is
 * switched off rather than having to infer it from an absence.
 */
export function CheckoutTotals({
  quote,
  currency,
  pending = false,
}: {
  quote: CheckoutQuote | null;
  currency: string;
  pending?: boolean;
}) {
  if (!quote) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    // Dimmed rather than replaced while re-quoting: the panel jumping to a
    // skeleton on every keystroke reads as a broken page.
    <dl className={cn("space-y-2 text-sm", pending && "opacity-60")}>
      {quote.lines.map((line) => {
        // A charge the server zeroed and explained - a free-delivery threshold
        // or a free-shipping coupon. Shown as a caption rather than a negative
        // line, which is how the server models it too.
        const waiver = line.breakdown?.find(
          (part) => part.code === "coupon_waiver",
        );

        return (
          <div key={line.code}>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{line.label}</dt>
              <dd className="tabular-nums">
                {line.sign === "-" && line.amount !== "0.00" ? "− " : ""}
                {formatMoney(line.amount, currency)}
              </dd>
            </div>

            {waiver && (
              <p className="text-success text-xs">
                {waiver.label} — saved {formatMoney(waiver.amount, currency)}
              </p>
            )}
          </div>
        );
      })}

      <div className="border-border flex justify-between border-t pt-2 font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">
          {formatMoney(quote.grand_total, currency)}
        </dd>
      </div>

      {/* A code that stopped applying between the bag and here. Not blocking -
          the order is perfectly placeable at full price - but the shopper has
          to be told, because the number they remember has changed. */}
      {quote.coupon && !quote.coupon.applied && (
        <p className="text-destructive border-border border-t pt-2 text-xs">
          {quote.coupon.code}: {quote.coupon.message}
        </p>
      )}
    </dl>
  );
}
