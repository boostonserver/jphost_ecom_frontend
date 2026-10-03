"use client";

import { useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import {
  shipmentService,
  type CourierCatalogEntry,
} from "@/services/shipments";

/**
 * Which couriers this store can hand parcels to.
 *
 * Mirrors the payment-methods screen deliberately — two integration families
 * that behave the same way are two a merchant only has to learn once. The same
 * rules hold: a saved credential is never shown again, and a courier whose
 * driver is still a stub can be enabled and appears marked "Coming soon" rather
 * than being selectable and failing.
 */
const CREDENTIAL_FIELDS: Record<string, { key: string; label: string }[]> = {
  manual: [],
  pathao: [
    { key: "client_id", label: "Client ID" },
    { key: "client_secret", label: "Client secret" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
    { key: "store_id", label: "Store ID" },
  ],
  steadfast: [
    { key: "api_key", label: "API key" },
    { key: "secret_key", label: "Secret key" },
  ],
  redx: [
    { key: "access_token", label: "Access token" },
    { key: "store_id", label: "Store ID" },
  ],
};

export default function CourierSettingsPage() {
  const { data, isLoading, mutate } = useSWR(
    "/admin/settings/couriers",
    async () => (await shipmentService.couriers()).items,
  );

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Couriers</h1>
        <p className="text-muted-foreground text-sm">
          Credentials are encrypted and belong to this store alone. Saved keys
          are never shown again.
        </p>
      </div>

      {data?.map((courier) => (
        <CourierCard
          key={courier.code}
          courier={courier}
          onSaved={() => void mutate()}
        />
      ))}
    </div>
  );
}

function CourierCard({
  courier,
  onSaved,
}: {
  courier: CourierCatalogEntry;
  onSaved: () => void;
}) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fields = CREDENTIAL_FIELDS[courier.code] ?? [];

  async function save(
    payload: Parameters<typeof shipmentService.updateCourier>[1],
  ) {
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      await shipmentService.updateCourier(courier.code, payload);
      setConfig({});
      setSaved(true);
      onSaved();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.displayMessage : "Could not save.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>{courier.name}</CardTitle>
          <CardDescription>
            {courier.code === "manual"
              ? "Your own delivery, or a courier booked by phone. No credentials needed."
              : courier.implemented
                ? "Live courier integration."
                : "Not built yet. Turn it on to see it in the courier picker as coming soon — it cannot be handed a parcel."}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {courier.is_default && (
            <Badge tone="primary" size="sm">
              Default
            </Badge>
          )}
          {courier.has_credentials && (
            <Badge tone="outline" size="sm">
              Keys saved
            </Badge>
          )}
          {courier.available ? (
            <Badge tone="success" size="sm">
              Active
            </Badge>
          ) : courier.implemented ? (
            <Badge tone="neutral" size="sm">
              Off
            </Badge>
          ) : (
            <Badge tone="warning" size="sm">
              {courier.reason ?? "Coming soon"}
            </Badge>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              name={`${courier.code}-${field.key}`}
              type="password"
              autoComplete="off"
              placeholder={
                courier.has_credentials ? "Saved — leave blank to keep" : ""
              }
              hint={
                courier.has_credentials
                  ? "Leave blank to keep the saved value."
                  : undefined
              }
              value={config[field.key] ?? ""}
              onChange={(e) =>
                setConfig((c) => ({ ...c, [field.key]: e.target.value }))
              }
            />
          ))}
        </div>
      )}

      {error && <FormAlert message={error} />}
      {saved && <p className="text-success text-sm">Saved.</p>}

      <div className="flex flex-wrap items-center gap-2">
        {fields.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy || Object.keys(config).length === 0}
            onClick={() => void save({ config })}
          >
            Save keys
          </Button>
        )}

        <Button
          size="sm"
          variant={courier.is_enabled ? "outline" : "primary"}
          disabled={busy}
          onClick={() => void save({ is_enabled: !courier.is_enabled })}
        >
          {courier.is_enabled ? "Turn off" : "Turn on"}
        </Button>

        {/* Only a courier that can actually carry something may be the one
            chosen automatically. */}
        {courier.available && !courier.is_default && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => void save({ is_default: true })}
          >
            Make default
          </Button>
        )}
      </div>
    </Card>
  );
}
