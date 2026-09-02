/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Key,
  Calendar,
  Layers,
  Settings,
  Lock,
  MessageSquare
} from "lucide-react";
import { UserProfile, TelegramAccessRequest, TelegramChannelSettings } from "../../types";
import { 
  getAllTelegramAccessRequests, 
  getTelegramSettings, 
  saveTelegramSettings, 
  searchUserByUidForVerification, 
  adminVerifyUserTelegramByUid,
  adminVerifyTelegramRequest,
  DEFAULT_TELEGRAM_SETTINGS
} from "../../utils/telegramService";

interface TelegramVerificationAdminTabProps {
  adminUser: UserProfile;
  allUsers: UserProfile[];
  onRefreshAllUsers?: () => void;
}

export const TelegramVerificationAdminTab: React.FC<TelegramVerificationAdminTabProps> = ({
  adminUser,
  allUsers,
  onRefreshAllUsers
}) => {
  const [requests, setRequests] = useState<TelegramAccessRequest[]>([]);
  const [settings, setSettings] = useState<TelegramChannelSettings>(DEFAULT_TELEGRAM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Direct UID Search State
  const [searchedUid, setSearchedUid] = useState("");
  const [searchResultUser, setSearchResultUser] = useState<UserProfile | null>(null);
  const [searchResultReq, setSearchResultReq] = useState<TelegramAccessRequest | null>(null);
  const [isSearchingUid, setIsSearchingUid] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Processing Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [customInviteLink, setCustomInviteLink] = useState("");
  const [rejectionReason, setRejectionReason] = useState("UID verification requirement not met.");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Settings Edit states
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedSupportHandle, setEditedSupportHandle] = useState("");
  const [editedFreeUrl, setEditedFreeUrl] = useState("");
  const [editedVipLink, setEditedVipLink] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRequests, fetchedSettings] = await Promise.all([
        getAllTelegramAccessRequests(),
        getTelegramSettings()
      ]);
      setRequests(fetchedRequests);
      setSettings(fetchedSettings);
      setEditedSupportHandle(fetchedSettings.supportTelegramHandle);
      setEditedFreeUrl(fetchedSettings.freeChannelUrl);
      setEditedVipLink(fetchedSettings.premiumChannelInviteLink);
    } catch (err) {
      console.error("Error loading Telegram admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchByUid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchedUid.trim()) return;

    setIsSearchingUid(true);
    setSearchFeedback(null);
    setSearchResultUser(null);
    setSearchResultReq(null);

    try {
      const result = await searchUserByUidForVerification(searchedUid.trim());
      if (result && result.user) {
        setSearchResultUser(result.user);
        setSearchResultReq(result.telegramRequest || null);
        setSearchFeedback(`ကျောင်းသား ${result.user.name} (${result.user.email}) အား ရှာဖွေတွေ့ရှိပါသည်!`);
      } else {
        setSearchFeedback(`UID "${searchedUid.trim()}" ဖြင့် ကိုက်ညီသော ကျောင်းသား မတွေ့ရှိပါဗျာ။`);
      }
    } catch (err) {
      console.error("UID search error:", err);
      setSearchFeedback("UID ရှာဖွေရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်");
    } finally {
      setIsSearchingUid(false);
    }
  };

  const handleVerifyByUidDirect = async (
    targetUid: string, 
    decision: "approved" | "rejected",
    inviteLink?: string,
    reason?: string
  ) => {
    setProcessingId(targetUid);
    setActionSuccessMsg(null);
    try {
      const res = await adminVerifyUserTelegramByUid(
        targetUid,
        decision,
        adminUser.email,
        inviteLink || settings.premiumChannelInviteLink,
        reason
      );

      if (res.success) {
        setActionSuccessMsg(`UID: ${targetUid} အား ${decision === "approved" ? "VIP အတည်ပြုခွင့်ပြုချက် ပေးအပ်လိုက်ပါပြီ ✓" : "ငြင်းပယ်လိုက်ပါပြီ ✗"}`);
        // Refresh local search user
        if (searchResultUser && searchResultUser.uid === targetUid) {
          setSearchResultUser({
            ...searchResultUser,
            telegramVerificationStatus: decision,
            telegramVerified: decision === "approved"
          });
        }
        await loadData();
        if (onRefreshAllUsers) onRefreshAllUsers();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error("Direct verify error:", err);
      alert("စစ်ဆေးအတည်ပြုရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyFromRequestList = async (
    req: TelegramAccessRequest,
    status: "approved" | "rejected"
  ) => {
    setProcessingId(req.id);
    setActionSuccessMsg(null);
    try {
      const targetUid = req.uid || (req as any).userId || "";
      await adminVerifyTelegramRequest(
        req.id,
        targetUid,
        status,
        adminUser.email,
        customInviteLink.trim() || settings.premiumChannelInviteLink,
        status === "rejected" ? rejectionReason : undefined
      );

      setActionSuccessMsg(`${req.userName || targetUid} ၏ Telegram VIP အခွင့်အရေးကို ${status === "approved" ? "အတည်ပြုပြီးပါပြီ" : "ငြင်းပယ်လိုက်ပါပြီ"}`);
      await loadData();
      if (onRefreshAllUsers) onRefreshAllUsers();
    } catch (err) {
      console.error("Error verifying request:", err);
      alert("တောင်းဆိုမှု စစ်ဆေးရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated: TelegramChannelSettings = {
        ...settings,
        supportTelegramHandle: editedSupportHandle.trim() || "@Johnny_AZM",
        freeChannelUrl: editedFreeUrl.trim() || "https://t.me/code_Learn_myanmar",
        premiumChannelInviteLink: editedVipLink.trim() || "https://t.me/+CLM_VIP_DirectAccess"
      };
      await saveTelegramSettings(updated);
      setSettings(updated);
      setIsEditingSettings(false);
      setActionSuccessMsg("Telegram ချန်နယ်နှင့် Support ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("ဆက်တင်များ သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(label);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  // Filtered requests
  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterStatus === "all" || req.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const targetUid = (req.uid || (req as any).userId || "").toLowerCase();
    const matchesSearch = !q || 
      targetUid.includes(q) ||
      (req.userName && req.userName.toLowerCase().includes(q)) ||
      (req.userEmail && req.userEmail.toLowerCase().includes(q)) ||
      (req.telegramUsername && req.telegramUsername.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg">
              <Send className="w-6 h-6 transform -rotate-12" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Direct UID Verification Gate
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                  Admin: {settings.supportTelegramHandle}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Telegram VIP Channel Verification
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
                ကျောင်းသားများ ပေးပို့လာသော User ID (UID) ကို ရှာဖွေစစ်ဆေးပြီး Premium VIP Telegram Channel သို့ ဝင်ရောက်ခွင့် အတည်ပြုခြင်း/ငြင်းပယ်ခြင်း စီမံခန့်ခွဲရာ ဗဟိုဌာန။
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-sky-400" />
              <span>{isEditingSettings ? "Close Settings" : "Channel Links & Admin Handle"}</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-800/30 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Pending Review</span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{pendingCount}</span>
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Verified VIP Members</span>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{approvedCount}</span>
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Rejected Requests</span>
            <span className="text-xl font-bold text-rose-400 flex items-center gap-1.5 mt-0.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{rejectedCount}</span>
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Official Support</span>
            <span className="text-sm font-bold font-mono text-sky-300 flex items-center gap-1.5 mt-1 truncate">
              <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{settings.supportTelegramHandle}</span>
            </span>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* EDIT SETTINGS DRAWER / CARD */}
      {isEditingSettings && (
        <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Telegram Channels & Admin Support Configuration</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Realtime Live Sync</span>
          </div>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Support Telegram Handle</label>
              <input
                type="text"
                value={editedSupportHandle}
                onChange={(e) => setEditedSupportHandle(e.target.value)}
                placeholder="@Johnny_AZM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500">ကျောင်းသားများ UID ပေးပို့ဆက်သွယ်ရမည့် Admin Handle</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Free Public Channel Link</label>
              <input
                type="text"
                value={editedFreeUrl}
                onChange={(e) => setEditedFreeUrl(e.target.value)}
                placeholder="https://t.me/code_Learn_myanmar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500">Free Users များ ဝင်ရောက်နိုင်သော ချန်နယ် Link</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Private VIP Channel Invite Link</label>
              <input
                type="text"
                value={editedVipLink}
                onChange={(e) => setEditedVipLink(e.target.value)}
                placeholder="https://t.me/+CLM_VIP_Invite_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500">Admin Approved ဖြစ်ပါက ပေးပို့မည့် သီးသန့် Link</span>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-sky-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingSettings ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DIRECT UID SEARCH & ONE-CLICK VERIFICATION INTERFACE */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-amber-400" />
              <span>Direct UID Instant Verification (UID ဖြင့် တိုက်ရိုက် ရှာဖွေစစ်ဆေးခြင်း)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin Telegram (`{settings.supportTelegramHandle}`) ထံသို့ ကျောင်းသား ပေးပို့လာသော UID ကို ဤနေရာတွင် ရိုက်ထည့်ပြီး ရှာဖွေပါ။
            </p>
          </div>

          <span className="text-[11px] font-mono px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
            ⚡ Quick Lookup
          </span>
        </div>

        {/* UID Search Box */}
        <form onSubmit={handleSearchByUid} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchedUid}
              onChange={(e) => setSearchedUid(e.target.value)}
              placeholder="Paste or Enter Student UID (e.g. 8fK29xPq71Lm သို့မဟုတ် Firebase UID)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              id="input-search-uid"
            />
          </div>

          <button
            type="submit"
            disabled={isSearchingUid || !searchedUid.trim()}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            id="btn-search-uid"
          >
            <Search className="w-4 h-4" />
            <span>{isSearchingUid ? "Searching..." : "Search UID"}</span>
          </button>
        </form>

        {searchFeedback && (
          <p className="text-xs text-slate-400 font-mono italic">
            {searchFeedback}
          </p>
        )}

        {/* SEARCH RESULT CARD */}
        {searchResultUser && (
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                  {searchResultUser?.name ? searchResultUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{searchResultUser?.name || "User"}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      searchResultUser.role === "premium" || (searchResultUser as any).isPremium
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {searchResultUser.role === "premium" || (searchResultUser as any).isPremium ? "👑 Premium" : "Free User"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{searchResultUser.email}</p>
                </div>
              </div>

              {/* Telegram Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  searchResultUser.telegramVerificationStatus === "approved" || searchResultUser.telegramVerified
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : searchResultUser.telegramVerificationStatus === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : searchResultUser.telegramVerificationStatus === "rejected"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  {searchResultUser.telegramVerificationStatus === "approved" || searchResultUser.telegramVerified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approved (VIP Verified)</span>
                    </>
                  ) : searchResultUser.telegramVerificationStatus === "pending" ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pending Verification</span>
                    </>
                  ) : searchResultUser.telegramVerificationStatus === "rejected" ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Rejected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Not Verified</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* User Detailed Verification & Security Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* 1. UID & Identity */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>1. User ID (UID)</span>
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-amber-400 font-bold select-all truncate text-[11px]">{searchResultUser.uid}</span>
                  <button 
                    onClick={() => handleCopy(searchResultUser.uid, "search-uid")} 
                    className="text-slate-400 hover:text-amber-400 text-[10px] ml-2 shrink-0 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {copiedUid === "search-uid" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">
                  Handle: <strong className="text-sky-400">{searchResultUser.telegramUsername || searchResultReq?.telegramUsername || "None"}</strong>
                </span>
              </div>

              {/* 2. Premium Status Check */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>2. Premium Status</span>
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${searchResultUser.role === "premium" || (searchResultUser as any).isPremium ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  <span className={`font-bold text-xs ${searchResultUser.role === "premium" || (searchResultUser as any).isPremium ? "text-emerald-400" : "text-slate-400"}`}>
                    {searchResultUser.role === "premium" || (searchResultUser as any).isPremium ? "👑 Premium Active" : "⚡ Free Tier User"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Plan: <strong className="text-slate-200">{searchResultUser.premiumPlan || searchResultReq?.planName || "Standard"}</strong>
                </span>
              </div>

              {/* 3. Payment Verification */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>3. Payment Status</span>
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-xs text-slate-200">
                    {(searchResultUser as any).paymentVerified ? "Verified Slip ✓" : searchResultUser.role === "premium" ? "Verified Active" : "No Payment Recorded"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Method: <strong className="text-slate-300">{(searchResultUser as any).lastPaymentMethod || "Direct / Admin"}</strong>
                </span>
              </div>

              {/* 4. Expiry Date Check */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>4. Expiry Date</span>
                </span>
                <div className="font-mono text-xs font-bold text-slate-200 mt-1">
                  {searchResultUser.premiumExpiresAt 
                    ? new Date(searchResultUser.premiumExpiresAt).toLocaleDateString()
                    : searchResultUser.role === "premium" ? "Lifetime / Valid" : "N/A"}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {searchResultUser.premiumExpiresAt && new Date(searchResultUser.premiumExpiresAt).getTime() < Date.now()
                    ? "⚠️ Subscription Expired"
                    : "✓ Access Valid"}
                </span>
              </div>

            </div>

            {/* Action Buttons for this Searched User */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Decision for UID: <code className="text-amber-300 font-bold">{searchResultUser.uid.slice(0, 10)}...</code></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyByUidDirect(searchResultUser.uid, "rejected", undefined, "Verification rejected by Admin")}
                  disabled={processingId === searchResultUser.uid}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject VIP Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyByUidDirect(searchResultUser.uid, "approved", settings.premiumChannelInviteLink)}
                  disabled={processingId === searchResultUser.uid}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Grant VIP Access</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TELEGRAM ACCESS REQUESTS QUEUE & DIRECT ACTIONS */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-sky-400" />
              <span>Telegram Verification Queue (စစ်ဆေးရန် တောင်းဆိုမှုများ)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              စုစုပေါင်း တောင်းဆိုမှု {requests.length} ခု ရှိပါသည်။
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["all", "pending", "approved", "rejected"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  filterStatus === tab
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "all" ? "အားလုံး" : tab}
                {tab === "pending" && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Filter in List */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, UID, or telegram handle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-sky-500"
          />
        </div>

        {/* REQUESTS LIST */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Loading verification requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <Send className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p>ကိုက်ညီသော Telegram Verification တောင်းဆိုမှု မရှိပါ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(req => {
              const reqUid = req.uid || (req as any).userId || "";
              const matchedUser = allUsers.find(u => u.uid === reqUid);
              const isApproved = req.status === "approved";
              const isPending = req.status === "pending";
              const isRejected = req.status === "rejected";

              return (
                <div 
                  key={req.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: User Details & Telegram */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                      {req.userName ? req.userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.userName || "Student"}</span>
                        <span className="text-xs text-sky-400 font-mono bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                          {req.telegramUsername}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isApproved ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          isPending ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse" :
                          "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
                        <span>Email: <strong className="text-slate-300">{req.userEmail}</strong></span>
                        <span>•</span>
                        <span>
                          UID: <strong className="text-amber-300 select-all">{reqUid}</strong>
                          <button 
                            onClick={() => handleCopy(reqUid, `uid-${req.id}`)}
                            className="ml-1 text-[10px] text-slate-500 hover:text-amber-400 underline"
                          >
                            {copiedUid === `uid-${req.id}` ? "Copied" : "Copy"}
                          </button>
                        </span>
                        <span>•</span>
                        <span>Plan: <strong className="text-slate-300">{req.planName || (req as any).planId || "Premium VIP"}</strong></span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : (req as any).requestedAt ? new Date((req as any).requestedAt).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVerifyFromRequestList(req, "rejected")}
                          disabled={processingId === req.id}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerifyFromRequestList(req, "approved")}
                          disabled={processingId === req.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve VIP Access</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified by {req.approvedBy || (req as any).reviewedBy || "Admin"}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyFromRequestList(req, "rejected")}
                          disabled={processingId === req.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs transition cursor-pointer"
                          title="Revoke access"
                        >
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVerifyFromRequestList(req, "approved")}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                        >
                          Re-Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default TelegramVerificationAdminTab;
