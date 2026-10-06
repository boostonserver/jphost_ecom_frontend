"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { adminThemeService, type ThemeInfo } from "@/services/admin-theme";

const THEME_METADATA: Record<
  string,
  {
    tag: string;
    bestFor: string;
    features: string[];
    badgeColor: string;
  }
> = {
  default: {
    tag: "Multi-Purpose Retail",
    bestFor: "General Stores, Accessories, Footwear & Multi-brand Retail",
    features: ["Flash Deals Countdown", "Bestseller Rails", "Clean Modern Grid"],
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  grocery: {
    tag: "Supermarket & Express Produce",
    bestFor: "Fresh Fruits, Vegetables, Meat, Fish & Daily Essentials",
    features: ["Instant 1-Click Quantity Counter", "Category Quick Rails", "30-Min Delivery Badges"],
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  fashion: {
    tag: "Fashion & Lifestyle Boutique",
    bestFor: "Apparel, Clothing Lines, Jewelry & Luxury Goods",
    features: ["Editorial Lifestyle Lookbook", "Color Swatches", "Minimalist Typography"],
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  electronics: {
    tag: "Tech, Gadgets & Hardware",
    bestFor: "Smartphones, Laptops, Computer Accessories & Electronics",
    features: ["Hardware Spec Comparison Pills", "Brand Showcase", "High-Density Rail"],
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
};

function getThemePreview(theme: ThemeInfo): string {
  if (theme.preview_image) {
    return theme.preview_image.replace(/\.png$/, ".svg");
  }
  return `/themes/${theme.id}-preview.svg`;
}

export default function AdminThemePage() {
  const [activating, setActivating] = useState<string | null>(null);
  const [previewingTheme, setPreviewingTheme] = useState<ThemeInfo | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  const { data, mutate, isLoading } = useSWR(
    "/admin/theme",
    () => adminThemeService.getSettings(),
    { shouldRetryOnError: false },
  );

  async function handleActivate(themeId: string) {
    setActivating(themeId);
    setNotice(null);

    try {
      await adminThemeService.activate(themeId);
      await mutate();
      setNotice({
        tone: "success",
        message: `Theme '${themeId}' activated! Your storefront is now serving this layout.`,
      });
    } catch (e) {
      setNotice({
        tone: "error",
        message: e instanceof ApiError ? e.displayMessage : "Failed to activate theme",
      });
    } finally {
      setActivating(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Store Theme & Appearance</h1>
        <p className="text-muted-foreground text-sm">Loading available themes…</p>
      </div>
    );
  }

  const activeThemeId = data?.active_theme || "default";
  const themes = data?.available_themes || [];
  const activeTheme = themes.find((t) => t.id === activeThemeId) || {
    id: activeThemeId,
    name: "Current Theme",
    description: "Active storefront layout.",
    category_hint: "general",
  };

  const activeThemeMeta = THEME_METADATA[activeThemeId] || THEME_METADATA.default;
  const activePreviewUrl = getThemePreview(activeTheme);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storefront Themes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a professionally designed theme for your store. Switch anytime with one click without affecting your products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm h-10 px-4 border border-input bg-card hover:bg-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"/>
              <path d="M10 14 21 3"/>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>
            Visit Live Store
          </a>
        </div>
      </div>

      {notice && <FormAlert message={notice.message} />}

      {/* Currently Active Theme (WordPress Top Hero Card) */}
      <Card className="p-0 overflow-hidden border-emerald-500/40 shadow-sm bg-card">
        <div className="bg-emerald-500/10 dark:bg-emerald-950/20 px-6 py-3 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Active Store Theme
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Shoppers currently see this layout on your domain
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Active Preview Thumbnail */}
          <div className="lg:col-span-5 relative group rounded-xl overflow-hidden border shadow-xs aspect-[16/10] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePreviewUrl}
              alt={activeTheme.name}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewingTheme(activeTheme)}
                className="gap-1.5 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Full Preview
              </Button>
            </div>
          </div>

          {/* Active Theme Info & Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{activeTheme.name}</h2>
                <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", activeThemeMeta.badgeColor)}>
                  {activeThemeMeta.tag}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {activeTheme.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Best Suited For:
              </span>
              <p className="text-xs text-muted-foreground">
                {activeThemeMeta.bestFor}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {activeThemeMeta.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs font-medium bg-muted/80 text-foreground/80 px-2.5 py-1 rounded-md border"
                >
                  ✓ {feature}
                </span>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6"/>
                  <path d="M10 14 21 3"/>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
                Visit Live Store
              </a>
              <Button
                variant="outline"
                onClick={() => setPreviewingTheme(activeTheme)}
                className="gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Live Preview
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Themes Catalog (WordPress Appearance -> Themes Grid) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Available Themes</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Select any theme below to preview how your storefront will look or activate it instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme: ThemeInfo) => {
            const isActive = theme.id === activeThemeId;
            const meta = THEME_METADATA[theme.id] || THEME_METADATA.default;
            const previewUrl = getThemePreview(theme);

            return (
              <Card
                key={theme.id}
                className={cn(
                  "group flex flex-col justify-between overflow-hidden transition-all duration-200 border rounded-xl shadow-xs",
                  isActive
                    ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/5 dark:bg-emerald-950/5"
                    : "hover:border-foreground/30 hover:shadow-md",
                )}
              >
                <div>
                  {/* Theme Screenshot Container (16:10 standard aspect ratio) */}
                  <div className="relative aspect-[16/10] bg-muted/60 overflow-hidden border-b">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt={theme.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Active Ribbon Badge */}
                    {isActive && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Active
                      </div>
                    )}

                    {/* Hover Actions Overlay (WordPress style) */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-4 backdrop-blur-xs">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewingTheme(theme)}
                        className="gap-1.5 font-medium shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Live Preview
                      </Button>

                      {!isActive && (
                        <Button
                          size="sm"
                          loading={activating === theme.id}
                          onClick={() => handleActivate(theme.id)}
                          className="gap-1.5 font-medium shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Theme Info Block */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold">{theme.name}</CardTitle>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", meta.badgeColor)}>
                          {meta.tag}
                        </span>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                        {theme.description}
                      </CardDescription>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Best for: </span>
                      {meta.bestFor}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3.5 border-t bg-muted/20 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewingTheme(theme)}
                    className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Preview
                  </Button>

                  {isActive ? (
                    <Button size="sm" variant="secondary" disabled className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Active Theme
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      loading={activating === theme.id}
                      onClick={() => handleActivate(theme.id)}
                      className="h-8 text-xs font-medium"
                    >
                      Activate Theme
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* WordPress-style Full Screen Live Preview Modal */}
      {previewingTheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col animate-in fade-in duration-200">
          {/* Modal Header Strip */}
          <div className="bg-background border-b px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewingTheme(null)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </Button>
              <div className="h-4 w-px bg-border" />
              <div>
                <h3 className="font-bold text-sm">{previewingTheme.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {THEME_METADATA[previewingTheme.id]?.tag || "Storefront Theme"}
                </span>
              </div>
            </div>

            {/* Device Viewport Toggle Buttons */}
            <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg border">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  previewDevice === "desktop" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground",
                )}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  previewDevice === "tablet" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground",
                )}
              >
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  previewDevice === "mobile" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground",
                )}
              >
                Mobile
              </button>
            </div>

            {/* Activate CTA in Modal */}
            <div className="flex items-center gap-2">
              {previewingTheme.id === activeThemeId ? (
                <Button size="sm" variant="secondary" disabled className="gap-1.5 text-xs text-emerald-600">
                  ✓ Currently Active
                </Button>
              ) : (
                <Button
                  size="sm"
                  loading={activating === previewingTheme.id}
                  onClick={async () => {
                    await handleActivate(previewingTheme.id);
                    setPreviewingTheme(null);
                  }}
                  className="gap-1.5 text-xs"
                >
                  Activate {previewingTheme.name}
                </Button>
              )}
            </div>
          </div>

          {/* Modal Preview Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-muted/40">
            <div
              className={cn(
                "bg-background rounded-xl shadow-2xl border overflow-hidden transition-all duration-300 flex flex-col",
                previewDevice === "desktop" && "w-full max-w-5xl",
                previewDevice === "tablet" && "w-full max-w-2xl",
                previewDevice === "mobile" && "w-full max-w-sm",
              )}
            >
              {/* Simulated Browser Bar */}
              <div className="bg-muted px-4 py-2 border-b flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 bg-background text-muted-foreground text-[11px] font-mono py-1 px-3 rounded-md border text-center truncate">
                  https://your-store.com (Theme Preview: {previewingTheme.name})
                </div>
              </div>

              {/* Theme Mockup Visual */}
              <div className="overflow-y-auto max-h-[75vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThemePreview(previewingTheme)}
                  alt={previewingTheme.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
