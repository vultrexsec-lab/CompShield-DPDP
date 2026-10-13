"use client";

import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Shield,
  Users,
  Database,
} from "lucide-react";

const reports = [
  {
    name: "DPDP Compliance Summary",
    description: "Overall compliance posture and readiness score",
    type: "Compliance",
    lastGenerated: "Today, 10:30 AM",
    icon: Shield,
  },
  {
    name: "DSAR Monthly Report",
    description: "All data principal requests handled this month",
    type: "DSAR",
    lastGenerated: "Yesterday",
    icon: FileText,
  },
  {
    name: "Consent Audit Log",
    description: "Complete history of consent given and withdrawn",
    type: "Consent",
    lastGenerated: "2 days ago",
    icon: Users,
  },
  {
    name: "Data Discovery Report",
    description: "Personal data inventory across all systems",
    type: "Discovery",
    lastGenerated: "3 days ago",
    icon: Database,
  },
  {
    name: "Vendor Risk Assessment",
    description: "Third-party processor risk scores and DPA status",
    type: "Vendors",
    lastGenerated: "1 week ago",
    icon: BarChart3,
  },
  {
    name: "ROPA Export",
    description: "Full Records of Processing Activities document",
    type: "ROPA",
    lastGenerated: "1 week ago",
    icon: FileText,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports & Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Generate compliance reports and view audit trails
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Calendar className="w-4 h-4" />
          Schedule Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.name}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                <report.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {report.type}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-600 transition">
              {report.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{report.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Last: {report.lastGenerated}
              </span>
              <button className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
                <Download className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
