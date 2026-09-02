/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Keyboard Shortcuts & Beginner Navigation Guide
 */

import React from "react";
import { X, Keyboard, Command, Compass, CheckCircle2, BookOpen, Sparkles, MessageSquare, User } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "အထွေထွေ အသုံးပြုမှု (General Navigation)",
      items: [
        { key: "Shift + ?", descMm: "ဤကီးဘုတ်ဖြတ်လမ်း လမ်းညွှန်ကို ဖွင့်ရန်/ပိတ်ရန်", descEn: "Toggle keyboard shortcuts cheat sheet" },
        { key: "Alt + A", descMm: "Accessibility (စာလုံးအရွယ်အစား & Contrast) ဖွင့်ရန်", descEn: "Open accessibility & display preferences" },
        { key: "Esc", descMm: "ပွင့်နေသော ဝင်းဒိုး၊ မိုဒယ်လ် သို့မဟုတ် Dropdown ကို ပိတ်ရန်", descEn: "Close any active modal or menu" },
        { key: "Tab", descMm: "ခလုတ်များနှင့် လင့်ခ်များကို အစဉ်လိုက် ရွေးချယ်ရန်", descEn: "Navigate to next focusable element" },
        { key: "Shift + Tab", descMm: "ခလုတ်များကို ရှေ့သို့ ပြန်လည်ရွေးချယ်ရန်", descEn: "Navigate to previous focusable element" },
        { key: "Enter / Space", descMm: "ရွေးချယ်ထားသော ခလုတ် သို့မဟုတ် လင့်ခ်ကို နှိပ်ရန်", descEn: "Activate focused element" },
      ]
    },
    {
      category: "သင်ကြားရေးနှင့် စာမျက်နှာများ (Learning & Navigation)",
      items: [
        { key: "Ctrl + Enter", descMm: "Code Playground တွင် ရေးထားသော Code ကို Run ရန်", descEn: "Execute code in the Interactive Sandbox" },
        { key: "Arrow Up / Down", descMm: "စာမျက်နှာ သို့မဟုတ် သင်ခန်းစာကို အထက်/အောက် ရွှေ့ရန်", descEn: "Scroll lesson content smoothly" },
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-2xl w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Keyboard Navigation Guide</span>
                <span className="text-xs bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-mono font-normal">
                  ကီးဘုတ်ဖြတ်လမ်းများ
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mouse မလိုဘဲ Keyboard ဖြင့် မြန်ဆန်လွယ်ကူစွာ အသုံးပြုနိုင်သော နည်းလမ်းများ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close shortcuts guide"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-purple-500 focus:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {section.category}
              </h3>

              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div 
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.descMm}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.descEn}
                      </p>
                    </div>

                    <kbd className="px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm flex-shrink-0">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Beginner Tips */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>အစပြုသူများအတွက် အကြံပြုချက် (Beginner Usability Tip)</span>
            </h4>
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              သင်သည် မည်သည့်စာမျက်နှာတွင်မဆို <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded font-mono font-bold">Tab</kbd> ကို နှိပ်ပြီး ခလုတ်များကို ရွှေ့နိုင်ပြီး <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded font-mono font-bold">Enter</kbd> ဖြင့် ချက်ချင်း အလုပ်လုပ်စေနိုင်ပါသည်။
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-purple-500 focus:outline-none"
          >
            <span>နားလည်ပါပြီ (Got It)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
