"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  FolderOpen,
  LayoutTemplate,
  Heart,
  Palette,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { KogniLogo } from "@/components/shared/kogni-logo";
import { CreditBadge } from "@/components/dashboard/credit-badge";
import { UserMenu } from "@/components/dashboard/user-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/projects", label: "My Projects", icon: FolderOpen },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/brand-kit", label: "Brand Kit", icon: Palette },
];

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <KogniLogo className="size-6 shrink-0" />
          {!collapsed && <span className="text-base font-semibold tracking-tight text-sidebar-foreground">Kogni</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && "Settings"}
        </Link>
        <CreditBadge collapsed={collapsed} />
        <UserMenu userEmail={userEmail} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
