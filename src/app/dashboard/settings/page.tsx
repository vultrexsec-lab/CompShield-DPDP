"use client";

import { Settings, Building2, Users, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your organization and platform preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar nav */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          {[
            { icon: Building2, label: "Organization", active: true },
            { icon: Users, label: "Team Members" },
            { icon: Bell, label: "Notifications" },
            { icon: Shield, label: "Security" },
            { icon: Key, label: "API Keys & Integrations" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                item.active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="font-semibold text-slate-900">Organization Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Acme Technologies Pvt Ltd"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Industry
              </label>
              <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>E-commerce</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                DPO Name
              </label>
              <input
                type="text"
                defaultValue="Rahul Verma"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                DPO Email
              </label>
              <input
                type="email"
                defaultValue="dpo@acme.com"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Registered Address
            </label>
            <textarea
              rows={3}
              defaultValue="P4 502 Pentagon Towers, Magarpatta Cybercity, Hadapsar, Pune, Maharashtra 411028"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
