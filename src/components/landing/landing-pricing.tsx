"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { publicOnboardingApi, type PublicPackage } from "@/services/platform";
import { StoreOnboardingModal } from "./store-onboarding-modal";

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    publicOnboardingApi
      .getPackages()
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setPackages(res.items);
        }
      })
      .catch(() => {});
  }, []);

  const defaultPlans = [
    {
      slug: "starter",
      name: "Starter Store",
      tagline: "Perfect for new online sellers & boutique shops.",
      monthlyPrice: "1,500",
      yearlyPrice: "15,000",
      isPopular: false,
      buttonText: "Start 14-Day Free Trial",
      features: [
        "Up to 300 Products",
        "Free *.bdbazz.com Subdomain",
        "Modern Store Theme included",
        "bKash & Nagad (Manual & QR)",
        "Standard COD & Order Management",
        "Basic Analytics & Invoices",
        "Email & Chat Support",
      ],
    },
    {
      slug: "growth",
      name: "Growth Business",
      tagline: "Best for growing brands & high-volume merchants.",
      monthlyPrice: "4,500",
      yearlyPrice: "45,000",
      isPopular: true,
      buttonText: "Start 14-Day Free Trial",
      features: [
        "Unlimited Products & Categories",
        "Connect Custom Domain (yourbrand.com)",
        "All Themes (Shwapno Express, Fashion, Tech)",
        "Direct bKash & Nagad Merchant API",
        "Steadfast & Pathao 1-Click Dispatch",
        "Flash Sales & Countdown Discount Timers",
        "Customer Tagging & Segmented Coupons",
        "Priority WhatsApp & Phone Helpline",
        "0% Transaction Commission",
      ],
    },
    {
      slug: "business",
      name: "Business Enterprise",
      tagline: "For supermarkets, retail chains & large teams.",
      monthlyPrice: "12,000",
      yearlyPrice: "120,000",
      isPopular: false,
      buttonText: "Launch Enterprise Store",
      features: [
        "Everything in Growth Business",
        "Unlimited Staff Accounts & Custom RBAC",
        "Custom Storefront Layout Requests",
        "Multi-Branch & Multi-Warehouse Tracking",
        "Dedicated Account Manager in Dhaka",
        "Guaranteed 99.9% Server SLA",
        "Custom API Webhook Exports",
      ],
    },
  ];

  const handleOpenOnboarding = (pkgId: number | null) => {
    setSelectedPlanId(pkgId);
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="py-20 bg-stone-900 border-t border-stone-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Simple, Transparent Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plans That Scale With Your Business
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            No hidden setup fees. No surprise charges. 14 days free trial on all plans.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!isYearly ? "text-white" : "text-stone-400"}`}>
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-stone-800 transition-colors duration-200 ease-in-out focus:outline-hidden"
              role="switch"
              aria-checked={isYearly}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-emerald-400 shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isYearly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isYearly ? "text-white" : "text-stone-400"}`}>
              <span>Yearly Billing</span>
              <span className="text-[10px] font-bold uppercase bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full">
                2 Months Free
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {defaultPlans.map((plan, index) => {
            // Match with database package if loaded
            const dbPkg = packages.find(
              (p) => p.slug.toLowerCase() === plan.slug || p.id === index + 1
            );

            const mPriceNum = dbPkg ? parseFloat(dbPkg.price) : parseFloat(plan.monthlyPrice.replace(/,/g, ""));
            const yPriceNum = mPriceNum * 10;

            const priceDisplay = isYearly ? yPriceNum.toLocaleString() : mPriceNum.toLocaleString();
            const period = isYearly ? "/year" : "/month";
            const targetPkgId = dbPkg ? dbPkg.id : index + 1;

            return (
              <div
                key={plan.slug}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 lg:-translate-y-2"
                    : "bg-stone-950/80 border border-stone-800 hover:border-stone-700"
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      <Sparkles className="size-3.5" />
                      Most Popular Plan
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {dbPkg?.name || plan.name}
                  </h3>
                  <p className="mt-2 text-xs text-stone-400 leading-relaxed min-h-[2.5rem]">
                    {dbPkg?.description || plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">৳{priceDisplay}</span>
                    <span className="text-xs text-stone-400">{period}</span>
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone-800 space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-stone-300">
                        <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleOpenOnboarding(targetPkgId)}
                    className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 hover:shadow-emerald-500/25 active:scale-95"
                        : "bg-stone-800 hover:bg-stone-700 text-white hover:text-white active:scale-95"
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Store Onboarding Modal */}
      <StoreOnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedPlanId={selectedPlanId}
        preselectedBillingCycle={isYearly ? "yearly" : "monthly"}
      />
    </section>
  );
}
