/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Trophy, 
  BookOpen, 
  Award, 
  Printer, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  LogOut,
  CloudLightning,
  Coins as CoinsIcon,
  Flame,
  Bookmark,
  Activity,
  Key,
  Shield,
  Copy,
  Clock,
  Briefcase,
  Bell,
  Search,
  Edit3,
  Sliders,
  Eye,
  Download,
  AlertTriangle,
  Check,
  BookMarked,
  Grid,
  FileText,
  Lock,
  ChevronRight,
  HelpCircle,
  Upload,
  Loader2,
  ExternalLink,
  Globe,
  BarChart2,
  RotateCcw,
  Plus,
  Trash2,
  Code,
  Target,
  TrendingUp,
  Zap,
  PieChart,
  Brain,
  Compass,
  Layers,
  GitBranch,
  Server,
  Database,
  CheckCheck,
  Star,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  History,
  ShieldAlert,
  FileSpreadsheet,
  FileJson,
  CheckSquare,
  EyeOff,
  UserMinus,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Info,
  Send
} from "lucide-react";
import { 
  UserProfile, 
  Certificate, 
  Course, 
  Lesson, 
  Project, 
  BlogPost, 
  getLevelData, 
  UserSession, 
  UserSecurityLog,
  UserPrivacySettings
} from "../types";
import { COURSES, PROJECTS_DATA, BLOG_POSTS } from "../courses/data";
import PortfolioSystem from "../components/PortfolioSystem";
import { ThemeToggle } from "../components/ThemeToggle";
import { DataSaverSettingsCard } from "../components/DataSaverSettingsCard";
import { EmptyState } from "../components/EmptyState";
import { 
  sanitizeInput, 
  logAuditEvent, 
  deleteUserCloudData, 
  addUserSecurityLog, 
  saveUserProfile, 
  exportUserDataBackup, 
  restoreUserDataFromBackup,
  getUserPrivacySettings,
  saveUserPrivacySettings,
  getUserFullDataExport,
  exportUserDataAsJSON,
  exportUserDataAsCSV,
  clearUserAiChatHistory,
  DEFAULT_USER_PRIVACY_SETTINGS,
  CompleteUserDataArchive
} from "../lib/db";
import { auth } from "../lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, deleteUser } from "firebase/auth";

interface ProfileProps {
  user: UserProfile;
  firebaseUser: any;
  onSignOut: () => void;
  onOpenAuth: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "course" | "quiz" | "achievement" | "certificate" | "announcement";
  read: boolean;
}

