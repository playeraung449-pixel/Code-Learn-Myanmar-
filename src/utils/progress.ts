import { UserProfile, Course, Lesson, LEVEL_THRESHOLDS, getLevelData } from "../types";

export interface RichBookmark {
  id: string;
  category: "lesson" | "project" | "article" | "roadmap";
  title: string;
  path?: string;
  date: string;
}

export interface ActivityHistory {
  id: string;
  type: "lesson_view" | "lesson_complete" | "project_complete" | "quiz_pass" | "quiz_fail" | "ai_chat" | "search";
  title: string;
  details: string;
  timestamp: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  date: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  remainingValue: number;
  unit: string;
}

export interface StudyTimeStats {
  totalMinutes: number;
  lessonsCompletedCount: number;
  projectsCompletedCount: number;
  quizzesPassedCount: number;
  coursesCompletedCount: number;
  averageQuizScore: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  completedDates?: string[]; // tracks dates of study to plot on calendar
}

// Extend UserProfile properties safely without breaking existing fields
export interface ExtendedUserProfile extends UserProfile {
  currentCourseId?: string;
  currentLessonId?: string;
  lessonProgress?: { [lessonId: string]: number }; // percentage 0-100 of lesson scroll/reading
  richBookmarks?: RichBookmark[];
  recentHistory?: ActivityHistory[];
  studyTimeStats?: StudyTimeStats;
  quizResults?: QuizResult[];
  learningGoals?: LearningGoal[];
  searchHistory?: string[];
}

/**
 * Creates a default stats object if it doesn't exist
 */
export function getOrCreateStats(user: ExtendedUserProfile): StudyTimeStats {
  return user.studyTimeStats || {
    totalMinutes: 45, // default initial study time to look lively
    lessonsCompletedCount: user.completedLessons?.length || 0,
    projectsCompletedCount: user.completedProjects?.length || 0,
    quizzesPassedCount: user.completedQuizzes?.length || 0,
    coursesCompletedCount: user.completedCourses?.length || 0,
    averageQuizScore: 85, // starting default average
    weeklyMinutes: 15,
    monthlyMinutes: 45,
    completedDates: [new Date().toLocaleDateString()] // include today as first study date
  };
}

/**
 * Generates default goals if not set
 */
export function getOrCreateGoals(user: ExtendedUserProfile): LearningGoal[] {
  if (user.learningGoals && user.learningGoals.length > 0) {
    return user.learningGoals;
  }
  return [
    {
      id: "goal-lesson-daily",
      title: "နေ့စဉ် သင်ခန်းစာ ၁ ခုပြီးဆုံးရန်",
      targetValue: 1,
      currentValue: 0,
      remainingValue: 1,
      unit: "Lesson"
    },
    {
      id: "goal-study-daily",
      title: "နေ့စဉ် နာရီဝက် (မိနစ် ၃၀) လေ့လာရန်",
      targetValue: 30,
      currentValue: 15, // some starting progress
      remainingValue: 15,
      unit: "Minutes"
    },
    {
      id: "goal-course-monthly",
      title: "တစ်လလျှင် သင်တန်း ၁ ခုပြီးဆုံးရန်",
      targetValue: 1,
      currentValue: user.completedCourses?.length || 0,
      remainingValue: Math.max(0, 1 - (user.completedCourses?.length || 0)),
      unit: "Course"
    }
  ];
}

/**
 * Adds an entry to learning history, capped at 20 activities
 */
export function addHistoryEntry(
  user: ExtendedUserProfile,
  type: ActivityHistory["type"],
  title: string,
  details: string
): ActivityHistory[] {
  const currentHistory = user.recentHistory || [];
  const newEntry: ActivityHistory = {
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    details,
    timestamp: new Date().toLocaleString()
  };
  
  // Filter out any identical recent activity to avoid spam, then prepend
  const filtered = currentHistory.filter(h => !(h.type === type && h.title === title));
  return [newEntry, ...filtered].slice(0, 20);
}

