"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatMoney } from "@/components/catalog/price";
import { CouponForm } from "@/components/coupons/coupon-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { couponService, type Coupon } from "@/services/coupons";

/**
 * Discount codes.
 *
 * The columns are the questions a merchant actually asks about a coupon: what
 * it does, whether it is working right now, how much of it is left, and what it
 * has cost. A list that showed only the definition would need a second screen
 * to answer any of those.
 */
export default function AdminCouponsPage() {
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR(
    "/admin/coupons",
    async () => (await couponService.list({ per_page: 100 })).items,
    { shouldRetryOnError: false },
  );

  async function remove(coupon: Coupon) {
    setError(null);

    try {
      await couponService.remove(coupon.id);
      await mutate();
    } catch (caught) {
      // Refused once redeemed. The message says to deactivate instead, which
      // is what the merchant wanted anyway.
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("coupon") ?? caught.displayMessage)
          : "Could not delete that coupon.",
      );
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm">
            Codes are matched however they are typed, so a customer reading one
            off a flyer never gets it wrong.
          </p>
        </div>

        <Button size="sm" onClick={() => setCreating(true)}>
          New coupon
        </Button>
      </div>

      {error && <FormAlert message={error} />}

      {(creating || editing) && (
        <CouponForm
          coupon={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
            void mutate();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Discount</th>
                <th className="px-4 py-2 font-medium">Window</th>
                <th className="px-4 py-2 text-right font-medium">Used</th>
                <th className="px-4 py-2 text-right font-medium">Cost</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    No codes yet.
                  </td>
                </tr>
              )}

              {data?.map((coupon) => (
                <tr key={coupon.id} className="border-t align-top">
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-semibold">
                        {coupon.code}
                      </span>
                      {/* is_live, not is_active: a switched-on code whose
                          window has closed is not working, and that is the
                          thing a merchant is trying to find out. */}
                      {coupon.is_live ? (
                        <Badge tone="success" size="sm">
                          Live
                        </Badge>
                      ) : (
                        <Badge tone="neutral" size="sm">
                          {coupon.is_active ? "Out of window" : "Off"}
                        </Badge>
                      )}
                      {coupon.first_order_only && (
                        <Badge tone="outline" size="sm">
                          First order
                        </Badge>
                      )}
                    </div>
                    {coupon.description && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {coupon.description}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    {describe(coupon)}
                    {coupon.min_order !== "0.00" && (
                      <p className="text-muted-foreground text-xs">
                        On orders over {formatMoney(coupon.min_order, "BDT")}
                      </p>
                    )}
                  </td>

                  <td className="text-muted-foreground px-4 py-2 text-xs">
                    {windowOf(coupon)}
                  </td>

                  <td className="px-4 py-2 text-right tabular-nums">
                    {coupon.used ?? 0}
                    {coupon.usage_limit !== null && (
                      <span className="text-muted-foreground">
                        {" / "}
                        {coupon.usage_limit}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2 text-right tabular-nums">
                    {formatMoney(coupon.total_discount ?? "0.00", "BDT")}
                  </td>

                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(coupon)}
                      className="text-xs underline"
                    >
                      Edit
                    </button>
                    {(coupon.used ?? 0) === 0 && (
                      <button
                        onClick={() => void remove(coupon)}
                        className="text-destructive ml-3 text-xs underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/** The same sentence the storefront shows, composed from the same fields. */
function describe(coupon: Coupon): string {
  if (coupon.type === "free_shipping") return "Free delivery";

  if (coupon.type === "fixed") {
    return `${formatMoney(coupon.value, "BDT")} off`;
  }

  const percent = coupon.value.replace(/\.?0+$/, "");

  return coupon.max_discount === null
    ? `${percent}% off`
    : `${percent}% off, up to ${formatMoney(coupon.max_discount, "BDT")}`;
}

function windowOf(coupon: Coupon): string {
  const from = coupon.starts_at
    ? new Date(coupon.starts_at).toLocaleDateString()
    : null;
  const to = coupon.expires_at
    ? new Date(coupon.expires_at).toLocaleDateString()
    : null;

  if (!from && !to) return "Always";
  if (from && to) return `${from} – ${to}`;

  return from ? `From ${from}` : `Until ${to}`;
}
