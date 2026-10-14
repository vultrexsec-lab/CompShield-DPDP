"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { listVendors, createVendor, deleteVendor } from "@/lib/api";

const STEPS = ["Vendor Details", "Data Processing", "Purpose Mapping", "Sub-processors", "Compliance & DPA", "Review & Submit"];
const VENDOR_TYPES = ["Analytics", "Advertising", "Marketing / CRM", "Infrastructure", "Customer Support", "Payment Processing", "Cloud / Hosting", "Other"];
const PURPOSE_OPTIONS = ["Analytics", "Advertising", "Marketing", "Customer Support", "Payments", "Security", "HR / Employment", "Product Improvement"];
const DATA_CATS = ["Name", "Email", "Phone", "Aadhaar", "PAN", "Financial", "Location", "Device / IP", "Usage data"];

const emptyForm = {
  name: "", website_url: "", primary_domain: "", vendor_type: "Analytics", category: "Analytics",
  hq_country: "India", contact_email: "", data_categories: [] as string[], processing_purpose: "",
  purposes: [] as string[], sub_processors: "", dpa_signed: false, dpa_expiry: "", certifications: "",
  cross_border: false, risk_level: "medium", notes: "", onboarding_type: "manual",
};

export default function VendorsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    listVendors().then(setItems).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleArr = (key: "data_categories" | "purposes", val: string) => {
    setForm((f) => {
      const arr = f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val];
      return { ...f, [key]: arr };
    });
  };

  const canNext = () => {
    if (step === 0) return !!(form.name.trim() && form.contact_email.trim());
    if (step === 1) return form.data_categories.length > 0;
    if (step === 2) return form.purposes.length > 0;
    return true;
  };

  const submit = async () => {
    setBusy(true);
    try {
      await createVendor({
        name: form.name, category: form.vendor_type, vendor_type: form.vendor_type,
        website_url: form.website_url || null, primary_domain: form.primary_domain || null,
        hq_country: form.hq_country || null, contact_email: form.contact_email || null,
        risk_level: form.risk_level, status: "active", onboarding_stage: 6,
        onboarding_type: form.onboarding_type, data_categories: form.data_categories.join(", "),
        processing_purpose: form.processing_purpose || null, purposes: form.purposes.join(", "),
        sub_processors: form.sub_processors || null, dpa_signed: form.dpa_signed,
        dpa_expiry: form.dpa_expiry || null, certifications: form.certifications || null,
        cross_border: form.cross_border, notes: form.notes || null,
      });
      setShow(false); load();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors & Partners</h1>
          <p className="text-slate-500 mt-1">Registry · 6-stage onboarding · Purpose mapping · DPA</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setStep(0); setShow(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          <Plus className="w-4 h-4" /> Onboard Vendor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Purposes</th>
                <th className="px-6 py-3">Risk</th>
                <th className="px-6 py-3">DPA</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Onboard</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{v.name}</p>
                    <p className="text-xs text-slate-500">{v.contact_email || v.primary_domain}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{v.vendor_type || v.category}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[160px] truncate">{v.purposes || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.risk_level === "high" ? "bg-red-50 text-red-700" : v.risk_level === "low" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{v.risk_level}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">{v.dpa_signed ? "Signed" : "Pending"}</td>
                  <td className="px-6 py-4 text-sm capitalize">{v.status}</td>
                  <td className="px-6 py-4 text-xs capitalize">{v.onboarding_type || "manual"}</td>
                  <td className="px-6 py-4">
                    <button onClick={async () => { await deleteVendor(v.id); load(); }} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-center py-12 text-slate-400 text-sm">No vendors — start 6-stage onboarding</p>}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Vendor Onboarding</h3>
                <p className="text-xs text-slate-500">Follow the 6-stage workflow to register and activate a new vendor</p>
              </div>
              <button onClick={() => setShow(false)} className="text-slate-400 text-xl leading-none">&times;</button>
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="text-sm font-medium">Vendor Name *</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Google Analytics" /></div>
                  <div><label className="text-sm font-medium">Website URL</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Primary Domain</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.primary_domain} onChange={(e) => setForm({ ...form, primary_domain: e.target.value })} placeholder="analytics.google.com" /></div>
                  <div><label className="text-sm font-medium">Vendor Type *</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.vendor_type} onChange={(e) => setForm({ ...form, vendor_type: e.target.value, category: e.target.value })}>
                      {VENDOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="text-sm font-medium">HQ Country</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.hq_country} onChange={(e) => setForm({ ...form, hq_country: e.target.value })} /></div>
                  <div className="sm:col-span-2"><label className="text-sm font-medium">Contact Email *</label><input type="email" className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="privacy@vendor.com" /></div>
                  <div><label className="text-sm font-medium">Onboard type</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.onboarding_type} onChange={(e) => setForm({ ...form, onboarding_type: e.target.value })}>
                      <option value="manual">Manual</option><option value="self">Self-Onboard</option>
                    </select>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Data categories processed *</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DATA_CATS.map((c) => (
                        <button key={c} type="button" onClick={() => toggleArr("data_categories", c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${form.data_categories.includes(c) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-sm font-medium">Processing description</label>
                    <textarea className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" rows={3} value={form.processing_purpose} onChange={(e) => setForm({ ...form, processing_purpose: e.target.value })} placeholder="How does this vendor process personal data?" />
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.cross_border} onChange={(e) => setForm({ ...form, cross_border: e.target.checked })} /> Cross-border transfer</label>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Map this vendor to processing purposes — used in Consent Profiles.</p>
                  <div className="flex flex-wrap gap-2">
                    {PURPOSE_OPTIONS.map((p) => (
                      <button key={p} type="button" onClick={() => toggleArr("purposes", p)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${form.purposes.includes(p) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">List known sub-processors (comma-separated). Leave blank if none.</p>
                  <textarea className="w-full border rounded-xl px-3 py-2.5 text-sm" rows={4} value={form.sub_processors} onChange={(e) => setForm({ ...form, sub_processors: e.target.value })} placeholder="e.g. AWS, Cloudflare, Stripe" />
                </div>
              )}
              {step === 4 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.dpa_signed} onChange={(e) => setForm({ ...form, dpa_signed: e.target.checked })} /> DPA signed</label>
                  <div><label className="text-sm font-medium">DPA expiry</label><input type="date" className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.dpa_expiry} onChange={(e) => setForm({ ...form, dpa_expiry: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Risk level</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2"><label className="text-sm font-medium">Certifications</label><input className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="ISO 27001, SOC 2, PCI-DSS" /></div>
                  <div className="sm:col-span-2"><label className="text-sm font-medium">Notes</label><textarea className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p><span className="text-slate-500">Name:</span> <strong>{form.name}</strong></p>
                    <p><span className="text-slate-500">Type:</span> {form.vendor_type}</p>
                    <p><span className="text-slate-500">Domain:</span> {form.primary_domain || form.website_url || "—"}</p>
                    <p><span className="text-slate-500">Contact:</span> {form.contact_email}</p>
                    <p><span className="text-slate-500">Country:</span> {form.hq_country}</p>
                    <p><span className="text-slate-500">Data:</span> {form.data_categories.join(", ") || "—"}</p>
                    <p><span className="text-slate-500">Purposes:</span> {form.purposes.join(", ") || "—"}</p>
                    <p><span className="text-slate-500">Sub-processors:</span> {form.sub_processors || "None"}</p>
                    <p><span className="text-slate-500">DPA:</span> {form.dpa_signed ? "Signed" : "Pending"} · Risk: {form.risk_level}</p>
                  </div>
                  <p className="text-xs text-slate-500">Submit activates this vendor in the registry for consent purpose mapping.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-between">
              <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 px-4 py-2.5 border rounded-xl text-sm disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Go back
              </button>
              {step < 5 ? (
                <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-40">
                  Proceed <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={submit} className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                  {busy ? "Saving..." : "Submit & Activate"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
