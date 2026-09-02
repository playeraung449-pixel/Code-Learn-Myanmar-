/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Facebook, Youtube, Send, Mail, ShieldAlert } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  return (
    <footer className="bg-slate-100 dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-lg">
                C
              </div>
              <span className="font-display font-bold text-slate-900 dark:text-white text-base">
                Code Learn <span className="text-blue-600 dark:text-blue-500">Myanmar</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Programming ကို စိတ်မပျက်ဘဲ မြန်မာလို အစမှအဆုံး Professional တစ်ယောက်အဖြစ် တည်ဆောက်နိုင်မည့် နံပါတ်တစ် ပညာရေးပလက်ဖောင်း ဖြစ်ပါသည်။
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="mailto:info@codelearnmyanmar.com" className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white transition-all text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-4">
              လျင်မြန်စွာသွားရန်
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab("home")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  ပင်မစာမျက်နှာ (Home)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("courses")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  သင်တန်းများ (Courses)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("projects")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  လက်တွေ့ ပရောဂျက်များ (Projects)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("ai-assistant")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  AI လက်ထောက်နှင့် ဆွေးနွေးရန်
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-4">
              အခြားကဏ္ဍများ
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab("blog")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  ဗခုသုတ ဆောင်းပါးများ
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("community")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  ကွန်မြူနတီ ဖိုရမ်
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("about")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer">
                  ကျွန်ုပ်တို့အကြောင်း (About Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Policies */}
          <div>
            <h3 className="font-display font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-4">
              မူဝါဒနှင့် စည်းမျဉ်းများ
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-all">Privacy Policy (ကိုယ်ရေးအချက်အလက် မူဝါဒ)</a>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-all">Terms of Service (စည်းကမ်းချက်များ)</a>
              </li>
              <li className="text-slate-500 dark:text-slate-500 text-[11px] pt-2">
                ဖန်တီးသူများအားလုံး၏ အခွင့်အရေးကို ဉာဏပစ္စည်းမူပိုင်ခွင့်အတိုင်း အပြည့်အဝ ကာကွယ်ထားပါသည်။
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-850 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Code Learn Myanmar. All Rights Reserved.
          </p>
          <p className="text-slate-600 dark:text-slate-500 mt-2 sm:mt-0 font-mono">
            Crafted for Future Myanmar Developers 🇲🇲
          </p>
        </div>
      </div>
    </footer>
  );
}
