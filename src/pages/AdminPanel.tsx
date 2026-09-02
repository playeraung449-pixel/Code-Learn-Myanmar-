/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileCode, 
  HelpCircle, 
  ClipboardList, 
  FolderGit2, 
  Crown, 
  CreditCard, 
  MessageSquare, 
  ShieldAlert, 
  Megaphone, 
  Bot, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Lock, 
  Unlock, 
  Eye, 
  Edit3, 
  Trash2, 
  Send, 
  Sparkles, 
  Activity, 
  Database, 
  Key, 
  HardDrive, 
  Cpu, 
  Server, 
  DollarSign, 
  Check, 
  ChevronRight, 
  Download, 
  ExternalLink,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
  Award,
  Bell,
  X,
  Copy,
  LogOut,
  FileCheck2
} from "lucide-react";
import { 
  UserProfile, 
  Course, 
  Lesson, 
  PaymentRequest, 
  RefundRequest, 
  PaymentDispute, 
  PaymentAuditLog,
  AnnouncementItem,
  AdminAccount,
  AdminRoleType,
  AdminPermission,
  INITIAL_ADMIN_EMAILS
} from "../types";
import { COURSES } from "../courses/data";
import { 
  checkIsAdmin, 
  getUserAdminRole,
  checkHasPermission,
  getAllUsersFromDb, 
  adminUpdateUserProfile,
  getAllPaymentRequests,
  updatePaymentRequestStatus,
  getAllRefundRequests,
  updateRefundRequestStatus,
  getAllPaymentDisputes,
  updatePaymentDispute,
  getPaymentAuditLogs,
  addPaymentAuditLog,
  getPaymentSettings,
  savePaymentSettings,
  getAnnouncementsFromDb,
  saveAnnouncementToDb,
  deleteAnnouncementFromDb,
  adminActivateUserPremium,
  adminDeactivateUserPremium,
  adminExtendUserPremium,
  adminSimpleExtendUserPremium,
  adminSuspendUser,
  adminRestoreUser,
  adminAddInternalNote,
  getCoursesFromDb
} from "../lib/db";
import { auth, signInWithGoogle } from "../lib/firebase";
import UserManagementModule from "../components/UserManagementModule";
import ContentManagementModule from "../components/ContentManagementModule";
import AssessmentManagementModule from "../components/AssessmentManagementModule";
import { PremiumAndPaymentManagementModule } from "../components/PremiumAndPaymentManagementModule";
import { TelegramVerificationAdminTab } from "../components/payment/TelegramVerificationAdminTab";
import { AdminPlatformAnalyticsModule } from "../components/AdminPlatformAnalyticsModule";
import KiboAIManagementModule from "../components/KiboAIManagementModule";
import { AnnouncementManagementModule } from "../components/AnnouncementManagementModule";
import { CommunityModerationModule } from "../components/CommunityModerationModule";
import SecurityManagementModule from "../components/SecurityManagementModule";
import { EnterpriseSecurityMonitoringCenter } from "../components/EnterpriseSecurityMonitoringCenter";
import { ContinuousPerformanceMonitoringModule } from "../components/ContinuousPerformanceMonitoringModule";
import BackupAndDisasterRecoveryModule from "../components/BackupAndDisasterRecoveryModule";
import ProductionTestSuiteModal from "../components/ProductionTestSuiteModal";
import { ThemeToggle } from "../components/ThemeToggle";

interface AdminPanelProps {
  user: UserProfile;
  firebaseUser: any;
  onRefreshUser: () => void;
  onNavigateTab?: (tab: string) => void;
}

type AdminTab = 
  | "dashboard"
  | "users"
  | "uid_search"
  | "premium"
  | "payments"
  | "courses"
  | "lessons"
  | "quizzes"
  | "assignments"
  | "projects"
  | "kibo_ai"
  | "telegram"
  | "notifications"
  | "announcements"
  | "reports"
  | "security"
  | "community"
  | "analytics"
  | "settings"
  | "monitoring"
  | "performance"
  | "backup"
  | "qa_testing";

