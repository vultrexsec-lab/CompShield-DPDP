import Link from "next/link";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <Link href="/portal" className="font-semibold text-slate-900">CompShield · Data Principal Portal</Link>
          <nav className="flex gap-3 text-sm flex-wrap">
            <Link href="/portal" className="text-slate-600 hover:text-brand-600">Rights request</Link>
            <Link href="/portal/track" className="text-slate-600 hover:text-brand-600">Track</Link>
            <Link href="/portal/consent" className="text-slate-600 hover:text-brand-600">My consent</Link>
            <Link href="/login" className="text-brand-600 font-medium">Staff login</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-slate-400">
        Digital Personal Data Protection Act, 2023 — Data Principal rights portal
      </footer>
    </div>
  );
}
