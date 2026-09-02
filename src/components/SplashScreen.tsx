/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Terminal } from "lucide-react";
import KiboMascot from "./KiboMascot";

interface SplashScreenProps {
  onSkip?: () => void;
  onComplete?: () => void;
}

export default function SplashScreen({ onSkip, onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  const handleFinish = () => {
    if (onComplete) onComplete();
    else if (onSkip) onSkip();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(handleFinish, 150); // Finish splash
          return 100;
        }
        return prev + 4; // Increment loading progress
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onSkip, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0F172A] flex flex-col items-center justify-center text-center px-4 overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="space-y-8 max-w-sm w-full relative z-10 animate-fade-in animate-duration-1000">
        {/* Kibo Mascot waving on Splash Screen */}
        <div className="mx-auto">
          <KiboMascot 
            emotion="excited" 
            size="md" 
            speechBubble="မင်္ဂလာပါ! ဒီနေ့ ဘာအသစ်သင်ယူကြမလဲ?" 
          />
        </div>

        {/* Brand Information */}
        <div className="space-y-2.5">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Code Learn <span className="text-blue-500">Myanmar</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>မြန်မာလို ပရိုဂရမ်မင်းသင်ယူစို့</span>
          </p>
        </div>

        {/* High-Fidelity Progress Indicator */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 px-1">
            <span>PLATFORM BOOTSTRAP</span>
            <span className="text-blue-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
            <div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-75"
            />
          </div>
        </div>

        {/* Bypass control button */}
        <button
          onClick={onSkip}
          className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-[10px] font-mono font-extrabold text-slate-300 hover:text-white transition-all cursor-pointer shadow"
        >
          <span>Bypass Loading (Skip)</span>
        </button>
      </div>

      {/* Developer note */}
      <p className="absolute bottom-6 text-[10px] text-slate-600 font-mono uppercase tracking-wider">
        Version 2.0.0 • Cloud Sync Enabled
      </p>
    </div>
  );
}
