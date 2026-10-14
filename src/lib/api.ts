/**
 * CompShield API client — connects frontend to Render backend.
 * Falls back gracefully if backend is cold/unreachable.
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
  if (user.full_name) {
    localStorage.setItem("compshield_user_name", user.full_name);
  }
}

export function clearAuth() {
  localStorage.removeItem("compshield_token");
  localStorage.removeItem("compshield_auth");
  localStorage.removeItem("compshield_user");
  localStorage.removeItem("compshield_user_name");
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
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
    } catch {
      /* ignore */
    }
    throw new Error(String(detail));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────
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

export async function getMe() {
  return api("/api/v1/auth/me");
}

// ─── Dashboard ──────────────────────────────────────────
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

// ─── DSAR ───────────────────────────────────────────────
export async function listDsar(status?: string) {
  const q = status ? `?status=${status}` : "";
  return api<unknown[]>(`/api/v1/dsar${q}`);
}

export async function createDsar(data: {
  request_type: string;
  principal_name: string;
  principal_email: string;
  principal_phone?: string;
  description?: string;
}) {
  return api("/api/v1/dsar", { method: "POST", body: data });
}

// ─── Consent ────────────────────────────────────────────
export async function listConsent(status?: string) {
  const q = status ? `?status=${status}` : "";
  return api<unknown[]>(`/api/v1/consent${q}`);
}

export async function createConsent(data: {
  principal_name: string;
  principal_email: string;
  purpose: string;
  channel?: string;
}) {
  return api("/api/v1/consent", { method: "POST", body: data });
}

// ─── Discovery ──────────────────────────────────────────
export async function listSources() {
  return api<unknown[]>("/api/v1/discovery/sources");
}

export async function listFindings() {
  return api<unknown[]>("/api/v1/discovery/findings");
}

// ─── PII Engine ─────────────────────────────────────────
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
  return api("/api/v1/pii/validate", {
    method: "POST",
    body: { pii_type, value },
  });
}

export { API_BASE };
