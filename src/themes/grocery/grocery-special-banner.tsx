import { Apple, ArrowRight, Fish, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function GroceryVegetablesBanner() {
  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-700 text-white p-6 sm:p-8 shadow-md border border-emerald-700/60">
          {/* Subtle background glow effect */}
          <div
            aria-hidden
            className="absolute -right-16 -top-16 size-64 bg-green-400/20 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
                <Apple className="size-3.5 text-emerald-400" />
                <span>100% Farm Fresh &amp; Direct</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Daily Fresh Vegetables &amp; Fruits
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Handpicked crisp local produce straight from trusted farmers. Cleaned, sorted and delivered to your doorstep within 60–120 minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="size-4 text-emerald-700" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GroceryMeatFishBanner() {
  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 text-white p-6 sm:p-8 shadow-md border border-red-900/60">
          {/* Subtle background glow effect */}
          <div
            aria-hidden
            className="absolute -right-16 -bottom-16 size-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-red-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
                <ShieldCheck className="size-3.5 text-amber-400" />
                <span>100% Halal Guaranteed</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Fresh Meat, Deshi Fish &amp; Poultry
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                Premium beef, mutton, dressed chicken and authentic Padma river fishes. Hygienically vacuum packed and temperature-controlled.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
              >
                <span>Explore Meat &amp; Fish</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
