import { ProductListing } from "@/components/catalog/product-listing";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import {
  pickListingParams,
  toSearchParams,
} from "@/lib/catalog-query";
import { serverFetch } from "@/lib/server-api";
import { resolveStoreTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Brand, CategoryNode, Product } from "@/services/catalog";
import type { Paginated } from "@/types/auth";

/**
 * Product listing.
 *
 * A Server Component because this is an SEO-critical page: the markup a
 * crawler sees has to contain the products, not a loading spinner that fetches
 * them afterwards. The interactive parts — sort control and mobile filter
 * drawer — are islands inside it.
 */

export const metadata = {
  title: "Products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Only known keys are forwarded. Passing the query string through verbatim
  // would let anyone probe the API with parameters this page never intended to
  // expose (PRD 5B rule 14).
  const active = pickListingParams(await searchParams);
  const query = toSearchParams(active);

  const [products, tree, brands, themeInfo] = await Promise.all([
    serverFetch<Paginated<Product>>(`/products?${query}`),
    serverFetch<{ items: CategoryNode[] }>("/categories", 300),
    serverFetch<{ items: Brand[] }>("/brands", 300),
    resolveStoreTheme(),
  ]);

  const { themeId } = themeInfo;

  return (
    <div
      className={
        themeId === "grocery"
          ? "bg-[#fafaf9] text-stone-900 min-h-screen pb-16 selection:bg-red-600 selection:text-white"
          : themeId === "fashion"
            ? "bg-[#faf8f5] text-stone-900 min-h-screen pb-16 selection:bg-amber-900 selection:text-amber-50"
            : themeId === "electronics"
              ? "bg-[#030712] text-slate-100 min-h-screen pb-16 selection:bg-cyan-500 selection:text-black"
              : ""
      }
    >
      <Container className="py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            {
              label:
                themeId === "grocery"
                  ? "Groceries"
                  : themeId === "fashion"
                    ? "Collection"
                    : "Products",
            },
          ]}
        />

        <h1
          className={cn(
            "mt-4 mb-8 text-3xl font-bold lg:text-4xl",
            themeId === "fashion" && "font-serif tracking-tight text-stone-900",
            themeId === "grocery" && "font-extrabold tracking-tight text-stone-900",
            themeId === "electronics" && "font-black tracking-tight text-white",
          )}
        >
          {active.q
            ? `Results for “${active.q}”`
            : themeId === "grocery"
              ? "All Supermarket Groceries"
              : themeId === "fashion"
                ? "The Full Designer Collection"
                : themeId === "electronics"
                  ? "All Devices & Tech Gear"
                  : "All products"}
        </h1>

        <ProductListing
          products={products}
          categories={tree.items}
          brands={brands.items}
          active={active}
          basePath="/products"
        />
      </Container>
    </div>
  );
}
