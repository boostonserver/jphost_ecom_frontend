import { CreditCard, Headphones, ShieldCheck, Zap } from "lucide-react";

export function GroceryTrustBadges() {
  const badges = [
    {
      icon: Zap,
      title: "60 Mins Delivery",
      subtitle: "Free shipping over ৳1500",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      subtitle: "Fresh & genuine quality guarantee",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      subtitle: "8:00 AM to 10:00 PM helpline",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      subtitle: "Cash on delivery, bKash, Cards",
    },
  ];

  return (
    <div className="bg-white border-y border-stone-200/80 py-5 my-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-50/70 border border-stone-100 hover:border-red-200 transition-colors"
              >
                <div className="size-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight truncate">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate leading-tight">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
