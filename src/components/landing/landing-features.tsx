import {
  BarChart3,
  CreditCard,
  Globe2,
  Package,
  ShieldCheck,
  Smartphone,
  Tags,
  Truck,
  Zap,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: Truck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      title: "1-Click Courier Dispatch",
      description: "Direct API integration with Steadfast, Pathao & RedX. Generate consignments, print parcel shipping labels, and track delivery status automatically.",
    },
    {
      icon: CreditCard,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      title: "Native bKash & Nagad Payments",
      description: "Receive customer payments directly into your own merchant accounts with automated webhook verification and instant order confirmation.",
    },
    {
      icon: Globe2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Custom Domain (.com) Support",
      description: "Brand your store with your own custom domain (e.g. www.yourbrand.com). Free automated SSL certificate included for every shop.",
    },
    {
      icon: ShieldCheck,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      title: "Dedicated Tenant Database",
      description: "Unlike shared legacy platforms, each merchant receives isolated database storage. Your customer records, pricing, and sales data remain 100% private.",
    },
    {
      icon: Package,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      title: "Inventory & Variants Matrix",
      description: "Track inventory across sizes, colors, and weights. Automatic stock deduction on purchase, stock reservations, and out-of-stock guards.",
    },
    {
      icon: Tags,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      title: "Flash Sales & Marketing Coupons",
      description: "Run timed flash sales with live deadline countdown banners, percentage/flat discounts, first-order coupons, and customer group pricing.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-stone-900 border-t border-stone-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Powerful Platform Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Scale Online in Bangladesh
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            Engineered from scratch to solve real merchant pain points: no complex server setups, no manual order syncing, and zero coding required.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-stone-700 hover:bg-stone-950 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className={`size-12 rounded-xl flex items-center justify-center border ${item.color} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span>Included in platform</span>
                  <span>✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
