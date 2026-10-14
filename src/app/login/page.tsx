"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Lock, Mail, KeyRound } from "lucide-react";
import { loginApi, setAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("admin@compshield.com");
  const [password, setPassword] = useState("demo123");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [lang, setLang] = useState("English");

  useEffect(() => {
    const auth = localStorage.getItem("compshield_auth");
    if (auth === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // OTP demo path (local)
    if (authMode === "otp") {
      if (otp === "123456" || otp.length >= 4) {
        setAuth("demo-otp-token", {
          email: email || "admin@compshield.com",
          full_name: "Admin User",
        });
        router.push("/dashboard");
      } else {
        setError("Invalid OTP. Use 123456 for demo.");
        setLoading(false);
      }
      return;
    }

    // Try real backend first
    try {
      const data = await loginApi(email, password);
      setAuth(data.access_token, {
        email: data.user.email,
        full_name: data.user.full_name,
      });
      router.push("/dashboard");
      return;
    } catch {
      // Fallback: offline demo credentials
      if (
        (email === "admin@compshield.com" && password === "demo123") ||
        (email === "demo@compshield.com" && password === "demo123")
      ) {
        setAuth("demo-offline-token", {
          email,
          full_name: "Admin User",
        });
        router.push("/dashboard");
        return;
      }
      setError("Invalid email or password. Use demo credentials.");
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (!email) {
      setError("Enter email first");
      return;
    }
    setOtpSent(true);
    setError("");
  };

  const handleSSO = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setAuth(`demo-sso-${provider}`, {
        email: `${provider.toLowerCase()}@compshield.com`,
        full_name: `${provider} User`,
      });
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Soft background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4" />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        {/* Left branding */}
        <div className="lg:w-[42%] bg-gradient-to-br from-brand-600 to-brand-800 p-10 flex flex-col justify-between text-white min-h-[280px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">CompShield</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              AI-Powered Privacy
              <br />
              Compliance Platform
            </h1>
            <p className="text-brand-100 mt-3 text-sm leading-relaxed">
              DPDP • Consent • Discovery • DSAR • Remediation — all in one place.
            </p>
          </div>
          <p className="text-brand-200 text-xs">
            © 2026 CompShield. Built for India&apos;s DPDP Act.
          </p>
        </div>

        {/* Right form */}
        <div className="flex-1 p-8 lg:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to your account to continue
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>English</option>
                <option>हिन्दी</option>
                <option>मराठी</option>
              </select>
            </div>
          </div>

          {/* Password / OTP tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                authMode === "password"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="w-4 h-4" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                authMode === "otp"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              OTP
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {authMode === "password" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  OTP <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm tracking-widest"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-3 border border-brand-200 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-50 transition whitespace-nowrap"
                  >
                    {otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-xs text-emerald-600 mt-1.5">
                    OTP sent (demo: use 123456)
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue
                  <span className="text-lg leading-none">→</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSSO("Google")}
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSSO("Microsoft")}
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </button>
            <button
              type="button"
              onClick={() => handleSSO("SSO")}
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              SSO
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-center text-xs text-slate-500 mb-2">Demo Credentials</p>
            <div className="bg-slate-50 rounded-xl p-3 text-center text-sm font-mono text-slate-700">
              admin@compshield.com / demo123
              <br />
              <span className="text-xs text-slate-500">OTP demo: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
