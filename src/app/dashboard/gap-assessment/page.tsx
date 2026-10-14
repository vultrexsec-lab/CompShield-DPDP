"use client";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { listGaps, createGap, updateGap } from "@/lib/api";

export default function GapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", department: "General", severity: "medium", recommendation: "" });
  const load = () => { setLoading(true); listGaps().then(setItems).catch((e)=>alert(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Gap Assessment</h1><p className="text-slate-500 mt-1">Compliance gaps and recommendations</p></div>
        <button onClick={()=>setShow(true)} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium inline-flex items-center gap-2"><Plus className="w-4 h-4"/>Add Gap</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div> : (
        <div className="space-y-3">
          {items.map((g)=>(
            <div key={g.id} className="bg-white border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div><p className="font-medium">{g.title}</p><p className="text-xs text-slate-500 mt-1">{g.department} · {g.recommendation}</p></div>
              <div className="flex items-center gap-3">
                <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (g.severity==="high"?"bg-red-50 text-red-700":"bg-amber-50 text-amber-700")}>{g.severity}</span>
                <span className="text-xs capitalize">{g.status}</span>
                {g.status==="open" && <button onClick={async()=>{await updateGap(g.id,"closed");load();}} className="text-xs text-brand-600 font-medium">Close</button>}
              </div>
            </div>
          ))}
          {items.length===0 && <p className="text-center text-slate-400 py-12">No gaps</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={async(e)=>{e.preventDefault();await createGap(form);setShow(false);load();}} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">Add Gap</h3>
            <input required className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/>
            <textarea className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Recommendation" value={form.recommendation} onChange={e=>setForm({...form,recommendation:e.target.value})}/>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
            <div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button><button className="flex-1 bg-brand-600 text-white rounded-xl py-2.5">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
