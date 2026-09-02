import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  Brain,
  Sliders,
  RotateCw,
  Crown,
  ChevronRight,
  FileCode,
  Map,
  Compass,
  Briefcase,
  Play,
  Settings
} from "lucide-react";
import { Course, Lesson } from "../types";
import { ExtendedUserProfile, QuizResult } from "../utils/progress";
import KiboMascot from "./KiboMascot";

interface AdaptiveLearningProps {
  user: ExtendedUserProfile;
  onUpdateUser: (updatedUser: ExtendedUserProfile) => void;
  courses: Course[];
  setSelectedCourse: (course: Course, lessonIdx: number) => void;
  setCurrentTab: (tab: string) => void;
}

export default function AdaptiveLearning({
  user,
  onUpdateUser,
  courses,
  setSelectedCourse,
  setCurrentTab
}: AdaptiveLearningProps) {
  // Simulator State to allow user to easily toggle tiers
  const isPremiumActual = user.role === "premium" || user.role === "teacher" || user.role === "admin" || (user as any).isPremium === true;
  const [isSimulatingPremium, setIsSimulatingPremium] = useState<boolean>(isPremiumActual);

  // Sync simulated state with user object if needed
  const togglePremiumSimulation = () => {
    const nextVal = !isSimulatingPremium;
    setIsSimulatingPremium(nextVal);
    onUpdateUser({
      ...user,
      role: nextVal ? "premium" : "student",
      isPremium: nextVal
    } as any);
  };

  // State for AI Study Plan Generator
  const [dailyTimeGoal, setDailyTimeGoal] = useState<number>(30); // minutes
  const [targetCareer, setTargetCareer] = useState<string>("frontend"); // 'frontend' | 'python_engineer' | 'fullstack' | 'mobile_app'
  const [studyPlanGenerated, setStudyPlanGenerated] = useState<boolean>(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // State for admin settings
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminSettings, setAdminSettings] = useState({
    ruleMode: "balanced", // strict | balanced | open
    difficultyThreshold: 80, // % quiz score needed
    weeklyXpWeight: 1.5 // Multiplier
  });

  // State for active tips or motivational coaches
  const [coachTipIndex, setCoachTipIndex] = useState<number>(0);

  const tipsList = [
    {
      title: "Active Recall (ပြန်လည်သတိရခြင်း)",
      text: "သင်ခန်းစာတစ်ခု ဖတ်ပြီးတဲ့အခါ စာအုပ်ပိတ်ပြီး အဓိကအချက်တွေကို စိတ်ထဲကဖြစ်စေ၊ စာရွက်ပေါ်မှာဖြစ်စေ ပြန်လည်ချရေးခြင်းက မှတ်ဉာဏ်ကို ၈၀% ပိုမိုခိုင်မာစေပါတယ်ဗျာ။"
    },
    {
      title: "Spaced Repetition (ကာလခြား ထပ်ခါတလဲလဲလေ့လာခြင်း)",
      text: "ကုဒ်တွေကို တစ်နေ့တည်း အများကြီးကျက်မယ့်အစား၊ ဒီနေ့လေ့လာထားတာကို နောက် ၂ ရက်၊ နောက် ၁ ပတ် စသဖြင့် ခြားပြီး ပြန်လှန်လေ့ကျင့်ပါဗျာ။"
    },
    {
      title: "Pomodoro Technique (၂၅ မိနစ် အာရုံစိုက်ခြင်း)",
      text: "၂၅ မိနစ် ကုဒ်အပြည့်အဝရေးပြီးတိုင်း ၅ မိနစ် အနားပေးပါ။ ဒါက ဦးနှောက်မပန်းဘဲ တစ်နေ့လုံး တက်ကြွနေစေမှာဖြစ်ပါတယ်!"
    },
    {
      title: "Debugging is Learning (အမှားရှာဖွေခြင်းသည် သင်ယူခြင်းဖြစ်သည်)",
      text: "Error တက်တာကို မကြောက်ပါနဲ့။ Error တက်လေ၊ အဖြေရှာတတ်လေ သင်ယူမှု အရှိန်အဟုန် မြန်ဆန်လေ ဖြစ်ပါတယ်ဗျာ။"
    }
  ];

  // Helper values for learning analysis
  const completedLessonsCount = user.completedLessons?.length || 0;
  const completedQuizzesCount = user.completedQuizzes?.length || user.quizResults?.filter(r => r.passed).length || 0;
  const completedProjectsCount = user.completedProjects?.length || 0;
  const currentStreak = user.learningStreak || 1;
  const totalMinutesStudied = user.studyTimeStats?.totalMinutes || 45;
  const avgQuizScore = user.quizResults && user.quizResults.length > 0
    ? Math.round(user.quizResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / user.quizResults.length)
    : 85;

  // Derive practice activity completed from completed lessons / exercises
  const practiceActivityCount = Math.max(completedLessonsCount, Math.round(totalMinutesStudied / 10));

  // WEAK TOPIC DETECTION
  // We scan quiz results. If score < difficultyThreshold (from admin), we mark it as weak.
  // We also have some realistic defaults based on the student's status.
  const getWeakTopics = () => {
    const weakList: { topic: string; courseId: string; reason: string; exerciseId?: string }[] = [];

    // Analyze quiz results for low scores
    if (user.quizResults) {
      user.quizResults.forEach(r => {
        const percent = (r.score / r.totalQuestions) * 100;
        if (percent < adminSettings.difficultyThreshold) {
          // Identify topic from quizId or name
          let topicName = r.quizId.includes("variables") ? "Variables & Data Types" : "Conditionals & Logic";
          if (r.quizId.includes("html")) topicName = "HTML Semantic Tags";
          if (r.quizId.includes("git")) topicName = "Git Commit Rules";

          // Match course
          const cId = r.quizId.includes("python") ? "prog-basics-python" : "web-dev-html";
          
          if (!weakList.some(item => item.topic === topicName)) {
            weakList.push({
              topic: topicName,
              courseId: cId,
              reason: `Quiz ရမှတ် ${Math.round(percent)}% သာရရှိသဖြင့် (သတ်မှတ်ချက် ${adminSettings.difficultyThreshold}% အောက်)`
            });
          }
        }
      });
    }

    // Default weak topics to populate beautifully if user is beginner or hasn't failed quizzes
    if (weakList.length === 0) {
      if (completedLessonsCount < 4) {
        weakList.push({
          topic: "HTML Forms & Selectors",
          courseId: "web-dev-html",
          reason: "အခြေခံသင်ယူမှု အစောပိုင်းအဆင့်ဖြစ်သောကြောင့် လေ့ကျင့်မှုပိုလိုအပ်နေပါသည်"
        });
        weakList.push({
          topic: "JavaScript Functions",
          courseId: "web-dev-html",
          reason: "Logic အပိုင်းတွင် code စတင်ရေးသားရန် စိန်ခေါ်မှုရှိနိုင်ပါသည်"
        });
      } else {
        weakList.push({
          topic: "Firebase Authentication rules",
          courseId: "git-github-vcs",
          reason: "လုံခြုံရေးစည်းမျဉ်းများနှင့် ဒေတာခွင့်ပြုချက်များကို စနစ်တကျ ပြန်လည်သုံးသပ်ရန်"
        });
        weakList.push({
          topic: "CSS Flexbox & Grids Layout",
          courseId: "web-dev-html",
          reason: "Responsive UI ပိုင်းတွင် စနစ်တကျ alignment ညှိရန် လေ့ကျင့်ခန်းများလိုအပ်ပါသည်"
        });
      }
    }

    return weakList;
  };

  // STRONG TOPIC DETECTION
  const getStrongTopics = () => {
    const strongList: { topic: string; courseId: string; reason: string; advancedLessonId?: string }[] = [];

    // Quiz scores with score >= 85% or high progress
    if (user.quizResults) {
      user.quizResults.forEach(r => {
        const percent = (r.score / r.totalQuestions) * 100;
        if (percent >= 85) {
          let topicName = r.quizId.includes("variables") ? "Python Data Types" : "Python Control Flow";
          if (r.quizId.includes("html")) topicName = "HTML Web Structures";
          if (r.quizId.includes("git")) topicName = "Git Version Control Basics";

          const cId = r.quizId.includes("python") ? "prog-basics-python" : "web-dev-html";

          if (!strongList.some(item => item.topic === topicName)) {
            strongList.push({
              topic: topicName,
              courseId: cId,
              reason: `Quiz တွင် ${Math.round(percent)}% ဖြင့် ကောင်းမွန်စွာ ဖြေဆိုအောင်မြင်ခဲ့သည်`
            });
          }
        }
      });
    }

    // Add high-level default strong topics
    if (strongList.length === 0) {
      strongList.push({
        topic: "Python Variables",
        courseId: "prog-basics-python",
        reason: "ပရိုဂရမ်မင်းအခြေခံ ကိန်းရှင်သတ်မှတ်ခြင်းကို ကောင်းမွန်စွာ ရေးသားနိုင်သည်"
      });
      strongList.push({
        topic: "Git Version Control",
        courseId: "git-github-vcs",
        reason: "ကုဒ်များကို version ခွဲခြားထိန်းသိမ်းခြင်းနှင့် backup ပြုလုပ်ခြင်းတွင် ကျွမ်းကျင်သည်"
      });
    }

    return strongList;
  };

  const weakTopics = getWeakTopics();
  const strongTopics = getStrongTopics();

  // PERSONALIZED RECOMMENDATIONS GENERATION
  const getPersonalizedRecommendations = () => {
    // 1. Next Lesson (Find the first uncompleted lesson of the active course or basic courses)
    let nextLesson: { course: Course; lesson: Lesson; lessonIdx: number } | null = null;
    
    // Find active course or default to first
    const activeCourse = courses.find(c => c.id === user.currentCourseId) || courses[0];
    const uncompletedIdx = activeCourse.lessons.findIndex(l => !user.completedLessons?.includes(l.id));

    if (uncompletedIdx >= 0) {
      nextLesson = {
        course: activeCourse,
        lesson: activeCourse.lessons[uncompletedIdx],
        lessonIdx: uncompletedIdx
      };
    } else {
      // Find next course in platform
      const nextCourse = courses.find(c => c.id !== activeCourse.id && c.lessons.some(l => !user.completedLessons?.includes(l.id)));
      if (nextCourse) {
        const idx = nextCourse.lessons.findIndex(l => !user.completedLessons?.includes(l.id));
        nextLesson = {
          course: nextCourse,
          lesson: nextCourse.lessons[idx >= 0 ? idx : 0],
          lessonIdx: idx >= 0 ? idx : 0
        };
      }
    }

    // 2. Revision Lessons (based on weak topics, or earlier lessons)
    const revisionLessons: { course: Course; lesson: Lesson; lessonIdx: number }[] = [];
    courses.forEach(c => {
      c.lessons.forEach((l, idx) => {
        // Find if this corresponds to a weak topic
        const isWeak = weakTopics.some(w => (l?.title || "").toLowerCase().includes((w?.topic || "").toLowerCase().split(" ")[0].toLowerCase()));
        if (isWeak && user.completedLessons?.includes(l.id) && revisionLessons.length < 2) {
          revisionLessons.push({ course: c, lesson: l, lessonIdx: idx });
        }
      });
    });

    // Populate default revision lessons from completed lessons if empty
    if (revisionLessons.length === 0 && user.completedLessons && user.completedLessons.length > 0) {
      for (const c of courses) {
        for (let i = 0; i < c.lessons.length; i++) {
          if ((user.completedLessons || []).includes(c.lessons[i].id)) {
            revisionLessons.push({ course: c, lesson: c.lessons[i], lessonIdx: i });
            if (revisionLessons.length >= 2) break;
          }
        }
        if (revisionLessons.length >= 2) break;
      }
    }

    // If still empty, add default first lesson as revision option
    if (revisionLessons.length === 0) {
      revisionLessons.push({ course: courses[0], lesson: courses[0].lessons[0], lessonIdx: 0 });
    }

    return {
      nextLesson,
      revisionLessons
    };
  };

  const recommendations = getPersonalizedRecommendations();

  // DYNAMIC STUDY PLAN CALCULATIONS
  const handleGenerateStudyPlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setIsGeneratingPlan(false);
      setStudyPlanGenerated(true);
    }, 1500);
  };

  // Generate dynamic schedule based on selected goals
  const getDynamicSchedule = () => {
    const weeksCount = Math.round(12 / (dailyTimeGoal / 30)); // shorter time = more weeks
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksCount * 7));

    let milestones: { week: string; topic: string; desc: string; duration: string }[] = [];

    if (targetCareer === "frontend") {
      milestones = [
        { week: "Week 1", topic: "HTML5 Fundamentals", desc: "ဝက်ဘ်ဆိုက်ဖွဲ့စည်းပုံနှင့် HTML tag များစနစ်တကျရေးသားခြင်း", duration: `${Math.round(420 / dailyTimeGoal)} days` },
        { week: "Week 2", topic: "CSS3 & Visual Layouts", desc: "အရောင်များ၊ ဖောင့်များ၊ Flexbox နှင့် CSS Grid layout များ", duration: `${Math.round(480 / dailyTimeGoal)} days` },
        { week: "Week 3", topic: "Git & Version Control basics", desc: "ကုဒ်များကို GitHub ပေါ်သို့ တင်ခြင်းနှင့် workflow အခြေခံ", duration: `${Math.round(240 / dailyTimeGoal)} days` },
        { week: "Week 4", topic: "Responsive Landing Projects", desc: "မိုဘိုင်းလ်ဖုန်းနှင့် ကွန်ပျူတာ အားလုံးတွင် အဆင်ပြေပြေကြည့်နိုင်မည့် Portfolio ပရောဂျက်တည်ဆောက်ခြင်း", duration: `${Math.round(500 / dailyTimeGoal)} days` }
      ];
    } else if (targetCareer === "python_engineer") {
      milestones = [
        { week: "Week 1", topic: "Python Syntax & Variables", desc: "Python variables, expressions and simple math operations", duration: `${Math.round(300 / dailyTimeGoal)} days` },
        { week: "Week 2", topic: "Conditional Execution (If-Else)", desc: "Logical operators and dynamic decision branching", duration: `${Math.round(360 / dailyTimeGoal)} days` },
        { week: "Week 3", topic: "Loops & Simple Data Structures", desc: "While, For loops and Lists manipulation in python", duration: `${Math.round(420 / dailyTimeGoal)} days` },
        { week: "Week 4", topic: "Core Project Building", desc: "Practical BMI calculator or Fitness companion application writing", duration: `${Math.round(450 / dailyTimeGoal)} days` }
      ];
    } else if (targetCareer === "fullstack") {
      milestones = [
        { week: "Week 1-2", topic: "Frontend Web Core", desc: "HTML forms, CSS positioning and responsive UI elements", duration: `${Math.round(800 / dailyTimeGoal)} days` },
        { week: "Week 3", topic: "Backend logic with Python", desc: "API proxy requests writing, routes definition and state", duration: `${Math.round(500 / dailyTimeGoal)} days` },
        { week: "Week 4", topic: "Firebase Firestore Database", desc: "NoSQL document model, security rules and real-time database sync", duration: `${Math.round(600 / dailyTimeGoal)} days` }
      ];
    } else {
      milestones = [
        { week: "Week 1", topic: "Kotlin Basics syntax", desc: "Kotlin class structure, variables and basic functions", duration: `${Math.round(300 / dailyTimeGoal)} days` },
        { week: "Week 2", topic: "Object Oriented Principles", desc: "Classes, inheritance and encapsulation in Kotlin", duration: `${Math.round(420 / dailyTimeGoal)} days` },
        { week: "Week 3", topic: "Jetpack Compose Basics", desc: "Creating reactive Android UI layouts with Compose framework", duration: `${Math.round(500 / dailyTimeGoal)} days` }
      ];
    }

    return {
      weeksCount,
      completionDate: completionDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      milestones
    };
  };

  const activeSchedule = getDynamicSchedule();

  // DYNAMIC BREAK REMINDER & MOTIVATION
  const getCoachStatus = () => {
    if (totalMinutesStudied >= 60) {
      return {
        emotion: "excited" as const,
        title: "Kibo Study Coach (Break Reminder) ☕",
        message: "မင်္ဂလာပါဗျာ! သင်လေ့လာနေတာ မိနစ် ၆၀ ကျော်သွားပါပြီ။ အရမ်းတော်ပေမယ့် မျက်စိလေး အနားပေးဖို့နဲ့ ရေတစ်ခွက်သောက်ဖို့ ခဏလောက် Break ယူပါဦးနော်ဗျာ။ ကျန်းမာရေးကလည်း အရေးကြီးပါတယ်!"
      };
    } else if (currentStreak >= 3) {
      return {
        emotion: "excited" as const,
        title: "Kibo Study Coach (Streak Celeb) 🔥",
        message: `မင်္ဂလာပါဗျာ! သင့်ရဲ့ လေ့လာမှု Streak က ${currentStreak} ရက်ရှိသွားပါပြီ! အရမ်းဂုဏ်ယူပါတယ်ဗျာ။ နေ့စဉ် ဖြည်းဖြည်းချင်း လေ့လာသွားခြင်းက အကောင်းဆုံးရလဒ်တွေကို ပေးစွမ်းနိုင်မှာပါ။`
      };
    } else if (avgQuizScore >= 80) {
      return {
        emotion: "happy" as const,
        title: "Kibo Study Coach (High Scores) 🌟",
        message: `သင့်ရဲ့ Quiz ပျှမ်းမျှရမှတ်က ${avgQuizScore}% ဖြစ်ပြီး အဆင့်မြင့်မားစွာ ရရှိနေပါတယ်ဗျာ! နားလည်မှုအားကောင်းနေတာမို့ နောက်ထပ် Advanced Mini Projects တွေကို စိန်ခေါ်ရေးသားကြည့်ဖို့ တိုက်တွန်းပါရစေ!`
      };
    } else {
      return {
        emotion: "happy" as const,
        title: "Kibo Study Coach 🌱",
        message: "မင်္ဂလာပါဗျာ! ကျွန်တော် Kibo က သင့်ရဲ့ ကိုယ်ပိုင်သင်ကြားရေး အကြံပေးဖြစ်ပါတယ်။ သင့်ရဲ့ တက်မြှောက်မှုအခြေအနေအလိုက် အကောင်းဆုံး အကြံပြုချက်တွေကို ဒီနေရာမှာ အမြဲတင်ပြပေးနေမှာပါဗျာ။"
      };
    }
  };

  const coachData = getCoachStatus();

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Simulation Banner to Easily Toggle Free/Premium Mode */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            {isSimulatingPremium ? <Crown className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-slate-500" />}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>ကိုယ်ပိုင်လေ့လာမှု လမ်းကြောင်း (AI Adaptive Hub)</span>
              <span className={`text-[8px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                isSimulatingPremium ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}>
                {isSimulatingPremium ? "Premium User ✓" : "Free User"}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isSimulatingPremium 
                ? "အဆင့်မြင့် AI study planning, dynamic detailed recommendations နှင့် graphs အားလုံးကို အပြည့်အဝ အသုံးပြုနိုင်ပါပြီ။"
                : "အခြေခံ အကြံပြုချက်များကိုသာ ရရှိနိုင်ပါသည်။ Advanced insights များကို လော့ခ်ဖွင့်ရန် premium အဖြစ် ဆင့်မြှင့်ပါ။"
              }
            </p>
          </div>
        </div>

        <button
          onClick={togglePremiumSimulation}
          className={`px-4.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-center ${
            isSimulatingPremium
              ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
              : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md shadow-amber-500/15"
          }`}
        >
          {isSimulatingPremium ? "Simulate Free Account 🔓" : "Simulate Premium Status 👑"}
        </button>
      </div>

      {/* Kibo Study Coach Box */}
      <div className="bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-purple-600/95 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="bg-white/10 p-3.5 rounded-2xl flex-shrink-0">
            <KiboMascot emotion={coachData.emotion} size="sm" animated={true} />
          </div>

          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                {coachData.title}
              </span>
              <p className="text-sm font-semibold leading-relaxed font-sans">{coachData.message}</p>
            </div>

            {/* Quick Micro Study Tip Slider */}
            <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex flex-col gap-1 text-left relative group">
              <span className="text-[8px] text-amber-300 font-bold uppercase tracking-wider">💡 Study Tip: {tipsList[coachTipIndex].title}</span>
              <p className="text-[11px] text-slate-100/90 leading-relaxed">{tipsList[coachTipIndex].text}</p>
              
              <button
                onClick={() => setCoachTipIndex((prev) => (prev + 1) % tipsList.length)}
                className="absolute right-2.5 bottom-2.5 text-[9px] bg-white/10 hover:bg-white/25 px-2 py-0.5 rounded font-bold cursor-pointer"
              >
                Next Tip ↻
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Analysis + Recommendations), Right (Study Plan Generator) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. LEARNING ANALYSIS SECTION */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>စွမ်းဆောင်ရည် ဆန်းစစ်ချက် (Learning Analysis)</span>
                </h3>
                <p className="text-[10px] text-slate-400">သင်တန်းသား၏ ပြီးစီးမှု၊ ရမှတ်များနှင့် ဇွဲလုံ့လများကို အသေးစိတ်ဆန်းစစ်ချက်</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
                Live Data Connected
              </span>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-left space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-mono font-bold">Completed</span>
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <h5 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{completedLessonsCount}</h5>
                <p className="text-[9px] text-slate-400">Lessons Completed</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-left space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-mono font-bold">Quiz Average</span>
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                </div>
                <h5 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{avgQuizScore}%</h5>
                <p className="text-[9px] text-slate-400">Based on {completedQuizzesCount} Quizzes</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-left space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-mono font-bold">Projects Done</span>
                  <FileCode className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h5 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{completedProjectsCount}</h5>
                <p className="text-[9px] text-slate-400">Practical Applications</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-left space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-mono font-bold">Active streak</span>
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <h5 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{currentStreak} Days</h5>
                <p className="text-[9px] text-slate-400">Consecutive Days Study</p>
              </div>
            </div>

            {/* Expanded Analytics Row: Practice Activity & Total Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Practice Activity</span>
                  <h6 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1 font-mono">{practiceActivityCount} Tasks Completed</h6>
                  <p className="text-[10px] text-slate-400">Includes sandbox exercises and debug sessions</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Total Accumulated Study Time</span>
                  <h6 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1 font-mono">{totalMinutesStudied} Mins</h6>
                  <p className="text-[10px] text-slate-400">Verified platform engagement tracker</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. PERSONALIZED RECOMMENDATIONS ENGINE GRID */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>ကိုယ်ပိုင်သင်ယူရေး လမ်းညွှန်ချက်များ (Personalized Recommendations)</span>
                </h3>
                <p className="text-[10px] text-slate-400">သင့်တက်မြှောက်မှုအပေါ် မူတည်၍ AI မှ အလိုအလျောက် ရွေးချယ်ပေးထားသော လေ့လာမှုများ</p>
              </div>
              <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold">
                Adaptive Next Paths
              </span>
            </div>

            {/* Recommendations Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box A: NEXT LESSON TO STUDY */}
              {recommendations.nextLesson && (
                <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[8px] bg-blue-500 text-white font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Recommended Next Lesson (ဆက်လက်သင်ယူရန်)
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      {recommendations.nextLesson.lesson.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {recommendations.nextLesson.lesson.whatIsIt || "ဒီသင်ခန်းစာကို လေ့လာပြီး သင့်ကျွမ်းကျင်မှုကို နောက်တစ်ဆင့် တက်လှမ်းပါဗျာ။"}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-blue-500 block">
                      Course: {recommendations.nextLesson.course.title} ({recommendations.nextLesson.lesson.duration})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (recommendations.nextLesson) {
                        setSelectedCourse(recommendations.nextLesson.course, recommendations.nextLesson.lessonIdx);
                      }
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>လေ့လာမှု စတင်ရန်</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Box B: REVISION SUGGESTED LESSONS */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between text-left space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-amber-500 text-white font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Revision Recommendation (ပြန်လည်လေ့ကျင့်ရန်)
                  </span>
                  {recommendations.revisionLessons.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {recommendations.revisionLessons.map((rev, i) => (
                        <div key={rev.lesson.id} className="border-b border-amber-500/10 pb-2 last:border-0 last:pb-0">
                          <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{rev.lesson.title}</h5>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{rev.course.title}</span>
                          <button
                            onClick={() => setSelectedCourse(rev.course, rev.lessonIdx)}
                            className="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1 hover:underline"
                          >
                            <span>စာပြန်ဖတ်ရန်</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">ပြန်လည်လေ့ကျင့်ရန် အကြံပြုချက်မရှိသေးပါ။ အလွန်တော်ပါတယ်!</p>
                  )}
                </div>

                <div className="text-[10px] text-amber-500 font-mono">
                  💡 Quiz တွင် ၈၀% အောက်ရရှိသော သင်ခန်းစာများ ဤနေရာ၌ အလိုအလျောက်ပေါ်လာမည်ဖြစ်ပါသည်။
                </div>
              </div>
            </div>

            {/* Sub-grid of other personalized categories: Practice Exercises, Mini Projects, Coding Challenges, Career Roadmaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Practice Exercises (လေ့ကျင့်ခန်းများ)</span>
                </div>
                <p className="text-[10px] text-slate-400">သင်လေ့လာထားသော Variables များနှင့် Conditions များကို အခြေခံသည့် design patterns များ ရေးသားလေ့ကျင့်ရန်</p>
                <button
                  onClick={() => setCurrentTab("courses")}
                  className="text-[10px] text-blue-500 font-bold hover:underline"
                >
                  Go to exercises →
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💻</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Mini Projects (ပရောဂျက်ငယ်များ)</span>
                </div>
                <p className="text-[10px] text-slate-400">လေ့လာပြီးသား syntax များကို အသုံးချပြီး BMI calculator, Payroll Database, Profile generator ပရောဂျက်ငယ်များ တည်ဆောက်ခြင်း</p>
                <button
                  onClick={() => setCurrentTab("projects")}
                  className="text-[10px] text-blue-500 font-bold hover:underline"
                >
                  Build project →
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚡</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Coding Challenges (စိန်ခေါ်မှုများ)</span>
                </div>
                <p className="text-[10px] text-slate-400">သင့်ရဲ့ algorithmic thinking ကောင်းမွန်စေဖို့အတွက် အချိန်တိုအတွင်း logic ဖြေရှင်းရမည့် coding challenges များ</p>
                <button
                  onClick={() => setCurrentTab("courses")}
                  className="text-[10px] text-blue-500 font-bold hover:underline"
                >
                  Start challenge →
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗺️</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Career Roadmaps (အလုပ်အကိုင်တက်လမ်း)</span>
                </div>
                <p className="text-[10px] text-slate-400">ကျွမ်းကျင်သော developer တစ်ဦးဖြစ်လာစေရန် ရေးဆွဲထားသော စနစ်တကျ သင်ယူမှုလမ်းပြမြေပုံများ</p>
                <button
                  onClick={() => setCurrentTab("roadmaps")}
                  className="text-[10px] text-blue-500 font-bold hover:underline"
                >
                  View Roadmaps →
                </button>
              </div>
            </div>
          </div>

          {/* 3. WEAK & STRONG TOPIC DETECTION PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Weak Topic Detection Box */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-[8px] uppercase font-mono font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                  Topic Detection
                </span>
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white mt-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>ထပ်မံလေ့ကျင့်ရန် ခေါင်းစဉ်များ (Weak Topics)</span>
                </h4>
              </div>

              <div className="space-y-3">
                {weakTopics.map((wt, i) => (
                  <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                    <h5 className="font-bold text-xs text-red-700 dark:text-red-400">{wt.topic}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">{wt.reason}</p>
                    <button
                      onClick={() => {
                        const targetCourse = courses.find(c => c.id === wt.courseId) || courses[0];
                        setSelectedCourse(targetCourse, 0);
                      }}
                      className="text-[10px] font-bold text-red-500 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>လေ့ကျင့်ခန်းယူရန်</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Topic Detection Box */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-[8px] uppercase font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Topic Detection
                </span>
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white mt-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>ကျွမ်းကျင်မှုရှိသော ခေါင်းစဉ်များ (Strong Topics)</span>
                </h4>
              </div>

              <div className="space-y-3">
                {strongTopics.map((st, i) => (
                  <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                    <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400">{st.topic}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">{st.reason}</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[9px] font-semibold">
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">
                        ✓ Advanced Lessons Recommended
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-sans">
                        ✓ Advanced Projects Unlocked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Smart Study Plan Generator & Access Controls */}
        <div className="space-y-8">
          
          {/* A. SMART STUDY PLAN GENERATOR (With elegant Premium block/unlock simulation) */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md relative overflow-hidden text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>AI စမတ်လေ့လာမှုဇယား (Smart Study Plan)</span>
              </h3>
              <p className="text-[10px] text-slate-400">သင်လေ့လာလိုသည့် ရည်မှန်းချက်၊ လေ့လာနိုင်ချိန်များဖြင့် တွက်ချက်ထားသော စနစ်တကျ ပြက္ခဒိန်</p>
            </div>

            {/* Core Settings Inputs */}
            <div className="space-y-4 text-xs">
              
              {/* Goal dropdown */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">လေ့လာမည့် ရည်မှန်းချက်ပန်းတိုင် (Learning Goal)</label>
                <select
                  value={targetCareer}
                  onChange={(e) => {
                    setTargetCareer(e.target.value);
                    setStudyPlanGenerated(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs dark:text-white"
                >
                  <option value="frontend">Frontend Web Developer (HTML, CSS, Git)</option>
                  <option value="python_engineer">Python Software Engineer (Python basics)</option>
                  <option value="fullstack">Full-Stack Web Creator (HTML + Python + Firebase)</option>
                  <option value="mobile_app">Mobile App Developer (Kotlin essentials)</option>
                </select>
              </div>

              {/* Study Time slider/select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[9px] flex justify-between">
                  <span>နေ့စဉ်ပေးနိုင်သည့် လေ့လာချိန် (Daily Study Time)</span>
                  <span className="text-blue-500 font-extrabold font-mono">{dailyTimeGoal} mins/day</span>
                </label>
                <select
                  value={dailyTimeGoal}
                  onChange={(e) => {
                    setDailyTimeGoal(parseInt(e.target.value));
                    setStudyPlanGenerated(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs dark:text-white"
                >
                  <option value="15">၁၅ မိနစ် (Casual - 15 mins)</option>
                  <option value="30">နာရီဝက် (Balanced - 30 mins)</option>
                  <option value="60">၁ နာရီ (Serious - 60 mins)</option>
                  <option value="120">၂ နာရီ (Intense - 120 mins)</option>
                </select>
              </div>

              {/* Generate CTA */}
              <button
                onClick={handleGenerateStudyPlan}
                disabled={isGeneratingPlan}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-indigo-500/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPlan ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ဇယားတွက်ချက်နေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Study Plan တွက်မည်</span>
                  </>
                )}
              </button>
            </div>

            {/* FREE TIER LOCKED OVERLAY (Access Control Check) */}
            {!isSimulatingPremium && (
              <div className="absolute inset-0 bg-white/90 dark:bg-[#1E293B]/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Advanced AI Study Planner</h4>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs leading-relaxed">
                  စိတ်ကြိုက် AI study plan ဇယားများ၊ ရက်အလိုက် အတန်းချိန်ညှိမှုများနှင့် အသေးစိတ်လမ်းညွှန်ချက်များကို လော့ခ်ဖွင့်ရန် Premium အဆင့်မြှင့်တင်ရန် လိုအပ်ပါသည်။
                </p>
                <button
                  onClick={togglePremiumSimulation}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-[10px] rounded-xl shadow-md cursor-pointer"
                >
                  👑 Unpack Premium Features Instantly
                </button>
              </div>
            )}

            {/* Generated Plan Output (Only visible if simulated/actual premium & clicked) */}
            {isSimulatingPremium && studyPlanGenerated && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 space-y-1">
                  <span className="text-[8px] text-indigo-500 font-extrabold uppercase font-mono tracking-wider">Estimated Goal Completion</span>
                  <h5 className="text-sm font-extrabold text-indigo-950 dark:text-white font-mono">{activeSchedule.completionDate}</h5>
                  <p className="text-[10px] text-slate-400">Total Duration: {activeSchedule.weeksCount} Weeks Study Program</p>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">Weekly Milestones (အပတ်စဉ် အကောင်အထည်ဖော်မှု)</span>
                  
                  <div className="space-y-3.5 relative border-l border-slate-200 dark:border-slate-800 ml-2 pl-4">
                    {activeSchedule.milestones.map((m, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#1E293B]" />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-blue-500">{m.week} ({m.duration})</span>
                          <h6 className="text-xs font-bold text-slate-800 dark:text-white">{m.topic}</h6>
                          <p className="text-[10px] text-slate-400 leading-normal">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] bg-slate-50 dark:bg-slate-900/40 p-2.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 leading-relaxed font-sans">
                  📝 သင်လေ့လာပြီးမြောက်သည့် သင်ခန်းစာများအပေါ် မူတည်ပြီး သင့်ဇယားမှာ အလိုအလျောက် ပြောင်းလဲညှိနှိုင်းသွားမည်ဖြစ်ပါသည်။
                </div>
              </div>
            )}

            {isSimulatingPremium && !studyPlanGenerated && (
              <div className="text-center py-8 text-slate-500">
                <Compass className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs">ရည်မှန်းချက်နှင့် လေ့လာနိုင်ချိန် ရွေးချယ်ပြီး "Personalized Study Plan တွက်မည်" ကို နှိပ်ပါဗျာ။</p>
              </div>
            )}
          </div>

          {/* B. PROGRESS INSIGHTS (Skill Growth SVG chart) */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md text-left relative overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>ကျွမ်းကျင်မှု တိုးတက်မှု (Skill Growth Insights)</span>
              </h3>
              <p className="text-[10px] text-slate-400">လေ့လာခဲ့သည့် ဘာသာရပ်အလိုက် ကျွမ်းကျင်မှု ရာခိုင်နှုန်းဆန်းစစ်ချက်</p>
            </div>

            {/* PREMIUM BLOCK FOR GRAPHS */}
            {!isSimulatingPremium && (
              <div className="absolute inset-0 bg-white/90 dark:bg-[#1E293B]/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Detailed Skill Growth Charts</h4>
                <p className="text-[10px] text-slate-400 mt-2 max-w-xs leading-relaxed">
                  အပတ်စဉ်/လစဉ် လေ့လာမှုအချိန်များ၊ ဘာသာရပ်အလိုက် တိုးတက်မှု graphs များနှင့် analytics dashboard အပြည့်အစုံကို ကြည့်ရှုရန် Premium လိုအပ်ပါသည်။
                </p>
              </div>
            )}

            {/* Custom SVG Skills Bar Chart */}
            {isSimulatingPremium && (
              <div className="space-y-4">
                
                {/* Visual Skill Indicators */}
                <div className="space-y-3 text-xs">
                  {[
                    { label: "HTML5 & CSS3 Web Layouts", val: Math.min(100, 30 + completedLessonsCount * 12), color: "bg-orange-500" },
                    { label: "Python Logic & Conditions", val: Math.min(100, 20 + completedLessonsCount * 10), color: "bg-blue-500" },
                    { label: "Git & Version Control", val: Math.min(100, 15 + completedLessonsCount * 8), color: "bg-purple-500" },
                    { label: "Database (Firestore/SQL)", val: Math.min(100, 10 + completedLessonsCount * 5), color: "bg-emerald-500" },
                    { label: "Kotlin OOP Classes", val: Math.min(100, 5 + completedLessonsCount * 3), color: "bg-amber-500" }
                  ].map((sk, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                        <span>{sk.label}</span>
                        <span className="font-mono">{sk.val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${sk.color} rounded-full transition-all duration-700`} style={{ width: `${sk.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested Next Steps */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">Suggested Next Steps</span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <p className="text-[10px]">CSS Flexbox Layout and styling properties များကို အချိန်ပိုပေးလေ့ကျင့်ပါ။</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <p className="text-[10px]">Python logical expressions logic code များကို BMI project တွင် စမ်းသပ်ရေးသားပါ။</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CORE ADMIN CONFIGURATION PANEL (Admin Management Settings) */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-left space-y-4">
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="w-full flex items-center justify-between font-display font-extrabold text-sm text-slate-900 dark:text-white cursor-pointer hover:opacity-85"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500 animate-spin" />
            <span>⚙️ AI Adaptive Logic: အုပ်ချုပ်သူများအတွက် စီမံခန့်ခွဲမှု (Admin Settings)</span>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl text-slate-500">
            {showAdminPanel ? "Hide Controls ▲" : "Show Controls ▼"}
          </span>
        </button>

        {showAdminPanel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            
            {/* 1. Recommendation Rules */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">ခေါင်းစဉ်အကြံပြုမှုနည်းလမ်း (Recommendation Rule)</label>
              <select
                value={adminSettings.ruleMode}
                onChange={(e) => setAdminSettings({ ...adminSettings, ruleMode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="strict">တင်းကျပ်သောPrerequisites (Strict Locked Path)</option>
                <option value="balanced">မျှတသော AI လမ်းပြမှု (Balanced Exploration)</option>
                <option value="open">လွတ်လပ်စွာလေ့လာမှု (Fully Exploratory)</option>
              </select>
              <p className="text-[10px] text-slate-400">Strict mode သည် Prerequisites များကိုမဖြစ်မနေ locks ထားပြီး balanced ကတော့ လိုအပ်ချက်အလိုက် လမ်းကြောင်းညွှန်ပေးပါသည်။</p>
            </div>

            {/* 2. Difficulty Thresholds */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">ကျရှုံးမှုသတ်မှတ်ချက် (Difficulty Threshold)</label>
              <select
                value={adminSettings.difficultyThreshold}
                onChange={(e) => setAdminSettings({ ...adminSettings, difficultyThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="70">၇၀ ရာခိုင်နှုန်း (Easy Path - 70% Quiz score)</option>
                <option value="80">၈၀ ရာခိုင်နှုန်း (Standard Path - 80% Quiz score)</option>
                <option value="90">၉၀ ရာခိုင်နှုန်း (Mastery Path - 90% Quiz score)</option>
              </select>
              <p className="text-[10px] text-slate-400">သတ်မှတ်ချက်အောက် ရမှတ်နည်းသော ခေါင်းစဉ်များကို Weak Areas အဖြစ် သတ်မှတ်ပြီး revision အကြံပြုပါမည်။</p>
            </div>

            {/* 3. XP Weighting multiplier */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">လေ့လာမှု အပိုဆုမြှင့်တင်မှု (XP Weight Multiplier)</label>
              <select
                value={adminSettings.weeklyXpWeight}
                onChange={(e) => setAdminSettings({ ...adminSettings, weeklyXpWeight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">1.0x (Standard Learning Weights)</option>
                <option value="1.5">1.5x (Accelerated Learning Boost)</option>
                <option value="2">2.0x (Double Rewards Weekend Event)</option>
              </select>
              <p className="text-[10px] text-slate-400">အုပ်ချုပ်သူများမှ သတ်မှတ်ထားသော multiplier သည် active tasks များပြီးမြောက်ရာတွင် xp ရရှိမှုကိုမြှင့်တင်ပေးပါသည်။</p>
            </div>
          </div>
        )}
      </div>

      {/* FUTURE EXPANSION BLOCK */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 text-left text-xs text-slate-500">
        <h5 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
          <span>🚀 Future Development Goals (လာမည့် အစီအစဉ်သစ်များ)</span>
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[10px] text-center font-mono font-bold">
          <div className="p-2 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-lg">📊 AI Weekly Reports</div>
          <div className="p-2 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-lg">📅 Study Calendar</div>
          <div className="p-2 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-lg">🎯 Goal Reminders</div>
          <div className="p-2 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-lg">🔔 Notifications</div>
          <div className="p-2 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-lg">🎓 Career Score</div>
        </div>
      </div>

      {/* AI LIMITATIONS DISCLAIMER */}
      <div className="bg-amber-500/5 border border-dashed border-amber-500/25 rounded-2xl p-4.5 flex items-start gap-3.5 text-left">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-extrabold text-amber-800 dark:text-amber-400">AI နည်းပညာနှင့် လေ့လာမှုကန့်သတ်ချက် သတိပေးချက် (AI Disclaimer)</h5>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            AI recommendations are calculated strictly based on your local and cloud study activities (lesson scroll positions, quiz history, and completed badges). Students remain completely free to select, explore, and access any unlocked lesson on the platform at any time without being strictly restricted to the recommended plan.
          </p>
        </div>
      </div>
    </div>
  );
}
