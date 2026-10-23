"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { domainSettingsApi, type StoreDomain } from "@/services/domain-settings";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Server,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

export default function DomainSettingsPage() {
  const [hostname, setHostname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    "/admin/settings/domains",
    () => domainSettingsApi.getDomains(),
    { shouldRetryOnError: false },
  );

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!hostname.trim()) return;

    setSubmitting(true);
    setNotice(null);

    // Clean input (remove https://, http://, trailing slashes)
    let cleaned = hostname.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

    try {
      await domainSettingsApi.addDomain(cleaned);
      setHostname("");
      await mutate();
      setNotice({
        tone: "success",
        message: data?.can_connect_directly
          ? "Domain connected successfully! Please ensure your DNS records are configured."
          : "Domain request submitted successfully! Super Admin will review and activate it shortly.",
      });
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof ApiError ? err.displayMessage : "Failed to add domain",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMakePrimary(domain: StoreDomain) {
    setNotice(null);
    try {
      await domainSettingsApi.makePrimary(domain.id);
      await mutate();
      setNotice({ tone: "success", message: `Primary domain updated to ${domain.hostname}` });
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof ApiError ? err.displayMessage : "Failed to set primary domain",
      });
    }
  }

  async function handleRemove(domain: StoreDomain) {
    if (!confirm(`Are you sure you want to remove ${domain.hostname}?`)) return;
    setNotice(null);
    try {
      await domainSettingsApi.removeDomain(domain.id);
      await mutate();
      setNotice({ tone: "success", message: `Domain ${domain.hostname} removed` });
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof ApiError ? err.displayMessage : "Failed to remove domain",
      });
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const canConnectDirectly = data?.can_connect_directly ?? false;
  const domains = data?.items ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Custom Domain Settings</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your own branded domain (e.g. <span className="font-mono">yourshop.com</span>) to your online store.
          </p>
        </div>

        {/* Plan Feature Badge */}
        {data && (
          <div className="self-start sm:self-auto">
            {canConnectDirectly ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="size-4 text-emerald-600" />
                Custom Domain Allowed on Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="size-4 text-amber-600" />
                Plan Requires Super Admin Review
              </span>
            )}
          </div>
        )}
      </div>

      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      {/* Plan Status Note */}
      {data && !canConnectDirectly && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm">
          <Info className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              Custom Domain Connection Process
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your subscription package requires custom domain requests to be reviewed by the platform team.
              You can submit your desired domain below. Once reviewed and approved by Super Admin, your domain will automatically become active.
            </p>
          </div>
        </div>
      )}

      {/* Connected Domains Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Connected Domains</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
              {domains.length}
            </span>
          </CardTitle>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading domains...</p>
        ) : domains.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Globe className="size-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No custom domains connected yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {domains.map((domain) => {
              const isPending = domain.status === "pending_review";
              const isRejected = domain.status === "rejected";
              const isActive = !domain.status || domain.status === "active";

              return (
                <div
                  key={domain.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-medium text-sm">{domain.hostname}</span>

                      {domain.is_primary && (
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Primary Domain
                        </span>
                      )}

                      {isPending && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pending Super Admin Review
                        </span>
                      )}

                      {isRejected && (
                        <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="size-3 text-rose-600" />
                          Rejected
                        </span>
                      )}

                      {isActive && !domain.is_primary && (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="size-3 text-emerald-600" />
                          Active
                        </span>
                      )}
                    </div>

                    {domain.rejection_reason && (
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        Rejection reason: {domain.rejection_reason}
                      </p>
                    )}

                    {isPending && (
                      <p className="text-[11px] text-muted-foreground">
                        Your request is in the review queue. Super Admin will verify DNS and approve shortly.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive && (
                      <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-3" />
                        Visit
                      </a>
                    )}

                    {isActive && !domain.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium"
                        onClick={() => handleMakePrimary(domain)}
                      >
                        Make Primary
                      </Button>
                    )}

                    {!domain.is_primary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 h-8 text-xs px-2"
                        onClick={() => handleRemove(domain)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add New Domain / Request Domain Form */}
      <Card className="space-y-4">
        <div>
          <CardTitle className="text-lg">
            {canConnectDirectly ? "Connect New Custom Domain" : "Submit Domain for Approval"}
          </CardTitle>
          <p className="text-muted-foreground text-xs mt-1">
            {canConnectDirectly
              ? "Add your custom domain without http:// or https:// (e.g. mybrand.com or shop.mybrand.com)."
              : "Enter your domain name to submit a connection request to Super Admin."}
          </p>
        </div>

        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="e.g. mybrand.com or store.mybrand.com"
            className="border-input bg-background h-10 flex-1 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
            required
          />
          <Button type="submit" loading={submitting} disabled={!hostname.trim()} className="h-10 px-5">
            {canConnectDirectly ? "Connect Domain" : "Submit for Review"}
          </Button>
        </form>
      </Card>

      {/* DNS Configuration Instructions */}
      <Card className="space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="size-5 text-primary" />
              <span>DNS Configuration Guide</span>
            </CardTitle>
            <p className="text-muted-foreground text-xs mt-1">
              Log into your domain provider (Cloudflare, Namecheap, GoDaddy, etc.) and add the following DNS records:
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* A Record */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Option 1: Root Domain (A Record)</span>
              <span className="text-[10px] bg-primary/10 text-primary font-mono font-bold px-2 py-0.5 rounded">
                A RECORD
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Required if connecting your root apex domain (e.g. <span className="font-mono">yourshop.com</span>).
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-muted-foreground font-sans">Type:</span>
                <span className="font-bold">A</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-muted-foreground font-sans">Name / Host:</span>
                <span className="font-bold">@ (or root)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground font-sans">Points to / Target:</span>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span>103.240.4.33</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("103.240.4.33", "ip")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Copy IP"
                  >
                    {copiedKey === "ip" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CNAME Record */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Option 2: WWW / Subdomain (CNAME)</span>
              <span className="text-[10px] bg-primary/10 text-primary font-mono font-bold px-2 py-0.5 rounded">
                CNAME
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Required for <span className="font-mono">www.yourshop.com</span> or custom subdomains.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-muted-foreground font-sans">Type:</span>
                <span className="font-bold">CNAME</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-muted-foreground font-sans">Name / Host:</span>
                <span className="font-bold">www (or shop)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground font-sans">Points to / Target:</span>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span>bdbazz.com</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("bdbazz.com", "cname")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Copy CNAME target"
                  >
                    {copiedKey === "cname" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
          <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
          <span>
            DNS changes usually take effect within a few minutes, but can sometimes take up to 24 hours to propagate worldwide.
          </span>
        </div>
      </Card>
    </div>
  );
}
