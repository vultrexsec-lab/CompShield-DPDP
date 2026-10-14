"use client";
import { useEffect, useState } from "react";
import { Users, Plus, Loader2, Trash2 } from "lucide-react";
import { listVendors, createVendor, deleteVendor } from "@/lib/api";

export default function VendorsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", category: "SaaS", risk_level: "medium", contact_email: "", dpa_signed: false });

  const load = () => { setLoading(true); listVendors().then(setItems).catch(alert).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVendor(form);
    setShow(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Risk</h1>
          <p className="text-slate-500 mt-1">Third-party processors, DPAs, and risk ratings</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium"><Plus className="w-4 h-4" />Add Vendor</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div> : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <th className="px-6 py-3">Vendor</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Risk</th><th className="px-6 py-3">DPA</th><th className="px-6 py-3">Status</th><th className="px-6 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4"><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-slate-500">{v.contact_email}</p></td>
                  <td className="px-6 py-4 text-sm">{v.category}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.risk_level==="high"?"bg-red-50 text-red-700":v.risk_level==="low"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{v.risk_level}</span></td>
                  <td className="px-6 py-4 text-sm">{v.dpa_signed ? "Signed" : "Pending"}</td>
                  <td className="px-6 py-4 text-sm capitalize">{v.status}</td>
                  <td className="px-6 py-4"><button onClick={async()=>{await deleteVendor(v.id);load();}} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length===0 && <p className="text-center py-12 text-slate-400 text-sm">No vendors yet</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">Add Vendor</h3>
            <input required placeholder="Name" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <input placeholder="Contact email" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})}/>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.risk_level} onChange={e=>setForm({...form,risk_level:e.target.value})}>
              <option value="low">Low risk</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.dpa_signed} onChange={e=>setForm({...form,dpa_signed:e.target.checked})}/> DPA signed</label>
            <div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button><button className="flex-1 bg-brand-600 text-white rounded-xl py-2.5">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
