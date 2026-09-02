/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  ChevronRight, 
  Search, 
  GraduationCap,
  Sparkles,
  ArrowRight,
  X
} from "lucide-react";
import { Course, UserProfile, PaymentSettings } from "../types";
import CourseDetails from "../components/CourseDetails";
import { EmptyState } from "../components/EmptyState";
import { isUserPremium } from "../utils/premiumSecurity";

interface CoursesProps {
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course, lessonIdx?: number) => void;
  user: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
  activeSettings?: PaymentSettings | null;
}

interface MatchedLesson {
  course: Course;
  lesson: any;
  lessonIdx: number;
}

export default function Courses({ courses, selectedCourse, setSelectedCourse, user, onUpdateUser, onNavigateTab, activeSettings }: CoursesProps) {
  const isPremiumUser = isUserPremium(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  const levels = [
    { id: "foundation", label: "Foundation", myanmar: "အခြေခံအုတ်မြစ်", desc: "ပရိုဂရမ်မင်း၏ အခြေခံအတွေးအခေါ်များ", minLessons: 0 },
    { id: "beginner", label: "Beginner", myanmar: "အစပြုသူ", desc: "ရိုးရှင်းသော ကုဒ်ရေးသားနည်းများ", minLessons: 2 },
    { id: "intermediate", label: "Intermediate", myanmar: "အလယ်အလတ်", desc: "လက်တွေ့ပရောဂျက်ငယ်များ စတင်ခြင်း", minLessons: 5 },
    { id: "advanced", label: "Advanced", myanmar: "အဆင့်မြင့်", desc: "ရှုပ်ထွေးသော စနစ်များ ချိတ်ဆက်ခြင်း", minLessons: 8 },
    { id: "professional", label: "Professional", myanmar: "ကျွမ်းကျင်သူ", desc: "လုပ်ငန်းခွင်သုံး နည်းပညာများ", minLessons: 11 },
    { id: "career_ready", label: "Career Ready", myanmar: "အလုပ်အကိုင်အသင့်ဖြစ်", desc: "ကိုယ်ပိုင် Portfolio နှင့် အင်တာဗျူးပြင်ဆင်ခြင်း", minLessons: 14 }
  ];

  const completedCount = user.completedLessons?.length || 0;
  
  // Find current level
  let currentLevelIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (completedCount >= levels[i].minLessons) {
      currentLevelIdx = i;
      break;
    }
  }
  const currentLevel = levels[currentLevelIdx];

  // If currently deep-viewing a course details, render the CourseDetails component
  if (viewingCourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CourseDetails
          course={viewingCourse}
          user={user}
          onUpdateUser={onUpdateUser}
          onBack={() => setViewingCourse(null)}
          onStartLearning={(course, idx) => {
            setSelectedCourse(course, idx);
          }}
        />
      </div>
    );
  }

  const categories = [
    { id: "all", label: "သင်တန်းအားလုံး" },
    { id: "basics", label: "Programming Fundamentals" },
    { id: "frontend", label: "Frontend Development" },
    { id: "backend", label: "Backend Development" },
    { id: "fullstack", label: "Full Stack Development" },
    { id: "android", label: "Android Development" },
    { id: "database", label: "Database" },
    { id: "git", label: "Version Control" },
    { id: "cloud", label: "Cloud & Deployment" },
    { id: "ai", label: "Artificial Intelligence" },
    { id: "career", label: "Career Preparation" }
  ];

  const matchesCategory = (course: Course) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "basics" && course.category === "basics") return true;
    if (activeCategory === "frontend" && course.category === "web") return true;
    if (activeCategory === "git" && course.category === "git") return true;
    if (activeCategory === "database" && (course.category as string) === "firebase") return true;
    return (course.category as string) === activeCategory;
  };

  // Filter Courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesCategory(course);
  });

  // Advanced lesson searching engine
  const matchedLessons: MatchedLesson[] = [];
  if (searchQuery.trim() !== "") {
    courses.forEach((course) => {
      if (matchesCategory(course)) {
        course.lessons.forEach((lesson, idx) => {
          const titleMatch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
          const whatMatch = lesson.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase());
          const whyMatch = lesson.whyImportant?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
          const syntaxMatch = lesson.syntax?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
          
          if (titleMatch || whatMatch || whyMatch || syntaxMatch) {
            matchedLessons.push({
              course,
              lesson,
              lessonIdx: idx
            });
          }
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Page Title & Desc */}
      <div className="space-y-2">
        <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white">
          အသေးစိတ် ပရိုဂရမ်မင်း သင်တန်းလမ်းညွှန်များ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          တက္ကသိုလ်ကျောင်းသားများ၊ အသက်မွေးဝမ်းကျောင်းပြုလိုသူများနှင့် အိုင်တီဝါသနာရှင်များအတွက် သင့်လျော်သော အခြေခံမှ အဆင့်မြင့်နည်းပညာသင်ခန်းစာများ။
        </p>
      </div>

      {/* Promotional Ad Banner for Free Users */}
      {!isPremiumUser && showPromoBanner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-purple-500/15 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Close/Dismiss Button */}
          <button 
            onClick={() => setShowPromoBanner(false)}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-all z-20 cursor-pointer"
            title="ပရိုမိုးရှင်း ပိတ်မည်"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col md:flex-row items-center gap-5 relative z-10 text-center md:text-left">
            <div className="flex-shrink-0 animate-bounce text-4xl">
              👑
            </div>
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">
                {activeSettings?.isPromoActive ? "🔥 Limited-Time Special Offer" : "Kibo Premium Promotion"}
              </span>
              <h3 className="text-slate-900 dark:text-white font-display font-extrabold text-base">
                {activeSettings?.isPromoActive 
                  ? `Kibo Premium အထူးပရိုမိုးရှင်း ${activeSettings.promoDiscountPercent}% သက်သာခွင့်ရယူလိုက်ပါ!` 
                  : "Kibo Premium ဖြင့် အဆင့်မြင့်သင်ခန်းစာများအားလုံး လေ့လာပါ!"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                {activeSettings?.isPromoActive && activeSettings.promoBannerText
                  ? activeSettings.promoBannerText
                  : "Premium သို့ အဆင့်မြှင့်တင်ပြီး သင်တန်းအားလုံးရှိ သင်ခန်းစာများ၊ လက်တွေ့ Assignments များနှင့် Professional Projects များအားလုံးကို လော့ခ်ဖွင့်လိုက်ပါ။ စနစ်တကျအတည်ပြုပြီးသော Premium PDF Certificates များလည်း ထုတ်ယူနိုင်ပါမည်။"}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab("premium")}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex-shrink-0 relative z-10 cursor-pointer"
          >
            {activeSettings?.isPromoActive 
              ? `Claim ${activeSettings.promoDiscountPercent}% Discount 👑` 
              : "Upgrade to Premium 👑"}
          </button>
        </div>
      )}

      {/* Learning Path Roadmap Panel */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span>သင်ယူမှုလမ်းကြောင်း တိုးတက်မှု (Learning Path Roadmap)</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Foundation မှ Career Ready အထိ စနစ်တကျ တိုးတက်လေ့လာနိုင်သော လမ်းညွှန်ဖြစ်ပါသည် ခင်ဗျာ။
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-1.5 text-right flex-shrink-0">
            <span className="text-[10px] text-blue-500 dark:text-blue-400 font-mono font-bold block uppercase">CURRENT MILESTONE</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLevel.label} ({currentLevel.myanmar})</span>
          </div>
        </div>

        {/* The Pipeline bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {levels.map((lvl, index) => {
            const isLvlCompleted = index < currentLevelIdx;
            const isLvlCurrent = index === currentLevelIdx;
            const isLvlFuture = index > currentLevelIdx;

            return (
              <div 
                key={lvl.id}
                className={`p-3.5 rounded-2xl border transition-all text-center relative flex flex-col justify-between ${
                  isLvlCurrent
                    ? "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/5"
                    : isLvlCompleted
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-850 opacity-60"
                }`}
              >
                {/* Visual Connector Line */}
                {index < 5 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-center mx-auto mb-1">
                    {isLvlCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    ) : isLvlCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                        👑
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 text-[10px] font-mono flex items-center justify-center">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <h4 className={`text-[11px] font-bold tracking-tight ${isLvlCurrent ? "text-blue-600 dark:text-blue-400" : isLvlCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                    {lvl.label}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {lvl.myanmar}
                  </p>
                </div>

                <div className="mt-2 text-[9px] text-slate-400 leading-tight">
                  {lvl.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="သင်တန်း သို့မဟုတ် သင်ခန်းစာခေါင်းစဉ် ရှာဖွေရန်..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matched Lessons Section (Search Engine specific results) */}
      {searchQuery.trim() !== "" && matchedLessons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-display font-bold text-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <h2>ရှာဖွေတွေ့ရှိသော သင်ခန်းစာများ ({matchedLessons.length} ခု)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedLessons.map(({ course, lesson, lessonIdx }) => (
              <button
                key={`${course.id}-${lesson.id}`}
                onClick={() => setSelectedCourse(course, lessonIdx)}
                className="flex items-start justify-between p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-500/20 rounded-2xl hover:border-blue-500/60 transition-all text-left group w-full cursor-pointer"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      {course.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Lesson {lessonIdx + 1}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {lesson.whatIsIt}
                  </p>
                </div>
                <div className="self-center p-1.5 rounded-xl bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {searchQuery.trim() !== "" && (
            <h2 className="font-display font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              ရှာဖွေတွေ့ရှိသော သင်တန်းများ ({filteredCourses.length} ခု)
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all flex flex-col group shadow-sm dark:shadow-md"
              >
                {/* Header Box */}
                <div className="h-44 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center relative p-6 border-b border-slate-200 dark:border-slate-850 text-center">
                  <div className="absolute top-3 right-3 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {course.difficulty}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white mb-3 shadow group-hover:scale-110 transition-transform">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-display font-bold text-sm line-clamp-1">{course.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">{course.estimatedTime} Estimation</p>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Metadata: Lesson Count, Completed Lessons & Progress Bar */}
                    {(() => {
                      const completedCountInThis = course.lessons.filter(l => (user.completedLessons || []).includes(l.id)).length;
                      const totalCountInThis = course.lessons.length || course.lessonCount || 1;
                      const pctInThis = Math.round((completedCountInThis / totalCountInThis) * 100);

                      return (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span><strong>{totalCountInThis}</strong> Lessons</span>
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              Completed: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{completedCountInThis}</strong> / {totalCountInThis}
                            </span>
                          </div>

                          {/* Progress Bar & Percentage */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              <span>Course Progress</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{pctInThis}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${pctInThis}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setViewingCourse(course)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>အသေးစိတ် (Details)</span>
                    </button>

                    <button
                      onClick={() => {
                        const completedLessons = user.completedLessons || [];
                        const uncompletedIdx = course.lessons.findIndex(l => !completedLessons.includes(l.id));
                        setSelectedCourse(course, uncompletedIdx !== -1 ? uncompletedIdx : 0);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-sm transition-all cursor-pointer"
                    >
                      <span>လေ့လာမည် (Learn)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState 
          variant="no_search_results"
          title={searchQuery.trim() !== "" ? "No matching courses or lessons" : "No courses available"}
          titleMm={searchQuery.trim() !== "" ? "ရှာဖွေမှုနှင့် ကိုက်ညီသော သင်တန်းများ မတွေ့ရှိပါ" : "သင်တန်းများ မရှိသေးပါ"}
          description={searchQuery.trim() !== "" ? "We couldn't find any courses matching your keywords. Try clearing your filters." : "Explore other categories or check back soon for new lessons."}
          descriptionMm={searchQuery.trim() !== "" ? "သင်ရှာဖွေသော စာလုံး သို့မဟုတ် Category နှင့် ကိုက်ညီသည့် သင်တန်းများ မတွေ့ရှိပါ။ စစ်ထုတ်မှုများကို ရှင်းလင်းကြည့်ပါ။" : "လက်ရှိ ကဏ္ဍတွင် သင်တန်းအသစ်များ မရှိသေးပါ။ အခြားကဏ္ဍများကို ရွေးချယ်လေ့လာနိုင်ပါသည်။"}
          primaryAction={{
            label: "Clear Search & Filters",
            labelMm: "ရှာဖွေမှု ရှင်းလင်းမည်",
            onClick: () => {
              setSearchQuery("");
              setActiveCategory("all");
            }
          }}
        />
      )}
    </div>
  );
}
