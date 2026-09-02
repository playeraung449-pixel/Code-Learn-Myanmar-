/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Accessibility & Inclusive Learning Center Modal
 * Provides comprehensive visual, motor, and keyboard accessibility customization.
 */

import React, { useEffect } from "react";
import { 
  X, 
  Eye, 
  Type, 
  Contrast, 
  Sparkles, 
  Keyboard, 
  MousePointerClick, 
  Layers, 
  RotateCcw, 
  Check, 
  HelpCircle,
  Volume2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useAccessibility, FontSizeOption } from "../context/AccessibilityContext";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityModal({ isOpen, onClose }: AccessibilityModalProps) {
  const {
    settings,
    setFontSize,
    toggleHighContrast,
    toggleLargeTouchTargets,
    toggleFocusHighlight,
    toggleReadingSpacing,
    toggleReducedMotion,
    resetToDefaults,
    announceToScreenReader
  } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      announceToScreenReader("Accessibility settings opened");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
    >
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-2xl w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="a11y-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Accessibility & Usability</span>
                <span className="text-xs bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-mono font-normal">
                  လွယ်ကူစွာ အသုံးပြုနိုင်မှု
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                စာလုံးအရွယ်အစား၊ Contrast နှင့် ထိတွေ့ခလုတ်များကို လိုအပ်သလို ချိန်ညှိနိုင်ပါသည်
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close accessibility modal"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-blue-500 focus:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Section 1: Font Size (Readable Text) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Type className="w-4 h-4 text-blue-500" aria-hidden="true" />
                <span>1. စာလုံးအရွယ်အစား (Readable Font Size)</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {settings.fontSize === "normal" ? "Normal (100%)" : settings.fontSize === "large" ? "Large (112.5%)" : "Extra Large (125%)"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["normal", "large", "xlarge"] as FontSizeOption[]).map((size) => {
                const isSelected = settings.fontSize === size;
                const labels: Record<FontSizeOption, { en: string; mm: string }> = {
                  normal: { en: "Standard (100%)", mm: "ပုံမှန်" },
                  large: { en: "Large (115%)", mm: "ကြီး" },
                  xlarge: { en: "X-Large (125%)", mm: "အကြီးဆုံး" }
                };

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFontSize(size);
                      announceToScreenReader(`Font size set to ${size}`);
                    }}
                    className={`min-h-[48px] p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-md shadow-blue-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span className={`block font-bold ${size === "normal" ? "text-sm" : size === "large" ? "text-base" : "text-lg"}`}>
                      {labels[size].mm}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">{labels[size].en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Visual Contrast & Reading Spacing */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Contrast className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>2. မြင်သာထင်ရှားမှုနှင့် ဖတ်ရှုရလွယ်ကူမှု (Clear Contrast & Reading)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* High Contrast Toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleHighContrast();
                  announceToScreenReader(`High contrast mode ${!settings.highContrast ? "enabled" : "disabled"}`);
                }}
                className={`min-h-[56px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.highContrast
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">High Contrast (WCAG AAA)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">နယ်နိမိတ်နှင့် စာလုံးများကို ပိုမိုထင်ရှားစေမည်</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.highContrast ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                  {settings.highContrast && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Reading Spacing Toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleReadingSpacing();
                  announceToScreenReader(`Reading line spacing ${!settings.readingSpacing ? "enabled" : "disabled"}`);
                }}
                className={`min-h-[56px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.readingSpacing
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Spacious Line Height</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">စာကြောင်းအကွာအဝေးကို ချဲ့ထွင်ပေးမည်</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.readingSpacing ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                  {settings.readingSpacing && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Motor & Touch Targets */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <MousePointerClick className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <span>3. ခလုတ်များနှင့် ထိတွေ့ရလွယ်ကူမှု (Large Touch Targets)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Large Touch Targets */}
              <button
                type="button"
                onClick={() => {
                  toggleLargeTouchTargets();
                  announceToScreenReader(`Large touch targets ${!settings.largeTouchTargets ? "enabled" : "disabled"}`);
                }}
                className={`min-h-[56px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.largeTouchTargets
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Large Touch Targets (48px+)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">ခလုတ်များကို နှိပ်ရလွယ်စေရန် ကြီးပေးမည်</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.largeTouchTargets ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                  {settings.largeTouchTargets && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Focus Highlight Rings */}
              <button
                type="button"
                onClick={() => {
                  toggleFocusHighlight();
                  announceToScreenReader(`Focus rings ${!settings.focusHighlight ? "enabled" : "disabled"}`);
                }}
                className={`min-h-[56px] p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.focusHighlight
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Clear Focus Rings</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Keyboard ဖြင့် ရွေးချယ်ရာတွင် ပေါ်လွင်စေမည်</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.focusHighlight ? "bg-purple-500 border-purple-500 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                  {settings.focusHighlight && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Keyboard Shortcuts Reference */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span>4. ကီးဘုတ်ဖြတ်လမ်းများ (Keyboard Shortcuts)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Accessibility Settings ဖွင့်ရန်</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                  Alt + A
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">ကီးဘုတ်လမ်းညွှန် ကြည့်ရှုရန်</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                  Shift + ?
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">ဝင်းဒိုး သို့မဟုတ် မိုဒယ်လ် ပိတ်ရန်</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                  Esc
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">ခလုတ်များ အစဉ်လိုက် ရွှေ့ရန်</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">
                  Tab
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              resetToDefaults();
              announceToScreenReader("Accessibility settings reset to default");
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset to Default (မူလအတိုင်း ပြန်ထားမည်)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-blue-500 focus:outline-none"
          >
            <span>ပြီးပါပြီ (Done)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