/**
 * Updates user when they start viewing a lesson
 */
export function trackLessonView(
  user: ExtendedUserProfile,
  courseId: string,
  lessonId: string,
  lessonTitle: string
): ExtendedUserProfile {
  const history = addHistoryEntry(
    user,
    "lesson_view",
    lessonTitle,
    `Started reading lesson in ${courseId}`
  );

  const stats = getOrCreateStats(user);
  const updatedDates = stats.completedDates || [];
  const today = new Date().toLocaleDateString();
  if (!updatedDates.includes(today)) {
    updatedDates.push(today);
  }

  // Also record study time (increment of 5 minutes for opening)
  const updatedStats: StudyTimeStats = {
    ...stats,
    totalMinutes: stats.totalMinutes + 5,
    weeklyMinutes: stats.weeklyMinutes + 5,
    monthlyMinutes: stats.monthlyMinutes + 5,
    completedDates: updatedDates
  };

  return {
    ...user,
    currentCourseId: courseId,
    currentLessonId: lessonId,
    recentHistory: history,
    studyTimeStats: updatedStats
  };
}

/**
 * Updates user when they complete a lesson
 */
export function trackLessonComplete(
  user: ExtendedUserProfile,
  courseId: string,
  lessonId: string,
  lessonTitle: string,
  xpEarned: number = 100
): ExtendedUserProfile {
  const completedLessons = user.completedLessons || [];
  const isAlreadyCompleted = completedLessons.includes(lessonId);
  const updatedLessons = isAlreadyCompleted ? completedLessons : [...completedLessons, lessonId];

  const history = addHistoryEntry(
    user,
    "lesson_complete",
    lessonTitle,
    `Completed lesson successfully! +${xpEarned} XP`
  );

  const stats = getOrCreateStats(user);
  const today = new Date().toLocaleDateString();
  const updatedDates = stats.completedDates || [];
  if (!updatedDates.includes(today)) {
    updatedDates.push(today);
  }

  const updatedStats: StudyTimeStats = {
    ...stats,
    lessonsCompletedCount: updatedLessons.length,
    totalMinutes: stats.totalMinutes + 15, // reward study time
    weeklyMinutes: stats.weeklyMinutes + 15,
    monthlyMinutes: stats.monthlyMinutes + 15,
    completedDates: updatedDates
  };

  // Update daily goals
  const goals = getOrCreateGoals(user).map(g => {
    if (g.id === "goal-lesson-daily") {
      const newVal = g.currentValue + 1;
      return {
        ...g,
        currentValue: newVal,
        remainingValue: Math.max(0, g.targetValue - newVal)
      };
    }
    if (g.id === "goal-study-daily") {
      const newVal = g.currentValue + 15;
      return {
        ...g,
        currentValue: newVal,
        remainingValue: Math.max(0, g.targetValue - newVal)
      };
    }
    return g;
  });

  return {
    ...user,
    completedLessons: updatedLessons,
    recentHistory: history,
    studyTimeStats: updatedStats,
    learningGoals: goals
  };
}

/**
 * Updates user when they submit a quiz result
 */
