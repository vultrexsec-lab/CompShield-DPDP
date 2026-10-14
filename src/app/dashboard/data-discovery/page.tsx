"use client";

import { useEffect, useState } from "react";
import { Database, Plus, Loader2, Play, Search, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { listSources, listFindings, createSource, scanSource, getDiscoveryCatalog, testDataConnection, type SourceItem, type FindingItem } from "@/lib/api";

const STEPS = ["Basic details", "Data source", "Connection setup", "Scope selection", "Review & Save"];

export default function DataDiscoveryPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [catalog, setCatalog] = useState<{ schemas: Record<string, Record<string, string[]>>; engines: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("database");
  const [engine, setEngine] = useState("postgresql");
  const [host, setHost] = useState("db.internal.local");
  const [schema, setSchema] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, f, c] = await Promise.all([listSources(), listFindings(), getDiscoveryCatalog()]);
      setSources(s); setFindings(f); setCatalog(c);
      const schemas = Object.keys(c.schemas || {});
      if (schemas.length && !schema) setSchema(schemas[0]);
    } catch (e: any) {
      alert(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const schemaTables = catalog?.schemas?.[schema] || {};
  const tableNames = Object.keys(schemaTables);

  const toggleTable = (t: string) => {
    setTables((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      // prune columns not in selected tables
      const allowed = new Set<string>();
      next.forEach((tn) => (schemaTables[tn] || []).forEach((c) => allowed.add(`${tn}.${c}`)));
      setColumns((cols) => cols.filter((c) => allowed.has(c) || schemaTables[t]?.some((x) => `${t}.${x}` === c)));
      return next;
    });
  };

  const toggleCol = (table: string, col: string) => {
    const key = `${table}.${col}`;
    setColumns((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const selectAllCols = (table: string) => {
    const cols = (schemaTables[table] || []).map((c) => `${table}.${c}`);
    setColumns((prev) => Array.from(new Set([...prev, ...cols])));
    if (!tables.includes(table)) setTables((t) => [...t, table]);
  };

  const canNext = () => {
    if (step === 0) return !!name.trim();
    if (step === 2) return !!host.trim();
    if (step === 3) return columns.length > 0 || tables.length > 0;
    return true;
  };

  const submit = async () => {
    setBusy(true);
    try {
      const colOnly = columns.map((c) => c.split(".").pop()!);
      await createSource({
        name,
        source_type: sourceType,
        connection_info: `${engine}://${host}`,
        host,
        db_engine: engine,
        schema_name: schema,
        selected_tables: tables.join(","),
        selected_columns: colOnly.join(","),
        onboarding_stage: 5,
        status: "pending",
      } as any);
      setShow(false);
      setStep(0);
      setName("");
      setTables([]);
      setColumns([]);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleScan = async (id: number) => {
    setScanning(id);
    try {
      await scanSource(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Discovery</h1>
          <p className="text-slate-500 mt-1">Connect sources · scope tables/columns · scan for PII</p>
        </div>
        <button onClick={() => { setShow(true); setStep(0); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl">
          <Plus className="w-4 h-4" /> Add Data Source
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sources.map((s: any) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Database className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.db_engine || s.source_type} · {s.schema_name || "—"}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s.status}</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 truncate">Tables: {s.selected_tables || "—"}</div>
                <div className="mt-2 flex gap-4 text-sm">
                  <div><span className="text-slate-500">Records</span><p className="font-semibold">{(s.records_found || 0).toLocaleString()}</p></div>
                  <div><span className="text-slate-500">PII</span><p className="font-semibold text-amber-600">{s.pii_count || 0}</p></div>
                </div>
                <button onClick={() => handleScan(s.id)} disabled={scanning === s.id} className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.severity === "high" || f.severity === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{f.severity}</span>
                      </td>
                      <td className="px-6 py-3 text-sm capitalize text-slate-600">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {findings.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No findings yet — add a source and run scan</p>}
            </div>
          </div>
        </>
      )}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Add Data Source</h3>
                <p className="text-xs text-slate-500">Connect and choose schema / tables / columns to scan</p>
              </div>
              <button onClick={() => setShow(false)} className="text-slate-400 text-xl">&times;</button>
            </div>
            <div className="px-6 py-3 border-b bg-slate-50 flex flex-wrap gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${i === step ? "bg-brand-600 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400 border"}`}>
                  {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  <span className="hidden sm:inline">{s}</span>
                </div>
              ))}
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {step === 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Source name *</label>
                    <input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Core Banking DB" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Source type</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                      <option value="database">Database</option>
                      <option value="saas">SaaS</option>
                      <option value="cloud">Cloud storage</option>
                      <option value="file">File share</option>
                    </select>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Choose database engine (demo catalog available for PostgreSQL-style schemas).</p>
                  <select className="w-full border rounded-xl px-3 py-2.5 text-sm" value={engine} onChange={(e) => setEngine(e.target.value)}>
                    {(catalog?.engines || ["postgresql", "mysql"]).map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Host / connection *</label>
                    <input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={host} onChange={(e) => setHost(e.target.value)} placeholder="db.internal.local:5432" />
                  </div>
                  <p className="text-xs text-slate-500">Credentials are not stored — profile test only.</p>
                  <button type="button" className="text-sm px-3 py-2 border rounded-xl font-medium"
                    onClick={async () => {
                      try {
                        const r = await testDataConnection({ db_engine: engine, host });
                        alert(r.message + (r.catalog_ready ? " Catalog ready." : ""));
                      } catch (e: any) { alert(e.message); }
                    }}
                  >Test connection</button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Schema</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={schema} onChange={(e) => { setSchema(e.target.value); setTables([]); setColumns([]); }}>
                      {Object.keys(catalog?.schemas || {}).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto border rounded-xl p-3">
                    {tableNames.map((t) => (
                      <div key={t} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" checked={tables.includes(t)} onChange={() => toggleTable(t)} />
                            {t}
                          </label>
                          <button type="button" onClick={() => selectAllCols(t)} className="text-xs text-brand-600 font-medium">Select all columns</button>
                        </div>
                        {(tables.includes(t) || columns.some((c) => c.startsWith(t + "."))) && (
                          <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                            {(schemaTables[t] || []).map((col) => {
                              const key = `${t}.${col}`;
                              const active = columns.includes(key);
                              return (
                                <button key={col} type="button" onClick={() => toggleCol(t, col)} className={`text-xs px-2 py-1 rounded-lg border ${active ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600"}`}>
                                  {col}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{tables.length} tables · {columns.length} columns selected</p>
                </div>
              )}
              {step === 4 && (
                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
                  <p><span className="text-slate-500">Name:</span> <strong>{name}</strong></p>
                  <p><span className="text-slate-500">Engine:</span> {engine} @ {host}</p>
                  <p><span className="text-slate-500">Schema:</span> {schema}</p>
                  <p><span className="text-slate-500">Tables:</span> {tables.join(", ") || "—"}</p>
                  <p><span className="text-slate-500">Columns:</span> {columns.length ? columns.join(", ") : "—"}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-between">
              <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 px-4 py-2.5 border rounded-xl text-sm disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Go back
              </button>
              {step < 4 ? (
                <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-40">
                  Proceed <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={submit} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                  {busy ? "Saving..." : "Save source"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
