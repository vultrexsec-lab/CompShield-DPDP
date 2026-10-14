"use client";

import { useState } from "react";
import {
  Wrench,
  Shield,
  Lock,
  EyeOff,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Filter,
} from "lucide-react";

const findings = [
  {
    id: "REM-001",
    source: "HR Database (PostgreSQL)",
    finding: "Unencrypted Aadhaar numbers in employees table",
    severity: "high",
    regulation: "DPDP",
    recommended: "Encrypt at rest",
    status: "open",
    impact: "High – Sensitive personal data exposed at rest",
  },
  {
    id: "REM-002",
    source: "Customer CRM (Salesforce)",
    finding: "Marketing emails without active consent linkage",
    severity: "high",
    regulation: "DPDP",
    recommended: "Restrict access / unlink",
    status: "in_progress",
    impact: "Medium – Consent-purpose mismatch",
  },
  {
    id: "REM-003",
    source: "Employee File Share (S3)",
    finding: "PAN cards stored in plain PDF files",
    severity: "high",
    regulation: "DPDP",
    recommended: "Mask + Encrypt",
    status: "open",
    impact: "High – Financial identifiers in clear text",
  },
  {
    id: "REM-004",
    source: "Support Tickets (Zendesk)",
    finding: "Customer phone numbers in ticket body beyond retention",
    severity: "medium",
    regulation: "DPDP",
    recommended: "Delete / anonymize",
    status: "open",
    impact: "Medium – Retention policy violation",
  },
  {
    id: "REM-005",
    source: "Marketing Email List",
    finding: "Withdrawn consents still in active campaign list",
    severity: "medium",
    regulation: "DPDP",
    recommended: "Restrict access",
    status: "completed",
    impact: "Low – Already remediated",
  },
  {
    id: "REM-006",
    source: "Finance ERP",
    finding: "Bank account numbers without field-level encryption",
    severity: "high",
    regulation: "DPDP + PCI",
    recommended: "Encrypt",
    status: "in_progress",
    impact: "High – Financial data at rest",
  },
];

const actions = [
  { id: "encrypt", label: "Encrypt", icon: Lock, color: "bg-blue-500" },
  { id: "mask", label: "Mask", icon: EyeOff, color: "bg-purple-500" },
  { id: "restrict", label: "Restrict Access", icon: Shield, color: "bg-amber-500" },
  { id: "delete", label: "Delete / Anonymize", icon: Trash2, color: "bg-red-500" },
];

export default function RemediationPage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = findings.filter(
    (f) => filter === "all" || f.status === filter
  );

  const counts = {
    open: findings.filter((f) => f.status === "open").length,
    in_progress: findings.filter((f) => f.status === "in_progress").length,
    completed: findings.filter((f) => f.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Remediation Hub</h1>
          <p className="text-slate-500 mt-1">
            Find AND fix — turn discovery findings into tracked corrective actions
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Play className="w-4 h-4" />
          Run Auto-Remediation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Open Findings</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{counts.open}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counts.in_progress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.completed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Closure Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round((counts.completed / findings.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Action types */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Remediation Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <div className={`p-2.5 ${a.color} rounded-xl text-white`}>
                <a.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-800">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "open", label: "Open" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === t.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Findings table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Finding</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Recommended</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-brand-600">
                    {f.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900 max-w-xs">
                      {f.finding}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.impact}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{f.source}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        f.severity === "high"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {f.recommended}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        f.status === "completed"
                          ? "text-emerald-600"
                          : f.status === "in_progress"
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {f.status === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {f.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {f.status !== "completed" ? (
                      <button
                        onClick={() => {
                          setSelected(f.id);
                          alert(
                            `Remediation started for ${f.id}: ${f.recommended} (Demo)`
                          );
                        }}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Remediate
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <strong className="text-slate-900">PrivaTrust parity:</strong> Remediation
        Hub connects discovery findings to fix workflows (Encrypt, Mask, Restrict,
        Delete) with impact analysis and audit trail — the “Find AND Fix” capability.
      </div>
    </div>
  );
}
