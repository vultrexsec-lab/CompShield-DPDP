"use client";

import { useState } from "react";
import { Scan, Shield, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { scanPii } from "@/lib/api";

const SAMPLE = `Customer: Rahul Sharma
Email: rahul.sharma@email.com
Phone: 9876543210
Aadhaar: 2345 6789 0121
PAN: ABCDE1234F
Card: 4532015112830366
UPI: rahul@okaxis`;

export default function PiiScannerPage() {
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    total_matches: number;
    by_type: Record<string, number>;
    matches: Array<{
      pii_type: string;
      value_masked: string;
      confidence: number;
      severity: string;
      valid: boolean;
      category: string;
    }>;
    engine: string;
  } | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await scanPii(text);
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message + " — Login with backend credentials, or wait for Render wake-up."
          : "Scan failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PII Intelligence Scanner</h1>
        <p className="text-slate-500 mt-1">
          India-native detection — Aadhaar (Verhoeff), PAN, Card (Luhn), Mobile, and more.
          Raw PII never leaves masked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Paste text to scan
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
            placeholder="Paste emails, forms, logs..."
          />
          <button
            onClick={handleScan}
            disabled={loading || !text.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="w-5 h-5" />
                Scan for PII
              </>
            )}
          </button>
          {error && (
            <div className="bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded-xl border border-amber-100">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <Shield className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Results will appear here</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  {result.total_matches} match{result.total_matches !== 1 ? "es" : ""}
                </h2>
                <span className="text-xs text-slate-400">{result.engine}</span>
              </div>
              {result.by_type && Object.keys(result.by_type).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.by_type).map(([type, count]) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                    >
                      {type}: {count}
                    </span>
                  ))}
                </div>
              )}
              <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                {result.matches.map((m, i) => (
                  <div key={i} className="py-3 flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg ${
                        m.severity === "critical" || m.severity === "high"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {m.valid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 uppercase">
                          {m.pii_type}
                        </span>
                        <span className="text-xs text-slate-400">{m.category}</span>
                        <span className="text-xs font-mono text-slate-500">
                          {Math.round(m.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm font-mono text-slate-600 mt-0.5">
                        {m.value_masked}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
