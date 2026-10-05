import { Check, ExternalLink, Eye, Layout, Palette, ShoppingBag, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export function LandingThemes() {
  const themes = [
    {
      id: "grocery",
      name: "Shwapno Express",
      category: "Grocery & Supermarket",
      description: "Modeled directly on Shwapno. High-density product cards, 1-click 'Add to Bag', delivery timer strips, and floating cart drawer.",
      badge: "Most Popular in BD",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      accentColor: "border-red-600/40 hover:border-red-500",
      features: ["1-Click Direct Add to Bag", "Shwapno Red & Amber Palette", "Category Tree Sidebar", "Per-kg & Per-unit pricing"],
      demoUrl: "https://demo.bdbazz.com",
    },
    {
      id: "fashion",
      name: "Aesthetic Boutique",
      category: "Fashion & Lifestyle",
      description: "Large lifestyle photography, aesthetic typography, variant color swatches, and size guides tailored for apparel and luxury items.",
      badge: "High Converting",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accentColor: "border-rose-600/40 hover:border-rose-500",
      features: ["Color Swatch Indicators", "Lookbook & Mood Banners", "Size Pill Selector", "Mobile Sticky Buy Bar"],
      demoUrl: "https://demo.bdbazz.com",
    },
    {
      id: "electronics",
      name: "Smart Tech & Gadgets",
      category: "Electronics & Gadgets",
      description: "High-spec comparison badges (RAM, Storage, Official Warranty), brand highlights carousel, and technical attribute filters.",
      badge: "Spec Heavy",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      accentColor: "border-sky-600/40 hover:border-sky-500",
      features: ["Technical Specs Comparison", "Official Warranty Badges", "Brand-Centric Filters", "EMI & Installment Badges"],
      demoUrl: "https://demo.bdbazz.com",
    },
    {
      id: "default",
      name: "Modern Store (Universal)",
      category: "General Retail & Multi-Vendor",
      description: "Clean, ultra-balanced layout designed for general retail stores, book shops, cosmetics, or multi-category departmental shops.",
      badge: "Default System",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accentColor: "border-emerald-600/40 hover:border-emerald-500",
      features: ["Dynamic Flash Sale Countdown", "Featured & Bestseller Rails", "Brand Showcase Strip", "Zero Cumulative Layout Shift"],
      demoUrl: "https://demo.bdbazz.com",
    },
  ];

  return (
    <section id="themes" className="py-20 bg-stone-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Zero-Code Storefront Themes
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            World-Class Themes Built for High Conversion
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            Switch themes in 1-click from your dashboard. Every theme is WCAG AA compliant, mobile-first, and optimized for sub-second page loads.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`rounded-2xl bg-stone-900/90 border ${theme.accentColor} p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.badgeColor}`}>
                    {theme.badge}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                    <Palette className="size-3.5 text-stone-500" />
                    {theme.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {theme.name}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {theme.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-stone-800 pt-5">
                  {theme.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-stone-300">
                      <Check className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
                <span className="text-xs text-stone-500 font-medium">
                  Included in all plans
                </span>

                <a
                  href={theme.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-stone-800 hover:bg-emerald-600 px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Eye className="size-3.5" />
                  <span>Preview Live Demo</span>
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
