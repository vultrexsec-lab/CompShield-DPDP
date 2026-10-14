"use client";

import { useEffect, useState } from "react";
import { Wrench, Loader2, CheckCircle2, Clock, Lock, EyeOff, Shield, Trash2 } from "lucide-react";
import { listRemediation, updateRemediation, createRemediation, type RemediationItem } from "@/lib/api";

const MOCK: RemediationItem[] = [
  { id: 1, task_id: "REM-001", title: "Unencrypted Aadhaar in HR DB", action: "encrypt", severity: "high", status: "open", source: "HR Database" },
  { id: 2, task_id: "REM-002", title: "PAN in plain PDF on S3", action: "mask", severity: "high", status: "in_progress", source: "AWS S3" },
  { id: 3, task_id: "REM-003", title: "Withdrawn consents in campaign list", action: "restrict", severity: "medium", status: "open", source: "Marketing" },
  { id: 4, task_id: "REM-004", title: "Card numbers without tokenization", action: "encrypt", severity: "high", status: "completed", source: "Payments" },
];

const actionIcons: Record<string, typeof Lock> = {
  encrypt: Lock, mask: EyeOff, restrict: Shield, delete: Trash2,
};

export default function RemediationPage() {
  const [items, setItems] = useState<RemediationItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    listRemediation()
      .then((d) => { setItems(d); setLive(true); })
      .catch(() => { setItems(MOCK); setLive(false); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) => filter === "all" || i.status === filter);

  const handleComplete = async (id: number) => {
    try {
      if (live) {
        await updateRemediation(id, { status: "completed" });
        load();
      } else {
        setItems((p) => p.map((t) => (t.id === id ? { ...t, status: "completed" } : t)));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleAdd = async () => {
    const title = prompt("Remediation title");
    if (!title) return;
    try {
      if (live) {
        await createRemediation({ title, action: "mask", severity: "medium" });
        load();
      } else {
        setItems((p) => [{ id: Date.now(), task_id: `REM-${p.length + 1}`, title, action: "mask", severity: "medium", status: "open" }, ...p]);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const counts = {
    open: items.filter((i) => i.status === "open").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Remediation Hub</h1>
          <p className="text-slate-500 mt-1">Find AND fix — encrypt, mask, restrict, delete</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
          <button onClick={handleAdd} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm">New Task</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Open</p><p className="text-2xl font-bold text-red-600 mt-1">{counts.open}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">In Progress</p><p className="text-2xl font-bold text-blue-600 mt-1">{counts.in_progress}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{counts.completed}</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "open", "in_progress", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${filter === f ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => {
                const Icon = actionIcons[t.action] || Wrench;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-mono text-brand-600">{t.task_id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{t.title}</p>
                      {t.source && <p className="text-xs text-slate-400">{t.source}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm capitalize text-slate-700">
                        <Icon className="w-3.5 h-3.5" />{t.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{t.severity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${t.status === "completed" ? "text-emerald-600" : t.status === "in_progress" ? "text-blue-600" : "text-amber-600"}`}>
                        {t.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.status !== "completed" && (
                        <button onClick={() => handleComplete(t.id)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Mark Done</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No tasks</p>}
        </div>
      )}
    </div>
  );
}
