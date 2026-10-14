"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Plus, Loader2 } from "lucide-react";
import { listRopa, createRopa, type RopaItem } from "@/lib/api";

const MOCK: RopaItem[] = [
  { id: 1, activity_name: "Employee Onboarding", purpose: "HR administration and payroll", legal_basis: "employment", data_categories: "Name, Aadhaar, PAN, Bank", data_subjects: "employees", cross_border: false, retention_period: "3 years" },
  { id: 2, activity_name: "Marketing Campaigns", purpose: "Product offers and newsletters", legal_basis: "consent", data_categories: "Name, Email, Phone", data_subjects: "customers", cross_border: false, retention_period: "2 years" },
  { id: 3, activity_name: "Customer Support", purpose: "Ticket resolution", legal_basis: "legitimate_use", data_categories: "Name, Email, Call recordings", data_subjects: "customers", cross_border: false, retention_period: "1 year" },
];

export default function RopaPage() {
  const [items, setItems] = useState<RopaItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    activity_name: "",
    purpose: "",
    legal_basis: "consent",
    data_categories: "",
    data_subjects: "customers",
    retention_period: "3 years",
  });

  const load = () => {
    setLoading(true);
    listRopa()
      .then((d) => { setItems(d); setLive(true); })
      .catch(() => { setItems(MOCK); setLive(false); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (live) {
        await createRopa(form);
        load();
      } else {
        setItems((p) => [{ id: Date.now(), cross_border: false, ...form }, ...p]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ROPA</h1>
          <p className="text-slate-500 mt-1">Records of Processing Activities — DPDP accountability</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid gap-4">
          {items.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><ClipboardList className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{r.activity_name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{r.purpose}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full">Basis: {r.legal_basis}</span>
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full">Subjects: {r.data_subjects}</span>
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full">Retention: {r.retention_period || "—"}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Data: {r.data_categories}</p>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-400 py-12">No ROPA entries yet</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold">Add ROPA Entry</h3>
            <input required placeholder="Activity name" value={form.activity_name} onChange={(e) => setForm({ ...form, activity_name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            <textarea required placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" rows={2} />
            <input required placeholder="Data categories" value={form.data_categories} onChange={(e) => setForm({ ...form, data_categories: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            <select value={form.legal_basis} onChange={(e) => setForm({ ...form, legal_basis: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm">
              <option value="consent">Consent</option>
              <option value="employment">Employment</option>
              <option value="legitimate_use">Legitimate Use</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
