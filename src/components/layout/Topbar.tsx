"use client";

import { useEffect, useState } from "react";
import { Bell, Search, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import Link from "next/link";

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifs = () => {
    listNotifications().then(setNotifications).catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 60000);
    return () => clearInterval(t);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-64"
      )}
    >
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); }} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }} className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <button onClick={async () => { await markAllNotificationsRead(); loadNotifs(); }} className="text-xs text-brand-600 font-medium">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No notifications</p>}
                {notifications.map((n) => (
                  <button key={n.id} onClick={async () => { if (!n.read) await markNotificationRead(n.id); loadNotifs(); setShowNotifications(false); }} className={cn("w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50", !n.read && "bg-brand-50/40")}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">{(user || "A")[0].toUpperCase()}</div>
            <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">{user || "Admin"}</span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
              <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setShowUserMenu(false)}><Settings className="w-4 h-4" /> Settings</Link>
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
