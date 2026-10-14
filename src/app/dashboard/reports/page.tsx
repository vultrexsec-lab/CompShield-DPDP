"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Download } from "lucide-react";
import { getReportsSummary } from "@/lib/api";
export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(()=>{ getReportsSummary().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-slate-400"/></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Reports & Audit</h1><p className="text-slate-500 mt-1">{data?.organization}</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[["DSARs",data?.dsar_total],["Consents",data?.consent_total],["Sources",data?.sources_total],["ROPA",data?.ropa_total],["Remediation open",data?.remediation_open],["Vendors",data?.vendors_total],["Breaches",data?.breaches_total],["Gaps open",data?.gaps_open]].map(([l,v])=>(
          <div key={String(l)} className="bg-white border rounded-2xl p-4"><p className="text-xs text-slate-500">{l}</p><p className="text-xl font-bold mt-1">{v??0}</p></div>
        ))}
      </div>
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">Available reports</div>
        <div className="divide-y">
          {(data?.reports||[]).map((r:any)=>(
            <div key={r.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400"/><div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-slate-500 capitalize">{r.type}</p></div></div>
              <button onClick={()=>{const blob=new Blob([JSON.stringify({report:r,summary:data,exported_at:new Date().toISOString()},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=r.id+".json";a.click();}} className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium"><Download className="w-4 h-4"/>Export</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
