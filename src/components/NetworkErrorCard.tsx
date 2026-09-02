/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Beginner-Friendly Error Recovery Card
 * Translates technical error codes (e.g. 500, 404, NetworkError) into simple,
 * warm, and actionable explanations with high contrast, large touch targets,
 * and keyboard navigation support.
 */

import React, { useState } from "react";
import { 
  AlertTriangle, 
  RefreshCw, 
  WifiOff, 
  ArrowLeft, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ServerOff,
  ShieldAlert
} from "lucide-react";
import { getFriendlyErrorMessage } from "../utils/friendlyError";

interface NetworkErrorCardProps {
  error?: any;
  title?: string;
  titleMm?: string;
  description?: string;
  descriptionMm?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
  onGoHome?: () => void;
  isChunkError?: boolean;
  hasCachedData?: boolean;
}

export const NetworkErrorCard: React.FC<NetworkErrorCardProps> = ({
  error,
  title,
  titleMm,
  description,
  descriptionMm,
  onRetry,
  onContinueOffline,
  onGoHome,
  isChunkError = false,
  hasCachedData = false,
}) => {
  const [retrying, setRetrying] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Derive friendly error messaging
  const friendly = getFriendlyErrorMessage(error);

  const displayTitle = title || friendly.title;
  const displayTitleMm = titleMm || friendly.titleMm;
  const displayDesc = description || friendly.explanationMm;
  const displayDescMm = descriptionMm || friendly.explanationMm;
  const displayActionMm = friendly.actionMm;

  const handleRetryClick = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 600);
    }
  };

  const getErrorIcon = () => {
    if (friendly.category === "server") {
      return <ServerOff className="w-8 h-8 text-amber-500" aria-hidden="true" />;
    }
    if (friendly.category === "auth" || friendly.category === "permission") {
      return <ShieldAlert className="w-8 h-8 text-amber-500" aria-hidden="true" />;
    }
    if (isChunkError || friendly.category === "network") {
      return <WifiOff className="w-8 h-8 text-amber-500 animate-pulse" aria-hidden="true" />;
    }
    return <AlertTriangle className="w-8 h-8 text-amber-500" aria-hidden="true" />;
  };

  return (
    <div 
      className="w-full min-h-[50vh] flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-lg w-full bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-fade-in">
        {/* Error Category Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
          {getErrorIcon()}
        </div>

        {/* Clear, Simple Bilingual Title and Explanation */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold">
            <span>{displayTitle}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {displayTitleMm}
          </h3>
          
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {displayDescMm}
          </p>

          {displayActionMm && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 text-left flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{displayActionMm}</span>
            </div>
          )}
        </div>

        {/* Action Buttons with Large Touch Targets (min 48px) and High Contrast */}
        <div className="flex flex-col gap-3 pt-1">
          {onRetry && (
            <button
              onClick={handleRetryClick}
              disabled={retrying}
              type="button"
              aria-label="Try loading again"
              className="w-full min-h-[48px] inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white text-sm sm:text-base font-bold transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer focus-visible:ring-4 focus-visible:ring-blue-500 focus:outline-none"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>{retrying ? "ချိတ်ဆက်နေပါသည်..." : friendly.suggestedActionLabelMm || "ပြန်လည်ကြိုးစားမည် (Retry)"}</span>
            </button>
          )}

          {hasCachedData && onContinueOffline && (
            <button
              onClick={onContinueOffline}
              type="button"
              aria-label="Continue with cached offline data"
              className="w-full min-h-[48px] inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer focus-visible:ring-4 focus-visible:ring-emerald-500 focus:outline-none"
            >
              <Database className="w-4 h-4" aria-hidden="true" />
              <span>သိမ်းဆည်းထားသော အချက်အလက်ဖြင့် ဆက်သွားမည် (Continue Offline)</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              type="button"
              aria-label="Return to homepage"
              className="w-full min-h-[48px] inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm sm:text-base font-bold transition-all border-2 border-slate-300 dark:border-slate-700 cursor-pointer focus-visible:ring-4 focus-visible:ring-slate-400 focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>ပင်မစာမျက်နှာသို့ (Home)</span>
            </button>
          )}
        </div>

        {/* Optional Collapsible Technical Detail for curious developers/inspectors */}
        {friendly.rawMessage && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-left">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(prev => !prev)}
              aria-expanded={showTechnicalDetails}
              className="flex items-center justify-between w-full py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
            >
              <span className="font-mono">Technical Details (နည်းပညာဆိုင်ရာ အချက်အလက်)</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                <p className="text-amber-400 font-bold mb-1">Status Code: {friendly.statusCode || "N/A"}</p>
                <p className="break-all whitespace-pre-wrap">{friendly.rawMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
