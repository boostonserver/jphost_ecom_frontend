"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { publicOnboardingApi, type PublicPackage } from "@/services/platform";
import { StoreOnboardingModal } from "./store-onboarding-modal";

interface LandingPricingProps {
  cmsPackages?: PublicPackage[];
}

function getPackageFeatures(features: Record<string, any> = {}): string[] {
  const list: string[] = [];

  if (features.products === null || features.products === undefined) {
    list.push("Unlimited Products & Categories");
  } else {
    list.push(`Up to ${features.products} Products`);
  }

  if (features.orders_month === null || features.orders_month === undefined) {
    list.push("Unlimited Orders per month");
  } else {
    list.push(`Up to ${features.orders_month} Orders/month`);
  }

  if (features.admin_users === null || features.admin_users === undefined) {
    list.push("Unlimited Staff & Admin Accounts");
  } else {
    list.push(`${features.admin_users} Staff & Admin Accounts`);
  }

  if (features.custom_domain) {
    list.push("Connect Custom Domain (.com / .bd)");
  } else {
    list.push("Free *.bdbazz.com Subdomain");
  }

  if (features.storage_mb) {
    const gb = Math.round((features.storage_mb / 1024) * 10) / 10;
    list.push(gb >= 1 ? `${gb}GB Fast Cloud Storage` : `${features.storage_mb}MB Fast Cloud Storage`);
  }

  if (features.abandoned_cart) {
    list.push("Abandoned Cart Recovery Engine");
  }

  if (features.advanced_reports) {
    list.push("Advanced Analytics & Financial Reports");
  }

  if (features.api_access) {
    list.push("API Access & Webhook Integrations");
  }

  // Standard Bangladesh SaaS platform benefits
  list.push("bKash & Nagad (QR & Manual MFS)");
  list.push("Steadfast & Pathao 1-Click Dispatch");
  list.push("0% Order Transaction Commission");

  return list;
}

export function LandingPricing({ cmsPackages }: LandingPricingProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [packages, setPackages] = useState<PublicPackage[]>(cmsPackages || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (cmsPackages && cmsPackages.length > 0) {
      setPackages(cmsPackages);
    } else {
      publicOnboardingApi
        .getPackages()
        .then((res) => {
          if (res.items && res.items.length > 0) {
            setPackages(res.items);
          }
        })
        .catch(() => {});
    }
  }, [cmsPackages]);

  const displayPlans =
    packages && packages.length > 0
      ? packages.map((pkg) => {
          const mPrice = parseFloat(pkg.price);
          const yPrice = mPrice * 10;
          const isPopular =
            pkg.slug.toLowerCase().includes("growth") ||
            pkg.name.toLowerCase().includes("growth");

          return {
            packageId: pkg.id,
            slug: pkg.slug,
            name: pkg.name,
            tagline:
              pkg.description ||
              "Designed for high-growth online merchants in Bangladesh.",
            monthlyPrice: mPrice.toLocaleString(),
            yearlyPrice: yPrice.toLocaleString(),
            isPopular,
            trialDays: pkg.trial_days,
            buttonText:
              pkg.trial_days > 0
                ? `Start ${pkg.trial_days}-Day Free Trial`
                : `Start ${pkg.name} Plan`,
            features: getPackageFeatures(pkg.features),
          };
        })
      : [
          {
            packageId: 1,
            slug: "starter",
            name: "Starter Store",
            tagline: "For a new shop finding its first customers.",
            monthlyPrice: "1,500",
            yearlyPrice: "15,000",
            isPopular: false,
            trialDays: 14,
            buttonText: "Start 14-Day Free Trial",
            features: [
              "Up to 100 Products",
              "Up to 500 Orders/month",
              "3 Staff & Admin Accounts",
              "Free *.bdbazz.com Subdomain",
              "512MB Fast Cloud Storage",
              "bKash & Nagad (QR & Manual MFS)",
              "0% Transaction Commission",
            ],
          },
          {
            packageId: 2,
            slug: "growth",
            name: "Growth Business",
            tagline: "For a shop with steady orders and a small team.",
            monthlyPrice: "4,500",
            yearlyPrice: "45,000",
            isPopular: true,
            trialDays: 14,
            buttonText: "Start 14-Day Free Trial",
            features: [
              "Up to 1,000 Products",
              "Up to 5,000 Orders/month",
              "10 Staff & Admin Accounts",
              "Connect Custom Domain (.com / .bd)",
              "5GB Fast Cloud Storage",
              "Steadfast & Pathao 1-Click Dispatch",
              "Abandoned Cart Recovery Engine",
              "Advanced Analytics & Reports",
              "0% Transaction Commission",
            ],
          },
          {
            packageId: 3,
            slug: "business",
            name: "Business Enterprise",
            tagline: "For an established retailer running at scale.",
            monthlyPrice: "12,000",
            yearlyPrice: "120,000",
            isPopular: false,
            trialDays: 0,
            buttonText: "Launch Enterprise Store",
            features: [
              "Unlimited Products & Categories",
              "Unlimited Orders per month",
              "50 Staff & Admin Accounts",
              "Connect Custom Domain (.com / .bd)",
              "50GB Fast Cloud Storage",
              "Multi-Branch & Multi-Warehouse Tracking",
              "API Access & Webhook Integrations",
              "Dedicated Account Manager in Dhaka",
              "0% Transaction Commission",
            ],
          },
        ];

  const handleOpenOnboarding = (pkgId: number) => {
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
          {displayPlans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? "/year" : "/month";

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
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-xs text-stone-400 leading-relaxed min-h-[2.5rem]">
                    {plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">৳{price}</span>
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
                    onClick={() => handleOpenOnboarding(plan.packageId)}
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
