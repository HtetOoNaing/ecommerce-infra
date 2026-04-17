"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Users", href: "/dashboard/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-white transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          "max-lg:translate-x-0 max-lg:w-64",
          "max-lg:shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              InfraPro
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden lg:block"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={clsx(
                "w-4 h-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
