import { BadgePercent, CreditCard, ShieldCheck, Truck } from "lucide-react";

export function LandingPartners() {
  const paymentPartners = [
    { name: "bKash", type: "Mobile Banking", badge: "Instant Auto-Pay", color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
    { name: "Nagad", type: "Mobile Banking", badge: "Direct Merchant API", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
    { name: "Rocket", type: "DBBL", badge: "Automated Callback", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    { name: "Upay", type: "UCB FinTech", badge: "Secure Checkout", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    { name: "Visa & Mastercard", type: "Card Gateway", badge: "SSL Commerz Ready", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    { name: "Cash on Delivery", type: "COD Module", badge: "OTP Verification", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  ];

  const courierPartners = [
    { name: "Steadfast Courier", coverage: "64 Districts", speed: "24-48 Hours", perk: "1-Click Consignment" },
    { name: "Pathao Courier", coverage: "Nationwide Hubs", speed: "Express Delivery", perk: "Live Tracking API" },
    { name: "RedX Delivery", coverage: "Pan Bangladesh", speed: "Doorstep Pickup", perk: "Cash Collection" },
    { name: "Paperfly", coverage: "Upazila Level", speed: "Home Delivery", perk: "Return Management" },
  ];

  return (
    <section id="integrations" className="py-16 sm:py-20 bg-stone-900 border-y border-stone-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Ecosystem Integrations
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Built Specifically for Bangladeshi Commerce
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">
            No painful third-party plugins needed. Native integrations with all top Bangladeshi payment channels and couriers out of the box.
          </p>
        </div>

        {/* Payment Gateways Grid */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-stone-300 uppercase tracking-wider">
            <CreditCard className="size-4 text-emerald-400" />
            <span>Integrated Payment Gateways</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {paymentPartners.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between h-28 hover:scale-102 transition-transform`}
              >
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">{item.name}</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">{item.type}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-950/60 w-fit">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Courier & Delivery Integrations */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-stone-300 uppercase tracking-wider">
            <Truck className="size-4 text-amber-400" />
            <span>Automated Logistics &amp; Courier Networks</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courierPartners.map((courier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{courier.name}</h3>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      API Synced
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Coverage: <strong className="text-stone-200">{courier.coverage}</strong></p>
                  <p className="text-xs text-stone-400 mt-0.5">Speed: <strong className="text-stone-200">{courier.speed}</strong></p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{courier.perk}</span>
                  <span className="text-emerald-400 font-semibold">Instant ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
