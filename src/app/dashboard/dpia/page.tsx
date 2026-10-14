"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";
import { listDpia, createDpia } from "@/lib/api";
export default function DpiaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", risk_level: "medium", owner: "", summary: "", status: "draft" });
  const load = () => { setLoading(true); listDpia().then(setItems).catch((e)=>alert(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">DPIA</h1><p className="text-slate-500 mt-1">Data Protection Impact Assessments</p></div>
        <button onClick={()=>setShow(true)} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium inline-flex gap-2 items-center"><Plus className="w-4 h-4"/>New DPIA</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div> : (
        <div className="grid gap-4">
          {items.map((d)=>(
            <div key={d.id} className="bg-white border rounded-2xl p-5 flex gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl h-fit"><AlertTriangle className="w-5 h-5"/></div>
              <div>
                <h3 className="font-semibold">{d.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{d.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-full capitalize">{d.status}</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{d.risk_level} risk</span>
                  {d.owner && <span className="px-2.5 py-1 bg-slate-100 rounded-full">Owner: {d.owner}</span>}
                </div>
              </div>
            </div>
          ))}
          {items.length===0 && <p className="text-center text-slate-400 py-12">No DPIAs</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={async(e)=>{e.preventDefault();await createDpia(form);setShow(false);load();}} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">New DPIA</h3>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Owner" value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/>
            <textarea className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Summary" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.risk_level} onChange={e=>setForm({...form,risk_level:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
            <div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button><button className="flex-1 bg-brand-600 text-white rounded-xl py-2.5">Create</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
