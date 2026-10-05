import { headers } from "next/headers";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { SkipLink } from "@/components/store/skip-link";
import { loadNavCategories, loadStoreName } from "@/lib/store-nav";
import { isCentralHost } from "@/lib/tenant";

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

  // In parallel: two independent reads, and the shell should not wait for one
  // to start the other.
  const [categories, storeName] = await Promise.all([
    loadNavCategories(),
    loadStoreName(),
  ]);

  return (
    <>
      <SkipLink />
      <AnnouncementBar />
      <SiteHeader categories={categories} storeName={storeName} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter categories={categories} storeName={storeName} />
    </>
  );
}
