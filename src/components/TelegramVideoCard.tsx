/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  Play, 
  FileText, 
  Info,
  Copy,
  FolderDown
} from "lucide-react";
import { Lesson, UserProfile, Course, TelegramChannelSettings } from "../types";
import { 
  getTelegramSettings, 
  getUserTelegramStatus, 
  DEFAULT_TELEGRAM_SETTINGS 
} from "../utils/telegramService";
import { isUserPremium } from "../utils/premiumSecurity";

interface TelegramVideoCardProps {
  lesson: Lesson;
  course: Course;
  user: UserProfile;
  onOpenTelegramHub: () => void;
  onNavigateToPremium?: () => void;
}

export default function TelegramVideoCard({
  lesson,
  course,
  user,
  onOpenTelegramHub,
  onNavigateToPremium
}: TelegramVideoCardProps) {
  const [settings, setSettings] = useState<TelegramChannelSettings>(DEFAULT_TELEGRAM_SETTINGS);
  const [telegramStatus, setTelegramStatus] = useState<"none" | "pending" | "approved" | "rejected" | "revoked">("none");
  const [privateInviteLink, setPrivateInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPremiumUser = isUserPremium(user);
  const isLessonPremium = lesson.accessConfig?.accessType === "premium" || lesson.telegramChannelType === "premium";

  useEffect(() => {
    loadSettings();
  }, [user.uid]);

  const loadSettings = async () => {
    try {
      const s = await getTelegramSettings();
      setSettings(s);

      const statusRes = await getUserTelegramStatus(user.uid);
      setTelegramStatus(statusRes.status);
      if (statusRes.inviteLink) {
        setPrivateInviteLink(statusRes.inviteLink);
      }
    } catch (err) {
      console.warn("Could not load telegram status in card:", err);
    }
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const videoTag = lesson.telegramPostId || `#${lesson.slug.replace(/-/g, "_")}`;
  const targetChannelUrl = isLessonPremium 
    ? (privateInviteLink || settings.premiumChannelInviteLink) 
    : (lesson.telegramDirectUrl || settings.freeChannelUrl);

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all text-left ${
      isLessonPremium
        ? "bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/30 text-white shadow-xl"
        : "bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-950 border-sky-500/30 text-white shadow-xl"
    }`}>
      {/* Top Banner / Channel Identifier */}
      <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 ${
        isLessonPremium
          ? "bg-amber-500/15 border-amber-500/20 text-amber-300"
          : "bg-sky-500/15 border-sky-500/20 text-sky-300"
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
            isLessonPremium ? "bg-amber-500" : "bg-sky-500"
          }`}>
            <Send className="w-4 h-4 transform -rotate-12" />
          </div>
          <span className="text-xs font-bold font-mono uppercase tracking-wider">
            {isLessonPremium ? "⭐ VIP Premium Telegram Video" : "Free Telegram Video Lesson"}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{lesson.duration}</span>
          </span>
          <button
            onClick={onOpenTelegramHub}
            className="hover:underline text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Access Info</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span>Channel:</span>
              <strong className="text-white">
                {isLessonPremium ? settings.premiumChannelName : settings.freeChannelName}
              </strong>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {lesson.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {isLessonPremium 
                ? "ဤသင်ခန်းစာ၏ အဆင့်မြင့် 1080p HD Video နှင့် အသံဖိုင်များကို Code Learn Myanmar Private Telegram VIP ချန်နယ်တွင် လေ့လာနိုင်ပါသည်။"
                : "အင်တာနက် bandwidth နှင့် ဒေတာ သက်သာစေရန် ဤသင်ခန်းစာ ဗီဒီယိုဖိုင်အား Telegram Free Channel တွင် အခမဲ့ ကြည့်ရှုနိုင်ပါသည်။"}
            </p>
          </div>

          {/* Video Lesson Tag Box */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Telegram Search Tag:</span>
            <div className="flex items-center space-x-1.5">
              <code className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-1 rounded border border-sky-800">
                {videoTag}
              </code>
              <button
                type="button"
                onClick={() => handleCopyTag(videoTag)}
                title="Copy Search Tag"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {copied && <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>}
          </div>
        </div>

        {/* Action Controls & Permissions */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2 text-xs">
            {isLessonPremium ? (
              !isPremiumUser ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>VIP Members Only (သော့ခတ်ထားပါသည်)</span>
                </span>
              ) : telegramStatus === "approved" ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Verified VIP Access</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>VIP Verification Pending</span>
                </span>
              )
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Public Free Access</span>
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isLessonPremium && !isPremiumUser ? (
              <button
                type="button"
                onClick={onNavigateToPremium}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                id="btn-unlock-telegram-premium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Premium အဆင့်မြှင့်တင်ပြီး ဗီဒီယိုကြည့်မည်</span>
              </button>
            ) : isLessonPremium && isPremiumUser && telegramStatus !== "approved" ? (
              <button
                type="button"
                onClick={onOpenTelegramHub}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
                id="btn-verify-telegram-req"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VIP ချန်နယ် ဝင်ခွင့်အတည်ပြုရန်</span>
              </button>
            ) : (
              <a
                href={targetChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer ${
                  isLessonPremium
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-sky-500 hover:bg-sky-600 shadow-sky-500/20"
                }`}
                id="btn-open-telegram-video"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Telegram တွင် ဗီဒီယို ဖွင့်ကြည့်ရှုရန်</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Telegram Materials / Source Code Button */}
            <a
              href={settings.freeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white font-medium text-xs transition cursor-pointer"
              id="btn-open-telegram-resources"
            >
              <FolderDown className="w-3.5 h-3.5 text-sky-400" />
              <span>သင်ထောက်ကူ ဖိုင်များ</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
