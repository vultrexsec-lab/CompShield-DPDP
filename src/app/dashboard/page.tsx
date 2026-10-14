"use client";

import { useEffect, useState } from "react";
import {
  Database,
  FileText,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

const defaultStats = [
  {
    name: "Data Assets Discovered",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: Database,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
  },
  {
    name: "Pending DSARs",
    value: "23",
    change: "-8.2%",
    trend: "down" as const,
    icon: FileText,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 text-amber-600",
  },
  {
    name: "Consent Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up" as const,
    icon: ShieldCheck,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Risk Score",
    value: "Low",
    change: "Improved",
    trend: "up" as const,
    icon: AlertTriangle,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-600",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "New DSAR submitted",
    detail: "Priya Sharma – Access Request",
    time: "2 minutes ago",
    type: "dsar",
    status: "pending",
  },
  {
    id: 2,
    action: "Data discovery scan completed",
    detail: "HR Database – 142 personal data records found",
    time: "15 minutes ago",
    type: "discovery",
    status: "success",
  },
  {
    id: 3,
    action: "Consent updated",
    detail: "Marketing emails – Opt-out by Rahul Mehta",
    time: "1 hour ago",
    type: "consent",
    status: "info",
  },
  {
    id: 4,
    action: "Gap assessment finished",
    detail: "Sales Department – 3 high priority gaps",
    time: "3 hours ago",
    type: "gap",
    status: "warning",
  },
  {
    id: 5,
    action: "DPIA approved",
    detail: "Customer Analytics Platform – Approved by DPO",
    time: "5 hours ago",
    type: "dpia",
    status: "success",
  },
];

const quickActions = [
  {
    name: "Create DSAR",
    description: "Raise a new data subject request",
    href: "/dashboard/dsar",
    icon: FileText,
    color: "bg-amber-500",
  },
  {
    name: "Run Discovery",
    description: "Scan systems for personal data",
    href: "/dashboard/data-discovery",
    icon: Database,
    color: "bg-blue-500",
  },
  {
    name: "Manage Consent",
    description: "View & update user consents",
    href: "/dashboard/consent",
    icon: ShieldCheck,
    color: "bg-emerald-500",
  },
  {
    name: "View Reports",
    description: "Compliance & audit reports",
    href: "/dashboard/reports",
    icon: Activity,
    color: "bg-purple-500",
  },
];

const dsarStatus = [
  { label: "Completed", value: 156, color: "bg-emerald-500" },
  { label: "In Progress", value: 18, color: "bg-blue-500" },
  { label: "Pending", value: 23, color: "bg-amber-500" },
  { label: "Overdue", value: 4, color: "bg-red-500" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [live, setLive] = useState(false);

  useEffect(() => {
    getDashboardStats()
      .then((s: DashboardStats) => {
        setLive(true);
        setStats([
          {
            name: "Data Sources",
            value: String(s.sources_count),
            change: "Live",
            trend: "up",
            icon: Database,
            color: "bg-blue-500",
            lightColor: "bg-blue-50 text-blue-600",
          },
          {
            name: "Pending DSARs",
            value: String(s.dsar_pending),
            change: `${s.dsar_total} total`,
            trend: s.dsar_pending > 0 ? "down" : "up",
            icon: FileText,
            color: "bg-amber-500",
            lightColor: "bg-amber-50 text-amber-600",
          },
          {
            name: "Active Consents",
            value: String(s.consent_active),
            change: `${s.consent_withdrawn} withdrawn`,
            trend: "up",
            icon: ShieldCheck,
            color: "bg-emerald-500",
            lightColor: "bg-emerald-50 text-emerald-600",
          },
          {
            name: "Open Findings",
            value: String(s.findings_open + s.remediation_open),
            change: `${s.ropa_count} ROPA`,
            trend: "up",
            icon: AlertTriangle,
            color: "bg-purple-500",
            lightColor: "bg-purple-50 text-purple-600",
          },
        ]);
      })
      .catch(() => {
        setLive(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here&apos;s your privacy compliance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${
              live
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {live ? "Live API Connected" : "Demo Mode"}
          </span>
          <span className="text-sm text-slate-400">
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.lightColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            <Link
              href="/dashboard/reports"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    item.status === "success"
                      ? "bg-emerald-500"
                      : item.status === "warning"
                      ? "bg-amber-500"
                      : item.status === "pending"
                      ? "bg-blue-500"
                      : "bg-slate-400"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {item.action}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {item.detail}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DSAR Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">DSAR Status</h2>
            <div className="space-y-3">
              {dsarStatus.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-slate-600 flex-1">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                {dsarStatus.map((item) => (
                  <div
                    key={item.label}
                    className={`${item.color}`}
                    style={{
                      width: `${(item.value / 201) * 100}%`,
                    }}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Total: 201 requests this month
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
                >
                  <div
                    className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-brand-600 transition">
                      {action.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              DPDP Act – May 2027 Deadline
            </h3>
            <p className="text-brand-100 mt-1 text-sm">
              Your organization is on track. 87% of required controls are
              implemented. Keep going!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">87%</div>
              <div className="text-xs text-brand-200">Ready</div>
            </div>
            <Link
              href="/dashboard/gap-assessment"
              className="px-4 py-2 bg-white text-brand-700 rounded-xl text-sm font-semibold hover:bg-brand-50 transition"
            >
              View Gaps
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-brand-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: "87%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
