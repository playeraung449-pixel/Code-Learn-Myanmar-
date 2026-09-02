/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft 
} from "lucide-react";
import { BLOG_POSTS } from "../courses/data";

export default function Blog() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const activePost = selectedPostId !== null ? BLOG_POSTS.find(p => p.id === selectedPostId) || null : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-10">
      
      {activePost === null ? (
        /* BLOG LIST VIEW */
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white transition-colors duration-200">
              နည်းပညာ ဗခုသုတနှင့် လမ်းညွှန်ဆောင်းပါးများ
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl transition-colors duration-200">
              နည်းပညာနယ်ပယ်မှာ အောင်မြင်ကျော်ကြားစေဖို့ လေ့လာထားသင့်တဲ့ အလေ့အကျင့်ကောင်းများ၊ AI ခေတ်ပြိုင် တိုးတက်မှုများနှင့် career လမ်းညွှန်ချက်များကို ဖတ်ရှုပါ။
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BLOG_POSTS.map((post) => (
              <div 
                key={post.id}
                className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedPostId(post.id)}
              >
                <div className="space-y-3">
                  <span className="inline-block text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold font-sans">
                    {post.category}
                  </span>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                    <span>{post.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-500" />
                    <span>{post.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SINGLE ARTICLE DETAIL VIEW */
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedPostId(null)}
            className="inline-flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ဆောင်းပါးများအားလုံးသို့ ပြန်သွားရန်</span>
          </button>

          <article className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 shadow-sm dark:shadow-md transition-colors duration-200">
            <span className="inline-block text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold font-sans">
              {activePost?.category || "General"}
            </span>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white leading-snug">
              {activePost?.title || ""}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 border-y border-slate-100 dark:border-slate-800 py-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                <span>ရေးသားသူ: {activePost?.author || ""}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                <span>ရက်စွဲ: {activePost?.date || ""}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span>ဖတ်ရှုချိန်: {activePost?.readTime || ""}</span>
              </span>
            </div>

            {/* Body text */}
            <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap space-y-4">
              {activePost?.content || ""}
            </div>
          </article>
        </div>
      )}

    </div>
  );
}
