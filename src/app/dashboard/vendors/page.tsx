"use client";

import { Users, Plus, Search, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

const vendors = [
  {
    name: "Amazon Web Services",
    category: "Cloud Infrastructure",
    risk: "low",
    dpaStatus: "Signed",
    lastReview: "2026-08-15",
    dataShared: "Encrypted backups, logs",
  },
  {
    name: "Salesforce India",
    category: "CRM",
    risk: "low",
    dpaStatus: "Signed",
    lastReview: "2026-07-20",
    dataShared: "Customer contact data",
  },
  {
    name: "SendGrid (Twilio)",
    category: "Email Service",
    risk: "medium",
    dpaStatus: "Pending",
    lastReview: "2026-06-10",
    dataShared: "Email addresses, names",
  },
  {
    name: "Zendesk",
    category: "Support",
    risk: "low",
    dpaStatus: "Signed",
    lastReview: "2026-09-01",
    dataShared: "Support tickets, contact info",
  },
  {
    name: "Razorpay",
    category: "Payments",
    risk: "low",
    dpaStatus: "Signed",
    lastReview: "2026-08-28",
    dataShared: "Transaction data (tokenized)",
  },
  {
    name: "Local KYC Provider",
    category: "Identity Verification",
    risk: "high",
    dpaStatus: "Expired",
    lastReview: "2025-12-15",
    dataShared: "Aadhaar, PAN, photos",
  },
];

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor & Third-Party Risk
          </h1>
          <p className="text-slate-500 mt-1">
            Assess and manage privacy risk of your data processors
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Vendors</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">18</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">DPA Signed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">14</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">High Risk</p>
          <p className="text-2xl font-bold text-red-600 mt-1">2</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Risk Level</th>
                <th className="px-6 py-3 font-medium">DPA Status</th>
                <th className="px-6 py-3 font-medium">Data Shared</th>
                <th className="px-6 py-3 font-medium">Last Review</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vendors.map((v) => (
                <tr key={v.name} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {v.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {v.category}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        v.risk === "high"
                          ? "bg-red-50 text-red-700"
                          : v.risk === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {v.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        v.dpaStatus === "Signed"
                          ? "text-emerald-600"
                          : v.dpaStatus === "Pending"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {v.dpaStatus === "Signed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {v.dpaStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-[180px]">
                    {v.dataShared}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {v.lastReview}
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
