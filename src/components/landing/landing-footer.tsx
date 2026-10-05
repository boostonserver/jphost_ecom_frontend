import { Mail, MapPin, Phone, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-black">
                <ShoppingBag className="size-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white">
                BD<span className="text-emerald-400">Bazz</span>
              </span>
            </Link>

            <p className="text-stone-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              The premier multi-tenant e-commerce SaaS platform engineered specifically for Bangladeshi retailers, supermarkets, and fashion brands.
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-emerald-400 shrink-0" />
                <span>Banani, Dhaka-1213, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-emerald-400 shrink-0" />
                <span>Hotline: +880 1700-000000 (9 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-emerald-400 shrink-0" />
                <span>Email: support@bdbazz.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="hover:text-emerald-400 transition-colors">
                  Core Features
                </Link>
              </li>
              <li>
                <Link href="#themes" className="hover:text-emerald-400 transition-colors">
                  Storefront Themes
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-emerald-400 transition-colors">
                  Couriers &amp; Payments
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-emerald-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <a href="https://demo.bdbazz.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                  Live Demo Store ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portals & Access */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Portals</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                  Dokan Admin Login
                </Link>
              </li>
              <li>
                <Link href="/super-admin/login" className="hover:text-emerald-400 transition-colors">
                  Super Admin Portal
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-emerald-400 transition-colors">
                  Register New Store
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-400 transition-colors">
                  Help Center &amp; FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Themes */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Store Themes</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-stone-300">Shwapno Express</span>
                <span className="text-[10px] text-red-400 ml-1.5 font-bold">Grocery</span>
              </li>
              <li>
                <span className="text-stone-300">Aesthetic Boutique</span>
                <span className="text-[10px] text-rose-400 ml-1.5 font-bold">Fashion</span>
              </li>
              <li>
                <span className="text-stone-300">Smart Tech</span>
                <span className="text-[10px] text-sky-400 ml-1.5 font-bold">Gadgets</span>
              </li>
              <li>
                <span className="text-stone-300">Modern Universal</span>
                <span className="text-[10px] text-emerald-400 ml-1.5 font-bold">Retail</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright Strip */}
        <div className="mt-14 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} BDBazz SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
