/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Data Saver Mode Settings Control Panel
 * Provides student-facing controls to enable/disable data saving modes,
 * reduce bandwidth consumption on mobile networks, and optimize device performance.
 */

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  ZapOff, 
  Image as ImageIcon, 
  Film, 
  DownloadCloud, 
  Layers, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles
} from "lucide-react";
import { performanceManager, NetworkPerformanceState, DEFAULT_DATA_SAVER_CONFIG } from "../lib/performanceManager";
import { DataSaverConfig, UserProfile } from "../types";

interface DataSaverSettingsCardProps {
  user?: UserProfile;
  onUpdateUser?: (updatedUser: Partial<UserProfile>) => void;
  compact?: boolean;
}

export const DataSaverSettingsCard: React.FC<DataSaverSettingsCardProps> = ({
  user,
  onUpdateUser,
  compact = false
}) => {
  const [netState, setNetState] = useState<NetworkPerformanceState>(performanceManager.getState());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = performanceManager.subscribe((state) => {
      setNetState(state);
    });
    return unsub;
  }, []);

  const handleToggleMaster = (enabled: boolean) => {
    performanceManager.setDataSaver(enabled);
    if (onUpdateUser) {
      onUpdateUser({
        dataSaverEnabled: enabled,
        dataSaverConfig: performanceManager.getState().dataSaver
      });
    }

    setSaveToast(enabled 
      ? "Data Saver စနစ်ကို အောင်မြင်စွာ ဖွင့်လိုက်ပါပြီ (Bandwidth ~60% သက်သာစေမည်)" 
      : "Data Saver စနစ်ကို ပိတ်လိုက်ပါပြီ (Standard High-Quality Mode)"
    );
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleUpdateSubConfig = (key: keyof DataSaverConfig, value: boolean) => {
    performanceManager.updateDataSaverConfig({ [key]: value });
    if (onUpdateUser) {
      onUpdateUser({
        dataSaverConfig: performanceManager.getState().dataSaver
      });
    }
  };

  const isEnabled = netState.dataSaver.enabled;
  const estimatedMb = (netState.estimatedBytesSaved / (1024 * 1024)).toFixed(1);

  return (
    <div className={`rounded-2xl transition-all ${
      compact 
        ? "p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800" 
        : "p-6 sm:p-7 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
    }`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
            isEnabled 
              ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
          }`}>
            {isEnabled ? <Zap className="w-5 h-5 fill-amber-400/20" /> : <ZapOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Data Saver (မိုဘိုင်းဒေတာ ချွေတာရေးစနစ်)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isEnabled
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
              }`}>
                {isEnabled ? "ON (ACTIVE)" : "OFF"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-burmese leading-relaxed">
              ဖုန်းဘေလ်/မိုဘိုင်းအင်တာနက် သုံးစွဲမှု သက်သာစေရန် ပုံရိပ်အရည်အသွေး၊ အင်နီမေးရှင်းနှင့် နောက်ကွယ်ဒေါင်းလုဒ်များကို လျှော့ချပေးပါသည်။
            </p>
          </div>
        </div>

        {/* Master OFF / ON Switch (Prominent User Control) */}
        <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleToggleMaster(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              !isEnabled
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            OFF
          </button>
          <button
            type="button"
            onClick={() => handleToggleMaster(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer ${
              isEnabled
                ? "bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/25"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>ON</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {saveToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* When Enabled - Features & Guarantee Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Core Behavior Pillars */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Data Saver ဖွင့်ထားချိန် စနစ်၏ လုပ်ဆောင်ချက်များ</span>
          </h4>
          
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start space-x-2.5">
              <ImageIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Reduce image quality:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ပုံအရွယ်အစားနှင့် အရည်အသွေးကို ချုံ့ယူပြီး data သုံးစွဲမှုကို ၇၀% အထိ လျှော့ချပေးပါသည်။</p>
              </div>
            </li>

            <li className="flex items-start space-x-2.5">
              <Film className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Reduce unnecessary animations:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">မလိုအပ်သော dynamic animations များကို ပိတ်၍ ဖုန်းအားနှင့် CPU ကို သက်သာစေပါသည်။</p>
              </div>
            </li>

            <li className="flex items-start space-x-2.5">
              <DownloadCloud className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Disable unnecessary preloading:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">မကြည့်ရသေးသော သင်ခန်းစာနှင့် ဖိုင်များကို ကြိုတင်ဒေါင်းလုဒ်ဆွဲခြင်း မပြုလုပ်ပါ။</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>Efficient Request & Refresh Management</span>
          </h4>
          
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start space-x-2.5">
              <Layers className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Load content on demand:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ကျောင်းသားကိုယ်တိုင် ဖွင့်လှစ်ကြည့်ရှုမှသာ အချက်အလက်များကို ဆွဲယူတင်ပြပါသည်။</p>
              </div>
            </li>

            <li className="flex items-start space-x-2.5">
              <Wifi className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Reduce background requests:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">နောက်ကွယ်မှ အဆက်မပြတ် polling နှင့် analytics ပို့ဆောင်မှုများကို အနည်းဆုံးသို့ လျှော့ချထားပါသည်။</p>
              </div>
            </li>

            <li className="flex items-start space-x-2.5">
              <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Avoid unnecessary refreshes:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cache ထဲမှ ဒေတာများကို ဦးစားပေးအသုံးပြုပြီး Tab အပြောင်းအလဲတိုင်း ပြန် refresh ဖြစ်ခြင်းမှ တားဆီးပါသည်။</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Learning Guarantee Note */}
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start space-x-3 text-xs text-blue-800 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Essential Learning Guarantee:</span> Data Saver ဖွင့်ထားသော်လည်း သင်တန်းစာအုပ်များ၊ မြန်မာဘာသာ ရှင်းလင်းချက်များ၊ Code Editor၊ Quiz စာမေးပွဲများနှင့် ဂုဏ်ထူးဆောင်လက်မှတ် ထုတ်ယူမှုများအားလုံးကို <span className="font-bold underline text-blue-600 dark:text-blue-300">၁၀၀% အပြည့်အဝ အသုံးပြုနိုင်ဆဲဖြစ်ပါသည်</span>။
        </div>
      </div>

      {/* Granular Customization Toggle (Advanced) */}
      {!compact && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <span>အသေးစိတ် စိတ်ကြိုက်ချိန်ညှိရန် (Granular Controls)</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 animate-fade-in">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Reduce Image Quality</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.reduceImageQuality}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("reduceImageQuality", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Reduce Unnecessary Animations</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.reduceAnimations}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("reduceAnimations", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Disable Unnecessary Preloading</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.disablePreloading}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("disablePreloading", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Load Content On Demand</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.loadContentOnDemand}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("loadContentOnDemand", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Reduce Background Requests</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.reduceBackgroundRequests}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("reduceBackgroundRequests", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Avoid Unnecessary Refreshes</span>
                <input
                  type="checkbox"
                  checked={netState.dataSaver.avoidUnnecessaryRefreshes}
                  disabled={!isEnabled}
                  onChange={(e) => handleUpdateSubConfig("avoidUnnecessaryRefreshes", e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DataSaverSettingsCard;
