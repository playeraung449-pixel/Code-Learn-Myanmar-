/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Award, 
  Trophy, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  Crown, 
  Flame, 
  Clock, 
  PlusCircle, 
  Settings, 
  Megaphone, 
  CheckCheck,
  Calendar,
  Layers,
  Send,
  Lock,
  ExternalLink,
  Sliders,
  BellOff,
  PlayCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Zap
} from "lucide-react";
import { UserProfile, AppNotification, NotificationCategory, NotificationPreferences, AnnouncementItem } from "../types";
import { 
  getUserNotifications, 
  getPaginatedUserNotifications,
  createNotification, 
  markNotificationAsRead, 
  deleteNotificationFromDb,
  getAdminAnnouncements,
  createAdminAnnouncement,
  deleteAdminAnnouncement
} from "../lib/db";
import { useFeedback } from "../context/FeedbackContext";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export default function NotificationsModal({ isOpen, onClose, user, onNavigateTab }: NotificationsModalProps) {
  const [activeView, setActiveView] = useState<"notifications" | "simulator" | "preferences" | "admin">("notifications");
  const [selectedCategory, setSelectedCategory] = useState<"all" | NotificationCategory>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastNotifDoc, setLastNotifDoc] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { 
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    notifyLessonCompleted,
    notifyQuizResult,
    notifyAchievementUnlocked,
    notifyPremiumActivated,
    notifyPremiumExpiring,
    notifyAdminMessage
  } = useFeedback();

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem("clm_notification_preferences");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      enableLearning: true,
      enableCommunity: true,
      enableAnnouncement: true,
      enableReminder: true
    };
  });

  // Admin New Notification / Announcement Form State
  const [adminTitle, setAdminTitle] = useState("");
  const [adminTitleMm, setAdminTitleMm] = useState("");
  const [adminContent, setAdminContent] = useState("");
  const [adminContentMm, setAdminContentMm] = useState("");
  const [adminCategory, setAdminCategory] = useState<NotificationCategory>("announcement");
  const [adminType, setAdminType] = useState<string>("general_announcement");
  const [adminTargetAudience, setAdminTargetAudience] = useState<"all" | "premium_only">("all");
  const [adminScheduleDate, setAdminScheduleDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Comprehensive Seed Notifications covering all 6 essential events
  const defaultSeeds: AppNotification[] = [
    {
      id: "seed-1",
      title: "Lesson Completed: JavaScript Async & Promises 🎉 (+100 XP)",
      titleMm: "သင်ခန်းစာ အောင်မြင်စွာ ပြီးမြောက်ပါသည်! 🎉 (+100 XP)",
      description: "You completed 'Async/Await Mastery' in JavaScript Masterclass.",
      descriptionMm: "JavaScript Masterclass သင်တန်းမှ 'Async/Await Mastery' သင်ခန်းစာကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့ပါသည်။",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      category: "learning",
      type: "lesson_completed",
      read: false,
      actionTab: "courses"
    },
    {
      id: "seed-2",
      title: "Quiz Passed: React Hooks & State 🏆 (10/10 Score - 100%)",
      titleMm: "Quiz စံချိန်တင်အောင်မြင်မှု 🎉 (၁၀/၁၀ ရမှတ် - ၁၀၀%)",
      description: "Congratulations! You scored 10/10 on React Hooks Quiz and earned 50 coins!",
      descriptionMm: "ဂုဏ်ယူပါသည်! React Hooks Quiz ကို အမှားအယွင်းမရှိ ၁၀၀% အပြည့် ဖြေဆိုအောင်မြင်ခဲ့ပါသည်။",
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      category: "learning",
      type: "quiz_results",
      read: false,
      actionTab: "courses"
    },
    {
      id: "seed-3",
      title: "Achievement Unlocked: '7-Day Code Warrior' 🌟",
      titleMm: "အောင်မြင်မှုဆုတံဆိပ် အသစ်ရရှိပါသည်! 🌟 '၇ ရက်ဆက်တိုက် ဇွဲရှင်'",
      description: "You studied 7 consecutive days on Code Learn Myanmar. Keep the streak burning!",
      descriptionMm: "Code Learn Myanmar တွင် ၇ ရက်ဆက်တိုက် နေ့စဉ်မပျက်မကွက် လေ့လာနိုင်ခဲ့သဖြင့် ဆုတံဆိပ် ရရှိပါသည်။",
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      category: "kibo",
      type: "achievement_unlocked",
      read: false,
      actionTab: "profile"
    },
    {
      id: "seed-4",
      title: "Premium VIP Membership Activated! 👑",
      titleMm: "Premium VIP အဖွဲ့ဝင်မှု စတင်ပါပြီ! 👑",
      description: "Your VIP Access is now unlocked. Access Telegram HD Masterclasses & Source Code ZIPs.",
      descriptionMm: "သင်၏ VIP အဖွဲ့ဝင်မှု စတင်ပါပြီ။ Private Telegram Channel တွင် HD သင်ခန်းစာဗီဒီယိုများနှင့် Project Source Code များကို ရယူနိုင်ပါပြီ။",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      category: "premium",
      type: "premium_activated",
      read: true,
      actionTab: "premium"
    },
    {
      id: "seed-5",
      title: "Premium Membership Expiring Soon ⏳ (5 days left)",
      titleMm: "Premium သက်တမ်း ကုန်ဆုံးရန် ၅ ရက်သာ ကျန်ရှိပါတော့သည် ⏳",
      description: "Your 1-Year VIP plan will expire in 5 days. Renew today to maintain Telegram VIP access.",
      descriptionMm: "သင်၏ VIP အဖွဲ့ဝင်သက်တမ်းသည် ၅ ရက်အတွင်း ကုန်ဆုံးမည်ဖြစ်ပါသည်။ အနှောင့်အယှက်မရှိ ဆက်လက်လေ့လာရန် သက်တမ်းတိုးနိုင်ပါသည်။",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      category: "premium",
      type: "premium_expiring",
      read: true,
      actionTab: "premium"
    },
    {
      id: "seed-6",
      title: "Admin Announcement: Next-Gen Full-Stack Course Live! 📢",
      titleMm: "Admin သတင်းစကား: Next.js 15 & AI Full-Stack သင်တန်းအသစ် ထွက်ရှိပါပြီ! 📢",
      description: "A new industry-ready course has been published. Explore interactive sandboxes and practical projects.",
      descriptionMm: "ခေတ်မီ Next.js 15 နှင့် Gemini AI ပေါင်းစပ်တည်ဆောက်နည်း သင်တန်းကို ယခုပင် စတင်လေ့လာနိုင်ပါပြီ။",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      category: "announcement",
      type: "admin_message",
      read: true,
      actionTab: "courses"
    }
  ];

  // Fetch Notifications & Announcements with pagination
  const fetchNotifsBatch = async (cursor: any = null, isInitial: boolean = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await getPaginatedUserNotifications({
        userId: user?.uid,
        pageSize: 15,
        lastDoc: cursor
      });

      if (isInitial) {
        if (!res.notifications || res.notifications.length === 0) {
          setNotifications(defaultSeeds);
          localStorage.setItem("clm_user_notifications", JSON.stringify(defaultSeeds));
          setHasMore(false);
          setLastNotifDoc(null);
        } else {
          setNotifications(res.notifications);
          setHasMore(res.hasMore);
          setLastNotifDoc(res.lastDoc);
        }

        const fetchedAnn = await getAdminAnnouncements();
        setAnnouncements(fetchedAnn);
      } else {
        setNotifications(prev => {
          const map = new Map<string, AppNotification>();
          prev.forEach(n => map.set(n.id, n));
          res.notifications.forEach(n => map.set(n.id, n));
          return Array.from(map.values());
        });
        setHasMore(res.hasMore);
        setLastNotifDoc(res.lastDoc);
      }
    } catch (e) {
      if (isInitial) {
        setNotifications(defaultSeeds);
        setHasMore(false);
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifsBatch(null, true);
  }, [isOpen, user?.uid]);

  const handleLoadMoreNotifs = () => {
    if (!isLoadingMore && hasMore && lastNotifDoc) {
      fetchNotifsBatch(lastNotifDoc, false);
    }
  };

  // Handle ESC Key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Save Preferences Change
  const handlePreferenceToggle = (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      localStorage.setItem("clm_notification_preferences", JSON.stringify(updated));
    } catch (e) {}
  };

  // Mark single read
  const handleMarkRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await markNotificationAsRead(id);
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("clm_user_notifications", JSON.stringify(updated));
    } catch (e) {}
  };

  // Clear / Delete single
  const handleDeleteNotif = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await deleteNotificationFromDb(id);
  };

  // Delete all
  const handleClearAll = async () => {
    setNotifications([]);
    try {
      localStorage.setItem("clm_user_notifications", JSON.stringify([]));
    } catch (e) {}
  };

  // Handle Action Click
  const handleNotifClick = (notif: AppNotification) => {
    if (!notif.read) handleMarkRead(notif.id);
    if (notif.actionTab && onNavigateTab) {
      onNavigateTab(notif.actionTab);
      onClose();
    }
  };

  // Admin submit notification / announcement
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || !adminContent.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const isAnn = adminCategory === "announcement";
      if (isAnn) {
        await createAdminAnnouncement({
          title: adminTitle,
          titleMm: adminTitleMm || adminTitle,
          content: adminContent,
          contentMm: adminContentMm || adminContent,
          type: adminType === 'course_announcement' ? 'Course' :
                adminType === 'maintenance_notice' ? 'Maintenance' :
                adminType === 'promotion' ? 'Promotion' :
                adminType === 'learning_event' ? 'Learning Event' : 'General',
          targetAudience: adminTargetAudience,
          scheduledTime: adminScheduleDate || undefined,
          author: user?.name || "Admin",
          isPublished: true
        });
      } else {
        await createNotification({
          title: adminTitle,
          titleMm: adminTitleMm || adminTitle,
          description: adminContent,
          descriptionMm: adminContentMm || adminContent,
          category: adminCategory,
          type: adminType,
          targetAudience: adminTargetAudience,
          scheduledTime: adminScheduleDate || undefined,
          createdBy: 'admin'
        });
      }

      setSuccessMsg("အသိပေးချက် / ကြေညာချက် အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ! 🎉");
      setAdminTitle("");
      setAdminTitleMm("");
      setAdminContent("");
      setAdminContentMm("");

      // Reload
      const updated = await getUserNotifications(user?.uid);
      setNotifications(updated);
      const updatedAnn = await getAdminAnnouncements();
      setAnnouncements(updatedAnn);

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await deleteAdminAnnouncement(id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  // Filter notifications based on preference settings & categories
  const filteredNotifications = notifications.filter(n => {
    // Check user category toggle preferences
    if (n.category === "learning" && !preferences.enableLearning) return false;
    if (n.category === "community" && !preferences.enableCommunity) return false;
    if (n.category === "announcement" && !preferences.enableAnnouncement) return false;
    if ((n.category === "kibo" || n.category === "system") && !preferences.enableReminder) return false;

    // Check audience
    if (n.targetAudience === "premium_only" && user?.role !== "premium" && user?.role !== "admin") return false;

    // Check category filter
    if (selectedCategory !== "all" && n.category !== selectedCategory) return false;

    // Check unread filter
    if (unreadOnly && n.read) return false;

    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryBadge = (category: NotificationCategory, type?: string) => {
    // Check specific event type first for high-fidelity visual context
    if (type === "lesson_completed") {
      return { label: "သင်ခန်းစာ ပြီးမြောက်ခြင်း", icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" />, bg: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" };
    }
    if (type === "quiz_results") {
      return { label: "Quiz ရလဒ် & အမှတ်", icon: <Trophy className="w-3.5 h-3.5 text-amber-500" />, bg: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" };
    }
    if (type === "achievement_unlocked") {
      return { label: "အောင်မြင်မှုဆုတံဆိပ်", icon: <Award className="w-3.5 h-3.5 text-purple-500" />, bg: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400" };
    }
    if (type === "premium_activated") {
      return { label: "Premium VIP စတင်ခြင်း", icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, bg: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" };
    }
    if (type === "premium_expiring" || type === "premium_expiring_soon") {
      return { label: "Premium သက်တမ်းသတိပေးချက်", icon: <Clock className="w-3.5 h-3.5 text-rose-500" />, bg: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" };
    }
    if (type === "admin_message") {
      return { label: "Admin သတင်းစကား", icon: <Megaphone className="w-3.5 h-3.5 text-indigo-500" />, bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400" };
    }

    switch (category) {
      case "learning": return { label: "သင်ကြားရေး", icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" />, bg: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" };
      case "community": return { label: "ကွန်မြူနတီ", icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />, bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" };
      case "system": return { label: "စနစ်ပိုင်း", icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />, bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400" };
      case "premium": return { label: "Premium", icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, bg: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" };
      case "kibo": return { label: "Kibo Reminders", icon: <Flame className="w-3.5 h-3.5 text-rose-500" />, bg: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" };
      case "announcement": return { label: "ကြေညာချက်", icon: <Megaphone className="w-3.5 h-3.5 text-purple-500" />, bg: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400" };
      default: return { label: "General", icon: <Bell className="w-3.5 h-3.5 text-slate-500" />, bg: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400" };
    }
  };

  const getTimeAgo = (timeStr: string) => {
    try {
      const diff = Date.now() - new Date(timeStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "လောလောဆယ်";
      if (minutes < 60) return `${minutes} မိနစ်အလို`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} နာရီအလို`;
      const days = Math.floor(hours / 24);
      return `${days} ရက်အလို`;
    } catch (e) {
      return timeStr;
    }
  };

  const isAdmin = user?.role === "admin" || user?.email === "student@codelearnmyanmar.edu.mm";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 text-left">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-4 sm:mt-10 animate-fade-in animate-duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  အသိပေးချက်စင်တာ (Notification Center)
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} မဖတ်ရသေးပါ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                သင်ယူမှု၊ ကွန်မြူနတီနှင့် စနစ်အသိပေးချက်များ
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B] overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setActiveView("notifications")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === "notifications"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>အသိပေးချက်များ ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveView("simulator")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === "simulator"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Events & Feedback Test</span>
            </button>

            <button
              onClick={() => setActiveView("preferences")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeView === "preferences"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>အကြိုက်ဆက်တင်များ</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveView("admin")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeView === "admin"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Admin ဖန်တီးရန်</span>
              </button>
            )}
          </div>

          {activeView === "notifications" && notifications.length > 0 && (
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={handleMarkAllRead}
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ဖတ်ပြီးသားပြုလုပ်ရန်</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={handleClearAll}
                className="text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer transition-all"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">အားလုံးဖျက်မည်</span>
              </button>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS TAB VIEW */}
        {activeView === "notifications" && (
          <div>
            {/* Category Filter Chips */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  အားလုံး ({notifications.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("learning")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "learning"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>သင်ကြားရေး</span>
                </button>
                <button
                  onClick={() => setSelectedCategory("community")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "community"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>ကွန်မြူနတီ</span>
                </button>
                <button
                  onClick={() => setSelectedCategory("system")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "system"
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>စနစ်ပိုင်း</span>
                </button>
                <button
                  onClick={() => setSelectedCategory("premium")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "premium"
                      ? "bg-amber-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </button>
                <button
                  onClick={() => setSelectedCategory("kibo")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "kibo"
                      ? "bg-rose-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>Kibo</span>
                </button>
                <button
                  onClick={() => setSelectedCategory("announcement")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    selectedCategory === "announcement"
                      ? "bg-purple-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <Megaphone className="w-3 h-3" />
                  <span>ကြေညာချက်</span>
                </button>
              </div>

              {/* Unread Only Toggle */}
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1 ${
                  unreadOnly 
                    ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <span>မဖတ်ရသေးပါသီးသန့်</span>
              </button>
            </div>

            {/* Notification List Body */}
            <div className="p-6 max-h-[460px] overflow-y-auto space-y-3 scrollbar-thin">
              {isLoading ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">အသိပေးချက်များကို ရယူနေပါသည်...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => {
                    const badge = getCategoryBadge(notif.category, notif.type);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-4 rounded-2xl border transition-all relative group flex items-start gap-4 text-left cursor-pointer ${
                          notif.read
                            ? "bg-slate-50/50 border-slate-200/60 dark:bg-slate-900/30 dark:border-slate-800/80 text-slate-500"
                            : "bg-blue-500/5 border-blue-500/20 dark:bg-blue-600/10 dark:border-blue-500/30 text-slate-800 dark:text-slate-100 shadow-sm"
                        }`}
                      >
                        {/* Unread Dot Indicator */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}

                        {/* Category Badge Icon */}
                        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${badge.bg}`}>
                          {badge.icon}
                        </div>

                        {/* Content details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              • {getTimeAgo(notif.timestamp)}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold leading-snug ${notif.read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
                            {notif.titleMm || notif.title}
                          </h4>

                          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {notif.descriptionMm || notif.description}
                          </p>

                          {notif.actionTab && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
                              <span>သွားရောက်ကြည့်ရှုရန်</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Quick Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotif(notif.id);
                          }}
                          className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 self-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Incremental Load More Button */}
                  {hasMore && (
                    <div className="pt-2 pb-1 text-center">
                      <button
                        onClick={handleLoadMoreNotifs}
                        disabled={isLoadingMore}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span>အသိပေးချက်များ ရယူနေပါသည်...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>ယခင် အသိပေးချက်များ ထပ်မံကြည့်ရန် (Load Older Notifications)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <BellOff className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    အသိပေးချက်များ မရှိသေးပါဗျာ
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    ရွေးချယ်ထားသော အမျိုးအစားတွင် အသိပေးချက် မရှိပါ။ သင်တန်းတက်ရောက်မှုနှင့် အကောင့်လှုပ်ရှားမှုများရှိပါက ဤနေရာတွင် ပေါ်လာပါမည်။
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Guarantee Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>လုံခြုံရေး: သင်၏ ကိုယ်ပိုင်အကောင့်အချက်အလက်များကိုသာ ဖော်ပြပါသည်</span>
              </span>
              <span className="hidden sm:inline">Code Learn Myanmar Safety</span>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB VIEW */}
        {activeView === "preferences" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>အသိပေးချက် စိတ်ကြိုက်ပြင်ဆင်ခြင်း (Notification Preferences)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                မိမိလက်ခံရယူလိုသော အသိပေးချက် အမျိုးအစားများကို ပိတ်/ဖွင့် ပြုလုပ်နိုင်ပါသည်။
              </p>
            </div>

            <div className="space-y-4">
              {/* Learning Notifications Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                      သင်ကြားရေး အသိပေးချက်များ (Learning Notifications)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    သင်ခန်းစာပြီးစီးမှု၊ Quiz အမှတ်များ၊ Assignment အပ်ဒိတ်များနှင့် ဘွဲ့ရလက်မှတ် ရရှိမှုများကို အသိပေးပါမည်။
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableLearning}
                  onChange={() => handlePreferenceToggle("enableLearning")}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Community Notifications Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                      ကွန်မြူနတီ အသိပေးချက်များ (Community Notifications)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    အမေး/အဖြေဖိုရမ်တွင် မိမိမေးခွန်းကို အကြောင်းပြန်မှုများ၊ Best Answer သတ်မှတ်ခံရမှုနှင့် Helpful Vote ရရှိမှုများကို အသိပေးပါမည်။
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableCommunity}
                  onChange={() => handlePreferenceToggle("enableCommunity")}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Announcements Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-purple-500" />
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                      ကြေညာချက်များ (Announcement Notifications)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    သင်တန်းသစ်ထွက်ရှိမှု၊ စနစ်ပြုပြင်ထိန်းသိမ်းမှု၊ ပရိုမိုးရှင်းများနှင့် သင်ကြားရေးပွဲလမ်းသဘင် အသိပေးချက်များကို အသိပေးပါမည်။
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableAnnouncement}
                  onChange={() => handlePreferenceToggle("enableAnnouncement")}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Reminders Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                      Kibo Reminder သတိပေးချက်များ (Learning Reminders)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    နေ့စဉ်လေ့လာမှုသတိပေးချက်၊ Streak ထိန်းသိမ်းရန်နှိုးဆော်ချက်နှင့် အပတ်စဉ်လေ့လာမှု အကျဉ်းချုပ်များကို အသိပေးပါမည်။
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.enableReminder}
                  onChange={() => handlePreferenceToggle("enableReminder")}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* EVENTS & FEEDBACK SIMULATOR TAB VIEW */}
        {activeView === "simulator" && (
          <div className="p-6 max-h-[500px] overflow-y-auto space-y-6 scrollbar-thin">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <Zap className="w-4 h-4" />
                <span>အသိပေးချက် & Visual Feedback စမ်းသပ်ခန်း (Interactive Testing Studio)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                သတ်မှတ်ထားသော Event ၆ မျိုးနှင့် Feedback ပုံစံ ၄ မျိုးကို ချက်ချင်းစမ်းသပ်ပြီး Toast နှင့် Notification Center နှစ်ခုစလုံးတွင် ကြည့်ရှုနိုင်ပါသည်။
              </p>
            </div>

            {/* Section 1: Important User Events (The 6 required events) */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-500" />
                <span>1. Important Event Notifications (အရေးကြီးသော ဖြစ်ရပ် ၆ မျိုး)</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Lesson Completed */}
                <button
                  onClick={async () => {
                    await notifyLessonCompleted({
                      courseTitle: "JavaScript Masterclass",
                      lessonTitle: "Async/Await & Promises Mastery",
                      xpEarned: 100,
                      courseId: "course-js"
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Lesson Completed</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    သင်ခန်းစာပြီးစီးကြောင်း အသိပေးချက် & +100 XP
                  </p>
                </button>

                {/* 2. Quiz Result */}
                <button
                  onClick={async () => {
                    await notifyQuizResult({
                      quizTitle: "React Components & Props",
                      score: 10,
                      totalQuestions: 10,
                      passed: true,
                      coinsEarned: 50,
                      xpEarned: 50
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Quiz Result (Passed)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Quiz အမှတ် ၁၀/၁၀ (၁၀၀%) ရလဒ် & +50 Coins
                  </p>
                </button>

                {/* 3. Achievement Unlocked */}
                <button
                  onClick={async () => {
                    await notifyAchievementUnlocked({
                      id: "streak-7",
                      title: "7-Day Code Streak Master",
                      titleMm: "၇ ရက်ဆက်တိုက် ဇွဲရှင်",
                      description: "You have maintained your coding streak for 7 full days!",
                      descriptionMm: "Code Learn Myanmar တွင် ၇ ရက်ဆက်တိုက် နေ့စဉ်မပျက်မကွက် လေ့လာနိုင်ခဲ့ပါသည်။",
                      icon: "🌟"
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Achievement Unlocked</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    ဆုတံဆိပ် '၇ ရက်ဆက်တိုက် ဇွဲရှင်' ရရှိမှု
                  </p>
                </button>

                {/* 4. Premium Activated */}
                <button
                  onClick={async () => {
                    await notifyPremiumActivated({
                      planName: "1-Year VIP Pass",
                      planDuration: "1 Year",
                      expiresAt: "2027-08-26"
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">4. Premium Activated</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    VIP အဖွဲ့ဝင်မှု စတင်ခြင်း & Telegram VIP Access
                  </p>
                </button>

                {/* 5. Premium Expiring */}
                <button
                  onClick={async () => {
                    await notifyPremiumExpiring({
                      daysLeft: 5,
                      planName: "1-Year VIP Pass",
                      expiryDate: "2026-08-31"
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">5. Premium Expiring</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Premium သက်တမ်း ၅ ရက်သာ ကျန်ရှိတော့သည့် သတိပေးချက်
                  </p>
                </button>

                {/* 6. Admin Message */}
                <button
                  onClick={async () => {
                    await notifyAdminMessage({
                      title: "Next-Gen Full-Stack Course Live! 📢",
                      titleMm: "Next.js 15 & AI Full-Stack သင်တန်းအသစ် ထွက်ရှိပါပြီ! 📢",
                      message: "A new industry-ready course has been published. Explore interactive sandboxes and practical projects.",
                      messageMm: "ခေတ်မီ Next.js 15 နှင့် Gemini AI ပေါင်းစပ်တည်ဆောက်နည်း သင်တန်းအသစ် ထွက်ရှိပါပြီ။",
                      actionTab: "courses"
                    }, user);
                    fetchNotifsBatch(null, true);
                  }}
                  className="p-3 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">6. Admin Message</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Admin သတင်းစကားနှင့် ကြေညာချက်
                  </p>
                </button>
              </div>
            </div>

            {/* Section 2: Visual Feedback Types (Success, Error, Warning, Loading) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Clear Visual Feedback Types (တုန့်ပြန်မှုပုံစံ ၄ မျိုး)</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Success Feedback */}
                <button
                  onClick={() => showSuccess("Profile Saved Successfully!", "ကိုယ်ရေးအချက်အလက်များကို သိမ်းဆည်းပြီးပါပြီ။", {
                    titleMm: "အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!",
                    messageMm: "ကိုယ်ရေးအချက်အလက်များကို သိမ်းဆည်းပြီးပါပြီ။"
                  })}
                  className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Success</span>
                  <span className="text-[10px] text-slate-400">အောင်မြင်မှု</span>
                </button>

                {/* Error Feedback */}
                <button
                  onClick={() => showError("Network Connection Error", "အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။", {
                    titleMm: "ချိတ်ဆက်မှု ချို့ယွင်းချက်",
                    messageMm: "အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။"
                  })}
                  className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">Error</span>
                  <span className="text-[10px] text-slate-400">ချို့ယွင်းချက်</span>
                </button>

                {/* Warning Feedback */}
                <button
                  onClick={() => showWarning("Streak at Risk!", "ယနေ့ သင်ခန်းစာမပြီးပါက နေ့စဉ် Streak ဆုံးရှုံးနိုင်ပါသည်။", {
                    titleMm: "Streak သတိပေးချက်!",
                    messageMm: "ယနေ့ သင်ခန်းစာမပြီးပါက နေ့စဉ် Streak ဆုံးရှုံးနိုင်ပါသည်။"
                  })}
                  className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">Warning</span>
                  <span className="text-[10px] text-slate-400">သတိပေးချက်</span>
                </button>

                {/* Loading Feedback */}
                <button
                  onClick={() => {
                    const loader = showLoading("Processing Code Submission...", "ကုဒ်များကို စစ်ဆေးတွက်ချက်နေပါသည်...", {
                      titleMm: "ကုဒ်များကို စစ်ဆေးတွက်ချက်နေပါသည်...",
                      messageMm: "ခေတ္တစောင့်ဆိုင်းပေးပါရန်..."
                    });
                    setTimeout(() => {
                      loader.resolveSuccess(
                        "All Test Cases Passed! 100% Score",
                        "စမ်းသပ်ချက်အားလုံး အောင်မြင်ပါသည်။",
                        "စမ်းသပ်မှု အားလုံးအောင်မြင်ပါသည်! 🎉",
                        "၁၀၀% အပြည့်ဖြင့် အောင်မြင်စွာ စစ်ဆေးပြီးပါပြီ။"
                      );
                    }, 2000);
                  }}
                  className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <Loader2 className="w-5 h-5 text-blue-500 mx-auto mb-1 animate-spin" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">Loading</span>
                  <span className="text-[10px] text-slate-400">ဆောင်ရွက်ဆဲ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN MANAGEMENT TAB VIEW */}
        {activeView === "admin" && isAdmin && (
          <div className="p-6 max-h-[500px] overflow-y-auto space-y-6 scrollbar-thin">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-1">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                <Megaphone className="w-4 h-4" />
                <span>Admin Notification & Announcement Center</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ကျောင်းသားအားလုံး သို့မဟုတ် Premium ကျောင်းသားများထံ အသိပေးချက်များနှင့် ကြေညာချက်များ ဖန်တီးပေးပို့နိုင်ပါသည်။
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    အဓိက ခေါင်းစဉ် (English Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    placeholder="e.g. New React Course Launched!"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    မြန်မာ ခေါင်းစဉ် (Myanmar Title)
                  </label>
                  <input
                    type="text"
                    value={adminTitleMm}
                    onChange={(e) => setAdminTitleMm(e.target.value)}
                    placeholder="ဥပမာ - React သင်တန်းအသစ် ထွက်ရှိပါပြီ!"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  အသေးစိတ် အကြောင်းအရာ (Notification Content) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adminContent}
                  onChange={(e) => setAdminContent(e.target.value)}
                  placeholder="Enter detailed content or announcement message..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    အမျိုးအစား (Category)
                  </label>
                  <select
                    value={adminCategory}
                    onChange={(e) => setAdminCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="announcement">ကြေညာချက် (Announcement)</option>
                    <option value="system">စနစ်ပိုင်း (System)</option>
                    <option value="learning">သင်ကြားရေး (Learning)</option>
                    <option value="premium">Premium</option>
                    <option value="kibo">Kibo Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ရည်ရွယ်သူ (Target Audience)
                  </label>
                  <select
                    value={adminTargetAudience}
                    onChange={(e) => setAdminTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="all">ကျောင်းသားအားလုံး (All Students)</option>
                    <option value="premium_only">Premium ကျောင်းသားများသာ (Premium Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ထုတ်ပြန်ချိန် စီစဉ်ရန် (Schedule)
                  </label>
                  <input
                    type="date"
                    value={adminScheduleDate}
                    onChange={(e) => setAdminScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "ပေးပို့နေပါသည်..." : "အသိပေးချက် ပေးပို့မည်"}</span>
              </button>
            </form>

            {/* List Existing Announcements */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>ထုတ်ပြန်ထားပြီးသော ကြေညာချက်များ ({announcements.length})</span>
              </h5>

              {announcements.length > 0 ? (
                <div className="space-y-2">
                  {announcements.map((ann) => (
                    <div 
                      key={ann.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-white">{ann.titleMm || ann.title}</span>
                          <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded font-mono">{ann.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{ann.contentMm || ann.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-mono">ထုတ်ပြန်ထားသော ကြေညာချက် မရှိသေးပါ။</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
