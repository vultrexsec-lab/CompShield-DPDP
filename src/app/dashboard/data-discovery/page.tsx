"use client";

import { useEffect, useState } from "react";
import { Database, Plus, Loader2, Play, Search } from "lucide-react";
import { listSources, listFindings, createSource, scanSource, type SourceItem, type FindingItem } from "@/lib/api";

const MOCK_SOURCES: SourceItem[] = [
  { id: 1, name: "HR Database (PostgreSQL)", source_type: "database", status: "completed", records_found: 12450, pii_count: 320 },
  { id: 2, name: "Customer CRM (Salesforce)", source_type: "saas", status: "completed", records_found: 45680, pii_count: 890 },
  { id: 3, name: "AWS S3 – Customer Docs", source_type: "cloud", status: "pending", records_found: 0, pii_count: 0 },
];

const MOCK_FINDINGS: FindingItem[] = [
  { id: 1, pii_type: "aadhaar", location: "employees.aadhaar_number", sample_masked: "XXXX-XXXX-1234", confidence: 0.98, severity: "high", status: "open" },
  { id: 2, pii_type: "pan", location: "employees.pan", sample_masked: "ABCDE****F", confidence: 0.97, severity: "high", status: "open" },
  { id: 3, pii_type: "email", location: "contacts.email", sample_masked: "u***@email.com", confidence: 0.99, severity: "medium", status: "open" },
];

export default function DataDiscoveryPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([listSources(), listFindings()]);
      setSources(s);
      setFindings(f);
      setLive(true);
    } catch {
      setSources(MOCK_SOURCES);
      setFindings(MOCK_FINDINGS);
      setLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddSource = async () => {
    const name = prompt("Source name (e.g. Payroll DB)");
    if (!name) return;
    try {
      if (live) {
        await createSource({ name, source_type: "database" });
        load();
      } else {
        setSources((p) => [...p, { id: Date.now(), name, source_type: "database", status: "pending", records_found: 0, pii_count: 0 }]);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleScan = async (id: number) => {
    setScanning(id);
    try {
      if (live) {
        await scanSource(id);
        await load();
      } else {
        setSources((p) => p.map((s) => (s.id === id ? { ...s, status: "completed", records_found: 1000, pii_count: 40 } : s)));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Discovery</h1>
          <p className="text-slate-500 mt-1">Find and classify personal data across systems</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
          <button onClick={handleAddSource} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl">
            <Plus className="w-4 h-4" /> Add Source
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sources.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Database className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{s.source_type}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div><span className="text-slate-500">Records</span><p className="font-semibold">{s.records_found.toLocaleString()}</p></div>
                  <div><span className="text-slate-500">PII</span><p className="font-semibold text-amber-600">{s.pii_count}</p></div>
                </div>
                <button
                  onClick={() => handleScan(s.id)}
                  disabled={scanning === s.id}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                >
                  {scanning === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {scanning === s.id ? "Scanning..." : "Run Scan"}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900">PII Findings</h2>
              <span className="text-xs text-slate-400">({findings.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Location</th>
                    <th className="px-6 py-3 font-medium">Sample</th>
                    <th className="px-6 py-3 font-medium">Confidence</th>
                    <th className="px-6 py-3 font-medium">Severity</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {findings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-sm font-medium uppercase text-slate-900">{f.pii_type}</td>
                      <td className="px-6 py-3 text-sm font-mono text-slate-600">{f.location}</td>
                      <td className="px-6 py-3 text-sm font-mono text-slate-500">{f.sample_masked}</td>
                      <td className="px-6 py-3 text-sm">{Math.round(f.confidence * 100)}%</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.severity === "high" || f.severity === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm capitalize text-slate-600">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {findings.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No findings yet — run a scan</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
