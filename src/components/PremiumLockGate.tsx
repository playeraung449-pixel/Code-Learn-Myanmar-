/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Lock, ShieldCheck, ArrowRight, CheckCircle2, Zap, Award, Star } from "lucide-react";

interface PremiumLockGateProps {
  title: string;
  description: string;
  benefits?: string[];
  previewSnippet?: React.ReactNode;
  onUpgradeClick: () => void;
  compact?: boolean;
}

export default function PremiumLockGate({
  title,
  description,
  benefits = [
    "အဆင့်မြင့် အကန့်အသတ်မဲ့ သင်ခန်းစာများနှင့် ရုတ်တရက် အကြောင်းအရာများ ကြည့်ရှုခွင့်",
    "Kibo AI Mentor ဖြင့် အကန့်အသတ်မဲ့ မေးခွန်းများ မေးမြန်းနိုင်ခြင်း",
    "QR Verified တရားဝင် ဘွဲ့ရလက်မှတ်များ ရယူခွင့်",
    "ကြော်ငြာ ကင်းစင်ပြီး ဦးစားပေး Support ရရှိခြင်း"
  ],
  previewSnippet,
  onUpgradeClick,
  compact = false
}: PremiumLockGateProps) {
  if (compact) {
    return (
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl flex-shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
                PREMIUM ONLY
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-all flex-shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Upgrade to Premium</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] border border-amber-500/30 rounded-3xl p-6 md:p-8 text-left shadow-xl space-y-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Optional Blurred Content Preview */}
      {previewSnippet && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
          <div className="filter blur-sm select-none pointer-events-none opacity-40">
            {previewSnippet}
          </div>
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="px-3 py-1 bg-slate-900/80 border border-amber-500/40 text-amber-400 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg">
              <Lock className="w-3.5 h-3.5" />
              <span>Premium Content Locked</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Lock Card Details */}
      <div className="relative z-10 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                👑 Kibo Premium Feature
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Benefits Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kibo Premium အကောင့်၏ အဓိက ခံစားခွင့်များ (Key Benefits)</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start space-x-2 text-slate-600 dark:text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onUpgradeClick}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Upgrade to Premium Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            * ချက်ချင်း အဆင့်မြှင့်တင်၍ အကန့်အသတ်မရှိ လေ့လာနိုင်ပါသည်
          </span>
        </div>
      </div>
    </div>
  );
}
