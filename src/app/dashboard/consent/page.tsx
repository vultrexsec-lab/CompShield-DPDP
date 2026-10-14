"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Loader2, Plus, CheckCircle2, XCircle } from "lucide-react";
import { listConsent, createConsent, withdrawConsent, type ConsentItem } from "@/lib/api";

const MOCK: ConsentItem[] = [
  { id: 1, principal_name: "Priya Sharma", principal_email: "priya.sharma@email.com", purpose: "Marketing Communications", channel: "email", status: "active", given_at: "2026-08-15" },
  { id: 2, principal_name: "Amit Patel", principal_email: "amit.patel@company.in", purpose: "Product Analytics", channel: "app", status: "active", given_at: "2026-07-22" },
  { id: 3, principal_name: "Neha Gupta", principal_email: "neha.g@gmail.com", purpose: "Third-party Sharing", channel: "website", status: "withdrawn", given_at: "2026-05-10" },
];

export default function ConsentPage() {
  const [items, setItems] = useState<ConsentItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ principal_name: "", principal_email: "", purpose: "Marketing Communications", channel: "website" });

  const load = () => {
    setLoading(true);
    listConsent()
      .then((d) => { setItems(d); setLive(true); })
      .catch(() => { setItems(MOCK); setLive(false); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(
    (c) =>
      c.principal_name.toLowerCase().includes(search.toLowerCase()) ||
      c.principal_email.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (live) {
        await createConsent(form);
        load();
      } else {
        setItems((p) => [{ id: Date.now(), status: "active", given_at: new Date().toISOString(), ...form }, ...p]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleWithdraw = async (id: number) => {
    try {
      if (live) {
        await withdrawConsent(id);
        load();
      } else {
        setItems((p) => p.map((c) => (c.id === id ? { ...c, status: "withdrawn" } : c)));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const active = items.filter((i) => i.status === "active").length;
  const withdrawn = items.filter((i) => i.status === "withdrawn").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Management</h1>
          <p className="text-slate-500 mt-1">Track purpose-based consents across channels</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl">
            <Plus className="w-4 h-4" /> Add Consent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold text-slate-900 mt-1">{items.length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Active</p><p className="text-2xl font-bold text-emerald-600 mt-1">{active}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-sm text-slate-500">Withdrawn</p><p className="text-2xl font-bold text-red-600 mt-1">{withdrawn}</p></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search consents..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 font-medium">Principal</th>
                  <th className="px-6 py-3 font-medium">Purpose</th>
                  <th className="px-6 py-3 font-medium">Channel</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Given</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{c.principal_name}</p>
                      <p className="text-xs text-slate-500">{c.principal_email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{c.purpose}</td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-600">{c.channel}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {c.status === "active" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{c.given_at?.slice(0, 10) || "—"}</td>
                    <td className="px-6 py-4">
                      {c.status === "active" && (
                        <button onClick={() => handleWithdraw(c.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Withdraw</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Consent Record</h3>
            <input required placeholder="Name" value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input required type="email" placeholder="Email" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <input required placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">
              <option value="website">Website</option>
              <option value="app">App</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border rounded-xl text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
