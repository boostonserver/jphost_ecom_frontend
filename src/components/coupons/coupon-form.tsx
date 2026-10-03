"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Checkbox, Select } from "@/components/ui/input";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import {
  couponService,
  type Coupon,
  type CouponInput,
  type CouponType,
} from "@/services/coupons";

/**
 * Create or edit one code.
 *
 * The fields change with the type, and that is the point: `max_discount` only
 * means something on a percentage coupon, and a field that does nothing is a
 * field somebody will eventually fill in and then wonder why it had no effect.
 * The server refuses the combination too — this just stops the merchant
 * reaching it.
 */
const TYPES: { value: CouponType; label: string; hint: string }[] = [
  { value: "percent", label: "Percentage off", hint: "e.g. 20 for 20% off" },
  { value: "fixed", label: "Fixed amount off", hint: "Taken off the goods" },
  {
    value: "free_shipping",
    label: "Free delivery",
    hint: "Zeroes the delivery charge; the goods are not discounted",
  },
];

/** The inputs this form owns, for mapping the API's field errors back. */
const FIELDS = [
  "code",
  "description",
  "type",
  "value",
  "min_order",
  "max_discount",
  "usage_limit",
  "per_customer_limit",
  "starts_at",
  "expires_at",
] as const;

export function CouponForm({
  coupon,
  onDone,
  onCancel,
}: {
  coupon: Coupon | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CouponInput>({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "percent",
    value: coupon?.value ?? "",
    min_order: coupon?.min_order ?? "0.00",
    max_discount: coupon?.max_discount ?? "",
    usage_limit: coupon?.usage_limit ?? null,
    per_customer_limit: coupon?.per_customer_limit ?? null,
    first_order_only: coupon?.first_order_only ?? false,
    starts_at: toLocalInput(coupon?.starts_at),
    expires_at: toLocalInput(coupon?.expires_at),
    is_active: coupon?.is_active ?? true,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const type = TYPES.find((t) => t.value === form.type);
  const redeemed = (coupon?.used ?? 0) > 0;

  function set<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    // Empty strings are how a cleared optional field arrives from an input;
    // the API wants null for "no limit", not "".
    const payload: CouponInput = {
      ...form,
      description: form.description || null,
      max_discount: form.type === "percent" ? form.max_discount || null : null,
      min_order: form.min_order || "0.00",
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      usage_limit: form.usage_limit || null,
      per_customer_limit: form.per_customer_limit || null,
    };

    try {
      if (coupon) {
        await couponService.update(coupon.id, payload);
      } else {
        await couponService.create(payload);
      }

      onDone();
    } catch (caught) {
      if (caught instanceof ApiError) {
        // Per-field messages go under their own inputs; the envelope's message
        // covers anything that belongs to the coupon as a whole.
        setFieldErrors(
          Object.fromEntries(
            FIELDS.map((field) => [field, caught.fieldError(field)]).filter(
              (pair): pair is [string, string] => pair[1] !== undefined,
            ),
          ),
        );
        setError(caught.displayMessage);
      } else {
        setError("Could not save that coupon.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</CardTitle>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field
            label="Code"
            name="code"
            required
            hint="Letters, numbers, dashes. Case does not matter to a customer."
            className="uppercase"
            error={fieldErrors.code}
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
          />

          <Field
            label="Description"
            name="description"
            hint="For your own reference. Customers never see it."
            error={fieldErrors.description}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <Select
            id="type"
            value={form.type}
            // A redeemed coupon's meaning is frozen: past orders recorded what
            // it was worth, and changing it now would leave those figures
            // unexplainable by the code that names them.
            disabled={redeemed}
            onChange={(e) => set("type", e.target.value as CouponType)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <p className="text-muted-foreground text-xs">
            {redeemed
              ? "This code has been used, so its type is fixed. Create a new coupon instead."
              : type?.hint}
          </p>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          {form.type !== "free_shipping" && (
            <Field
              label={form.type === "percent" ? "Percentage" : "Amount off"}
              name="value"
              required
              inputMode="decimal"
              hint={form.type === "percent" ? "Up to 100." : undefined}
              error={fieldErrors.value}
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
            />
          )}

          {/* Only a percentage can be capped. */}
          {form.type === "percent" && (
            <Field
              label="Maximum discount"
              name="max_discount"
              inputMode="decimal"
              hint="Leave blank for no cap."
              error={fieldErrors.max_discount}
              value={form.max_discount ?? ""}
              onChange={(e) => set("max_discount", e.target.value)}
            />
          )}

          <Field
            label="Minimum order"
            name="min_order"
            inputMode="decimal"
            hint="Compared against the goods, before delivery."
            error={fieldErrors.min_order}
            value={form.min_order ?? ""}
            onChange={(e) => set("min_order", e.target.value)}
          />
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field
            label="Total uses"
            name="usage_limit"
            inputMode="numeric"
            hint="Leave blank for unlimited."
            error={fieldErrors.usage_limit}
            value={form.usage_limit?.toString() ?? ""}
            onChange={(e) =>
              set("usage_limit", e.target.value ? Number(e.target.value) : null)
            }
          />

          <Field
            label="Uses per customer"
            name="per_customer_limit"
            inputMode="numeric"
            hint="Counted by account, or by email for a guest."
            error={fieldErrors.per_customer_limit}
            value={form.per_customer_limit?.toString() ?? ""}
            onChange={(e) =>
              set(
                "per_customer_limit",
                e.target.value ? Number(e.target.value) : null,
              )
            }
          />

          <Field
            label="Starts"
            name="starts_at"
            type="datetime-local"
            hint="Leave blank to start immediately."
            error={fieldErrors.starts_at}
            value={form.starts_at ?? ""}
            onChange={(e) => set("starts_at", e.target.value)}
          />

          <Field
            label="Expires"
            name="expires_at"
            type="datetime-local"
            hint="Leave blank for no expiry."
            error={fieldErrors.expires_at}
            value={form.expires_at ?? ""}
            onChange={(e) => set("expires_at", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Checkbox
            label="First order only"
            checked={form.first_order_only ?? false}
            onChange={(e) => set("first_order_only", e.target.checked)}
          />
          <Checkbox
            label="Active"
            checked={form.is_active ?? true}
            onChange={(e) => set("is_active", e.target.checked)}
          />
        </div>

        {error && <FormAlert message={error} />}

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Saving…" : coupon ? "Save changes" : "Create coupon"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** ISO from the API into what a `datetime-local` input expects. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";

  const at = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}T${pad(at.getHours())}:${pad(at.getMinutes())}`;
}
