"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const consents = [
  {
    id: 1,
    user: "Priya Sharma",
    email: "priya.sharma@email.com",
    purpose: "Marketing Communications",
    channel: "Email",
    status: "active",
    givenOn: "2026-08-15",
    expiresOn: "2027-08-15",
    method: "Aadhaar Authenticated",
  },
  {
    id: 2,
    user: "Amit Patel",
    email: "amit.patel@company.in",
    purpose: "Product Analytics",
    channel: "App",
    status: "active",
    givenOn: "2026-07-22",
    expiresOn: "2027-07-22",
    method: "Web Form",
  },
  {
    id: 3,
    user: "Neha Gupta",
    email: "neha.g@gmail.com",
    purpose: "Third-party Sharing",
    channel: "Website",
    status: "withdrawn",
    givenOn: "2026-05-10",
    expiresOn: "—",
    method: "Web Form",
  },
  {
    id: 4,
    user: "Vikram Singh",
    email: "vikram.s@outlook.com",
    purpose: "Marketing Communications",
    channel: "SMS",
    status: "active",
    givenOn: "2026-09-01",
    expiresOn: "2027-09-01",
    method: "Aadhaar Authenticated",
  },
  {
    id: 5,
    user: "Ananya Reddy",
    email: "ananya.r@yahoo.com",
    purpose: "Personalization",
    channel: "App",
    status: "expired",
    givenOn: "2025-06-18",
    expiresOn: "2026-06-18",
    method: "Mobile OTP",
  },
  {
    id: 6,
    user: "Rohan Mehta",
    email: "rohan.mehta@email.com",
    purpose: "Marketing Communications",
    channel: "Email",
    status: "active",
    givenOn: "2026-10-01",
    expiresOn: "2027-10-01",
    method: "Web Form",
  },
];

const purposes = [
  { name: "Marketing Communications", active: 12450, withdrawn: 890, rate: 93.3 },
  { name: "Product Analytics", active: 18200, withdrawn: 420, rate: 97.7 },
  { name: "Personalization", active: 9800, withdrawn: 1100, rate: 89.9 },
  { name: "Third-party Sharing", active: 4200, withdrawn: 3100, rate: 57.5 },
];

export default function ConsentPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = consents.filter((c) => {
    const matchSearch =
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Consent Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage user consents with Aadhaar authentication & multilingual
            notices
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition">
            <Download className="w-4 h-4" />
            Export Log
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
            <ShieldCheck className="w-4 h-4" />
            Consent Centre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">44,650</p>
              <p className="text-sm text-slate-500">Active Consents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">5,510</p>
              <p className="text-sm text-slate-500">Withdrawn</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">1,240</p>
              <p className="text-sm text-slate-500">Expiring in 30 days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">94.2%</p>
              <p className="text-sm text-slate-500">Overall Consent Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purpose Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Consent by Purpose
        </h2>
        <div className="space-y-4">
          {purposes.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">
                  {p.name}
                </span>
                <span className="text-sm text-slate-500">
                  {p.active.toLocaleString()} active · {p.rate}% rate
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${p.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consent Table */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Consent Records</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Purpose</th>
                <th className="px-6 py-3 font-medium">Channel</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Given On</th>
                <th className="px-6 py-3 font-medium">Expires</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {c.user}
                      </p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.purpose}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.channel}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        c.method === "Aadhaar Authenticated"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : c.status === "withdrawn"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {c.givenOn}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {c.expiresOn}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
