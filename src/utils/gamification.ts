import { UserProfile, Achievement } from "../types";

export interface GamificationResetResult {
  updatedUser: UserProfile;
  resetOccurred: boolean;
}

// Default states for Daily Missions
export const DEFAULT_DAILY_MISSIONS = {
  "complete-lesson": {
    id: "complete-lesson",
    title: "သင်ခန်းစာ ၁ ခု ပြီးဆုံးအောင်လေ့လာရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 50,
    coinsReward: 10
  },
  "complete-quiz": {
    id: "complete-quiz",
    title: "Quiz ၁ ခု ဖြေဆိုရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 30,
    coinsReward: 5
  },
  "study-time": {
    id: "study-time",
    title: "မိနစ် ၂၀ ကြာအောင် လေ့လာသင်ယူရန်",
    progress: 0,
    target: 20, // 20 minutes
    claimed: false,
    xpReward: 30,
    coinsReward: 6
  },
  "ask-kibo": {
    id: "ask-kibo",
    title: "Kibo AI Mentor ကို မေးခွန်း ၃ ခုမေးရန်",
    progress: 0,
    target: 3,
    claimed: false,
    xpReward: 25,
    coinsReward: 5
  },
  "practice-exercise": {
    id: "practice-exercise",
    title: "ကုဒ်လေ့ကျင့်ခန်း ၁ ခု ဖြေဆိုပြီးမြောက်ရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 40,
    coinsReward: 8
  },
  "complete-assignment": {
    id: "complete-assignment",
    title: "Assignment ၁ ခု တင်သွင်းရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 60,
    coinsReward: 12
  }
};

// Default states for Weekly Challenges
export const DEFAULT_WEEKLY_CHALLENGES = {
  "complete-5-lessons": {
    id: "complete-5-lessons",
    title: "တစ်ပတ်အတွင်း သင်ခန်းစာ ၅ ခု ပြီးဆုံးရန်",
    progress: 0,
    target: 5,
    claimed: false,
    xpReward: 200,
    coinsReward: 50
  },
  "complete-10-quizzes": {
    id: "complete-10-quizzes",
    title: "တစ်ပတ်အတွင်း Quizzes ၁၀ ခု ပြီးဆုံးရန်",
    progress: 0,
    target: 10,
    claimed: false,
    xpReward: 150,
    coinsReward: 30
  },
  "streak-7-days": {
    id: "streak-7-days",
    title: "၇ ရက်ဆက်တိုက် လေ့လာမှု အရှိန်ထိန်းရန်",
    progress: 0,
    target: 7,
    claimed: false,
    xpReward: 250,
    coinsReward: 60
  },
  "build-mini-project": {
    id: "build-mini-project",
    title: "Mini Project ၁ ခု တည်ဆောက်ပြီးမြောက်ရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 300,
    coinsReward: 80
  },
  "complete-course-module": {
    id: "complete-course-module",
    title: "Course Module ၁ ခု လေ့လာပြီးမြောက်ရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 150,
    coinsReward: 40
  }
};

// Default states for Monthly Challenges
export const DEFAULT_MONTHLY_CHALLENGES = {
  "complete-full-course": {
    id: "complete-full-course",
    title: "သင်တန်းတစ်ခုလုံး အောင်မြင်စွာပြီးမြောက်ရန်",
    progress: 0,
    target: 1,
    claimed: false,
    xpReward: 1000,
    coinsReward: 250
  },
  "earn-1000-xp": {
    id: "earn-1000-xp",
    title: "စုစုပေါင်း ၁,၀၀၀ XP ရှာဖွေရန်",
    progress: 0,
    target: 1000,
    claimed: false,
    xpReward: 500,
    coinsReward: 120
  },
  "finish-two-projects": {
    id: "finish-two-projects",
    title: "လက်တွေ့ Projects ၂ ခု ပြီးမြောက်ရန်",
    progress: 0,
    target: 2,
    claimed: false,
    xpReward: 800,
    coinsReward: 200
  },
  "streak-30-days": {
    id: "streak-30-days",
    title: "ရက် ၃၀ ဆက်တိုက် စံချိန်တင် လေ့လာရန်",
    progress: 0,
    target: 30,
    claimed: false,
    xpReward: 1200,
    coinsReward: 300
  }
};

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Reset weekly if a week (7 days) has passed
export function getWeeklyResetDate(): string {
  const d = new Date();
  // set to next Sunday or simply rolling 7 days, we'll use a clean rolling 7 days marker
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString();
}

