"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  FileText,
  ShieldCheck,
  Cookie,
  ClipboardList,
  AlertTriangle,
  Search,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle,
  Siren,
  Plug,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Data Discovery",
    href: "/dashboard/data-discovery",
    icon: Database,
  },
  {
    name: "PII Scanner",
    href: "/dashboard/pii-scanner",
    icon: Search,
  },
  {
    name: "Remediation Hub",
    href: "/dashboard/remediation",
    icon: Wrench,
  },
  {
    name: "DSAR Management",
    href: "/dashboard/dsar",
    icon: FileText,
  },
  {
    name: "Consent Management",
    href: "/dashboard/consent",
    icon: ShieldCheck,
  },
  {
    name: "Consent Centre",
    href: "/dashboard/consent-centre",
    icon: UserCircle,
  },
  {
    name: "Cookie Consent",
    href: "/dashboard/cookies",
    icon: Cookie,
  },
  {
    name: "ROPA",
    href: "/dashboard/ropa",
    icon: ClipboardList,
  },
  {
    name: "DPIA",
    href: "/dashboard/dpia",
    icon: AlertTriangle,
  },
  {
    name: "Gap Assessment",
    href: "/dashboard/gap-assessment",
    icon: Search,
  },
  {
    name: "Breach Management",
    href: "/dashboard/breaches",
    icon: Siren,
  },
  {
    name: "Vendor Risk",
    href: "/dashboard/vendors",
    icon: Users,
  },
  {
    name: "Integrations",
    href: "/dashboard/integrations",
    icon: Plug,
  },
  {
    name: "Reports & Audit",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none">
                CompShield
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                DPDP Platform
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
