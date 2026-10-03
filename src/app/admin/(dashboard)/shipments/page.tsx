"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { formatMoney } from "@/components/catalog/price";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { shipmentService, type ShipmentStatus } from "@/services/shipments";

/**
 * The dispatch desk.
 *
 * A queue like the order desk: parcels awaiting pickup first, oldest at the
 * top, with AGE emphasised — a consignment sitting unpicked for two days is the
 * thing this screen exists to surface.
 */
const FILTERS: { value: ShipmentStatus | ""; label: string }[] = [
  { value: "", label: "Awaiting pickup" },
  { value: "picked_up", label: "Picked up" },
  { value: "in_transit", label: "In transit" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "failed_delivery", label: "Attempt failed" },
  { value: "delivered", label: "Delivered" },
  { value: "returned_to_sender", label: "Returned" },
];

export default function AdminShipmentsPage() {
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [term, setTerm] = useState("");

  const { data, isLoading, error } = useSWR(
    ["/admin/shipments", status, term],
    async () =>
      (
        await shipmentService.list({
          status: status || undefined,
          q: term || undefined,
          per_page: 100,
        })
      ).items,
    { shouldRetryOnError: false },
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Shipments</h1>
        <p className="text-muted-foreground text-sm">
          Every courier&rsquo;s statuses are translated into the same set, so a
          parcel reads the same here whoever is carrying it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              status === filter.value
                ? "bg-accent font-medium"
                : "text-muted-foreground",
            )}
          >
            {filter.label}
          </button>
        ))}

        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Order number or tracking"
          aria-label="Search shipments"
          className="border-input bg-background ml-auto h-9 w-72 rounded-md border px-3 text-sm"
        />
      </div>

      {error && <FormAlert message={(error as Error).message} />}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Courier</th>
                <th className="px-4 py-2 font-medium">Tracking</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">To collect</th>
                <th className="px-4 py-2 text-right font-medium">Age</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    Loading shipments&hellip;
                  </td>
                </tr>
              )}

              {!isLoading && data?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    Nothing waiting. Create a shipment from a packed order.
                  </td>
                </tr>
              )}

              {data?.map((shipment) => (
                <tr key={shipment.id} className="border-t">
                  <td className="px-4 py-2">
                    {shipment.order && (
                      <Link
                        href={`/admin/orders/${shipment.order.number}`}
                        className="font-mono text-xs underline"
                      >
                        {shipment.order.number}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-2">{shipment.courier?.name ?? "—"}</td>
                  <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                    {shipment.tracking_number ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ShipmentStatusBadge
                        status={shipment.status}
                        label={shipment.status_label}
                      />
                      {/* A courier said something nobody mapped. Surfaced so
                          it becomes a to-do rather than a silent guess. */}
                      {shipment.unmapped_status && (
                        <Badge tone="warning" size="sm">
                          Unrecognised status
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {shipment.is_cod && shipment.cod_amount
                      ? formatMoney(shipment.cod_amount, "BDT")
                      : "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-2 text-right text-xs">
                    {shipment.created_at ? ageOf(shipment.created_at) : "—"}
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

/** How long this parcel has been waiting — what the queue is really about. */
function ageOf(createdAt: string): string {
  const hours = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 3_600_000,
  );

  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}
