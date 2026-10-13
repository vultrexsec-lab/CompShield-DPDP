"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  User,
  Calendar,
} from "lucide-react";

const dsarRequests = [
  {
    id: "DSAR-2026-0891",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    type: "Access Request",
    status: "pending",
    priority: "high",
    submitted: "2026-10-13",
    dueDate: "2026-10-27",
    assignedTo: "Rahul Verma",
  },
  {
    id: "DSAR-2026-0890",
    name: "Amit Patel",
    email: "amit.patel@company.in",
    type: "Erasure Request",
    status: "in_progress",
    priority: "medium",
    submitted: "2026-10-12",
    dueDate: "2026-10-26",
    assignedTo: "Sneha Kapoor",
  },
  {
    id: "DSAR-2026-0889",
    name: "Neha Gupta",
    email: "neha.g@gmail.com",
    type: "Correction Request",
    status: "completed",
    priority: "low",
    submitted: "2026-10-10",
    dueDate: "2026-10-24",
    assignedTo: "Rahul Verma",
  },
  {
    id: "DSAR-2026-0888",
    name: "Vikram Singh",
    email: "vikram.s@outlook.com",
    type: "Access Request",
    status: "in_progress",
    priority: "high",
    submitted: "2026-10-09",
    dueDate: "2026-10-23",
    assignedTo: "Sneha Kapoor",
  },
  {
    id: "DSAR-2026-0887",
    name: "Ananya Reddy",
    email: "ananya.r@yahoo.com",
    type: "Portability Request",
    status: "pending",
    priority: "medium",
    submitted: "2026-10-08",
    dueDate: "2026-10-22",
    assignedTo: "Unassigned",
  },
  {
    id: "DSAR-2026-0886",
    name: "Rohan Mehta",
    email: "rohan.mehta@email.com",
    type: "Erasure Request",
    status: "overdue",
    priority: "high",
    submitted: "2026-09-28",
    dueDate: "2026-10-12",
    assignedTo: "Rahul Verma",
  },
  {
    id: "DSAR-2026-0885",
    name: "Kavita Joshi",
    email: "kavita.j@company.com",
    type: "Access Request",
    status: "completed",
    priority: "low",
    submitted: "2026-09-25",
    dueDate: "2026-10-09",
    assignedTo: "Sneha Kapoor",
  },
  {
    id: "DSAR-2026-0884",
    name: "Suresh Kumar",
    email: "suresh.k@gmail.com",
    type: "Correction Request",
    status: "completed",
    priority: "medium",
    submitted: "2026-09-20",
    dueDate: "2026-10-04",
    assignedTo: "Rahul Verma",
  },
];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export default function DSARPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = dsarRequests.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: dsarRequests.length,
    pending: dsarRequests.filter((r) => r.status === "pending").length,
    in_progress: dsarRequests.filter((r) => r.status === "in_progress").length,
    completed: dsarRequests.filter((r) => r.status === "completed").length,
    overdue: dsarRequests.filter((r) => r.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DSAR Management</h1>
          <p className="text-slate-500 mt-1">
            Manage Data Principal Access Requests under DPDP Act
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          New DSAR
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "overdue", label: "Overdue" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === tab.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                statusFilter === tab.key
                  ? "bg-white/20"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[tab.key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3 font-medium">Request ID</th>
                <th className="px-6 py-3 font-medium">Data Principal</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((req) => {
                const status = statusConfig[req.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-brand-600">
                        {req.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {req.name}
                        </p>
                        <p className="text-xs text-slate-500">{req.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {req.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.priority === "high"
                            ? "bg-red-50 text-red-700"
                            : req.priority === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {req.dueDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {req.assignedTo}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New DSAR Modal (simple) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Create New DSAR
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data Principal Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Request Type
                </label>
                <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option>Access Request</option>
                  <option>Erasure Request</option>
                  <option>Correction Request</option>
                  <option>Portability Request</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  alert("DSAR created successfully! (Demo)");
                }}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
