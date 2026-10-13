"use client";

import { useState } from "react";
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Server,
  Cloud,
  HardDrive,
  MoreHorizontal,
  Play,
  Eye,
} from "lucide-react";

const dataSources = [
  {
    id: 1,
    name: "HR Database (PostgreSQL)",
    type: "Database",
    records: 12450,
    personalData: 8920,
    lastScan: "2 hours ago",
    status: "completed",
    risk: "medium",
    icon: Server,
  },
  {
    id: 2,
    name: "Customer CRM (Salesforce)",
    type: "Cloud App",
    records: 45680,
    personalData: 42100,
    lastScan: "5 hours ago",
    status: "completed",
    risk: "low",
    icon: Cloud,
  },
  {
    id: 3,
    name: "Employee File Share (S3)",
    type: "Storage",
    records: 8930,
    personalData: 3120,
    lastScan: "1 day ago",
    status: "completed",
    risk: "high",
    icon: HardDrive,
  },
  {
    id: 4,
    name: "Marketing Email List",
    type: "Database",
    records: 23400,
    personalData: 23400,
    lastScan: "3 hours ago",
    status: "completed",
    risk: "low",
    icon: Server,
  },
  {
    id: 5,
    name: "Support Tickets (Zendesk)",
    type: "Cloud App",
    records: 18760,
    personalData: 15400,
    lastScan: "Scanning...",
    status: "scanning",
    risk: "medium",
    icon: Cloud,
  },
  {
    id: 6,
    name: "Finance ERP System",
    type: "Database",
    records: 6780,
    personalData: 4210,
    lastScan: "6 hours ago",
    status: "completed",
    risk: "high",
    icon: Server,
  },
];

const categories = [
  { name: "Email Addresses", count: 48230, color: "bg-blue-500" },
  { name: "Phone Numbers", count: 31240, color: "bg-emerald-500" },
  { name: "Names", count: 52890, color: "bg-purple-500" },
  { name: "Aadhaar / PAN", count: 8450, color: "bg-amber-500" },
  { name: "Addresses", count: 19320, color: "bg-rose-500" },
  { name: "Financial Data", count: 6780, color: "bg-indigo-500" },
];

export default function DataDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = dataSources.filter((ds) => {
    const matchSearch = ds.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "high" && ds.risk === "high") ||
      (filter === "scanning" && ds.status === "scanning");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Discovery</h1>
          <p className="text-slate-500 mt-1">
            Automatically discover and classify personal data across all systems
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
          <Play className="w-4 h-4" />
          Run New Scan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">6</p>
              <p className="text-sm text-slate-500">Data Sources</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">116,000+</p>
              <p className="text-sm text-slate-500">Records Scanned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">97,150</p>
              <p className="text-sm text-slate-500">Personal Data Found</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">2</p>
              <p className="text-sm text-slate-500">High Risk Sources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Categories */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Personal Data Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="text-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <div
                className={`w-3 h-3 ${cat.color} rounded-full mx-auto mb-2`}
              ></div>
              <p className="text-lg font-bold text-slate-900">
                {cat.count.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Connected Sources</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sources..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Sources</option>
              <option value="high">High Risk</option>
              <option value="scanning">Scanning</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Records</th>
                <th className="px-6 py-3 font-medium">Personal Data</th>
                <th className="px-6 py-3 font-medium">Last Scan</th>
                <th className="px-6 py-3 font-medium">Risk</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <ds.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {ds.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{ds.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {ds.records.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {ds.personalData.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {ds.lastScan}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        ds.risk === "high"
                          ? "bg-red-50 text-red-700"
                          : ds.risk === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {ds.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ds.status === "scanning" ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-blue-600">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Scanning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
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
    </div>
  );
}
