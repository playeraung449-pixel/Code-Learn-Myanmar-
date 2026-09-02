/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Star, 
  Zap, 
  FileText, 
  Layers, 
  Check, 
  Download, 
  Printer, 
  Share2, 
  Compass, 
  Briefcase, 
  X,
  Lock,
  Flame,
  Code
} from "lucide-react";
import { UserProfile, Course, getLevelData } from "../types";
import KiboMascot from "./KiboMascot";

export type CelebrationType = "lesson" | "module" | "course" | "roadmap" | "special_event";

export interface UnlockedBadge {
  id: string;
  title: string;
  titleMm: string;
  descriptionMm: string;
  icon: string;
  category: "learning" | "course" | "roadmap" | "milestone" | "seasonal";
}

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  titleMm: string;
  subtitleMm: string;
  xpEarned: number;
  coinsEarned?: number;
  unlockedBadge?: UnlockedBadge;
  
  // Lesson specific
  lessonTitle?: string;
  lessonIndex?: number;
  totalLessonsInCourse?: number;
  hasNextLesson?: boolean;

  // Module specific
  moduleTitle?: string;
  nextModuleTitle?: string;

  // Course specific
  course?: Course;
  finalQuizAccuracy?: number;
  projectSubmitted?: boolean;
  recommendedNextCourseTitle?: string;
  recommendedNextCourseId?: string;

  // Roadmap specific
  roadmapTitle?: string;
  developerTitleMm?: string;
  certificateId?: string;
  portfolioUpdated?: boolean;
  careerRecommendations?: { title: string; desc: string }[];

  // Special Event
  eventNameMm?: string;
}

interface CelebrationModalProps {
  data: CelebrationData;
  user: UserProfile;
  onClose: () => void;
  onNextLesson?: () => void;
  onNavigateNextCourse?: (courseId: string) => void;
  onViewCertificate?: (certId: string) => void;
  onNavigateTab?: (tab: string) => void;
  isPremiumUser?: boolean;
}

