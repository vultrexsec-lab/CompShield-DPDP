"use client";

import { useState } from "react";
import {
  Siren,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Bell,
  Shield,
} from "lucide-react";

const breaches = [
  {
    id: "BR-2026-004",
    title: "Unauthorized access attempt – HR database",
    severity: "high",
    status: "investigating",
    detected: "2026-10-12 14:30",
    affected: "~120 employee records",
    notifiedBoard: false,
    notifiedUsers: false,
  },
  {
    id: "BR-2026-003",
    title: "Misconfigured S3 bucket – public exposure",
    severity: "medium",
    status: "contained",
    detected: "2026-09-28 09:15",
    affected: "Customer invoices (metadata only)",
    notifiedBoard: true,
    notifiedUsers: false,
  },
  {
    id: "BR-2026-002",
    title: "Phishing-related credential compromise",
    severity: "high",
    status: "resolved",
    detected: "2026-08-15 18:00",
    affected: "3 support agent accounts",
    notifiedBoard: true,
    notifiedUsers: true,
  },
  {
    id: "BR-2026-001",
    title: "Lost encrypted laptop",
    severity: "low",
    status: "resolved",
    detected: "2026-07-02 11:20",
    affected: "None (full disk encryption)",
    notifiedBoard: false,
    notifiedUsers: false,
  },
];

export default function BreachesPage() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Breach Management
          </h1>
          <p className="text-slate-500 mt-1">
            Detect, contain, and notify — including Data Protection Board & affected users
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Log Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Open Incidents</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Resolved (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">8</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Board Notified</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Avg. Containment</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">4.2h</p>
        </div>
      </div>

      {/* DPDP Reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">DPDP Breach Notification Duty</p>
          <p className="text-sm text-amber-800 mt-1">
            Under the Digital Personal Data Protection Act, significant breaches must be reported
            to the Data Protection Board and affected Data Principals without delay. Use this
            module to track timelines and evidence.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium">Incident ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Detected</th>
                <th className="px-6 py-3 font-medium">Board</th>
                <th className="px-6 py-3 font-medium">Users</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {breaches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-brand-600">
                    {b.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{b.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{b.affected}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        b.severity === "high"
                          ? "bg-red-50 text-red-700"
                          : b.severity === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {b.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        b.status === "resolved"
                          ? "text-emerald-600"
                          : b.status === "contained"
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {b.status === "resolved" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{b.detected}</td>
                  <td className="px-6 py-4">
                    {b.notifiedBoard ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {b.notifiedUsers ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Log New Incident
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Severity
                </label>
                <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Affected Data (approx.)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 50 customer emails"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNew(false);
                  alert("Incident logged (Demo)");
                }}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium"
              >
                Log Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
