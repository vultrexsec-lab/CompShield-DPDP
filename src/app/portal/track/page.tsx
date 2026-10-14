"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "https://compshield-dpdp-1.onrender.com";

export default function TrackPage() {
  const [request_id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setData(null);
    try {
      const res = await fetch(`${API}/api/v1/public/dsar/track`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, principal_email: email }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(typeof j.detail === "string" ? j.detail : "Not found");
      setData(j);
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track your request</h1>
        <p className="text-sm text-slate-600 mt-1">Enter Request ID and the email used when submitting.</p>
      </div>
      <form onSubmit={track} className="bg-white border rounded-2xl p-6 space-y-4">
        <input required placeholder="Request ID (e.g. DSAR-2026-0001)" className="w-full border rounded-xl px-3 py-2.5 text-sm font-mono" value={request_id} onChange={(e) => setId(e.target.value)} />
        <input required type="email" placeholder="Your email" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} type="submit" className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium">{busy ? "..." : "Track status"}</button>
      </form>
      {data && (
        <div className="bg-white border rounded-2xl p-6 space-y-2 text-sm">
          <p><span className="text-slate-500">ID:</span> <strong className="font-mono">{data.request_id}</strong></p>
          <p><span className="text-slate-500">Type:</span> {data.request_type}</p>
          <p><span className="text-slate-500">Status:</span> <strong className="capitalize">{String(data.status).replace(/_/g, " ")}</strong></p>
          <p><span className="text-slate-500">Approval:</span> {data.approval_status || "—"}</p>
          <p><span className="text-slate-500">Due:</span> {data.due_date || "—"}</p>
        </div>
      )}
    </div>
  );
}
