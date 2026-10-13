"use client";

import { ClipboardList, Plus, Search, Download, Eye } from "lucide-react";

const records = [
  {
    id: "ROPA-001",
    activity: "Employee Payroll Processing",
    purpose: "Salary disbursement & statutory compliance",
    dataCategories: "Name, Bank Account, PAN, Aadhaar",
    dataSubjects: "Employees",
    retention: "7 years",
    legalBasis: "Employment Contract",
    systems: "ERP, Banking Portal",
  },
  {
    id: "ROPA-002",
    activity: "Customer Onboarding",
    purpose: "KYC verification & account creation",
    dataCategories: "Name, Aadhaar, PAN, Address, Photo",
    dataSubjects: "Customers",
    retention: "As long as account is active + 5 years",
    legalBasis: "Consent + Legal Obligation",
    systems: "CRM, KYC Provider",
  },
  {
    id: "ROPA-003",
    activity: "Marketing Email Campaigns",
    purpose: "Promotional communications",
    dataCategories: "Name, Email, Preferences",
    dataSubjects: "Prospects & Customers",
    retention: "Until consent withdrawn",
    legalBasis: "Consent",
    systems: "Email Marketing Tool",
  },
  {
    id: "ROPA-004",
    activity: "Customer Support Tickets",
    purpose: "Issue resolution & service improvement",
    dataCategories: "Name, Email, Phone, Conversation logs",
    dataSubjects: "Customers",
    retention: "3 years",
    legalBasis: "Legitimate Interest",
    systems: "Zendesk, CRM",
  },
  {
    id: "ROPA-005",
    activity: "Website Analytics",
    purpose: "Improve user experience",
    dataCategories: "IP Address, Device Info, Behaviour",
    dataSubjects: "Website Visitors",
    retention: "26 months",
    legalBasis: "Consent",
    systems: "Google Analytics, Hotjar",
  },
];

export default function ROPAPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            ROPA – Records of Processing Activities
          </h1>
          <p className="text-slate-500 mt-1">
            Maintain complete records of all personal data processing activities
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition">
            <Download className="w-4 h-4" />
            Export ROPA
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Activities</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Systems Involved</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">18</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Last Updated</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Today</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Processing Activity</th>
                <th className="px-6 py-3 font-medium">Purpose</th>
                <th className="px-6 py-3 font-medium">Data Categories</th>
                <th className="px-6 py-3 font-medium">Legal Basis</th>
                <th className="px-6 py-3 font-medium">Retention</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-brand-600">
                    {r.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {r.activity}
                    </p>
                    <p className="text-xs text-slate-500">{r.dataSubjects}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px]">
                    {r.purpose}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-[180px]">
                    {r.dataCategories}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {r.legalBasis}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {r.retention}
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
