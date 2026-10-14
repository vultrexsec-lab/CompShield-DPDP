"use client";
import { useEffect, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { listNoticeLanguages, renderNotice } from "@/lib/api";

export default function NoticesPage() {
  const [langs, setLangs] = useState<{ code: string; language: string }[]>([]);
  const [lang, setLang] = useState("hi");
  const [purpose, setPurpose] = useState("Marketing communications");
  const [org, setOrg] = useState("CompShield Demo Pvt Ltd");
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNoticeLanguages()
      .then((r) => setLangs(r.available || []))
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  }, []);

  const render = async () => {
    try {
      setNotice(await renderNotice({ language: lang, purpose, organization_name: org }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="w-7 h-7 text-brand-600" /> Multilingual Consent Notices
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          DPDP Rules — notices in English or Eighth Schedule languages (sample set)
        </p>
      </div>
      {loading ? (
        <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-5 space-y-3">
            <label className="text-sm font-medium">Language</label>
            <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={lang} onChange={(e) => setLang(e.target.value)}>
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.language}</option>
              ))}
            </select>
            <label className="text-sm font-medium">Purpose</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            <label className="text-sm font-medium">Organisation</label>
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm" value={org} onChange={(e) => setOrg(e.target.value)} />
            <button onClick={render} className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">Preview notice</button>
          </div>
          <div className="bg-slate-50 border rounded-2xl p-5 min-h-[280px]">
            {notice ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">{notice.language} · {notice.organization_name}</p>
                <h2 className="text-lg font-semibold">{notice.title}</h2>
                <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{notice.body}</p>
                <div className="flex gap-2 pt-2">
                  <span className="text-xs px-3 py-1.5 bg-white border rounded-lg">{notice.withdraw_label}</span>
                  <span className="text-xs px-3 py-1.5 bg-white border rounded-lg">{notice.rights_label}</span>
                </div>
                <p className="text-xs text-slate-400 pt-2">{notice.dpdp_note}</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Select language and preview</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
