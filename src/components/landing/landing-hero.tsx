import { ArrowRight, CheckCircle2, ChevronRight, ExternalLink, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-stone-950 text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background Lighting Gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[42rem] sm:size-[56rem] rounded-full bg-radial from-emerald-500/15 via-teal-600/5 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-40 size-[30rem] rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs text-stone-300 shadow-inner">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">BDBazz 2.0 Live</span>
            <span className="text-stone-500">•</span>
            <span className="text-emerald-400 font-medium">Next-Gen Multi-Tenant Platform</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mt-8 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Launch Your Online Store in{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Minutes, Not Months
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            The #1 multi-tenant e-commerce platform built for Bangladeshi businesses. 
            Sell nationwide with automated <strong className="text-white">bKash/Nagad</strong> payments, 
            instant <strong className="text-white">Steadfast &amp; Pathao</strong> courier dispatch, and ultra-fast themes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-sm px-8 py-4 rounded-xl shadow-xl hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="size-4 stroke-[2.5]" />
            </Link>

            <a
              href="https://demo.bdbazz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900/90 hover:bg-stone-800 text-white font-bold text-sm px-7 py-4 rounded-xl border border-stone-800 hover:border-stone-700 shadow-md transition-all group"
            >
              <span className="size-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
              <span>Explore Live Demo Store</span>
              <ExternalLink className="size-3.5 text-stone-400 group-hover:text-amber-400 transition-colors" />
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Connect custom domain (.com)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>0% Transaction commission</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup Showcase */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="relative rounded-2xl bg-gradient-to-b from-stone-800/80 to-stone-900/90 p-2 sm:p-3 ring-1 ring-white/10 shadow-2xl overflow-hidden">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 rounded-xl mb-2 text-xs text-stone-400 border border-stone-800/60">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-stone-500">https://yourbrand.bdbazz.com</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                <Zap className="size-3" />
                Next.js 16 • Turbopack Engine
              </span>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-stone-950 rounded-xl">
              {/* Card 1: Live Sales KPI */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Today&apos;s Store Revenue</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">+28.4%</span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">৳84,650</div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>34 Orders processed via bKash &amp; COD</span>
                </div>
              </div>

              {/* Card 2: Courier & Delivery Status */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Courier Auto-Dispatch</span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">Steadfast &amp; Pathao</span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">98.2%</div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  <span>1-Click consignment creation</span>
                </div>
              </div>

              {/* Card 3: Active Theme */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Active Theme Engine</span>
                  <span className="text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded text-[10px]">Instant Switch</span>
                </div>
                <div className="mt-2 text-xl font-black text-emerald-400">Shwapno Express</div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="size-1.5 rounded-full bg-teal-400" />
                  <span>High-density grocery &amp; supermarket</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="mt-2 py-3 px-4 bg-gradient-to-r from-emerald-950/40 via-stone-900 to-indigo-950/40 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400" />
                <span className="font-semibold text-white">Full-Featured Dokan Admin Included</span>
                <span className="text-stone-500 hidden sm:inline">|</span>
                <span className="text-stone-400 hidden sm:inline">Manage inventory, orders, coupons &amp; custom domains</span>
              </div>
              <a
                href="https://demo.bdbazz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Preview Storefront</span>
                <ChevronRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