export function trackQuizResult(
  user: ExtendedUserProfile,
  quizId: string,
  quizTitle: string,
  score: number,
  totalQuestions: number,
  passed: boolean
): ExtendedUserProfile {
  const currentResults = user.quizResults || [];
  const newResult: QuizResult = {
    quizId,
    score,
    totalQuestions,
    passed,
    date: new Date().toLocaleDateString()
  };

  const updatedResults = [newResult, ...currentResults.filter(r => r.quizId !== quizId)];

  const history = addHistoryEntry(
    user,
    passed ? "quiz_pass" : "quiz_fail",
    quizTitle,
    passed 
      ? `Passed Quiz with ${score}/${totalQuestions} score! 🏆` 
      : `Scored ${score}/${totalQuestions} on Quiz. Keep learning!`
  );

  const stats = getOrCreateStats(user);
  const passedCount = updatedResults.filter(r => r.passed).length;
  
  // Calculate average score
  const totalScores = updatedResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0);
  const avgScore = updatedResults.length > 0 ? Math.round(totalScores / updatedResults.length) : 85;

  const updatedStats: StudyTimeStats = {
    ...stats,
    quizzesPassedCount: passedCount,
    averageQuizScore: avgScore,
    totalMinutes: stats.totalMinutes + 10,
    weeklyMinutes: stats.weeklyMinutes + 10,
    monthlyMinutes: stats.monthlyMinutes + 10
  };

  return {
    ...user,
    quizResults: updatedResults,
    recentHistory: history,
    studyTimeStats: updatedStats
  };
}

/**
 * Updates user when they complete a project
 */
export function trackProjectComplete(
  user: ExtendedUserProfile,
  projectId: string,
  projectTitle: string
): ExtendedUserProfile {
  const completedProjects = user.completedProjects || [];
  const isAlreadyCompleted = completedProjects.includes(projectId);
  const updatedProjects = isAlreadyCompleted ? completedProjects : [...completedProjects, projectId];

  const history = addHistoryEntry(
    user,
    "project_complete",
    projectTitle,
    "Completed practical programming project! 💻"
  );

  const stats = getOrCreateStats(user);
  const updatedStats: StudyTimeStats = {
    ...stats,
    projectsCompletedCount: updatedProjects.length,
    totalMinutes: stats.totalMinutes + 30, // reward 30 minutes study time
    weeklyMinutes: stats.weeklyMinutes + 30,
    monthlyMinutes: stats.monthlyMinutes + 30
  };

  return {
    ...user,
    completedProjects: updatedProjects,
    recentHistory: history,
    studyTimeStats: updatedStats
  };
}

/**
 * Rich Bookmark structure sync helper
 */
export function toggleRichBookmark(
  user: ExtendedUserProfile,
  itemId: string,
  category: RichBookmark["category"],
  title: string,
  path?: string
): ExtendedUserProfile {
  const currentBookmarks = user.richBookmarks || [];
  const isBookmarked = currentBookmarks.some(b => b.id === itemId);
  
  let updatedRich: RichBookmark[];
  let updatedSimple: string[] = user.bookmarks || [];

  if (isBookmarked) {
    updatedRich = currentBookmarks.filter(b => b.id !== itemId);
    updatedSimple = updatedSimple.filter(b => b !== itemId);
  } else {
    updatedRich = [
      ...currentBookmarks,
      {
        id: itemId,
        category,
        title,
        path,
        date: new Date().toLocaleDateString()
      }
    ];
    if (!updatedSimple.includes(itemId)) {
      updatedSimple = [...updatedSimple, itemId];
    }
  }

  return {
    ...user,
    bookmarks: updatedSimple,
    richBookmarks: updatedRich
  };
}

/**
 * Save search query
 */
export function trackSearch(user: ExtendedUserProfile, queryText: string): ExtendedUserProfile {
  if (!queryText.trim()) return user;
  
  const history = user.searchHistory || [];
  const updatedHistory = [queryText, ...history.filter(q => q !== queryText)].slice(0, 10);

  return {
    ...user,
    searchHistory: updatedHistory
  };
}

/**
 * Safe update reading position
 */
export function trackReadingPosition(
  user: ExtendedUserProfile,
  lessonId: string,
  positionPercent: number
): ExtendedUserProfile {
  const progress = user.lessonProgress || {};
  const currentMax = progress[lessonId] || 0;
  
  // Only update if reading position has increased (do not roll back progress)
  if (positionPercent > currentMax) {
    return {
      ...user,
      lessonProgress: {
        ...progress,
        [lessonId]: Math.min(Math.round(positionPercent), 100)
      }
    };
  }
  return user;
}
