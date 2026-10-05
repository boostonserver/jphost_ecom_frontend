"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  Globe,
  LayoutDashboard,
  Package,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Sliders,
  Store,
  Users,
} from "lucide-react";
import {
  PlatformAuthProvider,
  RequirePlatformAuth,
  usePlatformAuth,
} from "@/components/platform/platform-auth-provider";
import { cn } from "@/lib/utils";
import { canPlatform } from "@/services/platform";

interface NavItem {
  href: string;
  label: string;
  ability: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        href: "/super-admin",
        label: "Dashboard",
        ability: "platform.dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Stores & Merchants",
    items: [
      {
        href: "/super-admin/tenants",
        label: "All Stores",
        ability: "tenant.view",
        icon: Store,
      },
      {
        href: "/super-admin/tenants/new",
        label: "Add New Store",
        ability: "tenant.create",
        icon: PlusCircle,
      },
    ],
  },
  {
    group: "Billing & Plans",
    items: [
      {
        href: "/super-admin/packages",
        label: "Packages & Pricing",
        ability: "package.view",
        icon: Package,
      },
      {
        href: "/super-admin/invoices",
        label: "Invoices & Billing",
        ability: "invoice.view",
        icon: Receipt,
      },
      {
        href: "/super-admin/settings",
        label: "Billing Rules & Settings",
        ability: "invoice.manage",
        icon: Sliders,
      },
    ],
  },
  {
    group: "Platform Website",
    items: [
      {
        href: "/super-admin/landing",
        label: "Website CMS",
        ability: "platform.dashboard",
        icon: Globe,
      },
    ],
  },
  {
    group: "System & Security",
    items: [
      {
        href: "/super-admin/users",
        label: "Staff & Roles",
        ability: "platform_user.manage",
        icon: Users,
      },
      {
        href: "/super-admin/audit-logs",
        label: "Audit Logs",
        ability: "audit.view",
        icon: ShieldCheck,
      },
    ],
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformAuthProvider>
      <RequirePlatformAuth>
        <Shell>{children}</Shell>
      </RequirePlatformAuth>
    </PlatformAuthProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = usePlatformAuth();

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Grouped Sidebar */}
      <aside className="bg-card w-64 shrink-0 border-r flex flex-col justify-between">
        <div className="p-4 space-y-6">
          {/* Brand & Portal Header */}
          <div className="space-y-1 pb-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                SaaS Central
              </span>
              <a
                href="https://bdbazz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="View live SaaS site"
              >
                <span>bdbazz.com</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5 pt-1">
              <span>BDBazz</span>
              <span className="text-xs font-normal text-muted-foreground">Super Admin</span>
            </h2>
          </div>

          {/* Grouped Nav */}
          <nav className="space-y-5">
            {NAV_GROUPS.map((grp) => {
              const visibleItems = grp.items.filter((item) => canPlatform(user, item.ability));
              if (visibleItems.length === 0) return null;

              return (
                <div key={grp.group} className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2.5 mb-1.5">
                    {grp.group}
                  </p>

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.href === "/super-admin"
                          ? pathname === item.href
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                            active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <Icon className={cn("size-4 shrink-0", active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer in Sidebar */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {user?.role.replace("_", " ")}
              </p>
            </div>
            <button
              onClick={async () => {
                await logout();
                router.push("/super-admin/login");
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b bg-card px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>SaaS Platform Control Panel</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Production Live</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/super-admin/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              My Profile
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push("/super-admin/login");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
