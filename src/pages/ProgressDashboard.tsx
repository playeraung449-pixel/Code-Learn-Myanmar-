import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Search, 
  TrendingUp, 
  History, 
  Plus, 
  BookMarked,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FileText,
  Activity,
  User,
  Heart,
  Lightbulb,
  X,
  RefreshCw,
  Zap,
  Crown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Flame,
  Shield,
  ShieldCheck,
  RotateCcw,
  Palette
} from "lucide-react";
import { Course, Lesson, UserProfile, getLevelData, PaymentSettings } from "../types";
import { COURSES as COURSES_STATIC } from "../courses/data";
import KiboMascot from "../components/KiboMascot";
import AdaptiveLearning from "../components/AdaptiveLearning";
import { PersonalNotesAndBookmarks } from "../components/PersonalNotesAndBookmarks";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { 
  initAndCheckResets,
  updateGamificationProgress,
  checkAndUnlockBadges,
  checkAndUnlockFrames,
  getFrameLabel,
  getFrameClasses,
  getEffectLabel,
  getRandomKiboCelebration,
  getReputationLevel,
  DEFAULT_DAILY_MISSIONS,
  DEFAULT_WEEKLY_CHALLENGES,
  DEFAULT_MONTHLY_CHALLENGES
} from "../utils/gamification";
import { 
  ExtendedUserProfile, 
  RichBookmark, 
  ActivityHistory, 
  QuizResult, 
  LearningGoal, 
  StudyTimeStats,
  getOrCreateStats,
  getOrCreateGoals,
  addHistoryEntry,
  toggleRichBookmark
} from "../utils/progress";

interface ProgressDashboardProps {
  user: ExtendedUserProfile;
  onUpdateUser: (updatedUser: ExtendedUserProfile) => void;
  setCurrentTab: (tab: string) => void;
  setSelectedCourse: (course: Course, lessonIdx: number) => void;
  courses?: Course[];
  onOpenCheckIn?: () => void;
  activeSettings?: PaymentSettings | null;
}

