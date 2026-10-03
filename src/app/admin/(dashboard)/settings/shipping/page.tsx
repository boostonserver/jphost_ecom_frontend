"use client";

import { useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { addressService } from "@/services/customer";
import { shippingService, type ShippingZone } from "@/services/shipping";

/**
 * What delivery costs, by district.
 *
 * Two zones out of the box — 60 inside Dhaka, 120 everywhere else — because
 * that is what a Bangladeshi store actually charges. A merchant edits the
 * figures and moves districts between zones; creating and deleting zones is
 * deliberately not here, since an editor that can delete the fallback can leave
 * orders unpriceable.
 */
export default function ShippingSettingsPage() {
  const { data, isLoading, mutate } = useSWR(
    "/admin/settings/shipping",
    async () => (await shippingService.zones()).zones,
  );

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Delivery charges</h1>
        <p className="text-muted-foreground text-sm">
          Charged by the district a parcel is going to. Anything not listed in a
          zone falls to the default one, so no address can ever be unpriceable.
        </p>
      </div>

      {data?.map((zone) => (
        <ZoneCard key={zone.id} zone={zone} onSaved={() => void mutate()} />
      ))}
    </div>
  );
}

function ZoneCard({
  zone,
  onSaved,
}: {
  zone: ShippingZone;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const rate = zone.rates[0];
  const [baseRate, setBaseRate] = useState(rate?.base_rate ?? "0.00");
  const [threshold, setThreshold] = useState(rate?.free_threshold ?? "");

  const { data: districts } = useSWR(
    "/districts",
    async () => (await addressService.districts()).items,
  );

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      await action();
      setSaved(true);
      onSaved();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("base_rate") ??
              caught.fieldError("free_threshold") ??
              caught.displayMessage)
          : "Could not save.",
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleDistrict(district: string) {
    const next = zone.districts.includes(district)
      ? zone.districts.filter((d) => d !== district)
      : [...zone.districts, district];

    void run(() => shippingService.updateZone(zone.id, { districts: next }));
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>{zone.name}</CardTitle>
          <CardDescription>
            {zone.is_default
              ? "Every district not claimed by another zone."
              : `${zone.districts.length} district${zone.districts.length === 1 ? "" : "s"}`}
          </CardDescription>
        </div>

        {zone.is_default && (
          <Badge tone="outline" size="sm">
            Fallback
          </Badge>
        )}
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field
          label="Delivery charge"
          name={`rate-${zone.id}`}
          hint="Exact amount, e.g. 60.00"
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
        />

        <Field
          label="Free delivery above"
          name={`threshold-${zone.id}`}
          hint="Leave blank to always charge."
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>

      {error && <FormAlert message={error} />}
      {saved && <p className="text-success text-sm">Saved.</p>}

      <Button
        size="sm"
        variant="secondary"
        disabled={busy || !rate}
        onClick={() =>
          void run(() =>
            shippingService.updateRate(rate.id, {
              base_rate: baseRate,
              free_threshold: threshold.trim() === "" ? null : threshold,
            }),
          )
        }
      >
        {busy ? "Saving…" : "Save charge"}
      </Button>

      {/* The fallback has no district list by design — it is defined by what it
          catches, and listing districts on it would narrow the net. */}
      {!zone.is_default && (
        <div className="border-border space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Districts in this zone</p>
          <div className="flex flex-wrap gap-1.5">
            {districts?.map((district: string) => {
              const selected = zone.districts.includes(district);

              return (
                <button
                  key={district}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleDistrict(district)}
                  className={
                    selected
                      ? "border-primary bg-primary-soft text-primary-soft-foreground rounded-full border px-2.5 py-1 text-xs font-medium"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50 rounded-full border px-2.5 py-1 text-xs"
                  }
                >
                  {district}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
