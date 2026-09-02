/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, ShieldCheck, Heart, MessageSquare, Target, BellOff, CopyX, Link2Off, Lock, Sparkles, CheckCircle2 } from "lucide-react";

interface CommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunityRulesModal({ isOpen, onClose }: CommunityRulesModalProps) {
  if (!isOpen) return null;

  const rules = [
    {
      id: "rule-1",
      title: "1. အခြားသူများအား လေးစားပါ (Respect Others)",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      desc: "ဆွေးနွေးချက်များနှင့် မေးခွန်းများတွင် အချင်းချင်း အပြန်အလှန် လေးစားပါ။ အနိုင်ကျင့်စော်ကားခြင်း (Harassment) သို့မဟုတ် အမုန်းစကားများ (Hate Speech) သုံးစွဲခြင်းကို လုံးဝ ခွင့်မပြုပါ။"
    },
    {
      id: "rule-2",
      title: "2. ယဉ်ကျေးသော စကားလုံး သုံးစွဲပါ (Use Appropriate Language)",
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      desc: "ရိုင်းစိုင်းသော စကားလုံးများ၊ ဆဲဆိုသရstageခြင်းများနှင့် မသင့်လျော်သော အသုံးအနှုန်းများ မပါဝင်ပါစေနှင့်။ စနစ်မှ အလိုအလျောက် ရိုင်းစိုင်းစကားလုံးများအား Flag ပြုလုပ်စစ်ဆေးပါသည်။"
    },
    {
      id: "rule-3",
      title: "3. ဆွေးနွေးချက်နှင့် ဆီလျော်အောင် ရေးပါ (Stay On Topic)",
      icon: <Target className="w-5 h-5 text-emerald-500" />,
      desc: "မေးခွန်း သို့မဟုတ် သင်တန်းခေါင်းစဉ်နှင့် ကိုင်ညီသော ပရိုဂရမ်မင်းနှင့် အိုင်တီဆိုင်ရာ အကြောင်းအရာများကိုသာ ဆွေးနွေးပါ။"
    },
    {
      id: "rule-4",
      title: "4. Spam ကြော်ငြာများ ရှောင်ကြဉ်ပါ (Avoid Spam)",
      icon: <BellOff className="w-5 h-5 text-amber-500" />,
      desc: "ထပ်ခါထပ်ခါ ရေးသားခြင်း၊ စီးပွားရေး ကြော်ငြာများ တင်ခြင်း သို့မဟုတ် မသက်ဆိုင်သော စာသားများ အမြောက်အမြား ပို့ခြင်းများ ပြုလုပ်ပါက Posting Privileges ပိတ်သိမ်းခံရမည်။"
    },
    {
      id: "rule-5",
      title: "5. မူပိုင်ခွင့် လိုက်နာပါ (Avoid Plagiarism)",
      icon: <CopyX className="w-5 h-5 text-purple-500" />,
      desc: "အခြားသူ၏ ကုဒ် သို့မဟုတ် စာသားများကို ကူးယူဖော်ပြခြင်း မပြုဘဲ မိမိကိုယ်ပိုင် ကြိုးစားအားထုတ်မှုဖြင့် ရေးသားပါ။ လိုအပ်ပါက မူရင်းရင်းမြစ်အား ကိုးကားပါ (Credit Original Authors)."
    },
    {
      id: "rule-6",
      title: "6. အန္တရာယ်ရှိသော လင့်ခ်များ မဝေမျှပါနှင့် (Avoid Malicious Content)",
      icon: <Link2Off className="w-5 h-5 text-indigo-500" />,
      desc: "မသင်္ကာဖွယ်ရာ လင့်ခ်များ၊ ဗိုင်းရပ်စ် သို့မဟုတ် အန္တရာယ်ရှိသော ဖိုင်များ ဝေမျှခြင်းကို တင်းကြပ်စွာ တားမြစ်ထားပါသည်။"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 text-left">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                ကွန်မြူနတီ စည်းကမ်းချက်များ (Community Guidelines)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ဘေးကင်းလုံခြုံပြီး ပညာရပ်ဆိုင်ရာ သင်ကြားရေး ပတ်ဝန်းကျင် ထိန်းသိမ်းရန်
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Rules Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center space-x-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              Code Learn Myanmar သည် ကျောင်းသားတိုင်း လွတ်လပ်စွာ လေ့လာသင်ယူနိုင်သော ဘေးကင်းလုံခြုံသည့် ပလက်ဖောင်းဖြစ်ပါသည်။ စည်းကမ်းချက်များကို လိုက်နာပါရန် အထူး မေတ္တာရပ်ခံပါသည်။
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  {rule.icon}
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rule.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>တိုင်ကြားသူများ၏ အမည်နှင့် အချက်အလက်ကို ၁၀၀% လျှို့ဝှက်ထိန်းသိမ်းပါသည်</span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
          >
            နားလည်ပါပြီ (I Understand)
          </button>
        </div>

      </div>
    </div>
  );
}
