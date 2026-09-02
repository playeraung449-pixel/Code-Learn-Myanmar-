/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import SplashScreen from "./components/SplashScreen";
import Sidebar from "./components/Sidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { SuspenseLoader } from "./components/SuspenseLoader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkStatusBar } from "./components/NetworkStatusBar";
import { AccessibleSkipLink } from "./components/AccessibleSkipLink";
import { useAccessibility } from "./context/AccessibilityContext";

import LessonViewer from "./components/LessonViewer";

// Lazy-loaded routes and heavy subcomponents for blazing fast initial bundle & mobile performance
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ProgressDashboard = lazy(() => import("./pages/ProgressDashboard"));
const Roadmaps = lazy(() => import("./pages/Roadmaps"));
const Projects = lazy(() => import("./pages/Projects"));
const PortfolioSystem = lazy(() => import("./components/PortfolioSystem"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const CodeReview = lazy(() => import("./pages/CodeReview"));
const DebugAssistant = lazy(() => import("./pages/DebugAssistant"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));
const Blog = lazy(() => import("./pages/Blog"));
const Community = lazy(() => import("./pages/Community"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Profile = lazy(() => import("./pages/Profile"));
const PremiumPage = lazy(() => import("./pages/Premium"));
const AuthModal = lazy(() => import("./components/AuthModal"));
const SearchModal = lazy(() => import("./components/SearchModal"));
const NotificationsModal = lazy(() => import("./components/NotificationsModal"));
const DailyRewardModal = lazy(() => import("./components/DailyRewardModal"));
const MaintenanceScreen = lazy(() => import("./components/MaintenanceScreen"));
const AccessibilityModal = lazy(() => import("./components/AccessibilityModal"));
const KeyboardShortcutsModal = lazy(() => import("./components/KeyboardShortcutsModal"));
const ProductionTestSuiteModal = lazy(() => import("./components/ProductionTestSuiteModal"));

import { 
  Search, 
  Bell, 
  Menu, 
  Home as HomeIcon, 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Laptop, 
  Lock, 
  Cloud, 
  X, 
  Trophy, 
  Award, 
  Settings, 
  Code, 
  MessageSquare, 
  FileText, 
  BarChart2, 
  Zap,
  Flame,
  Coins,
  Eye,
  Keyboard
} from "lucide-react";
import FloatingKiboWidget from "./components/FloatingKiboWidget";
import Breadcrumbs from "./components/Breadcrumbs";

import { UserProfile, Course, PaymentSettings, PlatformSystemSettings } from "./types";
import { COURSES } from "./courses/data";
import { auth, onAuthStateChanged, signOut, type FirebaseUser } from "./lib/firebase";
import { 
  saveUserProfile, 
  loadUserProfile, 
  validateFirestoreConnection, 
  logAuditEvent, 
  getPaymentSettings, 
  getPlatformSystemSettings, 
  checkIsAdmin 
} from "./lib/db";
import { cacheManager } from "./lib/cacheManager";
import { performanceManager } from "./lib/performanceManager";
import { continuousPerfEngine } from "./lib/continuousPerformanceMonitoring";

const DEFAULT_USER: UserProfile = {
  name: "မောင်မြန်မာ (You)",
  email: "student@codelearnmyanmar.edu.mm",
  level: 1,
  xp: 150,
  coins: 350,
  learningStreak: 1,
  longestStreak: 1,
  lastCheckInDate: "",
  checkInHistory: [],
  bookmarks: [],
  completedCourses: [],
  completedLessons: [],
  completedProjects: [],
  completedQuizzes: [],
  createdDate: new Date().toLocaleDateString(),
  lastLogin: new Date().toLocaleString(),
  role: "student",
  bio: "မင်္ဂလာပါ! ကျွန်တော်ကတော့ Code Learn Myanmar တွင် ပရိုဂရမ်မင်း စတင်လေ့လာနေသူတစ်ဦး ဖြစ်ပါတယ်ဗျာ။",
  preferredLanguage: "my",
  themePreference: "dark",
  achievements: [
    {
      id: "welcome",
      title: "နွေးထွေးစွာကြိုဆိုအပ်ပါသည်",
      description: "Code Learn Myanmar ပရိုဂရမ်မင်း ပညာရေးလမ်းစဉ်သို့ အောင်မြင်စွာ စတင်ဝင်ရောက်နိုင်ခဲ့ခြင်း။",
      icon: "Sparkles",
      unlockedAt: new Date().toLocaleDateString()
    }
  ],
  certificates: []
};

export default function App() {
  const [coursesList, setCoursesList] = useState<Course[]>(() => {
    const cached = cacheManager.get<Course[]>("clm_courses_catalog");
    return cached.data && Array.isArray(cached.data) && cached.data.length > 0 ? cached.data : COURSES;
  });
  const [showSplash, setShowSplash] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("certId") || params.get("id")) ? "verify-cert" : "home";
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const cached = cacheManager.get<UserProfile>("clm_user_profile");
    return cached.data || DEFAULT_USER;
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Rewards, pricing and promotions
  const [activeSettings, setActiveSettings] = useState<PaymentSettings | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSystemSettings | null>(null);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [qaTestSuiteOpen, setQaTestSuiteOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("clm_theme");
    return (saved as "light" | "dark" | "system") || "dark";
  });

  const { 
    isAccessibilityModalOpen, 
    setIsAccessibilityModalOpen, 
    isShortcutsModalOpen, 
    setIsShortcutsModalOpen 
  } = useAccessibility();

  // Format YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Load active payment/event configurations & platform system settings on startup with caching
  useEffect(() => {
    async function loadActiveConfigs() {
      try {
        const [settings, pSettings] = await Promise.all([
          cacheManager.fetchWithCache("clm_payment_settings", getPaymentSettings, 1000 * 60 * 15, (fresh) => {
            setActiveSettings(fresh);
          }),
          cacheManager.fetchWithCache("clm_platform_settings", getPlatformSystemSettings, 1000 * 60 * 15, (fresh) => {
            setPlatformSettings(fresh);
          })
        ]);
        setActiveSettings(settings);
        setPlatformSettings(pSettings);
      } catch (err) {
        console.warn("Could not load dynamic configs on startup (using safe defaults):", err);
      }
    }
    loadActiveConfigs();
  }, []);

  // Check and trigger daily check-in modal if not checked in today
  useEffect(() => {
    const handleOpenQaSuite = () => setQaTestSuiteOpen(true);
    window.addEventListener("open-qa-suite", handleOpenQaSuite);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || (e.ctrlKey && e.shiftKey)) && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        setQaTestSuiteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-qa-suite", handleOpenQaSuite);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (user && user.lastCheckInDate !== getTodayString()) {
      if (!showSplash) {
        const timer = setTimeout(() => {
          setDailyModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.uid, user?.lastCheckInDate, showSplash]);

  // Handle claiming daily login rewards
  const handleClaimDailyReward = async (xpReward: number, coinsReward: number, newStreak: number) => {
    const todayStr = getTodayString();
    const updatedHistory = [...(user.checkInHistory || [])];
    if (!updatedHistory.includes(todayStr)) {
      updatedHistory.push(todayStr);
    }

    const getLevelDataLocal = (xpPoints: number) => {
      const baseXP = 300;
      const multiplier = 1.4;
      let tempXp = xpPoints;
      let lvl = 1;
      let requiredForNext = baseXP;
      
      while (tempXp >= requiredForNext) {
        tempXp -= requiredForNext;
        lvl++;
        requiredForNext = Math.round(requiredForNext * multiplier);
      }
      
      return {
        level: lvl,
        currentXp: tempXp,
        nextLevelXp: requiredForNext,
        progress: Math.round((tempXp / requiredForNext) * 100)
      };
    };

    const newXp = (user.xp || 0) + xpReward;
    const lvlInfo = getLevelDataLocal(newXp);
    const newLevel = lvlInfo.level;
    const newCoins = (user.coins || 0) + coinsReward;

    const newAchievements = [...(user.achievements || [])];
    
    const awardStreakAchievement = (id: string, title: string, desc: string, icon: string) => {
      const hasAch = newAchievements.some(a => a.id === id);
      if (!hasAch) {
        newAchievements.push({
          id,
          title,
          description: desc,
          icon,
          unlockedAt: new Date().toLocaleDateString()
        });
      }
    };

    if (newStreak === 3) {
      awardStreakAchievement("streak-3", "၃ ရက်ဆက်တိုက် ဇွဲရှင်", "Code Learn Myanmar တွင် ၃ ရက်ဆက်တိုက် နေ့စဉ်ဝင်ရောက်လေ့လာနိုင်ခဲ့ခြင်း။", "Flame");
    } else if (newStreak === 7) {
      awardStreakAchievement("streak-7", "တစ်ပတ်တာ စံပြကျောင်းသား", "Code Learn Myanmar တွင် ၇ ရက်ဆက်တိုက် နေ့စဉ်မပျက်မကွက် ဝင်ရောက်လေ့လာနိုင်ခဲ့ခြင်း။", "Award");
    } else if (newStreak === 15) {
      awardStreakAchievement("streak-15", "၁၅ ရက် စွမ်းအားရှင်", "၁၅ ရက်ဆက်တိုက် ပရိုဂရမ်မင်းသင်ခန်းစာများကို မဆုတ်မနစ် ကြိုးစားအားထုတ်ခဲ့ခြင်း။", "Trophy");
    } else if (newStreak === 30) {
      awardStreakAchievement("streak-30", "ဒဏ္ဍာရီလာ Streak ဘုရင်", "ရက်ပေါင်း ၃၀ တိတိ နေ့စဉ်မပြတ် လေ့လာသင်ယူမှုပြုလုပ်ခဲ့သည့် ထူးချွန်ကျောင်းသား။", "Sparkles");
    }

    const updatedProfile: UserProfile = {
      ...user,
      xp: newXp,
      level: newLevel,
      coins: newCoins,
      learningStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak || 1),
      lastCheckInDate: todayStr,
      checkInHistory: updatedHistory,
      achievements: newAchievements
    };

    await handleUpdateUser(updatedProfile);
  };

  // Dynamic course list fetching with Stale-While-Revalidate caching
  useEffect(() => {
    cacheManager.fetchWithCache(
      "clm_courses_catalog",
      async () => {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Backend dynamic courses fetch failed");
        return await res.json();
      },
      1000 * 60 * 60 * 12, // 12 hours TTL
      (freshCourses) => {
        if (freshCourses && Array.isArray(freshCourses) && freshCourses.length > 0) {
          setCoursesList(freshCourses);
          if (selectedCourse) {
            const updated = freshCourses.find((c: Course) => c.id === selectedCourse.id);
            if (updated) setSelectedCourse(updated);
          }
        }
      }
    ).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setCoursesList(data);
      }
    }).catch((err) => {
      console.info("Courses loaded from robust static/offline cache:", err?.message || err);
    });
  }, []);

  // Load user progress from localStorage on mount and register Firebase Auth listener
  useEffect(() => {
    validateFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          let cloudProfile = await loadUserProfile(fUser.uid);
          if (cloudProfile) {
            cloudProfile = {
              ...cloudProfile,
              lastLogin: new Date().toLocaleString()
            };
            await saveUserProfile(fUser.uid, cloudProfile);
            setUser(cloudProfile);
            cacheManager.set("clm_user_profile", cloudProfile);
          } else {
            const localCached = cacheManager.get<UserProfile>("clm_user_profile").data || DEFAULT_USER;
            const syncedProfile: UserProfile = {
              ...localCached,
              uid: fUser.uid,
              email: fUser.email || localCached.email,
              name: fUser.displayName || localCached.name || "ကျောင်းသားသစ်",
              coins: localCached.coins ?? 350,
              learningStreak: localCached.learningStreak ?? 1,
              bookmarks: localCached.bookmarks ?? [],
              completedCourses: localCached.completedCourses ?? [],
              createdDate: localCached.createdDate ?? new Date().toLocaleDateString(),
              lastLogin: new Date().toLocaleString(),
              role: "student"
            };
            await saveUserProfile(fUser.uid, syncedProfile);
            setUser(syncedProfile);
            cacheManager.set("clm_user_profile", syncedProfile);
          }
        } catch (err) {
          console.error("Error fetching cloud profile (falling back to local cache):", err);
          const localCached = cacheManager.get<UserProfile>("clm_user_profile").data || DEFAULT_USER;
          const syncedProfile: UserProfile = {
            ...localCached,
            uid: fUser.uid,
            email: fUser.email || localCached.email,
            name: fUser.displayName || localCached.name || "ကျောင်းသားသစ်"
          };
          setUser(syncedProfile);
          cacheManager.set("clm_user_profile", syncedProfile);
        }
      } else {
        const localCached = cacheManager.get<UserProfile>("clm_user_profile").data;
        if (localCached) {
          setUser(localCached);
        } else {
          setUser(DEFAULT_USER);
          cacheManager.set("clm_user_profile", DEFAULT_USER);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (updated: UserProfile) => {
    setUser(updated);
    cacheManager.set("clm_user_profile", updated);
    if (firebaseUser) {
      try {
        await saveUserProfile(firebaseUser.uid, updated);
      } catch (err) {
        console.error("Error saving user profile to cloud database:", err);
      }
    }
  };

  const handleRefreshUser = async () => {
    if (firebaseUser) {
      try {
        const fresh = await loadUserProfile(firebaseUser.uid);
        if (fresh) {
          setUser(fresh);
          cacheManager.set("clm_user_profile", fresh);
        }
      } catch (err) {
        console.error("Error refreshing cloud profile:", err);
      }
    }
  };

  const handleAuthSuccess = async (uidOrUser: UserProfile | string, email?: string, name?: string) => {
    if (typeof uidOrUser === "string") {
      try {
        const loaded = await loadUserProfile(uidOrUser);
        if (loaded) {
          setUser(loaded);
          cacheManager.set("clm_user_profile", loaded);
        } else {
          const newUser: UserProfile = {
            uid: uidOrUser,
            name: name || "Learner",
            email: email || "",
            level: 1,
            xp: 0,
            coins: 50,
            completedLessons: [],
            achievements: [],
            certificates: []
          };
          setUser(newUser);
          cacheManager.set("clm_user_profile", newUser);
        }
      } catch (e) {
        console.warn("Could not load user profile on auth success:", e);
      }
    } else {
      setUser(uidOrUser);
      cacheManager.set("clm_user_profile", uidOrUser);
    }
    setAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      if (user && user.uid) {
        await logAuditEvent(user.uid, "USER_LOGOUT");
      }
    } catch (e) {
      console.warn("Could not log logout audit event:", e);
    }
    
    await signOut(auth);
    setFirebaseUser(null);
    setUser(DEFAULT_USER);
    cacheManager.set("clm_user_profile", DEFAULT_USER);
    setCurrentTab("home");
  };

  const handleStartCourse = (course: Course, lessonIdx: number = 0) => {
    setSelectedCourse(course);
    setSelectedLessonIdx(lessonIdx);
    continuousPerfEngine.recordPageLoad(`Lesson: ${course.title} (Part ${lessonIdx + 1})`, 180);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResumeLearning = () => {
    const completedSet = new Set(user.completedLessons || []);
    const activeCourses = coursesList && coursesList.length > 0 ? coursesList : COURSES;
    for (const course of activeCourses) {
      for (let idx = 0; idx < course.lessons.length; idx++) {
        const lesson = course.lessons[idx];
        if (!completedSet.has(lesson.id)) {
          handleStartCourse(course, idx);
          return;
        }
      }
    }
    handleStartCourse(activeCourses[0], 0);
  };

  const handleSetTab = (tab: string) => {
    if (tab === "lessons") {
      handleResumeLearning();
      return;
    }
    setCurrentTab(tab);
    setSelectedCourse(null);
    continuousPerfEngine.recordPageLoad(`View: ${tab.toUpperCase()}`, 140);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBreadcrumbItems = () => {
    const homeItem = {
      label: "Home",
      onClick: () => handleSetTab("home"),
      icon: HomeIcon
    };

    switch (currentTab) {
      case "home":
        return [{ label: "Home (ပင်မ)", isCurrent: true, icon: HomeIcon }];
      case "courses":
        return [homeItem, { label: "သင်တန်းများ (Courses)", isCurrent: true, icon: BookOpen }];
      case "projects":
        return [homeItem, { label: "လက်တွေ့လေ့ကျင့်ခန်းများ (Practice)", isCurrent: true, icon: Code }];
      case "ai-assistant":
        return [homeItem, { label: "Kibo AI လက်ထောက်", isCurrent: true, icon: Sparkles }];
      case "community":
        return [homeItem, { label: "ကွန်မြူနတီ ဖိုရမ် (Community)", isCurrent: true, icon: MessageSquare }];
      case "profile":
        return [homeItem, { label: "ကျောင်းသားကိုယ်ရေးအကျဉ်း (Profile)", isCurrent: true, icon: UserIcon }];
      case "premium":
        return [homeItem, { label: "👑 Kibo Premium VIP", isCurrent: true, icon: Sparkles, badge: "PRO" }];
      case "progress":
        return [homeItem, { label: "တက်လှမ်းမှုမှတ်တမ်း (Dashboard)", isCurrent: true, icon: Trophy }];
      case "roadmaps":
        return [homeItem, { label: "လမ်းညွှန်မြေပုံများ (Roadmaps)", isCurrent: true }];
      case "code-review":
        return [homeItem, { label: "Practice", onClick: () => handleSetTab("projects"), icon: Code }, { label: "AI Code Reviewer", isCurrent: true }];
      case "debug-assistant":
        return [homeItem, { label: "Practice", onClick: () => handleSetTab("projects"), icon: Code }, { label: "AI Debug Assistant", isCurrent: true }];
      case "portfolio":
        return [homeItem, { label: "Portfolios Showcase", isCurrent: true }];
      case "blog":
        return [homeItem, { label: "ဗဟုသုတဆောင်းပါးများ (Tech Blog)", isCurrent: true, icon: FileText }];
      case "verify-cert":
        return [homeItem, { label: "လက်မှတ် စစ်ဆေးခြင်း (Verify Certificate)", isCurrent: true }];
      case "admin":
        return [homeItem, { label: "Admin Control Panel", isCurrent: true }];
      default:
        return [homeItem, { label: currentTab, isCurrent: true }];
    }
  };

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("clm_theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Accessibility Keyboard Skip Link */}
      <AccessibleSkipLink />

      {/* Network & Offline Status Indicator */}
      <NetworkStatusBar />

      {/* Splash Screen on Initial App Load */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Global System Maintenance Screen Banner */}
      {platformSettings?.maintenanceMode && !checkIsAdmin(user) && (
        <Suspense fallback={null}>
          <MaintenanceScreen
            settings={platformSettings}
            onAdminBypassLogin={() => setAuthModalOpen(true)}
          />
        </Suspense>
      )}

      {/* Global Quick Search Command Palette (Modal) */}
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            setCurrentTab={setCurrentTab}
            onStartCourse={(course, idx) => {
              handleStartCourse(course, idx);
              setSearchOpen(false);
            }}
            courses={coursesList}
          />
        </Suspense>
      )}

      {/* Global Notifications Modal */}
      {notifOpen && (
        <Suspense fallback={null}>
          <NotificationsModal
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            user={user}
            onNavigateTab={handleSetTab}
          />
        </Suspense>
      )}

      {/* ACTIVE LESSON VIEWER (Full Screen Study Mode) */}
      {selectedCourse ? (
        <main className="flex-1 w-full min-h-screen bg-slate-950 text-white">
          <ErrorBoundary onReset={() => setSelectedCourse(null)}>
            <Suspense fallback={<SuspenseLoader messageMm="သင်ခန်းစာ ဖွင့်လှစ်နေပါသည်..." />}>
              <LessonViewer
                course={selectedCourse}
                onBack={() => setSelectedCourse(null)}
                user={user}
                onUpdateUser={handleUpdateUser}
                initialLessonIdx={selectedLessonIdx}
                onNavigateTab={(tab) => {
                  setSelectedCourse(null);
                  setCurrentTab(tab);
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      ) : (
        /* Layout Structure with Left Sidebar (Desktop) or Mobile headers and Bottom Navigation (Mobile) */
        <>
          {/* DESKTOP LEFT SIDEBAR (Hidden on mobile/tablet) */}
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={handleSetTab}
              user={user}
              firebaseUser={firebaseUser}
              onSignOut={handleSignOut}
              onOpenAuth={() => setAuthModalOpen(true)}
              onStartCourse={handleStartCourse}
              theme={theme as any}
              onThemeChange={setTheme}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenNotif={() => setNotifOpen(true)}
              courses={coursesList}
            />
          </div>

          {/* MAIN CONTAINER WORKSPACE */}
          <div className="flex-1 min-w-0 flex flex-col min-h-screen">
            
            {/* DESKTOP TOP HEADER / STATUS BAR (Hidden on mobile) */}
            <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    SYSTEM ONLINE • CLM-CORE v3.0
                  </span>
                </div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white font-display tracking-tight mt-0.5">
                  {currentTab === "home" && "မင်္ဂလာပါ! ကမ္ဘာသစ်ကို စတင်ဖန်တီးကြစို့ 💻"}
                  {currentTab === "progress" && "ကျောင်းသားပင်မဒိုင်ခွက် (Student Dashboard)"}
                  {currentTab === "roadmaps" && "အသက်မွေးဝမ်းကျောင်း လမ်းညွှန်မြေပုံများ (Career Roadmaps)"}
                  {currentTab === "courses" && "အွန်လိုင်းသင်တန်းများ (LMS Courses)"}
                  {currentTab === "projects" && "လက်တွေ့လေ့ကျင့်ရန် ပရောဂျက်များ (Sandbox Projects)"}
                  {currentTab === "ai-assistant" && "Ask AI ဉာဏ်ရည်တုသင်ကြားရေးလက်ထောက်"}
                  {currentTab === "code-review" && "AI ကုဒ်ဆန်းစစ်ချက်ဌာန (AI Code Reviewer)"}
                  {currentTab === "debug-assistant" && "AI အမှားပြင်လက်ထောက် (AI Debug Assistant)"}
                  {currentTab === "verify-cert" && "အောင်မြင်မှုလက်မှတ် စစ်ဆေးရေးဌာန (Certificate Verification)"}
                  {currentTab === "blog" && "ပရိုဂရမ်မင်း ဗဟုသုတဆောင်းပါးများ (Tech Blogs)"}
                  {currentTab === "community" && "မြန်မာကျောင်းသားများ အမေး/အဖြေ ဖိုရမ်"}
                  {currentTab === "profile" && "ကျောင်းသားကိုယ်ရေးမှတ်တမ်းနှင့် အချက်အလက်များ"}
                  {currentTab === "premium" && "👑 ကန့်သတ်မဲ့ Premium အဆင့်မြှင့်တင်မှု (Kibo Premium)"}
                  {currentTab === "admin" && "🛡️ အက်ဒမင် စီမံခန့်ခွဲရေးဗဟိုဌာန (Admin Panel)"}
                </h1>
              </div>

              {/* Top Header Controls with User Stats */}
              <div className="flex items-center space-x-2.5">
                {/* Learning Streak Pill */}
                <div 
                  onClick={() => setDailyModalOpen(true)}
                  title="Daily Learning Streak - Click to claim reward"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono cursor-pointer hover:bg-amber-500/15 transition-all"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  <span>{user.learningStreak || 1}d Streak</span>
                </div>

                {/* Coins Balance Pill */}
                <div 
                  onClick={() => handleSetTab("progress")}
                  title="Your Learning Coins"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold font-mono cursor-pointer hover:bg-yellow-500/15 transition-all"
                >
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>{user.coins || 0}</span>
                </div>

                {/* Level / XP Pill */}
                <div 
                  onClick={() => handleSetTab("progress")}
                  title="Level & Total XP"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono cursor-pointer hover:bg-blue-500/15 transition-all"
                >
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">LVL {user.level}</span>
                  <span>{user.xp} XP</span>
                </div>

                {/* Search Bar Shortcut */}
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="h-9 px-3 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Quick Search</span>
                  <kbd className="font-mono text-[9px] bg-slate-200 dark:bg-slate-750 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                    ⌘K
                  </kbd>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => setNotifOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all cursor-pointer relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </button>

                {/* Accessibility Settings Trigger */}
                <button
                  onClick={() => setIsAccessibilityModalOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
                  title="Accessibility & Display (Alt+A) - စာလုံးအရွယ်အစားနှင့် မြင်သာထင်ရှားမှု"
                  aria-label="Open accessibility settings"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                </button>

                {/* Keyboard Shortcuts Trigger */}
                <button
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all cursor-pointer"
                  title="Keyboard Shortcuts (Shift+?) - ကီးဘုတ်လမ်းညွှန်"
                  aria-label="Open keyboard navigation shortcuts"
                >
                  <Keyboard className="w-4 h-4 text-purple-500" />
                </button>

                {/* Theme Mode Toggle */}
                <ThemeToggle variant="icon-only" />

                {/* Header User Capsule */}
                <div 
                  onClick={() => handleSetTab("profile")}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 cursor-pointer hover:border-blue-500 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate leading-none">{user?.name || "Student"}</p>
                    {user?.isPremium && (
                      <span className="text-[9px] text-amber-500 font-bold font-mono">👑 PRO</span>
                    )}
                  </div>
                </div>

                {/* Direct Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Sign out (အကောင့်မှထွက်ရန်)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* MOBILE TOP BAR HEADER (Only visible on screens < lg) */}
            <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] sticky top-0 z-20 transition-colors duration-200">
              <div 
                onClick={() => handleSetTab("home")}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <img 
                  src="https://i.ibb.co/tMS4fMck/file-00000000c5c872438eb118e0d2d35195.png" 
                  alt="Code Learn Myanmar Logo" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                  Code Learn
                </span>
              </div>

              {/* Mobile controls */}
              <div className="flex items-center space-x-1">
                <ThemeToggle variant="icon-only" className="p-1.5" />

                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setNotifOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </header>

            {/* MOBILE DRAWER / SLIDE-OUT OVERLAY MENU */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 top-14 z-30 bg-slate-900/60 backdrop-blur-sm flex justify-end text-left animate-fade-in animate-duration-150">
                <div className="w-72 bg-white dark:bg-[#1E293B] h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-6">
                    {/* Core 8 Navigation Pillars */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                        ပင်မလမ်းညွှန် (Core Navigation)
                      </p>

                      <button
                        onClick={() => {
                          handleSetTab("home");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "home" 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <HomeIcon className="w-4 h-4" />
                        <span>ပင်မစာမျက်နှာ (Home)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("courses");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "courses" 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>သင်တန်းများ (Courses)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("lessons");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span>သင်ခန်းစာများ (Lessons)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("projects");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "projects" 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Code className="w-4 h-4 text-indigo-500" />
                        <span>လက်တွေ့လေ့ကျင့်ခန်း (Practice)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("ai-assistant");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "ai-assistant" 
                            ? "bg-purple-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>Kibo AI လက်ထောက် (Kibo)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("community");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "community" 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-teal-500" />
                        <span>ကွန်မြူနတီ (Community)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("profile");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTab === "profile" 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <UserIcon className="w-4 h-4 text-sky-500" />
                        <span>ကျောင်းသားပရိုဖိုင် (Profile)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("premium");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer mt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>👑 Kibo Premium</span>
                        </div>
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">VIP</span>
                      </button>
                    </div>

                    {/* Student Records Shortcuts */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2">
                        ကျောင်းသားမှတ်တမ်း (Student Records)
                      </p>
                    
                      <button
                        onClick={() => {
                          handleSetTab("profile");
                          setTimeout(() => window.dispatchEvent(new CustomEvent("changeProfileSubTab", { detail: "bookmarks" })), 50);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span>မှတ်သားထားသော သင်ခန်းစာများ</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("profile");
                          setTimeout(() => window.dispatchEvent(new CustomEvent("changeProfileSubTab", { detail: "certificates" })), 50);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <Award className="w-4 h-4 text-emerald-500" />
                        <span>ဘွဲ့ရလက်မှတ်များ (Certificates)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("profile");
                          setTimeout(() => window.dispatchEvent(new CustomEvent("changeProfileSubTab", { detail: "dashboard" })), 50);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span>အောင်မြင်မှုနှင့် တံဆိပ်များ</span>
                      </button>
                    </div>

                    {/* Extra Tools & Resources */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2">
                        နောက်ထပ်ကိရိယာများ (Extra Tools)
                      </p>

                      <button
                        onClick={() => {
                          handleSetTab("roadmaps");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <span>လမ်းညွှန်မြေပုံများ (Roadmaps)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("code-review");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <Code className="w-4 h-4 text-violet-400" />
                        <span>AI ကုဒ်ဆန်းစစ်ချက် (Code Review)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSetTab("blog");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-500"
                      >
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span>ဗဟုသုတဆောင်းပါးများ (Blog)</span>
                      </button>

                      {checkIsAdmin(user) && (
                        <button
                          onClick={() => {
                            handleSetTab("admin");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}
                    </div>

                    {/* Theme Mode Selector in Drawer */}
                    <div className="pt-2 space-y-2">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        အသွင်အပြင် & မြင်သာမှု (Display & Accessibility)
                      </p>
                      <ThemeToggle variant="compact" className="w-full justify-between" />
                      
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccessibilityModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="min-h-[44px] flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Accessibility</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsShortcutsModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="min-h-[44px] flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Keyboard className="w-4 h-4" />
                          <span>Shortcuts (?)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white font-mono">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[140px]">{user?.name || "Student"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Level {user?.level || 1} Student</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout (ထွက်ရန်)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTED CONTENT VIEW AREA WITH ERROR BOUNDARY & SUSPENSE */}
            <main id="main-content" tabIndex={-1} className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8 focus:outline-none">
              {/* GLOBAL HIERARCHICAL BREADCRUMB BAR */}
              <div className="mb-4 sm:mb-6">
                <Breadcrumbs items={getBreadcrumbItems()} />
              </div>

              <ErrorBoundary key={currentTab} onReset={() => handleSetTab("home")}>
                <Suspense fallback={<SuspenseLoader messageMm="စာမျက်နှာ ဖွင့်လှစ်နေပါသည်..." />}>
                  {currentTab === "home" && (
                    <Home 
                      setCurrentTab={handleSetTab} 
                      setSelectedCourse={(course, lessonIdx) => handleStartCourse(course, lessonIdx || 0)} 
                      courses={coursesList} 
                      user={user}
                      onOpenCheckIn={() => setDailyModalOpen(true)}
                    />
                  )}
                  {currentTab === "progress" && (
                    <ProgressDashboard
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      setCurrentTab={handleSetTab}
                      setSelectedCourse={(course, lessonIdx) => handleStartCourse(course, lessonIdx)}
                      courses={coursesList}
                      onOpenCheckIn={() => setDailyModalOpen(true)}
                      activeSettings={activeSettings}
                    />
                  )}
                  {currentTab === "roadmaps" && (
                    <Roadmaps
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      setCurrentTab={handleSetTab}
                      setSelectedCourse={handleStartCourse}
                      courses={coursesList}
                    />
                  )}
                  {currentTab === "courses" && (
                    <Courses 
                      courses={coursesList} 
                      selectedCourse={selectedCourse} 
                      setSelectedCourse={handleStartCourse} 
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      onNavigateTab={handleSetTab}
                      activeSettings={activeSettings}
                    />
                  )}
                  {currentTab === "projects" && (
                    <Projects 
                      user={user} 
                      onUpdateUser={handleUpdateUser} 
                    />
                  )}
                  {currentTab === "portfolio" && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <PortfolioSystem 
                        user={user} 
                        onUpdateUser={handleUpdateUser} 
                        viewMode="public_showcase" 
                      />
                    </div>
                  )}
                  {currentTab === "ai-assistant" && (
                    <AIAssistant 
                      currentCourse={selectedCourse} 
                      currentLesson={selectedCourse ? (selectedCourse.lessons[selectedLessonIdx] || null) : null} 
                      user={user}
                      onUpdateUser={handleUpdateUser}
                    />
                  )}
                  {currentTab === "code-review" && (
                    <CodeReview 
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      setCurrentTab={handleSetTab}
                    />
                  )}
                  {currentTab === "debug-assistant" && (
                    <DebugAssistant 
                      user={user}
                      onUpdateUser={handleUpdateUser}
                      setCurrentTab={handleSetTab}
                    />
                  )}
                  {currentTab === "verify-cert" && (
                    <CertificateVerify user={user} />
                  )}
                  {currentTab === "blog" && (
                    <Blog />
                  )}
                  {currentTab === "community" && (
                    <Community />
                  )}
                  {currentTab === "about" && (
                    <About />
                  )}
                  {currentTab === "profile" && (
                    <Profile 
                      user={user} 
                      firebaseUser={firebaseUser}
                      onSignOut={handleSignOut}
                      onOpenAuth={() => setAuthModalOpen(true)}
                      onUpdateUser={handleUpdateUser}
                      theme={theme}
                      onThemeChange={setTheme}
                    />
                  )}
                  {currentTab === "contact" && (
                    <Contact user={user} />
                  )}
                  {currentTab === "premium" && (
                    <PremiumPage 
                      user={user} 
                      firebaseUser={firebaseUser} 
                      onRefreshUser={handleRefreshUser} 
                    />
                  )}
                  {currentTab === "admin" && (
                    <AdminPanel
                      user={user}
                      firebaseUser={firebaseUser}
                      onRefreshUser={handleRefreshUser}
                      onNavigateTab={handleSetTab}
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* PLATFORM GLOBAL FOOTER */}
            <Footer setCurrentTab={handleSetTab} />

            {/* MOBILE FLOATING STICKY BOTTOM NAVIGATION BAR (Screens < lg) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-2 pb-safe shadow-lg">
              <button
                onClick={() => handleSetTab("home")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer ${
                  currentTab === "home" ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Home"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium">Home</span>
              </button>

              <button
                onClick={() => handleSetTab("courses")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer ${
                  currentTab === "courses" ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Courses"
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium">Courses</span>
              </button>

              <button
                onClick={() => handleSetTab("projects")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer ${
                  currentTab === "projects" ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Practice"
              >
                <Code className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium">Practice</span>
              </button>

              <button
                onClick={() => handleSetTab("ai-assistant")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer relative ${
                  currentTab === "ai-assistant" ? "text-purple-600 dark:text-purple-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-purple-500"
                }`}
                title="Kibo AI"
              >
                <div className="relative">
                  <Sparkles className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
                <span className="text-[9px] mt-0.5 font-medium">Kibo</span>
              </button>

              <button
                onClick={() => handleSetTab("community")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer ${
                  currentTab === "community" ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Community"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium">Forum</span>
              </button>

              <button
                onClick={() => handleSetTab("profile")}
                className={`flex flex-col items-center justify-center w-12 h-12 transition-all cursor-pointer ${
                  currentTab === "profile" ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Profile"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium">Profile</span>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Floating Kibo AI Companion Widget */}
      <FloatingKiboWidget 
        user={user} 
        currentTab={currentTab} 
        onNavigateTab={handleSetTab} 
      />

      {/* Auth Modal */}
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        </Suspense>
      )}

      {/* Daily Reward Modal */}
      {dailyModalOpen && (
        <Suspense fallback={null}>
          <DailyRewardModal
            user={user}
            isOpen={dailyModalOpen}
            onClose={() => setDailyModalOpen(false)}
            onClaim={handleClaimDailyReward}
            activeSettings={activeSettings}
          />
        </Suspense>
      )}

      {/* Global Accessibility Settings Modal */}
      {isAccessibilityModalOpen && (
        <Suspense fallback={null}>
          <AccessibilityModal
            isOpen={isAccessibilityModalOpen}
            onClose={() => setIsAccessibilityModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Global Keyboard Shortcuts Guide Modal */}
      {isShortcutsModalOpen && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Enterprise Production QA Testing Suite Modal */}
      {qaTestSuiteOpen && (
        <Suspense fallback={null}>
          <ProductionTestSuiteModal
            isOpen={qaTestSuiteOpen}
            onClose={() => setQaTestSuiteOpen(false)}
            currentUser={user}
          />
        </Suspense>
      )}
    </div>
  );
}