/**
 * Checks dates and resets daily, weekly, or monthly missions/challenges as required.
 */
export function initAndCheckResets(user: UserProfile): GamificationResetResult {
  const today = getLocalDateString();
  let updatedUser = { ...user };
  let resetOccurred = false;

  // Initialize unlocked frames if they don't exist
  if (!updatedUser.unlockedFrames || updatedUser.unlockedFrames.length === 0) {
    updatedUser.unlockedFrames = ["default"];
    updatedUser.activeFrame = "default";
    updatedUser.activeEffect = "none";
  }

  // Initialize monthly/yearly streaks
  if (!updatedUser.monthlyStreak) updatedUser.monthlyStreak = updatedUser.learningStreak || 0;
  if (!updatedUser.yearlyStreak) updatedUser.yearlyStreak = updatedUser.learningStreak || 0;

  // Check if daily reset is needed
  if (!updatedUser.lastMissionsResetDate || updatedUser.lastMissionsResetDate !== today) {
    updatedUser.lastMissionsResetDate = today;
    updatedUser.studyMinutesToday = 0;
    updatedUser.kiboQuestionsAskedToday = 0;
    
    // Reset daily missions progress
    updatedUser.dailyMissionsState = { ...DEFAULT_DAILY_MISSIONS };
    
    // If streak has broken (last check-in was before yesterday)
    // We already handle streak checking inside the check-in card, but let's sync monthly/yearly bounds
    if (updatedUser.learningStreak) {
      if (!updatedUser.monthlyStreak || updatedUser.learningStreak > updatedUser.monthlyStreak) {
        updatedUser.monthlyStreak = updatedUser.learningStreak;
      }
      if (!updatedUser.yearlyStreak || updatedUser.learningStreak > updatedUser.yearlyStreak) {
        updatedUser.yearlyStreak = updatedUser.learningStreak;
      }
    }

    resetOccurred = true;
  }

  // Ensure states exist
  if (!updatedUser.dailyMissionsState) {
    updatedUser.dailyMissionsState = { ...DEFAULT_DAILY_MISSIONS };
    resetOccurred = true;
  }
  if (!updatedUser.weeklyChallengesState) {
    updatedUser.weeklyChallengesState = { ...DEFAULT_WEEKLY_CHALLENGES };
    resetOccurred = true;
  }
  if (!updatedUser.monthlyChallengesState) {
    updatedUser.monthlyChallengesState = { ...DEFAULT_MONTHLY_CHALLENGES };
    resetOccurred = true;
  }

  // Update streak-based mission bounds dynamically
  const currentStreakVal = updatedUser.learningStreak || 0;
  if (updatedUser.weeklyChallengesState["streak-7-days"]) {
    updatedUser.weeklyChallengesState["streak-7-days"].progress = Math.min(7, currentStreakVal);
  }
  if (updatedUser.monthlyChallengesState["streak-30-days"]) {
    updatedUser.monthlyChallengesState["streak-30-days"].progress = Math.min(30, currentStreakVal);
  }

  return { updatedUser, resetOccurred };
}

/**
 * Updates progress for a specific gamification activity.
 * Anti-abuse / Fair Play is applied for repeatable questions to avoid unlimited farming.
 */
