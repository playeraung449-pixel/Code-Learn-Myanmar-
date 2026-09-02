/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, memo } from "react";
import { Sparkles, MessageSquare, X, ChevronRight, Zap, Code, Bug, BookOpen } from "lucide-react";
import Kibo3DMentor, { Kibo3DState } from "./Kibo3DMentor";
import { UserProfile } from "../types";
import { performanceManager } from "../lib/performanceManager";

interface FloatingKiboWidgetProps {
  user: UserProfile;
  currentTab: string;
  onNavigateTab: (tab: string, prompt?: string) => void;
}

function FloatingKiboWidgetComponent({
  user,
  currentTab,
  onNavigateTab
}: FloatingKiboWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIdx, setCurrentTipIdx] = useState(0);
  const [widgetState, setWidgetState] = useState<Kibo3DState>("idle");
  const [isDataSaver, setIsDataSaver] = useState(performanceManager.isDataSaverActive());

  useEffect(() => {
    const unsub = performanceManager.subscribe((st) => {
      setIsDataSaver(st.dataSaver.enabled);
    });
    return unsub;
  }, []);

  // Motivational and educational Myanmar learning tips for Kibo
  const kiboTips: Array<{
    state: Kibo3DState;
    text: string;
    actionTab: string;
    actionText: string;
    prompt?: string;
  }> = [
    {
      state: "greeting",
      text: `မင်္ဂလာပါ ${user?.name ? user.name.split(" ")[0] : "Student"}! ဒီနေ့ ဘယ် သင်ခန်းစာ သို့မဟုတ် ပရောဂျက်ကို အတူတူ လေ့လာကြမလဲဗျာ။`,
      actionTab: "courses",
      actionText: "သင်တန်းများ ကြည့်မည်"
    },
    {
      state: "explaining",
      text: "Programming Concepts တွေကို မြန်မာလို အသေးစိတ် ရှင်းပြပေးဖို့ ကျွန်တော် Kibo အမြဲ အဆင်သင့်ရှိပါတယ် ခင်ဗျာ!",
      actionTab: "ai-assistant",
      actionText: "Kibo နှင့် မေးမြန်းမည်"
    },
    {
      state: "error_help",
      text: "ကုဒ်ရေးရင်း Error တက်နေရင် စိတ်မပူပါနဲ့! Kibo AI က အမှားရှာဖွေပြီး လမ်းညွှန်ပေးပါမယ်။",
      actionTab: "debug-assistant",
      actionText: "Error ဖြေရှင်းမည်"
    },
    {
      state: "celebration",
      text: `သင်ယူမှု Streak ${user.learningStreak || 1} ရက် ပြည့်မြောက်ထားပါတယ်။ နေ့စဉ် ဆက်လက်ကြိုးစားကြစို့! 🔥🏆`,
      actionTab: "progress",
      actionText: "ဒိုင်ခွက် စစ်ဆေးမည်"
    },
    {
      state: "thinking",
      text: "Code Reviewer ဖြင့် သင်ရေးထားသော ကုဒ်များကို Professional စံနှုန်းနှင့် စစ်ဆေးကြည့်ပါ။",
      actionTab: "code-review",
      actionText: "Code Review စစ်မည်"
    }
  ];

  // Rotate tips occasionally (pause when tab hidden or data saver is on to prevent background rendering)
  useEffect(() => {
    if (isDataSaver) return;

    let intervalId: any = null;

    const startInterval = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          setCurrentTipIdx((prev) => {
            const next = (prev + 1) % kiboTips.length;
            setWidgetState(kiboTips[next].state);
            return next;
          });
        }
      }, 16000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalId) clearInterval(intervalId);
      } else {
        startInterval();
      }
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isDataSaver, kiboTips.length]);

  const activeTip = kiboTips[currentTipIdx];

  // Hide floating widget if in deep AI chat mode
  if (currentTab === "ai-assistant") return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end select-none">
      {/* Popover Bubble Card with 3D Mentor */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-3xl shadow-2xl shadow-blue-500/20 p-4 text-left animate-fade-in relative overflow-hidden transition-all duration-200">
          {/* Futuristic top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                <span>Kibo 3D Interactive Mentor</span>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono">3D AI ACTIVE</span>
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive 3D Kibo Body & Speech */}
          <div className="py-2">
            <Kibo3DMentor
              state={widgetState}
              onStateChange={(st) => setWidgetState(st)}
              compact={true}
              speechText={activeTip.text}
              onRequestExplanation={() => {
                onNavigateTab("ai-assistant");
                setIsOpen(false);
              }}
              onAskCodingHelp={() => {
                onNavigateTab("debug-assistant");
                setIsOpen(false);
              }}
              onAskExample={() => {
                onNavigateTab("ai-assistant");
                setIsOpen(false);
              }}
              onAskQuestion={() => {
                onNavigateTab("ai-assistant");
                setIsOpen(false);
              }}
            />
          </div>

          {/* Direct Navigation Footer */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onNavigateTab(activeTip.actionTab);
                setIsOpen(false);
              }}
              className="py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeTip.actionText}</span>
            </button>
            <button
              onClick={() => {
                onNavigateTab("ai-assistant");
                setIsOpen(false);
              }}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Full AI Chat 💬</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Kibo 3D AI Coding Mentor"
        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-200 cursor-pointer ${
          isOpen
            ? "bg-slate-900 text-white border-2 border-blue-500"
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border border-blue-400/40 hover:scale-105 shadow-blue-500/30"
        }`}
      >
        <div className="relative">
          <span className="text-xl">🤖</span>
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-mono leading-none text-blue-200">3D AI Mentor</span>
          <span className="text-xs font-display font-bold leading-tight">Kibo နှင့် ဆွေးနွေးပါ</span>
        </div>
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}

export const FloatingKiboWidget = memo(FloatingKiboWidgetComponent);
export default FloatingKiboWidget;

