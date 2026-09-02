/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Quick Data Saver Modal
 */

import React, { useState, useEffect } from "react";
import { X, Zap, CheckCircle2, Wifi, Signal, Cpu, ShieldCheck } from "lucide-react";
import { performanceManager, NetworkPerformanceState } from "../lib/performanceManager";
import { DataSaverSettingsCard } from "./DataSaverSettingsCard";
import { UserProfile } from "../types";

interface DataSaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onUpdateUser?: (updatedUser: Partial<UserProfile>) => void;
}

export const DataSaverModal: React.FC<DataSaverModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [netState, setNetState] = useState<NetworkPerformanceState>(performanceManager.getState());

  useEffect(() => {
    const unsub = performanceManager.subscribe((state) => {
      setNetState(state);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                Data Saver Control Center
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                မိုဘိုင်းအင်တာနက် ဒေတာချွေတာရေး ချိန်ညှိမှုများ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          <DataSaverSettingsCard user={user} onUpdateUser={onUpdateUser} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ပြီးပါပြီ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
export default DataSaverModal;
