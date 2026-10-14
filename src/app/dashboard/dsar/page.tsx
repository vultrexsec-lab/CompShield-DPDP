"use client";

import { useEffect, useState } from "react";
import {
  FileText, Plus, Search, Clock, CheckCircle2, AlertCircle, XCircle, Loader2,
} from "lucide-react";
import { listDsar, createDsar, type DsarItem } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const MOCK: DsarItem[] = [
  { id: 1, request_id: "DSAR-2026-0891", request_type: "access", status: "pending", principal_name: "Priya Sharma", principal_email: "priya.sharma@email.com", assigned_to: "Rahul Verma", due_date: "2026-10-27", created_at: "2026-10-13" },
  { id: 2, request_id: "DSAR-2026-0890", request_type: "erasure", status: "in_progress", principal_name: "Amit Patel", principal_email: "amit.patel@company.in", assigned_to: "Sneha Kapoor", due_date: "2026-10-26", created_at: "2026-10-12" },
  { id: 3, request_id: "DSAR-2026-0889", request_type: "correction", status: "completed", principal_name: "Neha Gupta", principal_email: "neha.g@gmail.com", assigned_to: "Rahul Verma", due_date: "2026-10-24", created_at: "2026-10-10" },
];

export default function DsarPage() {
  const [items, setItems] = useState<DsarItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    request_type: "access",
    principal_name: "",
    principal_email: "",
    description: "",
  });

  const load = () => {
    setLoading(true);
    listDsar()
      .then((data) => {
        setItems(data);
        setLive(true);
      })
      .catch(() => {
        setItems(MOCK);
        setLive(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(
    (r) =>
      r.principal_name.toLowerCase().includes(search.toLowerCase()) ||
      r.principal_email.toLowerCase().includes(search.toLowerCase()) ||
      r.request_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (live) {
        await createDsar(form);
        load();
      } else {
        setItems((prev) => [
          {
            id: Date.now(),
            request_id: `DSAR-LOCAL-${prev.length + 1}`,
            status: "pending",
            ...form,
            created_at: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
      }
      setShowForm(false);
      setForm({ request_type: "access", principal_name: "", principal_email: "", description: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DSAR Management</h1>
          <p className="text-slate-500 mt-1">Data Principal Access Requests — DPDP rights fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
            <Plus className="w-4 h-4" /> New DSAR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">In Progress</p><p className="text-2xl font-bold text-blue-600 mt-1">{counts.in_progress}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{counts.completed}</p></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, ID..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 font-medium">Request ID</th>
                  <th className="px-6 py-3 font-medium">Principal</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Assigned</th>
                  <th className="px-6 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => {
                  const st = statusConfig[r.status] || statusConfig.pending;
                  const Icon = st.icon;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-mono text-brand-600">{r.request_id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{r.principal_name}</p>
                        <p className="text-xs text-slate-500">{r.principal_email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-700">{r.request_type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                          <Icon className="w-3.5 h-3.5" />{st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{r.assigned_to || "—"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{r.due_date || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No requests found</p>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Create DSAR</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">
                <option value="access">Access</option>
                <option value="erasure">Erasure</option>
                <option value="correction">Correction</option>
                <option value="portability">Portability</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input required value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
