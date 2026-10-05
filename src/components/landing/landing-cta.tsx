import { ArrowRight, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export function LandingCta() {
  return (
    <section className="py-20 bg-stone-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 border border-emerald-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 size-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
          />

          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 border border-emerald-500/40 px-3.5 py-1 rounded-full mb-4">
            <Sparkles className="size-3.5" />
            <span>Ready to Grow?</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Build Your Dream Online Store in Bangladesh Today
          </h2>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Join hundreds of forward-thinking merchants. Experience automated bKash payments, 1-click Steadfast courier dispatch, and zero transaction commissions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-stone-950 font-black text-sm px-8 py-4 rounded-xl shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="size-4" />
            </Link>

            <a
              href="https://demo.bdbazz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-white font-bold text-sm px-7 py-4 rounded-xl border border-stone-700 transition-all"
            >
              <span>Explore Live Demo Store</span>
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80">
            <span>✓ No credit card required</span>
            <span>✓ Instant store provisioning</span>
            <span>✓ 24/7 Priority support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
