"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { usePlatformAuth } from "@/components/platform/platform-auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/services/billing";
import { canPlatform, platformService, type Tenant } from "@/services/platform";
import {
  Check,
  Edit3,
  ExternalLink,
  KeyRound,
  Rocket,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { TenantStatusBadge } from "../page";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { user } = usePlatformAuth();

  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(
    null,
  );
  const [impersonating, setImpersonating] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  const { data: tenant, mutate, isLoading } = useSWR(
    `/platform/tenants/${id}`,
    () => platformService.tenant(id),
    { shouldRetryOnError: false },
  );

  const { data: usage } = useSWR(
    tenant?.is_active ? `/platform/tenants/${id}/usage` : null,
    () => platformService.tenantUsage(id),
    { shouldRetryOnError: false },
  );

  const { data: admins } = useSWR(
    tenant?.is_active ? `/platform/tenants/${id}/admins` : null,
    () => platformService.tenantAdmins(id),
    { shouldRetryOnError: false },
  );

  async function handleAutoLogin() {
    setImpersonating(true);
    setNotice(null);
    try {
      const res = await platformService.impersonate(id);
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch (e) {
      setNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Failed to start auto-login session",
      });
    } finally {
      setImpersonating(false);
    }
  }

  async function run(action: () => Promise<unknown>, success: string) {
    setNotice(null);

    try {
      await action();
      await mutate();
      setNotice({ tone: "success", message: success });
    } catch (e) {
      setNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Something went wrong",
      });
    }
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!tenant) return <FormAlert message="Tenant not found" />;

  const subscription = tenant.subscription ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/super-admin/tenants" className="text-muted-foreground text-sm underline">
          Back to tenants
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <TenantStatusBadge status={tenant.status} />
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-0.5">
              {tenant.primary_domain ?? tenant.slug} · {tenant.database}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {tenant.status === "active" && (
              <Button
                onClick={handleAutoLogin}
                disabled={impersonating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm text-xs h-9 px-4"
              >
                <Rocket className="size-4" />
                {impersonating ? "Connecting..." : "🚀 Login as Store Admin"}
              </Button>
            )}

            {tenant.primary_domain && (
              <a
                href={`https://${tenant.primary_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md bg-background hover:bg-muted text-foreground transition-colors h-9"
              >
                <ExternalLink className="size-3.5 text-muted-foreground" />
                Visit Storefront
              </a>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditName(tenant.contact_name ?? "");
                setEditEmail(tenant.contact_email ?? "");
                setEditPhone(tenant.contact_phone ?? "");
                setEditPassword("");
                setEditContactOpen(true);
              }}
              className="flex items-center gap-1.5 h-9 text-xs"
            >
              <KeyRound className="size-3.5 text-primary" />
              Edit Credentials
            </Button>
          </div>
        </div>
      </div>

      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      {tenant.status === "provision_failed" && (
        <Card className="border-destructive/30 space-y-3">
          <CardTitle>Provisioning failed</CardTitle>
          <p className="text-muted-foreground font-mono text-xs">{tenant.provision_error}</p>
          {canPlatform(user, "tenant.create") && (
            <Button
              onClick={() =>
                run(() => platformService.retryProvisioning(id), "Provisioning restarted")
              }
            >
              Retry provisioning
            </Button>
          )}
        </Card>
      )}

      {tenant.status === "suspended" && (
        <Card className="border-amber-500/30 space-y-3">
          <CardTitle>Suspended</CardTitle>
          <p className="text-sm">{tenant.suspension_reason}</p>
          {canPlatform(user, "tenant.suspend") && (
            <Button
              onClick={() => run(() => platformService.restoreTenant(id), "Tenant restored")}
            >
              Restore
            </Button>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <CardTitle>Subscription</CardTitle>

          {subscription ? (
            <dl className="space-y-2 text-sm">
              <Row label="Plan" value={subscription.package?.name ?? "—"} />
              <Row
                label="Price"
                value={`${formatMoney(subscription.price, subscription.currency)} · ${subscription.billing_period_label}`}
              />
              <Row label="Status" value={subscription.status_label} />
              {subscription.trial_ends_at && (
                <Row
                  label="Trial ends"
                  value={new Date(subscription.trial_ends_at).toLocaleDateString()}
                />
              )}
              {subscription.current_period_end && (
                <Row
                  label="Renews"
                  value={new Date(subscription.current_period_end).toLocaleDateString()}
                />
              )}
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">No plan assigned.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Contact & Merchant Admin</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditName(tenant.contact_name ?? "");
                setEditEmail(tenant.contact_email ?? "");
                setEditPhone(tenant.contact_phone ?? "");
                setEditPassword("");
                setEditContactOpen(true);
              }}
              className="text-xs h-7"
            >
              <Edit3 className="size-3 mr-1" />
              Edit & Reset Password
            </Button>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Name" value={tenant.contact_name ?? "—"} />
            <Row label="Email" value={tenant.contact_email ?? "—"} />
            <Row label="Phone" value={tenant.contact_phone ?? "—"} />
            <Row label="Timezone" value={tenant.timezone} />
            <Row label="Currency" value={tenant.currency} />
          </dl>
        </Card>
      </div>

      {usage && (
        <Card className="space-y-3">
          <CardTitle>Usage</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {usage.limits.map((limit) => (
              <div key={limit.feature} className="flex justify-between text-sm">
                <span>{limit.label}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    !limit.unlimited &&
                      limit.limit !== null &&
                      limit.used >= limit.limit &&
                      "text-destructive font-medium",
                  )}
                >
                  {limit.unlimited ? `${limit.used} · unlimited` : `${limit.used} / ${limit.limit}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        <CardTitle>Domains</CardTitle>

        <ul className="divide-y text-sm">
          {tenant.domains?.map((domain) => (
            <li key={domain.id} className="flex items-center justify-between gap-3 py-2">
              <span className="font-mono">
                {domain.hostname}
                {domain.is_primary && (
                  <span className="text-muted-foreground ml-2 text-xs">primary</span>
                )}
                {!domain.is_verified && !domain.is_primary && (
                  <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                    unverified
                  </span>
                )}
              </span>

              {canPlatform(user, "tenant.update") && !domain.is_primary && (
                <span className="flex gap-3">
                  <button
                    className="underline"
                    onClick={() =>
                      run(
                        () => platformService.makeDomainPrimary(id, domain.id),
                        "Primary domain updated",
                      )
                    }
                  >
                    Make primary
                  </button>
                  <button
                    className="text-destructive underline"
                    onClick={() =>
                      run(() => platformService.removeDomain(id, domain.id), "Domain removed")
                    }
                  >
                    Remove
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>

        {canPlatform(user, "tenant.update") && (
          <AddDomainForm
            onAdd={(hostname) =>
              run(() => platformService.addDomain(id, hostname), "Domain added")
            }
          />
        )}
      </Card>

      {admins && (
        <Card className="space-y-3">
          <CardTitle>Store admins</CardTitle>

          <ul className="divide-y text-sm">
            {admins.items.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  {admin.name}
                  <span className="text-muted-foreground"> · {admin.email}</span>
                </span>

                {canPlatform(user, "tenant.impersonate") && tenant.is_active && (
                  <ImpersonateButton tenantId={id} userId={admin.id} onError={setNotice} />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ThemeSettingsCard tenant={tenant} onNotice={setNotice} />

      <DangerZone tenant={tenant} onRun={run} />

      {/* Edit Merchant Contact & Reset Password Modal */}
      {editContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md space-y-4 p-6 shadow-2xl border-2 bg-card">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" />
                <h3 className="font-bold text-lg">Edit Merchant & Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditContactOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingContact(true);
                try {
                  await platformService.updateTenantContact(id, {
                    name: editName,
                    email: editEmail,
                    phone: editPhone,
                    password: editPassword || undefined,
                  });
                  await mutate();
                  setEditContactOpen(false);
                  setNotice({
                    tone: "success",
                    message: "Merchant contact details and admin password updated successfully!",
                  });
                } catch (err) {
                  setNotice({
                    tone: "error",
                    message: err instanceof ApiError ? err.displayMessage : "Failed to update contact info",
                  });
                } finally {
                  setSavingContact(false);
                }
              }}
              className="space-y-3.5"
            >
              <Field
                label="Merchant Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Sizar Babu"
                required
              />

              <Field
                label="Merchant Email (Login Email)"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="e.g. merchant@gmail.com"
                required
              />

              <Field
                label="Phone Number"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. 01972101994"
              />

              <div className="space-y-1 pt-1">
                <Field
                  label="New Admin Password (Optional)"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to keep existing password. If entered, the store admin password will be immediately updated.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditContactOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingContact}>
                  {savingContact ? "Saving..." : "Save & Sync"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function AddDomainForm({ onAdd }: { onAdd: (hostname: string) => Promise<void> }) {
  const [hostname, setHostname] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        await onAdd(hostname);
        setHostname("");
      }}
    >
      <input
        value={hostname}
        onChange={(event) => setHostname(event.target.value)}
        placeholder="shop.example.com"
        className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-sm"
      />
      <Button type="submit" variant="secondary" disabled={!hostname}>
        Add domain
      </Button>
    </form>
  );
}

/**
 * Impersonation asks for a reason before it will do anything: it is a
 * privacy-sensitive act, and "why" belongs on the record before the fact.
 */
function ImpersonateButton({
  tenantId,
  userId,
  onError,
}: {
  tenantId: number;
  userId: number;
  onError: (notice: { tone: "error"; message: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button className="underline" onClick={() => setOpen(true)}>
        Open store admin
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason (recorded)"
        className="border-input bg-background h-8 w-56 rounded-md border px-2 text-sm"
      />
      <Button
        className="h-8"
        loading={loading}
        disabled={!reason}
        onClick={async () => {
          setLoading(true);

          try {
            const { url } = await platformService.impersonate(tenantId, userId, reason);
            // The token lives for 60 seconds, so it is followed immediately
            // rather than shown to be copied around.
            window.location.href = url;
          } catch (e) {
            onError({
              tone: "error",
              message: e instanceof ApiError ? e.displayMessage : "Could not start session",
            });
            setLoading(false);
          }
        }}
      >
        Go
      </Button>
      <button className="text-muted-foreground underline" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </span>
  );
}

function DangerZone({
  tenant,
  onRun,
}: {
  tenant: { id: number; slug: string; status: string; database?: string };
  onRun: (action: () => Promise<unknown>, success: string) => Promise<void>;
}) {
  const router = useRouter();
  const { user } = usePlatformAuth();
  const [reason, setReason] = useState("");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [confirmPurgeSlug, setConfirmPurgeSlug] = useState("");
  const [purging, setPurging] = useState(false);

  const canSuspend = canPlatform(user, "tenant.suspend") && tenant.status === "active";
  const canArchive = canPlatform(user, "tenant.delete") && tenant.status !== "archived";
  const canPurge = canPlatform(user, "tenant.delete");

  if (!canSuspend && !canArchive && !canPurge) return null;

  async function handlePermanentPurge() {
    if (confirmPurgeSlug !== tenant.slug) return;
    setPurging(true);
    try {
      await platformService.purgeTenant(tenant.id, confirmPurgeSlug);
      router.push("/super-admin/tenants");
    } catch (e) {
      alert(e instanceof ApiError ? e.displayMessage : "Failed to permanently purge tenant");
    } finally {
      setPurging(false);
    }
  }

  return (
    <Card className="border-destructive/30 space-y-5">
      <CardTitle className="text-destructive flex items-center gap-2">
        <Trash2 className="size-5" />
        <span>Danger zone</span>
      </CardTitle>

      {canSuspend && (
        <div className="space-y-2">
          <Field
            label="Suspend this store"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (required, recorded)"
          />
          <Button
            variant="destructive"
            disabled={!reason}
            onClick={() =>
              onRun(() => platformService.suspendTenant(tenant.id, reason), "Tenant suspended")
            }
          >
            Suspend
          </Button>
        </div>
      )}

      {canArchive && (
        <div className="space-y-2">
          <Field
            label={`Archive — type "${tenant.slug}" to confirm`}
            value={confirmSlug}
            onChange={(event) => setConfirmSlug(event.target.value)}
            placeholder={tenant.slug}
          />
          <p className="text-muted-foreground text-xs">
            The store stops serving immediately. Its database is kept for the retention
            window and then permanently destroyed.
          </p>
          <Button
            variant="destructive"
            disabled={confirmSlug !== tenant.slug}
            onClick={() =>
              onRun(
                () => platformService.archiveTenant(tenant.id, confirmSlug),
                "Tenant archived",
              )
            }
          >
            Archive
          </Button>
        </div>
      )}

      {/* Permanent Force Delete / Purge */}
      {canPurge && (
        <div className="space-y-3 pt-3 border-t border-destructive/20 bg-rose-500/5 p-4 rounded-lg">
          <h4 className="font-semibold text-destructive text-sm flex items-center gap-1.5">
            <Trash2 className="size-4" />
            Permanent Deletion (Force Purge Database & Wipe Store)
          </h4>
          <p className="text-muted-foreground text-xs">
            Permanently drops the MySQL database <strong>({tenant.database ?? `tenant_${tenant.slug}`})</strong>, removes all domain records, and wipes the tenant completely from the platform.
            <span className="text-destructive font-semibold ml-1">This cannot be undone.</span>
          </p>
          <Field
            label={`Type "${tenant.slug}" to permanently delete`}
            value={confirmPurgeSlug}
            onChange={(event) => setConfirmPurgeSlug(event.target.value)}
            placeholder={tenant.slug}
          />
          <Button
            variant="destructive"
            disabled={confirmPurgeSlug !== tenant.slug || purging}
            onClick={handlePermanentPurge}
          >
            {purging ? "Purging database..." : "Permanently Delete Store & Database"}
          </Button>
        </div>
      )}
    </Card>
  );
}

function ThemeSettingsCard({
  tenant,
  onNotice,
}: {
  tenant: Tenant;
  onNotice: (notice: { tone: "error" | "success"; message: string }) => void;
}) {
  const { data, mutate, isLoading, error } = useSWR(
    `/platform/tenants/${tenant.id}/theme-settings`,
    () => platformService.tenantThemeSettings(tenant.id),
    { shouldRetryOnError: false },
  );

  const [saving, setSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>("");
  const [allowedThemes, setAllowedThemes] = useState<string[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<(string | number)[]>([]);

  useEffect(() => {
    if (data?.settings) {
      setActiveTheme(data.settings.active_theme || "default");
      setAllowedThemes(data.settings.allowed_themes || ["default"]);
      setAllowedCategories(data.settings.allowed_categories || []);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="space-y-4">
        <CardTitle>Themes & Category Permissions</CardTitle>
        <p className="text-muted-foreground text-sm">Loading theme permissions…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-4 border-destructive/30">
        <CardTitle>Themes & Category Permissions</CardTitle>
        <FormAlert
          tone="error"
          message={error instanceof ApiError ? error.displayMessage : "Failed to load theme settings from server"}
        />
        <Button size="sm" variant="outline" onClick={() => mutate()}>
          Retry
        </Button>
      </Card>
    );
  }

  const allThemes = data?.all_themes || [];
  const tenantCategories = data?.tenant_categories || [];

  function toggleTheme(themeId: string) {
    if (themeId === "default") return;
    setAllowedThemes((prev) => {
      const next = prev.includes(themeId)
        ? prev.filter((id) => id !== themeId)
        : [...prev, themeId];
      if (!next.includes(activeTheme)) {
        setActiveTheme("default");
      }
      return next;
    });
  }

  function toggleCategory(catId: number | string) {
    setAllowedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await platformService.updateTenantThemeSettings(tenant.id, {
        active_theme: activeTheme,
        allowed_themes: allowedThemes,
        allowed_categories: allowedCategories,
      });
      await mutate();
      onNotice({ tone: "success", message: "Theme permissions and active theme saved successfully." });
    } catch (e) {
      onNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Failed to update theme settings",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <CardTitle>Themes & Category Permissions</CardTitle>
          <p className="text-muted-foreground text-xs mt-1">
            Control which storefront themes and categories this store is allowed to use.
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="sm">
          Save Settings
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-2">Available Store Themes</label>
          {allThemes.length === 0 ? (
            <p className="text-muted-foreground text-xs italic py-2">
              No themes found in platform catalog. Please ensure config/themes.php is uploaded and config cache cleared.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allThemes.map((theme) => {
                const isAllowed = allowedThemes.includes(theme.id) || theme.id === "default";
                const isActive = activeTheme === theme.id;

                return (
                  <div
                    key={theme.id}
                    className={cn(
                      "border rounded-lg p-3.5 transition-all flex flex-col justify-between",
                      isActive
                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 ring-1 ring-emerald-500"
                        : "border-border",
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm flex items-center gap-2">
                          {theme.name}
                          {theme.id === "default" && (
                            <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-mono">
                              System
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{theme.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          disabled={theme.id === "default"}
                          checked={isAllowed}
                          onChange={() => toggleTheme(theme.id)}
                          className="rounded border-input text-primary"
                        />
                        <span>Allowed for Store</span>
                      </label>

                      {isAllowed && !isActive && (
                        <button
                          type="button"
                          onClick={() => setActiveTheme(theme.id)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Set as Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {tenantCategories.length > 0 ? (
          <div className="pt-3 border-t">
            <label className="text-sm font-semibold block mb-2">Category Permissions</label>
            <p className="text-muted-foreground text-xs mb-3">
              Click to toggle allowed categories (Selected categories will be highlighted).
            </p>
            <div className="flex flex-wrap gap-2">
              {tenantCategories.map((cat) => {
                const isSelected = allowedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {isSelected ? "✓ " : ""}{cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t">
            <label className="text-sm font-semibold block mb-1">Category Permissions</label>
            <p className="text-muted-foreground text-xs italic">
              This store has no categories yet, or tenant database is not connected.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
