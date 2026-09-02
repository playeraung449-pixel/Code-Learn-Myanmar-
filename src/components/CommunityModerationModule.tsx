/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Send,
  MessageSquare,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Trash2,
  Clock,
  Search,
  Filter,
  Plus,
  Edit3,
  Sparkles,
  History,
  Shield,
  UserX,
  UserCheck,
  AlertCircle,
  FolderTree,
  Bell,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
  FileText
} from "lucide-react";
import {
  UserProfile,
  AdminNotificationItem,
  AdminNotificationTrigger,
  TargetAudienceType,
  CommunityReport,
  CommunityCategoryItem,
  ModerationAuditLog,
  ForumPost,
  Comment
} from "../types";
import {
  getDetailedNotificationsFromDb,
  createAndSendNotificationInDb,
  cancelScheduledNotificationInDb,
  getAllForumPostsWithModerationFromDb,
  togglePostHideStatusInDb,
  togglePostPinStatusInDb,
  togglePostLockStatusInDb,
  deleteForumPostByAdmin,
  getDetailedCommunityReportsFromDb,
  updateCommunityReportStatusInDb,
  warnUserInCommunity,
  restrictUserInCommunity,
  getCommunityCategoriesFromDb,
  saveCommunityCategoryToDb,
  deleteCommunityCategoryFromDb,
  getModerationAuditLogsFromDb,
  adminRestrictCommunity
} from "../lib/db";

interface CommunityModerationModuleProps {
  currentUser: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
}

type SubTab = "notifications" | "reports" | "discussions" | "categories" | "audit";

