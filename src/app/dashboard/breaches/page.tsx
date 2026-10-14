"use client";
import { useEffect, useState } from "react";
import { Siren, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { listBreaches, createBreach, updateBreach } from "@/lib/api";

export default function BreachesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", severity: "medium", affected: "" });

  const load = () => { setLoading(true); listBreaches().then(setItems).catch(alert).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBreach(form);
    setShow(false); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Breach Management</h1>
          <p className="text-slate-500 mt-1">Incidents, Board notification, and user alerts</p>
        </div>
        <button onClick={()=>setShow(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium"><Plus className="w-4 h-4"/>Log Incident</button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
        Under DPDP, significant breaches must be reported to the Data Protection Board and affected principals without undue delay.
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div> : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <th className="px-6 py-3">ID</th><th className="px-6 py-3">Title</th><th className="px-6 py-3">Severity</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Board</th><th className="px-6 py-3">Users</th><th className="px-6 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {items.map((b)=>(
                <tr key={b.id}>
                  <td className="px-6 py-4 text-sm font-mono text-brand-600">{b.incident_id}</td>
                  <td className="px-6 py-4"><p className="text-sm font-medium">{b.title}</p><p className="text-xs text-slate-500">{b.affected}</p></td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${b.severity==="high"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700"}`}>{b.severity}</span></td>
                  <td className="px-6 py-4 text-sm capitalize">{b.status}</td>
                  <td className="px-6 py-4">{b.notified_board ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : "—"}</td>
                  <td className="px-6 py-4">{b.notified_users ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : "—"}</td>
                  <td className="px-6 py-4 space-x-2">
                    {!b.notified_board && <button className="text-xs text-brand-600 font-medium" onClick={async()=>{await updateBreach(b.id,{notified_board:true});load();}}>Notify Board</button>}
                    {b.status!=="resolved" && <button className="text-xs text-emerald-600 font-medium" onClick={async()=>{await updateBreach(b.id,{status:"resolved"});load();}}>Resolve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length===0 && <p className="text-center py-12 text-slate-400 text-sm">No incidents</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">Log Incident</h3>
            <input required placeholder="Title" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Affected data" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.affected} onChange={e=>setForm({...form,affected:e.target.value})}/>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button><button className="flex-1 bg-brand-600 text-white rounded-xl py-2.5">Log</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
