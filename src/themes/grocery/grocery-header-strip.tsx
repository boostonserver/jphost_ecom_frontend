import { Clock, MapPin, PhoneCall, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";

export function GroceryHeaderStrip({ storeName }: { storeName: string }) {
  return (
    <div className="bg-primary text-primary-foreground text-xs border-b border-primary-hover transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Location & Delivery notice */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium bg-black/20 px-2.5 py-1 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
            <MapPin className="size-3.5 text-amber-300 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              Delivery location: <strong className="font-semibold text-white">Dhaka &amp; Nationwide</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-primary-foreground/90">
            <Clock className="size-3.5 text-amber-300" />
            <span>Fast Express Delivery in 60-120 Mins</span>
          </div>
        </div>

        {/* Right: Quick actions, App, Helpline */}
        <div className="flex items-center gap-4 text-primary-foreground/90 font-medium">
          <div className="hidden sm:flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <Smartphone className="size-3.5 text-amber-300" />
            <span>Express App</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <PhoneCall className="size-3.5 text-amber-300" />
            <span>Helpline: <strong className="text-white">16469</strong></span>
          </div>
          <Link
            href="/orders/track"
            className="hidden lg:inline-block hover:text-white underline underline-offset-2"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
