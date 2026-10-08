import { ChevronRight, Cpu, HardDrive, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { BrandTile } from "@/components/catalog/brand-tile";
import { FlashSaleBand } from "@/components/store/flash-sale-band";
import type { ThemeHomeProps } from "@/themes/registry";
import type { Product } from "@/services/catalog";

export function ElectronicsThemeLayout(props: ThemeHomeProps) {
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

  const allAvailable = [...heroProducts, ...featured, ...bestsellers, ...fresh];
  const primaryHero =
    allAvailable.find((p) => {
      const name = p.name.toLowerCase();
      const cat =
        p.categories?.map((c) => c.name.toLowerCase() + " " + c.slug.toLowerCase()).join(" ") ?? "";
      return (
        cat.includes("electron") ||
        cat.includes("gadget") ||
        cat.includes("phone") ||
        cat.includes("tech") ||
        cat.includes("audio") ||
        name.includes("galaxy") ||
        name.includes("iphone") ||
        name.includes("laptop") ||
        name.includes("watch") ||
        name.includes("headphone") ||
        name.includes("earbuds") ||
        name.includes("camera")
      );
    }) ||
    heroProducts[0] ||
    featured[0];

  return (
    <div className="bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* 1. Cyber Tech Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b0f19] to-[#030712] py-16 sm:py-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-bold tracking-wider uppercase border border-cyan-500/30">
                <Zap className="size-3.5 text-cyan-400" />
                <span>Next-Gen Performance 2026</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Peak Innovation. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Unleashed Processing.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                Discover flagship smartphones, creator laptops, and pro audio engineered for uncompromising speed and reliability.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/products?featured=1"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all"
                >
                  Explore Tech
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
                >
                  Browse Hardware
                </Link>
              </div>
            </div>

            {/* Hero Showcase Display */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700/60 p-4 flex items-center justify-center">
                {primaryHero?.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryHero.primary_image.url}
                    alt={primaryHero.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-2 p-6">
                    <Cpu className="size-16 text-cyan-400 mx-auto animate-pulse" />
                    <span className="block text-xl font-bold text-white">{storeName}</span>
                    <span className="text-xs text-slate-400">Authorized Tech Hub</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Tech Assurance Trust Highlights */}
      <section className="border-b border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <ShieldCheck className="size-6 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">100% Brand Warranty</span>
              <span className="text-slate-400">Official distributor support</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <Zap className="size-6 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Superfast Tech Dispatch</span>
              <span className="text-slate-400">Same-day delivery inside Dhaka</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
            <Cpu className="size-6 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Verified Authentic Specs</span>
              <span className="text-slate-400">Zero duplicate hardware guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Badges Grid */}
      {categories.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-6 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                Hardware &amp; Gadgets Categories
              </h2>
            </div>
            <Link href="/categories" className="text-xs font-semibold text-cyan-400 hover:underline">
              All Departments →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center gap-3"
              >
                <div className="size-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 truncate block">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block">View devices</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Timed Flash Sale */}
      <div className="max-w-7xl mx-auto px-4 my-6">
        <FlashSaleBand sale={flashSale} />
      </div>

      {/* 6. Featured Tech Rail */}
      <TechProductRail
        title="Featured Tech &amp; Flagships"
        subtitle="Editor-tested smart gadgets with high customer ratings"
        href="/products?featured=1"
        products={featured.length > 0 ? featured : heroProducts}
      />

      {/* 7. New Arrivals Hardware Rail */}
      <TechProductRail
        title="Newly Stocked Hardware"
        subtitle="Latest models just unboxed from authorized importers"
        href="/products?new=1"
        products={fresh.length > 0 ? fresh : bestsellers}
      />

      {/* 8. Brands Carousel */}
      {brands.length > 0 && (
        <section className="py-12 bg-slate-950/80 border-t border-slate-800/80 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 block">
              Official Brand Partners
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {brands.slice(0, 6).map((brand) => (
                <BrandTile key={brand.id} brand={brand} className="bg-slate-900 border-slate-800 hover:border-cyan-500/40" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function TechProductRail({
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
    <section className="py-10 max-w-7xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>View Catalog</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="group flex flex-col justify-between bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xs"
          >
            <div>
              <div className="relative aspect-square bg-slate-950 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
                {product.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.primary_image.thumb_url || product.primary_image.url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-slate-600 text-[10px] sm:text-xs">Electronics Pro</div>
                )}
                <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-slate-800/90 text-cyan-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded border border-cyan-500/20">
                  Official
                </span>
              </div>

              <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-400 line-clamp-1 block"
                >
                  {product.name}
                </Link>

                {/* Tech Spec Pill Badges */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                  <span className="text-[9px] sm:text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 sm:px-2 py-0.5 rounded border border-slate-700">
                    Warranty
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-1.5 sm:px-2 py-0.5 rounded border border-cyan-800/40">
                    Fast Ship
                  </span>
                </div>

                <div className="pt-1 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-cyan-400 font-mono">
                    ৳ {product.price_range?.min || "2,500"}
                  </span>
                  {product.price_range?.is_discounted && (
                    <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono">
                      ৳ {product.price_range?.base_min}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 pt-0">
              <Link
                href={`/products/${product.slug}`}
                className="block w-full py-2 sm:py-2.5 text-center bg-primary hover:bg-primary-hover text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
              >
                View Specs
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
