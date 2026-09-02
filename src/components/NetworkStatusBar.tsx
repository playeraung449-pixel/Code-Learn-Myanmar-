/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Network Status, Offline Queue & Data Saver Adaptive Indicator
 * Provides instant feedback when offline, on 2G/3G slow networks, or when
 * locally queued learning progress is pending synchronization.
 */

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  Zap, 
  CheckCircle2, 
  X, 
  Settings2, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  AlertCircle,
  Clock
} from "lucide-react";
import { performanceManager, NetworkPerformanceState } from "../lib/performanceManager";
import { offlineSyncManager, SyncStatusState } from "../lib/offlineSyncManager";
import { DataSaverModal } from "./DataSaverModal";

export const NetworkStatusBar: React.FC = () => {
  const [netState, setNetState] = useState<NetworkPerformanceState>(performanceManager.getState());
  const [syncState, setSyncState] = useState<SyncStatusState>(offlineSyncManager.getState());
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncedCountNotification, setSyncedCountNotification] = useState<number | null>(null);
  const [wasOffline, setWasOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);

  useEffect(() => {
    const unsubPerf = performanceManager.subscribe((state) => {
      if (!state.isOnline) {
        setWasOffline(true);
        setIsDismissed(false);
      } else if (wasOffline && state.isOnline) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
      setNetState(state);
    });

    const unsubSync = offlineSyncManager.subscribe((state) => {
      setSyncState(state);
      if (state.pendingCount > 0) {
        setIsDismissed(false);
      }
    });

    const handleSyncCompleted = (e: any) => {
      const { syncedCount } = e.detail || {};
      if (syncedCount && syncedCount > 0) {
        setSyncedCountNotification(syncedCount);
        setShowReconnected(true);
        setTimeout(() => {
          setSyncedCountNotification(null);
          setShowReconnected(false);
        }, 4000);
      }
    };

    window.addEventListener("clm_sync_completed", handleSyncCompleted);

    return () => {
      unsubPerf();
      unsubSync();
      window.removeEventListener("clm_sync_completed", handleSyncCompleted);
    };
  }, [wasOffline]);

  const handleToggleDataSaver = () => {
    performanceManager.toggleDataSaver();
  };

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    try {
      await offlineSyncManager.triggerSync();
    } finally {
      setIsSyncingManual(false);
    }
  };

  // Check if we should hide the component
  const hasPendingQueue = syncState.pendingCount > 0;
  const isSyncing = syncState.isSyncing || isSyncingManual;

  if (
    netState.isOnline && 
    !netState.isLowBandwidth && 
    !netState.liteMode && 
    !showReconnected && 
    !hasPendingQueue && 
    !isSyncing
  ) {
    return null;
  }

  if (isDismissed && !showReconnected && netState.isOnline && !hasPendingQueue) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[94%] sm:w-auto animate-fade-in pointer-events-auto">
      {/* 1. Offline Mode Banner with Queue Details */}
      {!netState.isOnline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md text-white shadow-xl shadow-amber-500/25 text-xs font-medium border border-amber-300/40 space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2.5">
            <WifiOff className="w-4 h-4 text-white animate-pulse shrink-0" />
            <div>
              <span className="font-bold">အော့ဖ်လိုင်းစနစ် (Offline):</span>{" "}
              <span className="opacity-95">သိမ်းဆည်းထားသော အချက်အလက်များဖြင့် ဆက်လက်လေ့လာနိုင်ပါသည်။</span>
              {hasPendingQueue && (
                <div className="text-[11px] font-semibold text-amber-100 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>အော့ဖ်လိုင်း ပြောင်းလဲမှု ({syncState.pendingCount}) ခု သိမ်းထားပါသည် (လိုင်းရပါက အလိုအလျောက် Sync ပြုလုပ်ပါမည်)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Syncing in Progress Pill */}
      {isSyncing && netState.isOnline && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-600/95 dark:bg-blue-700/95 backdrop-blur-md text-white shadow-xl shadow-blue-500/25 text-xs font-medium border border-blue-400/40 space-x-3">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-white animate-spin shrink-0" />
            <div>
              <span className="font-bold">အချက်အလက်များ ချိတ်ဆက်နေသည်:</span>{" "}
              <span>{syncState.pendingCount} ခု ဆာဗာသို့ ပေးပို့နေပါသည်...</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Just Reconnected / Sync Completed Toast */}
      {showReconnected && netState.isOnline && !isSyncing && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-500/95 dark:bg-emerald-600/95 backdrop-blur-md text-white shadow-xl shadow-emerald-500/25 text-xs font-medium border border-emerald-300/40 space-x-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="font-bold">အင်တာနက် ပြန်လည်ချိတ်ဆက်ပြီး:</span>{" "}
              <span>
                {syncedCountNotification 
                  ? `အော့ဖ်လိုင်းဒေတာ (${syncedCountNotification}) ခု အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ။` 
                  : "ဒေတာများ အလိုအလျောက် Update ပြုလုပ်ပြီးပါပြီ။"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowReconnected(false)}
            className="p-1 text-emerald-100 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Online with Pending Queue (Waiting for Sync or Slow Connection) */}
      {netState.isOnline && hasPendingQueue && !isSyncing && !showReconnected && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-indigo-600/95 dark:bg-indigo-700/95 backdrop-blur-md text-white shadow-xl shadow-indigo-500/25 text-xs font-medium border border-indigo-400/40 space-x-3">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-indigo-200 shrink-0" />
            <div>
              <span className="font-bold">ဆာဗာသို့ မပေးပို့ရသေးသော ဒေတာ:</span>{" "}
              <span>{syncState.pendingCount} ခု ကျန်ရှိပါသည်</span>
            </div>
          </div>
          <button
            onClick={handleManualSync}
            className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync ပြုလုပ်မည်</span>
          </button>
        </div>
      )}

      {/* 5. Slow Internet / Lite Mode Pill */}
      {netState.isOnline && (netState.isLowBandwidth || netState.liteMode) && !showReconnected && !hasPendingQueue && !isSyncing && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-200 shadow-xl border border-slate-700/60 text-xs font-medium space-x-3">
          <div 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
            title="ဒေတာချွေတာရေး ဆက်တင်များ ဖွင့်ရန်"
          >
            {netState.liteMode ? (
              <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <div className="text-[11px] sm:text-xs">
              <span className="font-bold text-white">
                {netState.liteMode ? "Data Saver: ON" : "Data Saver: OFF"}
              </span>
              <span className="hidden sm:inline text-slate-400 ml-1">
                {netState.liteMode ? "(အင်တာနက် သုံးစွဲမှု ချွေတာနေသည်)" : "(မိုဘိုင်းဒေတာ ချွေတာနိုင်ပါသည်)"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleToggleDataSaver}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                netState.liteMode 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30" 
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600"
              }`}
            >
              {netState.liteMode ? "OFF ပြုလုပ်မည်" : "ON ပြုလုပ်မည်"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Data Saver ဆက်တင်များ"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="ပိတ်မည်"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Data Saver Modal */}
      <DataSaverModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
