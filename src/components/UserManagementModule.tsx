/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Eye, 
  Download, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Award, 
  FileText, 
  Check, 
  X, 
  Copy, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  FolderGit2, 
  FileCode,
  Shield,
  Send,
  Plus,
  RefreshCw,
  Edit3,
  RotateCcw
} from "lucide-react";
import { 
  UserProfile, 
  PaymentRequest, 
  PaymentAuditLog,
  AdminInternalNote,
  SuspensionRecord
} from "../types";
import { 
  adminSuspendUser, 
  adminRestoreUser, 
  adminRestrictCommunity, 
  adminAddInternalNote, 
  adminBulkUpdateUsers,
  adminActivateUserPremium,
  adminDeactivateUserPremium,
  adminExtendUserPremium,
  adminUpdateUserProfile,
  addPaymentAuditLog
} from "../lib/db";

interface UserManagementModuleProps {
  allUsers: UserProfile[];
  allPaymentRequests: PaymentRequest[];
  allAuditLogs: PaymentAuditLog[];
  adminUser: UserProfile;
  firebaseUser: any;
  onRefreshData: () => void;
  onOpenAnnouncementModal?: (targetUserEmails?: string[]) => void;
}

export default function UserManagementModule({
  allUsers,
  allPaymentRequests,
  allAuditLogs,
  adminUser,
  firebaseUser,
  onRefreshData,
  onOpenAnnouncementModal
}: UserManagementModuleProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Selection & Bulk Actions
  const [selectedUids, setSelectedUids] = useState<string[]>([]);

  // Modals & Active Selections
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<"profile" | "membership" | "learning" | "quizzes" | "community" | "notes" | "security">("profile");

  // Table Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Action Modals
  const [suspendModalUser, setSuspendModalUser] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState("Violation of Community Terms & Guidelines");
  const [suspendDurationDays, setSuspendDurationDays] = useState<number>(7);

  // Admin Note Input State
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Action Feedback Toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Filter Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !query ||
        (u.uid || "").toLowerCase().includes(query) ||
        (u.name || "").toLowerCase().includes(query) ||
        (u.email || "").toLowerCase().includes(query) ||
        (u.username || "").toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Status Filter
      if (statusFilter === "active" && u.accountStatus !== "active" && u.accountStatus !== undefined) return false;
      if (statusFilter === "suspended" && u.accountStatus !== "suspended") return false;
      if (statusFilter === "restricted" && u.accountStatus !== "restricted" && !u.communityAccessRestricted) return false;
      if (statusFilter === "inactive") {
        const lastActive = new Date(u.lastLogin || 0).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (lastActive > thirtyDaysAgo) return false;
      }

      // Membership Filter
      if (membershipFilter === "free" && u.isPremium) return false;
      if (membershipFilter === "premium" && !u.isPremium) return false;
      if (membershipFilter === "expired" && u.membershipStatus !== "expired") return false;

      // Role Filter
      if (roleFilter !== "all" && (u.role || "student") !== roleFilter) return false;

      return true;
    });
  }, [allUsers, searchQuery, statusFilter, membershipFilter, roleFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, membershipFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Bulk Actions Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUids(filteredUsers.map(u => u.uid!).filter(Boolean));
    } else {
      setSelectedUids([]);
    }
  };

  const handleToggleSelectUser = (uid: string) => {
    setSelectedUids(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleBulkSuspend = async () => {
    if (selectedUids.length === 0) return;
    const reason = prompt(`ကျေးဇူးပြု၍ ရွေးချယ်ထားသော ကျောင်းသား (${selectedUids.length}) ဦးအား အကောင့်ပိတ်ပင်ဆိုင်းငံ့ရသည့် အကြောင်းအရင်းကို ရေးသားပါ:`);
    if (!reason) return;

    for (const uid of selectedUids) {
      await adminSuspendUser(
        uid, 
        reason, 
        7, 
        adminUser.name || "Admin", 
        adminUser.uid || "admin"
      );
    }
    showToast(`ရွေးချယ်ထားသော ကျောင်းသား (${selectedUids.length}) ဦးအား အောင်မြင်စွာ ပိတ်ပင်ဆိုင်းငံ့လိုက်ပါပြီ။`);
    setSelectedUids([]);
    onRefreshData();
  };

  const handleBulkRestore = async () => {
    if (selectedUids.length === 0) return;
    if (!confirm(`ရွေးချယ်ထားသော ကျောင်းသား (${selectedUids.length}) ဦးအား အကောင့်ပြန်လည် စတင်ခွင့်ပြုရန် သေချာပါသလား?`)) return;

    for (const uid of selectedUids) {
      await adminRestoreUser(
        uid, 
        adminUser.name || "Admin", 
        adminUser.uid || "admin", 
        "Bulk Restoration"
      );
    }
    showToast(`ကျောင်းသား (${selectedUids.length}) ဦးအား အကောင့်ပြန်လည် စတင်ပေးလိုက်ပါပြီ။`);
    setSelectedUids([]);
    onRefreshData();
  };

  const handleBulkRestrictCommunity = async (restrict: boolean) => {
    if (selectedUids.length === 0) return;
    for (const uid of selectedUids) {
      await adminRestrictCommunity(
        uid, 
        restrict, 
        adminUser.name || "Admin", 
        adminUser.uid || "admin",
        `Bulk Community ${restrict ? "Restriction" : "Unrestricting"}`
      );
    }
    showToast(`ကျောင်းသား (${selectedUids.length}) ဦး၏ ဖိုရမ်အသုံးပြုခွင့် ပြောင်းလဲလိုက်ပါပြီ။`);
    setSelectedUids([]);
    onRefreshData();
  };

  const handleExportSelectedCSV = () => {
    if (selectedUids.length === 0) return;
    const selectedUsersData = allUsers.filter(u => u.uid && selectedUids.includes(u.uid));
    
    const headers = ["User ID", "Name", "Email", "Username", "Status", "Membership", "Level", "XP", "Coins", "Created Date", "Last Login"];
    const rows = selectedUsersData.map(u => [
      u.uid || "",
      `"${u.name || ""}"`,
      u.email || "",
      u.username || "",
      u.accountStatus || "active",
      u.isPremium ? "Premium" : "Free",
      u.level || 1,
      u.xp || 0,
      u.coins || 0,
      u.createdDate || "",
      u.lastLogin || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `code_learn_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`ကျောင်းသား (${selectedUids.length}) ဦး၏ CSV အချက်အလက်များကို ထုတ်ယူပြီးပါပြီ။`);
  };

  // Individual Actions
  const handleConfirmSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalUser || !suspendModalUser.uid) return;

    await adminSuspendUser(
      suspendModalUser.uid,
      suspendReason,
      suspendDurationDays === 0 ? undefined : suspendDurationDays,
      adminUser.name || "Admin",
      adminUser.uid || "admin"
    );

    showToast(`[${suspendModalUser.name}] ၏ အကောင့်အား အောင်မြင်စွာ ပိတ်ပင်ဆိုင်းငံ့လိုက်ပါပြီ။`);
    setSuspendModalUser(null);
    if (selectedUser?.uid === suspendModalUser.uid) {
      setSelectedUser(prev => prev ? {
        ...prev,
        accountStatus: "suspended",
        suspensionInfo: {
          reason: suspendReason,
          startDate: new Date().toISOString(),
          durationDays: suspendDurationDays,
          administrator: adminUser.name || "Admin"
        }
      } : null);
    }
    onRefreshData();
  };

  const handleRestoreUserSingle = async (u: UserProfile) => {
    if (!u.uid) return;
    if (!confirm(`[${u.name}] ၏ ဆိုင်းငံ့ထားသော အကောင့်အား ပြန်လည်ဖွင့်လှစ်ပေးရန် သေချာပါသလား?`)) return;

    await adminRestoreUser(u.uid, adminUser.name || "Admin", adminUser.uid || "admin", "Admin Individual Restore");
    showToast(`[${u.name}] ၏ အကောင့်အား ပုံမှန်အဖြစ် ပြန်လည် စတင်ပေးလိုက်ပါပြီ။`);
    if (selectedUser?.uid === u.uid) {
      setSelectedUser(prev => prev ? { ...prev, accountStatus: "active", suspensionInfo: undefined } : null);
    }
    onRefreshData();
  };

  const handleToggleCommunityRestrictionSingle = async (u: UserProfile) => {
    if (!u.uid) return;
    const newStatus = !u.communityAccessRestricted;
    await adminRestrictCommunity(u.uid, newStatus, adminUser.name || "Admin", adminUser.uid || "admin");
    showToast(`[${u.name}] ၏ ဖိုရမ်ဝင်ရောက်ခွင့်ကို ${newStatus ? "ကန့်သတ်လိုက်ပါပြီ" : "ပြန်လည်ဖွင့်လှစ်ပေးလိုက်ပါပြီ"}`);
    if (selectedUser?.uid === u.uid) {
      setSelectedUser(prev => prev ? { ...prev, communityAccessRestricted: newStatus, accountStatus: newStatus ? "restricted" : "active" } : null);
    }
    onRefreshData();
  };

  const handleAddSupportNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.uid || !newNoteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      const updatedNotes = await adminAddInternalNote(
        selectedUser.uid,
        selectedUser.adminNotesList,
        newNoteText.trim(),
        adminUser.name || "Admin",
        adminUser.uid || "admin"
      );

      setSelectedUser(prev => prev ? { ...prev, adminNotesList: updatedNotes } : null);
      setNewNoteText("");
      showToast("စနစ်အတွင်းအသုံးပြုရန် ထောက်ပံ့ရေး မှတ်စုသစ်အား အောင်မြင်စွာ ထည့်သွင်းလိုက်ပါပြီ။");
      onRefreshData();
    } catch (err) {
      alert("မှတ်စု ထည့်သွင်းမှု မအောင်မြင်ပါ။");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleResetUserSetting = async (u: UserProfile, type: "username" | "streak" | "coins") => {
    if (!u.uid) return;
    let updates: Partial<UserProfile> = {};
    let desc = "";

    if (type === "username") {
      const newU = prompt("အသစ် သတ်မှတ်လိုသော Username ထည့်ပါ:", u.username || "");
      if (!newU) return;
      updates = { username: newU.trim() };
      desc = `Reset username to ${newU.trim()}`;
    } else if (type === "streak") {
      if (!confirm("ဤကျောင်းသား၏ Streak ရက်ပေါင်းအား 0 သို့ ပြန်လည်သတ်မှတ်ရန် သေချာပါသလား?")) return;
      updates = { learningStreak: 0 };
      desc = "Reset streak counter to 0";
    } else if (type === "coins") {
      const newCoins = prompt("သတ်မှတ်လိုသော Coins ပမာဏ ထည့်ပါ:", String(u.coins || 0));
      if (newCoins === null) return;
      updates = { coins: parseInt(newCoins) || 0 };
      desc = `Updated coins to ${newCoins}`;
    }

    await adminUpdateUserProfile(u.uid, updates);
    await addPaymentAuditLog(
      "policy",
      u.uid,
      "Setting Reset",
      adminUser.name || "Admin",
      adminUser.uid || "admin",
      `Admin reset setting [${type}] for ${u.email}: ${desc}`
    );

    if (selectedUser?.uid === u.uid) {
      setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
    }
    showToast("ကျောင်းသား အကောင့်ပြင်ဆင်မှု အောင်မြင်ပါသည်။");
    onRefreshData();
  };

  // Payment Requests for selected user
  const userPaymentHistory = useMemo(() => {
    if (!selectedUser) return [];
    return allPaymentRequests.filter(p => 
      p.uid === selectedUser.uid || 
      p.userEmail?.toLowerCase() === selectedUser.email?.toLowerCase()
    );
  }, [selectedUser, allPaymentRequests]);

  // User Audit Logs
  const userAuditHistory = useMemo(() => {
    if (!selectedUser) return [];
    return allAuditLogs.filter(log => 
      log.entityId === selectedUser.uid || 
      log.uid === selectedUser.uid ||
      log.details?.includes(selectedUser.uid || "") ||
      log.details?.includes(selectedUser.email || "")
    );
  }, [selectedUser, allAuditLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* TOAST NOTIFICATION */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs">{actionFeedback}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Student Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-3">
            <Users className="w-7 h-7 text-amber-400" />
            <span>User Management System (ကျောင်းသား အကောင့်ထိန်းချုပ်ရေး)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ကျောင်းသားများ၏ အကောင့်အခြေအနေ၊ သင်ယူမှုတိုးတက်မှု၊ ပိတ်ပင်ဆိုင်းငံ့မှုနှင့် Support မှတ်စုများအား လုံခြုံစွာ စီမံခန့်ခွဲနိုင်ပါသည်။
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh Data</span>
          </button>
          <span className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400">
            Total Users: {allUsers.length}
          </span>
        </div>
      </div>

      {/* SEARCH AND ADVANCED FILTERS BAR */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, Name, Email, Username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Account Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Statuses (အခြေအနေ အားလုံး)</option>
              <option value="active">Active Users (ပုံမှန်)</option>
              <option value="suspended">Suspended Users (ဆိုင်းငံ့ထားသူ)</option>
              <option value="restricted">Restricted Users (ကန့်သတ်ထားသူ)</option>
              <option value="inactive">Inactive Users (&gt; 30 Days)</option>
            </select>
          </div>

          {/* Membership Filter */}
          <div className="flex items-center space-x-2">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Memberships (အသင်းဝင် အားလုံး)</option>
              <option value="free">Free Users (အခမဲ့)</option>
              <option value="premium">Premium Users (Premium)</option>
              <option value="expired">Expired Premium (သက်တမ်းကုန်)</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Roles (ရာထူး အားလုံး)</option>
              <option value="student">Students (ကျောင်းသားများ)</option>
              <option value="content_admin">Content Admin</option>
              <option value="finance_admin">Finance Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS TOOLBAR (Appears when 1+ users selected) */}
        {selectedUids.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-300">
                 Selected Users: {selectedUids.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenAnnouncementModal && (
                <button
                  onClick={() => {
                    const selectedEmails = allUsers.filter(u => u.uid && selectedUids.includes(u.uid)).map(u => u.email).filter(Boolean);
                    onOpenAnnouncementModal(selectedEmails);
                  }}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Announcement</span>
                </button>
              )}

              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Bulk Suspend</span>
              </button>

              <button
                onClick={handleBulkRestore}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Bulk Restore</span>
              </button>

              <button
                onClick={() => handleBulkRestrictCommunity(true)}
                className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Restrict Community</span>
              </button>

              <button
                onClick={handleExportSelectedCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* USER LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUids.length > 0 && selectedUids.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                </th>
                <th className="p-4">Student & Username</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Membership</th>
                <th className="p-4">Level & XP</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <span>ရှာဖွေတွေ့ရှိမှု မရှိပါ</span>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const isSelected = !!u.uid && selectedUids.includes(u.uid);
                  const status = u.accountStatus || "active";
                  const isPrem = !!u.isPremium;

                  return (
                    <tr 
                      key={u.uid || idx} 
                      className={`hover:bg-slate-800/50 transition-colors ${isSelected ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => u.uid && handleToggleSelectUser(u.uid)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                      </td>

                      {/* Student Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-slate-700 text-sm">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-slate-100 truncate">{u.name}</p>
                              {u.role && u.role !== "student" && (
                                <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[9px] font-mono rounded">
                                  {u.role}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">@{u.username || "student"}</span>
                              <span className="text-[10px] text-slate-600 font-mono truncate">ID: {u.uid?.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="p-4">
                        {status === "suspended" ? (
                          <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold flex items-center w-max space-x-1">
                            <UserX className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : status === "restricted" || u.communityAccessRestricted ? (
                          <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-bold flex items-center w-max space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Restricted</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center w-max space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Membership Status Badge */}
                      <td className="p-4">
                        {isPrem ? (
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold flex items-center w-max space-x-1">
                            <Crown className="w-3 h-3" />
                            <span>{u.premiumPlan ? u.premiumPlan.toUpperCase() : "PREMIUM"}</span>
                          </span>
                        ) : u.membershipStatus === "expired" ? (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-medium">
                            Expired
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Free</span>
                        )}
                      </td>

                      {/* Level & XP */}
                      <td className="p-4 font-mono">
                        <div className="font-bold text-amber-400">Lvl {u.level || 1}</div>
                        <div className="text-[10px] text-slate-500">{u.xp || 0} XP • {u.coins || 0} Coins</div>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {u.createdDate ? new Date(u.createdDate).toLocaleDateString() : "2026-01-15"}
                      </td>

                      {/* Last Active Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Today"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActiveUserTab("profile");
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Profile</span>
                          </button>

                          {status === "suspended" ? (
                            <button
                              onClick={() => handleRestoreUserSingle(u)}
                              title="Restore User Account"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSuspendModalUser(u);
                                setSuspendReason("Violation of Community Terms & Guidelines");
                                setSuspendDurationDays(7);
                              }}
                              title="Suspend User Account"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 font-mono text-[11px]">
              ကျောင်းသား စုစုပေါင်း: <strong className="text-white">{filteredUsers.length}</strong> ဦး 
              (စာမျက်နှာ {currentPage} / {totalPages})
            </span>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span>တစ်မျက်နှာလျှင်:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
              >
                <option value={10}>10 ဦး</option>
                <option value={15}>15 ဦး</option>
                <option value={25}>25 ဦး</option>
                <option value={50}>50 ဦး</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              Previous (ရှေ့သို့)
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Calculate window around currentPage
              let pageNum = currentPage;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              Next (နောက်သို့)
            </button>
          </div>
        </div>
      </div>

      {/* SUSPENSION ACTION MODAL */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-red-950/30 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-100 text-base">Suspend Student Account</h3>
              </div>
              <button onClick={() => setSuspendModalUser(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-200">{suspendModalUser.name}</p>
              <p className="text-slate-400 font-mono">{suspendModalUser.email}</p>
              <p className="text-slate-500 text-[10px]">UID: {suspendModalUser.uid}</p>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Suspension Reason (အကောင့်ဆိုင်းငံ့ရသည့် အကြောင်းအရင်း):
                </label>
                <textarea
                  required
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-red-500/50"
                  placeholder="ဥပမာ - ဖိုရမ်စည်းကမ်းဖောက်ဖျက်ခြင်း၊ Spam ရေးသားခြင်း..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Suspension Duration (ဆိုင်းငံ့ထားမည့် သက်တမ်း):
                </label>
                <select
                  value={suspendDurationDays}
                  onChange={(e) => setSuspendDurationDays(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                >
                  <option value={7}>7 Days (၁ ပတ်)</option>
                  <option value={14}>14 Days (၂ ပတ်)</option>
                  <option value={30}>30 Days (၁ လ)</option>
                  <option value={90}>90 Days (၃ လ)</option>
                  <option value={0}>Indefinite / Permanent (အပြီးသတ်)</option>
                </select>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-300 space-y-1">
                <p className="font-bold">⚠️ Audit Notice:</p>
                <p>ဤဆိုင်းငံ့မှုအား Admin Audit Log တွင် Admin အမည်၊ အကြောင်းအရင်း၊ ရက်စွဲနှင့်တကွ အပြီးအပိုင် မှတ်တမ်းတင်သွားမည် ဖြစ်ပါသည်။</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>Confirm Suspension</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE USER PROFILE VIEW MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            {/* MODAL HEADER */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-lg">
                  {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-slate-100">{selectedUser.name}</h2>
                    <span className="text-xs font-mono text-slate-400">@{selectedUser.username || "student"}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.email}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">User ID: {selectedUser.uid}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {selectedUser.accountStatus === "suspended" ? (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-bold">
                    Suspended
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                    Active Account
                  </span>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL NAVIGATION TABS */}
            <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-6 shrink-0 custom-scrollbar">
              {[
                { id: "profile", label: "Basic Info & Settings", icon: Users },
                { id: "membership", label: "Membership & Payments", icon: Crown },
                { id: "learning", label: "Learning Progress", icon: BookOpen },
                { id: "quizzes", label: "Quiz Statistics", icon: HelpCircle },
                { id: "community", label: "Community & Reputation", icon: MessageSquare },
                { id: "notes", label: "Admin Support Notes", icon: FileText, badge: selectedUser.adminNotesList?.length || 0 },
                { id: "security", label: "Account Status & Audit", icon: ShieldCheck }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeUserTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveUserTab(tab.id as any)}
                    className={`
                      py-3 px-4 text-xs font-semibold whitespace-nowrap flex items-center space-x-2 border-b-2 transition-all
                      ${isActive 
                        ? "border-amber-500 text-amber-400 bg-amber-500/5" 
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}
                    `}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge ? (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-mono rounded-full font-bold">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* MODAL BODY CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* PRIVACY MANDATE BANNER */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center space-x-3 text-xs text-blue-300">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <p>
                  <strong>Data Privacy Policy:</strong> Student private notes and personal study spaces remain strictly encrypted and inaccessible to administrative staff. Only authorized educational metrics are visible.
                </p>
              </div>

              {/* TAB 1: BASIC INFO & SETTINGS */}
              {activeUserTab === "profile" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Account Identifiers</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Display Name:</span>
                          <span className="font-semibold text-slate-100">{selectedUser.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Email Address:</span>
                          <span className="font-mono text-slate-200">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Username:</span>
                          <span className="font-mono text-amber-400">@{selectedUser.username || "student"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">System Role:</span>
                          <span className="font-bold uppercase text-purple-400">{selectedUser.role || "student"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Timestamps & Activity</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Registration Date:</span>
                          <span className="font-mono text-slate-200">{selectedUser.createdDate ? new Date(selectedUser.createdDate).toLocaleString() : "2026-01-15"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Last Active Session:</span>
                          <span className="font-mono text-emerald-400">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Recently"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Preferred Language:</span>
                          <span className="font-mono text-slate-300">{selectedUser.preferredLanguage === "en" ? "English" : "Myanmar (မြန်မာ)"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Theme Preference:</span>
                          <span className="font-mono text-slate-300">{selectedUser.themePreference || "dark"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN RESET CONTROLS */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-orange-400" />
                      <span>Account Reset Controls (အကောင့်ပြင်ဆင်သတ်မှတ်မှုများ)</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleResetUserSetting(selectedUser, "username")}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Change Username
                      </button>
                      <button
                        onClick={() => handleResetUserSetting(selectedUser, "streak")}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Reset Streak Counter
                      </button>
                      <button
                        onClick={() => handleResetUserSetting(selectedUser, "coins")}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Modify Coins Balance
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEMBERSHIP & PAYMENTS */}
              {activeUserTab === "membership" && (
                <div className="space-y-6">
                  <div className="p-5 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Current Membership Status</span>
                      <h3 className="text-xl font-bold text-slate-100 mt-1 flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <span>{selectedUser.isPremium ? "Kibo Premium Active" : "Free Plan Student"}</span>
                      </h3>
                      {selectedUser.premiumUntil && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Expires On: {new Date(selectedUser.premiumUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {selectedUser.isPremium ? (
                        <button
                          onClick={async () => {
                            await adminDeactivateUserPremium(selectedUser.uid!);
                            setSelectedUser(prev => prev ? { ...prev, isPremium: false } : null);
                            showToast("Premium အသင်းဝင်အဖြစ်မှ ရုပ်သိမ်းလိုက်ပါပြီ။");
                            onRefreshData();
                          }}
                          className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold"
                        >
                          Revoke Premium
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await adminActivateUserPremium(selectedUser.uid!, "lifetime");
                            setSelectedUser(prev => prev ? { ...prev, isPremium: true, premiumPlan: "lifetime" } : null);
                            showToast("Lifetime Premium အဖြစ် သတ်မှတ်လိုက်ပါပြီ။");
                            onRefreshData();
                          }}
                          className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                        >
                          Grant Lifetime Premium
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PAYMENT HISTORY TABLE */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Authorized Payment History ({userPaymentHistory.length})</span>
                    </h4>

                    {userPaymentHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">ငွေလွှဲမှတ်တမ်း မရှိသေးပါ</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">TX ID</th>
                              <th className="p-2.5">Plan</th>
                              <th className="p-2.5">Method</th>
                              <th className="p-2.5">Amount</th>
                              <th className="p-2.5">Date</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {userPaymentHistory.map((p, i) => (
                              <tr key={i}>
                                <td className="p-2.5 font-mono text-amber-400">{p.transactionId}</td>
                                <td className="p-2.5">{p.planName}</td>
                                <td className="p-2.5 font-bold">{p.paymentMethod}</td>
                                <td className="p-2.5 font-mono text-emerald-400">{p.amount.toLocaleString()} MMK</td>
                                <td className="p-2.5 text-slate-400">{new Date(p.timestamp).toLocaleDateString()}</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                                    p.status === "rejected" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: LEARNING PROGRESS */}
              {activeUserTab === "learning" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Current Level</p>
                      <p className="text-2xl font-bold font-mono text-amber-400 mt-1">Lvl {selectedUser.level || 1}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total XP</p>
                      <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{selectedUser.xp || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Learning Streak</p>
                      <p className="text-2xl font-bold font-mono text-orange-400 mt-1">🔥 {selectedUser.learningStreak || 0} Days</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Completed Lessons</p>
                      <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{selectedUser.completedLessons?.length || 0}</p>
                    </div>
                  </div>

                  {/* CERTIFICATES & ACHIEVEMENTS */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Certificates Unlocked ({selectedUser.certificates?.length || 0})</span>
                    </h4>
                    {selectedUser.certificates?.length === 0 ? (
                      <p className="text-xs text-slate-500">အောင်လက်မှတ် ထုတ်ယူထားခြင်း မရှိသေးပါ</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.certificates?.map((cert, i) => (
                          <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-100">{cert.courseTitle}</p>
                              <p className="text-[10px] font-mono text-slate-400">Issued: {cert.issuedDate}</p>
                            </div>
                            <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              VERIFIED #{cert.verificationId?.substring(0, 8)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: QUIZ STATISTICS */}
              {activeUserTab === "quizzes" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Quizzes Completed</p>
                      <p className="text-3xl font-bold font-mono text-amber-400 mt-1">{selectedUser.quizStats?.totalQuizzesTaken || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Questions Answered</p>
                      <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">{selectedUser.quizStats?.totalQuestions || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase">Overall Accuracy</p>
                      <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">{selectedUser.quizStats?.accuracyRate || 85}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: COMMUNITY & REPUTATION */}
              {activeUserTab === "community" && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-200">Community Access & Reputation</h4>
                      <button
                        onClick={() => handleToggleCommunityRestrictionSingle(selectedUser)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          selectedUser.communityAccessRestricted
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}
                      >
                        {selectedUser.communityAccessRestricted ? "Unrestrict Access" : "Restrict Forum Access"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block">Reputation Points:</span>
                        <span className="font-bold text-amber-400 text-base">{selectedUser.reputationPoints || 120} pts</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block">Helpful Answers:</span>
                        <span className="font-bold text-emerald-400 text-base">{selectedUser.helpfulAnswersCount || 0}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block">Best Answers:</span>
                        <span className="font-bold text-cyan-400 text-base">{selectedUser.bestAnswersCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ADMIN SUPPORT NOTES (INTERNAL ONLY) */}
              {activeUserTab === "notes" && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300">
                    <p className="font-bold flex items-center space-x-1">
                      <Lock className="w-4 h-4" />
                      <span>Internal Support Notes (ကျောင်းသားထံ မြင်တွေ့ရမည် မဟုတ်ပါ)</span>
                    </p>
                    <p className="mt-1">
                      ဤနေရာတွင် ရေးသားသော Support မှတ်စုများသည် Admin များ သီးသန့် အပြန်အလှန် လွှဲပြောင်းကြည့်ရှုရန် ဖြစ်ပါသည်။
                    </p>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddSupportNote} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add an internal support note regarding this student's account..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !newNoteText.trim()}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Support Note</span>
                    </button>
                  </form>

                  {/* Notes Timeline */}
                  <div className="space-y-3">
                    {(!selectedUser.adminNotesList || selectedUser.adminNotesList.length === 0) ? (
                      <p className="text-xs text-slate-500 text-center py-6">ထောက်ပံ့ရေး မှတ်စုမရှိသေးပါ</p>
                    ) : (
                      selectedUser.adminNotesList.map((note, idx) => (
                        <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-bold text-amber-400">{note.adminName}</span>
                            <span className="font-mono text-[10px]">{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-200 leading-relaxed">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: ACCOUNT STATUS & AUDIT */}
              {activeUserTab === "security" && (
                <div className="space-y-6">
                  {/* SUSPENSION DETAILS */}
                  {selectedUser.suspensionInfo && (
                    <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2 text-xs text-red-300">
                      <h4 className="font-bold text-sm text-red-400 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Active Suspension Record</span>
                      </h4>
                      <p><strong>Reason:</strong> {selectedUser.suspensionInfo.reason}</p>
                      <p><strong>Start Date:</strong> {new Date(selectedUser.suspensionInfo.startDate).toLocaleString()}</p>
                      <p><strong>Duration:</strong> {selectedUser.suspensionInfo.durationDays ? `${selectedUser.suspensionInfo.durationDays} Days` : "Indefinite"}</p>
                      <p><strong>Admin:</strong> {selectedUser.suspensionInfo.administrator}</p>
                    </div>
                  )}

                  {/* AUDIT LOG FOR THIS USER */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Account Audit Log History</span>
                    </h4>

                    {userAuditHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">Audit log မရှိသေးပါ</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {userAuditHistory.map((log, i) => (
                          <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-200">{log.action}</p>
                              <p className="text-[11px] text-slate-400">{log.details}</p>
                            </div>
                            <div className="text-right text-[10px] font-mono text-slate-500">
                              <p>{new Date(log.timestamp).toLocaleString()}</p>
                              <p className="text-amber-400">by {log.performedBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
