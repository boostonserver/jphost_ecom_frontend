import { headers } from "next/headers";
import { DemoThemeBar } from "@/components/demo/demo-theme-bar";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { SkipLink } from "@/components/store/skip-link";
import { loadNavCategories, loadStoreName } from "@/lib/store-nav";
import { isCentralHost } from "@/lib/tenant";
import { resolveStoreTheme } from "@/lib/theme";
import { renderThemeAnnouncement } from "@/themes/registry";

/**
 * The storefront shell.
 *
 * A Server Component (PRD 5A rule 4). It used to carry "use client" purely to
 * read `useAuth` for one header link, which put every storefront page inside a
 * client boundary. The auth-aware piece is now `HeaderActions`, an island of
 * its own, and the shell can fetch its own navigation on the server.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const incoming = await headers();
  const host = incoming.get("host") ?? "";
  const isCentral = isCentralHost(host);

  // When served from central host (bdbazz.com), bypass the store shell so the
  // dedicated SaaS platform landing page renders with its own navigation and footer.
  if (isCentral) {
    return <>{children}</>;
  }

  // In parallel: three independent reads, and the shell should not wait for one
  // to start the other.
  const [categories, storeName, themeInfo] = await Promise.all([
    loadNavCategories(),
    loadStoreName(),
    resolveStoreTheme(),
  ]);

  const { themeId, isDemo, customization } = themeInfo;

  return (
    <div
      data-theme={themeId}
      style={customization?.primary_color ? ({ "--primary": customization.primary_color, "--ring": customization.primary_color } as React.CSSProperties) : undefined}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <SkipLink />
      {/* 1. Global Floating Interactive Demo Theme Switcher (Available on all pages for demo store) */}
      {isDemo && <DemoThemeBar isDemo={true} currentTheme={themeId} />}

      {/* 2. Theme-Specific Top Announcement / Header Strip (e.g. Shwapno red delivery strip on grocery) */}
      {customization?.announcement_enabled !== false && renderThemeAnnouncement(themeId, storeName)}

      {/* 3. Main Navigation Header */}
      <SiteHeader categories={categories} storeName={storeName} themeId={themeId} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter categories={categories} storeName={storeName} themeId={themeId} />
    </div>
  );
}