export default function ProgressDashboard({ 
  user, 
  onUpdateUser, 
  setCurrentTab, 
  setSelectedCourse,
  courses,
  onOpenCheckIn,
  activeSettings
}: ProgressDashboardProps) {
  const COURSES = courses || COURSES_STATIC;
  const isPremiumUser = user.role === "premium" || user.role === "teacher" || user.role === "admin" || (user as any).isPremium === true;
  // Navigation internal state inside Dashboard
  const [activeDashboardSection, setActiveDashboardSection] = useState<"overview" | "adaptive" | "history" | "bookmarks" | "goals" | "calendar" | "leaderboard">("overview");

  // Sync state indication
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "offline" | "syncing">("synced");

  // Bookmarks Search
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [bookmarkCategory, setBookmarkCategory] = useState<"all" | "lesson" | "project" | "article">("all");

  // History Search
  const [historySearch, setHistorySearch] = useState("");

  // New Goal Form
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(1);
  const [newGoalUnit, setNewGoalUnit] = useState("Lessons");

  // Current calendar navigation
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Simulate automatic sync behavior
  useEffect(() => {
    const handleOnline = () => setSyncStatus("synced");
    const handleOffline = () => setSyncStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setSyncStatus("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check and reset daily/weekly/monthly mission states
  useEffect(() => {
    if (user && user.uid) {
      const { updatedUser, resetOccurred } = initAndCheckResets(user);
      if (resetOccurred) {
        onUpdateUser(updatedUser);
      }
    }
  }, [user?.uid]);

  // States for sub-tab routing and dynamic gamification UI
  const [overviewSubTab, setOverviewSubTab] = useState<"missions" | "stats" | "cosmetics">("missions");
  const [kiboToast, setKiboToast] = useState<{ message: string; visible: boolean } | null>(null);
  
  // Enhanced Leaderboard States
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<"daily" | "weekly" | "monthly" | "all_time">("weekly");
  const [leaderboardCategory, setLeaderboardCategory] = useState<"xp" | "lessons" | "courses" | "streak" | "quizzes" | "reputation">("xp");
  const [leaderboardScope, setLeaderboardScope] = useState<"global" | "course" | "community">("global");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [showAdminLeaderboardModal, setShowAdminLeaderboardModal] = useState(false);
  const [adminLeaderboardStatusMsg, setAdminLeaderboardStatusMsg] = useState<string | null>(null);

  // Show floating toast from Kibo
  const showKiboToast = (message: string) => {
    setKiboToast({ message, visible: true });
    setTimeout(() => {
      setKiboToast(prev => prev ? { ...prev, visible: false } : null);
    }, 4500);
  };

  // Claim mission/challenge reward
  const handleClaimMissionReward = (missionId: string, listType: "daily" | "weekly" | "monthly") => {
    let updatedUser = { ...user };
    let rewardXp = 0;
    let rewardCoins = 0;
    let missionTitle = "";

    // Safely parse states
    const dailyState = updatedUser.dailyMissionsState ? { ...updatedUser.dailyMissionsState } : {};
    const weeklyState = updatedUser.weeklyChallengesState ? { ...updatedUser.weeklyChallengesState } : {};
    const monthlyState = updatedUser.monthlyChallengesState ? { ...updatedUser.monthlyChallengesState } : {};

    if (listType === "daily" && dailyState[missionId]) {
      const m = { ...dailyState[missionId] };
      if (m.progress >= m.target && !m.claimed) {
        m.claimed = true;
        dailyState[missionId] = m;
        updatedUser.dailyMissionsState = dailyState;
        rewardXp = m.xpReward;
        rewardCoins = m.coinsReward;
        missionTitle = m.title;
      }
    } else if (listType === "weekly" && weeklyState[missionId]) {
      const m = { ...weeklyState[missionId] };
      if (m.progress >= m.target && !m.claimed) {
        m.claimed = true;
        weeklyState[missionId] = m;
        updatedUser.weeklyChallengesState = weeklyState;
        rewardXp = m.xpReward;
        rewardCoins = m.coinsReward;
        missionTitle = m.title;
      }
    } else if (listType === "monthly" && monthlyState[missionId]) {
      const m = { ...monthlyState[missionId] };
      if (m.progress >= m.target && !m.claimed) {
        m.claimed = true;
        monthlyState[missionId] = m;
        updatedUser.monthlyChallengesState = monthlyState;
        rewardXp = m.xpReward;
        rewardCoins = m.coinsReward;
        missionTitle = m.title;
      }
    }

    if (rewardXp > 0 || rewardCoins > 0) {
      // Award XP and coins safely
      const finalXp = (updatedUser.xp || 0) + rewardXp;
      const finalCoins = (updatedUser.coins || 0) + rewardCoins;
      
      // Calculate level boundary check
      const baseXP = 300;
      const multiplier = 1.4;
      let tempXp = finalXp;
      let lvl = 1;
      let requiredForNext = baseXP;
      while (tempXp >= requiredForNext) {
        tempXp -= requiredForNext;
        lvl++;
        requiredForNext = Math.round(requiredForNext * multiplier);
      }

      updatedUser.xp = finalXp;
      updatedUser.level = lvl;
      updatedUser.coins = finalCoins;

      // Add achievements if they hit milestones
      const ach = checkAndUnlockBadges(updatedUser);
      updatedUser.achievements = ach.updatedUser.achievements;

      // Add audit history log entry
      if (updatedUser.recentHistory) {
        updatedUser.recentHistory.unshift({
          id: `hist-claim-${Date.now()}`,
          type: "quiz_pass", // using standard type
          title: `Mission Reward Claimed`,
          details: `"${missionTitle}" မစ်ရှင်အတွက် +${rewardXp} XP နှင့် +${rewardCoins} Coins ရယူပြီးပါပြီ။`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      onUpdateUser(updatedUser);
      triggerSyncAnimation();
      
      // Custom celebratory toast
      showKiboToast(`🎉 "${missionTitle}" မစ်ရှင် အောင်မြင်စွာပြီးဆုံး! +${rewardXp} XP နှင့် +${rewardCoins} Coins ဆုလာဘ်များကို သင့်အကောင့်ထဲ ထည့်သွင်းပေးလိုက်ပါပြီဗျာ!`);
    }
  };

  // Sync animation trigger on updates
  const triggerSyncAnimation = () => {
    setIsSyncing(true);
    setSyncStatus("syncing");
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(navigator.onLine ? "synced" : "offline");
    }, 1000);
  };

  // Helper stats extraction
  const stats = getOrCreateStats(user);
  const goals = getOrCreateGoals(user);
  const historyList = user.recentHistory || [];

  // Active or last started course
  const currentCourse = COURSES.find(c => c.id === user.currentCourseId) || COURSES[0];
  const currentLesson = currentCourse.lessons.find(l => l.id === user.currentLessonId) || currentCourse.lessons[0];

  // Estimated Course Progress
  const completedLessonsInCourse = currentCourse.lessons.filter(l => user.completedLessons?.includes(l.id));
  const courseProgressPercent = Math.round((completedLessonsInCourse.length / currentCourse.lessons.length) * 100);

  // Platform overall learning progress
  const totalLessonsInPlatform = COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
  const platformLessonsProgress = Math.round(((user.completedLessons?.length || 0) / totalLessonsInPlatform) * 100);
  const platformCoursesProgress = Math.round(((user.completedCourses?.length || 0) / COURSES.length) * 100);
  
  // Quiz statistics
  const totalQuizzesPassed = user.quizResults?.filter(r => r.passed).length || stats.quizzesPassedCount;
  const overallLearningPercent = Math.round(
    (platformLessonsProgress * 0.5) + 
    (Math.min(100, (totalQuizzesPassed / 5) * 100) * 0.3) + 
    (Math.min(100, ((user.completedProjects?.length || 0) / 3) * 100) * 0.2)
  );

  // Continue Learning estimated remaining time: 30 minutes average per unfinished lesson
  const remainingLessons = currentCourse.lessons.filter(l => !user.completedLessons?.includes(l.id));
  const estimatedRemainingMinutes = remainingLessons.length * 30;
  const formattedRemainingTime = estimatedRemainingMinutes > 60 
    ? `${Math.floor(estimatedRemainingMinutes / 60)}h ${estimatedRemainingMinutes % 60}m` 
    : `${estimatedRemainingMinutes} mins`;

  // Bookmarks items filtering
  const allBookmarks: RichBookmark[] = user.richBookmarks || (user.bookmarks || []).map(bId => {
    // Fallback translation if rich bookmarks are empty
    let foundTitle = bId;
    let foundCat: RichBookmark["category"] = "lesson";
    for (const c of COURSES) {
      const les = c.lessons.find(l => l.id === bId);
      if (les) {
        foundTitle = `${c.title} - ${les.title}`;
        foundCat = "lesson";
        break;
      }
    }
    return {
      id: bId,
      category: foundCat,
      title: foundTitle,
      date: new Date().toLocaleDateString()
    };
  });

  const filteredBookmarks = allBookmarks.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
                          b.category.toLowerCase().includes(bookmarkSearch.toLowerCase());
    const matchesCat = bookmarkCategory === "all" || b.category === bookmarkCategory;
    return matchesSearch && matchesCat;
  });

  // History Filtering
  const filteredHistory = historyList.filter(h => 
    h.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.details.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.type.toLowerCase().includes(historySearch.toLowerCase())
  );

  // Smart Recommendations Engine
  const getSmartRecommendations = (): Lesson[] => {
    const recommended: Lesson[] = [];
    const weakQuizLessonIds: string[] = [];

    // Analyze weak quiz areas (score < 70% or failed)
    if (user.quizResults) {
      user.quizResults.forEach(r => {
        if (!r.passed || (r.score / r.totalQuestions) < 0.7) {
          // Find which lesson corresponds to this quizId
          for (const c of COURSES) {
            const matchedLesson = c.lessons.find(l => l.quiz.some(q => q.id === r.quizId) || l.id === r.quizId);
            if (matchedLesson && !weakQuizLessonIds.includes(matchedLesson.id)) {
              weakQuizLessonIds.push(matchedLesson.id);
            }
          }
        }
      });
    }

    // First Priority: Add lessons from weak quiz areas
    for (const c of COURSES) {
      for (const l of c.lessons) {
        if (weakQuizLessonIds.includes(l.id) && !user.completedLessons?.includes(l.id)) {
          recommended.push(l);
        }
      }
    }

    // Second Priority: Unfinished lessons from current active course
    if (recommended.length < 3) {
      const unfinishedInActive = currentCourse.lessons.filter(l => !user.completedLessons?.includes(l.id));
      unfinishedInActive.forEach(l => {
        if (!recommended.some(r => r.id === l.id)) {
          recommended.push(l);
        }
      });
    }

    // Third Priority: Lessons from courses matching the student's current level
    if (recommended.length < 3) {
      COURSES.forEach(c => {
        const difficultyMatch = user.level >= 4 ? "Intermediate" : "Beginner";
        if (c.difficulty.includes(difficultyMatch) || c.id !== currentCourse.id) {
          c.lessons.forEach(l => {
            if (!user.completedLessons?.includes(l.id) && !recommended.some(r => r.id === l.id)) {
              recommended.push(l);
            }
          });
        }
      });
    }

    return recommended.slice(0, 3);
  };

  const recommendedLessons = getSmartRecommendations();

  // Handle Remove Bookmark
  const handleRemoveBookmark = (bId: string) => {
    const updated = toggleRichBookmark(user, bId, "lesson", "");
    onUpdateUser(updated);
    triggerSyncAnimation();
  };

  // Add custom goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: LearningGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      targetValue: newGoalTarget,
      currentValue: 0,
      remainingValue: newGoalTarget,
      unit: newGoalUnit
    };

    const currentGoals = user.learningGoals || getOrCreateGoals(user);
    const updatedUser = {
      ...user,
      learningGoals: [...currentGoals, newGoal]
    };

    onUpdateUser(updatedUser);
    setShowGoalModal(false);
    setNewGoalTitle("");
    setNewGoalTarget(1);
    setNewGoalUnit("Lessons");
    triggerSyncAnimation();
  };

  // Quick action to complete a goal milestone (e.g. log manual study or check items)
  const handleProgressGoal = (goalId: string, increment: number) => {
    const currentGoals = user.learningGoals || getOrCreateGoals(user);
    const updatedGoals = currentGoals.map(g => {
      if (g.id === goalId) {
        const newVal = Math.min(g.targetValue, g.currentValue + increment);
        return {
          ...g,
          currentValue: newVal,
          remainingValue: Math.max(0, g.targetValue - newVal)
        };
      }
      return g;
    });

    onUpdateUser({
      ...user,
      learningGoals: updatedGoals
    });
    triggerSyncAnimation();
  };

  // Calendar calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { startDay, totalDays };
  };

  const { startDay, totalDays } = getDaysInMonth(calendarDate);
  const calendarDaysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyDaysPrefix = Array.from({ length: startDay === 0 ? 6 : startDay - 1 }, (_, i) => null); // starting on Monday model

  // Match calendar learning days based on stats.completedDates
  const studyDates = stats.completedDates || [];
  const isLearningDay = (dayNum: number) => {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayNum);
    const dStr = d.toLocaleDateString();
    return studyDates.includes(dStr);
  };

  const learningDaysInMonthCount = calendarDaysArray.filter(isLearningDay).length;
  const missedDaysInMonthCount = Math.max(0, new Date().getDate() - learningDaysInMonthCount);

  // Month navigation helpers
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800 dark:text-slate-200">
      
      {/* Header and Sync bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
              လေ့လာမှုတက်လမ်း မှတ်တမ်းစင်တာ
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            သင့်ရဲ့ နေ့စဉ်တက်ရောက်မှု၊ အမှတ်တရမှတ်စုများနှင့် ရမှတ်များကို အချိန်နှင့်တပြေးညီ စောင့်ကြည့်ပါ။
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center space-x-3 self-start md:self-center">
          <div className={`flex items-center space-x-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full border transition-all ${
            syncStatus === "synced" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : syncStatus === "syncing"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              syncStatus === "synced" ? "bg-emerald-500" : syncStatus === "syncing" ? "bg-blue-500 animate-spin" : "bg-rose-500 animate-pulse"
            }`} />
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            <span>
              {syncStatus === "synced" && "Cloud Synced (Firebase Connected)"}
              {syncStatus === "syncing" && "Syncing progress..."}
              {syncStatus === "offline" && "Offline Mode (Local Storage Protected)"}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Dashboard Top Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Core Progress Score Circular visualizer */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-120 transition-transform" />
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider mb-4">Overall Learning %</h3>
          
          {/* SVG Circular Progress Chart */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="url(#blue-grad)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * overallLearningPercent) / 100} className="text-blue-500 transition-all duration-1000 ease-out" fill="transparent" strokeLinecap="round" />
              <defs>
                <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{overallLearningPercent}%</span>
              <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Learnt</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
            Lessons, project tasks & passed quizzes score combination.
          </p>
        </div>

        {/* Course Completion Meter */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Course Completion</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{platformCoursesProgress}%</h2>
            <p className="text-xs text-slate-400 mt-1">မြန်မာလို ရေးဆွဲထားသော သင်ရိုးညွှန်းတမ်းအားလုံး၏ ပြီးစီးမှုအခြေအနေ</p>
          </div>
          <div className="space-y-1.5 pt-4">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Courses Done</span>
              <span>{user.completedCourses?.length || 0} / {COURSES.length} Courses</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${platformCoursesProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Lesson Completion Meter */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Lesson Completion</span>
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{platformLessonsProgress}%</h2>
            <p className="text-xs text-slate-400 mt-1">သင်ခန်းစာ တစ်ခုချင်းစီ ဖတ်ရှုလေ့လာပြီးမြောက်မှု ရာခိုင်နှုန်း</p>
          </div>
          <div className="space-y-1.5 pt-4">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Lessons Done</span>
              <span>{user.completedLessons?.length || 0} / {totalLessonsInPlatform} Lessons</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${platformLessonsProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Study Goal Ring Meter */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">Current Streak</span>
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{user.learningStreak || 1} Days</h2>
            <p className="text-xs text-slate-400 mt-1">ဆက်တိုက် လေ့လာမှု အဆက်မပြတ် ဆွဲဆန့်နိုင်ခဲ့သည့် ရက်ပေါင်းစွမ်းရည်</p>
          </div>
          <div className="pt-4 flex items-center justify-between">
            <div className="text-[10px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              {user.level >= 4 ? "Experienced Coder 🚀" : "Consistent Learner 🌱"}
            </div>
            <span className="text-[11px] font-mono text-slate-400">Streak Record: {Math.max(user.learningStreak || 1, 5)} Days</span>
          </div>
        </div>
      </section>

      {/* Daily Check-In Calendar Tracker & Rewards */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md text-left space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">နေ့စဉ် Check-in ဝင်ရောက်မှု ဇယား (Check-in Tracker)</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">လွန်ခဲ့သော ၇ ရက်တာ သင်ယူမှု မှတ်တမ်းနှင့် Streak ဆုလာဘ်များ</p>
            </div>
          </div>

          {onOpenCheckIn && (
            <button
              onClick={onOpenCheckIn}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                user.lastCheckInDate === (() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                })()
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/10"
              }`}
            >
              <span>{
                user.lastCheckInDate === (() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                })()
                  ? "ယနေ့ Check-in ဝင်ပြီးပါပြီ ✓"
                  : "Check-in ဝင်၍ ဆုလာဘ်ယူမည် 🎁"
              }</span>
            </button>
          )}
        </div>

        {/* 7-Day History Calendar Timeline */}
        <div className="grid grid-cols-7 gap-2.5">
          {(() => {
            const list = [];
            const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const isChecked = (user.checkInHistory || []).includes(dateStr);
              const isToday = i === 0;
              const dayLabel = weekdays[d.getDay()];
              const dayOfMonth = d.getDate();

              list.push({
                dateStr,
                isChecked,
                isToday,
                dayLabel,
                dayOfMonth
              });
            }

            return list.map((item) => (
              <div
                key={item.dateStr}
                className={`p-3 rounded-2xl border text-center relative flex flex-col justify-between items-center transition-all ${
                  item.isChecked
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : item.isToday
                    ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-500 animate-pulse"
                    : "bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500"
                }`}
              >
                {item.isToday && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider scale-90">
                    Today
                  </span>
                )}
                
                <span className="text-[9px] font-extrabold font-mono uppercase tracking-wider">
                  {item.dayLabel}
                </span>

                <div className="my-2.5 flex items-center justify-center">
                  {item.isChecked ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      item.isToday 
                        ? "border-indigo-500/40 bg-indigo-500/5 text-indigo-500" 
                        : "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                    } text-[10px] font-bold font-mono`}>
                      {item.dayOfMonth}
                    </div>
                  )}
                </div>

                <span className="text-[8px] font-bold font-mono block truncate max-w-full">
                  {item.isChecked ? "Checked ✓" : "Missed"}
                </span>
              </div>
            ));
          })()}
        </div>

        {/* Event Campaign Overlay for Multipliers */}
        {activeSettings?.currentEventId && activeSettings.currentEventId !== "none" && (
          <div className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center text-sm font-bold">
              🔥
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {activeSettings.currentEventTitle}
                <span className="text-[8px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                  Event Active
                </span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {activeSettings.currentEventDescription} (Daily Check-in bonus XP: +{activeSettings.currentEventBonusXpPercent}%)
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Continue Learning Card */}
      <section className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 border border-blue-500/30 rounded-2xl p-6 md:p-8 text-white text-left relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4">
            <span className="text-[10px] font-mono font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
              Continue Learning
            </span>
            <div className="space-y-1.5">
              <span className="text-xs opacity-75 font-mono">Current Course</span>
              <h2 className="font-display font-bold text-xl md:text-2xl">{currentCourse.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs mt-1.5 opacity-90">
                <span className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Next: {currentLesson.title}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Remaining: {formattedRemainingTime}</span>
                </span>
              </div>
            </div>
            
            {/* Horizontal progress bar */}
            <div className="space-y-1.5 max-w-lg">
              <div className="flex justify-between text-xs font-mono">
                <span>Course Progress</span>
                <span>{courseProgressPercent}% Completed</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${courseProgressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-start md:justify-end">
            <button
              onClick={() => {
                const nextLessonIdx = currentCourse.lessons.findIndex(l => l.id === currentLesson.id);
                setSelectedCourse(currentCourse, nextLessonIdx >= 0 ? nextLessonIdx : 0);
              }}
              className="flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-slate-100 font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>ဆက်လက်လေ့လာရန်</span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Menu inside Progress Dashboard */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: "overview", label: "Dashboard ခြုံငုံသုံးသပ်ချက်", icon: TrendingUp },
          { id: "adaptive", label: "AI Adaptive Learning (ကိုယ်ပိုင်လမ်းညွှန်)", icon: Sparkles },
          { id: "bookmarks", label: "မှတ်စုစင်တာ (Bookmarks)", icon: Bookmark },
          { id: "goals", label: "လေ့လာမှု ရည်မှန်းချက်များ", icon: Zap },
          { id: "calendar", label: "လေ့လာမှု ပြက္ခဒိန်", icon: CalendarIcon },
          { id: "history", label: "လေ့လာမှု မှတ်တမ်းအသေးစိတ် (History)", icon: History },
          { id: "leaderboard", label: "ထိပ်တန်းကျောင်းသားများ (Leaderboard)", icon: Trophy },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeDashboardSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveDashboardSection(sec.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-xs transition-all cursor-pointer ${
                isActive 
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/5 dark:bg-blue-950/5" 
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Screen Content */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: OVERVIEW SCREEN */}
        {activeDashboardSection === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Sub-Tabbed Gamification & Statistics Panel */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* Dynamic Kibo Notification Toast / Celebrations */}
              {kiboToast?.visible && (
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4.5 shadow-xl border border-blue-400/30 flex items-center gap-4.5 animate-bounce relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <KiboMascot emotion="excited" size="xs" animated={true} />
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-white/25 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      🎉 Kibo Celebration
                    </span>
                    <p className="text-xs font-semibold leading-relaxed font-sans">{kiboToast.message}</p>
                  </div>
                </div>
              )}

              {/* Sub-tab Navigation */}
              <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                {[
                  { id: "missions", label: "မစ်ရှင်များ (Missions)", icon: Zap },
                  { id: "stats", label: "လေ့လာမှုစာရင်း (Statistics)", icon: TrendingUp },
                  { id: "cosmetics", label: "ကိုယ်ရေးအလှဆင် (Customization)", icon: Palette }
                ].map((sub) => {
                  const Icon = sub.icon;
                  const isSubActive = overviewSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setOverviewSubTab(sub.id as any)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-extrabold rounded-xl cursor-pointer transition-all ${
                        isSubActive 
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/20" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-tab 1: Missions System */}
              {overviewSubTab === "missions" && (
                <div className="space-y-6">
                  {/* Daily Missions Card */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>နေ့စဉ် မစ်ရှင်များ (Daily Missions)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400">လေ့လာမှုအရှိန် မပျက်စေရန် နေ့စဉ်ပြီးမြောက်ရမည့် မစ်ရှင်များ</p>
                      </div>
                      <span className="text-[9px] font-bold font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                        Resets Daily
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {(Object.values(user.dailyMissionsState || DEFAULT_DAILY_MISSIONS) as any[]).map((m) => {
                        const isDone = m.progress >= m.target;
                        const percent = Math.min(100, Math.round((m.progress / m.target) * 100));
                        
                        return (
                          <div 
                            key={m.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                              m.claimed
                                ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-850 opacity-60"
                                : isDone
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-850"
                            }`}
                          >
                            <div className="flex-1 min-w-0 space-y-1.5 text-left">
                              <h5 className={`font-bold text-xs ${m.claimed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                                {m.title}
                              </h5>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${m.claimed ? "bg-slate-400" : isDone ? "bg-emerald-500" : "bg-blue-500"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold">{m.progress}/{m.target}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right flex flex-col items-end text-[10px] font-mono pr-1 text-slate-400">
                                <span className="text-amber-500 font-bold">+{m.xpReward} XP</span>
                                <span className="text-yellow-500">+{m.coinsReward} Coins</span>
                              </div>

                              {m.claimed ? (
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                  Claimed ✓
                                </span>
                              ) : isDone ? (
                                <button
                                  onClick={() => handleClaimMissionReward(m.id, "daily")}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all transform hover:-translate-y-0.5 animate-pulse shadow-md shadow-emerald-500/15"
                                >
                                  ဆုယူမည် 🎁
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  လေ့လာရန်
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weekly Challenges Card */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span>အပတ်စဉ် စိန်ခေါ်မှုများ (Weekly Challenges)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400">ရက်သတ္တပတ်အတွင်း ကြိုးစားရမည့် အဆင့်မြင့်ရည်မှန်းချက်များ</p>
                      </div>
                      <span className="text-[9px] font-bold font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase">
                        Weekly Limits
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {(Object.values(user.weeklyChallengesState || DEFAULT_WEEKLY_CHALLENGES) as any[]).map((m) => {
                        const isDone = m.progress >= m.target;
                        const percent = Math.min(100, Math.round((m.progress / m.target) * 100));

                        return (
                          <div 
                            key={m.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                              m.claimed
                                ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-850 opacity-60"
                                : isDone
                                ? "bg-yellow-500/5 border-yellow-500/20"
                                : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-850"
                            }`}
                          >
                            <div className="flex-1 min-w-0 space-y-1.5 text-left">
                              <h5 className={`font-bold text-xs ${m.claimed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                                {m.title}
                              </h5>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${m.claimed ? "bg-slate-400" : isDone ? "bg-yellow-500" : "bg-indigo-500"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold">{m.progress}/{m.target}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right flex flex-col items-end text-[10px] font-mono pr-1 text-slate-400">
                                <span className="text-amber-500 font-bold">+{m.xpReward} XP</span>
                                <span className="text-yellow-500">+{m.coinsReward} Coins</span>
                              </div>

                              {m.claimed ? (
                                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                  Claimed ✓
                                </span>
                              ) : isDone ? (
                                <button
                                  onClick={() => handleClaimMissionReward(m.id, "weekly")}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all transform hover:-translate-y-0.5 animate-pulse shadow-md"
                                >
                                  ဆုယူမည် 🎁
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Challenges Card */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span>လစဉ် မဟာစိန်ခေါ်မှုများ (Monthly Grand Challenges)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400">လပတ်အတွင်း ပြီးမြောက်ရမည့် အဆင့်မြင့် ဂုဏ်ထူးဆောင် မစ်ရှင်ကြီးများ</p>
                      </div>
                      <span className="text-[9px] font-bold font-mono text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">
                        Monthly
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {(Object.values((user as any).monthlyChallengesState || DEFAULT_MONTHLY_CHALLENGES) as any[]).map((m) => {
                        const isDone = m.progress >= m.target;
                        const percent = Math.min(100, Math.round((m.progress / m.target) * 100));

                        return (
                          <div 
                            key={m.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                              m.claimed
                                ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-850 opacity-60"
                                : isDone
                                ? "bg-purple-500/5 border-purple-500/20"
                                : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-850"
                            }`}
                          >
                            <div className="flex-1 min-w-0 space-y-1.5 text-left">
                              <h5 className={`font-bold text-xs ${m.claimed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                                {m.title}
                              </h5>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${m.claimed ? "bg-slate-400" : isDone ? "bg-purple-500" : "bg-pink-500"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold">{m.progress}/{m.target}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right flex flex-col items-end text-[10px] font-mono pr-1 text-slate-400">
                                <span className="text-amber-500 font-bold">+{m.xpReward} XP</span>
                                <span className="text-yellow-500">+{m.coinsReward} Coins</span>
                              </div>

                              {m.claimed ? (
                                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">
                                  Claimed ✓
                                </span>
                              ) : isDone ? (
                                <button
                                  onClick={() => handleClaimMissionReward(m.id, "monthly")}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all transform hover:-translate-y-0.5 animate-pulse shadow-md"
                                >
                                  ဆုယူမည် 🎁
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  Progress
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Statistics & Recommendations (Preserving Original Views) */}
              {overviewSubTab === "stats" && (
                <div className="space-y-6">
                  {/* Study Statistics Section */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span>နာရီအလိုက် လေ့လာမှု စာရင်းအင်းများ (Study Statistics)</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/85">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Study Time</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.totalMinutes} m</span>
                        <span className="text-[9px] text-slate-500 block mt-1">all activities time</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/85">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Quizzes Passed</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{totalQuizzesPassed} / 5</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Passed quiz cards</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/85">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Weekly Study</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.weeklyMinutes} m</span>
                        <span className="text-[9px] text-slate-500 block mt-1">current week total</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/85">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg. Quiz Score</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stats.averageQuizScore}%</span>
                        <span className="text-[9px] text-slate-500 block mt-1">overall average score</span>
                      </div>
                    </div>

                    {/* Simulated Study hours visualizer line graph */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase font-mono">လပတ် သင်ကြားမှု မိနစ် လမ်းကြောင်းသစ် (Monthly Study Time Trend)</span>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800/85 h-40 flex items-end justify-between gap-2">
                        {[
                          { label: "Week 1", val: 15 },
                          { label: "Week 2", val: Math.min(100, stats.totalMinutes * 0.4) },
                          { label: "Week 3", val: Math.min(100, stats.totalMinutes * 0.7) },
                          { label: "Week 4 (Today)", val: stats.weeklyMinutes },
                        ].map((w, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <div className="w-full bg-blue-600/10 rounded-t-lg relative flex items-end justify-center transition-all group hover:bg-blue-600/20" style={{ height: `${Math.max(10, w.val)}%` }}>
                              <span className="absolute -top-6 text-[9px] font-mono bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {Math.round(w.val)}m
                              </span>
                              <div className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-lg transition-all" style={{ height: "100%" }} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{w.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SMART RECOMMENDATIONS SECTION */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span>AI စမတ်လမ်းညွှန်ချက်များ (Smart Recommendations)</span>
                      </h3>
                      <span className="text-[10px] font-mono text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                        Personalized
                      </span>
                    </div>

                    <div className="space-y-4">
                      {recommendedLessons.map((l) => {
                        const corrCourse = COURSES.find(c => c.lessons.some(les => les.id === l.id)) || currentCourse;
                        return (
                          <div 
                            key={l.id}
                            className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:border-purple-500/30 rounded-xl flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1.5 text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-purple-500/15 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                  {(corrCourse?.title || "Lesson").split(" ")[0]} Topic
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">{l.duration} duration</span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{l.title}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{l.whatIsIt}</p>
                            </div>
                            
                            <button
                              onClick={() => {
                                const lesIdx = corrCourse.lessons.findIndex(les => les.id === l.id);
                                setSelectedCourse(corrCourse, lesIdx >= 0 ? lesIdx : 0);
                              }}
                              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all"
                            >
                              လေ့လာရန်
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Cosmetic Avatar Frames and Particle Customizer */}
              {overviewSubTab === "cosmetics" && (
                <div className="space-y-6">
                  {/* Dynamic Character Profile Preview Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                    
                    {/* Live Particle Visual Effect Overlay Render */}
                    {user.activeEffect === "sparkle" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <span 
                            key={i} 
                            className="absolute text-yellow-400/80 text-[10px] animate-pulse"
                            style={{
                              top: `${15 + i * 12}%`,
                              left: `${10 + (i * 15) % 80}%`,
                              animationDelay: `${i * 0.4}s`,
                              animationDuration: "2s"
                            }}
                          >
                            ✨
                          </span>
                        ))}
                      </div>
                    )}

                    {user.activeEffect === "gold-glow" && (
                      <div className="absolute inset-0 pointer-events-none ring-4 ring-yellow-400/30 rounded-3xl animate-pulse shadow-[inset_0_0_25px_rgba(234,179,8,0.25)]" />
                    )}

                    {user.activeEffect === "fire-flicker" && (
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-red-500/5 via-amber-500/5 to-transparent animate-pulse" />
                    )}

                    {user.activeEffect === "bubble" && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div 
                            key={i}
                            className="absolute rounded-full border border-blue-400/30 bg-blue-400/5"
                            style={{
                              width: `${6 + i * 4}px`,
                              height: `${6 + i * 4}px`,
                              bottom: "-20px",
                              left: `${15 + i * 18}%`,
                              animation: `float-up ${3 + i * 0.5}s infinite linear`,
                              animationDelay: `${i * 0.3}s`
                            }}
                          />
                        ))}
                        <style>{`
                          @keyframes float-up {
                            0% { transform: translateY(0) scale(0.8); opacity: 0; }
                            50% { opacity: 0.8; }
                            100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
                          }
                        `}</style>
                      </div>
                    )}

                    {/* Avatar with selected frame */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-22 h-22 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 ${getFrameClasses(user.activeFrame)}`}>
                        {user.photo ? (
                          <img 
                            src={user.photo} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-3xl font-bold text-white uppercase">
                            {user.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      
                      {/* Premium Crown Badge over Avatar */}
                      {isPremiumUser && (
                        <div className="absolute -top-3.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-1 rounded-full shadow-lg border border-amber-300">
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Meta info of user */}
                    <div className="text-center md:text-left space-y-2 flex-1 z-10">
                      <div className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-1.5">
                          <h4 className="text-lg font-extrabold text-white font-display">
                            {user.hideNameFromLeaderboard ? "ကျောင်းသားသစ် (Privacy Mode)" : user.name}
                          </h4>
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                            LVL {user.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium font-sans">
                          {getLevelData(user.xp).name}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start text-[10px] font-mono">
                        <span className="bg-slate-800/80 text-amber-500 px-2.5 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1 font-bold">
                          🪙 {(user.coins || 0)} Coins
                        </span>
                        <span className="bg-slate-800/80 text-yellow-500 px-2.5 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1 font-bold">
                          🔥 {user.learningStreak || 1}-Day Streak
                        </span>
                        {user.activeEffect && user.activeEffect !== "none" && (
                          <span className="bg-purple-950/40 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/20 flex items-center gap-1 font-bold">
                            ✨ Aura: {getEffectLabel(user.activeEffect)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1. Frames Upgrade Grid */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5 flex items-center justify-between">
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>အသုံးပြုနိုင်သော ပရိုဖိုင်ဘောင်များ (Profile Frames)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">စွမ်းရည်အဆင့်အလိုက် အလိုအလျောက် ပွင့်မည်</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {[
                        { id: "default", name: "Default Frame (ပုံမှန်အတိုင်း)", reqLvl: 1 },
                        { id: "bronze_ring", name: "Bronze Ring (ကြေးညိုရောင် ဘောင်)", reqLvl: 3 },
                        { id: "silver_sparkle", name: "Silver Sparkle (ငွေရောင် လျှပ်စီးဘောင်)", reqLvl: 5 },
                        { id: "golden_crown", name: "Golden Crown (ရွှေရောင် သရဖူဘောင်)", reqLvl: 7 },
                        { id: "legendary_aura", name: "Legendary Aura (ဒဏ္ဍာရီလာ အရှိန်အဝါဘောင်)", reqLvl: 9 }
                      ].map((f) => {
                        const isUnlocked = user.level >= f.reqLvl || (user.unlockedFrames || []).includes(f.id);
                        const isActive = user.activeFrame === f.id;

                        return (
                          <div 
                            key={f.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isActive 
                                ? "border-blue-500 bg-blue-500/5" 
                                : "border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 ${getFrameClasses(f.id)}`}>
                                <span className="text-xs font-bold font-mono">#{f.reqLvl}</span>
                              </div>
                              <div className="text-left space-y-0.5">
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{f.name}</h5>
                                <span className="text-[9px] text-slate-400 block font-mono">Unlock at LVL {f.reqLvl}</span>
                              </div>
                            </div>

                            {isActive ? (
                              <span className="text-[9px] bg-blue-500 text-white px-2 py-1 rounded-lg font-bold font-mono flex items-center gap-0.5">
                                Active ✓
                              </span>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => {
                                  onUpdateUser({ ...user, activeFrame: f.id });
                                  triggerSyncAnimation();
                                  showKiboToast(`👤 ပရိုဖိုင်ဘောင်အား "${f.name}" သို့ အောင်မြင်စွာ ပြောင်းလဲလိုက်ပါပြီဗျာ!`);
                                }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold rounded-lg cursor-pointer transition-all"
                              >
                                Apply
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>LVL {f.reqLvl}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Visual Particles Upgrades Grid */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5 flex items-center justify-between">
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>အထူးပြုလုပ်ချက် အရှိန်အဝါများ (Aura Particle Effects)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">စွမ်းရည်အဆင့်အလိုက် ပွင့်မည့် Aura Effects</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {[
                        { id: "none", name: "No Effect (အထူးပြုလုပ်ချက် မရှိ)", reqLvl: 1 },
                        { id: "sparkle", name: "Sparkles (ကြယ်ပွင့်လေးများ တဖျတ်ဖျတ်)", reqLvl: 4 },
                        { id: "gold-glow", name: "Golden Glow (ရွှေရောင် ရွှန်းစိုအရှိန်အဝါ)", reqLvl: 6 },
                        { id: "fire-flicker", name: "Fire Flicker (တောက်လောင်နေသော မီးလျှံ)", reqLvl: 8 },
                        { id: "bubble", name: "Bouncing Bubbles (လွင့်ပျံနေသော ရေပူပေါင်းများ)", reqLvl: 10 }
                      ].map((e) => {
                        const isUnlocked = user.level >= e.reqLvl;
                        const isActive = user.activeEffect === e.id;

                        return (
                          <div 
                            key={e.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isActive 
                                ? "border-purple-500 bg-purple-500/5" 
                                : "border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/30"
                            }`}
                          >
                            <div className="flex items-center gap-3 text-left">
                              <span className="text-xl">
                                {e.id === "none" ? "🚫" : e.id === "sparkle" ? "✨" : e.id === "gold-glow" ? "🌟" : e.id === "fire-flicker" ? "🔥" : "🫧"}
                              </span>
                              <div className="space-y-0.5">
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{e.name}</h5>
                                <span className="text-[9px] text-slate-400 block font-mono">Unlock at LVL {e.reqLvl}</span>
                              </div>
                            </div>

                            {isActive ? (
                              <span className="text-[9px] bg-purple-500 text-white px-2 py-1 rounded-lg font-bold font-mono">
                                Active ✓
                              </span>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => {
                                  onUpdateUser({ ...user, activeEffect: e.id });
                                  triggerSyncAnimation();
                                  showKiboToast(`✨ အထူးပြုလုပ်ချက် Aura အား "${e.name}" သို့ ပြောင်းလဲလိုက်ပါပြီဗျာ!`);
                                }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold rounded-lg cursor-pointer transition-all"
                              >
                                Apply
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>LVL {e.reqLvl}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Leaderboard Privacy Card */}
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5 flex items-center justify-between">
                      <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <EyeOff className="w-4 h-4 text-indigo-500" />
                        <span>ကိုယ်ရေးအချက်အလက် လုံခြုံရေး (Leaderboard Privacy Settings)</span>
                      </h4>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">ထိပ်တန်းကျောင်းသားဇယားတွင် အမည်ဝှက်ထားရန်</span>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-md">
                          ဤရွေးချယ်မှုကို အသုံးပြုပါက အခြားကျောင်းသားများ၏ ထိပ်တန်းဇယား (Leaderboard) တွင် သင့်အမည်ရင်းကို ဖော်ပြမည်မဟုတ်ဘဲ အမည်ဝှက် "ကျောင်းသားသစ် (Privacy Mode)" ဟုသာ ဖော်ပြပါမည်။
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const val = !user.hideNameFromLeaderboard;
                          onUpdateUser({ ...user, hideNameFromLeaderboard: val });
                          triggerSyncAnimation();
                          showKiboToast(
                            val 
                              ? "🔒 ကိုယ်ရေးလုံခြုံရေးအတွက် ထိပ်တန်းဇယားတွင် သင့်အမည်ရင်းကို ဝှက်ထားလိုက်ပါပြီခင်ဗျာ။" 
                              : "🔓 ထိပ်တန်းဇယားတွင် သင့်အမည်ရင်းကို ပြန်လည်ဖော်ပြလိုက်ပါပြီခင်ဗျာ။"
                          );
                        }}
                        className={`px-4 py-2 text-[10px] font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                          user.hideNameFromLeaderboard 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700/80"
                        }`}
                      >
                        {user.hideNameFromLeaderboard ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>အမည် ဝှက်ထားသည် (Anonymous On)</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>အမည် ပြသထားသည် (Anonymous Off)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Mini calendar preview & Goals overview */}
            <div className="space-y-8 text-left">
              
              {/* Daily Goals Mini-Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">ရည်မှန်းချက် တိုးတက်မှု (Active Goals)</h3>
                  <button 
                    onClick={() => setActiveDashboardSection("goals")}
                    className="text-xs text-blue-500 hover:text-blue-400 font-bold"
                  >
                    အားလုံးကြည့်ရန်
                  </button>
                </div>

                <div className="space-y-3">
                  {goals.slice(0, 3).map((g) => {
                    const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                    return (
                      <div key={g.id} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{g.title}</span>
                          <span className="font-mono text-slate-400 font-bold">{g.currentValue}/{g.targetValue} {g.unit}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kibo Premium Promotional Banner for Free Users */}
              {!isPremiumUser && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col items-center text-center space-y-4">
                    <KiboMascot 
                      emotion="excited" 
                      size="sm" 
                      animated={true}
                    />
                    <div className="space-y-1">
                      <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold px-2 py-0.5 rounded font-mono uppercase">
                        Kibo Premium Promotion
                      </span>
                      <h4 className="text-white font-bold text-sm">Kibo AI Mentor Premium</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        အကန့်အသတ်မရှိ စကားပြောရန်နှင့် အဆင့်မြင့် ကုဒ်စစ်ဆေးရေးစနစ်များ အသုံးပြုနိုင်ရန် Coins ၂၀၀ သုံးပြီး ယခုပင် Premium တက်လှမ်းလိုက်ပါ။
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab("profile")}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      Premium ရယူရန် (Coins ၂၀၀)
                    </button>
                  </div>
                </div>
              )}

              {/* Mini Calendar View Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">ပြက္ခဒိန် အစမ်းကြည့် (Calendar)</h3>
                  <button 
                    onClick={() => setActiveDashboardSection("calendar")}
                    className="text-xs text-blue-500 hover:text-blue-400 font-bold"
                  >
                    ကြည့်ရှုရန်
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>{calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
                    <span className="text-emerald-500">{learningDaysInMonthCount} Learning Days</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className="text-[9px] font-mono text-slate-500">{d}</span>
                    ))}
                    {emptyDaysPrefix.map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {calendarDaysArray.slice(0, 14).map((d) => {
                      const learned = isLearningDay(d);
                      const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth();
                      return (
                        <div 
                          key={d} 
                          className={`aspect-square flex items-center justify-center text-[10px] font-mono font-bold rounded-lg ${
                            learned 
                              ? "bg-emerald-500 text-white shadow-sm" 
                              : isToday 
                              ? "bg-blue-600/10 border border-blue-500 text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>
                  <span className="block text-center text-[9px] text-slate-400 italic">Scroll to Calendar tab for full month</span>
                </div>
              </div>

              {/* Quick bookmarks mini preview */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">မကြာသေးမီက သိမ်းထားသည်များ</h3>
                  <button 
                    onClick={() => setActiveDashboardSection("bookmarks")}
                    className="text-xs text-blue-500 hover:text-blue-400 font-bold"
                  >
                    အားလုံးကြည့်ရန်
                  </button>
                </div>

                {allBookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {allBookmarks.slice(0, 2).map((b) => (
                      <div key={b.id} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-[11px] flex justify-between items-center border border-slate-100 dark:border-slate-800">
                        <span className="truncate max-w-[160px] text-slate-700 dark:text-slate-300 font-medium">{b.title}</span>
                        <span className="text-[9px] font-mono text-slate-400">{b.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">သိမ်းထားသော အရာများ မရှိသေးပါ။</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: AI ADAPTIVE LEARNING */}
        {activeDashboardSection === "adaptive" && (
          <AdaptiveLearning
            user={user}
            onUpdateUser={onUpdateUser}
            courses={COURSES}
            setSelectedCourse={setSelectedCourse}
            setCurrentTab={setCurrentTab}
          />
        )}

        {/* TAB 2: BOOKMARKS SYSTEM */}
        {activeDashboardSection === "bookmarks" && (
          <PersonalNotesAndBookmarks
            user={user}
            allBookmarks={allBookmarks}
            filteredBookmarks={filteredBookmarks}
            bookmarkCategory={bookmarkCategory}
            setBookmarkCategory={setBookmarkCategory}
            bookmarkSearch={bookmarkSearch}
            setBookmarkSearch={setBookmarkSearch}
            handleRemoveBookmark={handleRemoveBookmark}
            setSelectedCourse={setSelectedCourse}
            setCurrentTab={setCurrentTab}
            COURSES={COURSES}
          />
        )}

        {/* TAB 3: LEARNING GOALS */}
        {activeDashboardSection === "goals" && (
          <div className="space-y-6 text-left">
            <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-amber-500" />
                    <span>သင်ကြားရေး ရည်မှန်းချက်များ (Learning Goals)</span>
                  </h3>
                  <p className="text-xs text-slate-400">သင်တန်းပြီးမြောက်ရန် သို့မဟုတ် လေ့လာချိန်သတ်မှတ်ရန် ကိုယ်ပိုင်ရည်မှန်းချက်များ သတ်မှတ်စောင့်ကြည့်ပါ။</p>
                </div>
                
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 self-start sm:self-center cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ရည်မှန်းချက်အသစ်ထည့်ရန်</span>
                </button>
              </div>

              {/* Goals Cards Display */}
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((g) => {
                    const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                    const isDone = percent >= 100;
                    return (
                      <div 
                        key={g.id}
                        className={`bg-slate-50 dark:bg-slate-900/40 border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
                          isDone ? "border-emerald-500/30" : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{g.title}</h4>
                            {isDone && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                COMPLETED 🏆
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-mono">
                              <span>ရရှိပြီးစီးမှု</span>
                              <span className="font-bold">{g.currentValue} / {g.targetValue} {g.unit}</span>
                            </div>
                            
                            {/* Progress Line */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isDone ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                                }`} 
                                style={{ width: `${percent}%` }} 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70 text-xs">
                          <span className="text-slate-400 text-[11px]">
                            {g.remainingValue > 0 ? `လိုလိုအပ်ချက်: ${g.remainingValue} ${g.unit}` : "ရည်မှန်းချက် အောင်မြင်ပါပြီ!"}
                          </span>
                          
                          {!isDone && (
                            <button
                              onClick={() => handleProgressGoal(g.id, 1)}
                              className="text-xs text-blue-500 hover:text-blue-400 font-bold flex items-center space-x-0.5 cursor-pointer"
                            >
                              <span>+ Log Progress</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  variant="no_goals"
                  primaryAction={{
                    label: "Set a Goal",
                    labelMm: "ရည်မှန်းချက်အသစ် သတ်မှတ်မည်",
                    onClick: () => setShowGoalModal(true)
                  }}
                />
              )}
            </section>
          </div>
        )}

        {/* TAB 4: LEARNING CALENDAR */}
        {activeDashboardSection === "calendar" && (
          <div className="space-y-6 text-left">
            <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-blue-500" />
                    <span>သင်ကြားရေး ပြက္ခဒိန် (Learning Calendar)</span>
                  </h3>
                  <p className="text-xs text-slate-400">လေ့လာမှု ပြုလုပ်ခဲ့သည့် ရက်များကို စိမ်းလန်းသောအရောင်ဖြင့် သတ်မှတ်ဖော်ပြပေးပါသည်။</p>
                </div>

                {/* Calendar Stats badges */}
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded text-emerald-600 dark:text-emerald-400">
                    Learning Days: {learningDaysInMonthCount}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-500">
                    Missed Days: {missedDaysInMonthCount}
                  </span>
                  <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded text-amber-600 dark:text-amber-400">
                    Longest Streak: {user.learningStreak || 1} Days
                  </span>
                </div>
              </div>

              {/* Monthly calendar structure */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                
                {/* Month navigation controls */}
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={prevMonth}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Previous Month
                  </button>
                  <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                    {calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </h2>
                  <button 
                    onClick={nextMonth}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Next Month
                  </button>
                </div>

                {/* Grid 7 days */}
                <div className="grid grid-cols-7 gap-2.5 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                    <span key={i} className="text-xs font-mono font-bold text-slate-500">{d}</span>
                  ))}
                  {emptyDaysPrefix.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-slate-100/30 dark:bg-slate-900/10 rounded-xl" />
                  ))}
                  {calendarDaysArray.map((d) => {
                    const learned = isLearningDay(d);
                    const isToday = d === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth();
                    return (
                      <div 
                        key={d} 
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl p-2 transition-all ${
                          learned 
                            ? "bg-emerald-500 text-white shadow-md font-bold scale-102" 
                            : isToday 
                            ? "bg-blue-600/10 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold"
                            : "bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-800 hover:border-slate-300 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-sm font-mono">{d}</span>
                        {learned && (
                          <span className="text-[7px] uppercase font-mono font-bold tracking-tighter mt-0.5 opacity-90">
                            LEARNT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: HISTORY TIMELINE SCREEN */}
        {activeDashboardSection === "history" && (
          <div className="space-y-6 text-left">
            <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-500" />
                    <span>မကြာသေးမီက လုပ်ဆောင်မှုများ (Latest 20 Activities)</span>
                  </h3>
                  <p className="text-xs text-slate-400">သင်ခန်းစာများ ဖတ်ရှုမှု၊ ကတ်များသိမ်းဆည်းမှုနှင့် ရမှတ်မှတ်တမ်းများကို ပြန်လှန်ကြည့်ရှုရန်</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="လုပ်ဆောင်မှုမှတ်တမ်း ရှာရန်..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-6">
                  {filteredHistory.map((h) => {
                    const isView = h.type === "lesson_view";
                    const isComplete = h.type === "lesson_complete";
                    const isQuiz = h.type === "quiz_pass" || h.type === "quiz_fail";
                    const isProj = h.type === "project_complete";
                    return (
                      <div key={h.id} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-9 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#1E293B] flex items-center justify-center ${
                          isComplete ? "bg-emerald-500" : isView ? "bg-blue-500" : isProj ? "bg-amber-500" : "bg-purple-500"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        {/* Card markup */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                            <span className="uppercase font-mono font-bold tracking-wider">
                              {h.type.replace("_", " ")}
                            </span>
                            <span className="font-mono">
                              {h.timestamp}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{h.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState 
                  variant={historySearch.trim() !== "" ? "no_search_results" : "no_history"}
                  primaryAction={historySearch.trim() !== "" ? {
                    label: "Clear Search",
                    labelMm: "ရှာဖွေမှုကို ရှင်းလင်းမည်",
                    onClick: () => setHistorySearch("")
                  } : {
                    label: "Start Learning",
                    labelMm: "သင်ခန်းစာ စတင်လေ့လာမည်",
                    onClick: () => setCurrentTab("courses")
                  }}
                />
              )}
            </section>
          </div>
        )}

        {/* TAB 6: LEADERBOARD & REPUTATION SCREEN */}
        {activeDashboardSection === "leaderboard" && (() => {
          // Calculate User's Community Reputation Details
          const repPoints = user.reputationPoints || (user.level * 18 + (user.completedLessons?.length || 0) * 5);
          const repInfo = getReputationLevel(repPoints);
          const userXp = user.xp || 0;
          const userStreak = user.learningStreak || 1;
          const userCompletedLessons = user.completedLessons?.length || 0;
          const userCompletedCourses = user.completedCourses?.length || 0;
          const userCompletedQuizzes = user.completedQuizzes?.length || 0;

          // Mock top community learners base data
          const mockStudentsBase = [
            { id: "rank-1", name: "Mg Mg Htike", isPremium: true, xp: 14200, dailyXp: 450, weeklyXp: 3200, monthlyXp: 9800, lessons: 28, courses: 3, streak: 14, quizScore: 98, repPoints: 780, courseCat: "react", activeFrame: "legendary_aura", activeEffect: "sparkle", status: "Building Full-Stack App" },
            { id: "rank-2", name: "Su Su San", isPremium: false, xp: 11800, dailyXp: 380, weeklyXp: 2600, monthlyXp: 8100, lessons: 22, courses: 2, streak: 10, quizScore: 92, repPoints: 420, courseCat: "js", activeFrame: "golden_crown", activeEffect: "gold-glow", status: "Mastering JS ES6+" },
            { id: "rank-3", name: "Aung Kaung Myat", isPremium: true, xp: 9500, dailyXp: 290, weeklyXp: 2100, monthlyXp: 6900, lessons: 19, courses: 2, streak: 8, quizScore: 88, repPoints: 240, courseCat: "html_css", activeFrame: "silver_sparkle", activeEffect: "fire-flicker", status: "Practicing CSS Grid" },
            { id: "rank-4", name: "Hla Hla Win", isPremium: false, xp: 7900, dailyXp: 210, weeklyXp: 1600, monthlyXp: 5400, lessons: 15, courses: 1, streak: 6, quizScore: 85, repPoints: 110, courseCat: "html_css", activeFrame: "bronze_ring", activeEffect: "none", status: "Studying Responsive Design" },
            { id: "rank-5", name: "Wai Yan Kyaw", isPremium: true, xp: 6400, dailyXp: 180, weeklyXp: 1300, monthlyXp: 4300, lessons: 12, courses: 1, streak: 5, quizScore: 82, repPoints: 85, courseCat: "python", activeFrame: "default", activeEffect: "none", status: "Solving Python Exercises" },
          ];

          // Current User Item
          const currentUserItem = {
            id: user.uid || "current-user",
            name: user.hideNameFromLeaderboard || user.leaderboardPrivacy === "private" ? "ကျောင်းသားသစ် (Private Mode)" : (user.name + " (You)"),
            isPremium: isPremiumUser,
            xp: userXp,
            dailyXp: Math.min(300, Math.round(userXp * 0.05) + 50),
            weeklyXp: Math.round(userXp * 0.25),
            monthlyXp: Math.round(userXp * 0.75),
            lessons: userCompletedLessons,
            courses: userCompletedCourses,
            streak: userStreak,
            quizScore: userCompletedQuizzes > 0 ? 90 : 75,
            repPoints: repPoints,
            courseCat: selectedCourseFilter !== "all" ? selectedCourseFilter : "html_css",
            activeFrame: user.activeFrame || "default",
            activeEffect: user.activeEffect || "none",
            status: `Level ${getLevelData(userXp).level} (${getLevelData(userXp).name})`
          };

          // Combine and filter list
          let allStudents = [...mockStudentsBase, currentUserItem];

          // Apply Course Filter
          if (selectedCourseFilter !== "all") {
            allStudents = allStudents.filter(s => s.courseCat === selectedCourseFilter || s.id === currentUserItem.id);
          }

          // Sort based on Leaderboard Factor & Timeframe
          let sortedRankings = [];
          let factorLabel = "Score";

          if (leaderboardCategory === "xp") {
            if (leaderboardTimeframe === "daily") {
              sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.dailyXp })).sort((a, b) => b.targetScore - a.targetScore);
              factorLabel = "Daily XP";
            } else if (leaderboardTimeframe === "weekly") {
              sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.weeklyXp })).sort((a, b) => b.targetScore - a.targetScore);
              factorLabel = "Weekly XP";
            } else if (leaderboardTimeframe === "monthly") {
              sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.monthlyXp })).sort((a, b) => b.targetScore - a.targetScore);
              factorLabel = "Monthly XP";
            } else {
              sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.xp })).sort((a, b) => b.targetScore - a.targetScore);
              factorLabel = "All-Time XP";
            }
          } else if (leaderboardCategory === "lessons") {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.lessons })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "Lessons Completed";
          } else if (leaderboardCategory === "courses") {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.courses })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "Courses Completed";
          } else if (leaderboardCategory === "streak") {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.streak })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "Days Streak";
          } else if (leaderboardCategory === "quizzes") {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.quizScore })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "Quiz Accuracy %";
          } else if (leaderboardCategory === "reputation") {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.repPoints })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "Reputation Pts";
          } else {
            sortedRankings = allStudents.map(s => ({ ...s, targetScore: s.xp })).sort((a, b) => b.targetScore - a.targetScore);
            factorLabel = "XP";
          }

          // Assign ranks
          const finalRanked = sortedRankings.map((item, idx) => ({
            ...item,
            rank: idx + 1
          }));

          const currentUserRankObj = finalRanked.find(item => item.id === currentUserItem.id);
          const currentUserRank = currentUserRankObj ? currentUserRankObj.rank : 6;

          return (
            <div className="space-y-6 text-left">
              {/* Header Banner */}
              <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                      <span>ကျောင်းသားများ၏ ထိပ်တန်းရပ်တည်မှုများ (Leaderboard & Community Reputation)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      လေ့လာမှု စံချိန်၊ သင်ခန်းစာပြီးမြောက်မှုနှင့် ကွန်မြူနတီ ကူညီပံ့ပိုးမှုများအပေါ် မူတည်၍ ရမှတ်စနစ်ဖြင့် ဂုဏ်ပြုဖော်ပြခြင်း
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Privacy Toggle Button */}
                    <button
                      onClick={() => {
                        const newPrivacy = user.leaderboardPrivacy === "private" ? "public" : "private";
                        onUpdateUser({
                          ...user,
                          leaderboardPrivacy: newPrivacy,
                          hideNameFromLeaderboard: newPrivacy === "private"
                        });
                      }}
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        user.leaderboardPrivacy === "private" || user.hideNameFromLeaderboard
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {user.leaderboardPrivacy === "private" || user.hideNameFromLeaderboard ? (
                        <>
                          <EyeOff className="w-4 h-4 text-slate-400" />
                          <span>Leaderboard အမည်ဝှက်ထားသည် (Private)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-emerald-500" />
                          <span>Leaderboard တွင် အမည်ဖော်ပြထားသည် (Public)</span>
                        </>
                      )}
                    </button>

                    {/* Admin Management Button */}
                    {user.role === "admin" && (
                      <button
                        onClick={() => setShowAdminLeaderboardModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span>Leaderboard Admin Controls</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin Status Notice */}
                {adminLeaderboardStatusMsg && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl flex items-center justify-between">
                    <span>{adminLeaderboardStatusMsg}</span>
                    <button onClick={() => setAdminLeaderboardStatusMsg(null)} className="text-purple-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Fair Play Protection Banner */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-semibold">Fair Play System Active:</span>
                    <span className="text-slate-500 dark:text-slate-400">Artificial XP farming, spam & fake reputation attempts focus strictly on organic progress.</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded font-bold">
                    Anti-Abuse Verified
                  </span>
                </div>

                {/* 1. TIMEFRAME SELECTION TABS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">ကာလအလိုက် ကြည့်ရှုရန် (Timeframe)</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "daily", label: "နေ့စဉ် (Daily)" },
                      { id: "weekly", label: "အပတ်စဉ် (Weekly)" },
                      { id: "monthly", label: "လစဉ် (Monthly)" },
                      { id: "all_time", label: "အချိန်တိုင်း (All-Time)" }
                    ].map((tf) => (
                      <button
                        key={tf.id}
                        onClick={() => setLeaderboardTimeframe(tf.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          leaderboardTimeframe === tf.id
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. RANKING FACTORS & FILTERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ranking Factor Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">စံနှုန်းအလိုက် ရွေးချယ်ရန် (Ranking Factor)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "xp", label: "⚡ XP (Experience)" },
                        { id: "lessons", label: "📖 Lessons" },
                        { id: "courses", label: "🎓 Courses" },
                        { id: "streak", label: "🔥 Streak" },
                        { id: "quizzes", label: "🎯 Quizzes" },
                        { id: "reputation", label: "🤝 Community Rep" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setLeaderboardCategory(cat.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            leaderboardCategory === cat.id
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Course / Scope Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">သင်တန်းကဏ္ဍအလိုက် စစ်ထုတ်ရန် (Course Filter)</label>
                    <select
                      value={selectedCourseFilter}
                      onChange={(e) => setSelectedCourseFilter(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">🌐 သင်တန်းများအားလုံး (Global Rankings)</option>
                      <option value="html_css">🎨 HTML & CSS Foundation</option>
                      <option value="js">⚡ Modern JavaScript Pro</option>
                      <option value="react">⚛️ React & Frontend Master</option>
                      <option value="python">🐍 Python Basics & Logic</option>
                    </select>
                  </div>
                </div>

                {/* 3. YOUR REPUTATION & POSITION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Leaderboard Rank */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-4 space-y-1 shadow-md">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-80">သင့်ရပ်တည်မှု (Your Rank)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-extrabold"># {currentUserRank}</span>
                      <span className="text-xs opacity-90">out of 12,450</span>
                    </div>
                    <p className="text-[10px] opacity-80 font-mono">Top {(currentUserRank / 120 * 100).toFixed(1)}% of learners</p>
                  </div>

                  {/* Card 2: Total Learning Points */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">စုစုပေါင်း လေ့လာမှု (XP)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{userXp.toLocaleString()}</span>
                      <span className="text-xs font-mono text-blue-500 font-bold">XP</span>
                    </div>
                    <p className="text-[10px] text-slate-400">LVL {getLevelData(userXp).level} ({getLevelData(userXp).name})</p>
                  </div>

                  {/* Card 3: Community Reputation Level */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">ကွန်မြူနတီ အဆင့် (Reputation Level)</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{repInfo.badge}</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{repInfo.level}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{repPoints} Reputation Pts</p>
                  </div>

                  {/* Card 4: Streak & Badges */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">အရှိန်နှင့် ဆုတံဆိပ်များ (Badges)</span>
                    <div className="flex items-center space-x-1.5">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">{userStreak}</span>
                      <span className="text-xs text-slate-400">Days Streak</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{user.achievements?.length || 0} Achievements unlocked</p>
                  </div>
                </div>

                {/* 4. RANKING LIST TABLE */}
                <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-150 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2 sm:col-span-1">Rank</div>
                    <div className="col-span-6 sm:col-span-5">Student / Learner</div>
                    <div className="hidden sm:block sm:col-span-3">Reputation Level & Status</div>
                    <div className="col-span-4 sm:col-span-3 text-right">{factorLabel}</div>
                  </div>

                  <div className="divide-y divide-slate-150 dark:divide-slate-850">
                    {finalRanked.map((student) => {
                      const isCurrentUser = student.id === currentUserItem.id;
                      const studRep = getReputationLevel(student.repPoints);
                      const studLevel = getLevelData(student.xp).level;

                      return (
                        <div 
                          key={student.id} 
                          className={`grid grid-cols-12 p-4 items-center transition-all ${
                            isCurrentUser 
                              ? "bg-blue-600/5 dark:bg-blue-600/10 border-l-4 border-blue-500 font-semibold" 
                              : "hover:bg-slate-50 dark:hover:bg-slate-900/20"
                          }`}
                        >
                          {/* Rank */}
                          <div className="col-span-2 sm:col-span-1 flex items-center space-x-1 font-mono">
                            {student.rank === 1 ? (
                              <span className="text-2xl">🥇</span>
                            ) : student.rank === 2 ? (
                              <span className="text-2xl">🥈</span>
                            ) : student.rank === 3 ? (
                              <span className="text-2xl">🥉</span>
                            ) : (
                              <span className="text-xs text-slate-400 font-bold font-mono">#{student.rank}</span>
                            )}
                          </div>

                          {/* Student Info */}
                          <div className="col-span-6 sm:col-span-5 flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-800 flex-shrink-0 border-2 ${getFrameClasses(student.activeFrame)}`}>
                              <span className="text-xs font-extrabold font-mono uppercase text-slate-700 dark:text-slate-200">
                                {student.name.slice(0, 1)}
                              </span>
                            </div>

                            <div className="flex flex-col text-left">
                              <span className={`text-xs ${isCurrentUser ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                                {student.name}
                              </span>
                              
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                {student.isPremium && (
                                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[7px] font-extrabold px-1.5 py-0.2 rounded shadow-sm flex items-center gap-0.5 uppercase tracking-wide">
                                    <span>Premium</span>
                                    <span className="text-[8px]">👑</span>
                                  </span>
                                )}
                                
                                <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold font-mono">
                                  LVL {studLevel}
                                </span>

                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${studRep.colorClass}`}>
                                  {studRep.badge} {studRep.level}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status / Rep Level */}
                          <div className="hidden sm:block sm:col-span-3 text-[11px] text-slate-400 truncate pr-2">
                            {student.status}
                          </div>

                          {/* Score */}
                          <div className="col-span-4 sm:col-span-3 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                            {typeof student.targetScore === "number" ? student.targetScore.toLocaleString() : student.targetScore}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Motivation */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-1">
                  <p className="text-xs text-slate-400">
                    🏆 စာကို ပုံမှန်ဆက်တိုက်လေ့လာခြင်း၊ Quiz များဖြေဆိုခြင်းနှင့် Community တွင် မေးခွန်းများကို ကူညီဖြေကြားပေးခြင်းဖြင့် Reputation Points များ တိုးတက်စေနိုင်ပါသည်။
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Official Code Learn Myanmar Leaderboard System • Updated Live
                  </p>
                </div>
              </section>
            </div>
          );
        })()}
      </div>

      {/* Goal creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowGoalModal(false)}
              className="absolute top-4 right-4 p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">ရည်မှန်းချက်အသစ် သတ်မှတ်ရန်</h3>
              <p className="text-xs text-slate-400">လေ့လာမှု စွမ်းရည်ပိုမိုကောင်းမွန်စေရန် နေ့စဉ် သို့မဟုတ် လစဉ် စိန်ခေါ်မှုများ ပြုလုပ်ပါ</p>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-600 dark:text-slate-400">ရည်မှန်းချက် အမည် သို့မဟုတ် ဖော်ပြချက်</label>
                <input 
                  type="text" 
                  placeholder="ဥပမာ - React JS အခြေခံ ပြီးဆုံးရန်..."
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-1 focus:ring-blue-500 text-xs dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">ပမာဏ ပစ်မှတ် (Target Amount)</label>
                  <input 
                    type="number" 
                    min={1} 
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-1 focus:ring-blue-500 text-xs dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400">တိုင်းတာမှုယူနစ် (Unit)</label>
                  <select
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-1 focus:ring-blue-500 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value="Lessons">Lessons (သင်ခန်းစာ)</option>
                    <option value="Minutes">Minutes (မိနစ်)</option>
                    <option value="Projects">Projects (ပရောဂျက်)</option>
                    <option value="Courses">Courses (သင်တန်း)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Goal အဖြစ် သတ်မှတ်ရန်
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Leaderboard Management Modal */}
      {showAdminLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAdminLeaderboardModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>Leaderboard & Reputation Admin Management</span>
              </h3>
              <p className="text-xs text-slate-400">
                မသမာသော အမှတ်တိုးခြင်းများကို ထိန်းချုပ်ရန်၊ စံနှုန်းများ သတ်မှတ်ရန်နှင့် Leaderboards များအား ပြန်လည် Reset လုပ်ရန်
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Reset Leaderboard */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Leaderboard Scores ပြန်လည် Reset ပြုလုပ်ရန်</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  အပတ်စဉ် သို့မဟုတ် လစဉ် ပြီးဆုံးသည့်အခါ ထိပ်တန်းကျောင်းသား စာရင်းများကို အစမှ ပြန်လည်စတင်ပါ
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAdminLeaderboardStatusMsg("✅ အပတ်စဉ် Weekly Leaderboard ရမှတ်များအား အောင်မြင်စွာ Reset ပြုလုပ်ပြီးပါပြီ။");
                      setShowAdminLeaderboardModal(false);
                    }}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Reset Weekly Scores
                  </button>
                  <button
                    onClick={() => {
                      setAdminLeaderboardStatusMsg("✅ လစဉ် Monthly Leaderboard ရမှတ်များအား အောင်မြင်စွာ Reset ပြုလုပ်ပြီးပါပြီ။");
                      setShowAdminLeaderboardModal(false);
                    }}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Reset Monthly Scores
                  </button>
                </div>
              </div>

              {/* Option 2: Fair Play & Invalid Activity Removal */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Anti-Abuse Fair Play Controls</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  မသမာသော Spam / Artificial XP ရရှိရန် ကြိုးပမ်းထားသည့် စာရင်းများကို စစ်ဆေးဖယ်ရှားရန်
                </p>
                <button
                  onClick={() => {
                    setAdminLeaderboardStatusMsg("🛡️ Fair Play System Audit Complete: No suspicious spam XP detected.");
                    setShowAdminLeaderboardModal(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Run Full Anti-XP Spam Audit
                </button>
              </div>

              {/* Option 3: Reputation Point Rules */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Reputation Rules & Rewards</span>
                </h4>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>• Helpful Answer: <strong>+15 Reputation Pts</strong></p>
                  <p>• Marked as Best Answer: <strong>+50 Reputation Pts</strong></p>
                  <p>• Quality Discussion Post: <strong>+10 Reputation Pts</strong></p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAdminLeaderboardModal(false)}
              className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              ပိတ်မည် (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
