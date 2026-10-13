"use client";

import {
  Plug,
  CheckCircle2,
  Database,
  Cloud,
  Server,
  HardDrive,
  Mail,
  MessageSquare,
  CreditCard,
  Users,
} from "lucide-react";

const connectors = [
  { name: "PostgreSQL", category: "Database", status: "connected", icon: Database, records: "12,450" },
  { name: "MySQL", category: "Database", status: "connected", icon: Database, records: "8,200" },
  { name: "SQL Server", category: "Database", status: "available", icon: Server, records: "—" },
  { name: "Snowflake", category: "Data Warehouse", status: "available", icon: Cloud, records: "—" },
  { name: "AWS S3", category: "Storage", status: "connected", icon: HardDrive, records: "3,120 files" },
  { name: "Office 365", category: "Productivity", status: "connected", icon: Mail, records: "Emails + Files" },
  { name: "Salesforce", category: "CRM", status: "connected", icon: Users, records: "45,680" },
  { name: "Zendesk", category: "Support", status: "connected", icon: MessageSquare, records: "18,760" },
  { name: "Razorpay", category: "Payments", status: "available", icon: CreditCard, records: "—" },
  { name: "Google Workspace", category: "Productivity", status: "available", icon: Cloud, records: "—" },
  { name: "HubSpot", category: "CRM", status: "available", icon: Users, records: "—" },
  { name: "MongoDB", category: "Database", status: "available", icon: Database, records: "—" },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Integrations & Connectors
          </h1>
          <p className="text-slate-500 mt-1">
            Connect your systems for automated data discovery and DSAR fulfillment
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Plug className="w-4 h-4" />
          Add Connector
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Connected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">6</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">6+</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Records Synced</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">88,000+</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <div
            key={c.name}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition flex items-start gap-4"
          >
            <div
              className={`p-3 rounded-xl ${
                c.status === "connected"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <c.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{c.name}</h3>
                {c.status === "connected" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Connect
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{c.category}</p>
              {c.status === "connected" && (
                <p className="text-xs text-slate-400 mt-2">{c.records} records</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <strong className="text-slate-900">PrivacyShield parity:</strong> Pre-built
        connectors for MySQL, PostgreSQL, SQL Server, Snowflake, AWS S3, Office 365 and
        popular SaaS apps — same list highlighted on privacyshield.ai.
      </div>
    </div>
  );
}
