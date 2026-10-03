import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import type { Shipment } from "@/services/shipments";

/**
 * Where the parcel is, for the person waiting on it.
 *
 * Every milestone here is the NORMALIZED status, so the same journey reads the
 * same whichever courier is carrying it — the point of the anti-corruption
 * layer, made visible.
 *
 * A failed delivery attempt is shown rather than hidden: someone who was out
 * when the rider called deserves to know that is why nothing arrived, and
 * hiding it only produces a support message asking the same question.
 */
export function TrackingTimeline({ shipment }: { shipment: Shipment | null }) {
  if (!shipment) return null;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <CardTitle>Delivery</CardTitle>
        <ShipmentStatusBadge
          status={shipment.status}
          label={shipment.status_label}
        />
      </div>

      <dl className="space-y-1 text-sm">
        {shipment.courier && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Courier</dt>
            <dd className="font-medium">{shipment.courier.name}</dd>
          </div>
        )}
        {shipment.tracking_number && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Tracking number</dt>
            {/* Selectable: this gets copied into the courier's own site. */}
            <dd className="font-mono text-xs break-all select-all">
              {shipment.tracking_number}
            </dd>
          </div>
        )}
      </dl>

      {shipment.milestones.length > 0 && (
        <ol className="border-border space-y-0 border-t pt-3">
          {shipment.milestones.map((step, index) => {
            const last = index === shipment.milestones.length - 1;

            return (
              <li key={`${step.status}-${step.at}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden
                    className={
                      last
                        ? "bg-primary size-3 rounded-full ring-4 ring-[var(--primary-soft)]"
                        : "bg-success size-3 rounded-full"
                    }
                  />
                  {!last && <span className="bg-border w-px flex-1" />}
                </div>

                <div className={last ? "pb-0" : "pb-5"}>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(step.at).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
