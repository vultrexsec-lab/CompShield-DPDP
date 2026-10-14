"use client";

import { useEffect, useState } from "react";
import {
  Plus, Search, Clock, CheckCircle2, AlertCircle, XCircle,
  Loader2, UserPlus, ArrowUpCircle, ShieldCheck, Check,
} from "lucide-react";
import {
  listDsar, createDsar, delegateDsar, escalateDsar, approveDsar, completeDsar,
  listApprovalConfigs, saveApprovalConfig, checkDsarSla, type DsarItem,
} from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  pending_approval: { label: "Awaiting Approval", color: "bg-purple-50 text-purple-700 border-purple-200" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200" },
  delegated: { label: "Delegated", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  escalated: { label: "Escalated", color: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function DsarPage() {
  const [items, setItems] = useState<DsarItem[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [delegateTo, setDelegateTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    request_type: "access",
    principal_name: "",
    principal_email: "",
    description: "",
  });

  const load = () => {
    setLoading(true);
    Promise.all([listDsar(), listApprovalConfigs()])
      .then(([d, c]) => {
        setItems(d as any);
        setConfigs(c);
      })
      .catch((e) => alert(e.message || "Load failed — login with live session"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((r) => {
    const q = search.toLowerCase();
    const match =
      r.principal_name?.toLowerCase().includes(q) ||
      r.principal_email?.toLowerCase().includes(q) ||
      r.request_id?.toLowerCase().includes(q);
    if (!match) return false;
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createDsar(form);
      setShowForm(false);
      setForm({ request_type: "access", principal_name: "", principal_email: "", description: "" });
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doDelegate = async (id: number) => {
    if (!delegateTo.trim()) return alert("Enter assignee email/name");
    setBusy(true);
    try {
      await delegateDsar(id, delegateTo.trim());
      setActionId(null);
      setDelegateTo("");
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const counts = {
    pending: items.filter((i) => i.status === "pending" || i.status === "pending_approval").length,
    in_progress: items.filter((i) => i.status === "in_progress" || i.status === "delegated").length,
    escalated: items.filter((i) => (i as any).escalated || i.status === "escalated").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DSAR Management</h1>
          <p className="text-slate-500 mt-1">
            Intake → Approval → Delegation → Fulfilment — DPDP rights workflow
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              setBusy(true);
              try {
                const r = await checkDsarSla();
                alert(`SLA check done. Escalated: ${r.escalated_count}` + (r.request_ids?.length ? `\n${r.request_ids.join(", ")}` : ""));
                load();
              } catch (e: any) { alert(e.message); }
              finally { setBusy(false); }
            }}
            className="px-4 py-2.5 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl text-sm font-medium hover:bg-amber-100 inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" /> Run SLA check
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Approval Rules
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl"
          >
            <Plus className="w-4 h-4" /> New DSAR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Pending / Approval</p><p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">In Progress</p><p className="text-2xl font-bold text-blue-600 mt-1">{counts.in_progress}</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Escalated</p><p className="text-2xl font-bold text-red-600 mt-1">{counts.escalated}</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{counts.completed}</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "pending_approval", "delegated", "escalated", "in_progress", "completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize ${filter === f ? "bg-brand-600 text-white" : "bg-white border text-slate-600"}`}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r: any) => {
                  const st = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-mono text-brand-600">{r.request_id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{r.principal_name}</p>
                        <p className="text-xs text-slate-500">{r.principal_email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{r.request_type}
                        {r.priority === "high" && <span className="ml-1 text-xs text-red-600">●</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.approval_status === "pending_approval"
                          ? `L${r.current_approval_level || 0}/${r.required_approval_levels || 1}`
                          : r.approval_status || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.delegated_to || r.assigned_to || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.approval_status === "pending_approval" && (
                            <>
                              <button disabled={busy} onClick={async () => { setBusy(true); try { await approveDsar(r.id, "approved"); load(); } catch (e: any) { alert(e.message); } finally { setBusy(false); } }} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">Approve</button>
                              <button disabled={busy} onClick={async () => { setBusy(true); try { await approveDsar(r.id, "rejected"); load(); } catch (e: any) { alert(e.message); } finally { setBusy(false); } }} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg font-medium">Reject</button>
                            </>
                          )}
                          {r.status !== "completed" && r.status !== "rejected" && (
                            <>
                              <button onClick={() => setActionId(r.id)} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium inline-flex items-center gap-1"><UserPlus className="w-3 h-3" />Delegate</button>
                              {!r.escalated && (
                                <button disabled={busy} onClick={async () => { setBusy(true); try { await escalateDsar(r.id); load(); } catch (e: any) { alert(e.message); } finally { setBusy(false); } }} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium inline-flex items-center gap-1"><ArrowUpCircle className="w-3 h-3" />Escalate</button>
                              )}
                              {(r.approval_status === "approved" || r.approval_status === "not_required") && r.status !== "completed" && (
                                <button disabled={busy} onClick={async () => { setBusy(true); try { await completeDsar(r.id); load(); } catch (e: any) { alert(e.message); } finally { setBusy(false); } }} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium inline-flex items-center gap-1"><Check className="w-3 h-3" />Complete</button>
                              )}
                            </>
                          )}
                        </div>
                        {actionId === r.id && (
                          <div className="mt-2 flex gap-1">
                            <input value={delegateTo} onChange={(e) => setDelegateTo(e.target.value)} placeholder="Assignee email" className="text-xs border rounded-lg px-2 py-1 flex-1" />
                            <button onClick={() => doDelegate(r.id)} className="text-xs bg-brand-600 text-white px-2 py-1 rounded-lg">OK</button>
                            <button onClick={() => setActionId(null)} className="text-xs border px-2 py-1 rounded-lg">×</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No requests</p>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create DSAR</h3>
            <p className="text-xs text-slate-500">Erasure / restriction auto-route to multi-level approval if configured.</p>
            <select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm">
              <option value="access">Access</option>
              <option value="erasure">Erasure (high risk)</option>
              <option value="correction">Correction</option>
              <option value="portability">Portability</option>
              <option value="restriction">Restriction</option>
            </select>
            <input required placeholder="Principal name" value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            <input required type="email" placeholder="Email" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" rows={2} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-xl text-sm">Cancel</button>
              <button disabled={busy} type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">{busy ? "..." : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">DSAR Approval Rules</h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <p className="text-sm text-slate-500">High-risk types (e.g. erasure) require multi-level approval before fulfilment.</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2">Request type</th>
                  <th className="py-2">Approval required</th>
                  <th className="py-2">Levels</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">SLA days</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="py-2 capitalize font-medium">{c.request_type}</td>
                    <td className="py-2">{c.requires_approval ? "Yes" : "No"}</td>
                    <td className="py-2">{c.approval_levels}</td>
                    <td className="py-2 capitalize">{c.priority}</td>
                    <td className="py-2">{c.sla_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t pt-4">
              <p className="text-xs font-medium text-slate-700 mb-2">Update rule</p>
              <form
                className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await saveApprovalConfig({
                    request_type: fd.get("request_type"),
                    requires_approval: fd.get("requires_approval") === "on",
                    approval_levels: Number(fd.get("approval_levels") || 1),
                    priority: fd.get("priority") || "high",
                    sla_days: Number(fd.get("sla_days") || 30),
                  });
                  load();
                }}
              >
                <select name="request_type" className="border rounded-lg px-2 py-2 text-xs">
                  <option value="erasure">Erasure</option>
                  <option value="access">Access</option>
                  <option value="restriction">Restriction</option>
                  <option value="correction">Correction</option>
                  <option value="portability">Portability</option>
                </select>
                <label className="flex items-center gap-1 text-xs border rounded-lg px-2"><input type="checkbox" name="requires_approval" defaultChecked /> Required</label>
                <input name="approval_levels" type="number" min={0} max={5} defaultValue={2} className="border rounded-lg px-2 py-2 text-xs" placeholder="Levels" />
                <select name="priority" className="border rounded-lg px-2 py-2 text-xs"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                <button type="submit" className="bg-brand-600 text-white rounded-lg text-xs font-medium py-2">Save rule</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
