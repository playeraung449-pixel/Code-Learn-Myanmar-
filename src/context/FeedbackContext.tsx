/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Loader2, 
  Info, 
  X, 
  ExternalLink,
  Sparkles,
  Trophy,
  Award,
  Crown,
  BookOpen,
  Megaphone,
  Clock,
  ArrowRight
} from "lucide-react";
import { AppNotification, NotificationType, NotificationCategory, UserProfile } from "../types";
import { createNotification, getUserNotifications } from "../lib/db";

export type ToastType = "success" | "error" | "warning" | "loading" | "info";

export interface ToastAction {
  label: string;
  labelMm?: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  titleMm?: string;
  message: string;
  messageMm?: string;
  duration?: number; // in ms; 0 or undefined for default (4500ms), Infinity for persistent
  action?: ToastAction;
  createdAt: number;
  icon?: ReactNode;
}

export interface LoadingToastController {
  id: string;
  update: (title: string, message: string, titleMm?: string, messageMm?: string) => void;
  resolveSuccess: (title: string, message: string, titleMm?: string, messageMm?: string, duration?: number) => void;
  resolveError: (title: string, message: string, titleMm?: string, messageMm?: string, duration?: number) => void;
  dismiss: () => void;
}

export interface LessonCompletedEventParams {
  courseTitle: string;
  lessonTitle: string;
  xpEarned?: number;
  courseId?: string;
  lessonId?: string;
}

export interface QuizResultEventParams {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  coinsEarned?: number;
  xpEarned?: number;
}

export interface AchievementUnlockedEventParams {
  id?: string;
  title: string;
  titleMm?: string;
  description: string;
  descriptionMm?: string;
  icon?: string;
}

export interface PremiumActivatedEventParams {
  planName: string;
  planDuration?: string;
  expiresAt?: string;
}

export interface PremiumExpiringEventParams {
  daysLeft: number;
  planName?: string;
  expiryDate?: string;
}

export interface AdminMessageEventParams {
  title: string;
  titleMm?: string;
  message: string;
  messageMm?: string;
  author?: string;
  actionUrl?: string;
  actionTab?: string;
}

