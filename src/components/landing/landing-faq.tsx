"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I connect my own custom domain (e.g. www.mybrand.com)?",
      a: "Yes, absolutely! Every store gets a free yourbrand.bdbazz.com subdomain instantly. You can easily point your own custom domain (.com, .com.bd, .net, etc.) to your BDBazz store from your Dokan Admin with free automated SSL encryption.",
    },
    {
      q: "How do customer payments through bKash & Nagad work?",
      a: "BDBazz natively supports automated bKash and Nagad merchant APIs as well as manual send-money/QR code payment methods. When customers pay via bKash, the system automatically verifies the transaction and confirms the order with zero manual intervention.",
    },
    {
      q: "How does Steadfast and Pathao courier dispatch work?",
      a: "Simply input your Steadfast or Pathao API keys in your settings. Inside your order manager, clicking 'Dispatch with Courier' automatically generates the consignment, prints shipping labels with barcodes, and tracks parcel delivery status across all 64 districts in Bangladesh.",
    },
    {
      q: "Do I need coding or technical skills to run my store?",
      a: "Zero coding is required! You get a full-featured Dokan Admin panel to add products, upload photos, set prices, and manage discounts. Everything is visual, mobile-friendly, and designed for fast operation.",
    },
    {
      q: "Can I switch storefront themes between Grocery, Fashion, and Tech anytime?",
      a: "Yes! You can switch your store's active theme in 1-click from your Dokan Admin panel. All your products, images, and categories will instantly re-render in the new theme layout without losing any data.",
    },
    {
      q: "Does BDBazz charge any commission on my sales?",
      a: "No! BDBazz charges 0% transaction commission on all plans. All the money you earn from your customers goes 100% directly into your own bank or mobile banking accounts.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-stone-900 border-t border-stone-800 text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            Everything you need to know about setting up and running your online shop with BDBazz.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-stone-950 border border-stone-800/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-stone-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-stone-800/60 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
