"use client";

import { ArrowRight, Globe, Menu, ShieldCheck, ShoppingBag, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white text-xs py-2 px-4 text-center font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            Limited Offer
          </span>
          <span>
            Start your online store today with <strong>14-Day Free Trial</strong> • No Credit Card Required!
          </span>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-emerald-100 transition-colors ml-1"
          >
            <span>See Plans</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Main Glassmorphic Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-950/85 border-b border-stone-800 text-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 shadow-md group-hover:scale-105 transition-transform">
              <ShoppingBag className="size-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  BD<span className="text-emerald-400">Bazz</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  SaaS
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium tracking-wide">
                E-Commerce Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-stone-300">
            <Link href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </Link>
            <Link href="#themes" className="hover:text-emerald-400 transition-colors">
              Themes
            </Link>
            <Link href="#integrations" className="hover:text-emerald-400 transition-colors">
              Couriers &amp; Payments
            </Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="hover:text-emerald-400 transition-colors">
              Pricing Plans
            </Link>
            <Link href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live Demo Store Link */}
            <a
              href="https://demo.bdbazz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-2 rounded-lg transition-all"
            >
              <Globe className="size-3.5" />
              <span>Live Demo Store</span>
            </a>

            {/* Merchant Login */}
            <Link
              href="/admin/login"
              className="text-xs font-bold text-stone-300 hover:text-white px-3 py-2 rounded-lg hover:bg-stone-800 transition-all"
            >
              Store Login
            </Link>

            {/* Primary Action Button */}
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Slideout Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-stone-950 border-b border-stone-800 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-stone-300">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#themes"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                Themes
              </Link>
              <Link
                href="#integrations"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                Couriers &amp; Payments
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                Pricing Plans
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-400 py-1 transition-colors"
              >
                FAQ
              </Link>
            </nav>

            <div className="pt-4 border-t border-stone-800 flex flex-col gap-3">
              <a
                href="https://demo.bdbazz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 font-bold text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg"
              >
                Explore Live Demo Store ↗
              </a>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin/login"
                  className="text-center py-2 text-xs font-bold text-stone-300 bg-stone-900 border border-stone-800 rounded-lg hover:text-white"
                >
                  Store Login
                </Link>
                <Link
                  href="/super-admin/login"
                  className="text-center py-2 text-xs font-bold text-stone-300 bg-stone-900 border border-stone-800 rounded-lg hover:text-white"
                >
                  Super Admin
                </Link>
              </div>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 font-extrabold text-xs text-stone-950 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md"
              >
                Start Free Trial 🚀
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
