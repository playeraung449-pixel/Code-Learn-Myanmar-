/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Universal Loading State & Skeleton Loaders
 * Provides instant feedback during content retrieval, prevents layout shifts,
 * and includes a slow-connection timeout recovery helper.
 */

import React, { useState, useEffect } from "react";
import { Terminal, Sparkles, RefreshCw, Wifi, WifiOff } from "lucide-react";

export type LoadingVariant = 
  | "full_page"
  | "course_grid"
  | "lesson_view"
  | "stats_dashboard"
  | "list"
  | "card"
  | "inline";

interface LoadingStateProps {
  variant?: LoadingVariant;
  message?: string;
  messageMm?: string;
  count?: number;
  className?: string;
  minHeight?: string;
  onRetry?: () => void;
  timeoutSeconds?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = "full_page",
  message = "Loading content...",
  messageMm = "အချက်အလက်များ ဆွဲတင်နေပါသည် ခဏစောင့်ပါ...",
  count = 3,
  className = "",
  minHeight = "min-h-[40vh]",
  onRetry,
  timeoutSeconds = 6
}) => {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTakingLonger(true);
    }, timeoutSeconds * 1000);

    return () => clearTimeout(timer);
  }, [timeoutSeconds]);

  // SKELETON: Course Grid
  if (variant === "course_grid") {
    return (
      <div className={`w-full space-y-4 ${className}`} role="status" aria-label="Loading courses">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm"
            >
              <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded-md w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded-md w-2/3" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-28" />
              </div>
            </div>
          ))}
        </div>

        {isTakingLonger && (
          <SlowConnectionNotice onRetry={onRetry} />
        )}
      </div>
    );
  }

  // SKELETON: Lesson Content View
  if (variant === "lesson_view") {
    return (
      <div className={`w-full max-w-4xl mx-auto space-y-6 p-4 animate-pulse ${className}`} role="status" aria-label="Loading lesson">
        {/* Header Breadcrumb and Title Skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
          <div className="flex items-center space-x-3">
            <div className="h-5 bg-blue-100 dark:bg-blue-900/40 rounded-full w-24" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
          </div>
        </div>

        {/* Lesson Objective Banner Skeleton */}
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
        </div>

        {/* Code Sandbox Skeleton */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-10 bg-slate-800 dark:bg-slate-900 flex items-center px-4 space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="h-56 bg-slate-900 p-4 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-2/5" />
          </div>
        </div>

        {/* Paragraphs Skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
        </div>

        {isTakingLonger && (
          <SlowConnectionNotice onRetry={onRetry} />
        )}
      </div>
    );
  }

  // SKELETON: Stats Dashboard
  if (variant === "stats_dashboard") {
    return (
      <div className={`w-full space-y-6 ${className}`} role="status" aria-label="Loading dashboard">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-12 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded-md w-full" />
            </div>
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-48" />
          <div className="h-32 bg-slate-100 dark:bg-slate-850 rounded-xl" />
        </div>
      </div>
    );
  }

  // SKELETON: List Items
  if (variant === "list") {
    return (
      <div className={`w-full space-y-3 ${className}`} role="status" aria-label="Loading items">
        {Array.from({ length: count }).map((_, idx) => (
          <div 
            key={idx} 
            className="flex items-center space-x-4 p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-2/3" />
            </div>
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // SKELETON: Inline Small Spinner
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 ${className}`} role="status">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" aria-hidden="true" />
        <span>{messageMm}</span>
      </div>
    );
  }

  // DEFAULT: Full Page / Centered Card Loader
  return (
    <div 
      className={`w-full ${minHeight} flex flex-col items-center justify-center p-6 text-center animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center animate-pulse">
          <Terminal className="w-7 h-7 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center animate-bounce shadow-md">
          <Sparkles className="w-3 h-3 text-white" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
          {messageMm}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {message}
        </p>
      </div>

      {isTakingLonger && (
        <div className="mt-6 max-w-sm w-full">
          <SlowConnectionNotice onRetry={onRetry} />
        </div>
      )}
    </div>
  );
};

// Helper: Slow Connection Notice with Retry Action
const SlowConnectionNotice: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left space-y-3 animate-fade-in">
      <div className="flex items-start space-x-2.5">
        <Wifi className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
            ဆွဲတင်မှု အနည်းငယ် ကြာမြင့်နေပါသည် (Taking longer than usual)
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed font-sans">
            အင်တာနက် လိုင်းအခြေအနေ နှေးကွေးနေနိုင်ပါသည်။ ပြန်လည် ကြိုးစားကြည့်လိုပါသလား။
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>ထပ်မံကြိုးစားမည် (Retry Now)</span>
        </button>
      )}
    </div>
  );
};

export default LoadingState;
