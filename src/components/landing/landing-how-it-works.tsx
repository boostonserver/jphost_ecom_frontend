import { ArrowRight, CheckCircle2, Rocket, ShoppingBag, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";

export function LandingHowItWorks() {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Register in 60 Seconds",
      description: "Pick your brand name, secure your free subdomain (e.g. yourstore.bdbazz.com), and get instant access to your Dokan Admin dashboard.",
    },
    {
      step: "02",
      icon: ShoppingBag,
      title: "Choose Theme & Add Products",
      description: "Activate your favorite storefront layout (Shwapno Express for groceries, Aesthetic Boutique for fashion) and upload your product catalog.",
    },
    {
      step: "03",
      icon: Rocket,
      title: "Connect bKash & Start Selling",
      description: "Link your bKash/Nagad merchant account and Steadfast/Pathao courier keys. Share your link and start processing orders nationwide!",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-stone-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Simple 3-Step Setup
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How BDBazz Works
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            No technical knowledge needed. Go from an idea to a fully operational e-commerce storefront in under 3 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-stone-900/60 border border-stone-800 p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-stone-700 group-hover:text-emerald-500/80 transition-colors">
                      {item.step}
                    </span>
                    <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Icon className="size-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-stone-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>Takes less than 1 minute</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center">
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs px-6 py-3 rounded-full border border-stone-700 transition-all"
          >
            <span>See Our Subscription Plans</span>
            <ArrowRight className="size-3.5 text-emerald-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