export const CommunityModerationModule: React.FC<CommunityModerationModuleProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("notifications");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [newNotif, setNewNotif] = useState<Partial<AdminNotificationItem>>({
    title: "",
    titleMm: "",
    message: "",
    messageMm: "",
    category: "system",
    triggerType: "admin_broadcast",
    targetAudience: "all",
    actionTab: "dashboard",
    status: "sent"
  });

  // Moderation Reports State
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [reportFilter, setReportFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [adminReportNote, setAdminReportNote] = useState("");

  // Discussions State
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [postSearch, setPostSearch] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");

  // User Warning/Restriction Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [targetUserModal, setTargetUserModal] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    actionType: "warn" | "restrict";
    reason: string;
    durationDays: number;
  } | null>(null);

  // Categories State
  const [categories, setCategories] = useState<CommunityCategoryItem[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CommunityCategoryItem> | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<ModerationAuditLog[]>([]);

  const adminEmail = currentUser?.email || "admin@codelearnmm.com";
  const adminName = currentUser?.fullName || "Code Learn Myanmar Team";

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [notifsData, reportsData, postsData, catsData, logsData] = await Promise.all([
        getDetailedNotificationsFromDb(),
        getDetailedCommunityReportsFromDb(),
        getAllForumPostsWithModerationFromDb(),
        getCommunityCategoriesFromDb(),
        getModerationAuditLogsFromDb()
      ]);
      setNotifications(notifsData);
      setReports(reportsData);
      setPosts(postsData);
      setCategories(catsData);
      setAuditLogs(logsData);
    } catch (e) {
      console.error("Failed to load community data:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // Notification Actions
  // -------------------------------------------------------------
  const handleSendNotification = async () => {
    if (!newNotif.title?.trim() || !newNotif.message?.trim()) {
      showToast("Please provide both Notification Title and Message.");
      return;
    }

    try {
      await createAndSendNotificationInDb(
        {
          title: newNotif.title.trim(),
          titleMm: newNotif.titleMm?.trim(),
          message: newNotif.message.trim(),
          messageMm: newNotif.messageMm?.trim(),
          category: newNotif.category || "system",
          triggerType: newNotif.triggerType || "admin_broadcast",
          targetAudience: newNotif.targetAudience || "all",
          actionTab: newNotif.actionTab || "dashboard",
          status: newNotif.status || "sent"
        },
        adminEmail,
        adminName
      );

      await loadAllData();
      setIsNotifModalOpen(false);
      setNewNotif({
        title: "",
        titleMm: "",
        message: "",
        messageMm: "",
        category: "system",
        triggerType: "admin_broadcast",
        targetAudience: "all",
        actionTab: "dashboard",
        status: "sent"
      });
      showToast("Notification dispatched and broadcasted to students!");
    } catch (e) {
      console.error(e);
      showToast("Error sending notification.");
    }
  };

  const handleCancelNotification = async (id: string) => {
    try {
      await cancelScheduledNotificationInDb(id, adminEmail, adminName);
      await loadAllData();
      showToast("Scheduled notification cancelled.");
    } catch (e) {
      showToast("Failed to cancel notification.");
    }
  };

  // -------------------------------------------------------------
  // Report Moderation Actions
  // -------------------------------------------------------------
  const handleResolveReport = async (
    report: CommunityReport,
    actionTaken: "approved" | "hidden" | "removed" | "dismissed"
  ) => {
    try {
      const status = actionTaken === "dismissed" ? "dismissed" : "resolved";
      await updateCommunityReportStatusInDb(
        report.id,
        status,
        actionTaken,
        adminReportNote || `Handled by ${adminName}`,
        adminEmail,
        adminName
      );

      // If hidden or removed, apply to the target post
      if (actionTaken === "hidden" && report.postId) {
        await togglePostHideStatusInDb(report.postId, true, report.reason, adminEmail, adminName);
      } else if (actionTaken === "removed" && report.postId) {
        await deleteForumPostByAdmin(report.postId, report.reason, adminEmail, adminName);
      }

      await loadAllData();
      setSelectedReport(null);
      setAdminReportNote("");
      showToast(`Report ${status} (${actionTaken}) successfully.`);
    } catch (e) {
      showToast("Failed to update report status.");
    }
  };

  // -------------------------------------------------------------
  // Post Moderation Actions
  // -------------------------------------------------------------
  const handleToggleHidePost = async (postId: string, currentHidden: boolean) => {
    try {
      await togglePostHideStatusInDb(
        postId,
        !currentHidden,
        !currentHidden ? "Flagged for moderation by administrator" : "",
        adminEmail,
        adminName
      );
      await loadAllData();
      showToast(!currentHidden ? "Post hidden from community feed." : "Post restored to public.");
    } catch (e) {
      showToast("Failed to update post visibility.");
    }
  };

  const handleTogglePinPost = async (postId: string, currentPinned: boolean) => {
    try {
      await togglePostPinStatusInDb(postId, !currentPinned, adminEmail, adminName);
      await loadAllData();
      showToast(!currentPinned ? "Discussion pinned to top." : "Discussion unpinned.");
    } catch (e) {
      showToast("Failed to toggle pin.");
    }
  };

  const handleToggleLockPost = async (postId: string, currentLocked: boolean) => {
    try {
      await togglePostLockStatusInDb(postId, !currentLocked, adminEmail, adminName);
      await loadAllData();
      showToast(!currentLocked ? "Discussion replies locked." : "Discussion unlocked for replies.");
    } catch (e) {
      showToast("Failed to toggle lock.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await deleteForumPostByAdmin(postId, "Violation of platform guidelines", adminEmail, adminName);
      await loadAllData();
      showToast("Post removed permanently.");
    } catch (e) {
      showToast("Failed to delete post.");
    }
  };

  // -------------------------------------------------------------
  // User Moderation Actions (Warning & Restrictions)
  // -------------------------------------------------------------
  const handleConfirmUserAction = async () => {
    if (!targetUserModal) return;
    try {
      if (targetUserModal.actionType === "warn") {
        await warnUserInCommunity(
          targetUserModal.userId,
          targetUserModal.userEmail,
          targetUserModal.userName,
          targetUserModal.reason || "Violating community standards",
          adminEmail,
          adminName
        );
        showToast(`Official warning issued to ${targetUserModal.userName}.`);
      } else {
        await restrictUserInCommunity(
          targetUserModal.userId,
          targetUserModal.userEmail,
          targetUserModal.userName,
          targetUserModal.reason || "Repeated violations",
          targetUserModal.durationDays,
          adminEmail,
          adminName
        );
        showToast(`Posting privileges restricted for ${targetUserModal.userName} (${targetUserModal.durationDays} days).`);
      }
      await loadAllData();
      setUserModalOpen(false);
      setTargetUserModal(null);
    } catch (e) {
      showToast("Failed to apply moderation action.");
    }
  };

  // -------------------------------------------------------------
  // Category Management
  // -------------------------------------------------------------
  const handleSaveCategory = async () => {
    if (!editingCategory?.name?.trim()) {
      showToast("Category name is required.");
      return;
    }
    try {
      const payload: CommunityCategoryItem = {
        id: editingCategory.id || `cat_${Date.now()}`,
        name: editingCategory.name.trim(),
        nameMm: editingCategory.nameMm?.trim() || "",
        description: editingCategory.description?.trim() || "",
        icon: editingCategory.icon || "MessageSquare",
        postCount: editingCategory.postCount || 0,
        isEnabled: editingCategory.isEnabled ?? true,
        order: editingCategory.order || categories.length + 1
      };
      await saveCommunityCategoryToDb(payload, adminEmail, adminName);
      await loadAllData();
      setCategoryModalOpen(false);
      setEditingCategory(null);
      showToast("Category saved successfully.");
    } catch (e) {
      showToast("Failed to save category.");
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm("Are you sure you want to remove this category?")) return;
    try {
      await deleteCommunityCategoryFromDb(catId, adminEmail, adminName);
      await loadAllData();
      showToast("Category deleted.");
    } catch (e) {
      showToast("Failed to delete category.");
    }
  };

  // Filtered discussions
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        postSearch.trim() === "" ||
        p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.author.toLowerCase().includes(postSearch.toLowerCase());

      const matchCat =
        postCategoryFilter === "all" || p.category === postCategoryFilter;

      return matchSearch && matchCat;
    });
  }, [posts, postSearch, postCategoryFilter]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportFilter === "all") return true;
      return r.status === reportFilter;
    });
  }, [reports, reportFilter]);

  return (
    <div id="community_moderation_module" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 dark:from-purple-950 dark:via-indigo-950 dark:to-indigo-900 p-6 sm:p-8 rounded-2xl text-white shadow-sm border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide mb-3 border border-white/20">
              <Shield className="w-3.5 h-3.5" /> Community Safety & Communications
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Community & Student Communications
            </h2>
            <p className="text-purple-100 text-sm mt-1 max-w-2xl font-light">
              Send direct student notifications, moderate community discussions, address flagged reports, and safeguard learning environments.
            </p>
          </div>

          <button
            id="btn_open_broadcast_modal"
            onClick={() => setIsNotifModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-purple-50 font-semibold rounded-xl text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" /> Send Notification
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-purple-200 block">Total Notifications</span>
            <span className="text-xl font-bold">{notifications.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-purple-200 block">Pending Reports</span>
            <span className="text-xl font-bold text-amber-300">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-purple-200 block">Active Discussions</span>
            <span className="text-xl font-bold">{posts.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-purple-200 block">Moderation Logs</span>
            <span className="text-xl font-bold">{auditLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          id="subtab_notifications"
          onClick={() => setActiveSubTab("notifications")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === "notifications"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <Bell className="w-4 h-4" /> Student Notifications ({notifications.length})
        </button>

        <button
          id="subtab_reports"
          onClick={() => setActiveSubTab("reports")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all relative ${
            activeSubTab === "reports"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Reported Content
          {reports.filter((r) => r.status === "pending").length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
          )}
        </button>

        <button
          id="subtab_discussions"
          onClick={() => setActiveSubTab("discussions")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === "discussions"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Discussion Moderation ({posts.length})
        </button>

        <button
          id="subtab_categories"
          onClick={() => setActiveSubTab("categories")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === "categories"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <FolderTree className="w-4 h-4" /> Forum Categories ({categories.length})
        </button>

        <button
          id="subtab_audit"
          onClick={() => setActiveSubTab("audit")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === "audit"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <History className="w-4 h-4" /> Moderation Audit Trail
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT NOTIFICATIONS SUBTAB */}
      {/* ========================================================================= */}
      {activeSubTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Official Notification Dispatch Stream
              </h3>
              <p className="text-xs text-zinc-500">
                Send targeted announcements, course event alerts, and challenge incentives directly to students' inboxes.
              </p>
            </div>
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Dispatch Notification
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Target: <strong className="text-zinc-700 dark:text-zinc-300">{item.targetAudience}</strong>
                      </span>
                      <span className="text-xs text-zinc-400">
                        • {item.sentAt ? new Date(item.sentAt).toLocaleString() : "Scheduled"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h4>
                    {item.titleMm && (
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {item.titleMm}
                      </p>
                    )}

                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {item.message}
                    </p>
                    {item.messageMm && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {item.messageMm}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Recipients: <strong>{item.totalRecipients || 0}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Read: <strong>{item.readCount || 0}</strong>
                      </span>
                      {item.actionTab && (
                        <span className="text-indigo-600 dark:text-indigo-400">
                          Destination: {item.actionTab}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.status === "scheduled" && (
                    <button
                      onClick={() => handleCancelNotification(item.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                    >
                      Cancel Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPORTED CONTENT SUBTAB */}
      {/* ========================================================================= */}
      {activeSubTab === "reports" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Community Moderation Queue
              </h3>
              <p className="text-xs text-zinc-500">
                Review student-flagged spam, harassment, and policy violations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending Only</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Moderation Queue is Clean</h4>
              <p className="text-xs text-zinc-500 mt-1">
                There are no flagged posts or replies requiring administrative attention.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 transition-all ${
                    report.status === "pending"
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                          {report.reason}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          Type: {report.targetType}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Reported: {new Date(report.timestamp).toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          report.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : report.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-zinc-100 text-zinc-700"
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {report.contentTitle}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        Author: <strong className="text-zinc-800 dark:text-zinc-200">{report.contentAuthor}</strong>
                      </p>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono">
                        "{report.contentSnippet}"
                      </div>

                      {report.details && (
                        <p className="text-xs text-zinc-500">
                          Reporter Note: <em>{report.details}</em>
                        </p>
                      )}

                      {report.adminNotes && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          Admin Resolution: {report.adminNotes}
                        </p>
                      )}
                    </div>

                    {/* Moderation actions */}
                    {report.status === "pending" && (
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => handleResolveReport(report, "hidden")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                          title="Hide content from public view"
                        >
                          <EyeOff className="w-3.5 h-3.5" /> Hide Content
                        </button>

                        <button
                          onClick={() => handleResolveReport(report, "removed")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                          title="Permanently remove content"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Content
                        </button>

                        <button
                          onClick={() => {
                            setTargetUserModal({
                              userId: report.targetId || "unknown_user",
                              userName: report.contentAuthor,
                              userEmail: "student@codelearnmm.com",
                              actionType: "warn",
                              reason: `Flagged for: ${report.reason}`,
                              durationDays: 7
                            });
                            setUserModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" /> Issue Warning
                        </button>

                        <button
                          onClick={() => handleResolveReport(report, "dismissed")}
                          className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                        >
                          Dismiss (False Alarm)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISCUSSION MODERATION SUBTAB */}
      {/* ========================================================================= */}
      {activeSubTab === "discussions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search forum discussions by title, author, or keywords..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <select
              value={postCategoryFilter}
              onChange={(e) => setPostCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 transition-all ${
                  post.isHidden
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/10 dark:bg-amber-950/10 opacity-75"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {post.category}
                      </span>
                      {post.isPinned && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-current" /> Pinned
                        </span>
                      )}
                      {post.isLocked && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      {post.isHidden && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 text-zinc-800 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden from Students
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        By <strong>{post.author}</strong> • {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {post.title}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                      {post.content}
                    </p>

                    {post.codeSnippet && (
                      <pre className="p-2.5 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto max-h-24">
                        {post.codeSnippet}
                      </pre>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                      <span>Likes: {post.likes}</span>
                      <span>Replies: {post.replies?.length || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => handleToggleHidePost(post.id, !!post.isHidden)}
                      className={`p-2 rounded-lg text-xs border transition-colors ${
                        post.isHidden
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 border-amber-300"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                      }`}
                      title={post.isHidden ? "Unhide Post" : "Hide Post from students"}
                    >
                      {post.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleTogglePinPost(post.id, !!post.isPinned)}
                      className={`p-2 rounded-lg text-xs border transition-colors ${
                        post.isPinned
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 border-amber-300"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                      }`}
                      title={post.isPinned ? "Unpin Topic" : "Pin Topic to Top"}
                    >
                      {post.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleToggleLockPost(post.id, !!post.isLocked)}
                      className={`p-2 rounded-lg text-xs border transition-colors ${
                        post.isLocked
                          ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 border-rose-300"
                          : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                      }`}
                      title={post.isLocked ? "Unlock Replies" : "Lock Replies"}
                    >
                      {post.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs transition-colors"
                      title="Permanently Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORUM CATEGORIES SUBTAB */}
      {/* ========================================================================= */}
      {activeSubTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Community Forum Categories
              </h3>
              <p className="text-xs text-zinc-500">
                Organize discussions, set bilingual topic labels, and manage channel order.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({
                  name: "",
                  nameMm: "",
                  description: "",
                  icon: "MessageSquare",
                  isEnabled: true,
                  order: categories.length + 1
                });
                setCategoryModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setCategoryModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {cat.name}
                  </h4>
                  {cat.nameMm && (
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {cat.nameMm}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Order: #{cat.order}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    cat.isEnabled
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {cat.isEnabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODERATION AUDIT TRAIL SUBTAB */}
      {/* ========================================================================= */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Administrative Moderation & Dispatch Audit Logs
            </h3>
            <p className="text-xs text-zinc-500">
              Immutable history of warnings, bans, hidden content, announcement updates, and notification broadcasts.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                        {log.action.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Target: <strong className="text-zinc-700 dark:text-zinc-300">{log.targetType}</strong> ({log.targetId})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200">
                      {log.details}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                      {log.adminName}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NOTIFICATION DISPATCH MODAL */}
      {/* ========================================================================= */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                  Dispatch Student Notification
                </h3>
              </div>
              <button onClick={() => setIsNotifModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Audience *
                </label>
                <select
                  value={newNotif.targetAudience || "all"}
                  onChange={(e) => setNewNotif({ ...newNotif, targetAudience: e.target.value as TargetAudienceType })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="all">All Registered Students</option>
                  <option value="free_users">Free Tier Students (Promotions & Incentives)</option>
                  <option value="premium_users">Premium Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category & Trigger Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newNotif.category || "system"}
                    onChange={(e) => setNewNotif({ ...newNotif, category: e.target.value as any })}
                    className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="system">System Notice</option>
                    <option value="course">Course Alert</option>
                    <option value="challenge">Challenge / XP</option>
                    <option value="announcement">Announcement</option>
                  </select>

                  <select
                    value={newNotif.triggerType || "admin_broadcast"}
                    onChange={(e) => setNewNotif({ ...newNotif, triggerType: e.target.value as AdminNotificationTrigger })}
                    className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="admin_broadcast">Admin Broadcast</option>
                    <option value="new_course_released">New Course Release</option>
                    <option value="challenge_completed">Challenge Event</option>
                    <option value="streak_reminder">Streak Reminder</option>
                    <option value="system_maintenance">System Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Coding Challenge: Build a Todo App"
                  value={newNotif.title || ""}
                  onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title (မြန်မာဘာသာ)
                </label>
                <input
                  type="text"
                  placeholder="e.g. အပတ်စဉ် စိန်ခေါ်မှု - Todo App တည်ဆောက်ပါ"
                  value={newNotif.titleMm || ""}
                  onChange={(e) => setNewNotif({ ...newNotif, titleMm: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Message (English) *
                </label>
                <textarea
                  rows={3}
                  placeholder="Notification message body..."
                  value={newNotif.message || ""}
                  onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Message (မြန်မာဘာသာ)
                </label>
                <textarea
                  rows={3}
                  placeholder="ကျောင်းသား/သူများအတွက် အသိပေးစာသား..."
                  value={newNotif.messageMm || ""}
                  onChange={(e) => setNewNotif({ ...newNotif, messageMm: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Action Link Destination
                </label>
                <select
                  value={newNotif.actionTab || "dashboard"}
                  onChange={(e) => setNewNotif({ ...newNotif, actionTab: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="dashboard">Student Dashboard</option>
                  <option value="courses">Courses</option>
                  <option value="projects">Projects & Sandboxes</option>
                  <option value="premium">Premium Membership</option>
                  <option value="community">Community</option>
                  <option value="kibo_ai">Kibo AI Assistant</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER WARNING / RESTRICTION MODAL */}
      {/* ========================================================================= */}
      {userModalOpen && targetUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                {targetUserModal.actionType === "warn" ? "Issue Official Warning" : "Restrict Community Privileges"}
              </h3>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Target Student: <strong>{targetUserModal.userName}</strong> ({targetUserModal.userId})
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Moderation Reason *
              </label>
              <input
                type="text"
                placeholder="e.g. Unsolicited spamming / Harassment in comments"
                value={targetUserModal.reason}
                onChange={(e) => setTargetUserModal({ ...targetUserModal, reason: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {targetUserModal.actionType === "restrict" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Restriction Duration (Days)
                </label>
                <select
                  value={targetUserModal.durationDays}
                  onChange={(e) => setTargetUserModal({ ...targetUserModal, durationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value={3}>3 Days Temporary Suspension</option>
                  <option value={7}>7 Days Standard Suspension</option>
                  <option value={30}>30 Days Extended Ban</option>
                  <option value={365}>Permanent Suspension</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUserAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORUM CATEGORY MODAL */}
      {/* ========================================================================= */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              {editingCategory.id ? "Edit Category" : "Add Forum Category"}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category Name (English) *
              </label>
              <input
                type="text"
                value={editingCategory.name || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category Name (မြန်မာဘာသာ)
              </label>
              <input
                type="text"
                value={editingCategory.nameMm || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, nameMm: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingCategory.description || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cat_enabled"
                checked={editingCategory.isEnabled ?? true}
                onChange={(e) => setEditingCategory({ ...editingCategory, isEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="cat_enabled" className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                Category is visible to students
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