export function updateGamificationProgress(
  user: UserProfile,
  activityType: "lesson" | "quiz" | "study" | "question" | "exercise" | "assignment" | "xp" | "course" | "project",
  amount: number = 1
): { updatedUser: UserProfile; completedMissions: string[] } {
  // 1. Ensure states are initialized
  const { updatedUser } = initAndCheckResets(user);
  const completedMissions: string[] = [];

  // 2. Direct modification of progress based on activity
  if (activityType === "lesson") {
    // Daily Mission
    if (updatedUser.dailyMissionsState?.["complete-lesson"]) {
      const state = updatedUser.dailyMissionsState["complete-lesson"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
    // Weekly Challenge
    if (updatedUser.weeklyChallengesState?.["complete-5-lessons"]) {
      const state = updatedUser.weeklyChallengesState["complete-5-lessons"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "quiz") {
    // Daily Mission
    if (updatedUser.dailyMissionsState?.["complete-quiz"]) {
      const state = updatedUser.dailyMissionsState["complete-quiz"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
    // Weekly Challenge
    if (updatedUser.weeklyChallengesState?.["complete-10-quizzes"]) {
      const state = updatedUser.weeklyChallengesState["complete-10-quizzes"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "study") {
    // Daily Study Minutes (amount is minutes studied)
    if (updatedUser.studyMinutesToday !== undefined) {
      updatedUser.studyMinutesToday += amount;
    } else {
      updatedUser.studyMinutesToday = amount;
    }

    if (updatedUser.dailyMissionsState?.["study-time"]) {
      const state = updatedUser.dailyMissionsState["study-time"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, updatedUser.studyMinutesToday);
        if (state.progress === state.target && !state.claimed) {
          completedMissions.push(state.title);
        }
      }
    }
  }

  if (activityType === "question") {
    // FAIR PLAY: Limit maximum daily XP from AI questions to 3.
    const currentAskedToday = updatedUser.kiboQuestionsAskedToday || 0;
    if (currentAskedToday >= 3) {
      // Abuse protection: limit reached, do not increment further for XP
      return { updatedUser, completedMissions };
    }

    updatedUser.kiboQuestionsAskedToday = currentAskedToday + amount;

    if (updatedUser.dailyMissionsState?.["ask-kibo"]) {
      const state = updatedUser.dailyMissionsState["ask-kibo"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, updatedUser.kiboQuestionsAskedToday);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "exercise") {
    if (updatedUser.dailyMissionsState?.["practice-exercise"]) {
      const state = updatedUser.dailyMissionsState["practice-exercise"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "assignment") {
    if (updatedUser.dailyMissionsState?.["complete-assignment"]) {
      const state = updatedUser.dailyMissionsState["complete-assignment"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "project") {
    // Weekly Challenge
    if (updatedUser.weeklyChallengesState?.["build-mini-project"]) {
      const state = updatedUser.weeklyChallengesState["build-mini-project"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
    // Monthly Challenge
    if (updatedUser.monthlyChallengesState?.["finish-two-projects"]) {
      const state = updatedUser.monthlyChallengesState["finish-two-projects"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "course") {
    // Weekly Challenge
    if (updatedUser.weeklyChallengesState?.["complete-course-module"]) {
      const state = updatedUser.weeklyChallengesState["complete-course-module"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
    // Monthly Challenge
    if (updatedUser.monthlyChallengesState?.["complete-full-course"]) {
      const state = updatedUser.monthlyChallengesState["complete-full-course"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  if (activityType === "xp") {
    // Monthly Challenge tracking XP progress
    if (updatedUser.monthlyChallengesState?.["earn-1000-xp"]) {
      const state = updatedUser.monthlyChallengesState["earn-1000-xp"];
      if (state.progress < state.target) {
        state.progress = Math.min(state.target, state.progress + amount);
        if (state.progress === state.target) completedMissions.push(state.title);
      }
    }
  }

  // 3. Automatically check badges and frames
  const badgeResult = checkAndUnlockBadges(updatedUser);
  updatedUser.achievements = badgeResult.updatedUser.achievements;
  
  const framesResult = checkAndUnlockFrames(updatedUser.level, updatedUser.unlockedFrames || ["default"]);
  updatedUser.unlockedFrames = framesResult;

  return { updatedUser, completedMissions };
}

/**
 * Checks for level accomplishments and unlocks appropriate profile cosmetic frames.
 */
export function checkAndUnlockFrames(level: number, existingUnlocked: string[] = []): string[] {
  const frames = [...existingUnlocked];
  
  const addFrame = (frameId: string) => {
    if (!frames.includes(frameId)) {
      frames.push(frameId);
    }
  };

  addFrame("default");
  if (level >= 3) addFrame("bronze_ring");
  if (level >= 5) addFrame("silver_sparkle");
  if (level >= 7) addFrame("golden_crown");
  if (level >= 9) addFrame("legendary_aura");

  return frames;
}

/**
 * Check badge conditions and unlock them dynamically.
 */
export function checkAndUnlockBadges(user: UserProfile): { updatedUser: UserProfile; unlockedTitles: string[] } {
  const updatedUser = { ...user };
  const unlockedTitles: string[] = [];
  const achievements = [...(user.achievements || [])];

  const unlockBadge = (id: string, title: string, description: string, icon: string) => {
    if (!achievements.some(a => a.id === id)) {
      achievements.push({
        id,
        title,
        description,
        icon,
        unlockedAt: new Date().toLocaleDateString()
      });
      unlockedTitles.push(title);
    }
  };

  // 1. Lesson Completion milestones
  const lessonCount = updatedUser.completedLessons?.length || 0;
  if (lessonCount >= 1) {
    unlockBadge(
      "badge-first-lesson",
      "First Lesson (ပထမဆုံး ခြေလှမ်း)",
      "ပထမဦးဆုံး သင်ခန်းစာကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ခြင်း။",
      "BookOpen"
    );
  }
  if (lessonCount >= 100) {
    unlockBadge(
      "badge-100-lessons",
      "100 Lessons (ရာပြည့် စွမ်းအားရှင်)",
      "သင်ခန်းစာပေါင်း ၁၀၀ ကို အောင်မြင်စွာ ပြီးမြောက်လေ့လာနိုင်ခဲ့ခြင်း။",
      "Trophy"
    );
  }

  // 2. Streak milestones
  const streak = updatedUser.learningStreak || 0;
  if (streak >= 7) {
    unlockBadge(
      "badge-7-day-streak",
      "7-Day Streak (ဇွဲရှိသူ)",
      "၇ ရက်ဆက်တိုက် စာမပျက်တမ်း နေ့စဉ်ဝင်ရောက်လေ့လာနိုင်ခဲ့ခြင်း။",
      "Flame"
    );
  }
  if (streak >= 30) {
    unlockBadge(
      "badge-30-day-streak",
      "30-Day Streak (ဒဏ္ဍာရီလာ ဇွဲရှင်)",
      "ရက်ပေါင်း ၃၀ ဆက်တိုက် စာသင်ခန်းသို့ ဝင်ရောက်လေ့လာခဲ့ခြင်း။",
      "Award"
    );
  }

  // 3. Category Explorers
  const checkHasCompletedInCourse = (techKeyword: string): boolean => {
    return updatedUser.completedLessons?.some(id => id.toLowerCase().includes(techKeyword.toLowerCase())) || false;
  };

  if (checkHasCompletedInCourse("html") || checkHasCompletedInCourse("web")) {
    unlockBadge(
      "badge-html-explorer",
      "HTML Explorer (ဝဘ်တည်ဆောက်သူ)",
      "HTML သင်ခန်းစာများကို လေ့လာသင်ယူပြီး ဝဘ်စာမျက်နှာများ စတင်တည်ဆောက်နိုင်ခဲ့ခြင်း။",
      "Code"
    );
  }

  if (checkHasCompletedInCourse("css") || checkHasCompletedInCourse("style")) {
    unlockBadge(
      "badge-css-designer",
      "CSS Designer (အလှဆင်ပညာရှင်)",
      "CSS ဖြင့် ဝဘ်စာမျက်နှာများကို လှပသပ်ရပ်စွာ ဖန်တီးပုံဖော်နိုင်ခဲ့ခြင်း။",
      "Palette"
    );
  }

  if (checkHasCompletedInCourse("js") || checkHasCompletedInCourse("javascript")) {
    unlockBadge(
      "badge-js-developer",
      "JavaScript Developer (ဝဘ်စုန်းကဝေ)",
      "JavaScript ဖြင့် ဝဘ်ဆိုဒ်ကို လှုပ်ရှားသက်ဝင် အပြန်အလှန်လုပ်ဆောင်စေခဲ့ခြင်း။",
      "Cpu"
    );
  }

  if (checkHasCompletedInCourse("firebase") || checkHasCompletedInCourse("firestore")) {
    unlockBadge(
      "badge-firebase-builder",
      "Firebase Builder (တိမ်တိုက်ဗိသုကာ)",
      "Firebase Cloud Database များကို ကျွမ်းကျင်စွာ ချိတ်ဆက်အသုံးပြုနိုင်ခဲ့ခြင်း။",
      "Cloud"
    );
  }

  if (checkHasCompletedInCourse("android") || checkHasCompletedInCourse("kotlin")) {
    unlockBadge(
      "badge-android-creator",
      "Android Creator (မိုဘိုင်းဖန်တီးရှင်)",
      "Android Application များကို အောင်မြင်စွာ ဖန်တီးရေးသားနိုင်ခဲ့ခြင်း။",
      "Smartphone"
    );
  }

  if (checkHasCompletedInCourse("ai") || checkHasCompletedInCourse("gemini")) {
    unlockBadge(
      "badge-ai-explorer",
      "AI Explorer (ဉာဏ်ရည်တု စူးစမ်းသူ)",
      "AI နည်းပညာနှင့် Kibo AI Chat Assistant တို့ကို စူးစမ်းအသုံးပြုခဲ့ခြင်း။",
      "Sparkles"
    );
  }

  // 4. Membership tiers
  if (updatedUser.isPremium) {
    unlockBadge(
      "badge-premium-member",
      "Premium Member (ရွှေအဆင့် အဖွဲ့ဝင်)",
      "ကန့်သတ်ချက်မရှိသော သင်ယူမှုအခွင့်အလမ်းများကို ရရှိထားသည့် Premium အဖွဲ့ဝင်။",
      "Crown"
    );
  }

  // Always give founding member for early learners
  unlockBadge(
    "badge-founding-member",
    "Founding Member (ကနဦး ကျောင်းသား)",
    "Code Learn Myanmar ၏ ကနဦး စတင်တည်ထောင်စဉ်ကတည်းက ပါဝင်ခဲ့သည့် ထူးချွန်ကျောင်းသား။",
    "Shield"
  );

  updatedUser.achievements = achievements;
  return { updatedUser, unlockedTitles };
}

/**
 * Helper to translate raw frame IDs to Myanmar visual labels.
 */
export function getFrameLabel(frameId: string): string {
  switch (frameId) {
    case "default":
      return "Default Frame (ပုံမှန်အတိုင်း)";
    case "bronze_ring":
      return "Bronze Ring (ကြေးညိုရောင် ဘောင်) - LVL 3+";
    case "silver_sparkle":
      return "Silver Sparkle (ငွေရောင် လျှပ်စီးဘောင်) - LVL 5+";
    case "golden_crown":
      return "Golden Crown (ရွှေရောင် သရဖူဘောင်) - LVL 7+";
    case "legendary_aura":
      return "Legendary Aura (ဒဏ္ဍာရီလာ အရှိန်အဝါဘောင်) - LVL 9+";
    default:
      return "Unknown Frame";
  }
}

/**
 * Helper to get the Tailwind styling class for profile frames.
 */
export function getFrameClasses(frameId?: string): string {
  switch (frameId) {
    case "bronze_ring":
      return "ring-4 ring-amber-700 ring-offset-2 ring-offset-[#1E293B] shadow-[0_0_15px_rgba(180,83,9,0.3)]";
    case "silver_sparkle":
      return "ring-4 ring-slate-300 ring-offset-2 ring-offset-[#1E293B] animate-pulse shadow-[0_0_20px_rgba(203,213,225,0.4)]";
    case "golden_crown":
      return "ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#1E293B] border-2 border-amber-500 shadow-[0_0_25px_rgba(250,204,21,0.5)]";
    case "legendary_aura":
      return "ring-4 ring-purple-500 ring-offset-2 ring-offset-[#1E293B] border-2 border-pink-500 animate-bounce shadow-[0_0_30px_rgba(168,85,247,0.7)]";
    default:
      return "ring-2 ring-slate-200 dark:ring-slate-700";
  }
}

/**
 * Helper to translate visual effect IDs to Myanmar labels.
 */
export function getEffectLabel(effectId: string): string {
  switch (effectId) {
    case "none":
      return "No Effect (အထူးပြုလုပ်ချက် မရှိ)";
    case "sparkle":
      return "Sparkles (ကြယ်ပွင့်လေးများ တဖျတ်ဖျတ်)";
    case "gold-glow":
      return "Golden Glow (ရွှေရောင် ရွှန်းစိုအရှိန်အဝါ)";
    case "fire-flicker":
      return "Fire Flicker (တောက်လောင်နေသော မီးလျှံ)";
    case "bubble":
      return "Bouncing Bubbles (လွင့်ပျံနေသော ရေပူပေါင်းများ)";
    default:
      return "Unknown Effect";
  }
}

/**
 * Helper to calculate Reputation Level & Badges based on Community Reputation points.
 */
export function getReputationLevel(points: number = 0): {
  level: "Beginner Helper" | "Community Helper" | "Senior Helper" | "Expert Contributor" | "Community Mentor";
  labelMm: string;
  badge: string;
  colorClass: string;
  nextLevelPoints: number;
} {
  if (points >= 700) {
    return {
      level: "Community Mentor",
      labelMm: "ကွန်မြူနတီ လမ်းပြဆရာ (Community Mentor)",
      badge: "👑",
      colorClass: "bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400",
      nextLevelPoints: 1000
    };
  } else if (points >= 350) {
    return {
      level: "Expert Contributor",
      labelMm: "ကျွမ်းကျင် ကူညီပံ့ပိုးသူ (Expert Contributor)",
      badge: "💎",
      colorClass: "bg-purple-500/10 border-purple-500/30 text-purple-500 dark:text-purple-400",
      nextLevelPoints: 700
    };
  } else if (points >= 150) {
    return {
      level: "Senior Helper",
      labelMm: "အထက်တန်း အကူအညီပေးသူ (Senior Helper)",
      badge: "🌟",
      colorClass: "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400",
      nextLevelPoints: 350
    };
  } else if (points >= 50) {
    return {
      level: "Community Helper",
      labelMm: "ကွန်မြူနတီ အကူအညီပေးသူ (Community Helper)",
      badge: "🤝",
      colorClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400",
      nextLevelPoints: 150
    };
  } else {
    return {
      level: "Beginner Helper",
      labelMm: "စတင် ကူညီပေးသူ (Beginner Helper)",
      badge: "🌱",
      colorClass: "bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400",
      nextLevelPoints: 50
    };
  }
}

/**
 * Kibo Motivation celebrations based on progress milestones.
 */
export function getRandomKiboCelebration(): string {
  const quotes = [
    "🎉 Mission Complete! သင်ဟာ နေ့စဉ်ပန်းတိုင်ကို အောင်မြင်စွာကျော်ဖြတ်လိုက်နိုင်ပြီဗျာ!",
    "🔥 မင်းရဲ့ Streak က ဆက်တိုးနေပြီ! ဇွဲအရှိန်ကို ဆက်ထိန်းထားပါဦးနော်!",
    "💪 Professional Developer ဖြစ်ဖို့ တစ်လှမ်း ပိုနီးလာပြီ! မင်းတကယ်တော်တယ်!",
    "🚀 အံ့မခန်းပဲဗျာ! အနာဂတ်ရဲ့ Senior Web Developer လေး အရှိန်မြှင့်တင်လိုက်ပါဦး!",
    "👑 မင်းရဲ့ ကြိုးစားမှုက ရလဒ်ကောင်းတွေ ထွက်လာတော့မှာပါ။ စာကို ပုံမှန်ဆက်လေ့လာပါဗျာ!"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