export default function AdminPanel({ user, firebaseUser, onRefreshUser, onNavigateTab }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Security Verification & RBAC Role Detection
  const isAdminAuthorized = useMemo(() => {
    return checkIsAdmin(user, firebaseUser);
  }, [user, firebaseUser]);

  const currentAdminRole = useMemo<AdminRoleType | "student">(() => {
    return getUserAdminRole(user, firebaseUser);
  }, [user, firebaseUser]);

  const hasPermission = (permission: AdminPermission): boolean => {
    return checkHasPermission(user, firebaseUser, permission);
  };

  // Global Admin State
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>(COURSES);
  const [allPaymentRequests, setAllPaymentRequests] = useState<PaymentRequest[]>([]);
  const [allRefunds, setAllRefunds] = useState<RefundRequest[]>([]);
  const [allDisputes, setAllDisputes] = useState<PaymentDispute[]>([]);
  const [allAuditLogs, setAllAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // UID Search & Diagnostic Station State
  const [uidSearchQuery, setUidSearchQuery] = useState("");
  const [inspectedUidUser, setInspectedUidUser] = useState<UserProfile | null>(null);
  const [isSearchingUid, setIsSearchingUid] = useState(false);
  const [uidFeedbackMessage, setUidFeedbackMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const [customBonusXp, setCustomBonusXp] = useState(100);
  const [customBonusCoins, setCustomBonusCoins] = useState(50);
  const [customAdminNote, setCustomAdminNote] = useState("");

  // System Status State
  const [sysStatus, setSysStatus] = useState({
    database: "operational",
    auth: "operational",
    storage: "operational",
    ai: "operational",
    app: "operational",
    lastChecked: new Date().toLocaleTimeString()
  });

  // Filters & Sub-states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [selectedUserModal, setSelectedUserModal] = useState<UserProfile | null>(null);

  // Course / Lesson Create States
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState<Course["category"]>("basics");
  const [newCourseDiff, setNewCourseDiff] = useState<Course["difficulty"]>("Level 1: Beginner");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonTargetCourseId, setLessonTargetCourseId] = useState(COURSES[0]?.id || "python-basics");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("30 mins");
  const [newLessonWhatIsIt, setNewLessonWhatIsIt] = useState("");
  const [newLessonSyntax, setNewLessonSyntax] = useState("");

  // Announcement Creation Modal
  const [isAddAnnounceOpen, setIsAddAnnounceOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annTitleMm, setAnnTitleMm] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<AnnouncementItem["type"]>("General");
  const [annAudience, setAnnAudience] = useState<"all" | "premium_only">("all");
  const [annPinned, setAnnPinned] = useState(false);

  // Kibo AI Config
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiSystemInstruction, setAiSystemInstruction] = useState(
    "You are Kibo AI (ကီဘို), the friendly AI mentor for Code Learn Myanmar students. Always respond in clear Myanmar language mixed with standard English programming keywords."
  );

  // Load Admin Data on mount & refresh
  const handleRefreshAllAdminData = async () => {
    setLoading(true);
    try {
      const [uList, pReqs, refList, dispList, logsList, annList, cList] = await Promise.all([
        getAllUsersFromDb(),
        getAllPaymentRequests(),
        getAllRefundRequests(),
        getAllPaymentDisputes(),
        getPaymentAuditLogs(),
        getAnnouncementsFromDb(),
        getCoursesFromDb()
      ]);

      setAllUsers(uList);
      setAllPaymentRequests(pReqs);
      setAllRefunds(refList);
      setAllDisputes(dispList);
      setAllAuditLogs(logsList);
      setAnnouncements(annList);
      setAllCourses(cList);
    } catch (err) {
      console.error("Failed loading Admin panel data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthorized) return;
    handleRefreshAllAdminData();
  }, [isAdminAuthorized]);

  // System Health Ping
  const handleCheckSystemHealth = () => {
    setSysStatus({
      database: "operational",
      auth: "operational",
      storage: "operational",
      ai: "operational",
      app: "operational",
      lastChecked: new Date().toLocaleTimeString()
    });
    addPaymentAuditLog(
      "policy",
      "sys_check",
      "System Health Check",
      user.name || "Admin",
      user.uid || "admin",
      "Ran system diagnostic health check. All 5 sub-systems operational."
    );
  };

  // User Actions
  const handleToggleUserRole = async (targetUser: UserProfile, newRole: string) => {
    try {
      await adminUpdateUserProfile(targetUser.uid || "", { role: newRole });
      setAllUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u));
      if (selectedUserModal?.uid === targetUser.uid) {
        setSelectedUserModal(prev => prev ? { ...prev, role: newRole } : null);
      }
      alert(`ကျောင်းသား [${targetUser.name}] ၏ အကောင့်ရာထူးကို [${newRole}] သို့ အောင်မြင်စွာ ပြောင်းလဲလိုက်ပါပြီ!`);
      
      addPaymentAuditLog(
        "policy",
        targetUser.uid || "user",
        "Role Change",
        user.name || "Admin",
        user.uid || "admin",
        `Changed role of ${targetUser.email} to ${newRole}`
      );
    } catch (err) {
      alert("Role ပြောင်းလဲခြင်း မအောင်မြင်ပါ။");
    }
  };

  const handleGrantXpAndCoins = async (targetUser: UserProfile, bonusXp: number, bonusCoins: number) => {
    const updatedXp = (targetUser.xp || 0) + bonusXp;
    const updatedCoins = (targetUser.coins || 0) + bonusCoins;

    try {
      await adminUpdateUserProfile(targetUser.uid || "", { xp: updatedXp, coins: updatedCoins });
      setAllUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, xp: updatedXp, coins: updatedCoins } : u));
      alert(`[${targetUser.name}] သို့ XP +${bonusXp} နှင့် Coins +${bonusCoins} ချီးမြှင့်လိုက်ပါပြီ!`);
      
      addPaymentAuditLog(
        "policy",
        targetUser.uid || "user",
        "Bonus Reward",
        user.name || "Admin",
        user.uid || "admin",
        `Granted ${bonusXp} XP and ${bonusCoins} Coins to ${targetUser.email}`
      );
    } catch (err) {
      alert("ဆုကြေးပေးအပ်ခြင်း မအောင်မြင်ပါ။");
    }
  };

  // UID Search and Inspection Station Handlers
  const handlePerformUidSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : uidSearchQuery).trim().toLowerCase();
    if (!q) {
      setInspectedUidUser(null);
      setUidFeedbackMessage({ text: "ကျေးဇူးပြု၍ ရှာဖွေလိုသော Student UID သို့မဟုတ် Email ရိုက်ထည့်ပါ", type: "info" });
      return;
    }

    setIsSearchingUid(true);
    setUidFeedbackMessage(null);

    const found = allUsers.find(u => 
      (u.uid && u.uid.toLowerCase() === q) ||
      (u.uid && u.uid.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase() === q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q))
    );

    if (found) {
      setInspectedUidUser(found);
      setUidFeedbackMessage({ text: `ကျောင်းသား အချက်အလက် ရှာဖွေတွေ့ရှိပါသည်: [${found.name || found.email}]`, type: "success" });
    } else {
      setInspectedUidUser(null);
      setUidFeedbackMessage({ text: `UID သို့မဟုတ် Email "${q}" ဖြင့် ကျောင်းသား ရှာမတွေ့ပါ။`, type: "error" });
    }
    setIsSearchingUid(false);
  };

  const handleCopyUid = (uidText: string) => {
    if (!uidText) return;
    navigator.clipboard.writeText(uidText);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleDirectGrantPremiumFromUid = async (plan: "monthly" | "six_months" | "lifetime") => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("MANAGE_PREMIUM")) {
      alert("Role Permission Denied: Premium စီမံခန့်ခွဲခွင့် မရှိပါ။ (Super Admin သို့မဟုတ် Finance Admin သာ လုပ်ဆောင်နိုင်သည်)");
      return;
    }
    try {
      await adminActivateUserPremium(inspectedUidUser.uid, plan);
      const updatedExpiry = new Date();
      if (plan === "monthly") updatedExpiry.setMonth(updatedExpiry.getMonth() + 1);
      else if (plan === "six_months") updatedExpiry.setMonth(updatedExpiry.getMonth() + 6);
      else if (plan === "lifetime") updatedExpiry.setFullYear(updatedExpiry.getFullYear() + 99);

      const updatedUser: UserProfile = {
        ...inspectedUidUser,
        isPremium: true,
        premiumPlan: plan,
        premiumActivatedAt: new Date().toISOString(),
        premiumUntil: updatedExpiry.toISOString(),
        membershipStatus: "premium"
      };

      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `ကျောင်းသား [${inspectedUidUser.name}] အား Premium [${plan.toUpperCase()}] အောင်မြင်စွာ ဖွင့်ပေးလိုက်ပါပြီ!`, type: "success" });
      
      addPaymentAuditLog(
        "policy",
        inspectedUidUser.uid,
        "Direct Premium Grant",
        user.name || "Admin",
        user.uid || "admin",
        `Granted ${plan} premium to UID ${inspectedUidUser.uid}`
      );
    } catch (e) {
      setUidFeedbackMessage({ text: "Premium ဖွင့်ပေးခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectExtendPremiumFromUid = async (addDays: number) => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("MANAGE_PREMIUM")) {
      alert("Role Permission Denied: Premium စီမံခန့်ခွဲခွင့် မရှိပါ။");
      return;
    }
    try {
      await adminSimpleExtendUserPremium(inspectedUidUser.uid, addDays);
      let newDate = new Date();
      if (inspectedUidUser.premiumUntil && new Date(inspectedUidUser.premiumUntil) > new Date()) {
        newDate = new Date(inspectedUidUser.premiumUntil);
      }
      newDate.setDate(newDate.getDate() + addDays);

      const updatedUser: UserProfile = {
        ...inspectedUidUser,
        isPremium: true,
        premiumUntil: newDate.toISOString(),
        membershipStatus: "premium"
      };

      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `Premium သက်တမ်း +${addDays} ရက် အောင်မြင်စွာ တိုးမြှင့်လိုက်ပါပြီ!`, type: "success" });
      
      addPaymentAuditLog(
        "policy",
        inspectedUidUser.uid,
        "Extend Premium",
        user.name || "Admin",
        user.uid || "admin",
        `Extended premium by ${addDays} days for UID ${inspectedUidUser.uid}`
      );
    } catch (e) {
      setUidFeedbackMessage({ text: "သက်တမ်းတိုးခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectCancelPremiumFromUid = async () => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("MANAGE_PREMIUM")) {
      alert("Role Permission Denied: Premium စီမံခန့်ခွဲခွင့် မရှိပါ။");
      return;
    }
    if (!confirm(`ကျောင်းသား [${inspectedUidUser.name}] ၏ Premium အဆင့်အတန်းအား ပယ်ဖျက်ရန် သေချာပါသလား?`)) return;

    try {
      await adminDeactivateUserPremium(inspectedUidUser.uid);
      const updatedUser: UserProfile = {
        ...inspectedUidUser,
        isPremium: false,
        membershipStatus: "free",
        premiumUntil: new Date().toISOString()
      };

      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `ကျောင်းသား၏ Premium အဆင့်အတန်းအား ပယ်ဖျက်လိုက်ပါပြီ (Free Account သို့ ပြောင်းလဲပြီး)`, type: "info" });

      addPaymentAuditLog(
        "policy",
        inspectedUidUser.uid,
        "Revoke Premium",
        user.name || "Admin",
        user.uid || "admin",
        `Revoked premium for UID ${inspectedUidUser.uid}`
      );
    } catch (e) {
      setUidFeedbackMessage({ text: "ပယ်ဖျက်ခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectApproveTelegramVip = async () => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("VERIFY_PAYMENTS") && !hasPermission("MANAGE_PREMIUM")) {
      alert("Role Permission Denied: Telegram VIP ခွင့်ပြုခွင့် မရှိပါ။");
      return;
    }

    try {
      const updates = {
        telegramVerified: true,
        telegramAccessStatus: "approved",
        telegramApprovedAt: new Date().toISOString(),
        telegramApprovedBy: user.name || "Admin"
      };

      await adminUpdateUserProfile(inspectedUidUser.uid, updates);
      const updatedUser = { ...inspectedUidUser, ...updates };
      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `ကျောင်းသား [${inspectedUidUser.name}] အား Telegram VIP Channel Access အောင်မြင်စွာ ခွင့်ပြုလိုက်ပါပြီ!`, type: "success" });

      addPaymentAuditLog(
        "policy",
        inspectedUidUser.uid,
        "Telegram VIP Approved",
        user.name || "Admin",
        user.uid || "admin",
        `Approved Telegram VIP channel access for UID ${inspectedUidUser.uid}`
      );
    } catch (e) {
      setUidFeedbackMessage({ text: "Telegram VIP အတည်ပြုခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectToggleAccountSuspension = async () => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("DELETE_USERS") && !hasPermission("EDIT_USERS")) {
      alert("Role Permission Denied: အကောင့် ဆိုင်းငံ့/ပိတ်ပင်ခွင့် မရှိပါ။");
      return;
    }

    const isCurrentlySuspended = inspectedUidUser.accountStatus === "suspended";
    const newStatus = isCurrentlySuspended ? "active" : "suspended";

    if (!confirm(`ကျောင်းသား [${inspectedUidUser.name}] ၏ အကောင့်ကို ${isCurrentlySuspended ? "ပြန်လည်ဖွင့်ပေးမည်" : "ဆိုင်းငံ့ (Suspend) ထားမည်"} သေချာပါသလား?`)) return;

    try {
      if (isCurrentlySuspended) {
        await adminRestoreUser(inspectedUidUser.uid, user.name || "Admin", user.uid || "admin");
      } else {
        await adminSuspendUser(inspectedUidUser.uid, "Admin Panel Direct Action", 30, user.name || "Admin", user.uid || "admin");
      }

      const updatedUser: UserProfile = {
        ...inspectedUidUser,
        accountStatus: newStatus
      };

      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `အကောင့် status ကို [${newStatus.toUpperCase()}] သို့ ပြောင်းလဲလိုက်ပါပြီ!`, type: "success" });
    } catch (e) {
      setUidFeedbackMessage({ text: "လုပ်ဆောင်ချက် မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectGrantBonusFromUid = async () => {
    if (!inspectedUidUser?.uid) return;
    if (!hasPermission("EDIT_USERS")) {
      alert("Role Permission Denied: ကျောင်းသားအချက်အလက် ပြင်ဆင်ခွင့် မရှိပါ။");
      return;
    }

    try {
      const newXp = (inspectedUidUser.xp || 0) + customBonusXp;
      const newCoins = (inspectedUidUser.coins || 0) + customBonusCoins;

      await adminUpdateUserProfile(inspectedUidUser.uid, { xp: newXp, coins: newCoins });
      const updatedUser: UserProfile = { ...inspectedUidUser, xp: newXp, coins: newCoins };
      
      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setUidFeedbackMessage({ text: `XP +${customBonusXp} နှင့် Coins +${customBonusCoins} အား [${inspectedUidUser.name}] သို့ အောင်မြင်စွာ ပေးအပ်လိုက်ပါပြီ!`, type: "success" });
      
      addPaymentAuditLog(
        "policy",
        inspectedUidUser.uid,
        "Reward Grant",
        user.name || "Admin",
        user.uid || "admin",
        `Granted ${customBonusXp} XP and ${customBonusCoins} Coins to UID ${inspectedUidUser.uid}`
      );
    } catch (e) {
      setUidFeedbackMessage({ text: "ဆုပေးအပ်ခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  const handleDirectAddNoteFromUid = async () => {
    if (!inspectedUidUser?.uid || !customAdminNote.trim()) return;
    if (!hasPermission("EDIT_USERS")) {
      alert("Role Permission Denied: မှတ်ချက်ထည့်သွင်းခွင့် မရှိပါ။");
      return;
    }

    try {
      const updatedNotes = await adminAddInternalNote(
        inspectedUidUser.uid,
        inspectedUidUser.adminNotesList,
        customAdminNote.trim(),
        user.name || "Admin",
        user.uid || "admin"
      );

      const updatedUser: UserProfile = {
        ...inspectedUidUser,
        adminNotesList: updatedNotes
      };

      setInspectedUidUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.uid === inspectedUidUser.uid ? updatedUser : u));
      setCustomAdminNote("");
      setUidFeedbackMessage({ text: "အက်ဒမင် အတွင်းပိုင်း မှတ်ချက် အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!", type: "success" });
    } catch (e) {
      setUidFeedbackMessage({ text: "မှတ်ချက်ရေးသွင်းခြင်း မအောင်မြင်ပါ။", type: "error" });
    }
  };

  // Add Course Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newCourseObj: Course = {
      id: "course_" + Date.now(),
      title: newCourseTitle.trim(),
      slug: newCourseTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: newCourseDesc.trim() || "Code Learn Myanmar သင်ရိုးညွှန်းတမ်း သစ်",
      category: newCourseCategory,
      lessonCount: 0,
      difficulty: newCourseDiff,
      estimatedTime: "5 hours",
      lessons: [],
      projectCount: 1,
      prerequisites: ["ပရိုဂရမ်မင်း အခြေခံ စိတ်ပါဝင်စားမှု"],
      learningOutcomes: ["အခြေခံသဘောတရားများ ကျွမ်းကျင်စွာ နားလည်စေခြင်း"],
      certificateAvailable: true,
      introduction: "မင်္ဂလာပါ! ဤသင်ရိုးမှ ကြိုဆိုပါသည်။",
      roadmap: [{ step: "Step 1", title: "အခြေခံသင်ခန်းစာများ", description: "အခြေခံမှ စတင်လေ့လာမည်" }],
      quizzesCount: 0,
      assignmentsCount: 0,
      finalProject: {
        title: "Course Final Project",
        description: "သင်ရိုးအပြီး လက်တွေ့ပရောဂျက်",
        guide: ["အဆင့် ၁ - စတင်ပြုလုပ်ပါ"],
        startingCode: "// Code here",
        solutionCode: "// Solution"
      },
      courseSummary: "သင်ရိုးအနှစ်ချုပ်"
    };

    setAllCourses(prev => [newCourseObj, ...prev]);
    setIsAddCourseOpen(false);
    setNewCourseTitle("");
    setNewCourseDesc("");
    alert("သင်ရိုးသစ် [ " + newCourseObj.title + " ] အား အောင်မြင်စွာ ဖန်တီးလိုက်ပါပြီ!");

    addPaymentAuditLog(
      "policy",
      newCourseObj.id,
      "Course Created",
      user.name || "Admin",
      user.uid || "admin",
      `Created course: ${newCourseObj.title}`
    );
  };

  // Create Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("ကျေးဇူးပြု၍ ခေါင်းစဉ်နှင့် အကြောင်းအရာ ပြည့်စုံစွာ ဖြည့်စွက်ပါ");
      return;
    }

    const newAnn: AnnouncementItem = {
      id: "ann_" + Date.now(),
      title: annTitle.trim(),
      titleMm: annTitleMm.trim() || annTitle.trim(),
      content: annContent.trim(),
      contentMm: annContent.trim(),
      type: annType,
      targetAudience: annAudience,
      createdAt: new Date().toISOString(),
      author: user.name || "Admin",
      isPublished: true,
      isPinned: annPinned
    };

    try {
      await saveAnnouncementToDb(newAnn);
      setAnnouncements(prev => [newAnn, ...prev]);
      setIsAddAnnounceOpen(false);
      setAnnTitle("");
      setAnnTitleMm("");
      setAnnContent("");
      alert("အသိပေးကြေညာချက်အား စနစ်တစ်ခုလုံးသို့ အောင်မြင်စွာ ထုတ်လွှင့်လိုက်ပါပြီ!");

      addPaymentAuditLog(
        "policy",
        newAnn.id,
        "Broadcast Announcement",
        user.name || "Admin",
        user.uid || "admin",
        `Broadcasted announcement: ${newAnn.title}`
      );
    } catch (e) {
      alert("ကြေညာချက် ထုတ်လွှင့်မှု မအောင်မြင်ပါ။");
    }
  };

  const handleDeleteAnnounce = async (id: string) => {
    if (!confirm("ဤကြေညာချက်အား အပြီးဖျက်ဆီးရန် သေချာပါသလား?")) return;
    try {
      await deleteAnnouncementFromDb(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Statistics Computations
  const stats = useMemo(() => {
    const totalUsersCount = allUsers.length || 1;
    const premiumUsersCount = allUsers.filter(u => u.isPremium).length;
    const freeUsersCount = totalUsersCount - premiumUsersCount;
    const pendingPaymentsCount = allPaymentRequests.filter(p => p.status === "pending").length;
    const approvedPaymentsCount = allPaymentRequests.filter(p => p.status === "approved").length;
    const pendingRefundsCount = allRefunds.filter(r => r.status === "requested" || r.status === "under_review").length;
    const pendingDisputesCount = allDisputes.filter(d => d.status === "open" || d.status === "in_progress").length;
    
    let totalLessonsCount = 0;
    allCourses.forEach(c => { totalLessonsCount += (c.lessons?.length || 0); });

    return {
      totalUsers: totalUsersCount,
      activeUsers: Math.round(totalUsersCount * 0.85),
      premiumUsers: premiumUsersCount,
      freeUsers: freeUsersCount,
      pendingPayments: pendingPaymentsCount,
      approvedPayments: approvedPaymentsCount,
      pendingSupport: pendingRefundsCount + pendingDisputesCount,
      publishedCourses: allCourses.length,
      publishedLessons: totalLessonsCount,
      completedLessons: 1280,
      completedProjects: 420,
      communityReports: 3
    };
  }, [allUsers, allPaymentRequests, allRefunds, allDisputes, allCourses]);

  // User Filtered List
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch = (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
      if (userRoleFilter === "all") return matchSearch;
      if (userRoleFilter === "premium") return matchSearch && u.isPremium;
      if (userRoleFilter === "admin") return matchSearch && (u.role === "admin" || u.role === "super_admin");
      if (userRoleFilter === "student") return matchSearch && (!u.role || u.role === "student");
      return matchSearch;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  // UN-AUTHORIZED GUARD SCREEN
  if (!isAdminAuthorized) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-950/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 animate-pulse" />
          
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400">
            <Lock className="w-10 h-10 animate-bounce" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            Admin Security Access Required
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            စနစ်အုပ်ချုပ်သူ (Admin) သီးသန့် ဝင်ရောက်မှု နယ်မြေဖြစ်ပါသည်။ သာမန်ကျောင်းသား အကောင့်များ ဝင်ရောက်ခွင့် မရှိပါ။
          </p>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
              Authorized Admin Accounts:
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              {INITIAL_ADMIN_EMAILS.map((email, idx) => (
                <div key={idx} className="flex items-center text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-500 shrink-0" />
                  <span>{email}</span>
                </div>
              ))}
            </div>
          </div>

          {!firebaseUser ? (
            <button
              onClick={() => signInWithGoogle()}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Admin Account ဖြင့် Login ဝင်မည်</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                လတ်တလော ဝင်ရောက်ထားသော အကောင့် ({user.email}) သည် Admin ပိုင်ခွင့်မရှိပါ ခင်ဗျာ။
              </div>
              <button
                onClick={() => auth.signOut()}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-700"
              >
                အကောင့်ပြောင်းလဲ ဝင်ရောက်မည် (Switch Account)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* MOBILE NAV HEADER */}
      <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 dark:text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-slate-100">Code Learn Admin</h1>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon-only" />
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ADMIN SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-300
        ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* SIDEBAR HEADER */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">CLM Admin</h2>
              <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono rounded-full">
                Super Control Panel
              </span>
            </div>
          </div>
        </div>

        {/* ADMIN ACCOUNT CARD WITH ROLE-BASED BADGE */}
        <div className="p-4 mx-3 my-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/30 to-orange-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {user.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                <span>{user.name || "Administrator"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Active Admin Session" />
              </p>
              <p className="text-[10px] text-amber-400/90 font-mono truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400 font-mono">RBAC ROLE:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>{currentAdminRole.replace("_", " ")}</span>
            </span>
          </div>
        </div>

        {/* SIDEBAR MENU MODULES */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Centralized Management (13 Core Features)
          </p>

          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
            { id: "users", label: "User Management", icon: Users, badge: stats.totalUsers },
            { id: "uid_search", label: "UID Search", icon: Search, badge: "Lookup" },
            { id: "premium", label: "Premium Management", icon: Crown, badge: stats.premiumUsers },
            { id: "payments", label: "Payment Verification", icon: CreditCard, badge: stats.pendingPayments },
            { id: "courses", label: "Course Management", icon: BookOpen, badge: stats.publishedCourses },
            { id: "lessons", label: "Lesson Management", icon: FileCode, badge: stats.publishedLessons },
            { id: "quizzes", label: "Quiz Management", icon: HelpCircle, badge: null },
            { id: "kibo_ai", label: "Kibo Management", icon: Bot, badge: "AI" },
            { id: "telegram", label: "Telegram Access Verification", icon: Send, badge: "VIP" },
            { id: "notifications", label: "Notifications", icon: Megaphone, badge: announcements.length },
            { id: "reports", label: "Reports", icon: ShieldAlert, badge: stats.pendingSupport },
            { id: "security", label: "Security Logs", icon: ShieldCheck, badge: "RBAC" },
            { id: "assignments", label: "Assignments & Submissions", icon: ClipboardList, badge: null },
            { id: "projects", label: "Student Projects", icon: FolderGit2, badge: null },
            { id: "community", label: "Community Forum", icon: MessageSquare, badge: null },
            { id: "analytics", label: "Platform Analytics", icon: BarChart3, badge: null },
            { id: "settings", label: "System Settings", icon: Settings, badge: null },
            { id: "qa_testing", label: "Production QA & Testing", icon: FileCheck2, badge: "85 Tests" },
            { id: "performance", label: "Performance Telemetry", icon: Activity, badge: "⚡ LIVE" },
            { id: "monitoring", label: "Security Radar & Testing", icon: ShieldAlert, badge: "Radar" },
            { id: "backup", label: "Backup & Disaster Recovery", icon: Database, badge: "Safe" }
          ].map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setIsMobileNavOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer
                  ${isActive 
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-sm font-bold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"}
                `}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`
                    px-2 py-0.5 text-[10px] font-mono rounded-full ml-2 shrink-0
                    ${isActive ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400 border border-slate-700"}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* LOG OUT BUTTON IN MENU */}
          <div className="pt-2 border-t border-slate-800/60 mt-2">
            <button
              id="btn-admin-logout-menu"
              onClick={async () => {
                if (confirm("Admin Panel မှ ထွက်ခွာရန် သေချာပါသလား?")) {
                  try {
                    await auth.signOut();
                    if (onNavigateTab) onNavigateTab("home");
                  } catch (e) {
                    console.error("Logout error:", e);
                  }
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <LogOut className="w-4 h-4 shrink-0 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="truncate font-semibold">Log Out (အကောင့်ထွက်မည်)</span>
              </div>
            </button>
          </div>
        </nav>

        {/* SIDEBAR FOOTER WITH THEME SWITCHER */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-slate-500">THEME</span>
            <ThemeToggle variant="compact" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <span>Version 3.5.0-PROD</span>
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px]">LIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* WELCOME BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator Control Center</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
                    မင်္ဂလာပါ၊ Admin {user.name}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Code Learn Myanmar ပလက်ဖောင်း၏ စနစ်လည်ပတ်မှု ကိန်းဂဏန်းများ၊ ငွေလွှဲအတည်ပြုမှုများနှင့် ကျောင်းသားစီမံခန့်ခွဲမှုအား တစ်နေရာတည်းမှ ထိန်းချုပ်နိုင်ပါသည်။
                  </p>
                </div>
                <button
                  onClick={handleCheckSystemHealth}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>System Diagnostics Run</span>
                </button>
              </div>
            </div>

            {/* 12 METRICS CARDS GRID */}
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Platform Metrics Overview (စနစ်အနှစ်ချုပ်)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[
                  { title: "Total Users", val: stats.totalUsers, label: "စုစုပေါင်း အကောင့်", color: "from-blue-500/20 to-indigo-500/5", border: "border-blue-500/30", text: "text-blue-400" },
                  { title: "Active Users", val: stats.activeUsers, label: "တက်ကြွစွာ လေ့လာသူ", color: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/30", text: "text-emerald-400" },
                  { title: "Premium Users", val: stats.premiumUsers, label: "Premium အသင်းဝင်", color: "from-amber-500/20 to-orange-500/5", border: "border-amber-500/30", text: "text-amber-400" },
                  { title: "Free Users", val: stats.freeUsers, label: "အခမဲ့ အကောင့်များ", color: "from-slate-800 to-slate-900", border: "border-slate-800", text: "text-slate-300" },
                  { title: "Pending Payments", val: stats.pendingPayments, label: "စစ်ဆေးရန် ငွေလွှဲများ", color: "from-purple-500/20 to-pink-500/5", border: "border-purple-500/30", text: "text-purple-400" },
                  { title: "Approved Payments", val: stats.approvedPayments, label: "အတည်ပြုပြီး ငွေလွှဲများ", color: "from-teal-500/20 to-emerald-500/5", border: "border-teal-500/30", text: "text-teal-400" },
                  { title: "Pending Support", val: stats.pendingSupport, label: "တိုင်ကြားချက် / Refund", color: "from-red-500/20 to-orange-500/5", border: "border-red-500/30", text: "text-red-400" },
                  { title: "Published Courses", val: stats.publishedCourses, label: "ထုတ်ဝေထားသော သင်ရိုး", color: "from-cyan-500/20 to-blue-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
                  { title: "Published Lessons", val: stats.publishedLessons, label: "သင်ခန်းစာ ပေါင်း", color: "from-indigo-500/20 to-purple-500/5", border: "border-indigo-500/30", text: "text-indigo-400" },
                  { title: "Completed Lessons", val: stats.completedLessons, label: "ပြီးမြောက်မှု ပေါင်း", color: "from-emerald-500/20 to-green-500/5", border: "border-emerald-500/30", text: "text-emerald-400" },
                  { title: "Completed Projects", val: stats.completedProjects, label: "ပြီးမြောက် ပရောဂျက်", color: "from-orange-500/20 to-amber-500/5", border: "border-orange-500/30", text: "text-orange-400" },
                  { title: "Community Reports", val: stats.communityReports, label: "ဖိုရမ် တိုင်ကြားချက်", color: "from-pink-500/20 to-rose-500/5", border: "border-pink-500/30", text: "text-pink-400" }
                ].map((m, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} border ${m.border} flex flex-col justify-between h-32`}>
                    <p className="text-[11px] font-medium text-slate-400 truncate">{m.title}</p>
                    <div>
                      <p className={`text-2xl font-bold font-mono ${m.text}`}>{m.val}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS SHORTCUTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Quick Admin Shortcuts (မြန်ဆန် လုပ်ဆောင်ချက်များ)</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { name: "Add Course", icon: Plus, action: () => setIsAddCourseOpen(true), color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                  { name: "Add Lesson", icon: FileCode, action: () => setIsAddLessonOpen(true), color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
                  { name: "Review Payment", icon: CreditCard, action: () => setActiveTab("payments"), color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
                  { name: "Manage Users", icon: Users, action: () => setActiveTab("users"), color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
                  { name: "Announcement", icon: Megaphone, action: () => setIsAddAnnounceOpen(true), color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
                  { name: "Review Reports", icon: ShieldAlert, action: () => setActiveTab("reports"), color: "bg-red-500/10 text-red-400 border-red-500/30" },
                  { name: "Manage Premium", icon: Crown, action: () => setActiveTab("premium"), color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
                  { name: "View Analytics", icon: BarChart3, action: () => setActiveTab("analytics"), color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" }
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={act.action}
                      className={`p-3 rounded-xl border ${act.color} hover:brightness-125 transition-all flex flex-col items-center justify-center text-center space-y-2 group`}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold line-clamp-1">{act.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYSTEM STATUS & RECENT ACTIVITY DUAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SYSTEM STATUS MONITOR */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>System Status Monitor</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Checked {sysStatus.lastChecked}</span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Database (Firestore)", status: sysStatus.database, icon: Database },
                    { name: "Auth (Firebase Session)", status: sysStatus.auth, icon: Key },
                    { name: "Storage Engine", status: sysStatus.storage, icon: HardDrive },
                    { name: "AI Engine (Gemini API)", status: sysStatus.ai, icon: Cpu },
                    { name: "Cloud Run Container App", status: sysStatus.app, icon: Server }
                  ].map((sys, idx) => {
                    const SysIcon = sys.icon;
                    return (
                      <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <SysIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-300">{sys.name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-mono text-emerald-400 uppercase">HEALTHY</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT ADMINISTRATIVE ACTIVITY LOG */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Recent Activity Stream (လတ်တလော စနစ်လှုပ်ရှားမှုများ)</span>
                  </h3>
                  <button onClick={() => setActiveTab("security")} className="text-xs text-amber-400 hover:underline">
                    View All Logs
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {allAuditLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">Audit log မှတ်တမ်းမရှိသေးပါ</p>
                  ) : (
                    allAuditLogs.slice(0, 6).map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="p-2 bg-slate-800 rounded-lg text-amber-400 shrink-0">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{log.action}</p>
                            <p className="text-[11px] text-slate-400 truncate">{log.details}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[10px] text-amber-400/90 font-medium">
                            by {log.performedBy || "Admin"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <UserManagementModule
            allUsers={allUsers}
            allPaymentRequests={allPaymentRequests}
            allAuditLogs={allAuditLogs}
            adminUser={user}
            firebaseUser={firebaseUser}
            onRefreshData={handleRefreshAllAdminData}
            onOpenAnnouncementModal={(targetEmails) => {
              setIsAddAnnounceOpen(true);
              if (targetEmails && targetEmails.length > 0) {
                setAnnTitle(`Direct Notice (${targetEmails.length} students)`);
              }
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: UID SEARCH & DIRECT STUDENT INSPECTION STATION */}
        {/* ========================================================================= */}
        {activeTab === "uid_search" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Search className="w-4 h-4" />
                    <span>UID Search & Diagnostic Station</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100">
                    ကျောင်းသား UID / Email ဖြင့် တိုက်ရိုက်စစ်ဆေးခြင်း
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ကျောင်းသား၏ Unique ID (UID) သို့မဟုတ် Email ဖြင့် အချိန်နှင့်တစ်ပြေးညီ ရှာဖွေပြီး Premium ဖွင့်ပေးခြင်း၊ သက်တမ်းတိုးခြင်း၊ Telegram VIP ခွင့်ပြုခြင်းနှင့် အကောင့်ထိန်းချုပ်မှုများ ပြုလုပ်နိုင်ပါသည်။
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-300">
                    Total In DB: <strong className="text-amber-400">{allUsers.length}</strong>
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={uidSearchQuery}
                    onChange={(e) => setUidSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePerformUidSearch(); }}
                    placeholder="Enter Student UID (e.g. usr_1719... or Firebase UID) or Email..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  {uidSearchQuery && (
                    <button 
                      onClick={() => { setUidSearchQuery(""); setInspectedUidUser(null); setUidFeedbackMessage(null); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handlePerformUidSearch()}
                  disabled={isSearchingUid}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Search UID</span>
                </button>
              </div>

              {/* Feedback banner */}
              {uidFeedbackMessage && (
                <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                  uidFeedbackMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                  uidFeedbackMessage.type === "error" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" :
                  "bg-sky-500/10 border-sky-500/30 text-sky-300"
                }`}>
                  <div className="flex items-center space-x-2">
                    {uidFeedbackMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> :
                     uidFeedbackMessage.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> :
                     <Shield className="w-4 h-4 shrink-0 text-sky-400" />}
                    <span>{uidFeedbackMessage.text}</span>
                  </div>
                  <button onClick={() => setUidFeedbackMessage(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick Suggestions / Recent registered students */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-medium mb-2">Quick Lookup (လတ်တလော စာရင်းသွင်းထားသူများ):</p>
                <div className="flex flex-wrap gap-2">
                  {allUsers.slice(0, 6).map((u, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUidSearchQuery(u.uid);
                        handlePerformUidSearch(u.uid);
                      }}
                      className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg text-[11px] font-mono text-slate-300 hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isPremium ? "bg-amber-400" : "bg-slate-500"}`} />
                      <span>{u.name || u.email.split("@")[0]}</span>
                      <span className="text-[9px] text-slate-500">({u.uid.slice(0, 8)}...)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspected User Profile Diagnostic Card */}
            {inspectedUidUser ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                      {inspectedUidUser.name ? inspectedUidUser.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-slate-100">{inspectedUidUser.name || "Student Name"}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inspectedUidUser.isPremium 
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950" 
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {inspectedUidUser.isPremium ? "👑 VIP PREMIUM" : "⚡ FREE STUDENT"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          inspectedUidUser.accountStatus === "suspended"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {inspectedUidUser.accountStatus === "suspended" ? "SUSPENDED" : "ACTIVE"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{inspectedUidUser.email}</p>
                    </div>
                  </div>

                  {/* Copy UID Button */}
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-mono text-amber-400 font-bold px-2 select-all truncate max-w-[200px] sm:max-w-xs">
                      {inspectedUidUser.uid}
                    </span>
                    <button
                      onClick={() => handleCopyUid(inspectedUidUser.uid)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3 text-amber-400" />
                      <span>{copiedUid ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metadata Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Telegram VIP Status</span>
                    <p className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      <span>{inspectedUidUser.telegramVerified ? "Verified ✓" : "Not Verified"}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Handle: <strong className="text-sky-400">@{inspectedUidUser.telegramUsername || "None"}</strong>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Subscription Expiry</span>
                    <p className="font-bold text-sm text-amber-400 font-mono">
                      {inspectedUidUser.premiumUntil ? new Date(inspectedUidUser.premiumUntil).toLocaleDateString() : inspectedUidUser.isPremium ? "Lifetime / Valid" : "N/A (Free)"}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Plan: <strong className="text-slate-300">{inspectedUidUser.premiumPlan || "Free Tier"}</strong>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Gamification XP & Level</span>
                    <p className="font-bold text-sm text-emerald-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{inspectedUidUser.xp || 0} XP (Lv. {inspectedUidUser.level || 1})</span>
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Coins: <strong className="text-amber-400">{inspectedUidUser.coins || 0} CLM</strong>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Learning Progress</span>
                    <p className="font-bold text-sm text-indigo-400 font-mono">
                      {inspectedUidUser.completedLessons?.length || 0} Lessons Completed
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Streak: <strong className="text-orange-400">{inspectedUidUser.streak || inspectedUidUser.learningStreak || 0} Days 🔥</strong>
                    </span>
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Direct Administrative Actions for this UID</span>
                  </h4>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Grant / Change Premium */}
                    <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Grant Premium Plan</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleDirectGrantPremiumFromUid("monthly")}
                          className="px-2 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          1 Month
                        </button>
                        <button
                          onClick={() => handleDirectGrantPremiumFromUid("six_months")}
                          className="px-2 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          6 Months
                        </button>
                        <button
                          onClick={() => handleDirectGrantPremiumFromUid("lifetime")}
                          className="px-2 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-md"
                        >
                          Lifetime
                        </button>
                      </div>
                    </div>

                    {/* Extend & Revoke */}
                    <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Extend or Revoke Access</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDirectExtendPremiumFromUid(30)}
                          className="flex-1 px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          +30 Days
                        </button>
                        <button
                          onClick={() => handleDirectExtendPremiumFromUid(90)}
                          className="flex-1 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          +90 Days
                        </button>
                        <button
                          onClick={() => handleDirectCancelPremiumFromUid()}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>

                    {/* Telegram VIP & Account Status */}
                    <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Security & Channel Access</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDirectApproveTelegramVip()}
                          className="flex-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Approve VIP</span>
                        </button>
                        <button
                          onClick={() => handleDirectToggleAccountSuspension()}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                            inspectedUidUser.accountStatus === "suspended"
                              ? "bg-emerald-600 text-white hover:bg-emerald-500"
                              : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{inspectedUidUser.accountStatus === "suspended" ? "Restore" : "Suspend"}</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Bonus Reward & Note Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Grant Bonus XP & Coins */}
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reward Bonus XP & Coins</span>
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={customBonusXp}
                          onChange={(e) => setCustomBonusXp(Number(e.target.value))}
                          placeholder="XP"
                          className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                        />
                        <input
                          type="number"
                          value={customBonusCoins}
                          onChange={(e) => setCustomBonusCoins(Number(e.target.value))}
                          placeholder="Coins"
                          className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                        />
                        <button
                          onClick={() => handleDirectGrantBonusFromUid()}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                        >
                          Give Reward
                        </button>
                      </div>
                    </div>

                    {/* Admin Internal Note */}
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-sky-400" />
                        <span>Add Admin Internal Audit Note</span>
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customAdminNote}
                          onChange={(e) => setCustomAdminNote(e.target.value)}
                          placeholder="Note (e.g. KBZPay Slip confirmed over Telegram)..."
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100"
                        />
                        <button
                          onClick={() => handleDirectAddNoteFromUid()}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
                <Search className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">ရှာဖွေရန် Student UID သို့မဟုတ် Email ရိုက်ထည့်ပါ</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  အပေါ်ရှိ Search Bar တွင် ကျောင်းသား၏ UID (User ID) သို့မဟုတ် Gmail လိပ်စာ ရိုက်ထည့်၍ Search ပြုလုပ်နိုင်ပါသည်။
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TELEGRAM ACCESS VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === "telegram" && (
          <div className="space-y-6 animate-fade-in">
            <TelegramVerificationAdminTab
              adminUser={user}
              allUsers={allUsers}
              onRefreshAllUsers={handleRefreshAllAdminData}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDUCATIONAL CONTENT MANAGEMENT SYSTEM (COURSES, ROADMAPS, MODULES, LESSONS) */}
        {/* ========================================================================= */}
        {["courses", "lessons"].includes(activeTab) && (
          <ContentManagementModule
            courses={allCourses}
            adminUser={user}
            onRefreshData={handleRefreshAllAdminData}
          />
        )}

        {/* ========================================================================= */}
        {/* ASSESSMENT & EVALUATION SYSTEM (QUIZZES, ASSIGNMENTS, CODING PROJECTS, SUBMISSIONS, RUBRICS) */}
        {/* ========================================================================= */}
        {["quizzes", "assignments", "projects"].includes(activeTab) && (
          <AssessmentManagementModule
            courses={allCourses}
            adminUser={user}
            initialSubTab={activeTab as any}
            onRefreshData={handleRefreshAllAdminData}
          />
        )}

        {/* ========================================================================= */}
        {/* PREMIUM & PAYMENT MANAGEMENT MODULE (PLANS, VERIFICATION, MEMBERSHIPS, REFUNDS, AUDIT) */}
        {/* ========================================================================= */}
        {["premium", "payments"].includes(activeTab) && (
          <PremiumAndPaymentManagementModule
            adminUser={user}
            allUsers={allUsers}
            onRefreshAllUsers={handleRefreshAllAdminData}
            initialTab={activeTab === "premium" ? "memberships" : "verification"}
          />
        )}

        {/* ========================================================================= */}
        {/* PLATFORM ANALYTICS & DETAILED STATISTICS MODULE */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <AdminPlatformAnalyticsModule
            users={allUsers}
            courses={allCourses}
            paymentRequests={allPaymentRequests}
            refundRequests={allRefunds}
            auditLogs={allAuditLogs}
            announcements={announcements}
            onRefreshParent={handleRefreshAllAdminData}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 10 & 11: COMMUNITY FORUM & REPORTS MODERATION */}
        {/* ========================================================================= */}
        {(activeTab === "community" || activeTab === "reports") && (
          <div className="space-y-6 animate-fade-in">
            <CommunityModerationModule
              currentUser={user}
              onNavigateTab={onNavigateTab}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 13: KIBO AI ASSISTANT CONFIG */}
        {/* ========================================================================= */}
        {activeTab === "kibo_ai" && (
          <div className="space-y-6 animate-fade-in">
            <KiboAIManagementModule
              user={user}
              firebaseUser={firebaseUser}
              onRefreshParent={handleRefreshAllAdminData}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 15: SYSTEM SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in">
            <SecurityManagementModule
              adminUser={user}
              firebaseUser={firebaseUser}
              onRefreshParent={handleRefreshAllAdminData}
              initialSubTab="settings"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: ANNOUNCEMENTS / NOTIFICATIONS */}
        {/* ========================================================================= */}
        {(activeTab === "announcements" || activeTab === "notifications") && (
          <div className="space-y-6 animate-fade-in">
            <AnnouncementManagementModule
              currentUser={user}
              onNavigateTab={onNavigateTab}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 16: SECURITY & AUDIT LOG */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            <SecurityManagementModule
              adminUser={user}
              firebaseUser={firebaseUser}
              onRefreshParent={handleRefreshAllAdminData}
              initialSubTab="rbac"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 16.5: CONTINUOUS PERFORMANCE MONITORING & TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === "performance" && (
          <div className="space-y-6 animate-fade-in">
            <ContinuousPerformanceMonitoringModule
              onRefreshParent={handleRefreshAllAdminData}
              initialSubTab="radar"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 16.8: ENTERPRISE SECURITY MONITORING & TESTING RADAR */}
        {/* ========================================================================= */}
        {activeTab === "monitoring" && (
          <div className="space-y-6 animate-fade-in">
            <EnterpriseSecurityMonitoringCenter
              adminUser={user}
              firebaseUser={firebaseUser}
              onRefreshParent={handleRefreshAllAdminData}
              initialTab="monitoring"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 17: BACKUP & DISASTER RECOVERY */}
        {/* ========================================================================= */}
        {activeTab === "backup" && (
          <div className="space-y-6 animate-fade-in">
            <BackupAndDisasterRecoveryModule
              adminUser={user}
              firebaseUser={firebaseUser}
              onRefreshParent={handleRefreshAllAdminData}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 18: PRODUCTION QA TESTING & SYSTEM VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === "qa_testing" && (
          <ProductionTestSuiteModal
            isOpen={true}
            onClose={() => setActiveTab("dashboard")}
            currentUser={user}
          />
        )}

      </main>
    </div>
  );
}
