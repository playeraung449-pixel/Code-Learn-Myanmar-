/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  Smartphone, 
  Download, 
  Zap, 
  X, 
  Info,
  HelpCircle,
  PlaySquare,
  AlertCircle,
  MessageSquare,
  Check
} from "lucide-react";
import { UserProfile, TelegramChannelSettings, TelegramAccessRequest } from "../types";
import { 
  getTelegramSettings, 
  submitTelegramAccessRequest, 
  getUserTelegramStatus, 
  DEFAULT_TELEGRAM_SETTINGS 
} from "../utils/telegramService";

interface TelegramVideoHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigateToPremium?: () => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onRefreshUser?: () => void;
}

export default function TelegramVideoHubModal({
  isOpen,
  onClose,
  user,
  onNavigateToPremium,
  onUpdateUser,
  onRefreshUser
}: TelegramVideoHubModalProps) {
  const [settings, setSettings] = useState<TelegramChannelSettings>(DEFAULT_TELEGRAM_SETTINGS);
  const [userTelegramReq, setUserTelegramReq] = useState<TelegramAccessRequest | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<"none" | "pending" | "approved" | "rejected" | "revoked">("none");
  const [telegramUsernameInput, setTelegramUsernameInput] = useState(user.telegramUsername || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isPremiumUser = user.role === "premium" || user.role === "teacher" || user.role === "admin" || (user as any).isPremium === true;

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, user.uid]);

  const loadData = async () => {
    try {
      const s = await getTelegramSettings();
      setSettings(s);

      const statusRes = await getUserTelegramStatus(user.uid);
      setTelegramStatus(statusRes.status);
      if (statusRes.request) {
        setUserTelegramReq(statusRes.request);
      }
    } catch (err) {
      console.error("Error loading Telegram hub data:", err);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramUsernameInput.trim()) {
      setFeedbackMsg({ type: "error", text: "Telegram Username ထည့်သွင်းပေးပါရန် (e.g. @your_username)" });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const req = await submitTelegramAccessRequest(user, telegramUsernameInput.trim());
      setUserTelegramReq(req);
      setTelegramStatus("pending");
      setFeedbackMsg({ 
        type: "success", 
        text: "Telegram Access Request တင်သွင်းပြီးပါပြီ! Administrator မှ အတည်ပြုပြီးပါက Private Channel သို့ ဝင်ရောက်နိုင်မည် ဖြစ်ပါသည်။" 
      });
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          telegramUsername: telegramUsernameInput.trim(),
          telegramVerificationStatus: "pending"
        });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "တောင်းဆိုမှု တင်သွင်းရာတွင် အမှားအယွင်းရှိပါသည်" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isVerifiedPremium = isPremiumUser && (telegramStatus === "approved" || user.telegramVerificationStatus === "approved");
  const adminContactUrl = `https://t.me/${(settings.supportTelegramHandle || "Johnny_AZM").replace("@", "")}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-left">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header with Telegram Branding */}
        <div className="relative bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            id="btn-close-telegram-hub"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
              <Send className="w-6 h-6 transform -rotate-12" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Video Lesson Delivery Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Telegram Video Access
              </h2>
            </div>
          </div>

          <p className="text-white/90 text-sm max-w-2xl mt-2 leading-relaxed">
            Code Learn Myanmar ၏ ဗီဒီယိုသင်ခန်းစာများကို မြန်မာနိုင်ငံရှိ အင်တာနက် bandwidth နှင့် ဖုန်းဒေတာ သက်သာစေရန် Telegram ဖြင့် စနစ်တကျ ဖြန့်ဝေပေးထားပါသည်။
          </p>

          {/* Quick Stats & Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15 text-xs">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>High Speed Streaming</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Saves 80% Mobile Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-sky-300 flex-shrink-0" />
              <span>Offline Video Download</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-300 flex-shrink-0" />
              <span>Verified VIP Channel</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {feedbackMsg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center space-x-3 border ${
              feedbackMsg.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
            }`}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{feedbackMsg.text}</span>
            </div>
          )}

          {/* User Status Bar */}
          <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${isVerifiedPremium ? 'bg-emerald-500 animate-pulse' : isPremiumUser ? 'bg-amber-500' : 'bg-slate-400'}`} />
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Account Status
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isVerifiedPremium ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Premium Access
                    </span>
                  ) : isPremiumUser ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Premium Member (Verification Required)
                    </span>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      Free User (Standard Access)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* UID Quick Copy Pill */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400 font-mono">UID:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{user.uid}</span>
              <button
                type="button"
                onClick={() => handleCopy(user.uid, "bar_uid")}
                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 ml-1 cursor-pointer"
                title="Copy UID"
              >
                {copiedItem === "bar_uid" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* MAIN ACCESS CARDS (Free User vs Premium User with Strict Separation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ========================================================= */}
            {/* 1. FREE USER WORKFLOW */}
            {/* Free User -> Public Telegram Channel -> Free Video Lessons */}
            {/* ========================================================= */}
            <div className="bg-slate-50 dark:bg-[#1E293B] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-md relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                    Free User Access
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Public Telegram Channel
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Channel:</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      {settings.freeChannelHandle || "@code_Learn_myanmar"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settings.freeChannelDescription || "Code Learn Myanmar ၏ အခမဲ့ ဗီဒီယို သင်ခန်းစာများ၊ ပရိုဂရမ်မင်း အခြေခံ ဗီဒီယိုများနှင့် စာရွက်စာတမ်းများကို လွတ်လပ်စွာ ဝင်ရောက်လေ့လာနိုင်ပါသည်။"}
                </p>

                {/* Clear Visual Flow for Free User */}
                <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    ⚡ Free User Delivery Flow:
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-200">
                    <span className="font-bold">Free User</span>
                    <span className="text-emerald-500">→</span>
                    <span className="text-sky-500 font-bold">Public Telegram Channel</span>
                    <span className="text-emerald-500">→</span>
                    <span className="text-emerald-500 font-bold">Free Video Lessons</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Free Video Lessons (အခမဲ့ ဗီဒီယိုသင်ခန်းစာများ)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Python, HTML, CSS, JavaScript အခြေခံများ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Public Community အမေးအဖြေများနှင့် သတင်းများ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                <a
                  href={settings.freeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  id="btn-join-free-channel"
                >
                  <Send className="w-4 h-4" />
                  <span>Join Public Telegram Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(settings.freeChannelUrl, "free")}
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  id="btn-copy-free-telegram"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedItem === "free" ? "Link Copied!" : "Copy Public Channel Link"}</span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. PREMIUM USER WORKFLOW */}
            {/* Premium User -> Copy UID -> Contact Admin -> Admin Verification -> Premium Approved -> Private Telegram Channel */}
            {/* ========================================================= */}
            <div className="relative overflow-hidden bg-gradient-to-b from-amber-500/5 via-slate-50 to-slate-50 dark:from-amber-500/10 dark:via-[#1E293B] dark:to-[#1E293B] border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-lg">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{isVerifiedPremium ? "Private VIP Channel" : "Premium VIP Workflow"}</span>
                  </span>
                  {isVerifiedPremium ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Private Telegram VIP Channel</span>
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admin Support:</span>
                    <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/40">
                      {settings.supportTelegramHandle || "@Johnny_AZM"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settings.premiumChannelDescription || "Premium VIP အဖွဲ့ဝင်များအတွက် သီးသန့် သတ်မှတ်ထားသော Private Telegram Channel ဖြစ်ပြီး၊ အဆင့်မြင့် ပရောဂျက်ဗီဒီယိုများနှင့် Downloadable Resource ZIP များကို ရယူနိုင်ပါသည်။"}
                </p>

                {/* Visual Step-by-Step Flow for Premium User */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    👑 Premium User Access Pipeline:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-800 dark:text-slate-200 leading-normal">
                    <span className="px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-400 font-bold">1. Premium User</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-sky-500/20 rounded text-sky-400 font-bold">2. Copy UID</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-blue-500/20 rounded text-blue-400 font-bold">3. Contact Admin</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-indigo-400 font-bold">4. Admin Verification</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 rounded text-emerald-400 font-bold">5. Approved</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-400 font-bold">6. Private Channel</span>
                  </div>
                </div>

                {/* VIP Perks */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>1080p Full HD Masterclass Videos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Full Source Code ZIP Packages</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Direct Mentor Q&A Group Access</span>
                  </div>
                </div>
              </div>

              {/* Status & Action Logic */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
                {!isPremiumUser ? (
                  /* Case A: Non-premium user */
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-2">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Private VIP Telegram ချန်နယ်ကို အသုံးပြုရန် Premium Plan သို့ အဆင့်မြှင့်တင်ရန် လိုအပ်ပါသည်။</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigateToPremium) onNavigateToPremium();
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                      id="btn-upgrade-for-telegram"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Upgrade to Premium</span>
                    </button>
                  </div>
                ) : isVerifiedPremium ? (
                  /* Case B: VERIFIED PREMIUM (After approval -> Private Telegram Channel) */
                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 space-y-1.5">
                      <div className="flex items-center space-x-2 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Premium Approved • VIP Access Unlocked</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        Admin မှ သင့်အကောင့် (UID: {user.uid.slice(0, 10)}...) အား စစ်ဆေးအတည်ပြုပေးပြီး ဖြစ်ပါသည်။ အောက်ပါခလုတ်ကို နှိပ်၍ Private VIP Channel သို့ တိုက်ရိုက်ဝင်ရောက်နိုင်ပါသည်။
                      </p>
                    </div>

                    {/* [ Open Private Telegram Channel ] button */}
                    <a
                      href={userTelegramReq?.privateInviteLink || settings.premiumChannelInviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                      id="btn-open-premium-channel"
                    >
                      <Send className="w-4 h-4" />
                      <span>Open Private Telegram Channel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(userTelegramReq?.privateInviteLink || settings.premiumChannelInviteLink, "vip_link")}
                      className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedItem === "vip_link" ? "VIP Link Copied!" : "Copy VIP Invite Link"}</span>
                    </button>
                  </div>
                ) : (
                  /* Case C: PREMIUM USER (Needs verification: Copy UID -> Contact Admin) */
                  <div className="space-y-4">
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Copy your UID and contact Admin for verification.</span>
                      </div>
                      
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
                        <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                          <span className="text-slate-400">Your UID: </span>
                          <span className="font-bold text-amber-400 select-all">{user.uid}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: [ Copy UID ] & [ Contact Admin ] */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(user.uid, "uid_btn")}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        id="btn-copy-uid-telegram"
                      >
                        {copiedItem === "uid_btn" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>Copy UID</span>
                          </>
                        )}
                      </button>

                      <a
                        href={adminContactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        id="btn-contact-admin-telegram"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contact Admin</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>

                    {/* Optional Quick In-App Username Submission */}
                    {telegramStatus !== "pending" && (
                      <form onSubmit={handleSubmitVerification} className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                          သို့မဟုတ် Telegram Username ထည့်သွင်း၍ Request တင်ပါ:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={telegramUsernameInput}
                            onChange={(e) => setTelegramUsernameInput(e.target.value)}
                            placeholder="@your_username"
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                          >
                            {isSubmitting ? "..." : "Send"}
                          </button>
                        </div>
                      </form>
                    )}

                    {telegramStatus === "pending" && (
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[11px] text-sky-700 dark:text-sky-300 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                        <span>Verification request submitted. Awaiting admin approval.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick FAQ / Guide */}
          <div className="bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Telegram ဖြင့် လေ့လာရာတွင် သိမှတ်ဖွယ်ရာများ</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-relaxed">
              <div className="space-y-1">
                <strong className="text-slate-800 dark:text-slate-200 block">၁။ ဗီဒီယို ရှာဖွေနည်း</strong>
                <p>သင်ခန်းစာတစ်ခုစီအတွက် Tag နံပါတ်များ (ဥပမာ - <code>#Python_Lesson_01</code>) ဖြင့် အလွယ်တကူ ရှာဖွေကြည့်ရှုနိုင်ပါသည်။</p>
              </div>
              <div className="space-y-1">
                <strong className="text-slate-800 dark:text-slate-200 block">၂။ ဖုန်းဒေတာ သက်သာစေရန်</strong>
                <p>Telegram App ၏ Settings &gt; Data and Storage တွင် Download settings ကို ချိန်ညှိပြီး ဗီဒီယိုများကို စက်ထဲသို့ Offline သိမ်းဆည်းထားနိုင်ပါသည်။</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <PlaySquare className="w-4 h-4 text-sky-500" />
            <span>Code Learn Myanmar • Official Telegram Streaming System</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            ပိတ်မည် (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
