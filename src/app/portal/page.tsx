"use client";
import { useState } from "react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL || "https://compshield-dpdp-1.onrender.com";

export default function PortalHome() {
  const [form, setForm] = useState({ request_type: "access", principal_name: "", principal_email: "", principal_phone: "", description: "" });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/api/v1/public/dsar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Submit failed");
      setResult(data);
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exercise your data rights</h1>
        <p className="text-slate-600 mt-2 text-sm">As a Data Principal under the DPDP Act, request access, correction, erasure or portability — no account required.</p>
      </div>
      {result ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-emerald-900">Request submitted</h2>
          <p className="text-sm">Request ID: <strong className="font-mono text-lg">{result.request_id}</strong></p>
          <p className="text-sm">Status: {result.status} · Due: {result.due_date || "—"}</p>
          <p className="text-xs text-emerald-700">{result.message}</p>
          <Link href="/portal/track" className="text-sm font-medium text-brand-600 underline">Track this request →</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium">Request type</label>
            <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })}>
              <option value="access">Right to Access</option>
              <option value="correction">Right to Correction</option>
              <option value="erasure">Right to Erasure</option>
              <option value="portability">Data Portability</option>
              <option value="restriction">Restrict Processing</option>
            </select>
          </div>
          <input required placeholder="Full name *" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.principal_name} onChange={(e) => setForm({ ...form, principal_name: e.target.value })} />
          <input required type="email" placeholder="Email *" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.principal_email} onChange={(e) => setForm({ ...form, principal_email: e.target.value })} />
          <input placeholder="Phone (optional)" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.principal_phone} onChange={(e) => setForm({ ...form, principal_phone: e.target.value })} />
          <textarea placeholder="Details" className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={busy} type="submit" className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium">{busy ? "Submitting..." : "Submit request"}</button>
        </form>
      )}
    </div>
  );
}
