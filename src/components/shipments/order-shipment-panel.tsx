"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatMoney } from "@/components/catalog/price";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import {
  shipmentService,
  type Shipment,
  type ShipmentStatus,
} from "@/services/shipments";

/**
 * Hand a packed order to a courier, then walk the parcel along.
 *
 * The status control is populated from the server's transitions endpoint, so it
 * can only ever offer moves the state machine allows - the same discipline the
 * order panel uses, for the same reason.
 *
 * The panel fetches its own shipment rather than taking one as a prop: creating
 * or cancelling one changes the ORDER too, so the two have to refresh together
 * and each owns its own request.
 */
export function OrderShipmentPanel({
  orderNumber,
  orderStatus,
  onOrderChanged,
}: {
  orderNumber: string;
  orderStatus: string;
  onOrderChanged: () => void;
}) {
  const {
    data: shipment,
    isLoading,
    mutate,
  } = useSWR(
    `/admin/orders/${orderNumber}/shipment`,
    async () => shipmentService.forOrder(orderNumber),
    { shouldRetryOnError: false },
  );

  function refresh() {
    void mutate();
    onOrderChanged();
  }

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (shipment) {
    return <ExistingShipment shipment={shipment} onChanged={refresh} />;
  }

  return (
    <CreateShipment
      orderNumber={orderNumber}
      orderStatus={orderStatus}
      onCreated={refresh}
    />
  );
}

function CreateShipment({
  orderNumber,
  orderStatus,
  onCreated,
}: {
  orderNumber: string;
  orderStatus: string;
  onCreated: () => void;
}) {
  const [courierId, setCourierId] = useState<string>("");
  const [tracking, setTracking] = useState("");
  const [consignment, setConsignment] = useState("");
  const [charge, setCharge] = useState("");
  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: couriers } = useSWR(
    "/admin/settings/couriers",
    async () => (await shipmentService.couriers()).items,
  );

  // An order must be packed before a parcel makes sense — earlier and the goods
  // are not ready.
  if (orderStatus !== "packed") {
    return (
      <Card className="space-y-1">
        <CardTitle>Shipment</CardTitle>
        <CardDescription>
          Mark this order as packed to hand it to a courier.
        </CardDescription>
      </Card>
    );
  }

  async function create() {
    setBusy(true);
    setError(null);

    try {
      await shipmentService.create(orderNumber, {
        courier_id: courierId ? Number(courierId) : undefined,
        tracking_number: tracking || undefined,
        consignment_id: consignment || undefined,
        courier_charge: charge || undefined,
        weight_kg: weight || undefined,
      });

      onCreated();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("order") ?? caught.displayMessage)
          : "Could not create the shipment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div>
        <CardTitle>Hand to a courier</CardTitle>
        <CardDescription>This also moves the order to shipped.</CardDescription>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="courier" className="text-sm font-medium">
          Courier
        </label>
        <Select
          id="courier"
          value={courierId}
          onChange={(e) => setCourierId(e.target.value)}
        >
          <option value="">Default courier</option>
          {couriers
            ?.filter((c) => c.is_enabled)
            .map((c) => (
              // Unimplemented couriers are shown and disabled, never hidden -
              // a merchant preparing to launch should see them listed.
              <option key={c.code} value={c.id} disabled={!c.available}>
                {c.name}
                {c.available ? "" : ` (${c.reason ?? "coming soon"})`}
              </option>
            ))}
        </Select>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field
          label="Tracking number"
          name="tracking_number"
          hint="Optional — whatever the courier gave you."
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
        <Field
          label="Consignment ID"
          name="consignment_id"
          value={consignment}
          onChange={(e) => setConsignment(e.target.value)}
        />
        <Field
          label="Courier charge"
          name="courier_charge"
          hint="What they bill you — separate from what the customer paid."
          value={charge}
          onChange={(e) => setCharge(e.target.value)}
        />
        <Field
          label="Weight (kg)"
          name="weight_kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

      {error && <FormAlert message={error} />}

      <Button size="sm" disabled={busy} onClick={() => void create()}>
        {busy ? "Creating…" : "Create shipment"}
      </Button>
    </Card>
  );
}

function ExistingShipment({
  shipment,
  onChanged,
}: {
  shipment: Shipment;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const { data: transitions, mutate: refreshTransitions } = useSWR(
    shipment.id ? `/admin/shipments/${shipment.id}/transitions` : null,
    async () => shipmentService.transitions(shipment.id as number),
  );

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);

    try {
      await action();
      await refreshTransitions();
      onChanged();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.displayMessage
          : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>Shipment</CardTitle>
          <CardDescription>
            {shipment.courier?.name}
            {shipment.tracking_number ? ` · ${shipment.tracking_number}` : ""}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ShipmentStatusBadge
            status={shipment.status}
            label={shipment.status_label}
          />
          {shipment.unmapped_status && (
            <Badge tone="warning" size="sm">
              Unrecognised: {shipment.courier_status_raw}
            </Badge>
          )}
        </div>
      </div>

      <dl className="space-y-1.5 text-sm">
        {shipment.is_cod && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Rider collects</dt>
            <dd className="font-medium tabular-nums">
              {formatMoney(shipment.cod_amount ?? "0.00", "BDT")}
            </dd>
          </div>
        )}
        {shipment.courier_charge && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Courier charge</dt>
            <dd className="tabular-nums">
              {formatMoney(shipment.courier_charge, "BDT")}
            </dd>
          </div>
        )}
        {shipment.delivery_margin && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery margin</dt>
            <dd
              className={
                shipment.delivery_margin.startsWith("-")
                  ? "text-destructive tabular-nums"
                  : "text-success tabular-nums"
              }
            >
              {formatMoney(shipment.delivery_margin.replace("-", ""), "BDT")}
              {shipment.delivery_margin.startsWith("-") ? " loss" : ""}
            </dd>
          </div>
        )}
      </dl>

      {error && <FormAlert message={error} />}

      <div className="flex flex-wrap gap-2">
        {transitions?.allowed
          .filter((o) => o.value !== "cancelled")
          .map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  shipmentService.updateStatus(
                    shipment.id as number,
                    option.value as ShipmentStatus,
                  ),
                )
              }
            >
              {option.label}
            </Button>
          ))}
      </div>

      {transitions?.allowed.some((o) => o.value === "cancelled") && (
        <div className="border-border space-y-2 border-t pt-3">
          {!cancelling ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCancelling(true)}
            >
              Cancel shipment
            </Button>
          ) : (
            <>
              <p className="text-muted-foreground text-xs">
                The order goes back to packed. Once a courier has the parcel
                this is no longer possible.
              </p>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy || reason.trim() === ""}
                  onClick={() =>
                    void run(async () => {
                      await shipmentService.cancel(
                        shipment.id as number,
                        reason,
                      );
                      setCancelling(false);
                      setReason("");
                    })
                  }
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCancelling(false)}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
