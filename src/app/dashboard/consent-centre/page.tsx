"use client";

import { useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  FileText,
  Database,
  Eye,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";

const mockPrincipal = {
  name: "Priya Sharma",
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  verifiedVia: "Aadhaar OTP",
  lastLogin: "Today, 2:15 PM",
};

const myData = [
  { category: "Identity", items: "Name, Aadhaar (masked), PAN (masked)", systems: "CRM, KYC" },
  { category: "Contact", items: "Email, Phone, Address", systems: "CRM, Marketing" },
  { category: "Preferences", items: "Language, Communication channel", systems: "Consent DB" },
  { category: "Activity", items: "Support tickets, Purchase history", systems: "Zendesk, Orders" },
];

const myConsents = [
  { purpose: "Marketing Communications", status: "active", given: "15 Aug 2026", channel: "Email" },
  { purpose: "Product Analytics", status: "active", given: "22 Jul 2026", channel: "App" },
  { purpose: "Third-party Sharing", status: "withdrawn", given: "10 May 2026", channel: "Website" },
  { purpose: "Personalization", status: "active", given: "01 Sep 2026", channel: "App" },
];

const myRequests = [
  { id: "DSAR-2026-0891", type: "Access Request", status: "pending", date: "13 Oct 2026" },
  { id: "DSAR-2026-0750", type: "Correction Request", status: "completed", date: "02 Sep 2026" },
];

export default function ConsentCentrePage() {
  const [activeTab, setActiveTab] = useState<"data" | "consents" | "requests">("data");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Centre</h1>
          <p className="text-slate-500 mt-1">
            Self-service privacy portal for Data Principals (as seen by end-users)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-100">
          <Lock className="w-4 h-4" />
          Aadhaar Verified Session
        </span>
      </div>

      {/* Principal Card */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            PS
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{mockPrincipal.name}</h2>
            <p className="text-brand-100 text-sm mt-0.5">{mockPrincipal.email}</p>
            <p className="text-brand-200 text-xs mt-1">
              Verified via {mockPrincipal.verifiedVia} · Last login: {mockPrincipal.lastLogin}
            </p>
          </div>
          <div className="text-sm text-brand-100">
            This is the view your customers / employees see when they log into the Consent Centre.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "data", label: "My Personal Data", icon: Database },
          { key: "consents", label: "My Consents", icon: ShieldCheck },
          { key: "requests", label: "My Requests", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "data" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Personal Data We Hold</h3>
            <button className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
              <Download className="w-4 h-4" />
              Download My Data
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {myData.map((row) => (
              <div key={row.category} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="sm:w-32 font-medium text-slate-900">{row.category}</div>
                <div className="flex-1 text-sm text-slate-600">{row.items}</div>
                <div className="text-xs text-slate-400">{row.systems}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "consents" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Consent History</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              You can withdraw or update any consent below
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {myConsents.map((c) => (
              <div
                key={c.purpose}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{c.purpose}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Given on {c.given} · via {c.channel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.status === "active" ? (
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Withdraw
                    </button>
                  ) : (
                    <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      Re-consent
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition text-sm">
              <FileText className="w-4 h-4" />
              Raise New Request
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">My Data Principal Requests</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {myRequests.map((r) => (
                <div
                  key={r.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-mono text-sm text-brand-600">{r.id}</p>
                    <p className="font-medium text-slate-900 mt-0.5">{r.type}</p>
                    <p className="text-xs text-slate-500">{r.date}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <strong className="text-slate-900">Demo note:</strong> This is the Data Principal (end-user)
        view of the Consent Centre — PrivacyShield’s flagship self-service portal. Users log in via
        Aadhaar/OTP, see all data held about them, manage consents, and raise DSARs without contacting
        support.
      </div>
    </div>
  );
}
