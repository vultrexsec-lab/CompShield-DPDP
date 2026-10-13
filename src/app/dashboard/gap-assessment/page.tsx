"use client";

import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const gaps = [
  {
    id: 1,
    title: "Missing consent for third-party data sharing",
    department: "Marketing",
    severity: "high",
    status: "open",
    recommendation:
      "Implement granular consent capture for all third-party sharing purposes. Update privacy notice.",
    dueDate: "2026-10-20",
  },
  {
    id: 2,
    title: "ROPA incomplete for HR processes",
    department: "Human Resources",
    severity: "medium",
    status: "in_progress",
    recommendation:
      "Document all employee data processing activities including background verification and performance reviews.",
    dueDate: "2026-10-25",
  },
  {
    id: 3,
    title: "No retention policy for support tickets",
    department: "Customer Support",
    severity: "medium",
    status: "open",
    recommendation:
      "Define and implement data retention schedule for Zendesk tickets (recommended: 3 years).",
    dueDate: "2026-11-01",
  },
  {
    id: 4,
    title: "Vendor DPA not signed – Email Provider",
    department: "IT",
    severity: "high",
    status: "open",
    recommendation:
      "Execute Data Processing Agreement with the email service provider as required under DPDP.",
    dueDate: "2026-10-18",
  },
  {
    id: 5,
    title: "Cookie banner missing reject option",
    department: "Digital",
    severity: "low",
    status: "resolved",
    recommendation:
      "Cookie banner already updated with Accept / Reject / Customize options.",
    dueDate: "2026-10-05",
  },
  {
    id: 6,
    title: "DSAR response time exceeds 15 days average",
    department: "Privacy Team",
    severity: "medium",
    status: "in_progress",
    recommendation:
      "Automate data retrieval workflows and assign backup responders to reduce average response time.",
    dueDate: "2026-10-30",
  },
];

export default function GapAssessmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gap Assessment</h1>
          <p className="text-slate-500 mt-1">
            AI-powered compliance gap analysis with actionable recommendations
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Sparkles className="w-4 h-4" />
          Run AI Assessment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Gaps</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">High Severity</p>
          <p className="text-2xl font-bold text-red-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">4</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">5</p>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Overall Compliance Score</h3>
            <p className="text-brand-100 mt-1 text-sm">
              Based on DPDP Act requirements and current controls
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">87%</div>
            <div className="text-xs text-brand-200">Good Standing</div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-brand-900/40 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: "87%" }}></div>
        </div>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      gap.severity === "high"
                        ? "bg-red-50 text-red-700"
                        : gap.severity === "medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {gap.severity} severity
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      gap.status === "open"
                        ? "bg-red-50 text-red-700"
                        : gap.status === "in_progress"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {gap.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">
                    {gap.department}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {gap.title}
                </h3>
                <div className="mt-2 flex items-start gap-2 bg-brand-50 rounded-xl p-3">
                  <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-brand-800">
                    <span className="font-medium">AI Recommendation: </span>
                    {gap.recommendation}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">Due</p>
                <p className="text-sm font-medium text-slate-700">
                  {gap.dueDate}
                </p>
                <button className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 ml-auto">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
