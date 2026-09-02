/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trophy, 
  BookOpen, 
  Code, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Bookmark, 
  Award, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Laptop,
  Play,
  Search,
  Bell,
  Activity,
  Heart,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bug,
  Briefcase
} from "lucide-react";
import { UserProfile, Course } from "../types";
import { COURSES } from "../courses/data";

import { checkIsAdmin } from "../lib/db";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  firebaseUser: any;
  onSignOut: () => void;
  onOpenAuth: () => void;
  onStartCourse: (course: Course, lessonIdx: number) => void;
  theme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onOpenSearch: () => void;
  onOpenNotif: () => void;
  courses?: Course[];
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  user,
  firebaseUser,
  onSignOut,
  onOpenAuth,
  onStartCourse,
  theme,
  onThemeChange,
  onOpenSearch,
  onOpenNotif,
  courses
}: SidebarProps) {

  // Calculate current course progress to enable the Continue Learning shortcut
  const getContinueLearningData = () => {
    const completedSet = new Set(user.completedLessons || []);
    const activeCourses = courses || COURSES;
    for (const course of activeCourses) {
      for (let idx = 0; idx < course.lessons.length; idx++) {
        const lesson = course.lessons[idx];
        if (!completedSet.has(lesson.id)) {
          return { course, lesson, idx };
        }
      }
    }
    // Fallback if everything is completed or none started
    return { course: activeCourses[0], lesson: activeCourses[0].lessons[0], idx: 0 };
  };

  const continueData = getContinueLearningData();

  const handleResumeLearning = () => {
    onStartCourse(continueData.course, continueData.idx);
  };

  const isAdmin = checkIsAdmin(user, firebaseUser);

  const coreNavItems = [
    { id: "home", label: "ပင်မစာမျက်နှာ (Home)", icon: Trophy },
    { id: "courses", label: "သင်တန်းများ (Courses)", icon: BookOpen },
    { id: "lessons", label: "သင်ခန်းစာများ (Lessons)", icon: FileText, onClick: handleResumeLearning },
    { id: "projects", label: "လက်တွေ့လေ့ကျင့်ခန်း (Practice)", icon: Code },
    { id: "ai-assistant", label: "Kibo AI လက်ထောက်", icon: Sparkles },
    { id: "community", label: "ကွန်မြူနတီ (Community)", icon: MessageSquare },
    { id: "profile", label: "ကိုယ်ရေးအကျဉ်း (Profile)", icon: Award },
    { id: "premium", label: "👑 Kibo Premium ရယူရန်", icon: Sparkles, isPremium: true },
  ];

  const exploreNavItems = [
    { id: "roadmaps", label: "လမ်းညွှန်မြေပုံများ (Roadmaps)", icon: Activity },
    { id: "portfolio", label: "Portfolios Showcase", icon: Briefcase },
    { id: "code-review", label: "AI Code Reviewer", icon: Code },
    { id: "debug-assistant", label: "AI Debug Assistant", icon: Bug },
    { id: "blog", label: "ဗဟုသုတဆောင်းပါး (Blog)", icon: FileText },
    { id: "verify-cert", label: "လက်မှတ် စစ်ဆေးရန် (Verify)", icon: ShieldCheck },
    ...(isAdmin ? [{ id: "admin", label: "🛡️ Admin Control Panel", icon: ShieldCheck }] : []),
  ];

  const personalItems = [
    { id: "my-portfolio", label: "ကျောင်းသား Portfolio", icon: Briefcase, tab: "profile", profileSubTab: "portfolio" },
    { id: "bookmarks", label: "မှတ်သားထားသော သင်ခန်းစာ", icon: Bookmark, tab: "profile", profileSubTab: "bookmarks" },
    { id: "certificates", label: "ဘွဲ့ရလက်မှတ်များ", icon: Award, tab: "profile", profileSubTab: "certificates" },
    { id: "achievements", label: "အောင်မြင်မှုတံဆိပ်များ", icon: Trophy, tab: "profile", profileSubTab: "dashboard" },
    { id: "settings", label: "အကောင့်လုံခြုံရေး", icon: Settings, tab: "profile", profileSubTab: "settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 left-0 z-30 transition-colors duration-200 text-left">
      {/* Platform Branding */}
      <div 
        onClick={() => setCurrentTab("home")}
        className="p-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer flex items-center space-x-3 group"
      >
        <img 
          src="https://i.ibb.co/tMS4fMck/file-00000000c5c872438eb118e0d2d35195.png" 
          alt="Code Learn Myanmar Logo" 
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all"
        />
        <div>
          <h2 className="font-display font-black text-sm text-slate-900 dark:text-white leading-tight tracking-tight">
            Code Learn <span className="text-blue-500">Myanmar</span>
          </h2>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none mt-0.5">မြန်မာလို ပရိုဂရမ်မင်းသင်ယူစို့</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        
        {/* Primary Main Navigation (8 Core Pillars) */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>ပင်မမီနူး (Main Navigation)</span>
            <span className="text-[9px] font-mono text-blue-500 font-bold">CORE</span>
          </p>
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isPremiumTab = item.isPremium;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setCurrentTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? isPremiumTab
                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/25"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : isPremiumTab
                      ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-dashed border-amber-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isPremiumTab && !isActive ? "text-amber-500" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Exploration & Tools Section */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            နောက်ထပ်ကိရိယာများ (Extra Tools)
          </p>
          {exploreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Personal Section */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            ကျောင်းသားဒေတာ (Personal Data)
          </p>
          {personalItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab; // Note: simple check
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.tab);
                  // Since we are moving to profile tab, we want to propagate the subtab choice
                  setTimeout(() => {
                    const event = new CustomEvent("changeProfileSubTab", { detail: item.profileSubTab });
                    window.dispatchEvent(event);
                  }, 50);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/60"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onSignOut}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:text-white hover:bg-red-500/90 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer mt-2"
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            <span>အကောင့်မှထွက်ရန် (Log Out)</span>
          </button>
        </div>

        {/* Dynamic Resume Learning Sidebar Card */}
        {continueData && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-tr from-[#1E293B] to-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
              {continueData.course.title}
            </span>
            <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
              {continueData.lesson.title}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 mb-3">
              နောက်ဆုံးသင်ခန်းစာအား ပြန်လည်ဆက်လက်သင်ယူပါ။
            </p>
            <button
              onClick={handleResumeLearning}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-[11px] font-bold text-white flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/10"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>ဆက်လက်သင်ယူပါ (Resume)</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer Settings and Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10">
        
        {/* Quick Utility bar (Theme, Search, Notifications) */}
        <div className="flex items-center justify-between gap-1.5 px-2">
          <ThemeToggle variant="compact" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              title="ကမ္ဘာလုံးဆိုင်ရာ ရှာဖွေခြင်း"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNotif}
              title="အသိပေးချက်များ"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750">
          <div 
            onClick={() => setCurrentTab("profile")}
            className="flex items-center space-x-2.5 cursor-pointer min-w-0"
          >
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            <div className="min-w-0 text-left font-mono">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate max-w-[110px] leading-tight">
                {user?.name || "Student"}
              </p>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 rounded font-bold">
                LVL {user?.level || 1}
              </span>
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Logout"
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
