/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  Terminal,
  RefreshCw,
  Mail,
  Phone,
  Send,
  Lock,
  ChevronRight,
  ExternalLink,
  Code,
  Sparkles
} from "lucide-react";
import { PlatformSystemSettings } from "../types";

interface MaintenanceScreenProps {
  settings?: PlatformSystemSettings;
  onAdminBypassLogin: () => void;
}

export function MaintenanceScreen({ settings, onAdminBypassLogin }: MaintenanceScreenProps) {
  const [checking, setChecking] = useState(false);

  const titleMm = settings?.maintenanceTitleMm || "ဆာဗာ စနစ်ပိုင်း အဆင့်မြှင့်တင်နေပါသည်";
  const messageMm =
    settings?.maintenanceMessageMm ||
    "Code Learn Myanmar ၏ ဒေတာဘေ့စ်နှင့် ဆာဗာပိုင်း အဆင့်မြှင့်တင်မှုများ ပြုလုပ်နေပါသဖြင့် ဝဘ်ဆိုက်အား ခေတ္တ ပိတ်ထားရခြင်း ဖြစ်ပါသည်။ သင်ယူလေ့လာခွင့်အား မကြာမီ ပြန်လည်ဖွင့်လှစ်ပေးပါမည်။";

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-amber-500/20">
            CLM
          </div>
          <div>
            <span className="font-bold text-base text-white block">Code Learn Myanmar</span>
            <span className="text-[11px] text-slate-400 font-burmese block">ပရိုဂရမ်မင်း ပညာရေး ပလက်ဖောင်း</span>
          </div>
        </div>

        <button
          onClick={onAdminBypassLogin}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-all flex items-center space-x-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
      </header>

      {/* Main Notice Card */}
      <main className="max-w-2xl w-full mx-auto px-6 py-12 text-center z-10 space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/5 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-widest inline-block">
            Under Scheduled Maintenance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-burmese">
            {titleMm}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-burmese leading-relaxed max-w-xl mx-auto">
            {messageMm}
          </p>
        </div>

        {/* Estimated Time & Progress */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Estimated Completion:</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {settings?.maintenanceEstimatedEndTime
                ? new Date(settings.maintenanceEstimatedEndTime).toLocaleString()
                : "Approximately 30 - 60 Mins"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>System Backup Status:</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">Safe & Preserved</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full w-3/4 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>စနစ်ပြန်လည် စစ်ဆေးမည် (Refresh)</span>
          </button>

          {settings?.contactTelegramChannel && (
            <a
              href={settings.contactTelegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Telegram Channel သို့ သွားမည်</span>
            </a>
          )}
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="p-6 border-t border-slate-900 max-w-6xl w-full mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        <div className="flex items-center space-x-4">
          {settings?.contactEmail && (
            <span className="flex items-center space-x-1 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{settings.contactEmail}</span>
            </span>
          )}
          {settings?.contactPhone && (
            <span className="flex items-center space-x-1 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{settings.contactPhone}</span>
            </span>
          )}
        </div>
        <p className="font-burmese">
          © {new Date().getFullYear()} Code Learn Myanmar. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default MaintenanceScreen;
