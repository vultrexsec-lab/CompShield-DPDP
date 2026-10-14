"use client";

import { useEffect, useState } from "react";
import { Siren, Plus, Loader2, Shield, FileText, Users, CheckCircle } from "lucide-react";
import {
  listBreaches, createBreach,
  breachNotifyBoard, breachDetailedReport, breachNotifyPrincipals, breachClose,
} from "@/lib/api";

const STEPS = [
  { key: "investigating", label: "1. Detected / Investigating" },
  { key: "board_notified", label: "2. Board notified (immediate)" },
  { key: "detailed_report", label: "3. Detailed report (≤72h)" },
  { key: "principals_notified", label: "4. Principals notified" },
  { key: "closed", label: "5. Closed" },
];

export default function BreachesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "high",
    affected: "",
    description: "",
    data_categories: "",
    detected_at: new Date().toISOString().slice(0, 16),
  });

  const load = () => {
    setLoading(true);
    listBreaches()
      .then(setItems)
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const act = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Breach Management</h1>
          <p className="text-slate-500 mt-1">
            DPDP Rule 7 — Board intimation → 72h detailed report → notify principals
          </p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
        <strong>Legal timeline:</strong> Initial intimation to the Data Protection Board without delay;
        detailed report within <strong>72 hours</strong>; affected data principals notified without delay.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => (
            <div key={b.id} className="bg-white border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Siren className={`w-5 h-5 ${b.severity === "critical" || b.severity === "high" ? "text-red-600" : "text-amber-600"}`} />
                    <h3 className="font-semibold">{b.title}</h3>
                    <span className="text-xs font-mono text-slate-500">{b.incident_id}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{b.description || "—"}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full capitalize">{b.severity}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full capitalize">{b.status?.replace(/_/g, " ")}</span>
                    {b.affected && <span className="px-2 py-0.5 bg-slate-100 rounded-full">Affected: {b.affected}</span>}
                    {b.deadline_72h && <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full">72h deadline: {b.deadline_72h}</span>}
                  </div>
                  <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>Board: {b.board_notified_at || (b.notified_board ? "Yes" : "—")}</div>
                    <div>Detailed report: {b.detailed_report_at || "—"}</div>
                    <div>Principals: {b.principals_notified_at || (b.notified_users ? "Yes" : "—")}</div>
                  </div>
                </div>
              </div>
              {/* workflow buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {!b.notified_board && b.status !== "closed" && (
                  <button disabled={busy} onClick={() => act(() => breachNotifyBoard(b.id))} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-medium inline-flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Notify Board
                  </button>
                )}
                {b.notified_board && !b.detailed_report_at && b.status !== "closed" && (
                  <button disabled={busy} onClick={() => act(() => breachDetailedReport(b.id))} className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> File detailed report (72h)
                  </button>
                )}
                {b.detailed_report_at && !b.notified_users && b.status !== "closed" && (
                  <button disabled={busy} onClick={() => act(() => breachNotifyPrincipals(b.id))} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Notify principals
                  </button>
                )}
                {b.status !== "closed" && (
                  <button disabled={busy} onClick={() => act(() => breachClose(b.id))} className="text-xs px-3 py-1.5 border rounded-lg font-medium inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Close
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {STEPS.map((s) => {
                  const order = STEPS.map((x) => x.key);
                  const cur = order.indexOf(b.status === "investigating" && b.notified_board ? "board_notified" : b.status);
                  const idx = order.indexOf(s.key);
                  const done = idx <= cur || (s.key === "board_notified" && b.notified_board) || (s.key === "detailed_report" && b.detailed_report_at) || (s.key === "principals_notified" && b.notified_users);
                  return (
                    <span key={s.key} className={`text-[10px] px-2 py-0.5 rounded-full ${done ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                      {s.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-400 py-12">No incidents</p>}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await createBreach({
                  title: form.title,
                  severity: form.severity,
                  affected: form.affected,
                  description: form.description,
                  data_categories: form.data_categories,
                  detected_at: form.detected_at,
                  status: "investigating",
                } as any);
                setShow(false);
                load();
              } catch (err: any) {
                alert(err.message);
              } finally {
                setBusy(false);
              }
            }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3"
          >
            <h3 className="font-semibold text-lg">Report personal data breach</h3>
            <input required placeholder="Title" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input placeholder="Affected count / segment" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.affected} onChange={(e) => setForm({ ...form, affected: e.target.value })} />
            <input placeholder="Data categories (e.g. Aadhaar, Email)" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.data_categories} onChange={(e) => setForm({ ...form, data_categories: e.target.value })} />
            <textarea placeholder="Description" className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <label className="text-xs text-slate-500">Detected at</label>
              <input type="datetime-local" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.detected_at} onChange={(e) => setForm({ ...form, detected_at: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShow(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
