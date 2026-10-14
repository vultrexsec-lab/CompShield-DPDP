"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Loader2, Plus, CheckCircle2, XCircle, Link2, Fingerprint } from "lucide-react";
import {
  listConsent, createConsent, withdrawConsent,
  listConsentArtifacts, verifyConsentChain, type ConsentItem,
} from "@/lib/api";

export default function ConsentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chain, setChain] = useState<any>(null);
  const [form, setForm] = useState({
    principal_name: "",
    principal_email: "",
    purpose: "Marketing Communications",
    channel: "website",
    notice_version: "v1.0",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([listConsent(), listConsentArtifacts()]);
      setItems(c);
      setArtifacts(a);
    } catch (e: any) {
      alert(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.principal_name?.toLowerCase().includes(q) ||
      c.principal_email?.toLowerCase().includes(q) ||
      c.purpose?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createConsent(form);
      setShowForm(false);
      setForm({ principal_name: "", principal_email: "", purpose: "Marketing Communications", channel: "website", notice_version: "v1.0" });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm("Withdraw consent? Linked vendors/processors will be notified.")) return;
    setBusy(true);
    try {
      await withdrawConsent(id);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Management</h1>
          <p className="text-slate-500 mt-1">
            Lifecycle · immutable SHA-256 artifacts · revoke notifies processors
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              setShowAudit(true);
              try {
                setChain(await verifyConsentChain());
              } catch (e: any) {
                alert(e.message);
              }
            }}
            className="px-4 py-2.5 border rounded-xl text-sm font-medium inline-flex items-center gap-2"
          >
            <Fingerprint className="w-4 h-4" /> Audit trail
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
            <Plus className="w-4 h-4" /> Record Consent
          </button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-900">
        <strong>DPDP:</strong> Withdrawal must be as easy as giving consent. On revoke we write a
        tamper-evident hash and notify matched vendors (purpose mapping / vendor registry).
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <th className="px-4 py-3">Principal</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Artifact hash</th>
                <th className="px-4 py-3">Vendors notified</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{c.principal_name}</p>
                    <p className="text-xs text-slate-500">{c.principal_email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.purpose}</td>
                  <td className="px-4 py-3 text-sm capitalize">{c.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={c.artifact_hash || c.revoke_hash}>
                    {(c.revoke_hash || c.artifact_hash || "—").slice(0, 12)}…
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.vendors_notified || "—"}</td>
                  <td className="px-4 py-3">
                    {c.status === "active" && (
                      <button disabled={busy} onClick={() => handleWithdraw(c.id)} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-medium">
                        Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-slate-400 text-sm">No consent records</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3">
            <h3 className="font-semibold text-lg">Record Consent</h3>
            <p className="text-xs text-slate-500">Creates an immutable SHA-256 grant artifact.</p>
            <input required placeholder="Principal name" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} />
            <input required type="email" placeholder="Email" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })} />
            <input required placeholder="Purpose" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="website">Website</option>
              <option value="app">App</option>
              <option value="email">Email</option>
              <option value="offline">Offline</option>
            </select>
            <input placeholder="Notice version" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.notice_version} onChange={(e) => setForm({ ...form, notice_version: e.target.value })} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium">{busy ? "..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {showAudit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Immutable consent audit trail</h3>
              <button onClick={() => setShowAudit(false)} className="text-slate-400 text-xl">×</button>
            </div>
            {chain && (
              <div className={`rounded-xl p-3 text-sm ${chain.valid ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                Chain: <strong>{chain.valid ? "VALID" : "INVALID"}</strong> · {chain.total} events
                <p className="text-xs mt-1 opacity-80">{chain.tip}</p>
              </div>
            )}
            <div className="space-y-2">
              {artifacts.map((a) => (
                <div key={a.id} className="border rounded-xl p-3 text-xs font-mono">
                  <div className="flex justify-between gap-2">
                    <span className="font-sans font-medium text-sm text-slate-800 capitalize">{a.event_type}</span>
                    <span className="text-slate-400">{a.created_at}</span>
                  </div>
                  <p className="mt-1 text-slate-600 font-sans">{a.principal_email} · {a.purpose}</p>
                  <p className="mt-1 truncate text-slate-500" title={a.artifact_hash}>hash: {a.artifact_hash}</p>
                  {a.prev_hash && <p className="truncate text-slate-400" title={a.prev_hash}>prev: {a.prev_hash}</p>}
                  {a.vendors_notified && (
                    <p className="mt-1 font-sans text-amber-700 inline-flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Processors: {a.vendors_notified}
                    </p>
                  )}
                </div>
              ))}
              {artifacts.length === 0 && <p className="text-center text-slate-400 py-8">No artifacts yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
