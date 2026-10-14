"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Loader2, Trash2, PenLine } from "lucide-react";
import { listDpaTemplates, createDpaTemplate, signDpa, deleteDpaTemplate, listVendors } from "@/lib/api";

export default function DpaTemplatesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [signId, setSignId] = useState<number | null>(null);
  const [signVendor, setSignVendor] = useState("");
  const [form, setForm] = useState({
    title: "",
    template_type: "custom",
    version: "1.0",
    body: "",
    status: "draft",
  });

  const load = () => {
    setLoading(true);
    Promise.all([listDpaTemplates(), listVendors()])
      .then(([d, v]) => { setItems(d); setVendors(v); })
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DPA Templates</h1>
          <p className="text-slate-500 mt-1">Data Processing Agreements — templates and signed records</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((d) => (
            <div key={d.id} className="bg-white border rounded-2xl p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${d.status === "signed" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm">{d.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full">v{d.version}</span>
                    <span className={`px-2 py-0.5 rounded-full capitalize ${d.status === "signed" ? "bg-emerald-50 text-emerald-700" : d.status === "active" ? "bg-blue-50 text-blue-700" : "bg-slate-100"}`}>{d.status}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full">{d.template_type}</span>
                  </div>
                  {d.vendor_name && <p className="text-xs text-slate-500 mt-2">Vendor: {d.vendor_name}</p>}
                  {d.signed_at && <p className="text-xs text-slate-500">Signed: {d.signed_at}{d.expires_at ? ` · Expires: ${d.expires_at}` : ""}</p>}
                  {d.body && <p className="text-xs text-slate-600 mt-2 line-clamp-3">{d.body}</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {d.status !== "signed" && (
                  <button onClick={() => setSignId(d.id)} className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg font-medium inline-flex items-center gap-1">
                    <PenLine className="w-3.5 h-3.5" /> Sign with vendor
                  </button>
                )}
                <button onClick={async () => { await deleteDpaTemplate(d.id); load(); }} className="text-xs px-3 py-1.5 text-red-600 rounded-lg">Delete</button>
              </div>
              {signId === d.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  <select className="w-full border rounded-lg px-2 py-2 text-sm" value={signVendor} onChange={(e) => setSignVendor(e.target.value)}>
                    <option value="">Select vendor</option>
                    {vendors.map((v) => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!signVendor) return alert("Select vendor");
                        const v = vendors.find((x) => String(x.id) === signVendor);
                        await signDpa(d.id, Number(signVendor), v?.name, undefined);
                        setSignId(null);
                        load();
                      }}
                      className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-xs font-medium"
                    >
                      Confirm sign
                    </button>
                    <button onClick={() => setSignId(null)} className="px-3 border rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && <p className="text-center text-slate-400 py-12">No DPA templates</p>}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={async (e) => { e.preventDefault(); await createDpaTemplate(form); setShow(false); load(); }} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-3">
            <h3 className="font-semibold text-lg">New DPA Template</h3>
            <input required placeholder="Title" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Version" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            <textarea required placeholder="Agreement body / clauses" className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
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