export default function Profile({ 
  user, 
  firebaseUser, 
  onSignOut, 
  onOpenAuth, 
  onUpdateUser,
  theme,
  onThemeChange 
}: ProfileProps) {
  // Tabs: dashboard, statistics, bookmarks, certificates, portfolio, profile, privacy, settings
  const [activeTab, setActiveTab] = useState<"dashboard" | "statistics" | "bookmarks" | "certificates" | "portfolio" | "profile" | "privacy" | "settings">("dashboard");
  const [statsTimeRange, setStatsTimeRange] = useState<"all" | "month" | "week">("all");
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [autoLogout, setAutoLogout] = useState(() => {
    return localStorage.getItem("clm_auto_logout") === "true";
  });
  const [copiedUid, setCopiedUid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("");
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState(user?.photo || "");
  const [displayNameInput, setDisplayNameInput] = useState(user?.name || "Student");
  const [usernameInput, setUsernameInput] = useState(user?.username || `@${(user?.name || "student").toLowerCase().replace(/\s+/g, "_")}`);
  const [roadmapInput, setRoadmapInput] = useState(user?.currentRoadmap || "Full-Stack Web Developer Roadmap");
  const [visibilityInput, setVisibilityInput] = useState<"public" | "private" | "community">(user?.visibility || "public");
  const [githubUrlInput, setGithubUrlInput] = useState(user?.githubUrl || "");
  const [liveDemoUrlInput, setLiveDemoUrlInput] = useState(user?.liveDemoUrl || "");
  const [bioInput, setBioInput] = useState(user?.bio || "မင်္ဂလာပါ! ကျွန်တော်ကတော့ Code Learn Myanmar တွင် ပရိုဂရမ်မင်း စတင်လေ့လာနေသူတစ်ဦး ဖြစ်ပါတယ်ဗျာ။");
  const [languagePreference, setLanguagePreference] = useState<"my" | "en">(user?.preferredLanguage || "my");
  const [themePreference, setThemePreference] = useState<"light" | "dark" | "system">(user?.themePreference || "dark");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Privacy & Data Governance States
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(() => {
    return user.privacySettings || DEFAULT_USER_PRIVACY_SETTINGS;
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacySaveMessage, setPrivacySaveMessage] = useState<string | null>(null);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [selectedCsvScope, setSelectedCsvScope] = useState<"all" | "progress" | "quizzes" | "certificates" | "notes" | "payments">("all");
  const [isClearingAiHistory, setIsClearingAiHistory] = useState(false);
  const [aiClearSuccess, setAiClearSuccess] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1);
  const [deleteConsentChecked, setDeleteConsentChecked] = useState(false);
  
  // Kibo AI Assistance States
  const [kiboModalOpen, setKiboModalOpen] = useState(false);
  const [kiboActionType, setKiboActionType] = useState<"summary" | "goals" | "celebrate" | "encourage">("summary");
  const [kiboOutputText, setKiboOutputText] = useState("");
  const [isKiboLoading, setIsKiboLoading] = useState(false);

  // Saved Notes & Code Snippets Modal States
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteContentInput, setNoteContentInput] = useState("");
  const [showAddSnippetModal, setShowAddSnippetModal] = useState(false);
  const [snippetTitleInput, setSnippetTitleInput] = useState("");
  const [snippetCodeInput, setSnippetCodeInput] = useState("");
  const [snippetLangInput, setSnippetLangInput] = useState("javascript");

  // Admin Progress Reset Modal State
  const [showAdminResetModal, setShowAdminResetModal] = useState(false);
  const [adminResetConfirmText, setAdminResetConfirmText] = useState("");
  
  // Settings States
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Notifications toggles
  const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(true);
  const [notifyNewLessons, setNotifyNewLessons] = useState(true);
  const [notifyQuizResults, setNotifyQuizResults] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyCertificates, setNotifyCertificates] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);

  // Security Account Deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Data Backup & Export states
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  // In-app Notifications Bell states
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "သင်တန်းအသစ်ထွက်ရှိပါသည်! 🚀",
      description: "Git & GitHub အခြေခံသင်တန်းကို ယခုပင် စတင်လေ့လာနိုင်ပါပြီ။",
      time: "၁ နာရီအလို",
      category: "course",
      read: false
    },
    {
      id: "notif-2",
      title: "ဂုဏ်ထူးဆောင်တံဆိပ် ရရှိပါသည် 🏆",
      description: "'နွေးထွေးစွာကြိုဆိုအပ်ပါသည်' အောင်မြင်မှုတံဆိပ်ကို ရရှိခဲ့ပါသည်။",
      time: "၅ နာရီအလို",
      category: "achievement",
      read: false
    },
    {
      id: "notif-3",
      title: "Quiz စံချိန်တင်အောင်မြင်မှု 🎉",
      description: "Variables Quiz ကို ၁၀၀% အပြည့်ဖြင့် ဖြေဆိုအောင်မြင်ခဲ့ပါသည်။",
      time: "၁ ရက်အလို",
      category: "quiz",
      read: true
    },
    {
      id: "notif-4",
      title: "ဝက်ဘ်ဆိုက်အဆင့်မြှင့်တင်မှု ကြေညာချက်",
      description: "Ask AI သင်ကြားရေးလက်ထောက်ကို ပိုမိုမြန်ဆန်သော Gemini 1.5 Flash ဖြင့် အဆင့်မြှင့်တင်ထားပါသည်။",
      time: "၃ ရက်အလို",
      category: "announcement",
      read: true
    }
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem("clm_auto_logout", autoLogout ? "true" : "false");
  }, [autoLogout]);

  // Synchronize profile active subtab when dispatched from sidebar
  useEffect(() => {
    const handleSubTabChange = (e: Event) => {
      const customSubTab = (e as CustomEvent).detail;
      if (customSubTab) {
        setActiveTab(customSubTab);
      }
    };
    window.addEventListener("changeProfileSubTab", handleSubTabChange);
    return () => {
      window.removeEventListener("changeProfileSubTab", handleSubTabChange);
    };
  }, []);

  // Synchronize inputs when user object changes (e.g. from Cloud Load)
  useEffect(() => {
    if (!user) return;
    setDisplayNameInput(user.name || "Student");
    setUsernameInput(user.username || `@${(user.name || "student").toLowerCase().replace(/\s+/g, "_")}`);
    setRoadmapInput(user.currentRoadmap || "Full-Stack Web Developer Roadmap");
    setVisibilityInput(user.visibility || "public");
    setGithubUrlInput(user.githubUrl || "");
    setLiveDemoUrlInput(user.liveDemoUrl || "");
    setBioInput(user.bio || "မင်္ဂလာပါ! ကျွန်တော်ကတော့ Code Learn Myanmar တွင် ပရိုဂရမ်မင်း စတင်လေ့လာနေသူတစ်ဦး ဖြစ်ပါတယ်ဗျာ။");
    setSelectedPresetAvatar(user.photo || "");
    if (user.preferredLanguage) setLanguagePreference(user.preferredLanguage);
    if (user.themePreference) setThemePreference(user.themePreference);
  }, [user]);

  const levelData = getLevelData(user.xp);
  const xpNeeded = levelData.maxXp;
  const progressPercent = levelData.progressPercent;

  const handlePrint = () => {
    window.print();
  };

  const copyUidToClipboard = () => {
    const uidToCopy = user.uid || firebaseUser?.uid || "8fK29xPq71Lm";
    navigator.clipboard.writeText(uidToCopy);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2500);
  };

  // Preset Avatars
  const AVATAR_PRESETS = [
    { id: "avatar_mg_coder", name: "မောင်ကုဒ်ဒါ", icon: "💻", bg: "from-blue-600 to-cyan-500" },
    { id: "avatar_ma_developer", name: "မဒတ်ဗလော့ပါ", icon: "👩‍💻", bg: "from-purple-600 to-pink-500" },
    { id: "avatar_cyber_monk", name: "ဆိုက်ဘာဟက်ကာ", icon: "🥷", bg: "from-slate-800 to-slate-900" },
    { id: "avatar_ruby_princess", name: "ရူဘီမင်းသမီး", icon: "💎", bg: "from-rose-500 to-amber-500" },
    { id: "avatar_ai_genius", name: "ဉာဏ်ရည်တုပညာရှင်", icon: "🧠", bg: "from-emerald-500 to-teal-400" }
  ];

  // Continue learning logic
  // Look up first incomplete lesson in the python course or list of courses
  const getContinueLearningData = () => {
    const completedSet = new Set(user.completedLessons || []);
    for (const course of COURSES) {
      for (const lesson of course.lessons) {
        if (!completedSet.has(lesson.id)) {
          // Calculate completed percentage in this course
          const completedCountInCourse = course.lessons.filter(l => completedSet.has(l.id)).length;
          const courseProgressPercent = Math.round((completedCountInCourse / course.lessons.length) * 100);
          
          // Estimate remaining time for this course (assuming 30 mins per remaining lesson)
          const remainingLessons = course.lessons.length - completedCountInCourse;
          const estRemainingTimeHours = Math.ceil((remainingLessons * 30) / 60);

          return {
            course,
            lesson,
            progress: courseProgressPercent,
            estRemaining: `${estRemainingTimeHours} နာရီခန့်`
          };
        }
      }
    }
    // Fallback if everything is completed or not found
    return {
      course: COURSES[0],
      lesson: COURSES[0].lessons[0],
      progress: 100,
      estRemaining: "ပြီးစီးပါပြီ"
    };
  };

  const continueData = getContinueLearningData();

  // Recommendation engine based on current level and completed history
  const getRecommendedCourses = () => {
    const completedLessonsSet = new Set(user.completedLessons || []);
    const recommended: { course: Course; progress: number; reason: string; priority: number }[] = [];

    COURSES.forEach((course) => {
      // Find completion rate
      const completedCount = course.lessons.filter((l) => completedLessonsSet.has(l.id)).length;
      const progressPercent = Math.round((completedCount / course.lessons.length) * 100);

      if (progressPercent === 100) return; // Skip fully completed

      let reason = "သင်ယူရန် အဆင့်သင့်ဖြစ်နေပါသည်";
      let priority = 1;

      // Rule-based recommendations
      if (progressPercent > 0 && progressPercent < 100) {
        reason = "လေ့လာလက်စ သင်တန်းကို ဆက်လက်ပြီးမြောက်ပါ";
        priority = 5;
      } else if (user.level === 1 && course.difficulty.includes("Beginner")) {
        reason = "အခြေခံအဆင့် ကျောင်းသားများအတွက် အကြံပြုထားပါသည်";
        priority = 4;
      } else if (user.level >= 2 && course.difficulty.includes("Intermediate")) {
        reason = "သင့်လက်ရှိ Level နှင့် သင့်တော်သော အလယ်အလတ်တန်း";
        priority = 3;
      } else if (course.category === "basics" && completedCount === 0) {
        reason = "Programming အုတ်မြစ်ခိုင်မာစေရန် အကြံပြုပါသည်";
        priority = 2;
      }

      recommended.push({ course, progress: progressPercent, reason, priority });
    });

    // Sort by priority and limit to 3 recommendations
    return recommended.sort((a, b) => b.priority - a.priority).slice(0, 3);
  };

  const recommendedCourses = getRecommendedCourses();

  // Search logic across courses, lessons, projects, and articles
  const handleGlobalSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [];

    const cleanQuery = sanitizeInput(trimmed, 100).toLowerCase();
    const results: { id: string; title: string; category: string; type: "course" | "lesson" | "project" | "article"; desc: string }[] = [];

    // Search courses & lessons
    COURSES.forEach((course) => {
      if (course.title.toLowerCase().includes(cleanQuery) || course.description.toLowerCase().includes(cleanQuery)) {
        results.push({
          id: course.id,
          title: course.title,
          category: course.category.toUpperCase(),
          type: "course",
          desc: course.description
        });
      }
      course.lessons.forEach((lesson) => {
        if (lesson.title.toLowerCase().includes(cleanQuery) || lesson.whatIsIt.toLowerCase().includes(cleanQuery)) {
          results.push({
            id: lesson.id,
            title: `${course.title} > ${lesson.title}`,
            category: "LESSON",
            type: "lesson",
            desc: lesson.whatIsIt
          });
        }
      });
    });

    // Search projects
    PROJECTS_DATA.forEach((project) => {
      if (project.title.toLowerCase().includes(cleanQuery) || project.description.toLowerCase().includes(cleanQuery)) {
        results.push({
          id: project.id,
          title: project.title,
          category: project.category.toUpperCase(),
          type: "project",
          desc: project.description
        });
      }
    });

    // Search articles
    BLOG_POSTS.forEach((post) => {
      if (post.title.toLowerCase().includes(cleanQuery) || post.summary.toLowerCase().includes(cleanQuery)) {
        results.push({
          id: post.id,
          title: post.title,
          category: post.category.toUpperCase(),
          type: "article",
          desc: post.summary
        });
      }
    });

    return results;
  };

  const searchResults = handleGlobalSearch();

  // Bookmarks specific search
  const bookmarkedItems = (user.bookmarks || []).map(bookmarkId => {
    // Attempt to resolve bookmark as lesson, project or blog
    let title = bookmarkId;
    let type: "lesson" | "project" | "article" = "lesson";
    let desc = "မှတ်သားထားသော သင်ခန်းစာလင့်ခ်";
    
    // Find lesson
    for (const course of COURSES) {
      const foundLesson = course.lessons.find(l => l.id === bookmarkId || l.slug === bookmarkId);
      if (foundLesson) {
        title = `${course.title} - ${foundLesson.title}`;
        type = "lesson";
        desc = foundLesson.whatIsIt;
        break;
      }
    }

    // Find project
    const foundProj = PROJECTS_DATA.find(p => p.id === bookmarkId);
    if (foundProj) {
      title = foundProj.title;
      type = "project";
      desc = foundProj.description;
    }

    // Find article
    const foundPost = BLOG_POSTS.find(b => b.id === bookmarkId);
    if (foundPost) {
      title = foundPost.title;
      type = "article";
      desc = foundPost.summary;
    }

    return { id: bookmarkId, title, type, desc };
  }).filter(item => {
    const trimmed = bookmarkSearchQuery.trim();
    if (!trimmed) return true;
    const cleanBookmarkQuery = sanitizeInput(trimmed, 100).toLowerCase();
    return item.title.toLowerCase().includes(cleanBookmarkQuery) || 
           item.desc.toLowerCase().includes(cleanBookmarkQuery);
  });

  // Secure Profile Picture File Upload Handler
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    
    // 1. Validate file size <= 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("ဖိုင်အရွယ်အစားသည် 5 MB ထက်မကျော်ရပါဗျာ။ (File size must not exceed 5MB)");
      return;
    }

    // 2. Validate allowed MIME types: JPG, PNG, WEBP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("JPG, PNG သို့မဟုတ် WEBP ပုံရိပ်ဖိုင်များသာ တင်ခွင့်ရှိပါသည် ခင်ဗျာ။ (Only JPG, PNG, or WEBP allowed)");
      return;
    }

    // 3. Reject executable extensions just in case (e.g. .exe, .sh, .bat, .js)
    const ext = file.name.split('.').pop()?.toLowerCase();
    const forbiddenExts = ["exe", "sh", "bat", "js", "ts", "py", "bin", "cmd", "vbs", "jar", "elf"];
    if (forbiddenExts.includes(ext || "")) {
      setUploadError("လုံခြုံရေးအရ ဤကဲ့သို့သော ဖိုင်အမျိုးအစားများကို တင်ခွင့်မရှိပါဗျာ။ (Security: Executable files are strictly blocked)");
      return;
    }

    // Read as Base64 Data URL to store securely and display instantly
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setSelectedPresetAvatar(base64String); // Set the custom uploaded image
    };
    reader.onerror = () => {
      setUploadError("ဖိုင်ဖတ်ရှုရာတွင် ချို့ယွင်းချက်ရှိပါသည် ခင်ဗျာ။");
    };
    reader.readAsDataURL(file);
  };

  // Kibo AI Assistance Helper
  const handleTriggerKiboAction = (type: "summary" | "goals" | "celebrate" | "encourage") => {
    setKiboActionType(type);
    setIsKiboLoading(true);
    setKiboModalOpen(true);

    setTimeout(() => {
      let output = "";
      const levelInfo = getLevelData(user.xp);
      const completedCount = (user.completedLessons || []).length;
      const certCount = user.certificates?.length || 0;
      const streak = user.learningStreak || 1;

      if (type === "summary") {
        output = `📊 **Kibo AI ၏ သင်ယူမှု အနှစ်ချုပ် (Learning Progress Summary)**\n\n` +
          `• **ကျောင်းသားနာမည်:** ${user.name} (${user.username || "@student"})\n` +
          `• **လက်ရှိအဆင့် (Level):** Level ${levelInfo.level} (${levelInfo.name})\n` +
          `• **စုစုပေါင်း XP:** ${user.xp} XP (${levelInfo.maxXp - user.xp} XP ရရှိပါက အဆင့်တက်မည်)\n` +
          `• **ပြီးမြောက်ပြီးသော သင်ခန်းစာများ:** ${completedCount} ခု\n` +
          `• **ဆွတ်ခူးထားသော Badges:** ${user.achievements?.length || 0} ခု\n` +
          `• **ရရှိထားသော လက်မှတ်များ:** ${certCount} စောင်\n` +
          `• **လေ့လာမှု Streak:** ${streak} ရက် ဆက်တိုက် 🔥\n\n` +
          `💡 **Kibo ၏ သုံးသပ်ချက်:** သင်၏ သင်ယူမှု တိုးတက်မှုနှုန်းမှာ အလွန်ကောင်းမွန်ပါသည်။ အခြေခံသဘောတရားများကို ပိုင်နိုင်စွာ လေ့လာပြီးသွားပါပြီ ခင်ဗျာ!`;
      } else if (type === "goals") {
        output = `🎯 **Kibo AI ၏ အကြံပြုထားသော နောက်ထပ် သင်ယူရေး ရည်မှန်းချက်များ**\n\n` +
          `1. **သင်တန်း ဆက်လက်လေ့လာရန်:** '${continueData.course.title}' ၏ '${continueData.lesson.title}' သင်ခန်းစာကို ယနေ့ ပြီးမြောက်အောင် လေ့လာပါ (ခန့်မှန်းကြာချိန် - မိနစ် ၃၀)။\n` +
          `2. **ပရောဂျက် ရလဒ်ပြရန်:** ကျောင်းသား Portfolio တွင် သင်၏ အကောင်အထည်ဖော်ထားသော ပရောဂျက် GitHub Link နှင့် Live Demo Link များကို ထည့်သွင်းပြသပါ။\n` +
          `3. **Quiz ဖြေဆိုရန်:** အကြံပြုထားသော Quiz များကို ဖြေဆိုပြီး ၁၀၀% မှန်ကန်ပါက အပို +၁၅၀ XP နှင့် CLM Coins ရယူပါ။\n` +
          `4. **Daily Streak မပျက်စေရန်:** ယနေ့ သင်ခန်းစာ ၁ ခု ပြီးမြောက်အောင် ဖတ်ရှုပြီး နေ့စဉ် လေ့လာမှုမှတ်တမ်းကို ဆက်လက် ထိန်းသိမ်းပါ။`;
      } else if (type === "celebrate") {
        output = `🎉 **Kibo AI မှ ဂုဏ်ယူဝမ်းမြောက်စွာ ချီးကျူးဂုဏ်ပြုလိုက်ပါသည်။** 🎉\n\n` +
          `မင်္ဂလာပါ ${user.name} ရေ! သင်သည် Code Learn Myanmar တွင် Level ${levelInfo.level} ထိ တက်လှမ်းနိုင်ခဲ့ပြီး စုစုပေါင်း ${user.xp} XP နှင့် Streak ${streak} ရက် မပျက်မကွက် ရရှိခဲ့သည့်အတွက် Kibo အဖွဲ့သားများမှ လှိုက်လှဲစွာ ဂုဏ်ယူပါသည်။\n\n` +
          `🏆 **ဆွတ်ခူးထားသော အောင်မြင်မှုများ:**\n` +
          `• Badges: ${user.achievements?.map(a => a.title).join(", ") || "အစပျိုးသူ တံဆိပ်"}\n` +
          `• Certificates: ${certCount > 0 ? `${certCount} စောင် ရရှိပြီး` : "နီးကပ်လာပါပြီ"}\n\n` +
          `သင်၏ ကြိုးစားအားထုတ်မှုသည် အနာဂတ် ပရိုဂရမ်မာကောင်းတစ်ဦးဖြစ်လာစေရန် ကြီးမားသော ခြေလှမ်းဖြစ်ပါသည်! 💪✨`;
      } else if (type === "encourage") {
        output = `🔥 **Kibo AI ၏ နေ့စဉ် လေ့လာမှု ခွန်အားပေး တိုက်တွန်းချက်**\n\n` +
          `"Small daily improvements over time lead to stunning results."\n\n` +
          `ပရိုဂရမ်မင်း ရေးသားခြင်းသည် တစ်ရက်တည်းဖြင့် တတ်မြောက်နိုင်သောအရာ မဟုတ်ဘဲ နေ့စဉ် နည်းနည်းစီ မှန်မှန်လေ့ကျင့်ခြင်းကသာ အဓိက သော့ချက် ဖြစ်ပါသည်။\n\n` +
          `✨ **ယနေ့အတွက် ခွန်အားယူစရာ နည်းလမ်း ၃ ခု:**\n` +
          `1. နေ့စဉ် ၁၅ မိနစ်မှ မိနစ် ၃၀ ခန့် သီးသန့် အချိန်ပေးပါ။\n` +
          `2. သင်ခန်းစာတစ်ခုပြီးတိုင်း Code ကို ကိုယ်တိုင် လက်တွေ့ ရေးသားစမ်းသပ်ပါ (Don't just read, build!).\n` +
          `3. မသိတာရှိပါက Ask AI လက်ထောက်ကို အချိန်မရွေး မေးမြန်းပါ။`;
      }

      setKiboOutputText(output);
      setIsKiboLoading(false);
    }, 500);
  };

  // Handle adding a new saved note
  const handleAddSavedNote = async () => {
    if (!noteTitleInput.trim() || !noteContentInput.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      title: sanitizeInput(noteTitleInput.trim(), 100),
      content: sanitizeInput(noteContentInput.trim(), 1000),
      date: new Date().toLocaleDateString()
    };
    const updatedNotes = [...(user.savedNotes || []), newNote];
    await onUpdateUser({ ...user, savedNotes: updatedNotes });
    setNoteTitleInput("");
    setNoteContentInput("");
    setShowAddNoteModal(false);
  };

  // Handle removing a saved note
  const handleRemoveSavedNote = async (id: string) => {
    const updatedNotes = (user.savedNotes || []).filter(n => n.id !== id);
    await onUpdateUser({ ...user, savedNotes: updatedNotes });
  };

  // Handle adding a new code snippet
  const handleAddCodeSnippet = async () => {
    if (!snippetTitleInput.trim() || !snippetCodeInput.trim()) return;
    const newSnippet = {
      id: `snippet-${Date.now()}`,
      title: sanitizeInput(snippetTitleInput.trim(), 100),
      code: snippetCodeInput.trim(),
      language: snippetLangInput,
      date: new Date().toLocaleDateString()
    };
    const updatedSnippets = [...(user.savedCodeSnippets || []), newSnippet];
    await onUpdateUser({ ...user, savedCodeSnippets: updatedSnippets });
    setSnippetTitleInput("");
    setSnippetCodeInput("");
    setShowAddSnippetModal(false);
  };

  // Handle removing code snippet
  const handleRemoveCodeSnippet = async (id: string) => {
    const updatedSnippets = (user.savedCodeSnippets || []).filter(s => s.id !== id);
    await onUpdateUser({ ...user, savedCodeSnippets: updatedSnippets });
  };

  // Handle Admin Reset Student Progress
  const handleAdminResetStudentProgress = async () => {
    if (!adminResetConfirmText.trim()) return;
    await onUpdateUser({
      ...user,
      xp: 0,
      coins: 0,
      learningStreak: 0,
      completedLessons: [],
      achievements: []
    });
    setAdminResetConfirmText("");
    setShowAdminResetModal(false);
    alert("ကျောင်းသား၏ လေ့လာမှုမှတ်တမ်းအား မူလအတိုင်း အောင်မြင်စွာ Reset ပြုလုပ်ပြီးပါပြီ!");
  };

  // Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccess(false);
    setUploadError(null);

    const sanitizedName = sanitizeInput(displayNameInput.trim(), 100);
    const sanitizedUsername = sanitizeInput(usernameInput.trim(), 100);
    const sanitizedBio = sanitizeInput(bioInput.trim(), 500);
    const sanitizedGithub = sanitizeInput(githubUrlInput.trim(), 200);
    const sanitizedLiveDemo = sanitizeInput(liveDemoUrlInput.trim(), 200);

    if (!sanitizedName) {
      setUploadError("အမည်အား အနည်းဆုံး စာလုံးတစ်လုံး ဖြည့်သွင်းပေးပါရန်။ (Please provide a display name.)");
      setIsSavingProfile(false);
      return;
    }

    try {
      const updatedUser: UserProfile = {
        ...user,
        name: sanitizedName,
        username: sanitizedUsername || `@${sanitizedName.toLowerCase().replace(/\s+/g, "_")}`,
        currentRoadmap: roadmapInput,
        visibility: visibilityInput,
        githubUrl: sanitizedGithub,
        liveDemoUrl: sanitizedLiveDemo,
        bio: sanitizedBio,
        photo: selectedPresetAvatar,
        preferredLanguage: languagePreference,
        themePreference: themePreference
      };

      // Set global application theme to sync up
      onThemeChange(themePreference);

      await onUpdateUser(updatedUser);
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, "Profile Updated Successfully (ကိုယ်ရေးအချက်အလက် ပြင်ဆင်မှု အောင်မြင်သည်)");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
      setUploadError("ပြင်ဆင်ချက်များကို သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်ဗျာ။");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change email/password with secure re-authentication
  const handleUpdateAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatus(null);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setSettingsStatus({ type: "error", message: "အကောင့်ဝင်ရောက်ထားခြင်း မရှိပါဗျာ။ (Not logged in)" });
      return;
    }

    if (!currentPassword) {
      setSettingsStatus({ type: "error", message: "လုံခြုံရေးအရ ဆက်တင်များပြောင်းလဲရန် သင်၏လက်ရှိစကားဝှက် (Current Password) ကို ရိုက်ထည့်ပေးရန် လိုအပ်ပါသည်။" });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsStatus({ type: "error", message: "အသစ်ထည့်သွင်းသော စကားဝှက်နှစ်ခု ကိုက်ညီမှုမရှိပါဗျာ။" });
      return;
    }

    setIsUpdatingSettings(true);

    try {
      // 1. Re-authenticate user with their current password before making sensitive changes
      const credential = EmailAuthProvider.credential(currentUser.email || user.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Process changes
      let emailChanged = false;
      let passwordChanged = false;

      // Change email address if provided and different
      if (newEmail && newEmail.trim() !== currentUser.email) {
        const sanitizedEmail = newEmail.trim().toLowerCase();
        await updateEmail(currentUser, sanitizedEmail);
        
        // Sync profile state and DB profile with new email
        const updatedUser: UserProfile = {
          ...user,
          email: sanitizedEmail
        };
        await onUpdateUser(updatedUser);
        await logAuditEvent(currentUser.uid, `Email Changed to ${sanitizedEmail} (အီးမေးလ်လိပ်စာ ပြောင်းလဲခြင်း အောင်မြင်သည်)`);
        emailChanged = true;
      }

      // Change password if provided
      if (newPassword) {
        await updatePassword(currentUser, newPassword);
        await logAuditEvent(currentUser.uid, "Password Updated Successfully (စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်သည်)");
        passwordChanged = true;
      }

      let successMessage = "အကောင့်ဆက်တင်များကို အောင်မြင်စွာ ပြောင်းလဲထိန်းသိမ်းလိုက်ပါပြီ။";
      if (emailChanged && passwordChanged) {
        successMessage = "အီးမေးလ်လိပ်စာနှင့် စကားဝှက် အသစ်များကို အောင်မြင်စွာ ပြောင်းလဲလိုက်ပါပြီဗျာ။";
      } else if (emailChanged) {
        successMessage = "အီးမေးလ်လိပ်စာအသစ်ကို အောင်မြင်စွာ ပြောင်းလဲလိုက်ပါပြီဗျာ။";
      } else if (passwordChanged) {
        successMessage = "စကားဝှက်အသစ်ကို အောင်မြင်စွာ ပြောင်းလဲလိုက်ပါပြီဗျာ။";
      }

      setSettingsStatus({ type: "success", message: successMessage });
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      console.error("Account settings update error:", err);
      let errorMsg = "ဆက်တင်များပြောင်းလဲရာတွင် အမှားအယွင်းရှိပါသည်ဗျာ။";
      if (err.code === "auth/wrong-password") {
        errorMsg = "လက်ရှိစကားဝှက် (Current Password) မှားယွင်းနေပါသည် ခင်ဗျာ။";
      } else if (err.code === "auth/invalid-credential") {
        errorMsg = "ရိုက်ထည့်ထားသော လက်ရှိစကားဝှက် မမှန်ကန်ပါခင်ဗျာ။";
      } else if (err.code === "auth/requires-recent-login") {
        errorMsg = "လုံခြုံရေးအရ ပြန်လည်အကောင့်ဝင်ရောက်ရန် လိုအပ်ပါသည်ခင်ဗျာ။";
      } else if (err.code === "auth/email-already-in-use") {
        errorMsg = "ဤ Email လိပ်စာကို အခြားသူတစ်ဦးမှ အသုံးပြုပြီးသား ဖြစ်နေပါသည် ခင်ဗျာ။";
      }
      setSettingsStatus({ type: "error", message: errorMsg });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Handle session revocation for device security
  const handleRevokeOtherSessions = async () => {
    if (!user.uid) return;
    const currentSessions = user.activeSessions || [];
    const remaining = currentSessions.filter(s => s.isCurrentDevice);
    const updatedUser: UserProfile = {
      ...user,
      activeSessions: remaining.length > 0 ? remaining : [{
        id: "sess-current",
        deviceType: "desktop",
        os: "Current OS",
        browser: "Current Browser",
        ip: "Current Device",
        lastActive: new Date().toISOString(),
        isCurrentDevice: true
      }]
    };
    onUpdateUser(updatedUser);
    if (auth.currentUser) {
      await saveUserProfile(auth.currentUser.uid, updatedUser);
      await logAuditEvent(auth.currentUser.uid, "Revoked Other Active Sessions (အခြား စက်ပစ္စည်းများမှ အကောင့်ထွက်စေခြင်း)");
      await addUserSecurityLog(auth.currentUser.uid, "Revoke Sessions", "အခြား ချိတ်ဆက်ထားသော စက်ပစ္စည်းအားလုံးမှ အကောင့်ထွက်စေခဲ့သည်", "warning");
    }
    alert("အခြားစက်ပစ္စည်းများအားလုံးမှ အကောင့်ကို အောင်မြင်စွာ ထွက်လိုက်ပါပြီ ခင်ဗျာ။");
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!user.uid) return;
    const currentSessions = user.activeSessions || [];
    const updatedSessions = currentSessions.filter(s => s.id !== sessionId);
    const updatedUser: UserProfile = {
      ...user,
      activeSessions: updatedSessions
    };
    onUpdateUser(updatedUser);
    if (auth.currentUser) {
      await saveUserProfile(auth.currentUser.uid, updatedUser);
      await logAuditEvent(auth.currentUser.uid, `Revoked Session ${sessionId} (စက်ပစ္စည်းချိတ်ဆက်မှု ဖြတ်တောက်ခြင်း)`);
      await addUserSecurityLog(auth.currentUser.uid, "Revoke Session", `စက်ပစ္စည်း ချိတ်ဆက်မှုအား ဖြတ်တောက်ခဲ့သည် (${sessionId})`, "info");
    }
  };

  // Export personal learning backup
  const handleExportBackup = async () => {
    if (!user.uid) return;
    setIsExportingBackup(true);
    setBackupStatus(null);
    try {
      const backupData = await exportUserDataBackup(user.uid);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `code_learn_myanmar_backup_${(user.name || "student").toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setBackupStatus("သင့်လေ့လာမှုဒေတာများနှင့် ကိုယ်ပိုင်မှတ်စုများကို JSON ဖိုင်အဖြစ် အောင်မြင်စွာ ဒေါင်းလုဒ်ရယူပြီးပါပြီ ခင်ဗျာ။");
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, "Exported Personal Learning Data Backup");
        await addUserSecurityLog(auth.currentUser.uid, "Export Backup", "လေ့လာမှုဒေတာအားလုံးကို JSON Backup ဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူခဲ့သည်", "info");
      }
    } catch (err) {
      console.error("Backup export error:", err);
      setBackupStatus("ဒေတာထုတ်ယူမှု မအောင်မြင်ပါဗျာ။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားကြည့်ပါ။");
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Restore personal notes & code from backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.uid) return;
    setIsImportingBackup(true);
    setBackupStatus(null);
    try {
      const text = await file.text();
      const backupPackage = JSON.parse(text);
      if (!backupPackage.version && !backupPackage.profile) {
        throw new Error("Invalid backup format");
      }
      const result = await restoreUserDataFromBackup(user.uid, backupPackage);
      setBackupStatus(`ဒေတာပြန်လည်ရယူမှု အောင်မြင်ပါသည်! (ကိုယ်ပိုင်မှတ်စု ${result.notesRestored} ခု နှင့် ကုဒ်နမူနာ ${result.snippetsRestored} ခု အား အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ)`);
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, `Restored Learning Backup (${result.notesRestored} notes, ${result.snippetsRestored} snippets)`);
        await addUserSecurityLog(auth.currentUser.uid, "Restore Backup", "Backup ဖိုင်မှ မှတ်စုများနှင့် ကုဒ်များကို ပြန်လည်ရယူခဲ့သည်", "success");
      }
    } catch (err) {
      console.error("Backup import error:", err);
      setBackupStatus("မှားယွင်းသော Backup ဖိုင်ပုံစံဖြစ်နေပါသဖြင့် ပြန်လည်ထည့်သွင်း၍ မရနိုင်ပါဗျာ။");
    } finally {
      setIsImportingBackup(false);
      e.target.value = "";
    }
  };

  // Handle saving user privacy and governance preferences
  const handleSavePrivacySettings = async () => {
    if (!user.uid) return;
    setIsSavingPrivacy(true);
    setPrivacySaveMessage(null);
    try {
      await saveUserPrivacySettings(user.uid, privacySettings);
      await onUpdateUser({
        ...user,
        privacySettings: privacySettings,
        visibility: privacySettings.profileVisibility
      });
      setPrivacySaveMessage("ကိုယ်ရေးလုံခြုံမှု ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ ခင်ဗျာ။");
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, "Updated User Privacy Settings & Visibility Preferences");
        await addUserSecurityLog(auth.currentUser.uid, "Privacy Settings Updated", "ကိုယ်ရေးလုံခြုံမှုနှင့် မြင်တွေ့နိုင်စွမ်း ဆက်တင်များကို ပြောင်းလဲခဲ့သည်", "info");
      }
      setTimeout(() => setPrivacySaveMessage(null), 4000);
    } catch (err: any) {
      console.error("Save privacy settings error:", err);
      setPrivacySaveMessage("ဆက်တင်များ သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်။");
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // Export full account data as structured JSON
  const handleExportFullJSON = async () => {
    if (!user.uid) return;
    setIsExportingJson(true);
    try {
      await exportUserDataAsJSON(user.uid, user.name);
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, "Exported Complete Account Data (JSON Archive)");
        await addUserSecurityLog(auth.currentUser.uid, "Data Portability Export", "အကောင့်ဆိုင်ရာ အချက်အလက်အားလုံးကို JSON ဖိုင်အဖြစ် ဒေါင်းလုဒ်ထုတ်ယူခဲ့သည်", "info");
      }
    } catch (err) {
      console.error("Export JSON error:", err);
      alert("ဒေတာထုတ်ယူရာတွင် ချို့ယွင်းချက်ရှိပါသည်ခင်ဗျာ။");
    } finally {
      setIsExportingJson(false);
    }
  };

  // Export structured CSV table records
  const handleExportCSV = async () => {
    if (!user.uid) return;
    setIsExportingCsv(true);
    try {
      await exportUserDataAsCSV(user.uid, user.name, selectedCsvScope);
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, `Exported Account Data CSV Scope: ${selectedCsvScope}`);
        await addUserSecurityLog(auth.currentUser.uid, "Data Export (CSV)", `${selectedCsvScope} စာရင်းအား CSV ဖိုင်အဖြစ် ထုတ်ယူခဲ့သည်`, "info");
      }
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("CSV ဖိုင် ထုတ်ယူရာတွင် ချို့ယွင်းချက်ရှိပါသည်ခင်ဗျာ။");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Clear AI Conversation Chat History
  const handleClearAiChatHistory = async () => {
    if (!user.uid) return;
    const confirmClear = window.confirm("Kibo AI နှင့် မေးမြန်းဆွေးနွေးထားသော စကားပြောမှတ်တမ်းအားလုံးကို ရှင်းလင်းဖျက်သိမ်းမှာ သေချာပါသလား ခင်ဗျာ?");
    if (!confirmClear) return;

    setIsClearingAiHistory(true);
    try {
      await clearUserAiChatHistory(user.uid);
      setAiClearSuccess(true);
      if (auth.currentUser) {
        await logAuditEvent(auth.currentUser.uid, "Cleared AI Chat Conversation History");
        await addUserSecurityLog(auth.currentUser.uid, "Clear AI Data", "Kibo AI စကားပြောမှတ်တမ်းများအားလုံးကို ရှင်းလင်းခဲ့သည်", "info");
      }
      setTimeout(() => setAiClearSuccess(false), 4000);
    } catch (err) {
      console.error("Clear AI history error:", err);
      alert("AI မှတ်တမ်းရှင်းလင်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်။");
    } finally {
      setIsClearingAiHistory(false);
    }
  };

  // Handle fully verified account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationName.trim() !== user.name) {
      alert("အကောင့်ဖျက်သိမ်းရန် သင့်အမည်ကို မှန်ကန်စွာ ရေးသားပေးပါရန်။");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("အကောင့်ဝင်ရောက်ထားခြင်း မရှိပါသဖြင့် ဖျက်သိမ်း၍မရနိုင်ပါဗျာ။");
      return;
    }

    if (!deleteAccountPassword) {
      alert("အကောင့်ဖျက်သိမ်းရန် လက်ရှိအကောင့်စကားဝှက်ကို ရိုက်ထည့်ပေးပါဗျာ။");
      return;
    }

    setIsDeletingAccount(true);

    try {
      // 1. Re-authenticate user before account deletion
      const credential = EmailAuthProvider.credential(currentUser.email || user.email, deleteAccountPassword);
      await reauthenticateWithCredential(currentUser, credential);

      const uid = currentUser.uid;
      
      // 2. Delete all Cloud Firestore user-associated data (progress, bookmarks, certificates, etc.)
      await deleteUserCloudData(uid);

      // 3. Delete standard FirebaseAuth user
      await deleteUser(currentUser);

      alert("သင့်အကောင့်နှင့် လေ့လာမှုမှတ်တမ်းများအားလုံးကို Code Learn Myanmar စနစ်မှ အပြီးအပိုင် ဖျက်သိမ်းလိုက်ပါပြီ။");
      setShowDeleteModal(false);
      setDeleteAccountPassword("");
      setDeleteConfirmationName("");
      onSignOut();
    } catch (err: any) {
      console.error("Account deletion error:", err);
      let errorMsg = "အကောင့်ဖျက်သိမ်းရာတွင် အမှားအယွင်းရှိပါသည်ဗျာ။";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errorMsg = "ထည့်သွင်းထားသော အကောင့်ဝင်စကားဝှက် မှားယွင်းနေပါသည် ခင်ဗျာ။";
      } else if (err.code === "auth/requires-recent-login") {
        errorMsg = "လုံခြုံရေးသတ်မှတ်ချက်ကြောင့် အကောင့်ပြန်လည်ဝင်ရောက်ပြီးမှသာ ဖျက်သိမ်းနိုင်ပါမည်။";
      }
      alert(errorMsg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Quick activity simulator based oncompleted lessons & achievements
  const getRecentActivities = () => {
    const activities = [];
    const completedLessonsList = user.completedLessons || [];
    
    if (completedLessonsList.length > 0) {
      // Pick up to 2 completed lessons
      completedLessonsList.slice(-2).forEach((lessonId, idx) => {
        let lessonTitle = lessonId;
        for (const course of COURSES) {
          const l = course.lessons.find(l => l.id === lessonId);
          if (l) {
            lessonTitle = l.title;
            break;
          }
        }
        activities.push({
          id: `act-lesson-${idx}`,
          type: "lesson",
          title: `သင်ခန်းစာ ပြီးမြောက်ခဲ့သည်: ${lessonTitle}`,
          desc: "ကျွမ်းကျင်မှုစစ်ဆေးချက် နှင့် coding လေ့ကျင့်ခန်း ဖြေဆိုအောင်မြင်မှု +100 XP",
          time: idx === 0 ? "ယနေ့" : "မနေ့က",
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10"
        });
      });
    }

    // Add achievements to timeline
    (user.achievements || []).forEach((ach, idx) => {
      activities.push({
        id: `act-ach-${idx}`,
        type: "achievement",
        title: `အောင်မြင်မှုတံဆိပ်ဆွတ်ခူးနိုင်ခဲ့သည် 🏆`,
        desc: `${ach.title} - ${ach.description}`,
        time: ach.unlockedAt || "မကြာသေးမီက",
        icon: Trophy,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
      });
    });

    // Fallback default activity
    if (activities.length === 0) {
      activities.push({
        id: "act-default",
        type: "system",
        title: "သင်ခန်းစာများ စတင်လေ့လာရန် အဆင်သင့်ဖြစ်ပါသည်",
        desc: "Programming Basics with Python သင်တန်းတွင် သင့်ပထမဆုံးသင်ခန်းစာကို စတင်လိုက်ပါ။",
        time: "ယခု",
        icon: HelpCircle,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      });
    }

    return activities.slice(0, 4);
  };

  const recentActivities = getRecentActivities();

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8 relative">
      
      {/* HEADER SECTION / DASHBOARD METRICS */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        {/* User Identity & Info Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left flex-1">
          {/* Profile Image / Avatar with Edit Badge */}
          <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 p-1 flex-shrink-0 relative group shadow-xl">
            {selectedPresetAvatar ? (
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl shadow-inner select-none">
                {AVATAR_PRESETS.find(a => a.id === selectedPresetAvatar)?.icon || "👨‍💻"}
              </div>
            ) : firebaseUser?.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt={user?.name || "Student"}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white uppercase shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <button 
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-slate-900 flex items-center justify-center cursor-pointer hover:bg-blue-500 shadow-md transition-all" 
              title="Edit Profile & Avatar" 
              onClick={() => setActiveTab("profile")}
              id="btn-edit-avatar-header"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Name, Username, Email, and Creation date */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl md:text-2xl font-extrabold text-white font-display tracking-tight">
                {user?.name || "Student"}
              </h1>
              <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg">
                @{user?.username ? user.username.replace(/^@/, "") : (user?.email ? user.email.split("@")[0] : (user?.name || "student").toLowerCase().replace(/\s+/g, "_"))}
              </span>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                LVL {levelData.level} • {levelData.name}
              </span>
            </div>

            {/* Email and Meta info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
              <span className="font-mono">{user.email || "student@codelearnmyanmar.com"}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 text-[11px]">
                Joined: <span className="font-mono text-slate-300">{user.createdDate || "2026-07-08"}</span>
              </span>
            </div>

            {/* Badges / Highlights */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Flame className="w-3.5 h-3.5" />
                <span>{user.learningStreak || user.streak || 1} Days Streak</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                <Trophy className="w-3.5 h-3.5" />
                <span>{user.achievements?.length || 4} Achievements</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: UID, Premium Status & Level Progress Cards */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3.5 w-full lg:w-auto flex-shrink-0">
          {/* UID Card with Copy UID */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 px-4 shadow-inner text-left flex flex-col justify-between min-w-[170px]">
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">UID:</span>
              <span className="text-sm font-mono font-extrabold text-amber-300 tracking-wider select-all block py-1">
                {user.uid || firebaseUser?.uid || "8fK29xPq71Lm"}
              </span>
            </div>
            <button
              type="button"
              onClick={copyUidToClipboard}
              className={`mt-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                copiedUid
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white border border-slate-700"
              }`}
              id="btn-copy-profile-uid"
              title="Copy User ID"
            >
              {copiedUid ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>✓ Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>[ Copy UID ]</span>
                </>
              )}
            </button>
          </div>

          {/* Premium Status Box */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 px-4 shadow-inner text-left flex flex-col justify-between min-w-[200px]">
            {user.isPremium || user.role === "premium" || (user as any).membershipStatus === "premium" ? (
              <>
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider">
                    <span>💎 PREMIUM</span>
                  </div>
                  <div className="text-xs text-white font-bold mt-1">
                    Plan: <span className="text-amber-300 font-semibold">{user.premiumPlan === "lifetime" ? "Lifetime VIP" : user.premiumPlan === "six_months" ? "6 Months Pro" : "Monthly Pro"}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Expiry Date: <span className="text-slate-300 font-bold">{user.premiumExpiresAt || (user as any).premiumUntil ? new Date(user.premiumExpiresAt || (user as any).premiumUntil).toLocaleDateString() : "Lifetime Access"}</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Courses Unlocked</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">FREE</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Standard Free Tier
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const event = new CustomEvent("navigate-tab", { detail: "premium" });
                    window.dispatchEvent(event);
                  }}
                  className="mt-2 text-[11px] bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold py-1.5 px-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <span>💎 Upgrade Plan</span>
                </button>
              </>
            )}
          </div>

          {/* Level & XP Progress Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 px-4 shadow-inner text-left flex flex-col justify-between min-w-[200px] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-300">
              <span className="font-bold">Level {levelData.level} Progress</span>
              <span className="text-white font-extrabold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                style={{ width: `${progressPercent}%` }} 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span className="text-amber-400 font-bold">{user.xp || 0} XP</span>
              <span>/ {levelData.maxXp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* SYNC WARNING & NOTIFICATION BELL TRIGGER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300">
        <div className="flex items-center space-x-2.5">
          {firebaseUser ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-300 font-mono">Cloud Auto-Sync Active: Verified user session</span>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-amber-400 font-bold">⚠️ Guest Mode active (လေ့လာမှုဒေတာများ မပျောက်ပျက်စေရန် အကောင့်ဝင်ပါ)</span>
            </>
          )}
        </div>

        {/* Notifications Widget */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-slate-300 cursor-pointer transition-all relative"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span>အသိပေးချက်များ</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-bounce shadow">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Expanded notifications floating widget */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs">အသိပေးချက်များ ({unreadNotificationCount})</span>
                {unreadNotificationCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead}
                    className="text-[10px] text-blue-400 hover:text-white font-semibold cursor-pointer"
                  >
                    အားလုံးကို ဖတ်ပြီးသားဟု သတ်မှတ်မည်
                  </button>
                )}
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {notifications.map((notif: any) => (
                  <div 
                    key={notif.id} 
                    className={`p-2.5 rounded-xl border text-[11px] transition-colors ${
                      notif.read ? "bg-slate-900/30 border-slate-850/80 text-slate-400" : "bg-blue-500/5 border-blue-500/10 text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold">{notif.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">{notif.time || notif.createdAt || ""}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{notif.description || notif.message || ""}</p>
                  </div>
                ))}
              </div>
              <div className="text-center pt-1 border-t border-slate-800 text-[10px] text-slate-500">
                သင်ယူမှုတိုးတက်မှုအလိုက် notifications များကို အလိုအလျောက် ပေးပို့ပါမည်
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TWO-COLUMN DASHBOARD LAYOUT WITH SIDEBAR TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION RAIL (3 cols on desktop) */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl lg:p-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Grid className="w-4 h-4 flex-shrink-0" />
            <span>📊 ပင်မဒိုင်ခွက် (Dashboard)</span>
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "statistics"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <BarChart2 className="w-4 h-4 flex-shrink-0" />
            <span>📈 အသေးစိတ် စာရင်းဇယား (Statistics)</span>
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "bookmarks"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Bookmark className="w-4 h-4 flex-shrink-0" />
            <span>🔖 မှတ်သားမှုနှင့် ရှာဖွေခြင်း</span>
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "certificates"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Award className="w-4 h-4 flex-shrink-0" />
            <span>🎓 အောင်မြင်မှုနှင့် လက်မှတ်</span>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "portfolio"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Briefcase className="w-4 h-4 flex-shrink-0" />
            <span>💼 ပရောဂျက် ရလဒ်ပြ Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span>👤 ကိုယ်ရေးအကျဉ်းပြင်ရန်</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "privacy"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>🔒 ကိုယ်ရေးလုံခြုံမှုနှင့် ဒေတာ (Privacy)</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Sliders className="w-4 h-4 flex-shrink-0" />
            <span>⚙️ ဆက်တင်များနှင့် လုံခြုံရေး</span>
          </button>
        </aside>

        {/* RIGHT COLUMN: TAB MAIN WORKSPACE (9 cols on desktop) */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              
              {/* BENTO STATS GRID - 6 KEY USER METRICS */}
              <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. XP Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Total XP (ရမှတ်)</span>
                    <span className="text-lg font-extrabold text-white font-mono">{user.xp ?? 0} <span className="text-xs text-amber-400 font-sans font-bold">XP</span></span>
                    <span className="block text-[10px] text-slate-500 truncate">Rank: {levelData.name}</span>
                  </div>
                </div>

                {/* 2. Level Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 flex-shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Level (အဆင့်)</span>
                    <span className="text-lg font-extrabold text-white">Level {levelData.level}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{levelData.maxXp - (user.xp || 0)} XP to LevelUp</span>
                  </div>
                </div>

                {/* 3. Learning Progress Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Learning Progress (ပြီးမြောက်မှု)</span>
                    <span className="text-lg font-extrabold text-white">
                      {(user.completedLessons || []).filter(id => !id.startsWith('proj-')).length} <span className="text-xs text-slate-400 font-normal">Lessons</span>
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-bold">
                      {Math.min(100, Math.round(((user.completedLessons || []).length / Math.max(1, COURSES.reduce((acc, c) => acc + c.lessons.length, 0))) * 100))}% Completed
                    </span>
                  </div>
                </div>

                {/* 4. Learning Streak Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 flex-shrink-0">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Learning Streak (ဇွဲ)</span>
                    <span className="text-lg font-extrabold text-white font-mono">{user.learningStreak ?? 1} <span className="text-xs text-orange-400 font-sans font-bold">ရက် ဆက်တိုက်</span></span>
                    <span className="block text-[10px] text-slate-500 truncate">Daily Active Habit</span>
                  </div>
                </div>

                {/* 5. Achievements Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Achievements (တံဆိပ်များ)</span>
                    <span className="text-lg font-extrabold text-white">{user.achievements?.length || 4} <span className="text-xs text-slate-400 font-normal">Unlocked</span></span>
                    <span className="block text-[10px] text-purple-400 font-semibold truncate">{user.certificates?.length || 0} Certificates</span>
                  </div>
                </div>

                {/* 6. Premium Status Card */}
                <div className="bg-[#1E293B] border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3.5 shadow-md text-left">
                  <div className="p-3 bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-yellow-400 rounded-2xl border border-amber-500/30 flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Premium Status (အဆင့်အတန်း)</span>
                    {user.isPremium || user.role === "premium" || (user as any).membershipStatus === "premium" ? (
                      <div>
                        <span className="text-sm font-extrabold text-amber-300 flex items-center gap-1">
                          <span>💎 PREMIUM</span>
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate">
                          {user.premiumPlan === "lifetime" ? "Lifetime VIP Plan" : user.premiumPlan === "six_months" ? "6 Months Pro Plan" : "Monthly Pro Plan"}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-extrabold text-slate-300">FREE TIER</span>
                        <span className="block text-[10px] text-sky-400 cursor-pointer hover:underline" onClick={() => {
                          const event = new CustomEvent("navigate-tab", { detail: "premium" });
                          window.dispatchEvent(event);
                        }}>
                          Upgrade Available →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* KIBO AI LEARNING ASSISTANT COMPANION BANNER */}
              <section className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4 text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                      🤖
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-display font-extrabold text-base text-white">Kibo AI သင်ကြားရေး လက်ထောက်</h3>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase">Personal AI Companion</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">သင့်လေ့လာမှုတိုးတက်မှုကို Kibo AI ဖြင့် သုံးသပ်ပြီး အကြံဉာဏ်နှင့် ခွန်အားများ ရယူပါ</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <button
                    onClick={() => handleTriggerKiboAction("summary")}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900/80 hover:bg-blue-600/30 border border-slate-700/80 hover:border-blue-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span>📊 တိုးတက်မှု သုံးသပ်မည်</span>
                  </button>
                  <button
                    onClick={() => handleTriggerKiboAction("goals")}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900/80 hover:bg-purple-600/30 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span>🎯 ရည်မှန်းချက် အကြံပြုချက်</span>
                  </button>
                  <button
                    onClick={() => handleTriggerKiboAction("celebrate")}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900/80 hover:bg-amber-600/30 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span>🎉 အောင်မြင်မှု ဂုဏ်ပြုချက်</span>
                  </button>
                  <button
                    onClick={() => handleTriggerKiboAction("encourage")}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-900/80 hover:bg-emerald-600/30 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                  >
                    <span>🔥 နေ့စဉ် တိုက်တွန်းချက်</span>
                  </button>
                </div>
              </section>

              {/* TELEGRAM CHANNELS & VIP VERIFICATION HUB */}
              <section className="bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-5 text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                      <Send className="w-5 h-5 transform -rotate-12" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <span>Telegram Channels & Video Hub</span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-full border border-sky-500/30">
                          Official Streaming
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">မြန်မာနိုင်ငံရှိ ဖုန်းဒေတာ သက်သာစေရန် HD ဗီဒီယိုသင်ခန်းစာများကို Telegram ဖြင့် ဖြန့်ဝေပေးထားပါသည်</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Admin Support:</span>
                    <a
                      href="https://t.me/Johnny_AZM"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-mono font-bold transition"
                    >
                      <span>@Johnny_AZM</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Free Public Channel */}
                  <div className="p-4.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase">
                          Free Public Channel
                        </span>
                        <Send className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Code Learn Myanmar</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        အခမဲ့ အခြေခံဗီဒီယိုသင်ခန်းစာများ၊ Code နမူနာများနှင့် အများသုံး လေ့လာရေး ချန်နယ်သို့ တိုက်ရိုက် ဝင်ရောက်နိုင်ပါသည်။
                      </p>
                    </div>

                    <a
                      href="https://t.me/code_Learn_myanmar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition cursor-pointer"
                      id="btn-profile-free-telegram"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>အခမဲ့ Telegram ချန်နယ်သို့ ဝင်မည်</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Premium VIP Private Channel */}
                  <div className="p-4.5 bg-gradient-to-b from-amber-500/10 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Premium VIP Channel</span>
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          user.telegramVerificationStatus === "approved" || (user as any).telegramVerified
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : user.telegramVerificationStatus === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {user.telegramVerificationStatus === "approved" || (user as any).telegramVerified
                            ? "✓ VIP Verified"
                            : user.telegramVerificationStatus === "pending"
                            ? "⏳ Pending Approval"
                            : "Verification Required"}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white">Private Masterclass Channel</h4>
                      
                      <div className="p-3 bg-slate-950/70 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-300 block mb-1">📢 Premium User များအတွက် ညွှန်ကြားချက်:</strong>
                        Premium User များသည် မိမိ၏ Profile ထဲမှ UID ကို Copy လုပ်ပြီး Admin ထံသို့ ပို့ပေးပါရန်။ Admin မှ စစ်ဆေးအတည်ပြုပြီးပါက Premium Telegram Channel Link ကို ပေးပို့မည်ဖြစ်ပါသည်။
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {user.telegramVerificationStatus === "approved" || (user as any).telegramVerified ? (
                        <a
                          href="https://t.me/+CLM_VIP_Verified_DirectAccess"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                          id="btn-profile-vip-telegram"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Private VIP Channel သို့ ဝင်မည်</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={copyUidToClipboard}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              copiedUid
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                            }`}
                            id="btn-copy-uid-telegram-card"
                          >
                            {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUid ? "✓ UID Copied" : `Copy UID (${(user.uid || firebaseUser?.uid || "8fK29xPq71Lm").slice(0, 8)}...)`}</span>
                          </button>

                          <a
                            href={`https://t.me/Johnny_AZM?text=${encodeURIComponent(`Hello Admin, my Code Learn Myanmar UID is: ${user.uid || firebaseUser?.uid || "8fK29xPq71Lm"}. Please verify my Premium VIP Telegram access.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
                            id="btn-contact-admin-telegram"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Admin (@Johnny_AZM) သို့ UID ပို့မည်</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 30-DAY MONTHLY ACTIVITY GRID */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-white">လေ့လာမှု မှတ်တမ်း ပြက္ခဒိန် (30-Day Activity Grid)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">နေ့စဉ် သင်ခန်းစာ ဖတ်ရှုမှု၊ Quiz နှင့် Code ရေးသားမှုများ၏ လှုပ်ရှားမှုအဆင့်</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                    {user.learningStreak || 1} Days Active 🔥
                  </span>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-15 gap-2 pt-2">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const isActive = idx >= (30 - Math.min(30, (user.learningStreak || 1)));
                    return (
                      <div
                        key={idx}
                        title={`Day ${idx + 1}: ${isActive ? "Active Learning Day (+100 XP)" : "Rest Day"}`}
                        className={`h-7 rounded-lg transition-all border ${
                          isActive 
                            ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/20" 
                            : "bg-slate-900 border-slate-800"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                  <span>၃၀ ရက် မတိုင်မီ</span>
                  <span>ယနေ့</span>
                </div>
              </section>

              {/* ADMIN MANAGEMENT PANEL (FOR ADMIN USERS) */}
              {user.role === "admin" && (
                <section className="bg-gradient-to-tr from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center space-x-2 text-amber-400">
                      <Shield className="w-5 h-5" />
                      <h3 className="font-display font-extrabold text-base">အက်ဒမင် စီမံခန့်ခွဲမှုစနစ် (Administrator Panel)</h3>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-500/30 uppercase">
                      ADMIN PRIVILEGES
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ကျောင်းသားများ၏ ကိုယ်ရေးအချက်အလက်များနှင့် လေ့လာမှုမှတ်တမ်းများကို ကြည့်ရှုစစ်ဆေးခြင်း၊ လိုအပ်ပါက လေ့လာမှုတိုးတက်မှုကို မူလအတိုင်း ပြန်လည်သတ်မှတ်ခြင်း (Reset Progress) နှင့် မိုဒါရိတ်လုပ်ခြင်းများ ဆောင်ရွက်နိုင်ပါသည်။
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => setShowAdminResetModal(true)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center space-x-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>လေ့လာမှုတိုးတက်မှု ပြန်စမည် (Reset Student Progress)</span>
                    </button>
                  </div>
                </section>
              )}

              {/* DYNAMIC CONTINUE LEARNING WORKSPACE */}
              <section className="bg-gradient-to-tr from-[#1E293B] to-[#1E293B]/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">လေ့လာရန် ကျန်ရှိနေသည်</span>
                    <h3 className="font-display font-bold text-base text-white">လေ့လာမှု ဆက်လက်လုပ်ဆောင်ပါ (Continue Learning)</h3>
                  </div>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono">
                    {continueData.estRemaining} ခန့်ကျန်ရှိ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <p className="text-xs text-slate-400">နောက်ဆုံးဝင်ခဲ့သည့် သင်တန်းလမ်းကြောင်း -</p>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>{continueData.course.title}</span>
                    </h4>
                    <p className="text-xs text-slate-300 font-medium pl-6">
                      သင်ယူရမည့် သင်ခန်းစာ - <span className="text-emerald-400 underline decoration-dotted">{continueData.lesson.title}</span>
                    </p>
                    
                    {/* Course progress estimation */}
                    <div className="space-y-1 pl-6 pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>သင်တန်းပြီးစီးမှု</span>
                        <span>{continueData.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div style={{ width: `${continueData.progress}%` }} className="h-full bg-blue-500 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex justify-end">
                    <button 
                      onClick={() => {
                        alert(`ဂုဏ်ယူပါတယ်! '${continueData.course.title}' သင်တန်း၏ '${continueData.lesson.title}' သင်ခန်းစာသို့ သွားရောက်လေ့လာနိုင်ရန် ပင်မ 'သင်တန်းများ (Courses)' တက်ဘ်တွင် ထိုသင်တန်းကို ရွေးချယ်ပေးပါ ခင်ဗျာ။`);
                      }}
                      className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <span>လေ့လာမှု ဆက်လုပ်ရန်</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* RECOMMENDED COURSES */}
              <section className="space-y-4 text-left">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">သင့်အတွက် အကြံပြုထားသော သင်တန်းများ</h3>
                  <p className="text-xs text-slate-400 mt-1">လေ့လာမှုမှတ်တမ်းနှင့် အဆင့်အလိုက် အလိုအလျောက် ရွေးချယ်ပေးထားပါသည်</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedCourses.map(({ course, progress, reason }) => (
                    <div 
                      key={course.id}
                      className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 hover:shadow-lg transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono font-bold">
                            {course.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{course.estimatedTime}</span>
                        </div>
                        
                        <h4 className="font-bold text-white text-sm line-clamp-1 leading-snug">{course.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                        
                        <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-850/60">
                          <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                            <span>{reason}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-850">
                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>သင်ယူပြီးမြောက်မှု</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div style={{ width: `${progress}%` }} className="h-full bg-blue-500" />
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            alert(`သင်တန်းများ (Courses) စာမျက်နှာတွင် '${course.title}' သင်တန်းကို ရွေးချယ်ပြီး စတင်လေ့လာနိုင်ပါပြီ ခင်ဗျာ။`);
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[10px] font-bold text-center border border-slate-700/60 cursor-pointer"
                        >
                          စတင်လေ့လာရန်
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* RECENT ACTIVITYtimeline */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5 text-left shadow-lg">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                      <span>မကြာသေးမီက လှုပ်ရှားမှုများ (Recent Activity Feed)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">စနစ်တွင်း သင်ယူမှုဖြစ်စဉ်များနှင့် တိုးတက်မှုမှတ်တမ်းများ</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Realtime logs</span>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-900/30 border border-transparent hover:border-slate-850 transition-colors">
                        <div className={`p-2 rounded-xl ${act.bg} ${act.color} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 flex-1 text-left">
                          <p className="text-xs font-bold text-slate-200">{act.title}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{act.desc}</p>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">{act.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: DETAILED LEARNING STATISTICS & ANALYTICS */}
          {activeTab === "statistics" && (() => {
            const totalPlatformLessons = COURSES.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
            const completedCount = user.completedLessons ? user.completedLessons.filter(id => !id.startsWith("proj-")).length : 0;
            const overallCompletionRate = totalPlatformLessons > 0 ? Math.round((completedCount / totalPlatformLessons) * 100) : 0;
            const totalStudyHours = Math.max(1, Math.round(completedCount * 0.45 + (user.studyTimeHours || 0)));
            const totalStudyMins = totalStudyHours * 60;
            const avgMinsPerLesson = completedCount > 0 ? Math.round(totalStudyMins / completedCount) : 25;
            const streakCount = user.learningStreak || 1;
            const maxStreak = Math.max(user.longestStreak || 0, streakCount);
            const userCoins = user.coins ?? 350;
            const completedProjectsCount = user.completedProjects?.length || 0;
            const verifiedCertsCount = user.certificates?.length || 0;
            const unlockedAchievementsCount = user.achievements?.length || 4;

            // Category breakdown calculation
            const categories = [
              {
                id: "basics",
                nameMm: "ပရိုဂရမ်မင်း အခြေခံ (Basics)",
                nameEn: "Programming Logic & Basics",
                icon: Code,
                color: "from-amber-500 to-orange-500",
                textColor: "text-amber-400",
                bgBadge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                courses: COURSES.filter(c => c.category === "basics")
              },
              {
                id: "web",
                nameMm: "ဝက်ဘ်ဖွံ့ဖြိုးတိုးတက်ရေး (HTML/CSS)",
                nameEn: "Web Development Fundamentals",
                icon: Globe,
                color: "from-blue-500 to-cyan-500",
                textColor: "text-blue-400",
                bgBadge: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                courses: COURSES.filter(c => c.category === "web")
              },
              {
                id: "frontend",
                nameMm: "Frontend (JS, TS, React)",
                nameEn: "Modern Frontend Engineering",
                icon: Layers,
                color: "from-cyan-500 to-teal-500",
                textColor: "text-cyan-400",
                bgBadge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                courses: COURSES.filter(c => c.category === "frontend")
              },
              {
                id: "backend",
                nameMm: "Backend (Python & Node.js)",
                nameEn: "Backend Systems & APIs",
                icon: Server,
                color: "from-emerald-500 to-green-500",
                textColor: "text-emerald-400",
                bgBadge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                courses: COURSES.filter(c => c.category === "backend")
              },
              {
                id: "database",
                nameMm: "Database & Cloud Storage",
                nameEn: "SQL, Firebase & Data Models",
                icon: Database,
                color: "from-indigo-500 to-violet-500",
                textColor: "text-indigo-400",
                bgBadge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
                courses: COURSES.filter(c => c.category === "database")
              },
              {
                id: "git",
                nameMm: "Git & Version Control",
                nameEn: "Git, GitHub & Team Workflow",
                icon: GitBranch,
                color: "from-rose-500 to-pink-500",
                textColor: "text-rose-400",
                bgBadge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
                courses: COURSES.filter(c => c.category === "git")
              },
              {
                id: "ai",
                nameMm: "AI Integration & Gemini",
                nameEn: "AI Engineering & LLM APIs",
                icon: Brain,
                color: "from-purple-500 to-fuchsia-500",
                textColor: "text-purple-400",
                bgBadge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
                courses: COURSES.filter(c => c.category === "ai")
              }
            ].map(cat => {
              const catCourses = cat.courses;
              const totalCatLessons = catCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
              const completedCatLessons = catCourses.reduce((sum, c) => {
                return sum + c.lessons.filter(l => user.completedLessons?.includes(l.id)).length;
              }, 0);
              const percent = totalCatLessons > 0 ? Math.round((completedCatLessons / totalCatLessons) * 100) : 0;
              let badge = "စတင်ရန်ကျန် (Unstarted)";
              if (percent >= 100) badge = "ဆရာကြီးအဆင့် (Master) 🏆";
              else if (percent >= 75) badge = "အဆင့်မြင့် (Advanced) 🟣";
              else if (percent >= 35) badge = "အလယ်အလတ် (Intermediate) 🔵";
              else if (percent > 0) badge = "အခြေခံ (Novice) 🟢";

              return {
                ...cat,
                totalLessons: totalCatLessons,
                completedLessons: completedCatLessons,
                percent,
                badge
              };
            });

            // Weekly distribution mock scaled to user velocity
            const weekDays = [
              { day: "Mon", dayMm: "တနင်္လာ", hours: 1.5, lessons: 2, xp: 80, height: "h-24", active: true },
              { day: "Tue", dayMm: "အင်္ဂါ", hours: 2.0, lessons: 3, xp: 120, height: "h-32", active: true },
              { day: "Wed", dayMm: "ဗုဒ္ဓဟူး", hours: 0.8, lessons: 1, xp: 50, height: "h-16", active: true },
              { day: "Thu", dayMm: "ကြာသပတေး", hours: 2.5, lessons: 4, xp: 160, height: "h-40", active: true },
              { day: "Fri", dayMm: "သောကြာ", hours: 1.2, lessons: 2, xp: 90, height: "h-20", active: true },
              { day: "Sat", dayMm: "စနေ", hours: 3.5, lessons: 5, xp: 220, height: "h-48", active: true },
              { day: "Sun", dayMm: "တနင်္ဂနွေ", hours: 2.8, lessons: 4, xp: 180, height: "h-44", active: true }
            ];

            return (
              <div className="space-y-8 text-left animate-fade-in">
                {/* HEADER & TIME RANGE FILTER */}
                <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                          <BarChart2 className="w-5 h-5" />
                        </div>
                        <h2 className="font-display font-extrabold text-xl text-white">
                          သင်ယူမှု အသေးစိတ် စာရင်းဇယား (Learning Analytics)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400">
                        ကျောင်းသား၏ သင်ခန်းစာပြီးမြောက်မှု၊ ဘာသာရပ်အလိုက် ကျွမ်းကျင်မှု၊ ဇွဲလုံ့လနှင့် Quiz ရမှတ်များကို အချိန်နှင့်တပြေးညီ တိုက်ရိုက်ဆန်းစစ်ချက်
                      </p>
                    </div>

                    {/* Time Range Pills */}
                    <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
                      {[
                        { id: "all", label: "အားလုံး (All Time)" },
                        { id: "month", label: "ယခုလ (This Month)" },
                        { id: "week", label: "ယခုအပတ် (This Week)" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setStatsTimeRange(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            statsTimeRange === tab.id
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 4 PRIMARY METRIC BENTO CARDS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Level & XP Progress */}
                  <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">အဆင့် & ရာထူး</span>
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Trophy className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-extrabold text-white">Level {user.level || 1}</span>
                        <span className="text-xs font-semibold text-blue-400">{levelData.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">စုစုပေါင်း {user.xp || 0} XP ရရှိပြီးဖြစ်သည်</p>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Level {user.level + 1} သို့</span>
                        <span>{levelData.progressXp} / {levelData.rangeXp} XP ({levelData.progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${levelData.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Completed Lessons */}
                  <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">သင်ခန်းစာ ပြီးမြောက်မှု</span>
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-extrabold text-white">{completedCount}</span>
                        <span className="text-xs font-semibold text-slate-400">/ {totalPlatformLessons} ခု</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-medium mt-1">
                        တစ်ခုလုံး၏ {overallCompletionRate}% ပြီးစီးပါပြီ
                      </p>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>ပြီးစီးမှု အချိုး</span>
                        <span>{overallCompletionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${overallCompletionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Study Time & Duration */}
                  <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">လေ့လာမှု စုစုပေါင်းကြာချိန်</span>
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-extrabold text-white">{totalStudyHours}</span>
                        <span className="text-xs font-semibold text-slate-400">နာရီခန့်</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">ပျမ်းမျှ {avgMinsPerLesson} မိနစ် / သင်ခန်းစာ</p>
                    </div>
                    <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-amber-400 font-medium">
                      <Zap className="w-3.5 h-3.5" />
                      <span>တသမတ်တည်း လေ့လာမှု အလေ့အကျင့်</span>
                    </div>
                  </div>

                  {/* Card 4: Daily Streak & Consistency */}
                  <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">နေ့စဉ် ဇွဲလုံ့လ (Streak)</span>
                      <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                        <Flame className="w-4 h-4 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-extrabold text-white">{streakCount}</span>
                        <span className="text-xs font-semibold text-orange-400">ရက်ဆက်တိုက်</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">အမြင့်ဆုံးစံချိန်: {maxStreak} ရက်</p>
                    </div>
                    <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>ယနေ့ Check-in အောင်မြင်ပြီး 🔥</span>
                    </div>
                  </div>
                </section>

                {/* WEEKLY ACTIVITY HISTOGRAM & FOCUS TIME */}
                <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span>ရက်သတ္တပတ်အလိုက် လေ့လာမှုမှတ်တမ်းနှင့် အချိန်ဇယား</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        တစ်ပတ်တာအတွင်း တစ်ရက်ချင်းစီ၏ လေ့လာမှုကြာချိန် (Hours) နှင့် ရရှိခဲ့သော XP များ
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>Active Focus Time</span>
                    </div>
                  </div>

                  {/* Histogram Bars */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-6 pb-2 min-h-[220px]">
                    {weekDays.map((w, idx) => (
                      <div key={idx} className="flex flex-col items-center space-y-2 group">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-xl">
                          <div>{w.hours}h ({w.xp} XP)</div>
                          <div className="text-emerald-400">{w.lessons} lessons</div>
                        </div>
                        {/* Bar */}
                        <div className="w-full max-w-[42px] bg-slate-900 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 border border-slate-800/80 group-hover:border-blue-500/50 transition-all">
                          <div 
                            className={`w-full ${w.height} bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-md`}
                          />
                        </div>
                        {/* Label */}
                        <div className="text-center">
                          <span className="block text-xs font-bold text-slate-200 font-sans">{w.dayMm}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{w.hours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insight Box */}
                  <div className="bg-slate-900/80 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5 text-slate-300">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>
                        🔥 <strong className="text-white">အာရုံစူးစိုက်မှု အကောင်းဆုံးအချိန်:</strong> ညနေ ၇:၀၀ မှ ၁၀:၃၀ အတွင်း (Peak Learning Momentum)
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px]">
                      High Consistency
                    </span>
                  </div>
                </section>

                {/* CATEGORY MASTERY & SKILL PROGRESS */}
                <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      <span>ဘာသာရပ်အလိုက် တတ်မြောက်မှု အဆင့်ဆင့် ဇယား (Category Mastery)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Code Learn Myanmar ၏ နည်းပညာနယ်ပယ်အသီးသီးတွင် ပြီးမြောက်ခဲ့သော သင်ခန်းစာများနှင့် ကျွမ်းကျင်မှုအဆင့်များ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div 
                          key={cat.id} 
                          className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-4.5 rounded-2xl space-y-3 transition-all hover:bg-slate-900/90"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cat.color} text-slate-950 font-bold shadow-md`}>
                                <Icon className="w-4.5 h-4.5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-white">{cat.nameMm}</h4>
                                <p className="text-[10px] text-slate-400 font-mono">{cat.nameEn}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cat.bgBadge}`}>
                              {cat.badge}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">ပြီးမြောက်မှု: {cat.completedLessons} / {cat.totalLessons} Lessons</span>
                              <span className="font-bold text-white">{cat.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                              <div 
                                className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${cat.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* QUIZ ACCURACY & GAMIFICATION PERFORMANCE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quiz Performance Card */}
                  <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <h3 className="font-display font-bold text-base text-white">ဉာဏ်စမ်း & စာမေးပွဲ စွမ်းဆောင်ရည်</h3>
                      </div>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        Quiz Analytics
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">မှန်ကန်မှုနှုန်း (Accuracy)</span>
                        <div className="text-2xl font-extrabold text-emerald-400">94.2%</div>
                        <p className="text-[10px] text-slate-500">First-attempt pass: 88%</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">ဖြေဆိုအောင်မြင်မှု</span>
                        <div className="text-2xl font-extrabold text-blue-400">{completedCount} ခု</div>
                        <p className="text-[10px] text-slate-500">ပျမ်းမျှရမှတ်: 92/100</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                        <span className="text-slate-300 font-medium">💪 အားအကောင်းဆုံး ကဏ္ဍ:</span>
                        <span className="text-emerald-400 font-bold">Syntax & Programming Logic</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                        <span className="text-slate-300 font-medium">🎯 ပြန်လည်လေ့ကျင့်ရန်:</span>
                        <span className="text-amber-400 font-bold">Database Queries & Joins</span>
                      </div>
                    </div>
                  </section>

                  {/* Gamification & Achievements Matrix */}
                  <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="font-display font-bold text-base text-white">အောင်မြင်မှု မှတ်တိုင်များ</h3>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        Milestones
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">CLM ဒင်္ဂါး (Coins)</span>
                        <div className="text-2xl font-extrabold text-yellow-400 flex items-center space-x-1.5">
                          <CoinsIcon className="w-5 h-5" />
                          <span>{userCoins}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">ဆုလာဘ်များ လဲလှယ်နိုင်ပါသည်</p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">ဂုဏ်ထူးဆောင်တံဆိပ်</span>
                        <div className="text-2xl font-extrabold text-purple-400">{unlockedAchievementsCount} / 16</div>
                        <p className="text-[10px] text-slate-500">Badges unlocked</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">လက်တွေ့ ပရောဂျက်</span>
                        <div className="text-2xl font-extrabold text-cyan-400">{completedProjectsCount} / {PROJECTS_DATA.length}</div>
                        <p className="text-[10px] text-slate-500">Portfolio ready</p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">ဘွဲ့ရလက်မှတ်</span>
                        <div className="text-2xl font-extrabold text-emerald-400">{verifiedCertsCount} စောင်</div>
                        <p className="text-[10px] text-slate-500">Verified Credentials</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* KIBO AI DIAGNOSTIC & NEXT ACTION */}
                <section className="bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Kibo AI ၏ စွမ်းဆောင်ရည် သုံးသပ်ချက်</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        သင့်လေ့လာမှု အရှိန်အဟုန်သည် အလွန်ကောင်းမွန်နေပါသည်။ {streakCount} ရက်ဆက်တိုက် လေ့လာမှုစံချိန်ကို ထိန်းသိမ်းထားပြီး နောက်ထပ် သင်ခန်းစာများကို ဆက်လက်အောင်မြင်ရန် အကြံပြုအပ်ပါသည်။
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
                  >
                    ပင်မဒိုင်ခွက်သို့ ပြန်သွားမည်
                  </button>
                </section>
              </div>
            );
          })()}

          {/* TAB 3: BOOKMARKS & SEARCH */}
          {activeTab === "bookmarks" && (
            <div className="space-y-8 text-left">
              
              {/* GLOBAL SEARCH BLOCK */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white">သင်ကြားရေး အကြောင်းအရာ ရှာဖွေရေးစင်တာ</h3>
                  <p className="text-xs text-slate-400">သင်တန်းများ၊ သင်ခန်းစာများ၊ လက်တွေ့ပရောဂျက်များနှင့် နည်းပညာဆောင်းပါးများအားလုံးကို တစ်နေရာတည်းတွင် ရှာဖွေပါ</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="ရှာဖွေလိုသောစကားလုံး (ဥပမာ - variables, python, backend)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-3.5 p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Live Search Results */}
                {searchQuery.trim() !== "" && (
                  <div className="bg-slate-900/60 rounded-xl border border-slate-850 p-4 space-y-3.5 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">ရရှိနိုင်သော ရလဒ်များ ({searchResults.length})</span>
                      <span className="text-[10px] text-slate-500 italic"> instant matching</span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.map((res, idx) => (
                          <div 
                            key={`${res.type}-${idx}`}
                            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center justify-between gap-4 text-xs transition-colors"
                          >
                            <div className="space-y-1 text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                  {res.type}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">{res.category}</span>
                              </div>
                              <h4 className="font-bold text-white truncate">{res.title}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{res.desc}</p>
                            </div>
                            <button
                              onClick={() => {
                                alert(`'${res.title}' သို့ အောင်မြင်စွာ ကူးပြောင်းနိုင်ရန် သက်ဆိုင်ရာ tab ကို ရွေးချယ်ပေးပါ ခင်ဗျာ။`);
                              }}
                              className="px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-[10px] font-bold whitespace-nowrap"
                            >
                              ကြည့်ရှုရန်
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-6">ရှာဖွေမှုနှင့် ကိုက်ညီသော သင်ခန်းစာ မတွေ့ပါ ခင်ဗျာ။</p>
                    )}
                  </div>
                )}
              </section>

              {/* BOOKMARKS DISPLAY */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <BookMarked className="w-5.5 h-5.5 text-blue-500" />
                      <span>လေ့လာရန် သိမ်းဆည်းထားသော မှတ်စုများ ({bookmarkedItems.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">သင်ခန်းစာများ၊ ပရောဂျက်များနှင့် စာစောင်များကို သိမ်းဆည်းထားရာနေရာ</p>
                  </div>
                  
                  {/* Bookmark search input */}
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="မှတ်စုများထဲမှ ရှာရန်..."
                      value={bookmarkSearchQuery}
                      onChange={(e) => setBookmarkSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {bookmarkedItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarkedItems.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5 hover:border-slate-700 transition-all text-xs text-left"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-mono font-bold text-slate-500">
                              {item.type}
                            </span>
                            <button
                              onClick={async () => {
                                const newBookmarks = (user.bookmarks || []).filter(b => b !== item.id);
                                await onUpdateUser({ ...user, bookmarks: newBookmarks });
                                alert("မှတ်စုများမှ အောင်မြင်စွာ ဖယ်ထုတ်လိုက်ပါပြီ။");
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300"
                              title="Remove Bookmark"
                            >
                              ဖယ်ရှားရန်
                            </button>
                          </div>
                          <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                        </div>

                        <button
                          onClick={() => {
                            alert(`'${item.title}' သင်ခန်းစာသို့ တိုက်ရိုက်ရောက်ရှိနိုင်ရန် သက်ဆိုင်ရာ tab တွင် ဝင်ရောက်လေ့လာပေးပါဗျာ။`);
                          }}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-center text-[10px] text-blue-400 hover:text-white rounded font-bold border border-slate-700/60 cursor-pointer"
                        >
                          ယခုပင် ပြန်လည်ဖတ်ရှုရန်
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/20 border border-slate-850 rounded-xl text-slate-500 text-xs space-y-2">
                    <Bookmark className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
                    <p>မှတ်သားထားသော သင်ခန်းစာ သို့မဟုတ် ပရောဂျက်များ မတွေ့ပါဗျာ။</p>
                    <p className="text-[10px] text-slate-600">သင်ခန်းစာလေ့လာနေစဉ် 'မှတ်သားရန် (Bookmark)' ခလုတ်ကို နှိပ်ပြီး ဤနေရာတွင် သိမ်းဆည်းနိုင်ပါသည်။</p>
                  </div>
                )}
              </section>

              {/* PERSONAL STUDY NOTES SECTION */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <span>ကိုယ်ပိုင် သင်ကြားရေး မှတ်စုများ (Personal Study Notes)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">လေ့လာရင်း ရေးသားထားသော ကိုယ်ပိုင် မှတ်စုတိုများ</p>
                  </div>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>မှတ်စုသစ် ရေးမည်</span>
                  </button>
                </div>

                {user.savedNotes && user.savedNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.savedNotes.map((note) => (
                      <div key={note.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2 text-left relative">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-xs">{note.title}</h4>
                          <button
                            onClick={() => handleRemoveSavedNote(note.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        <span className="text-[9px] text-slate-500 font-mono block pt-1">{note.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-900/20 border border-slate-850 rounded-xl text-slate-500 text-xs">
                    ရေးသားထားသော မှတ်စုများ မရှိသေးပါဗျာ။ 'မှတ်စုသစ် ရေးမည်' ခလုတ်ကို နှိပ်၍ စတင်ရေးသားနိုင်ပါသည်။
                  </div>
                )}
              </section>

              {/* SAVED CODE SNIPPETS SECTION */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      <span>သိမ်းဆည်းထားသော Code Snippets များ ({user.savedCodeSnippets?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">ပြန်လည်အသုံးပြုလိုသော နမူနာ Code Snippets များ</p>
                  </div>
                  <button
                    onClick={() => setShowAddSnippetModal(true)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Snippet သစ် သိမ်းမည်</span>
                  </button>
                </div>

                {user.savedCodeSnippets && user.savedCodeSnippets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {user.savedCodeSnippets.map((snippet) => (
                      <div key={snippet.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-left">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded uppercase">
                              {snippet.language}
                            </span>
                            <h4 className="font-bold text-white text-xs">{snippet.title}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(snippet.code);
                                alert("Code အား Clipboard သို့ ကူးယူပြီးပါပြီ!");
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-mono flex items-center space-x-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={() => handleRemoveCodeSnippet(snippet.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-850">
                          <code>{snippet.code}</code>
                        </pre>
                        <span className="text-[9px] text-slate-500 font-mono block">{snippet.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-900/20 border border-slate-850 rounded-xl text-slate-500 text-xs">
                    သိမ်းဆည်းထားသော Code Snippet များ မရှိသေးပါဗျာ။ 'Snippet သစ် သိမ်းမည်' ခလုတ်ကို နှိပ်၍ စတင်သိမ်းဆည်းနိုင်ပါသည်။
                  </div>
                )}
              </section>

            </div>
          )}

          {/* TAB 3: CERTIFICATES & ACHIEVEMENTS */}
          {activeTab === "certificates" && (
            <div className="space-y-8 text-left">
              
              {/* COMPLETED PATHWAYS & CERTIFICATES */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">တရားဝင် အသိအမှတ်ပြုလက်မှတ်များ (Official Certificates)</h3>
                    <p className="text-xs text-slate-400 mt-1">သင်ရိုးလမ်းညွှန်အားလုံး ပြီးဆုံးပါက ထုတ်ပေးအပ်နှင်းသော ဂုဏ်ထူးဆောင်လက်မှတ်များ</p>
                  </div>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/10 px-2.5 py-1 rounded-full font-bold font-mono">
                    VERIFIED
                  </span>
                </div>

                {user.certificates && user.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.certificates.map((cert) => (
                      <div 
                        key={cert.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-yellow-500/40 transition-all shadow-md group relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-yellow-500/5 blur-2xl pointer-events-none" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-yellow-500">
                            <div className="flex items-center space-x-2">
                              <Award className="w-5 h-5" />
                              <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                                {user.role === "premium" || (user as any).isPremium === true ? "Premium Certificate 👑" : "Basic Student Certificate"}
                              </span>
                            </div>
                            {user.role === "premium" || (user as any).isPremium === true ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-mono uppercase tracking-wider">Gold Tier</span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono uppercase tracking-wider">Free Tier</span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-sm leading-snug">{cert.courseTitle}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Issued to <span className="text-slate-300 font-bold">{cert.issuedTo}</span></p>
                          <p className="text-[9px] text-slate-500 font-mono">အောင်မြင်မှုကုဒ်: {cert.verificationId}</p>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            onClick={() => setActiveCert(cert)}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ကြည့်ရှုရန်</span>
                          </button>
                          <a
                            href={`${window.location.origin}/?certId=${cert.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1"
                            title="Public Verification & Sharing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </a>
                          <button
                            onClick={handlePrint}
                            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs cursor-pointer"
                            title="Print Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    variant="no_certificates"
                    primaryAction={{
                      label: "Explore Courses",
                      labelMm: "သင်တန်းများ ကြည့်ရှုမည်",
                      onClick: () => {
                        window.location.hash = "#courses";
                      }
                    }}
                  />
                )}
              </section>

              {/* ACHIEVEMENTS & BADGES DISPLAY */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">အောင်မြင်မှုတံဆိပ်များ (Unlocked Achievements)</h3>
                    <p className="text-xs text-slate-400 mt-1">သင်ယူမှုမှတ်တိုင်များကို အောင်မြင်စွာကျော်ဖြတ်နိုင်ခဲ့သည့် ဂုဏ်ပြုဆုတံဆိပ်များ</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                    Unlocked ({user.achievements?.length || 1})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unlocked Badges */}
                  {(user.achievements || []).map((ach) => (
                    <div 
                      key={ach.id}
                      className="bg-slate-900/50 border border-emerald-500/10 hover:border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3.5 shadow"
                    >
                      <div className="p-2.5 bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 text-yellow-500 rounded-xl flex-shrink-0 animate-pulse">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{ach.title}</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded uppercase">Unlocked</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{ach.description}</p>
                        <span className="text-[9px] text-slate-500 font-mono block pt-1">ရရှိသည့်ရက်စွဲ: {ach.unlockedAt || new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {/* Locked/Simulated Future achievements to motivate */}
                  <div className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-4 flex items-start space-x-3.5 opacity-60">
                    <div className="p-2.5 bg-slate-800 text-slate-600 rounded-xl flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-400">ဝက်ဘ်ဆိုက်ဗိသုကာ (Web Builder) 🔒</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">ဝက်ဘ်ဆိုက်ရေးဆွဲခြင်းသင်တန်းအဆင့် ၁ နှင့် အခြေခံပရောဂျက်ကို ဖြေဆိုအောင်မြင်ရန်</p>
                      <span className="text-[8px] text-slate-600 font-mono block">တံဆိပ်ဆွတ်ခူးရန်ကျန်ရှိ</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-4 flex items-start space-x-3.5 opacity-60">
                    <div className="p-2.5 bg-slate-800 text-slate-600 rounded-xl flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-400">AI စကားဝိုင်းရှေ့ဆောင် (AI Conversationalist) 🔒</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Ask AI စနစ်နှင့် နည်းပညာစကားဝိုင်း အနည်းဆုံး ၅ ကြိမ် ဆွေးနွေးပြောဆိုရန်</p>
                      <span className="text-[8px] text-slate-600 font-mono block">တံဆိပ်ဆွတ်ခူးရန်ကျန်ရှိ</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB: STUDENT PORTFOLIO SHOWCASE */}
          {activeTab === "portfolio" && (
            <PortfolioSystem
              user={user}
              onUpdateUser={onUpdateUser}
              viewMode="my_portfolio"
            />
          )}

          {/* TAB 4: MY PROFILE & EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-8 text-left">
              
              {/* EDIT PROFILE FORM */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-lg text-white">ကိုယ်ရေးအချက်အလက်များကို ပြင်ဆင်ခြင်း</h3>
                  <p className="text-xs text-slate-400 mt-1">ကျောင်းသားအကောင့် ပြသမှုပုံရိပ်များ၊ နာမည်နှင့် ကိုယ်ရေးအကျဉ်းကို ပြောင်းလဲပြင်ဆင်ပါ</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Preset Premium Avatars Picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">ကျောင်းသားအကောင့် ပြသမှုပုံရိပ် ရွေးချယ်ရန် (Preset Avatars)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      {AVATAR_PRESETS.map((p) => {
                        const isSelected = selectedPresetAvatar === p.id;
                        return (
                          <div 
                            key={p.id}
                            onClick={() => setSelectedPresetAvatar(p.id)}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                              isSelected 
                                ? "bg-blue-600/10 border-blue-500 shadow-md ring-2 ring-blue-500/25" 
                                : "bg-slate-900 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <span className="text-3xl">{p.icon}</span>
                            <span className="text-[10px] font-bold text-slate-200">{p.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Profile Picture File Upload (JPG, PNG, WEBP, <= 5MB) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">
                      သို့မဟုတ် ကိုယ်ပိုင်ဓာတ်ပုံ တင်ရန် (Custom Profile Picture - Max 5MB, JPG/PNG/WEBP)
                    </label>
                    
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                        isDraggingFile 
                          ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-750 hover:bg-slate-900"
                      }`}
                      onClick={() => {
                        const fileInput = document.getElementById("profile-pic-file-input");
                        fileInput?.click();
                      }}
                    >
                      <input 
                        type="file" 
                        id="profile-pic-file-input"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      
                      {/* Upload icon and prompts */}
                      <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-200">
                          ဤနေရာသို့ ပုံဆွဲထည့်ပါ သို့မဟုတ် ရွေးချယ်ရန် နှိပ်ပါ (Drag & Drop or Click to Upload)
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          JPG, PNG, WEBP (အများဆုံး 5 MB)
                        </p>
                      </div>
                    </div>

                    {/* Display preview if selecting a custom base64 image */}
                    {selectedPresetAvatar && selectedPresetAvatar.startsWith("data:") && (
                      <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <img 
                          src={selectedPresetAvatar} 
                          alt="Custom Avatar Preview" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50 shadow"
                        />
                        <div className="text-left flex-1">
                          <p className="text-xs font-bold text-slate-300">အောင်မြင်စွာ တင်ထားပြီးသောဓာတ်ပုံ</p>
                          <p className="text-[10px] text-slate-500 font-mono">Custom Base64 Image</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPresetAvatar("");
                          }}
                          className="text-[10px] font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          ဖျက်ရန်
                        </button>
                      </div>
                    )}

                    {/* Show file upload error */}
                    {uploadError && (
                      <div className="flex items-start space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs text-left">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">အမည် (Display Name)</label>
                      <input 
                        type="text" 
                        required
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                      />
                    </div>

                    {/* Username input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">အကောင့် Username (@username)</label>
                      <input 
                        type="text" 
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="@mg_coder"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Learning Roadmap */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">လက်ရှိ လေ့လာနေသော Roadmap (Current Learning Roadmap)</label>
                      <select
                        value={roadmapInput}
                        onChange={(e) => setRoadmapInput(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Full-Stack Web Developer Roadmap">🌐 Full-Stack Web Developer Roadmap</option>
                        <option value="Python Developer Roadmap">🐍 Python Developer Roadmap</option>
                        <option value="Mobile App Developer Roadmap">📱 Mobile App Developer (Android/React Native) Roadmap</option>
                        <option value="AI & Machine Learning Roadmap">🤖 AI & Machine Learning Roadmap</option>
                        <option value="Data Science & Analytics Roadmap">📊 Data Science & Analytics Roadmap</option>
                      </select>
                    </div>

                    {/* Profile Visibility Switch */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">ကိုယ်ရေးအကောင့် အများပြည်သူမြင်ကွင်း (Profile Visibility)</label>
                      <select
                        value={visibilityInput}
                        onChange={(e) => setVisibilityInput(e.target.value as "public" | "private")}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">🌐 Public Profile (အများပြည်သူ ကြည့်ရှုခွင့်ပေးမည်)</option>
                        <option value="private">🔒 Private Profile (မိမိတစ်ဦးတည်းသာ သီးသန့်ကြည့်မည်)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GitHub Link */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">GitHub Profile Link</label>
                      <input 
                        type="url" 
                        value={githubUrlInput}
                        onChange={(e) => setGithubUrlInput(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    {/* Live Demo Link */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Live Portfolio Website / Demo Link</label>
                      <input 
                        type="url" 
                        value={liveDemoUrlInput}
                        onChange={(e) => setLiveDemoUrlInput(e.target.value)}
                        placeholder="https://myportfolio.dev"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">ကိုယ်ရေးအကျဉ်း (Biography)</label>
                    <textarea 
                      rows={4}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans leading-relaxed"
                      placeholder="သင်ယူမှုရည်မှန်းချက် သို့မဟုတ် ကိုယ်ရေးကိုယ်တာ မိတ်ဆက်စကား ရေးသားနိုင်ပါသည်။"
                    />
                  </div>

                  {/* Preferences Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">ဦးစားပေးဘာသာစကား (Preferred Language)</label>
                      <select
                        value={languagePreference}
                        onChange={(e) => setLanguagePreference(e.target.value as "my" | "en")}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="my">🇲🇲 မြန်မာဘာသာ (Myanmar)</option>
                        <option value="en">🇺🇸 English Language</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">စနစ်မျက်နှာပြင်စတိုင် (Theme Preference)</label>
                      <select
                        value={themePreference}
                        onChange={(e) => setThemePreference(e.target.value as "light" | "dark" | "system")}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="dark">🌑 Dark Mode (မျက်စိအေးသော ညဉ့်စတိုင်)</option>
                        <option value="light">☀️ Light Mode (လင်းလက်သော နေ့စတိုင်)</option>
                        <option value="system">💻 System Configuration (ကွန်ပြူတာဆက်တင်အတိုင်း)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Data Saver Setting */}
                  <div className="pt-2">
                    <DataSaverSettingsCard user={user} onUpdateUser={onUpdateUser} compact={true} />
                  </div>

                  {/* Actions & Status indicators */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-2">
                    <div className="flex items-center gap-1.5">
                      {saveSuccess && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span>အချက်အလက်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ ခင်ဗျာ!</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center space-x-2"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>သိမ်းဆည်းနေပါသည်...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ပြောင်းလဲမှုများ သိမ်းဆည်းမည်</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </section>

            </div>
          )}

          {/* TAB 7: PRIVACY & DATA GOVERNANCE */}
          {activeTab === "privacy" && (
            <div className="space-y-8 text-left animate-fade-in">
              
              {/* PRIVACY TRANSPARENCY & DATA GOVERNANCE DISCLOSURE */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-extrabold text-lg text-white">
                        ကိုယ်ရေးလုံခြုံမှုနှင့် ဒေတာစီမံခန့်ခွဲမှု (Privacy & Data Governance)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-burmese leading-relaxed">
                      Code Learn Myanmar သည် ကျောင်းသားများ၏ ကိုယ်ရေးအချက်အလက်များကို လုံခြုံစွာ ထိန်းသိမ်းပြီး ဒေတာပိုင်ဆိုင်ခွင့်နှင့် လွတ်လပ်စွာ စီမံခွင့်ကို အပြည့်အဝ အာမခံပါသည်။
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Data Privacy Protected</span>
                  </div>
                </div>

                {/* 4 Pillars of Data Transparency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                      <Info className="w-4 h-4" />
                      <span>မည်သည့် ဒေတာများကို စုဆောင်းပါသလဲ? (What Data We Collect)</span>
                    </div>
                    <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                      သင်ယူမှု တိုးတက်မှု (XP၊ Level၊ ပြီးမြောက်သော သင်ခန်းစာများ)၊ Quiz ရလဒ်များ၊ ရရှိထားသော လက်မှတ်များ၊ ကိုယ်ပိုင် မှတ်စုများနှင့် လုံခြုံသော စနစ်အသုံးပြုမှု မှတ်တမ်းများကိုသာ စုဆောင်းပါသည်။
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                      <Lock className="w-4 h-4" />
                      <span>ဒေတာများကို မည်သို့ ကာကွယ်ပါသလဲ? (How We Protect Data)</span>
                    </div>
                    <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                      Server-side Firestore Security Rules၊ Token-based Authentication နှင့် End-to-End Encrypted ဆက်သွယ်မှုများဖြင့် ပြင်ပမှ ခွင့်ပြုချက်မဲ့ ဝင်ရောက်ကြည့်ရှုခြင်းကို တားဆီးထားပါသည်။
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <Clock className="w-4 h-4" />
                      <span>ဒေတာ ထိန်းသိမ်းမှု ကာလ (Retention Policy)</span>
                    </div>
                    <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                      ကျောင်းသားအကောင့် ဖွင့်လှစ်ထားရှိစဉ် ကာလတစ်လျှောက် သင်ယူမှုမှတ်တမ်းများကို ထိန်းသိမ်းပေးထားပြီး၊ သက်တမ်းလွန် ပြေစာပုံရိပ်များနှင့် ယာယီ AI logs များကို ရက် ၃၀/၆၀ အကြာတွင် အလိုအလျောက် သန့်စင်ပါသည်။
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <HardDrive className="w-4 h-4" />
                      <span>သင့်ဒေတာ ပိုင်ဆိုင်ခွင့်နှင့် ရပိုင်ခွင့်များ (Your Data Rights)</span>
                    </div>
                    <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                      သင့်ဒေတာများကို အချိန်မရွေး JSON သို့မဟုတ် CSV ဖိုင်အဖြစ် ဒေါင်းလုဒ်ထုတ်ယူနိုင်ခွင့် (Data Portability) နှင့် အကောင့်ကို အပြီးအပိုင် ဖျက်သိမ်းခွင့် (Right to Erasure) အပြည့်အဝ ရှိပါသည်။
                    </p>
                  </div>
                </div>
              </section>

              {/* USER PRIVACY & VISIBILITY CONTROLS */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      မြင်တွေ့နိုင်စွမ်းနှင့် ကိုယ်ရေးလုံခြုံမှု ဆက်တင်များ (Privacy Preferences)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-burmese">
                      အခြားကျောင်းသားများ သင့်အချက်အလက်များကို မည်မျှမြင်တွေ့နိုင်မည်ကို စိတ်ကြိုက် သတ်မှတ်ပါ
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Profile Visibility Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-200 block">
                        Public Profile Visibility (အများပြည်သူ မြင်ကွင်း)
                      </span>
                      <p className="text-[11px] text-slate-400 font-burmese">
                        Public ဖွင့်ထားပါက အခြားကျောင်းသားများသည် သင့် Portfolio၊ အောင်မြင်မှုများနှင့် ရရှိထားသော လက်မှတ်များကို ကြည့်ရှုနိုင်ပါမည်။
                      </p>
                    </div>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={e => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as "public" | "private" }))}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="public">🌐 အားလုံး ကြည့်ရှုခွင့်ပေးမည် (Public)</option>
                      <option value="private">🔒 သီးသန့်သာ ထားရှိမည် (Private)</option>
                    </select>
                  </div>

                  {/* Leaderboard Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold text-slate-200 block">
                        Show on Leaderboard & Ranks (ဦးဆောင်သူစာရင်းတွင် ဖော်ပြခြင်း)
                      </span>
                      <p className="text-[11px] text-slate-400 font-burmese">
                        ပိတ်ထားပါက အပတ်စဉ်နှင့် အဆင့်သတ်မှတ်ချက် Leaderboard ဇယားများတွင် သင့်အမည်ကို ဖုံးကွယ်ထားပါမည်။
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showInLeaderboard}
                      onChange={e => setPrivacySettings(prev => ({ ...prev, showInLeaderboard: e.target.checked }))}
                      className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Community Activity Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold text-slate-200 block">
                        Show Activity in Community (ကွန်မြူနတီတွင် အဆင့်တံဆိပ် ပြသခြင်း)
                      </span>
                      <p className="text-[11px] text-slate-400 font-burmese">
                        ဆွေးနွေးခန်းများတွင် မေးခွန်းမေးသည့်အခါ သင့် Level နှင့် XP Badge များကို ပြသမည်/မပြသမည်ကို ရွေးချယ်ပါ။
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showInCommunity}
                      onChange={e => setPrivacySettings(prev => ({ ...prev, showInCommunity: e.target.checked }))}
                      className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* AI Conversation Retention */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold text-slate-200 block">
                        Retain Kibo AI Chat Memory (AI မေးခွန်းမှတ်တမ်း ထိန်းသိမ်းခြင်း)
                      </span>
                      <p className="text-[11px] text-slate-400 font-burmese">
                        ဖွင့်ထားပါက Kibo AI သည် ယခင် သင်ယူခဲ့သော အကြောင်းအရာများကို အခြေခံ၍ သင်ကြားရေး အထောက်အကူပြု အကြံပြုချက်များ ပေးစွမ်းနိုင်ပါမည်။
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowAiHistoryRetention}
                      onChange={e => setPrivacySettings(prev => ({ ...prev, allowAiHistoryRetention: e.target.checked }))}
                      className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Personalized Learning Recommendations */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold text-slate-200 block">
                        Personalized Recommendations (သင့်အတွက် သီးသန့် သင်တန်းအကြံပြုမှုများ)
                      </span>
                      <p className="text-[11px] text-slate-400 font-burmese">
                        သင်ယူမှု လိုအပ်ချက်နှင့် လေ့လာမှု အလေ့အထများအပေါ် မူတည်၍ သင့်လျော်သော Course များကို အလိုအလျောက် အကြံပြုပေးခြင်း။
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowPersonalizedRecommendations}
                      onChange={e => setPrivacySettings(prev => ({ ...prev, allowPersonalizedRecommendations: e.target.checked }))}
                      className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Save Privacy Settings Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 gap-3">
                  {privacySaveMessage && (
                    <span className="text-xs text-emerald-400 font-medium font-burmese flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>{privacySaveMessage}</span>
                    </span>
                  )}
                  {!privacySaveMessage && <div />}

                  <button
                    onClick={handleSavePrivacySettings}
                    disabled={isSavingPrivacy}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                  >
                    {isSavingPrivacy ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>သိမ်းဆည်းနေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ကိုယ်ရေးလုံခြုံမှု ဆက်တင်များ သိမ်းဆည်းမည်</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* DATA PORTABILITY & EXPORT CENTER */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    <h3 className="font-display font-bold text-lg text-white">
                      ဒေတာ ဒေါင်းလုဒ်ထုတ်ယူမှု စင်တာ (Data Portability & Export)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-burmese">
                    သင်၏ သင်ယူမှုမှတ်တမ်းများ၊ အောင်မြင်မှုများနှင့် ကိုယ်ပိုင်မှတ်စုများကို နိုင်ငံတကာ စံချိန်စံညွှန်းမီ JSON သို့မဟုတ် CSV ဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူပါ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Full JSON Export Card */}
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                        <FileJson className="w-4 h-4" />
                        <span>Complete Data Archive (JSON Format)</span>
                      </div>
                      <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                        အကောင့်အချက်အလက်၊ ပြီးမြောက်ခဲ့သော သင်ခန်းစာများ၊ Quiz ရမှတ်များ၊ လက်မှတ်များ၊ ကိုယ်ပိုင်မှတ်စုများနှင့် ကုဒ်နမူနာများ အားလုံးပါဝင်သော စုံလင်သည့် ဒေတာအထုပ်ကို ဒေါင်းလုဒ်ရယူပါ။
                      </p>
                    </div>

                    <button
                      onClick={handleExportFullJSON}
                      disabled={isExportingJson}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      {isExportingJson ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>ထုတ်ယူနေပါသည်...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>JSON ဖိုင်ဖြင့် ဒေတာအားလုံး ဒေါင်းလုဒ်လုပ်မည်</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CSV Export by Scope Card */}
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Spreadsheet Tables (CSV Format)</span>
                      </div>
                      <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                        Microsoft Excel သို့မဟုတ် Google Sheets တွင် အလွယ်တကူ ဖွင့်ဖတ်နိုင်ရန် သက်ဆိုင်ရာ ကဏ္ဍအလိုက် CSV ဇယားအဖြစ် ထုတ်ယူပါ။
                      </p>

                      <select
                        value={selectedCsvScope}
                        onChange={e => setSelectedCsvScope(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                      >
                        <option value="all">📊 ဒေတာအားလုံး (All Available Records)</option>
                        <option value="progress">📚 သင်ယူမှု တိုးတက်မှု (Learning Progress)</option>
                        <option value="quizzes">📝 Quiz ဖြေဆိုမှု မှတ်တမ်းများ (Quiz Attempts)</option>
                        <option value="certificates">🎓 သင်တန်းဆင်းလက်မှတ်များ (Certificates)</option>
                        <option value="notes">📝 ကိုယ်ပိုင် မှတ်စုများ (Personal Notes)</option>
                        <option value="payments">💳 ငွေပေးချေမှု မှတ်တမ်း (Payment Records)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      disabled={isExportingCsv}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      {isExportingCsv ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>ထုတ်ယူနေပါသည်...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>ရွေးချယ်ထားသော CSV ဇယား ဒေါင်းလုဒ်လုပ်မည်</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clear AI History Option */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Clear Kibo AI Conversation Chat History</span>
                    </span>
                    <p className="text-[11px] text-slate-400 font-burmese">
                      Kibo AI လက်ထောက်နှင့် ဆွေးနွေးထားသော စကားပြောမှတ်တမ်းများကို သီးသန့် ရှင်းလင်းဖျက်သိမ်းနိုင်ပါသည်။
                    </p>
                    {aiClearSuccess && (
                      <p className="text-[11px] text-emerald-400 font-bold font-burmese">
                        AI မေးမြန်းမှု မှတ်တမ်းများကို အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ ခင်ဗျာ။
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleClearAiChatHistory}
                    disabled={isClearingAiHistory}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                  >
                    {isClearingAiHistory ? "ရှင်းလင်းနေပါသည်..." : "AI မှတ်တမ်း ရှင်းလင်းမည်"}
                  </button>
                </div>
              </section>

              {/* ACCOUNT DELETION & ERASURE SECTION */}
              <section className="bg-red-500/5 border border-red-500/15 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl flex-shrink-0">
                    <UserMinus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-red-400">
                      အကောင့်ဖျက်သိမ်းခြင်းနှင့် အချက်အလက် သန့်စင်ခြင်း (Account Deletion & Data Erasure)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-burmese">
                      သင်၏ အကောင့်အား အပြီးအပိုင် ဖျက်သိမ်းရန် တောင်းဆိုနိုင်ပါသည်။ အကောင့်ဖျက်သိမ်းပါက သင့် ပရိုဖိုင်၊ သင်ယူမှုတိုးတက်မှု (XP/Level)၊ Quiz ရလဒ်များ၊ ရရှိထားသော လက်မှတ်များနှင့် ကိုယ်ပိုင်မှတ်စုများ အားလုံးကို Cloud Database မှ အပြီးအပိုင် ဖျက်ဆီးပစ်မည် ဖြစ်ပါသည်။ ငွေစာရင်းဆိုင်ရာ ဥပဒေအရ လိုအပ်သော ငွေလွှဲမှတ်တမ်းများအား ကိုယ်ရေးအချက်အလက် အားလုံးဖယ်ရှား၍ အမည်ဖျက် (Anonymized) အဖြစ်သာ ထိန်းသိမ်းသွားပါမည်။
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      setDeleteStep(1);
                      setShowDeleteModal(true);
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-red-500/20 cursor-pointer flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ကျွန်ုပ်၏ အကောင့်ကို အပြီးအပိုင် ဖျက်သိမ်းမည် (Delete Account)</span>
                  </button>
                </div>
              </section>

            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS & DANGER ZONE */}
          {activeTab === "settings" && (
            <div className="space-y-8 text-left animate-fade-in">
              
              {/* SETTINGS QUICK ACCESS BAR */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>ဆက်တင်များ လျင်မြန်စွာ ရွေးချယ်ရန် (Settings Navigation)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">အကောင့်၊ လုံခြုံရေး၊ အသိပေးချက်များနှင့် ဒေတာ ဆက်တင်များကို တစ်နေရာတည်းတွင် စီမံခန့်ခွဲပါ</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span>Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("privacy")}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span>Privacy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("section-notifications");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span>Notifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("section-datasaver");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>Data Saver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("section-security");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Key className="w-4 h-4" />
                    </div>
                    <span>Security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="p-3 rounded-xl bg-red-500/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold transition-all flex flex-col items-center gap-2 text-center cursor-pointer group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </section>
              
              {/* THEME & APPEARANCE SETTINGS PANEL */}
              <section className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl transition-colors">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>အသွင်အပြင်နှင့် Theme ဆက်တင်များ (Appearance & Theme)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Light Mode, Dark Mode သို့မဟုတ် စက်ပစ္စည်း (Device/System) ၏ အပြင်အဆင်အတိုင်း လွတ်လပ်စွာ ရွေးချယ်နိုင်ပါသည်။
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <ThemeToggle variant="pills" />
                </div>
              </section>

              {/* DATA SAVER MODE SETTINGS PANEL */}
              <section id="section-datasaver">
                <DataSaverSettingsCard user={user} onUpdateUser={onUpdateUser} />
              </section>

              {/* NOTIFICATION SETTINGS PANEL */}
              <section id="section-notifications" className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-lg text-white">အသိပေးချက် ဆက်တင်များ (Notification Settings)</h3>
                  <p className="text-xs text-slate-400 mt-1">စနစ်တွင်း မည်သည့်အရာများအတွက် အီးမေးလ် သို့မဟုတ် real-time notification ပေးပို့ရမလဲ ရွေးချယ်ပါ</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">Course Updates (သင်တန်းမွမ်းမံမှုများ)</span>
                      <p className="text-[10px] text-slate-500">သင်တက်ရောက်နေသော သင်တန်းများ၏ အရေးကြီး ပြင်ဆင်ချက်များ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" checked={notifyCourseUpdates} onChange={(e) => setNotifyCourseUpdates(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">New Lessons Released (သင်ခန်းစာသစ်များ)</span>
                      <p className="text-[10px] text-slate-500">သင်ရိုးညွှန်းတမ်းထဲသို့ စာသင်ခန်းအသစ်များ တိုးချဲ့ဖြည့်စွက်လာပါက အသိပေးရန်</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" checked={notifyNewLessons} onChange={(e) => setNotifyNewLessons(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">Quiz & Exam Results (စစ်ဆေးချက် ရလဒ်များ)</span>
                      <p className="text-[10px] text-slate-500">ပရောဂျက်များနှင့် coding စာမေးပွဲ ရမှတ်များ အတည်ပြုချက်</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" checked={notifyQuizResults} onChange={(e) => setNotifyQuizResults(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">Achievement Unlock Trophies (တံဆိပ်ဆုများ)</span>
                      <p className="text-[10px] text-slate-500">အောင်မြင်မှုမှတ်တိုင်အသစ်များ ကျော်ဖြတ်နိုင်ပါက real-time ထုတ်ပြန်ပေးရန်</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" checked={notifyAchievements} onChange={(e) => setNotifyAchievements(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* SECURITY & LOGIN ACCOUNT CONFIG */}
              <section id="section-security" className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-lg text-white">အကောင့်လုံခြုံရေး ဆက်တင်များ (Security Settings)</h3>
                  <p className="text-xs text-slate-400 mt-1">အီးမေးလ် ပြောင်းလဲခြင်းနှင့် အကောင့်ဝင်စကားဝှက်များကို ဤနေရာတွင် စီမံခန့်ခွဲပါ</p>
                </div>

                <form onSubmit={handleUpdateAccountSettings} className="space-y-4">
                  {settingsStatus && (
                    <div className={`p-4 rounded-xl text-xs font-bold border ${
                      settingsStatus.type === "success" 
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                        : "bg-red-500/5 border-red-500/10 text-red-400"
                    }`}>
                      {settingsStatus.message}
                    </div>
                  )}

                  {/* Re-authenticate Current Password Field */}
                  <div className="space-y-2 text-left bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                    <label className="text-xs font-bold text-slate-300 block">
                      လက်ရှိအကောင့်ဝင်စကားဝှက် (Current Password) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="ဆက်တင်များပြောင်းလဲရန် သင်၏လက်ရှိစကားဝှက်ကို ဖြည့်သွင်းအတည်ပြုပေးပါ..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                    />
                    <p className="text-[10px] text-slate-500">
                      လုံခြုံရေးသတ်မှတ်ချက်ကြောင့် အီးမေးလ် သို့မဟုတ် စကားဝှက်သစ် ပြောင်းလဲရန် လက်ရှိစကားဝှက်ကို ဖြည့်သွင်းရန် မဖြစ်မနေ လိုအပ်ပါသည်ဗျာ။
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Change Email */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-slate-300 block">အီးမေးလ်လိပ်စာ ပြောင်းရန် (Change Email)</label>
                      <input 
                        type="email" 
                        placeholder="အီးမေးလ်အသစ် ရေးထည့်ပါ..."
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Change Password */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-slate-300 block">စကားဝှက်အသစ် (Change Password)</label>
                      <input 
                        type="password" 
                        placeholder="စကားဝှက်အသစ် ရေးထည့်ပါ..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {newPassword !== "" && (
                    <div className="space-y-2 text-left max-w-sm">
                      <label className="text-xs font-bold text-slate-300 block">စကားဝှက်အသစ် ပြန်လည်အတည်ပြုပါ</label>
                      <input 
                        type="password" 
                        required
                        placeholder="စကားဝှက်ကို နောက်တစ်ကြိမ် ရေးထည့်ပါ..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                    {/* Auto Logout Setting */}
                    <div className="flex items-center justify-between gap-4 bg-slate-900/30 p-2 px-4 border border-slate-850 rounded-xl text-xs text-slate-300">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">Auto Log Out</span>
                        <p className="text-[10px] text-slate-500">၁၀ မိနစ် ငြိမ်နေပါက အလိုအလျောက် ထွက်ရန်</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={autoLogout}
                          onChange={(e) => setAutoLogout(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isUpdatingSettings}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors border border-blue-500/20 flex items-center space-x-2"
                    >
                      {isUpdatingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                      <span>ပြောင်းလဲမှု သိမ်းဆည်းရန်</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* ACTIVE SESSIONS & DEVICE MANAGEMENT */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      <span>ချိတ်ဆက်ထားသော စက်ပစ္စည်းများ (Active Sessions)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">သင့်အကောင့်အား ဖွင့်လှစ်ထားသော စက်ပစ္စည်းများနှင့် browser များ</p>
                  </div>
                  {user.activeSessions && user.activeSessions.length > 1 && (
                    <button
                      onClick={handleRevokeOtherSessions}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>အခြားစက်များမှ အကောင့်ထွက်မည်</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {user.activeSessions && user.activeSessions.length > 0 ? (
                    user.activeSessions.map((session) => (
                      <div 
                        key={session.id}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          session.isCurrentDevice 
                            ? "bg-blue-500/5 border-blue-500/30" 
                            : "bg-slate-900/40 border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={`p-2.5 rounded-xl ${session.isCurrentDevice ? "bg-blue-500/15 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                            {session.deviceType === "mobile" ? (
                              <Smartphone className="w-5 h-5" />
                            ) : session.deviceType === "tablet" ? (
                              <Tablet className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{session.os} • {session.browser}</span>
                              {session.isCurrentDevice && (
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold font-mono uppercase">
                                  လက်ရှိစက် (Current)
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              နောက်ဆုံးလှုပ်ရှားမှု: {new Date(session.lastActive).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {!session.isCurrentDevice && (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium transition-all cursor-pointer"
                            title="ဤစက်ပစ္စည်းမှ အကောင့်ထွက်စေမည်"
                          >
                            ဖြတ်တောက်မည်
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>လက်ရှိ စက်ပစ္စည်း ၁ ခုသာ လုံခြုံစွာ ချိတ်ဆက်ထားပါသည် ခင်ဗျာ။</span>
                    </div>
                  )}
                </div>
              </section>

              {/* SECURITY AUDIT & LOGIN HISTORY */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-400" />
                      <span>လုံခြုံရေးနှင့် ဝင်ရောက်မှု မှတ်တမ်း (Security Activity Log)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">မကြာသေးမီက ပြုလုပ်ခဲ့သော လုံခြုံရေးဆိုင်ရာ ပြောင်းလဲမှုများနှင့် အကောင့်ဝင်ရောက်မှုများ</p>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-bold">
                    AUDITED
                  </span>
                </div>

                <div className="space-y-2.5">
                  {user.securityLogs && user.securityLogs.length > 0 ? (
                    user.securityLogs.slice(0, 8).map((log) => (
                      <div 
                        key={log.id}
                        className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-lg ${
                            log.status === "success" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : log.status === "warning" 
                              ? "bg-yellow-500/10 text-yellow-400" 
                              : "bg-rose-500/10 text-rose-400"
                          }`}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block">{log.action}</span>
                            <span className="text-[10px] text-slate-400">{log.details} {log.device ? `• ${log.device}` : ""}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 text-center text-slate-500 text-xs">
                      မှတ်တမ်းတင်ထားသော လုံခြုံရေး ဖြစ်ရပ်များ မရှိသေးပါဗျာ။
                    </div>
                  )}
                </div>
              </section>

              {/* DATA PRIVACY, BACKUP & PORTABILITY STRATEGY */}
              <section className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-400" />
                      <span>ဒေတာလုံခြုံရေးနှင့် သိမ်းဆည်းမှု (Data Backup & Recovery)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      သင့်လေ့လာမှု တိုးတက်မှုများ၊ ကိုယ်ပိုင်မှတ်စုများ၊ ကုဒ်နမူနာများနှင့် Certificate များကို စိတ်ကြိုက် Export / Restore ပြုလုပ်နိုင်ပါသည်။
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 font-bold">
                    PORTABLE
                  </span>
                </div>

                {backupStatus && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{backupStatus}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>ကိုယ်ပိုင် ဒေတာများ ဒေါင်းလုဒ်ရယူရန်</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      သင့်အကောင့်တွင် သိမ်းဆည်းထားသော အချက်အလက်များ (Profile, Notes, Snippets, Projects) အားလုံးကို JSON ဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူပါ။
                    </p>
                    <button
                      onClick={handleExportBackup}
                      disabled={isExportingBackup}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isExportingBackup ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ဒေတာ ထုတ်ယူနေပါသည်...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Backup ဖိုင် ဒေါင်းလုဒ်ရယူမည် (JSON)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Backup မှ ဒေတာ ပြန်လည်သွင်းယူရန်</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      ယခင်က ထုတ်ယူထားသော JSON Backup ဖိုင်မှ ကိုယ်ပိုင်မှတ်စုများနှင့် ကုဒ်နမူနာများကို ပြန်လည် Restore ပြုလုပ်ပါ။
                    </p>
                    <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{isImportingBackup ? "ဒေတာ သွင်းယူနေပါသည်..." : "Backup ဖိုင် ရွေးချယ်မည်"}</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportBackup} 
                        disabled={isImportingBackup}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* LOGOUT / SIGN OUT CARD */}
              <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center space-x-3.5 text-left">
                  <div className="p-3 bg-red-500/10 text-red-400 rounded-xl flex-shrink-0">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white">အကောင့်မှ ထွက်ခွာရန် (Logout / Sign Out)</h4>
                    <p className="text-xs text-slate-400">လက်ရှိ စက်ပစ္စည်းပေါ်ရှိ Code Learn Myanmar အကောင့် session မှ လုံခြုံစွာ ထွက်ခွာမည်</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 flex-shrink-0"
                  id="btn-settings-logout-card"
                >
                  <LogOut className="w-4 h-4" />
                  <span>အကောင့်မှ ထွက်မည် (Logout)</span>
                </button>
              </section>

              {/* DANGER ZONE: ACCOUNT DELETION */}
              <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-start space-x-3.5 text-left">
                  <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-red-400">အန္တရာယ်ဇုန် (Danger Zone)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      အကောင့်ဖျက်သိမ်းခြင်းသည် ဆုံးဖြတ်ပြီးပါက ပြန်လည်ရယူနိုင်ခြင်း မရှိပါ။ သင့်လေ့လာမှုတိုးတက်မှုများ၊ ဆုတံဆိပ်များနှင့် ရမှတ်မှတ်တမ်းများအားလုံး Code Learn Myanmar database မှ လုံးဝ ဖျက်ဆီးပစ်မည် ဖြစ်ပါသည်။
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    ကျွန်ုပ်၏အကောင့်ကို ဖျက်ဆီးမည် (Delete Account)
                  </button>
                </div>
              </section>

            </div>
          )}

        </main>
      </div>

      {/* LIGHTBOX FOR DELETING ACCOUNT (MULTI-STEP WIZARD) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-red-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-6 text-slate-300 relative text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-extrabold text-base text-white">
                  အကောင့် အပြီးအပိုင် ဖျက်သိမ်းခြင်း (Step {deleteStep} of 3)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteStep(1);
                  setDeleteConfirmationName("");
                  setDeleteAccountPassword("");
                  setDeleteConsentChecked(false);
                }}
                disabled={isDeletingAccount}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: CONSEQUENCES DISCLOSURE */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">
                    ⚠️ အောက်ပါ အချက်အလက်များအားလုံး ပြန်လည်မရနိုင်တော့ပါ -
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-burmese">
                    <li>ရရှိထားသော XP (<span className="text-yellow-400 font-bold">{user.xp || 0} XP</span>) နှင့် Level ({user.level || 1}) မှတ်တမ်းများ။</li>
                    <li>သင်ယူပြီးမြောက်ခဲ့သော သင်ခန်းစာ {(user.completedLessons || []).length} ခုနှင့် Quiz အောင်မြင်မှုများ။</li>
                    <li>ထုတ်ယူထားသော သင်တန်းဆင်း Certificate လက်မှတ်များနှင့် အသိအမှတ်ပြုကုဒ်များ။</li>
                    <li>ရေးသားထားသော ကိုယ်ပိုင်မှတ်စုများ၊ ကုဒ်နမူနာများနှင့် Portfolio Projects များ။</li>
                    <li>ကွန်မြူနတီတွင် အသုံးပြုခဲ့သော ကျောင်းသား ပရိုဖိုင်နှင့် ဆုတံဆိပ်များ။</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-burmese">
                  💡 မှတ်ချက် - ငွေပေးချေမှုမှတ်တမ်း (Payment Requests) များသည် စာရင်းကိုင်ဥပဒေအရ စနစ်တွင် ကျန်ရှိမည်ဖြစ်သော်လည်း သင့်အမည်၊ အီးမေးလ်နှင့် ဖုန်းနံပါတ်များကို လုံးဝဖယ်ရှားကာ အမည်ဖျက် (Anonymized) ထားရှိသွားပါမည်။
                </div>

                <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteConsentChecked}
                    onChange={e => setDeleteConsentChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-burmese font-medium">
                    အထက်ပါ သတိပေးချက်များကို နားလည်သဘောပေါက်ပြီး ဒေတာများ အားလုံး ဖျက်ဆီးပစ်ရန် သဘောတူပါသည်။
                  </span>
                </label>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    မလုပ်တော့ပါ (Cancel)
                  </button>
                  <button
                    onClick={() => setDeleteStep(2)}
                    disabled={!deleteConsentChecked}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    ရှေ့ဆက်မည် (Next: Security Check) →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: RE-AUTHENTICATION */}
            {deleteStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                  လုံခြုံရေးအရ သင်သည် အမှန်တကယ် ဤအကောင့်ပိုင်ရှင်ဖြစ်ကြောင်း အတည်ပြုရန်အတွက် လက်ရှိ အကောင့်ဝင်ရောက်ထားသော စကားဝှက် (Current Password) ကို ရိုက်ထည့်ပေးပါ -
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">အကောင့်စကားဝှက် (Password)</label>
                  <input
                    type="password"
                    placeholder="လက်ရှိ အကောင့်စကားဝှက် ရိုက်ထည့်ပါ..."
                    value={deleteAccountPassword}
                    onChange={e => setDeleteAccountPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    ← နောက်သို့ (Back)
                  </button>
                  <button
                    onClick={() => setDeleteStep(3)}
                    disabled={!deleteAccountPassword}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    အတည်ပြုရန် (Next: Final Confirm) →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FINAL CONFIRMATION & DELETION */}
            {deleteStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                  အမှားအယွင်းမဖြစ်စေရန် သင့် လက်ရှိ အကောင့်အမည် <span className="text-white font-extrabold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{user.name}</span> ကို အောက်ပါ ကွက်လပ်တွင် အတိအကျ ပြန်လည် ရေးထည့်ပါ -
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">အကောင့်အမည် အတည်ပြုချက်</label>
                  <input
                    type="text"
                    placeholder="ကျောင်းသားအမည် အတိအကျ ရိုက်ထည့်ပါ..."
                    value={deleteConfirmationName}
                    onChange={e => setDeleteConfirmationName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setDeleteStep(2)}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ← နောက်သို့ (Back)
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmationName.trim() !== user.name || !deleteAccountPassword || isDeletingAccount}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 disabled:text-slate-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center space-x-2 shadow-lg shadow-red-600/30"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>ဖျက်သိမ်းနေပါသည်...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>အကောင့်ကို အပြီးအပိုင် ဖျက်ဆီးပစ်မည်</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CERTIFICATE LIGHTBOX PREVIEW */}
      {activeCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 text-slate-300">
            {/* Close */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-mono font-bold">Certificate of Completion</span>
              <button 
                onClick={() => setActiveCert(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Container with elegant visual design */}
            <div id="printable-certificate" className="bg-[#FAF9F6] text-[#1E293B] border-[12px] border-[#D4AF37] rounded-xl p-8 md:p-14 text-center space-y-8 relative shadow-inner select-none font-sans">
              
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]" />

              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                  C
                </div>
                <h2 className="text-[#D4AF37] font-display font-extrabold text-2xl md:text-3xl uppercase tracking-widest text-center">
                  Certificate of Completion
                </h2>
                <p className="text-[11px] text-slate-500 font-mono tracking-widest uppercase text-center">
                  Code Learn Myanmar Education Council
                </p>
              </div>

              <div className="space-y-3 py-4 text-center">
                <p className="text-xs text-slate-500 italic text-center">ဤလက်မှတ်သည် အောက်ဖော်ပြပါပုဂ္ဂိုလ်အား သက်ဆိုင်ရာသင်တန်းပြီးဆုံးသည့်အတွက် ဂုဏ်ပြုချီးမြှင့်အပ်ပါသည်။</p>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-wide underline underline-offset-8 text-center">
                  {activeCert.issuedTo}
                </h3>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-xs text-slate-500 text-center">အောင်မြင်စွာ စံချိန်တင်ပြီးမြောက်ခဲ့သည့် သင်တန်းလမ်းညွှန် -</p>
                <h4 className="text-base md:text-lg font-bold text-slate-900 text-center">
                  {activeCert.courseTitle}
                </h4>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-6 mt-8 gap-4 text-xs">
                <div className="space-y-0.5 text-slate-500 text-left font-mono">
                  <p>ကျောင်းသား ID: CLM-STUDENT-{user.name.slice(0, 3).toUpperCase()}</p>
                  <p>အသိအမှတ်ပြုကုဒ်: <span className="font-bold text-blue-600">{activeCert.verificationId}</span></p>
                  <p>ရက်စွဲ: {activeCert.issuedDate}</p>
                </div>

                <div className="flex items-center space-x-2.5 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-[10px]">VERIFIED EDUCATIONAL DECREE</p>
                    <p className="text-[9px] text-slate-500">Code Learn Myanmar Registrar System</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Action Trigger */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>လက်မှတ် ပုံနှိပ်ထုတ်ယူရန် (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KIBO AI RESPONSE MODAL */}
      {kiboModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-blue-500/30 rounded-3xl w-full max-w-lg p-6 space-y-5 text-slate-300 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">🤖</span>
                <h3 className="font-display font-extrabold text-base text-white">Kibo AI သင်ကြားရေး အကြံပြုချက်</h3>
              </div>
              <button
                onClick={() => setKiboModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {kiboOutputText}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setKiboModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                ကျေးဇူးတင်ပါသည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>မှတ်စုသစ် ရေးသားမည်</span>
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">မှတ်စု ခေါင်းစဉ် (Title)</label>
                <input
                  type="text"
                  placeholder="ဥပမာ - Python Dictionary Functions"
                  value={noteTitleInput}
                  onChange={(e) => setNoteTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">မှတ်စု အကြောင်းအရာ (Content)</label>
                <textarea
                  rows={4}
                  placeholder="မှတ်သားလိုသော အချက်အလက်များ ရေးသားပါ..."
                  value={noteContentInput}
                  onChange={(e) => setNoteContentInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                onClick={handleAddSavedNote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                သိမ်းဆည်းမည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CODE SNIPPET MODAL */}
      {showAddSnippetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Code Snippet သစ် သိမ်းဆည်းမည်</span>
              </h3>
              <button
                onClick={() => setShowAddSnippetModal(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Snippet ခေါင်းစဉ်</label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - React Fetch API Template"
                    value={snippetTitleInput}
                    onChange={(e) => setSnippetTitleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Programming Language</label>
                  <select
                    value={snippetLangInput}
                    onChange={(e) => setSnippetLangInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="python">Python 🐍</option>
                    <option value="javascript">JavaScript ⚡</option>
                    <option value="typescript">TypeScript 📘</option>
                    <option value="html">HTML5 🌐</option>
                    <option value="css">CSS3 🎨</option>
                    <option value="sql">SQL 🗄️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Code ရေးသားပါ</label>
                <textarea
                  rows={6}
                  placeholder={`def hello_world():\n    print("Hello from Code Learn Myanmar!")`}
                  value={snippetCodeInput}
                  onChange={(e) => setSnippetCodeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddSnippetModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                onClick={handleAddCodeSnippet}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Snippet သိမ်းမည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN RESET PROGRESS MODAL */}
      {showAdminResetModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-rose-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-rose-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>ကျောင်းသား လေ့လာမှုတိုးတက်မှု ပြန်စမည်</span>
              </h3>
              <button
                onClick={() => setShowAdminResetModal(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-left">
              <p className="text-slate-300 leading-relaxed">
                သတိပေးချက်: လေ့လာမှုတိုးတက်မှုကို မူလအတိုင်း ပြန်လည်သတ်မှတ်ပါက ပြီးမြောက်ခဲ့သော သင်ခန်းစာများ၊ XP၊ Coins နှင့် Streak များအားလုံး ၀ သို့ ပြန်လည်ရောက်ရှိသွားပါမည်။
              </p>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ကျောင်းသား အီးမေးလ် သို့မဟုတ် ID ရိုက်ထည့်ပါ</label>
                <input
                  type="text"
                  placeholder="student@example.com သို့မဟုတ် ID"
                  value={adminResetConfirmText}
                  onChange={(e) => setAdminResetConfirmText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAdminResetModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                onClick={handleAdminResetStudentProgress}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                အတည်ပြု၍ မူလအတိုင်းစမည် (Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" id="modal-logout-confirm">
          <div className="bg-[#1E293B] border border-slate-750 rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 text-slate-300 shadow-2xl text-left relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center space-x-2.5 text-red-400">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="font-display font-extrabold text-base text-white">
                  အကောင့်မှ ထွက်ခွာရန် အတည်ပြုပါ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                သင်၏ Code Learn Myanmar အကောင့် <strong className="text-white font-mono">{user.email || user.name}</strong> မှ အမှန်တကယ် ထွက်ခွာလိုပါသလား?
              </p>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>လုံခြုံရေး အသိပေးချက်</span>
                </div>
                <p className="text-[11px]">
                  သင့် သင်ယူမှုတိုးတက်မှု (XP, Level, Badges) အားလုံး Cloud ပေါ်တွင် သိမ်းဆည်းထားပြီး ဖြစ်သဖြင့် နောက်တစ်ကြိမ် ပြန်လည်ဝင်ရောက်သည့်အခါ ဆက်လက်လေ့လာနိုင်ပါသည်။
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                id="btn-cancel-logout"
              >
                မထွက်တော့ပါ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onSignOut();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-red-500/20 cursor-pointer flex items-center space-x-1.5"
                id="btn-confirm-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ထွက်မည် (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
