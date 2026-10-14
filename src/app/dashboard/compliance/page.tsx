"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getComplianceScore } from "@/lib/api";

export default function CompliancePage() {
  const [sector, setSector] = useState("general");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = (s = sector) => {
    setLoading(true);
    getComplianceScore(s)
      .then(setData)
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(sector); }, [sector]);

  const gradeColor =
    data?.grade === "A" ? "text-emerald-600" :
    data?.grade === "B" ? "text-blue-600" :
    data?.grade === "C" ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-brand-600" /> DPDP Compliance
          </h1>
          <p className="text-slate-500 mt-1">
            Live score vs Act pillars · sector templates (RBI / IRDAI / healthcare)
          </p>
        </div>
        <select
          className="border rounded-xl px-3 py-2.5 text-sm"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          <option value="general">General DPDP</option>
          <option value="banking">Banking / NBFC (RBI)</option>
          <option value="insurance">Insurance (IRDAI)</option>
          <option value="healthcare">Healthcare</option>
        </select>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-2xl p-6 sm:col-span-1">
              <p className="text-sm text-slate-500">Overall readiness</p>
              <p className={`text-5xl font-bold mt-2 ${gradeColor}`}>{data.grade}</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">{data.percent}%</p>
              <p className="text-xs text-slate-400 mt-1">{data.score} / {data.max_score} points</p>
            </div>
            <div className="bg-white border rounded-2xl p-6 sm:col-span-2">
              <p className="text-sm font-medium text-slate-700">{data.sector_template?.name}</p>
              <p className="text-sm text-slate-600 mt-2">{data.sector_template?.notes}</p>
              <p className="text-xs text-slate-500 mt-3">
                Default retention: <strong>{data.sector_template?.retention_default_years} years</strong>
                {" · "}Mandatory purposes: {(data.sector_template?.consent_mandatory_purposes || []).join(", ")}
              </p>
              <ul className="mt-3 grid sm:grid-cols-2 gap-1">
                {(data.sector_template?.rules || []).map((r: string) => (
                  <li key={r} className="text-xs text-slate-600 flex gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b font-semibold text-sm">Pillar scores (IDfy / DPDP mapped)</div>
            <div className="divide-y">
              {data.pillars?.map((p: any) => (
                <div key={p.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.evidence}</p>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{p.score}/{p.max}</span>
                      <Link href={p.href} className="text-brand-600">Open</Link>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.score >= p.max ? "bg-emerald-500" : p.score >= p.max * 0.5 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${(100 * p.score) / p.max}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.gaps?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-900 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" /> Priority gaps
              </h3>
              <ul className="mt-3 space-y-2">
                {data.gaps.map((g: any, i: number) => (
                  <li key={i} className="text-sm text-amber-900">
                    <strong>{g.pillar}</strong> (−{g.missing_points}) — {g.action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
