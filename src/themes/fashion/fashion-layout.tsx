import { ChevronRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { BrandTile } from "@/components/catalog/brand-tile";
import { FlashSaleBand } from "@/components/store/flash-sale-band";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import type { ThemeHomeProps } from "@/themes/registry";
import type { Product } from "@/services/catalog";

export function FashionThemeLayout(props: ThemeHomeProps) {
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

  if (!hasAnything) {
    return <>{defaultLayout}</>;
  }

  const primaryHero = heroProducts[0] || featured[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 pb-20 selection:bg-amber-900 selection:text-amber-50">
      {/* 1. Editorial Fashion Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f3ece3] to-[#faf8f5] py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold tracking-wider uppercase border border-amber-300/40">
                <Sparkles className="size-3.5 text-amber-700" />
                <span>Editorial Lookbook 2026</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-stone-900 leading-[1.1]">
                Effortless Elegance <br />
                <span className="italic font-light text-stone-700">&amp; Modern Poise.</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-light">
                Discover bespoke silhouettes crafted from pure muslin, linen and cashmere fabrics, designed to transcend seasons.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/products?featured=1"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-none bg-primary text-primary-foreground font-medium text-xs uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Shop the Runway
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-none border border-stone-400 text-stone-800 font-medium text-xs uppercase tracking-widest hover:bg-white transition-colors"
                >
                  View Lookbook
                </Link>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-stone-200 border-4 border-white">
                {primaryHero?.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryHero.primary_image.url}
                    alt={primaryHero.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-300/60 text-stone-600 p-8 text-center">
                    <span className="font-serif italic text-2xl mb-2">{storeName}</span>
                    <span className="text-xs uppercase tracking-widest">Haute Couture Drop</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Lookbook Grid */}
      {categories.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
              Department Curations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900">
              Browse by Collection
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shadow-xs transition-all hover:shadow-md"
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center p-4">
                    <span className="font-serif text-lg text-stone-600 group-hover:text-stone-900">
                      {cat.name}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs tracking-widest uppercase text-amber-300 font-semibold mb-1">
                    Collection
                  </span>
                  <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Timed Flash Sale (if running) */}
      <div className="max-w-7xl mx-auto px-4 my-6">
        <FlashSaleBand sale={flashSale} />
      </div>

      {/* 5. Runway Selected Fashion Rail */}
      <FashionProductRail
        title="Runway Highlights"
        subtitle="The standout silhouettes defined by international editors this season"
        href="/products?featured=1"
        products={featured.length > 0 ? featured : heroProducts}
      />

      {/* 6. New Arrivals Fashion Rail */}
      <FashionProductRail
        title="Freshly Tailored Arrivals"
        subtitle="Newly arrived designer pieces ready for immediate complimentary delivery"
        href="/products?new=1"
        products={fresh.length > 0 ? fresh : bestsellers}
      />

      {/* 7. Brands Strip */}
      {brands.length > 0 && (
        <section className="py-12 bg-white border-y border-stone-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-6 block">
              Featured Designer Labels
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {brands.slice(0, 6).map((brand) => (
                <BrandTile key={brand.id} brand={brand} className="bg-stone-50 border border-stone-200" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FashionProductRail({
  title,
  subtitle,
  href,
  products,
}: {
  title: string;
  subtitle: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">{title}</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="text-xs font-bold uppercase tracking-widest text-stone-900 hover:text-amber-800 flex items-center gap-1.5"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="group flex flex-col justify-between bg-white rounded-xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all"
          >
            <div>
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                {product.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.primary_image.thumb_url || product.primary_image.url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif italic">
                    Fashion Boutique
                  </div>
                )}
                {product.price_range?.is_discounted && (
                  <span className="absolute top-3 left-3 bg-stone-900 text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                    Sale
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-serif text-base font-semibold text-stone-900 hover:text-amber-800 line-clamp-1"
                >
                  {product.name}
                </Link>

                {/* Color Swatch Dots Mockup */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="size-3 rounded-full bg-stone-900 border border-white ring-1 ring-stone-300" />
                  <span className="size-3 rounded-full bg-stone-400 border border-white" />
                  <span className="size-3 rounded-full bg-amber-700 border border-white" />
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="font-serif text-lg font-bold text-stone-900">
                    ৳ {product.price_range?.min || "1,200"}
                  </span>
                  {product.price_range?.is_discounted && (
                    <span className="text-xs text-stone-400 line-through">
                      ৳ {product.price_range?.base_min}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                href={`/products/${product.slug}`}
                className="block w-full py-2.5 text-center bg-stone-100 hover:bg-primary hover:text-primary-foreground text-stone-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Select Options
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
