/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  BookOpen, 
  Code, 
  Sparkles, 
  Trophy, 
  Users, 
  Terminal, 
  ChevronRight, 
  Layers, 
  ArrowUpRight, 
  Flame, 
  Award, 
  Zap, 
  Play, 
  CheckCircle2, 
  Star, 
  Clock, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  Bookmark, 
  Cpu, 
  Palette, 
  Compass, 
  Calendar,
  BarChart2,
  CheckCircle
} from "lucide-react";
import { Course, Lesson, UserProfile, getLevelData } from "../types";

interface HomeProps {
  setCurrentTab: (tab: string) => void;
  setSelectedCourse: (course: Course, lessonIndex?: number) => void;
  courses: Course[];
  user?: UserProfile | any;
  onOpenCheckIn?: () => void;
}

export default function Home({ 
  setCurrentTab, 
  setSelectedCourse, 
  courses, 
  user,
  onOpenCheckIn 
}: HomeProps) {
  // 1. Time-aware greeting in Myanmar & English
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { mm: "မင်္ဂလာနံနက်ခင်းပါ", en: "Good Morning", icon: "🌅" };
    } else if (hour < 17) {
      return { mm: "မင်္ဂလာနေ့လယ်ခင်းပါ", en: "Good Afternoon", icon: "☀️" };
    } else {
      return { mm: "မင်္ဂလာညနေခင်းပါ", en: "Good Evening", icon: "🌙" };
    }
  }, []);

  // 2. Determine Current Course & Recent Lesson
  const completedLessonsSet = useMemo(() => {
    return new Set<string>(user?.completedLessons || []);
  }, [user?.completedLessons]);

  // Find the active/current course
  const currentCourse = useMemo<Course>(() => {
    if (!courses || courses.length === 0) return {} as Course;
    
    // Check if user has a designated current course
    if (user?.currentCourseId) {
      const found = courses.find(c => c.id === user.currentCourseId);
      if (found) return found;
    }

    // Otherwise find the first course with in-progress lessons
    for (const course of courses) {
      const hasCompleted = course.lessons.some(l => completedLessonsSet.has(l.id));
      const hasUncompleted = course.lessons.some(l => !completedLessonsSet.has(l.id));
      if (hasCompleted && hasUncompleted) {
        return course;
      }
    }

    return courses[0] || {} as Course;
  }, [courses, user?.currentCourseId, completedLessonsSet]);

  // Find the exact Recent Lesson (first uncompleted lesson or the last completed lesson)
  const { recentLesson, recentLessonIndex, nextLesson } = useMemo(() => {
    if (!currentCourse?.lessons || currentCourse.lessons.length === 0) {
      return { recentLesson: null, recentLessonIndex: 0, nextLesson: null };
    }

    // Find first lesson not yet completed
    let idx = currentCourse.lessons.findIndex(l => !completedLessonsSet.has(l.id));
    if (idx === -1) {
      // All completed, default to last lesson or first
      idx = 0;
    }

    const current = currentCourse.lessons[idx] || currentCourse.lessons[0];
    const next = idx + 1 < currentCourse.lessons.length ? currentCourse.lessons[idx + 1] : null;

    return {
      recentLesson: current,
      recentLessonIndex: idx,
      nextLesson: next
    };
  }, [currentCourse, completedLessonsSet]);

  // 3. Progress calculations
  const courseCompletedCount = useMemo(() => {
    if (!currentCourse?.lessons) return 0;
    return currentCourse.lessons.filter(l => completedLessonsSet.has(l.id)).length;
  }, [currentCourse, completedLessonsSet]);

  const courseTotalLessons = currentCourse?.lessons?.length || 1;
  const courseProgressPercent = Math.min(
    100, 
    Math.round((courseCompletedCount / courseTotalLessons) * 100)
  );

  // Overall platform completion stats
  const totalPlatformLessons = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  }, [courses]);
  
  const totalCompletedLessons = user?.completedLessons?.length || 0;

  // 4. Gamification stats (XP, Level, Streak)
  const userXp = user?.xp || 0;
  const levelInfo = useMemo(() => getLevelData(userXp), [userXp]);
  const userStreak = user?.learningStreak || user?.streak || 0;
  const isPremiumUser = user?.role === "premium" || user?.role === "admin" || user?.isPremium === true || user?.membershipStatus === "premium";

  // 5. In-Progress courses list for multi-course learning
  const inProgressCourses = useMemo(() => {
    return courses.filter(c => {
      const completedCount = c.lessons.filter(l => completedLessonsSet.has(l.id)).length;
      return completedCount > 0 && completedCount < c.lessons.length;
    });
  }, [courses, completedLessonsSet]);

  // 6. Direct action to launch the lesson
  const handleContinueLearning = () => {
    if (currentCourse && recentLesson) {
      setSelectedCourse(currentCourse, recentLessonIndex);
    } else if (courses.length > 0) {
      setSelectedCourse(courses[0], 0);
    }
  };

  const handleStartCourseDirect = (course: Course, lessonIdx: number = 0) => {
    setSelectedCourse(course, lessonIdx);
  };

  // Categories metadata
  const categories = [
    { name: "Programming Basics", label: "အခြေခံပရိုဂရမ်မင်း", count: "2 Courses", id: "basics", icon: Terminal },
    { name: "Web Development", label: "ဝက်ဘ်ဆိုက်ရေးဆွဲခြင်း", count: "3 Courses", id: "web", icon: Layers },
    { name: "Android Development", label: "မိုဘိုင်းအက်ပ်ရေးဆွဲခြင်း", count: "1 Course", id: "android", icon: Cpu },
    { name: "Backend Development", label: "ဆာဗာပိုင်းဒီဇိုင်းဆွဲခြင်း", count: "2 Courses", id: "backend", icon: Code },
    { name: "Database & SQL", label: "ဒေတာဘေ့စ်စီမံခန့်ခွဲမှု", count: "1 Course", id: "database", icon: Bookmark },
    { name: "Git & GitHub", label: "ကုဒ်ထိန်းသိမ်းမှုစနစ်", count: "1 Course", id: "git", icon: Zap },
  ];

  return (
    <div className="space-y-8 pb-16 text-left animate-fade-in animate-duration-300">
      
      {/* ========================================================= */}
      {/* 1. WELCOME BANNER & STUDENT OVERVIEW HEADER */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] border border-blue-500/20 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        {/* Subtle background ambient circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Personalized Greeting & Identity */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-white">
                <span>{greeting.icon}</span>
                <span>{greeting.mm}</span>
              </span>

              {isPremiumUser ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>👑 KIBO VIP MEMBER</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/30 dark:bg-slate-800/80 text-blue-100 dark:text-slate-300 border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Standard Learner</span>
                </span>
              )}

              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/90">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Level {levelInfo.level}: {levelInfo.name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-white">
              {user?.name ? `${user.name}` : "မင်္ဂလာပါ ကျောင်းသား"} 👋
            </h1>

            <p className="text-sm sm:text-base text-blue-100 dark:text-slate-300 leading-relaxed font-sans">
              ယနေ့တွင် သင်၏ Programming ပညာရပ်များကို ဆက်လက်လေ့လာသင်ယူပြီး အောင်မြင်မှုမှတ်တိုင်များကို ရယူလိုက်ပါ။
            </p>
          </div>

          {/* Right: Quick Action Hero Button to Resume Lesson in 1-Click */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <button
              onClick={handleContinueLearning}
              className="w-full py-3.5 px-6 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 font-display font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
              id="btn-home-continue-learning-hero"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continue Learning (ဆက်လက်လေ့လာမည်)</span>
            </button>

            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm text-xs text-white/90 border border-white/10">
              <span className="text-[11px] truncate max-w-[170px] text-blue-100 dark:text-slate-300">
                {recentLesson ? recentLesson.title : "Lesson 1: အစပျိုးခြင်း"}
              </span>
              <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                {courseProgressPercent}% Done
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. QUICK ACTIONS TOOLBAR (SHORTCUTS) */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>အမြန်သွားရောက်ရန် (Quick Actions)</span>
          </h2>
          <span className="text-[11px] text-slate-400">1-Click Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Quick Action 1: Continue Learning */}
          <button
            onClick={handleContinueLearning}
            className="clm-card p-3.5 hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-start space-y-2 text-left group cursor-pointer"
            id="quick-action-continue"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Continue Learning
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                ဆက်လက်သင်ယူမည်
              </span>
            </div>
          </button>

          {/* Quick Action 2: Browse Courses */}
          <button
            onClick={() => setCurrentTab("courses")}
            className="clm-card p-3.5 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-start space-y-2 text-left group cursor-pointer"
            id="quick-action-courses"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Browse Courses
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                သင်တန်းများ ရှာဖွေမည်
              </span>
            </div>
          </button>

          {/* Quick Action 3: Practice Sandbox */}
          <button
            onClick={() => setCurrentTab("projects")}
            className="clm-card p-3.5 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex flex-col items-start space-y-2 text-left group cursor-pointer"
            id="quick-action-practice"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Practice (လေ့ကျင့်ရန်)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                ကုဒ်စမ်းသပ် ရေးသားမည်
              </span>
            </div>
          </button>

          {/* Quick Action 4: Ask Kibo AI */}
          <button
            onClick={() => setCurrentTab("ai-assistant")}
            className="clm-card p-3.5 hover:border-purple-500/40 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all flex flex-col items-start space-y-2 text-left group cursor-pointer"
            id="quick-action-ask-kibo"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Ask Kibo (AI)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                သိလိုသည်များ မေးမြန်းမည်
              </span>
            </div>
          </button>

          {/* Quick Action 5: View Progress */}
          <button
            onClick={() => setCurrentTab("progress")}
            className="clm-card p-3.5 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all flex flex-col items-start space-y-2 text-left group cursor-pointer col-span-2 sm:col-span-1"
            id="quick-action-progress"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400">
                View Progress
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                တက်လှမ်းမှု မှတ်တမ်း
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CURRENT COURSE & RECENT LESSON SPOTLIGHT */}
      {/* ========================================================= */}
      {currentCourse && currentCourse.title && (
        <section className="clm-card p-6 sm:p-7 space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  လက်ရှိလေ့လာနေသော သင်တန်း (Current Course)
                </span>
                <span className="clm-badge-neutral text-[10px]">
                  {currentCourse.category ? currentCourse.category.toUpperCase() : "PROGRAMMING"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                {currentCourse.title}
              </h2>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{courseCompletedCount} / {courseTotalLessons} Lessons</span>
              </span>
              <span>•</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {courseProgressPercent}% Completed
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans text-slate-600 dark:text-slate-400">
              <span>သင်တန်းပြီးစီးမှု အခြေအနေ (Course Completion)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{courseProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${courseProgressPercent}%` }} 
              />
            </div>
          </div>

          {/* Recent Lesson Highlight Card */}
          <div className="bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold">
                  Recent Lesson #{recentLessonIndex + 1}
                </span>
                {recentLesson?.duration && (
                  <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{recentLesson.duration}</span>
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {recentLesson ? recentLesson.title : "Lesson 1: စတင်မိတ်ဆက်ခြင်း"}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans line-clamp-2 leading-relaxed">
                {recentLesson?.whatIsIt || recentLesson?.whyImportant || "ဒီသင်ခန်းစာတွင် အဓိက သဘောတရားများ၊ ကုဒ်ဥပမာများနှင့် လက်တွေ့လေ့ကျင့်ခန်းများကို အသေးစိတ် လေ့လာသင်ယူရမည်ဖြစ်ပါသည်။"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:items-center lg:items-end min-w-[200px]">
              <button
                onClick={handleContinueLearning}
                className="w-full sm:w-auto lg:w-full clm-btn-primary py-2.5 px-5 text-xs gap-2 justify-center cursor-pointer shadow-md"
                id="btn-resume-recent-lesson"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>သင်ခန်းစာ ချက်ချင်းလေ့လာမည်</span>
              </button>

              {nextLesson && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans text-center truncate max-w-[220px]">
                  Next: {nextLesson.title}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 4. GAMIFICATION METRICS & STUDENT STATUS GRID */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: XP & Rank Progress */}
        <div className="clm-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="clm-badge-neutral font-mono text-[10px]">
              XP POINTS
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                {userXp.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-amber-500">XP</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              စုစုပေါင်း စာသင်အတွေ့အကြုံမှတ်
            </p>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Next Level Goal</span>
              <span>{levelInfo.progressXp}/{levelInfo.rangeXp} XP</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${levelInfo.progressPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Level Status */}
        <div className="clm-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <span className="clm-badge-neutral font-mono text-[10px]">
              LEVEL
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                Level {levelInfo.level}
              </span>
            </div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 font-sans truncate">
              {levelInfo.name}
            </p>
          </div>

          <button
            onClick={() => setCurrentTab("progress")}
            className="w-full py-1.5 rounded-lg text-center text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all cursor-pointer"
          >
            အဆင့်သတ်မှတ်ချက်များ ကြည့်ရန် →
          </button>
        </div>

        {/* Metric 3: Learning Streak */}
        <div className="clm-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="clm-badge-neutral font-mono text-[10px]">
              STREAK
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                {userStreak}
              </span>
              <span className="text-xs font-bold text-rose-500 font-sans">ရက်ဆက်တိုက် (Days)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              {userStreak > 0 ? "လေ့လာမှုအရှိန်ကို ဆက်ထိန်းထားပါ 🔥" : "ယနေ့စတင်လေ့လာပါ"}
            </p>
          </div>

          <button
            onClick={() => onOpenCheckIn ? onOpenCheckIn() : setCurrentTab("progress")}
            className="w-full py-1.5 rounded-lg text-center text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer flex items-center justify-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>နေ့စဉ် Check-in ရယူမည်</span>
          </button>
        </div>

        {/* Metric 4: Achievements & Badges */}
        <div className="clm-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="clm-badge-neutral font-mono text-[10px]">
              ACHIEVEMENTS
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                {user?.achievements?.length || 0}
              </span>
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400">တံဆိပ်များ (Badges)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              ပြီးမြောက်ထားသော အောင်မြင်မှုများ
            </p>
          </div>

          <button
            onClick={() => setCurrentTab("progress")}
            className="w-full py-1.5 rounded-lg text-center text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer"
          >
            တံဆိပ်အားလုံး ကြည့်မည် →
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. ACHIEVEMENTS & PREMIUM STATUS DUAL ROW */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Achievements Showcase (7 cols) */}
        <div className="lg:col-span-7 clm-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>အောင်မြင်မှု တံဆိပ်များ (Recent Badges)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                လေ့လာမှုမှတ်တိုင်များ ရောက်ရှိပါက ရရှိမည့် တံဆိပ်များ
              </p>
            </div>

            <button
              onClick={() => setCurrentTab("progress")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              အားလုံးကြည့်ရန် ({user?.achievements?.length || 0})
            </button>
          </div>

          {user?.achievements && user.achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.achievements.slice(0, 4).map((ach: any) => (
                <div 
                  key={ach.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800 flex items-start space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ach.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                သင်ခန်းစာများနှင့် Quiz များကို ဖြေဆိုပြီး ပထမဆုံး အောင်မြင်မှုတံဆိပ်များကို ရယူလိုက်ပါ။
              </p>
              <button
                onClick={handleContinueLearning}
                className="clm-btn-secondary text-xs py-1.5 px-4"
              >
                သင်ခန်းစာ စတင်ဖြေဆိုမည်
              </button>
            </div>
          )}
        </div>

        {/* Right: Premium VIP Status Card (5 cols) */}
        <div className="lg:col-span-5 clm-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Crown className="w-4 h-4 fill-current" />
                <span>PREMIUM STATUS</span>
              </span>

              {isPremiumUser ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                  ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono font-bold">
                  FREE PLAN
                </span>
              )}
            </div>

            {isPremiumUser ? (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  👑 Kibo VIP Member ဖြစ်ပါသည်
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  Telegram VIP Video Hub၊ 1-on-1 AI Mentoring၊ Verified Certificates နှင့် အထူးအခွင့်အရေးများ အားလုံးကို အပြည့်အဝ အသုံးပြုနိုင်ပါသည်။
                </p>
                <div className="space-y-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Telegram Video Channels Unlocked</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Unlimited Kibo AI Code Reviews</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Kibo Premium သို့ အဆင့်မြှင့်ပါ
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  VIP သင်ရိုးဗီဒီယိုများ၊ Telegram Private Channel Access၊ တရားဝင်သင်တန်းဆင်းလက်မှတ်များကို ရယူရန် Kibo VIP သို့ အဆင့်မြှင့်လိုက်ပါ။
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>✨ 1-Time VIP Access</span>
                  <span>•</span>
                  <span>📜 QR Verified Certs</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isPremiumUser ? (
              <button
                onClick={() => setCurrentTab("premium")}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>👑 VIP အကျိုးခံစားခွင့်များ စစ်ဆေးရန်</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab("premium")}
                className="w-full clm-btn-primary py-2.5 text-xs font-bold gap-1.5 justify-center shadow-md cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>👑 Kibo Premium ရယူရန် (Upgrade VIP)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. IN-PROGRESS COURSES (MULTI-COURSE RESUME) */}
      {/* ========================================================= */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                လေ့လာဆဲ သင်တန်းများ (In Progress)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                သင် စတင်လေ့လာထားသော အခြားသင်တန်းများ
              </p>
            </div>
            <button
              onClick={() => setCurrentTab("courses")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              သင်တန်းအားလုံး →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.map(course => {
              const completedInThis = course.lessons.filter(l => completedLessonsSet.has(l.id)).length;
              const pct = Math.round((completedInThis / course.lessons.length) * 100);
              const uncompletedIdx = course.lessons.findIndex(l => !completedLessonsSet.has(l.id));
              const targetLessonIdx = uncompletedIdx !== -1 ? uncompletedIdx : 0;

              return (
                <div 
                  key={course.id}
                  className="clm-card p-5 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="clm-badge-neutral text-[10px]">
                        {course.category.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {pct}%
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {course.title}
                    </h4>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {completedInThis} of {course.lessons.length} Lessons Completed
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartCourseDirect(course, targetLessonIdx)}
                    className="clm-btn-secondary w-full py-2 text-xs gap-1.5 justify-center cursor-pointer"
                  >
                    <span>ဆက်လက်သင်ယူမည်</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 7. FEATURED COURSES CATALOG PREVIEW */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="clm-heading-lg">
              ထိပ်တန်း ဦးစားပေးသင်တန်းများ (Featured Courses)
            </h2>
            <p className="clm-subheading mt-1">
              အခြေခံမှစတင်ပြီး လက်တွေ့အသုံးချနိုင်မည့် ပြည့်စုံသော သင်တန်းများဖြစ်ပါသည်။
            </p>
          </div>

          <button 
            onClick={() => setCurrentTab("courses")}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 self-start sm:self-auto cursor-pointer"
          >
            <span>သင်တန်းအားလုံး ကြည့်ရန် ({courses.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <div 
              key={course.id}
              className="clm-card overflow-hidden hover:-translate-y-1 flex flex-col group transition-all"
            >
              <div className="h-40 bg-slate-50 dark:bg-slate-900/80 flex flex-col items-center justify-center relative p-6 border-b border-slate-200 dark:border-slate-800 text-center">
                <div className="absolute top-3 right-3 clm-badge-primary text-[10px]">
                  {course.difficulty}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <h4 className="text-slate-900 dark:text-white font-display font-bold text-sm line-clamp-1">{course.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">{course.estimatedTime} Estimation</p>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-2">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{course.lessonCount || course.lessons.length} Lessons</span>
                    </span>
                    <span className="clm-badge-neutral font-sans">
                      {course.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartCourseDirect(course, 0)}
                  className="clm-btn-primary w-full py-2.5 text-xs gap-1.5 cursor-pointer"
                >
                  <span>စတင်လေ့လာပါ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. TOPIC CATEGORIES */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            သင်တန်းအမျိုးအစားအလိုက် လေ့လာရန် (Categories)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            မိမိစိတ်ဝင်စားရာ နည်းပညာနယ်ပယ်ကို ရွေးချယ်လေ့လာနိုင်ပါသည်
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                onClick={() => setCurrentTab("courses")}
                className="clm-card-interactive p-3.5 flex flex-col justify-between space-y-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cat.name}</h4>
                  <p className="text-slate-900 dark:text-white font-bold text-xs mt-0.5">{cat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
