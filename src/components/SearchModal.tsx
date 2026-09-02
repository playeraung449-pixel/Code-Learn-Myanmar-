/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen, Code, FileText, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { COURSES, PROJECTS_DATA, BLOG_POSTS } from "../courses/data";
import { Course } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentTab: (tab: string) => void;
  onStartCourse: (course: Course, lessonIdx: number) => void;
  courses?: Course[];
}

export default function SearchModal({
  isOpen,
  onClose,
  setCurrentTab,
  onStartCourse,
  courses
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const popularTags = ["Python", "Variables", "HTML", "CSS", "Loop", "AI", "GitHub"];

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const results: { 
      id: string; 
      title: string; 
      category: string; 
      type: "course" | "lesson" | "project" | "article"; 
      desc: string;
      action: () => void;
    }[] = [];

    // Search courses
    const activeCourses = courses || COURSES;
    activeCourses.forEach((course) => {
      if (course.title.toLowerCase().includes(trimmed) || course.description.toLowerCase().includes(trimmed)) {
        results.push({
          id: course.id,
          title: course.title,
          category: course.category.toUpperCase(),
          type: "course",
          desc: course.description,
          action: () => {
            setCurrentTab("courses");
            onClose();
          }
        });
      }

      // Search lessons within courses
      course.lessons.forEach((lesson, lessonIdx) => {
        if (lesson.title.toLowerCase().includes(trimmed) || lesson.whatIsIt.toLowerCase().includes(trimmed)) {
          results.push({
            id: lesson.id,
            title: `${course.title} > ${lesson.title}`,
            category: "LESSON",
            type: "lesson",
            desc: lesson.whatIsIt,
            action: () => {
              onStartCourse(course, lessonIdx);
              onClose();
            }
          });
        }
      });
    });

    // Search projects
    PROJECTS_DATA.forEach((proj) => {
      if (proj.title.toLowerCase().includes(trimmed) || proj.description.toLowerCase().includes(trimmed)) {
        results.push({
          id: proj.id,
          title: proj.title,
          category: proj.category.toUpperCase(),
          type: "project",
          desc: proj.description,
          action: () => {
            setCurrentTab("projects");
            onClose();
          }
        });
      }
    });

    // Search blog posts
    BLOG_POSTS.forEach((post) => {
      if (post.title.toLowerCase().includes(trimmed) || post.summary.toLowerCase().includes(trimmed)) {
        results.push({
          id: post.id,
          title: post.title,
          category: post.category.toUpperCase(),
          type: "article",
          desc: post.summary,
          action: () => {
            setCurrentTab("blog");
            onClose();
          }
        });
      }
    });

    return results;
  };

  const results = handleSearch();

  const getIcon = (type: "course" | "lesson" | "project" | "article") => {
    switch (type) {
      case "course": return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "lesson": return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "project": return <Code className="w-4 h-4 text-purple-500" />;
      case "article": return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-10 text-left">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-8 sm:mt-16 animate-fade-in animate-duration-200">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-850 gap-3">
          <Search className="w-5.5 h-5.5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="သင်ခန်းစာများ၊ ပရောဂျက်များနှင့် ဆောင်းပါးများကို ရှာဖွေပါ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500">
            ESC
          </kbd>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Workspace Body */}
        <div className="p-4 max-h-[420px] overflow-y-auto space-y-5 scrollbar-thin">
          {query.trim() === "" ? (
            /* Popular Tags & Suggestions */
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  လူကြိုက်များသော ရှာဖွေမှုများ (Popular Search)
                </h4>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-750 transition-all cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                <p className="font-semibold">💡 ရှာဖွေနည်းလမ်းညွှန် -</p>
                <p className="mt-1">
                  သင်ယူလိုသည့် ခေါင်းစဉ် (ဥပမာ - Python, HTML) ကို ရိုက်ထည့်ပြီး မြန်မာလိုလေ့လာနိုင်မည့် မော်ဂျူးများကို အလွယ်တကူ ရှာဖွေနှိပ်ယူနိုင်ပါသည်ဗျာ။
                </p>
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Live Results List */
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                ရှာဖွေတွေ့ရှိမှုများ ({results.length} results)
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {results.map((res) => (
                  <div
                    key={res.id}
                    onClick={res.action}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-500/20 dark:border-slate-800/60 dark:hover:border-blue-500/30 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-blue-50/10 dark:hover:bg-blue-500/5 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
                      {getIcon(res.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-extrabold bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">
                          {res.category}
                        </span>
                        <span className="text-[9px] font-mono font-extrabold text-slate-400 capitalize">
                          {res.type}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-blue-500 transition-colors">
                        {res.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate max-w-[500px]">
                        {res.desc}
                      </p>
                    </div>

                    <div className="text-slate-400 group-hover:text-blue-500 self-center opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                      <span className="text-[10px] font-mono font-semibold">Jump</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-10 space-y-2">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-650 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                ရှာဖွေမှုမတွေ့ရှိပါဗျာ (No Results Found)
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                ရိုက်ထည့်ထားသော စာလုံးပေါင်းမှန်ကန်မှုကို စစ်ဆေးပြီး အခြားအသုံးအနှုန်းဖြင့် ထပ်မံရှာဖွေပေးပါရန်။
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
