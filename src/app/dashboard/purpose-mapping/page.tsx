"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, Link2 } from "lucide-react";
import { listPurposes, createPurpose, deletePurpose, linkVendorPurpose, listVendors } from "@/lib/api";

export default function PurposeMappingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [linkId, setLinkId] = useState<number | null>(null);
  const [form, setForm] = useState({
    purpose_name: "",
    description: "",
    legal_basis: "consent",
    data_categories: "",
    retention_period: "2 years",
  });

  const load = () => {
    setLoading(true);
    Promise.all([listPurposes(), listVendors()])
      .then(([p, v]) => { setItems(p); setVendors(v); })
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purpose Mapping</h1>
          <p className="text-slate-500 mt-1">Link processing purposes to vendors and consent profiles</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          <Plus className="w-4 h-4" /> Add Purpose
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <div className="grid gap-4">
          {items.map((p) => (
            <div key={p.id} className="bg-white border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.purpose_name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-full capitalize">Basis: {p.legal_basis}</span>
                    {p.retention_period && <span className="px-2.5 py-1 bg-slate-100 rounded-full">Retention: {p.retention_period}</span>}
                    <span className={`px-2.5 py-1 rounded-full ${p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100"}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Data: {p.data_categories || "—"}</p>
                  <p className="text-xs text-slate-500 mt-1">Vendors: {p.vendor_names || "None linked"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setLinkId(p.id)} className="text-xs px-3 py-1.5 border rounded-lg font-medium inline-flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5" /> Link vendor
                  </button>
                  <button onClick={async () => { await deletePurpose(p.id); load(); }} className="text-slate-400 hover:text-red-600 p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {linkId === p.id && (
                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                  {vendors.length === 0 && <p className="text-xs text-slate-400">No vendors — onboard vendors first</p>}
                  {vendors.map((v) => (
                    <button key={v.id} onClick={async () => { await linkVendorPurpose(p.id, v.id); setLinkId(null); load(); }} className="text-xs px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                      {v.name}
                    </button>
                  ))}
                  <button onClick={() => setLinkId(null)} className="text-xs text-slate-500">Cancel</button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-400 py-12">No purposes yet</p>}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={async (e) => { e.preventDefault(); await createPurpose(form); setShow(false); load(); }} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3">
            <h3 className="font-semibold text-lg">Add Purpose</h3>
            <input required placeholder="Purpose name" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.purpose_name} onChange={(e) => setForm({ ...form, purpose_name: e.target.value })} />
            <textarea placeholder="Description" className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.legal_basis} onChange={(e) => setForm({ ...form, legal_basis: e.target.value })}>
              <option value="consent">Consent</option>
              <option value="contract">Contract</option>
              <option value="legitimate_use">Legitimate use</option>
              <option value="legal_obligation">Legal obligation</option>
            </select>
            <input placeholder="Data categories (comma-separated)" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.data_categories} onChange={(e) => setForm({ ...form, data_categories: e.target.value })} />
            <input placeholder="Retention period" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.retention_period} onChange={(e) => setForm({ ...form, retention_period: e.target.value })} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShow(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
