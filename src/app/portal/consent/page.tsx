"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "https://compshield-dpdp-1.onrender.com";

export default function PortalConsentPage() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setMsg("");
    try {
      const res = await fetch(`${API}/api/v1/public/consent/lookup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ principal_email: email }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.detail === "string" ? j.detail : "Failed");
      setData(j);
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  const withdraw = async (purpose: string) => {
    if (!confirm(`Withdraw consent for "${purpose}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/v1/public/consent/withdraw?principal_email=${encodeURIComponent(email)}&purpose=${encodeURIComponent(purpose)}`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.detail === "string" ? j.detail : "Failed");
      setMsg(j.message || "Withdrawn");
      const res2 = await fetch(`${API}/api/v1/public/consent/lookup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ principal_email: email }),
      });
      setData(await res2.json());
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My consent preferences</h1>
        <p className="text-sm text-slate-600 mt-1">View and withdraw consents. Withdrawal is as easy as giving consent (DPDP).</p>
      </div>
      <form onSubmit={lookup} className="bg-white border rounded-2xl p-6 space-y-4">
        <input required type="email" placeholder="Your email" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <button disabled={busy} type="submit" className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium">{busy ? "..." : "Look up consents"}</button>
      </form>
      {data && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{data.count} record(s) for {data.email}</p>
          {data.consents?.map((c: any, i: number) => (
            <div key={i} className="bg-white border rounded-xl p-4 flex justify-between items-start gap-3">
              <div>
                <p className="font-medium text-sm">{c.purpose}</p>
                <p className="text-xs text-slate-500 capitalize">{c.channel} · {c.status}</p>
              </div>
              {c.status === "active" && (
                <button disabled={busy} onClick={() => withdraw(c.purpose)} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg font-medium">Withdraw</button>
              )}
            </div>
          ))}
          {data.count === 0 && <p className="text-center text-slate-400 py-8 text-sm">No consents found</p>}
        </div>
      )}
    </div>
  );
}
