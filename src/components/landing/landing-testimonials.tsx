import { Star } from "lucide-react";

export function LandingTestimonials() {
  const reviews = [
    {
      name: "Tanvir Ahmed",
      role: "Founder, Green Grocers BD",
      location: "Gulshan, Dhaka",
      theme: "Shwapno Express Theme",
      quote: "Before BDBazz, handling hundreds of grocery orders on WhatsApp was pure chaos. The Shwapno Express theme gave us instant Add to Bag and 60-min delivery strips. Our daily sales jumped 3X within 30 days!",
      rating: 5,
    },
    {
      name: "Nusrat Jahan",
      role: "Owner, Mayuri Boutique",
      location: "Dhanmondi, Dhaka",
      theme: "Aesthetic Boutique Theme",
      quote: "Setting up bKash automated payments and Steadfast courier was effortless. I used to spend 4 hours every night handwriting courier slips. Now 1 click generates shipping labels automatically.",
      rating: 5,
    },
    {
      name: "Mahfuzur Rahman",
      role: "Managing Director, TechPoint Electronics",
      location: "Agrabad, Chattogram",
      theme: "Smart Tech Theme",
      quote: "Connecting our own .com domain and getting a dedicated database for our store gives us enterprise confidence. Zero commission on orders means we keep 100% of our hard-earned profit.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-stone-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Merchant Success
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Bangladeshi Brands
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            See how merchants across Dhaka, Chattogram, and nationwide are growing with BDBazz.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-stone-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{rev.name}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">{rev.role} • {rev.location}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {rev.theme}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
