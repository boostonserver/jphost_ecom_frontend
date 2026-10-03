import { Badge } from "@/components/ui/badge";
import type { ShipmentStatus } from "@/services/shipments";

/**
 * Where a parcel is, in one chip.
 *
 * `failed_delivery` is warning-toned rather than destructive on purpose: a
 * missed doorbell is a normal, retryable event in this market, not a failure
 * anyone needs to panic about. `returned_to_sender` is the one that genuinely
 * needs a human.
 */
const TONE: Record<
  ShipmentStatus,
  "success" | "warning" | "neutral" | "primary"
> = {
  created: "neutral",
  pickup_requested: "warning",
  picked_up: "primary",
  in_transit: "primary",
  out_for_delivery: "primary",
  delivered: "success",
  failed_delivery: "warning",
  returning: "warning",
  returned_to_sender: "neutral",
  cancelled: "neutral",
};

export function ShipmentStatusBadge({
  status,
  label,
  size = "sm",
}: {
  status: ShipmentStatus;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={TONE[status]} size={size}>
      {label}
    </Badge>
  );
}
