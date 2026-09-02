/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Lightweight Suspense Fallback Loader
 * Prevents Cumulative Layout Shift (CLS) and provides instant feedback during lazy chunk loading.
 */

import React from "react";
import { Sparkles, Terminal } from "lucide-react";

interface SuspenseLoaderProps {
  message?: string;
  messageMm?: string;
  minHeight?: string;
}

export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  message = "Loading experience...",
  messageMm = "စာမျက်နှာ ဖွင့်နေပါသည် ခဏစောင့်ပါ...",
  minHeight = "min-h-[60vh]"
}) => {
  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center p-6 text-center animate-fade-in`}>
      <div className="relative mb-4">
        {/* Ambient Ring */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
          <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center animate-bounce">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-36 mx-auto animate-pulse" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {messageMm}
        </p>
      </div>
    </div>
  );
};
