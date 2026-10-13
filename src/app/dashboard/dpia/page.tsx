"use client";

import { AlertTriangle, Plus, Eye, CheckCircle2, Clock } from "lucide-react";

const dpias = [
  {
    id: "DPIA-2026-012",
    title: "Customer Analytics Platform",
    status: "approved",
    riskLevel: "Medium",
    owner: "Product Team",
    created: "2026-09-15",
    reviewed: "2026-10-01",
  },
  {
    id: "DPIA-2026-011",
    title: "AI-based Credit Scoring",
    status: "in_review",
    riskLevel: "High",
    owner: "Risk Team",
    created: "2026-10-05",
    reviewed: "—",
  },
  {
    id: "DPIA-2026-010",
    title: "Employee Monitoring Tool",
    status: "draft",
    riskLevel: "High",
    owner: "HR",
    created: "2026-10-10",
    reviewed: "—",
  },
  {
    id: "DPIA-2026-009",
    title: "Mobile App Location Tracking",
    status: "approved",
    riskLevel: "Medium",
    owner: "Mobile Team",
    created: "2026-08-20",
    reviewed: "2026-09-05",
  },
];

export default function DPIAPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            DPIA – Data Protection Impact Assessment
          </h1>
          <p className="text-slate-500 mt-1">
            Conduct and document impact assessments for high-risk processing
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Plus className="w-4 h-4" />
          New DPIA
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total DPIAs</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">8</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
              <th className="px-6 py-3 font-medium">DPIA ID</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Risk Level</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {dpias.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 text-sm font-mono text-brand-600">
                  {d.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {d.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      d.riskLevel === "High"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {d.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm ${
                      d.status === "approved"
                        ? "text-emerald-600"
                        : d.status === "in_review"
                        ? "text-blue-600"
                        : "text-slate-500"
                    }`}
                  >
                    {d.status === "approved" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {d.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{d.owner}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.created}</td>
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
  );
}
