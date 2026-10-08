import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { BrandTile } from "@/components/catalog/brand-tile";
import { FlashSaleBand } from "@/components/store/flash-sale-band";
import { FloatingCartWidget } from "./floating-cart-widget";
import { GroceryHeaderStrip } from "./grocery-header-strip";
import { GroceryHero } from "./grocery-hero";
import { GroceryProductRail } from "./grocery-product-rail";
import { GroceryMeatFishBanner, GroceryVegetablesBanner } from "./grocery-special-banner";
import { GroceryTrustBadges } from "./trust-badges";
import type { ThemeHomeProps } from "@/themes/registry";

export function GroceryThemeLayout(props: ThemeHomeProps) {
  const {
    storeName,
    categories,
    brands,
    flashSale,
    featured,
    fresh,
    bestsellers,
    heroProducts,
    hasAnything,
    defaultLayout,
  } = props;

  // Defensive fallback: If store has literally no products or categories,
  // gracefully render the default clean empty state layout.
  if (!hasAnything) {
    return <>{defaultLayout}</>;
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 pb-16 selection:bg-red-600 selection:text-white">
      {/* 1. Hero Section: Shop by Category Sidebar + Hero Carousel + 4 Mini Promos */}
      <GroceryHero
        categories={categories}
        heroProducts={heroProducts}
        storeName={storeName}
      />

      {/* 3. Four Core Supermarket Trust Badges */}
      <GroceryTrustBadges />

      {/* 4. Time-Limited Flash Sale Band (if active) */}
      <div className="max-w-7xl mx-auto px-4 my-4">
        <FlashSaleBand sale={flashSale} />
      </div>

      {/* 5. Recommended For You / Most Picked Rail */}
      <GroceryProductRail
        title="Recommended For You"
        subtitle="Daily handpicked essentials at the best supermarket prices"
        href="/products?featured=1"
        products={featured.length > 0 ? featured : heroProducts}
        badgeText="Most Picked"
      />

      {/* 6. Signature Shwapno Farm Fresh Vegetables & Produce Banner */}
      <GroceryVegetablesBanner />

      {/* 7. Daily Fresh Arrivals Rail */}
      <GroceryProductRail
        title="Daily Fresh Arrivals"
        subtitle="Freshly stocked groceries, dairy and pantry items"
        href="/products?new=1"
        products={fresh.length > 0 ? fresh : bestsellers}
        badgeText="Daily Fresh"
      />

      {/* 8. Fresh Meat, Deshi River Fish & Seafood Banner */}
      <GroceryMeatFishBanner />

      {/* 9. Bestselling Groceries Rail */}
      <GroceryProductRail
        title="Bestselling Supermarket Picks"
        subtitle="Most frequently ordered groceries by households"
        href="/products?bestseller=1"
        products={bestsellers.length > 0 ? bestsellers : featured}
        badgeText="Top Rated"
      />

      {/* 10. Shop by Trusted Brands Strip (if store has brands) */}
      {brands.length > 0 && (
        <section className="py-6 mt-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-4 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-stone-900">
                  Shop by Brand
                </h2>
              </div>
              <Link
                href="/brands"
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <span>All Brands</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {brands.slice(0, 12).map((brand) => (
                <li key={brand.id}>
                  <BrandTile brand={brand} className="h-20 bg-white border border-stone-200/80 rounded-xl hover:border-red-400 hover:shadow-xs transition-all" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 11. Floating Sticky Quick Bag Access Widget */}
      <FloatingCartWidget />
    </div>
  );
}
