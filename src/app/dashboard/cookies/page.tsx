"use client";

import { useState } from "react";
import {
  Cookie,
  CheckCircle2,
  Settings,
  Eye,
  Code,
  BarChart3,
  Shield,
} from "lucide-react";

const cookieCategories = [
  {
    name: "Necessary",
    description: "Essential for website functionality",
    enabled: true,
    locked: true,
    cookies: 4,
  },
  {
    name: "Analytics",
    description: "Help us understand how visitors use the site",
    enabled: true,
    locked: false,
    cookies: 6,
  },
  {
    name: "Marketing",
    description: "Used for advertising and remarketing",
    enabled: false,
    locked: false,
    cookies: 8,
  },
  {
    name: "Preferences",
    description: "Remember your settings and preferences",
    enabled: true,
    locked: false,
    cookies: 3,
  },
];

const recentLogs = [
  { id: 1, action: "Accepted All", visitor: "Visitor #48291", time: "2 min ago", ip: "103.21.x.x" },
  { id: 2, action: "Rejected Marketing", visitor: "Visitor #48290", time: "5 min ago", ip: "49.36.x.x" },
  { id: 3, action: "Accepted All", visitor: "Visitor #48289", time: "12 min ago", ip: "122.168.x.x" },
  { id: 4, action: "Custom Selection", visitor: "Visitor #48288", time: "18 min ago", ip: "157.45.x.x" },
  { id: 5, action: "Accepted Necessary Only", visitor: "Visitor #48287", time: "25 min ago", ip: "14.139.x.x" },
];

export default function CookiesPage() {
  const [categories, setCategories] = useState(cookieCategories);

  const toggleCategory = (index: number) => {
    if (categories[index].locked) return;
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === index ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cookie Consent</h1>
          <p className="text-slate-500 mt-1">
            Deploy and manage compliant cookie banners in minutes
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition">
            <Code className="w-4 h-4" />
            Get Embed Code
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
            <Settings className="w-4 h-4" />
            Customize Banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Banner Views</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">128,450</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Acceptance Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">78.4%</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Partial Acceptance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">14.2%</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Rejection Rate</p>
          <p className="text-2xl font-bold text-red-600 mt-1">7.4%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Cookie Categories
          </h2>
          <div className="space-y-3">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Cookie className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {cat.name}
                      {cat.locked && (
                        <span className="ml-2 text-xs text-slate-400">
                          (Always On)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{cat.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cat.cookies} cookies
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategory(i)}
                  disabled={cat.locked}
                  className={`${
                    cat.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {cat.enabled ? (
                    <div className="w-11 h-6 bg-brand-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                    </div>
                  ) : (
                    <div className="w-11 h-6 bg-slate-300 rounded-full relative">
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Consent Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">
            Recent Consent Log
          </h2>
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {log.action}
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.visitor} · {log.ip}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium">
            View Full Log →
          </button>
        </div>
      </div>

      {/* Banner Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Banner Preview</h2>
        <div className="bg-slate-900 rounded-xl p-6 text-white max-w-2xl">
          <div className="flex items-start gap-4">
            <Cookie className="w-8 h-8 text-brand-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">We value your privacy</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                &quot;Accept All&quot;, you consent to our use of cookies.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-medium transition">
                  Accept All
                </button>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition">
                  Reject All
                </button>
                <button className="px-4 py-2 border border-slate-600 hover:bg-slate-800 rounded-lg text-sm font-medium transition">
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