export default function CelebrationModal({
  data,
  user,
  onClose,
  onNextLesson,
  onNavigateNextCourse,
  onViewCertificate,
  onNavigateTab,
  isPremiumUser = false
}: CelebrationModalProps) {

  // Fire celebratory fireworks confetti on mount
  useEffect(() => {
    if (data.type === "roadmap" || data.type === "course") {
      // Grand fireworks burst
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    } else {
      // Standard pop confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10000
      });
    }
  }, [data.type]);

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const levelInfo = getLevelData(user.xp);

  // Kibo Motivational Speeches in Simple Myanmar + English terms
  const getKiboSpeech = () => {
    switch (data.type) {
      case "lesson":
        return {
          title: "အရမ်းတော်တယ် ခင်ဗျာ! 👏",
          body: `သင်ခန်းစာ "${data.lessonTitle || 'Lesson'}" ကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ပါပြီ။ Programming အတွေ့အကြုံသစ်တစ်ခု ထပ်မံရရှိသွားပါပြီ။ ဒီအရှိန်အတိုင်း နောက် Lesson တွေကို တက်တက်ကြွကြွ ဆက်လက်လေ့လာသွားကြစို့!`
        };
      case "module":
        return {
          title: "မော်ဂျူးတစ်ခုလုံး ပြီးဆုံးခဲ့ပါပြီ! 🚀",
          body: `မော်ဂျူး "${data.moduleTitle || 'Module'}" ပါ သဘောတရားများနှင့် လေ့ကျင့်ခန်းများကို အောင်မြင်စွာ ကျွမ်းကျင်သွားပါပြီ။ သင့်ရဲ့ Developer စွမ်းရည် သိသိသာသာ တိုးတက်လာနေပါပြီ ခင်ဗျာ!`
        };
      case "course":
        return {
          title: "ဂုဏ်ယူပါတယ်! သင်တန်းပြီးဆုံးပါပြီ! 🎓",
          body: `"${data.course?.title || 'Course'}" သင်တန်းတစ်ခုလုံး၏ Lessons, Quizzes နှင့် Projects များကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ပါပြီ။ ကိုယ်ရေးအကျဉ်း (Profile) တွင် သင့်ရဲ့ တရားဝင် သင်တန်းဆင်းလက်မှတ်ကို သိမ်းဆည်းထားပြီးပါပြီ!`
        };
      case "roadmap":
        return {
          title: "မင်္ဂလာပါ ဘွဲ့ရပညာရှင်ကြီး! 👑✨",
          body: `"${data.roadmapTitle || 'Career Roadmap'}" လမ်းညွှန်တစ်ခုလုံးကို အစအဆုံး ကျော်ဖြတ်ပြီး တရားဝင် Developer Graduate အဖြစ် အောင်မြင်စွာ ဘွဲ့ရရှိသွားခဲ့ပါပြီ! သင့်ရဲ့ Portfolio ကိုလည်း အလိုအလျောက် ရေးသားပြင်ဆင်ပေးထားပြီးဖြစ်ပါတယ် ခင်ဗျာ!`
        };
      case "special_event":
      default:
        return {
          title: "အထူးဆုတံဆိပ် ရရှိခဲ့ပါသည်! 🌟",
          body: `Code Learn Myanmar ၏ အထူးအစီအစဉ်တွင် တက်ကြွစွာ ပါဝင်ခဲ့သဖြင့် အထူး Badge နှင့် XP Reward များကို ရယူနိုင်ခဲ့ပါပြီ!`
        };
    }
  };

  const kiboSpeech = getKiboSpeech();

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#1E293B] border border-purple-500/30 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-auto animate-scale-up text-slate-100">
        
        {/* Decorative Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Top Header Badge & Mascot */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>
                {data.type === "roadmap" && "🎓 ROADMAP GRADUATION"}
                {data.type === "course" && "🏆 COURSE COMPLETED"}
                {data.type === "module" && "🌟 MODULE COMPLETED"}
                {data.type === "lesson" && "✅ LESSON COMPLETED"}
                {data.type === "special_event" && "🔥 SPECIAL EVENT UNLOCKED"}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
              {data.titleMm || data.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {data.subtitleMm}
            </p>
          </div>

          {/* Kibo Mascot Speech Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 text-left relative overflow-hidden">
            <div className="shrink-0 flex justify-center">
              <KiboMascot emotion={data.type === "roadmap" || data.type === "course" ? "celebrating" : "excited"} size="md" animated={true} />
            </div>

            <div className="space-y-1.5 flex-1 text-center md:text-left">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
                {kiboSpeech.title}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "{kiboSpeech.body}"
              </p>
            </div>
          </div>

          {/* Rewards Grid: XP, Coins, Badges, Level Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* XP Earned */}
            <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-3.5 text-center space-y-1">
              <Zap className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
              <div className="text-lg font-black text-amber-400 font-mono">+{data.xpEarned} XP</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">ရရှိသော အမှတ်</div>
            </div>

            {/* Coins Earned */}
            <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-3.5 text-center space-y-1">
              <Star className="w-6 h-6 text-yellow-400 mx-auto" />
              <div className="text-lg font-black text-yellow-400 font-mono">+{data.coinsEarned || Math.floor(data.xpEarned / 2)} Coins</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">ရရှိသော ဒင်္ဂါး</div>
            </div>

            {/* Streak Status */}
            <div className="bg-gradient-to-br from-rose-500/15 to-rose-600/5 border border-rose-500/30 rounded-2xl p-3.5 text-center space-y-1">
              <Flame className="w-6 h-6 text-rose-400 mx-auto" />
              <div className="text-lg font-black text-rose-400 font-mono">{user.learningStreak || 1} Days</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">လေ့လာမှု စာသင်ရက်</div>
            </div>

            {/* Level Status */}
            <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/30 rounded-2xl p-3.5 text-center space-y-1">
              <Trophy className="w-6 h-6 text-blue-400 mx-auto" />
              <div className="text-lg font-black text-blue-400 font-mono">Level {levelInfo?.level || 1}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{(levelInfo?.name || "Novice").split(" (")[0]}</div>
            </div>

          </div>

          {/* Unlocked Badge Section (If applicable) */}
          {data.unlockedBadge && (
            <div className="bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-slate-900 border border-purple-500/40 rounded-2xl p-4 text-left flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-purple-500/30 text-purple-200 font-mono font-bold px-2 py-0.5 rounded-full uppercase">NEW BADGE UNLOCKED!</span>
                  <h4 className="text-sm font-extrabold text-white">{data.unlockedBadge.titleMm || data.unlockedBadge.title}</h4>
                </div>
                <p className="text-xs text-purple-200/80">{data.unlockedBadge.descriptionMm}</p>
              </div>
            </div>
          )}

          {/* Type Specific Additional Content */}

          {/* COURSE COMPLETION SUMMARY */}
          {data.type === "course" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>သင်တန်းပြီးမြောက်မှု ရလဒ်အကျဉ်း (Course Summary)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ဉာဏ်စမ်းဖြေဆိုမှု မှန်ကန်နှုန်း:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">{data.finalQuizAccuracy || 95}% Quiz Pass Rate</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ဘွဲ့ရလက်မှတ် အခြေအနေ:</span>
                  <span className="text-amber-400 font-bold text-xs flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>ထုတ်ယူရန် အဆင်သင့်</span>
                  </span>
                </div>
              </div>

              {data.recommendedNextCourseTitle && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold block uppercase">အကြံပြုထားသော နောက်ထပ် သင်တန်း</span>
                    <span className="text-xs font-extrabold text-white">{data.recommendedNextCourseTitle}</span>
                  </div>
                  {data.recommendedNextCourseId && (
                    <button
                      onClick={() => onNavigateNextCourse && onNavigateNextCourse(data.recommendedNextCourseId!)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>လေ့လာမည်</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ROADMAP GRADUATION SUMMARY */}
          {data.type === "roadmap" && (
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-400">{data.developerTitleMm || "တရားဝင် Full Stack Developer"}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">OFFICIAL CAREER GRADUATE DIPLOMA</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Portfolio Updated:</strong> သင့်၏ Developer Portfolio သို့ ဤ ဘွဲ့ရရှိမှုနှင့် Project သမိုင်းကြောင်းများကို ထည့်သွင်းပြီးပါပြီ။</span>
                </p>
                <p className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Certificate Awarded:</strong> Verified Digital Career Certificate ကို Profile တွင် အခမဲ့ ဒေါင်းလုဒ်/ပုံနှိပ် ရယူနိုင်ပါသည်။</span>
                </p>
              </div>

              {data.careerRecommendations && data.careerRecommendations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    အလုပ်အကိုင်အတွက် အကြံပြုချက်များ (Career Path Guidance)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.careerRecommendations.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                        <span className="font-bold text-blue-300 block mb-0.5">{item.title}</span>
                        <span className="text-slate-400">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            
            {/* Primary Action Button */}
            {data.type === "lesson" && data.hasNextLesson && (
              <button
                onClick={() => {
                  onClose();
                  if (onNextLesson) onNextLesson();
                }}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <span>နောက်သင်ခန်းစာသို့ သွားမည် (Next Lesson)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {(data.type === "course" || data.type === "roadmap") && (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab("profile");
                }}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>ဂုဏ်ထူးဆောင်လက်မှတ် ကြည့်ရှုမည် (View Certificate)</span>
              </button>
            )}

            {/* Secondary Action */}
            <button
              onClick={onClose}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              ပိတ်မည် (Done)
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