interface FeedbackContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id" | "createdAt">) => string;
  showSuccess: (title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => string;
  showError: (title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => string;
  showWarning: (title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => string;
  showInfo: (title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => string;
  showLoading: (title: string, message: string, options?: { titleMm?: string; messageMm?: string }) => LoadingToastController;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;

  // Specific event triggers for notifications & visual feedback
  notifyLessonCompleted: (params: LessonCompletedEventParams, user?: UserProfile) => Promise<void>;
  notifyQuizResult: (params: QuizResultEventParams, user?: UserProfile) => Promise<void>;
  notifyAchievementUnlocked: (params: AchievementUnlockedEventParams, user?: UserProfile) => Promise<void>;
  notifyPremiumActivated: (params: PremiumActivatedEventParams, user?: UserProfile) => Promise<void>;
  notifyPremiumExpiring: (params: PremiumExpiringEventParams, user?: UserProfile) => Promise<void>;
  notifyAdminMessage: (params: AdminMessageEventParams, user?: UserProfile) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id" | "createdAt">): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      createdAt: Date.now(),
      duration: toast.duration ?? (toast.type === "loading" ? 0 : 5000)
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 active toasts

    if (newToast.duration && newToast.duration > 0 && newToast.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  }, [dismissToast]);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => {
    return showToast({
      type: "success",
      title,
      message,
      ...options
    });
  }, [showToast]);

  const showError = useCallback((title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => {
    return showToast({
      type: "error",
      title,
      message,
      duration: options?.duration ?? 6500, // slightly longer for errors so users can read
      ...options
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => {
    return showToast({
      type: "warning",
      title,
      message,
      duration: options?.duration ?? 5500,
      ...options
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Omit<ToastItem, "id" | "type" | "title" | "message" | "createdAt">>) => {
    return showToast({
      type: "info",
      title,
      message,
      ...options
    });
  }, [showToast]);

  const showLoading = useCallback((title: string, message: string, options?: { titleMm?: string; messageMm?: string }): LoadingToastController => {
    const id = showToast({
      type: "loading",
      title,
      titleMm: options?.titleMm,
      message,
      messageMm: options?.messageMm,
      duration: 0 // indefinite until resolved
    });

    return {
      id,
      update: (newTitle, newMessage, newTitleMm, newMessageMm) => {
        setToasts(prev => prev.map(t => t.id === id ? {
          ...t,
          title: newTitle,
          message: newMessage,
          titleMm: newTitleMm || t.titleMm,
          messageMm: newMessageMm || t.messageMm
        } : t));
      },
      resolveSuccess: (successTitle, successMessage, successTitleMm, successMessageMm, duration = 4000) => {
        setToasts(prev => prev.map(t => t.id === id ? {
          ...t,
          type: "success",
          title: successTitle,
          message: successMessage,
          titleMm: successTitleMm || t.titleMm,
          messageMm: successMessageMm || t.messageMm,
          duration
        } : t));
        setTimeout(() => dismissToast(id), duration);
      },
      resolveError: (errorTitle, errorMessage, errorTitleMm, errorMessageMm, duration = 6000) => {
        setToasts(prev => prev.map(t => t.id === id ? {
          ...t,
          type: "error",
          title: errorTitle,
          message: errorMessage,
          titleMm: errorTitleMm || t.titleMm,
          messageMm: errorMessageMm || t.messageMm,
          duration
        } : t));
        setTimeout(() => dismissToast(id), duration);
      },
      dismiss: () => dismissToast(id)
    };
  }, [showToast, dismissToast]);

  // Helper to persist in-app notification in DB / LocalStorage
  const persistNotification = async (notifData: {
    title: string;
    titleMm: string;
    description: string;
    descriptionMm: string;
    category: NotificationCategory;
    type: NotificationType;
    actionTab?: string;
    actionLabelMm?: string;
    userId?: string;
    createdBy?: string;
  }) => {
    try {
      // 1. Write to DB
      await createNotification({
        title: notifData.title,
        titleMm: notifData.titleMm,
        description: notifData.description,
        descriptionMm: notifData.descriptionMm,
        category: notifData.category,
        type: notifData.type,
        actionTab: notifData.actionTab,
        actionLabelMm: notifData.actionLabelMm,
        userId: notifData.userId,
        createdBy: notifData.createdBy || "system",
        targetAudience: notifData.userId ? "individual" : "all"
      });

      // 2. Also update local storage for immediate offline / quick reactive access
      const localKey = "clm_user_notifications";
      const existing = localStorage.getItem(localKey);
      const list: AppNotification[] = existing ? JSON.parse(existing) : [];
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: notifData.userId,
        title: notifData.title,
        titleMm: notifData.titleMm,
        description: notifData.description,
        descriptionMm: notifData.descriptionMm,
        timestamp: new Date().toISOString(),
        category: notifData.category,
        type: notifData.type,
        read: false,
        actionTab: notifData.actionTab,
        actionLabelMm: notifData.actionLabelMm,
        createdBy: notifData.createdBy || "system"
      };
      localStorage.setItem(localKey, JSON.stringify([newNotif, ...list].slice(0, 50)));
      window.dispatchEvent(new CustomEvent("clm_notification_added", { detail: newNotif }));
    } catch (e) {
      console.warn("Could not write notification to db:", e);
    }
  };

  // 1. LESSON COMPLETED EVENT
  const notifyLessonCompleted = useCallback(async (params: LessonCompletedEventParams, user?: UserProfile) => {
    const xp = params.xpEarned || 100;
    const title = `Lesson Completed! 🎉 (+${xp} XP)`;
    const titleMm = `သင်ခန်းစာ အောင်မြင်စွာ ပြီးမြောက်ပါသည်! 🎉 (+${xp} XP)`;
    const description = `You have completed "${params.lessonTitle}" in ${params.courseTitle}.`;
    const descriptionMm = `"${params.courseTitle}" မှ "${params.lessonTitle}" သင်ခန်းစာကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ပါသည်။`;

    // Trigger visual toast
    showToast({
      type: "success",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 5000,
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "learning",
      type: "lesson_completed",
      actionTab: "courses",
      actionLabelMm: "သင်တန်းများသို့ သွားရန်",
      userId: user?.uid
    });
  }, [showToast]);

  // 2. QUIZ RESULT EVENT
  const notifyQuizResult = useCallback(async (params: QuizResultEventParams, user?: UserProfile) => {
    const isPassed = params.passed;
    const pct = Math.round((params.score / params.totalQuestions) * 100);

    const title = isPassed 
      ? `Quiz Passed! 🏆 (${params.score}/${params.totalQuestions} - ${pct}%)`
      : `Quiz Completed (${params.score}/${params.totalQuestions} - ${pct}%)`;

    const titleMm = isPassed
      ? `Quiz အောင်မြင်ပါသည်! 🏆 (${params.score}/${params.totalQuestions} ရမှတ် - ${pct}%)`
      : `Quiz အဖြေလွှာ ပေးပို့ပြီးပါပြီ (${params.score}/${params.totalQuestions} ရမှတ် - ${pct}%)`;

    const description = isPassed
      ? `Congratulations! You mastered "${params.quizTitle}" and earned ${params.coinsEarned || 50} coins!`
      : `You scored ${pct}% on "${params.quizTitle}". A score of 80% is required to pass. Review the lesson and try again!`;

    const descriptionMm = isPassed
      ? `ဂုဏ်ယူပါသည်! "${params.quizTitle}" Quiz ကို အောင်မြင်စွာ ဖြေဆိုနိုင်ခဲ့ပြီး Coins ${params.coinsEarned || 50} ရရှိခဲ့ပါသည်။`
      : `"${params.quizTitle}" Quiz တွင် ${pct}% ရရှိခဲ့ပါသည်။ အောင်မြင်ရန် ၈၀% လိုအပ်သဖြင့် သင်ခန်းစာကို ပြန်လည်ဖတ်ရှု၍ ထပ်မံဖြေဆိုနိုင်ပါသည်။`;

    // Trigger visual toast
    showToast({
      type: isPassed ? "success" : "warning",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 6000,
      icon: isPassed ? <Trophy className="w-5 h-5 text-amber-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "learning",
      type: "quiz_results",
      actionTab: "courses",
      actionLabelMm: "သင်ခန်းစာသို့ ပြန်သွားရန်",
      userId: user?.uid
    });
  }, [showToast]);

  // 3. ACHIEVEMENT UNLOCKED EVENT
  const notifyAchievementUnlocked = useCallback(async (params: AchievementUnlockedEventParams, user?: UserProfile) => {
    const title = `Achievement Unlocked! 🌟 "${params.title}"`;
    const titleMm = `အောင်မြင်မှုဆုတံဆိပ် အသစ်ရရှိပါသည်! 🌟 "${params.titleMm || params.title}"`;
    const description = params.description || "You unlocked a new badge for your learning journey!";
    const descriptionMm = params.descriptionMm || "သင်၏ လေ့လာမှုမှတ်တမ်းတွင် ဆုတံဆိပ်အသစ်တစ်ခု ထည့်သွင်းနိုင်ခဲ့ပါပြီ!";

    // Trigger visual toast
    showToast({
      type: "success",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 6000,
      icon: <Award className="w-5 h-5 text-purple-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "kibo",
      type: "achievement_unlocked",
      actionTab: "profile",
      actionLabelMm: "ဆုတံဆိပ်များ ကြည့်ရှုရန်",
      userId: user?.uid
    });
  }, [showToast]);

  // 4. PREMIUM ACTIVATED EVENT
  const notifyPremiumActivated = useCallback(async (params: PremiumActivatedEventParams, user?: UserProfile) => {
    const title = `Premium Activated! 👑 (${params.planName})`;
    const titleMm = `Premium VIP အဖွဲ့ဝင်မှု စတင်ပါပြီ! 👑 (${params.planName})`;
    const description = `Your VIP membership is now active. Enjoy Telegram private masterclasses, HD videos, and all source codes!`;
    const descriptionMm = `သင်၏ Premium VIP အကောင့် အောင်မြင်စွာ စတင်နိုင်ခဲ့ပါပြီ။ Telegram HD Masterclass များ၊ Resource ZIP များနှင့် AI Mentor ကို အကန့်အသတ်မဲ့ အသုံးပြုနိုင်ပါပြီ။`;

    // Trigger visual toast
    showToast({
      type: "success",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 7000,
      icon: <Crown className="w-5 h-5 text-amber-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "premium",
      type: "premium_activated",
      actionTab: "premium",
      actionLabelMm: "VIP Telegram Hub သို့ သွားရန်",
      userId: user?.uid
    });
  }, [showToast]);

  // 5. PREMIUM EXPIRING EVENT
  const notifyPremiumExpiring = useCallback(async (params: PremiumExpiringEventParams, user?: UserProfile) => {
    const title = `Premium Expiring Soon ⏳ (${params.daysLeft} days remaining)`;
    const titleMm = `Premium သက်တမ်း ကုန်ဆုံးတော့မည် ⏳ (${params.daysLeft} ရက် ကျန်ရှိ)`;
    const description = `Your ${params.planName || "VIP membership"} is expiring in ${params.daysLeft} days. Renew to maintain uninterrupted Telegram VIP & AI access.`;
    const descriptionMm = `သင်၏ ${params.planName || "VIP အဖွဲ့ဝင်မှု"} သည် နောက်ထပ် ${params.daysLeft} ရက်အတွင်း သက်တမ်းကုန်ဆုံးတော့မည် ဖြစ်ပါသည်။ သက်တမ်းတိုး၍ ဆက်လက်အသုံးပြုနိုင်ပါသည်။`;

    // Trigger visual toast
    showToast({
      type: "warning",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 6500,
      icon: <Clock className="w-5 h-5 text-amber-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "premium",
      type: "premium_expiring",
      actionTab: "premium",
      actionLabelMm: "သက်တမ်းတိုးရန်",
      userId: user?.uid
    });
  }, [showToast]);

  // 6. ADMIN MESSAGE EVENT
  const notifyAdminMessage = useCallback(async (params: AdminMessageEventParams, user?: UserProfile) => {
    const title = params.title || "Message from Administration";
    const titleMm = params.titleMm || "Admin ထံမှ အထူးသတင်းစကား";
    const description = params.message;
    const descriptionMm = params.messageMm || params.message;

    // Trigger visual toast
    showToast({
      type: "info",
      title,
      titleMm,
      message: description,
      messageMm: descriptionMm,
      duration: 6000,
      icon: <Megaphone className="w-5 h-5 text-blue-500" />
    });

    // Save notification
    await persistNotification({
      title,
      titleMm,
      description,
      descriptionMm,
      category: "announcement",
      type: "admin_message",
      actionTab: params.actionTab || "community",
      actionLabelMm: "အသေးစိတ် ဖတ်ရှုရန်",
      createdBy: params.author || "Admin",
      userId: user?.uid
    });
  }, [showToast]);

  return (
    <FeedbackContext.Provider value={{
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showLoading,
      dismissToast,
      clearAllToasts,
      notifyLessonCompleted,
      notifyQuizResult,
      notifyAchievementUnlocked,
      notifyPremiumActivated,
      notifyPremiumExpiring,
      notifyAdminMessage
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}

export function useToast() {
  return useFeedback();
}

/**
 * Toast Container Component
 * Renders on top-right (desktop) / top-center (mobile) with high z-index and clear visual feedback
 */
function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <aside 
      aria-label="Notifications and Alerts"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none text-left"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </aside>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          cardBg: "bg-white dark:bg-slate-900 border-emerald-500/40 dark:border-emerald-500/50 shadow-emerald-500/10",
          iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          barBg: "bg-emerald-500",
          titleColor: "text-slate-900 dark:text-white",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
          badgeLabel: "Success",
          badgeLabelMm: "အောင်မြင်ပါသည်",
          defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        };
      case "error":
        return {
          cardBg: "bg-white dark:bg-slate-900 border-rose-500/40 dark:border-rose-500/50 shadow-rose-500/10",
          iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
          barBg: "bg-rose-500",
          titleColor: "text-slate-900 dark:text-white",
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300",
          badgeLabel: "Error",
          badgeLabelMm: "အမှားအယွင်း",
          defaultIcon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        };
      case "warning":
        return {
          cardBg: "bg-white dark:bg-slate-900 border-amber-500/40 dark:border-amber-500/50 shadow-amber-500/10",
          iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          barBg: "bg-amber-500",
          titleColor: "text-slate-900 dark:text-white",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
          badgeLabel: "Warning",
          badgeLabelMm: "သတိပေးချက်",
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        };
      case "loading":
        return {
          cardBg: "bg-white dark:bg-slate-900 border-blue-500/40 dark:border-blue-500/50 shadow-blue-500/10",
          iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
          barBg: "bg-blue-500",
          titleColor: "text-slate-900 dark:text-white",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300",
          badgeLabel: "Loading",
          badgeLabelMm: "ဆောင်ရွက်နေပါသည်...",
          defaultIcon: <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        };
      case "info":
      default:
        return {
          cardBg: "bg-white dark:bg-slate-900 border-sky-500/40 dark:border-sky-500/50 shadow-sky-500/10",
          iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
          barBg: "bg-sky-500",
          titleColor: "text-slate-900 dark:text-white",
          badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300",
          badgeLabel: "Info",
          badgeLabelMm: "အသိပေးချက်",
          defaultIcon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        };
    }
  };

  const style = getStyles(toast.type);

  return (
    <div 
      className={`pointer-events-auto rounded-2xl border-2 p-4 shadow-xl backdrop-blur-md transition-all duration-200 transform translate-y-0 opacity-100 hover:scale-[1.01] overflow-hidden relative flex flex-col gap-2.5 ${style.cardBg}`}
      role="alert"
    >
      {/* Visual Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.barBg}`} />

      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${style.iconBg}`}>
          {toast.icon || style.defaultIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.badgeLabel}
            </span>
            <h4 className={`text-xs sm:text-sm font-bold truncate ${style.titleColor}`}>
              {toast.title}
            </h4>
          </div>

          {toast.titleMm && toast.titleMm !== toast.title && (
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 mb-1 font-burmese">
              {toast.titleMm}
            </p>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {toast.message}
          </p>

          {toast.messageMm && toast.messageMm !== toast.message && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-burmese">
              {toast.messageMm}
            </p>
          )}

          {/* Action Button if provided */}
          {toast.action && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
              >
                <span>{toast.action.labelMm || toast.action.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
