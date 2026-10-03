"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { SubscriptionBanner } from "@/components/billing/subscription-banner";
import { ImpersonationBanner } from "@/components/platform/impersonation-banner";
import { RequireAuth } from "@/components/auth/require-auth";
import { currentTenant, tenantDisplayName } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { can } from "@/types/auth";

type NavLeaf = { href: string; label: string; permission: string | null };
type NavGroup = { label: string; children: NavLeaf[] };
type NavItem = NavLeaf | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", permission: null },
  {
    label: "Products",
    children: [
      { href: "/admin/products", label: "All Products", permission: "product.view" },
      { href: "/admin/categories", label: "Categories", permission: "category.view" },
      { href: "/admin/brands", label: "Brands", permission: "brand.view" },
      { href: "/admin/attributes", label: "Attributes", permission: "product.view" },
    ],
  },
  {
    label: "Sales",
    children: [
      { href: "/admin/coupons", label: "Coupons", permission: "coupon.view" },
      { href: "/admin/price-rules", label: "Price rules", permission: "price.view" },
    ],
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    permission: "inventory.view",
  },
  {
    label: "Orders",
    children: [
      { href: "/admin/orders", label: "Orders", permission: "order.view" },
      { href: "/admin/shipments", label: "Shipments", permission: "shipment.view" },
      { href: "/admin/payments", label: "Payments", permission: "payment.view" },
    ],
  },
  { href: "/admin/media", label: "Media", permission: "media.upload" },
  { href: "/admin/customers", label: "Customers", permission: "customer.view" },
  {
    label: "Users & access",
    children: [
      { href: "/admin/users", label: "Users", permission: "user.manage" },
      { href: "/admin/roles", label: "Roles", permission: "role.manage" },
      { href: "/admin/audit-logs", label: "Audit log", permission: "audit.view" },
    ],
  },
  { href: "/admin/billing", label: "Billing", permission: "billing.view" },
  {
    label: "Settings",
    children: [
      {
        href: "/admin/settings/payment-gateways",
        label: "Payment methods",
        permission: "setting.manage",
      },
      {
        href: "/admin/settings/shipping",
        label: "Delivery charges",
        permission: "setting.manage",
      },
      {
        href: "/admin/settings/couriers",
        label: "Couriers",
        permission: "courier.manage",
      },
      {
        href: "/admin/theme",
        label: "Store Theme",
        permission: "setting.manage",
      },
    ],
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Read on mount, not during render: the tenant slug comes from
  // window.location, which the server can't see, so rendering it during SSR
  // would mismatch the client's first paint.
  const [shopName, setShopName] = useState<string | null>(null);
  useEffect(() => {
    const slug = currentTenant();
    setShopName(slug ? tenantDisplayName(slug) : null);
  }, []);

  // Hiding a link the API would refuse anyway; authorization stays server-side.
  const visible = useMemo(
    () =>
      NAV.map((item) =>
        isGroup(item)
          ? {
              ...item,
              children: item.children.filter(
                (child) => !child.permission || can(user, child.permission),
              ),
            }
          : item,
      ).filter((item) => (isGroup(item) ? item.children.length > 0 : !item.permission || can(user, item.permission))),
    [user],
  );

  const activeGroup = visible.find(
    (item) => isGroup(item) && item.children.some((child) => child.href === pathname),
  )?.label;

  // Manual open/close override, cleared whenever the route changes so a
  // group only stays open on its own — navigating to any other link (a
  // plain link or a link in a different group) collapses it again.
  const [manualOpenGroup, setManualOpenGroup] = useState<string | null | undefined>(undefined);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setManualOpenGroup(undefined);
  }

  const openGroup = manualOpenGroup !== undefined ? manualOpenGroup : (activeGroup ?? null);

  const toggleGroup = (label: string) =>
    setManualOpenGroup(openGroup === label ? null : label);

  return (
    <RequireAuth type="admin" loginPath="/admin/login">
      <div className="flex min-h-screen">
        <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border w-56 shrink-0 border-r p-4">
          <p className="mb-6 truncate font-semibold">{shopName ?? "Admin"}</p>
          <nav className="space-y-1">
            {visible.map((item) =>
              isGroup(item) ? (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm",
                      item.children.some((child) => child.href === pathname)
                        ? "font-medium"
                        : "text-sidebar-muted-foreground",
                    )}
                  >
                    {item.label}
                    <ChevronRight
                      className={cn(
                        "size-4 transition-transform duration-200",
                        openGroup === item.label && "rotate-90",
                      )}
                    />
                  </button>
                  {openGroup === item.label && (
                    <div className="mt-1 ml-3 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm",
                            pathname === child.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-muted-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm",
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b px-6 py-3">
            <span className="text-muted-foreground text-sm">
              {user?.name} ·{" "}
              {user?.roles?.map((role) => role.label).join(", ") || "No role"}
            </span>
            <button
              onClick={async () => {
                await logout();
                router.push("/admin/login");
              }}
              className="text-sm underline"
            >
              Sign out
            </button>
          </header>
          <ImpersonationBanner />
          <SubscriptionBanner />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
