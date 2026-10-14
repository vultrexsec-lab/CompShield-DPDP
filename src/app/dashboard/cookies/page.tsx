"use client";
import { useEffect, useState } from "react";
import { Cookie, Plus, Loader2 } from "lucide-react";
import { listCookies, createCookie, updateCookie } from "@/lib/api";
export default function CookiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ domain: "", banner_enabled: true, analytics: true, marketing: false, essential_only: false });
  const load = () => { setLoading(true); listCookies().then(setItems).catch((e)=>alert(e.message)).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Cookie Consent</h1><p className="text-slate-500 mt-1">Banner configuration</p></div>
        <button onClick={()=>setShow(true)} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium inline-flex gap-2 items-center"><Plus className="w-4 h-4"/>Add Domain</button>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c)=>(
            <div key={c.id} className="bg-white border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Cookie className="w-5 h-5"/></div>
                <div><h3 className="font-semibold">{c.domain}</h3><p className="text-xs text-slate-500">{c.consent_count||0} consents</p></div>
              </div>
              <div className="space-y-2 text-sm">
                <label className="flex justify-between"><span>Banner</span><input type="checkbox" checked={!!c.banner_enabled} onChange={async(e)=>{await updateCookie(c.id,{domain:c.domain,banner_enabled:e.target.checked,analytics:c.analytics,marketing:c.marketing,essential_only:c.essential_only});load();}}/></label>
                <label className="flex justify-between"><span>Analytics</span><input type="checkbox" checked={!!c.analytics} onChange={async(e)=>{await updateCookie(c.id,{domain:c.domain,banner_enabled:c.banner_enabled,analytics:e.target.checked,marketing:c.marketing,essential_only:c.essential_only});load();}}/></label>
                <label className="flex justify-between"><span>Marketing</span><input type="checkbox" checked={!!c.marketing} onChange={async(e)=>{await updateCookie(c.id,{domain:c.domain,banner_enabled:c.banner_enabled,analytics:c.analytics,marketing:e.target.checked,essential_only:c.essential_only});load();}}/></label>
              </div>
            </div>
          ))}
          {items.length===0 && <p className="text-slate-400 col-span-2 text-center py-12">No configs</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={async(e)=>{e.preventDefault();await createCookie(form);setShow(false);load();}} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-lg">Add Domain</h3>
            <input required placeholder="www.example.com" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})}/>
            <div className="flex gap-2"><button type="button" onClick={()=>setShow(false)} className="flex-1 border rounded-xl py-2.5">Cancel</button><button className="flex-1 bg-brand-600 text-white rounded-xl py-2.5">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
