"use client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api";
export default function SettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(()=>{ getSettings().then(setForm).catch(alert).finally(()=>setLoading(false)); },[]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div>;
  if (!form) return <p className="text-slate-500">Unable to load settings — login with live backend session</p>;
  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="text-slate-500 mt-1">Organization preferences</p></div>
      <form onSubmit={async(e)=>{e.preventDefault();setSaving(true);try{const u=await updateSettings({company_name:form.company_name,dpo_name:form.dpo_name,dpo_email:form.dpo_email,timezone:form.timezone,dsar_sla_days:Number(form.dsar_sla_days),notify_email:form.notify_email,notify_inapp:form.notify_inapp});setForm(u);setMsg("Saved");}catch(err:any){setMsg(err.message);}finally{setSaving(false);}}} className="bg-white border rounded-2xl p-6 space-y-4">
        <div><label className="text-sm font-medium">Company name</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.company_name||""} onChange={e=>setForm({...form,company_name:e.target.value})}/></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">DPO name</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.dpo_name||""} onChange={e=>setForm({...form,dpo_name:e.target.value})}/></div>
          <div><label className="text-sm font-medium">DPO email</label><input type="email" className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.dpo_email||""} onChange={e=>setForm({...form,dpo_email:e.target.value})}/></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Timezone</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.timezone||"Asia/Kolkata"} onChange={e=>setForm({...form,timezone:e.target.value})}/></div>
          <div><label className="text-sm font-medium">DSAR SLA days</label><input type="number" className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.dsar_sla_days??30} onChange={e=>setForm({...form,dsar_sla_days:e.target.value})}/></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notify_email} onChange={e=>setForm({...form,notify_email:e.target.checked})}/> Email notifications</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.notify_inapp} onChange={e=>setForm({...form,notify_inapp:e.target.checked})}/> In-app notifications</label>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <button disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium"><Save className="w-4 h-4"/>{saving?"Saving...":"Save"}</button>
      </form>
    </div>
  );
}
