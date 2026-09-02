/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Sparkles, Trophy, Star, Users, Lightbulb } from "lucide-react";

export default function About() {
  const values = [
    { title: "မြန်မာလို အစမှအဆုံး", desc: "ဘာသာစကားအခက်အခဲမရှိစေရန် အခြေခံမှစ၍ အဆင့်မြင့်နည်းပညာများကို ရိုးရှင်းသောမြန်မာစကားပြေဖြင့် သင်ကြားပေးသည်။", icon: BookOpen },
    { title: "လက်တွေ့ဦးစားပေး", desc: "စာတွေ့သက်သက်မဟုတ်ဘဲ အဆင့်ဆင့်သော Mini Projects များကို တိုက်ရိုက်ရေးသားပြီး Sandbox ဖြင့် ချက်ချင်းစစ်ဆေးနိုင်ရန် စီစဉ်ထားသည်။", icon: Lightbulb },
    { title: "AI-Powered Assistant", desc: "Gemini 3.5 AI နည်းပညာကို အသုံးပြုပြီး ကုဒ်အမှားများကို ချက်ချင်း အဖြေရှာပေးမည့် ကိုယ်ပိုင်အွန်လိုင်းကျူတာစနစ်။", icon: Sparkles },
    { title: "ဂုဏ်ထူးဆောင်လက်မှတ်", desc: "သင်တန်းတစ်ခုချင်းစီအောင်မြင်ပြီးဆုံးသည့်အခါ verify လုပ်နိုင်သော Developer Certificate များကို အခမဲ့ ထုတ်ယူနိုင်ခြင်း။", icon: Trophy }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-16">
      
      {/* Hero-like intro */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white transition-colors duration-200">
          ပရိုဂရမ်မင်းကို မြန်မာလို အစမှ Professional အထိ လေ့လာနိုင်မည့် Platform
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-200">
          <span className="text-blue-600 dark:text-blue-400 font-bold font-display">Code Learn Myanmar</span> ကို မြန်မာနိုင်ငံရှိ လူငယ်မောင်မယ်များ ဘာသာစကားအခက်အခဲ သို့မဟုတ် ကွန်ပြူတာအခြေခံမရှိမှုများကြောင့် နည်းပညာလေ့လာရန် လက်တွန့်မသွားစေရေး ရည်ရွယ်၍ အစအဆုံး အခမဲ့လေ့လာနိုင်သော platform အဖြစ် ရည်ရွယ်တည်ဆောက်ထားခြင်း ဖြစ်ပါသည်။
        </p>
      </section>

      {/* Core values bento grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white transition-colors duration-200">ကျွန်ုပ်တို့၏ အဓိက စံနှုန်းများ</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 transition-colors duration-200">ကျောင်းသားကျောင်းသူများအတွက် အကောင်းဆုံးသော သင်ယူမှုဝန်းကျင်ဖြစ်စေရန် ရည်စူးထားပါသည်။</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start space-x-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md transition-all duration-200"
              >
                <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base font-display transition-colors duration-200">{val.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-200">{val.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audience */}
      <section className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center transition-colors duration-200">
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white leading-tight transition-colors duration-200">
            အိုင်တီလောကသို့ ဝင်ရောက်ရန် <br />
            အဆင်သင့်ဖြစ်ပြီလား။
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-200">
            မည်သည့် ကွန်ပြူတာ နောက်ခံ သမိုင်းမှ မရှိသော်လည်း စနစ်တကျ သင်ခန်းစာများကို တစ်ဆင့်ပြီးတစ်ဆင့် လိုက်လံလုပ်ဆောင်ပြီး၊ ဉာဏ်စမ်းများ ဖြေဆိုကာ၊ Mini Projects များ တည်ဆောက်ခြင်းဖြင့် သင့်ရဲ့ ကျွမ်းကျင်မှု အဆင့်အတန်းကို တရိပ်ရိပ် တိုးတက်စေမည် ဖြစ်ပါသည်။
          </p>
          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
            <span className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">၅/၅ ရမှတ်</span>
            </span>
            <span>•</span>
            <span className="font-mono">၁၂,၄၀၀+ ကျောင်းသားများ၏ ယုံကြည်မှု</span>
          </div>
        </div>

        <div className="bg-slate-950 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 text-slate-300 dark:text-slate-300 text-xs font-mono transition-colors duration-200">
          <p className="text-blue-500"># Myanmar Youth Tech Mission 🇲🇲</p>
          <p>&gt; platform_purpose = "Empower young minds"</p>
          <p>&gt; cost = "Free of charge (100% Free)"</p>
          <p>&gt; accessible_level = "Zero Knowledge to Professional"</p>
          <p>&gt; certificates_issued = "Verification IDs enabled"</p>
          <p className="text-emerald-400">&gt; Status: Active & Inspiring Future Tech Leaders!</p>
        </div>
      </section>

    </div>
  );
}
