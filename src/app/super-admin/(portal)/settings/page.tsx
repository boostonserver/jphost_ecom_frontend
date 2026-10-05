"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { usePlatformAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import {
  canPlatform,
  platformService,
  type PlatformBillingSettings,
} from "@/services/platform";
import { AlertCircle, CheckCircle2, Clock, CreditCard, ShieldAlert, Sliders } from "lucide-react";

export default function PlatformBillingSettingsPage() {
  const { user } = usePlatformAuth();
  const canManage = canPlatform(user, "invoice.manage");

  const { data, mutate, isLoading, error } = useSWR(
    "/platform/settings/billing",
    () => platformService.getBillingSettings(),
    { shouldRetryOnError: false },
  );

  const [form, setForm] = useState<PlatformBillingSettings>({
    invoice_lead_days: 14,
    first_reminder_days: 7,
    urgent_reminder_days: 1,
    grace_period_days: 3,
    late_fee_enabled: true,
    late_fee_percentage: 5.0,
    payment_instructions: {
      company_name: "Bdbazz Enterprise",
      bkash_merchant: "01981900308",
      nagad_merchant: "01981900308",
      bank_name: "City Bank PLC",
      account_name: "Bdbazz Enterprise Ltd.",
      account_number: "1102938475001",
      branch: "Gulshan Branch, Dhaka",
      routing_number: "225271829",
      notes: "Please include your Store Name or Invoice Number as reference during payment.",
    },
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (data) {
      setForm((prev) => ({
        ...prev,
        ...data,
        payment_instructions: {
          ...prev.payment_instructions,
          ...(data.payment_instructions || {}),
        },
      }));
    }
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setSaving(true);

    try {
      await platformService.updateBillingSettings(form);
      await mutate();
      setNotice({ tone: "success", message: "Billing and invoicing settings saved successfully!" });
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof ApiError ? err.displayMessage : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Billing & Invoicing Rules</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Configure automated invoice generation timelines, reminder emails, late fee penalties, and merchant payment guides.
        </p>
      </div>

      {error != null && (
        <FormAlert
          message={error instanceof ApiError ? error.message : "Failed to load billing settings"}
        />
      )}
      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Timeline & Dunning */}
        <Card className="space-y-5 border-border/80 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <Clock className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-base font-semibold">Automated Renewal & Email Timeline</CardTitle>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field
                label="Invoice Lead Time (Days Before Expiry)"
                type="number"
                min="1"
                max="60"
                value={form.invoice_lead_days}
                onChange={(e) =>
                  setForm({ ...form, invoice_lead_days: parseInt(e.target.value) || 14 })
                }
              />
              <p className="text-muted-foreground text-xs mt-1">
                Generates renewal invoice and emails client (Default: 14 days before expiry).
              </p>
            </div>

            <div>
              <Field
                label="1st Reminder Email (Days Before Expiry)"
                type="number"
                min="1"
                max="30"
                value={form.first_reminder_days}
                onChange={(e) =>
                  setForm({ ...form, first_reminder_days: parseInt(e.target.value) || 7 })
                }
              />
              <p className="text-muted-foreground text-xs mt-1">
                Sends friendly upcoming renewal notice (Default: 7 days before expiry).
              </p>
            </div>

            <div>
              <Field
                label="Urgent Notice (Days Before Expiry)"
                type="number"
                min="1"
                max="7"
                value={form.urgent_reminder_days}
                onChange={(e) =>
                  setForm({ ...form, urgent_reminder_days: parseInt(e.target.value) || 1 })
                }
              />
              <p className="text-muted-foreground text-xs mt-1">
                Urgent warning email ("Expires Tomorrow", Default: 1 day before expiry).
              </p>
            </div>

            <div>
              <Field
                label="Grace Period (Days Before Store Suspension)"
                type="number"
                min="0"
                max="30"
                value={form.grace_period_days}
                onChange={(e) =>
                  setForm({ ...form, grace_period_days: parseInt(e.target.value) || 3 })
                }
              />
              <p className="text-muted-foreground text-xs mt-1">
                Store remains active during grace period before suspension (Default: 3 days).
              </p>
            </div>
          </div>
        </Card>

        {/* Card 2: Late Fee Penalty */}
        <Card className="space-y-5 border-border/80 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-base font-semibold">Overdue Late Fee Penalty (জরিমানা)</CardTitle>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.late_fee_enabled}
                onChange={(e) => setForm({ ...form, late_fee_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-foreground">
                  Enable automatic late fee penalty for overdue invoices
                </span>
                <p className="text-muted-foreground text-xs">
                  When a subscription expires without payment, system applies the late fee percentage on day +1.
                </p>
              </div>
            </label>

            {form.late_fee_enabled && (
              <div className="max-w-xs pt-2">
                <Field
                  label="Penalty Percentage (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.late_fee_percentage}
                  onChange={(e) =>
                    setForm({ ...form, late_fee_percentage: parseFloat(e.target.value) || 0 })
                  }
                />
                <p className="text-muted-foreground text-xs mt-1">
                  Example: 5.0% on a ৳5,000 package adds ৳250 late fee to the invoice.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Merchant Payment Instructions */}
        <Card className="space-y-5 border-border/80 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base font-semibold">Payment Instructions for Merchants</CardTitle>
          </div>
          <p className="text-muted-foreground text-xs">
            These numbers and details will appear on client renewal invoices and email notifications.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Platform Company / Brand Name"
              value={form.payment_instructions?.company_name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    company_name: e.target.value,
                  },
                })
              }
            />

            <Field
              label="bKash Merchant / Personal No."
              value={form.payment_instructions?.bkash_merchant || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    bkash_merchant: e.target.value,
                  },
                })
              }
              placeholder="e.g. 01981900308"
            />

            <Field
              label="Nagad Merchant / Personal No."
              value={form.payment_instructions?.nagad_merchant || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    nagad_merchant: e.target.value,
                  },
                })
              }
              placeholder="e.g. 01981900308"
            />

            <Field
              label="Bank Name"
              value={form.payment_instructions?.bank_name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    bank_name: e.target.value,
                  },
                })
              }
              placeholder="e.g. City Bank PLC"
            />

            <Field
              label="Account Name"
              value={form.payment_instructions?.account_name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    account_name: e.target.value,
                  },
                })
              }
              placeholder="e.g. Bdbazz Enterprise Ltd."
            />

            <Field
              label="Account Number"
              value={form.payment_instructions?.account_number || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    account_number: e.target.value,
                  },
                })
              }
              placeholder="e.g. 1102938475001"
            />

            <Field
              label="Branch"
              value={form.payment_instructions?.branch || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    branch: e.target.value,
                  },
                })
              }
              placeholder="e.g. Gulshan Branch, Dhaka"
            />

            <Field
              label="Routing Number"
              value={form.payment_instructions?.routing_number || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    routing_number: e.target.value,
                  },
                })
              }
              placeholder="e.g. 225271829"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Customer Payment Instructions / Note</label>
            <textarea
              rows={3}
              value={form.payment_instructions?.notes || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_instructions: {
                    ...form.payment_instructions,
                    notes: e.target.value,
                  },
                })
              }
              className="border-input bg-background w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Instructions displayed on invoices..."
            />
          </div>
        </Card>

        {canManage && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || isLoading} className="px-6">
              {saving ? "Saving Changes..." : "Save Billing Settings"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
