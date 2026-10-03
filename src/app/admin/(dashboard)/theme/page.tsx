"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { adminThemeService, type ThemeInfo } from "@/services/admin-theme";

export default function AdminThemePage() {
  const [activating, setActivating] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storefront Themes</h1>
          <p className="text-muted-foreground text-sm">
            Manage the visual appearance and layout of your store.
          </p>
        </div>
      </div>

      {notice && (
        <FormAlert message={notice.message} />
      )}

      {/* Currently Active Theme Card */}
      <Card className="p-6 border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                Active Theme
              </span>
              <h2 className="text-xl font-bold">{activeTheme.name}</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl">
              {activeTheme.description}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live on your domain
            </span>
          </div>
        </div>
      </Card>

      {/* Available Themes Granted to Merchant */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">Available Themes</h3>
          <p className="text-muted-foreground text-xs">
            These themes have been granted to your store by the platform administrator. Click &quot;Activate&quot; to switch instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((theme: ThemeInfo) => {
            const isActive = theme.id === activeThemeId;

            return (
              <Card
                key={theme.id}
                className={cn(
                  "flex flex-col justify-between overflow-hidden transition-all border",
                  isActive
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "hover:border-foreground/20",
                )}
              >
                <div className="h-32 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-4 border-b">
                  <div className="text-center space-y-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground/80">
                      {theme.name}
                    </span>
                    <span className="block text-[11px] font-mono uppercase text-muted-foreground">
                      Category: {theme.category_hint}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{theme.name}</CardTitle>
                      {isActive && (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {theme.description}
                    </CardDescription>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {theme.is_system ? "System Default" : "Specialized Layout"}
                    </span>

                    {isActive ? (
                      <Button size="sm" variant="secondary" disabled>
                        Active Now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        loading={activating === theme.id}
                        onClick={() => handleActivate(theme.id)}
                      >
                        Activate Theme
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
