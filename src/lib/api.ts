/**
 * CompShield API client — full backend connection.
 * Graceful fallback when Render is cold or offline.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://compshield-dpdp-1.onrender.com";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("compshield_token");
}

export function setAuth(token: string, user: { email: string; full_name?: string }) {
  localStorage.setItem("compshield_token", token);
  localStorage.setItem("compshield_auth", "true");
  localStorage.setItem("compshield_user", user.email);
  if (user.full_name) localStorage.setItem("compshield_user_name", user.full_name);
}

export function clearAuth() {
  ["compshield_token", "compshield_auth", "compshield_user", "compshield_user_name"].forEach(
    (k) => localStorage.removeItem(k)
  );
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean };

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || err.message || detail;
      if (Array.isArray(detail)) detail = detail.map((d: { msg?: string }) => d.msg).join(", ");
    } catch { /* ignore */ }
    throw new Error(String(detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name?: string;
    role: string;
    organization?: { id: number; name: string };
  };
};

export async function loginApi(email: string, password: string) {
  return api<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export type DashboardStats = {
  dsar_total: number;
  dsar_pending: number;
  consent_active: number;
  consent_withdrawn: number;
  sources_count: number;
  findings_open: number;
  remediation_open: number;
  ropa_count: number;
};

export async function getDashboardStats() {
  return api<DashboardStats>("/api/v1/dashboard/stats");
}

// DSAR
export type DsarItem = {
  id: number;
  request_id: string;
  request_type: string;
  status: string;
  principal_name: string;
  principal_email: string;
  principal_phone?: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
};

export async function listDsar(status?: string) {
  const q = status ? `?status=${status}` : "";
  return api<DsarItem[]>(`/api/v1/dsar${q}`);
}

export async function createDsar(data: {
  request_type: string;
  principal_name: string;
  principal_email: string;
  principal_phone?: string;
  description?: string;
  assigned_to?: string;
}) {
  return api<DsarItem>("/api/v1/dsar", { method: "POST", body: data });
}

export async function updateDsar(id: number, data: Partial<{ status: string; assigned_to: string; description: string }>) {
  return api<DsarItem>(`/api/v1/dsar/${id}`, { method: "PATCH", body: data });
}

// Consent
export type ConsentItem = {
  id: number;
  principal_name: string;
  principal_email: string;
  purpose: string;
  channel: string;
  status: string;
  notice_version?: string;
  given_at?: string;
  withdrawn_at?: string;
  created_at?: string;
};

export async function listConsent(status?: string) {
  const q = status ? `?status=${status}` : "";
  return api<ConsentItem[]>(`/api/v1/consent${q}`);
}

export async function createConsent(data: {
  principal_name: string;
  principal_email: string;
  purpose: string;
  channel?: string;
}) {
  return api<ConsentItem>("/api/v1/consent", { method: "POST", body: data });
}

export async function withdrawConsent(id: number) {
  return api<ConsentItem>(`/api/v1/consent/${id}/withdraw`, { method: "POST" });
}

// Discovery
export type SourceItem = {
  id: number;
  name: string;
  source_type: string;
  connection_info?: string;
  status: string;
  records_found: number;
  pii_count: number;
  last_scanned?: string;
  created_at?: string;
};

export type FindingItem = {
  id: number;
  source_id?: number;
  pii_type: string;
  location: string;
  sample_masked?: string;
  confidence: number;
  severity: string;
  status: string;
  created_at?: string;
};

export async function listSources() {
  return api<SourceItem[]>("/api/v1/discovery/sources");
}

export async function createSource(data: { name: string; source_type: string; connection_info?: string }) {
  return api<SourceItem>("/api/v1/discovery/sources", { method: "POST", body: data });
}

export async function scanSource(id: number) {
  return api<SourceItem>(`/api/v1/discovery/sources/${id}/scan`, { method: "POST" });
}

export async function listFindings() {
  return api<FindingItem[]>("/api/v1/discovery/findings");
}

// ROPA
export type RopaItem = {
  id: number;
  activity_name: string;
  purpose: string;
  legal_basis: string;
  data_categories: string;
  data_subjects: string;
  recipients?: string;
  retention_period?: string;
  security_measures?: string;
  cross_border: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function listRopa() {
  return api<RopaItem[]>("/api/v1/ropa");
}

export async function createRopa(data: {
  activity_name: string;
  purpose: string;
  legal_basis?: string;
  data_categories: string;
  data_subjects?: string;
  recipients?: string;
  retention_period?: string;
  cross_border?: boolean;
}) {
  return api<RopaItem>("/api/v1/ropa", { method: "POST", body: data });
}

// Remediation
export type RemediationItem = {
  id: number;
  task_id: string;
  finding_id?: number;
  title: string;
  action: string;
  severity: string;
  status: string;
  source?: string;
  impact?: string;
  created_at?: string;
  completed_at?: string;
};

export async function listRemediation() {
  return api<RemediationItem[]>("/api/v1/remediation");
}

export async function createRemediation(data: {
  title: string;
  action?: string;
  severity?: string;
  source?: string;
  impact?: string;
}) {
  return api<RemediationItem>("/api/v1/remediation", { method: "POST", body: data });
}

export async function updateRemediation(id: number, data: { status?: string; action?: string }) {
  return api<RemediationItem>(`/api/v1/remediation/${id}`, { method: "PATCH", body: data });
}

// PII
export async function scanPii(text: string) {
  return api<{
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
  }>("/api/v1/pii/scan", { method: "POST", body: { text } });
}

export async function validatePii(pii_type: string, value: string) {
  return api("/api/v1/pii/validate", { method: "POST", body: { pii_type, value } });
}

export { API_BASE };

// ─── Vendors / Breaches / DPIA / Gaps / Cookies / Integrations / Notifications / Settings / Reports

export async function listVendors() { return api<any[]>("/api/v1/vendors"); }
export async function createVendor(data: object) { return api("/api/v1/vendors", { method: "POST", body: data }); }
export async function deleteVendor(id: number) { return api(`/api/v1/vendors/${id}`, { method: "DELETE" }); }

export async function listBreaches() { return api<any[]>("/api/v1/breaches"); }
export async function createBreach(data: object) { return api("/api/v1/breaches", { method: "POST", body: data }); }
export async function updateBreach(id: number, params: Record<string, string | boolean>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => q.set(k === "status" ? "status_val" : k, String(v)));
  return api(`/api/v1/breaches/${id}?${q}`, { method: "PATCH" });
}

export async function listDpia() { return api<any[]>("/api/v1/dpia"); }
export async function createDpia(data: object) { return api("/api/v1/dpia", { method: "POST", body: data }); }

export async function listGaps() { return api<any[]>("/api/v1/gaps"); }
export async function createGap(data: object) { return api("/api/v1/gaps", { method: "POST", body: data }); }
export async function updateGap(id: number, status: string) {
  return api(`/api/v1/gaps/${id}?status_val=${status}`, { method: "PATCH" });
}

export async function listCookies() { return api<any[]>("/api/v1/cookies"); }
export async function createCookie(data: object) { return api("/api/v1/cookies", { method: "POST", body: data }); }
export async function updateCookie(id: number, data: object) { return api(`/api/v1/cookies/${id}`, { method: "PATCH", body: data }); }

export async function listIntegrations() { return api<any[]>("/api/v1/integrations"); }
export async function connectIntegration(id: number) { return api(`/api/v1/integrations/${id}/connect`, { method: "POST" }); }
export async function disconnectIntegration(id: number) { return api(`/api/v1/integrations/${id}/disconnect`, { method: "POST" }); }

export async function listNotifications() { return api<any[]>("/api/v1/notifications"); }
export async function markNotificationRead(id: number) { return api(`/api/v1/notifications/${id}/read`, { method: "POST" }); }
export async function markAllNotificationsRead() { return api("/api/v1/notifications/read-all", { method: "POST" }); }

export async function getSettings() { return api<any>("/api/v1/settings"); }
export async function updateSettings(data: object) { return api("/api/v1/settings", { method: "PATCH", body: data }); }

export async function getReportsSummary() { return api<any>("/api/v1/reports/summary"); }

// DSAR workflow
export async function delegateDsar(id: number, delegated_to: string, comment?: string) {
  return api(`/api/v1/dsar/${id}/delegate`, { method: "POST", body: { delegated_to, comment } });
}
export async function escalateDsar(id: number) {
  return api(`/api/v1/dsar/${id}/escalate`, { method: "POST" });
}
export async function approveDsar(id: number, action: "approved" | "rejected", comment?: string) {
  return api(`/api/v1/dsar/${id}/approve`, { method: "POST", body: { action, comment } });
}
export async function completeDsar(id: number) {
  return api(`/api/v1/dsar/${id}/complete`, { method: "POST" });
}
export async function listDsarApprovals(id: number) {
  return api<any[]>(`/api/v1/dsar/${id}/approvals`);
}
export async function listApprovalConfigs() {
  return api<any[]>("/api/v1/dsar/config/approvals");
}
export async function saveApprovalConfig(data: object) {
  return api("/api/v1/dsar/config/approvals", { method: "POST", body: data });
}

export async function getDiscoveryCatalog() {
  return api<{ schemas: Record<string, Record<string, string[]>>; engines: string[] }>("/api/v1/discovery/catalog");
}


export async function listPurposes() { return api<any[]>("/api/v1/purposes"); }
export async function createPurpose(data: object) { return api("/api/v1/purposes", { method: "POST", body: data }); }
export async function deletePurpose(id: number) { return api(`/api/v1/purposes/${id}`, { method: "DELETE" }); }
export async function linkVendorPurpose(purposeId: number, vendorId: number) {
  return api(`/api/v1/purposes/${purposeId}/link-vendor?vendor_id=${vendorId}`, { method: "POST" });
}
export async function listDpaTemplates() { return api<any[]>("/api/v1/dpa-templates"); }
export async function createDpaTemplate(data: object) { return api("/api/v1/dpa-templates", { method: "POST", body: data }); }
export async function signDpa(id: number, vendor_id?: number, vendor_name?: string, expires_at?: string) {
  const q = new URLSearchParams();
  if (vendor_id) q.set("vendor_id", String(vendor_id));
  if (vendor_name) q.set("vendor_name", vendor_name);
  if (expires_at) q.set("expires_at", expires_at);
  return api(`/api/v1/dpa-templates/${id}/sign?${q}`, { method: "POST" });
}
export async function deleteDpaTemplate(id: number) { return api(`/api/v1/dpa-templates/${id}`, { method: "DELETE" }); }
