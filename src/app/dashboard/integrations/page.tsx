"use client";
import { useEffect, useState } from "react";
import { Plug, CheckCircle2, Loader2 } from "lucide-react";
import { listIntegrations, connectIntegration, disconnectIntegration } from "@/lib/api";

export default function IntegrationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    listIntegrations()
      .then(setItems)
      .catch((e) => setError(e.message || "Failed to load. Please login again."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: number, status: string) => {
    setBusy(id);
    try {
      if (status === "connected") await disconnectIntegration(id);
      else await connectIntegration(id);
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(null); }
  };

  const connected = items.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations & Connectors</h1>
        <p className="text-slate-500 mt-1">Connect systems for discovery and DSAR fulfillment</p>
      </div>
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Connected</p><p className="text-2xl font-bold text-emerald-600 mt-1">{connected}</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Available</p><p className="text-2xl font-bold mt-1">{items.length - connected}</p></div>
        <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border p-5 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${c.status === "connected" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                <Plug className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  {c.status === "connected" ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Connected</span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{c.category}</p>
                {c.records_synced && <p className="text-xs text-slate-400 mt-2">{c.records_synced}</p>}
                <button
                  disabled={busy === c.id}
                  onClick={() => toggle(c.id, c.status)}
                  className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  {busy === c.id ? "..." : c.status === "connected" ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
