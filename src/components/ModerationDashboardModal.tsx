/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldAlert, 
  Flag, 
  Check, 
  Trash2, 
  EyeOff, 
  Eye, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Users, 
  Lock, 
  Unlock, 
  RefreshCw,
  Send,
  ShieldCheck,
  Search,
  MessageSquare
} from "lucide-react";
import { CommunityReport, ForumPost, UserModerationStatus, ModerationSettings } from "../types";
import { 
  getCommunityReports, 
  resolveCommunityReport, 
  getModerationSettings, 
  saveModerationSettings,
  createNotification 
} from "../lib/db";

interface ModerationDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: ForumPost[];
  onUpdatePosts: (updatedPosts: ForumPost[]) => void;
}

export default function ModerationDashboardModal({ 
  isOpen, 
  onClose, 
  posts, 
  onUpdatePosts 
}: ModerationDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "settings">("reports");
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Settings state
  const [settings, setSettings] = useState<ModerationSettings>({
    autoFilterProfanity: true,
    antiSpamEnabled: true,
    maxPostsPerTenMins: 3,
    blockSuspiciousLinks: true,
    plagiarismCheckPrompt: true
  });

  // User moderation mock state
  const [userStatuses, setUserStatuses] = useState<UserModerationStatus[]>([
    {
      uid: "seed-user-1",
      name: "Aung Aung (ကျောင်းသား)",
      email: "aung@codelearnmyanmar.edu.mm",
      status: "active",
      postingPrivilege: true,
      warningCount: 0
    },
    {
      uid: "seed-user-2",
      name: "Mya Mya (Developer)",
      email: "myamya@codelearnmyanmar.edu.mm",
      status: "active",
      postingPrivilege: true,
      warningCount: 0
    },
    {
      uid: "user-spam-test",
      name: "SpamBot99",
      email: "spambot@suspicious.com",
      status: "warned",
      postingPrivilege: true,
      warningCount: 2,
      lastActionReason: "Repeated spam links posted in forum"
    }
  ]);

  // Selected report action details
  const [adminReasonText, setAdminReasonText] = useState("");

  // Load reports & settings
  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const fetchedReports = await getCommunityReports();
        setReports(fetchedReports);

        const fetchedSettings = await getModerationSettings();
        if (fetchedSettings) setSettings(fetchedSettings);
      } catch (e) {
        console.error("Failed to load moderation data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const showMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  // Hide Post or Comment Action
  const handleHideContent = async (report: CommunityReport) => {
    const reason = adminReasonText || `ကွန်မြူနတီ စည်းကမ်းချက် (${report.reason}) နှင့် မညီညွတ်သဖြင့် ဝှက်ထားလိုက်ပါသည်။`;

    const updatedPosts = posts.map(p => {
      if (p.id === report.postId) {
        if (report.targetType === "post") {
          return { ...p, isHidden: true, hiddenReason: reason };
        } else {
          const updatedReplies = (p.replies || []).map(r => {
            if (r.id === report.targetId) {
              return { ...r, isHidden: true, hiddenReason: reason };
            }
            return r;
          });
          return { ...p, replies: updatedReplies };
        }
      }
      return p;
    });

    onUpdatePosts(updatedPosts);
    await resolveCommunityReport(report.id, "resolved", reason);
    setReports(reports.map(r => r.id === report.id ? { ...r, status: "resolved", adminNotes: reason } : r));

    // Transparent Notification Dispatch to Author
    await createNotification({
      title: "ကွန်မြူနတီ စည်းကမ်းထိန်းသိမ်းမှု အသိပေးချက်",
      titleMm: "ကွန်မြူနတီ စည်းကမ်းထိန်းသိမ်းမှု အသိပေးချက်",
      description: `သင်၏ ဆွေးနွေးချက်/အကြောင်းပြန်ချက် အား ဝှက်ထားလိုက်ပါသည်။ အကြောင်းရင်း: ${reason}`,
      descriptionMm: `သင်၏ ဆွေးနွေးချက်/အကြောင်းပြန်ချက် အား ဝှက်ထားလိုက်ပါသည်။ အကြောင်းရင်း: ${reason}`,
      category: "system",
      type: "feature_update",
      createdBy: "admin"
    });

    showMsg("အကြောင်းအရာအား ဝှက်ထားလိုက်ပြီး ရေးသားသူထံ အသိပေးချက် ပို့ဆောင်ပြီးပါပြီ။");
    setAdminReasonText("");
  };

  // Delete Content Action
  const handleDeleteContent = async (report: CommunityReport) => {
    if (!confirm("ဤ အကြောင်းအရာအား လုံးဝ ဖျက်ပစ်ရန် သေချာပါသလား။")) return;

    const reason = adminReasonText || `ကွန်မြူနတီ စည်းကမ်းချက် (${report.reason}) ချိုးဖောက်သဖြင့် ဖျက်ပစ်လိုက်ပါသည်။`;

    const updatedPosts = posts.map(p => {
      if (p.id === report.postId) {
        if (report.targetType === "post") {
          return null;
        } else {
          const updatedReplies = (p.replies || []).filter(r => r.id !== report.targetId);
          return { ...p, replies: updatedReplies };
        }
      }
      return p;
    }).filter(Boolean) as ForumPost[];

    onUpdatePosts(updatedPosts);
    await resolveCommunityReport(report.id, "resolved", reason);
    setReports(reports.map(r => r.id === report.id ? { ...r, status: "resolved", adminNotes: reason } : r));

    // Transparent Notification Dispatch
    await createNotification({
      title: "အကြောင်းအရာ ဖျက်ပစ်ခြင်း အသိပေးချက်",
      titleMm: "အကြောင်းအရာ ဖျက်ပစ်ခြင်း အသိပေးချက်",
      description: `သင်ရေးသားခဲ့သော အကြောင်းအရာအား ဖျက်ပစ်လိုက်ပါသည်။ အကြောင်းရင်း: ${reason}`,
      descriptionMm: `သင်ရေးသားခဲ့သော အကြောင်းအရာအား ဖျက်ပစ်လိုက်ပါသည်။ အကြောင်းရင်း: ${reason}`,
      category: "system",
      type: "feature_update",
      createdBy: "admin"
    });

    showMsg("အကြောင်းအရာအား ဖျက်ပစ်ပြီးပါပြီ။");
    setAdminReasonText("");
  };

  // Dismiss Report
  const handleDismissReport = async (reportId: string) => {
    await resolveCommunityReport(reportId, "dismissed", "မိုဒရေတာမှ စစ်ဆေးပြီး ပုံမှန်အဖြစ် သတ်မှတ်လိုက်ပါသည်။");
    setReports(reports.map(r => r.id === reportId ? { ...r, status: "dismissed" } : r));
    showMsg("တိုင်ကြားချက်အား ပယ်ဖျက်လိုက်ပါပြီ။");
  };

  // Issue User Warning or Suspension
  const handleUserAction = async (uid: string, action: "warn" | "suspend" | "ban" | "revoke_privilege" | "restore") => {
    const reason = adminReasonText || "ကွန်မြူနတီ စည်းကမ်းချက်များ မလိုက်နာမှုကြောင့် အရေးယူဆောင်ရွက်ခြင်း ဖြစ်ပါသည်။";

    const updatedUsers = userStatuses.map(u => {
      if (u.uid === uid) {
        if (action === "warn") {
          return { ...u, status: "warned" as const, warningCount: u.warningCount + 1, lastActionReason: reason };
        } else if (action === "suspend") {
          return { ...u, status: "suspended" as const, postingPrivilege: false, lastActionReason: reason };
        } else if (action === "ban") {
          return { ...u, status: "banned" as const, postingPrivilege: false, lastActionReason: reason };
        } else if (action === "revoke_privilege") {
          return { ...u, postingPrivilege: false, lastActionReason: reason };
        } else if (action === "restore") {
          return { ...u, status: "active" as const, postingPrivilege: true, lastActionReason: "အရေးယူမှုကို ပယ်ဖျက်လိုက်ပါပြီ" };
        }
      }
      return u;
    });

    setUserStatuses(updatedUsers);

    // Transparent Notification
    await createNotification({
      title: "အကောင့် စည်းကမ်းထိန်းသိမ်းမှု အသိပေးချက်",
      titleMm: "အကောင့် စည်းကမ်းထိန်းသိမ်းမှု အသိပေးချက်",
      description: `မိုဒရေတာအဖွဲ့မှ သင့်အကောင့်အား အရေးယူဆောင်ရွက်ချက် ပြုလုပ်ခဲ့ပါသည်။ အကြောင်းရင်း: ${reason}`,
      descriptionMm: `မိုဒရေတာအဖွဲ့မှ သင့်အကောင့်အား အရေးယူဆောင်ရွက်ချက် ပြုလုပ်ခဲ့ပါသည်။ အကြောင်းရင်း: ${reason}`,
      category: "system",
      type: "security_announcement",
      createdBy: "admin"
    });

    showMsg("အသုံးပြုသူအား အရေးယူဆောင်ရွက်ပြီး အသိပေးချက် ပို့ပြီးပါပြီ။");
    setAdminReasonText("");
  };

  // Save Moderation Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveModerationSettings(settings);
    showMsg("မိုဒရေရှင်း ဆက်တင်များကို သိမ်းဆည်းလိုက်ပါပြီ! 🎉");
  };

  const pendingReports = reports.filter(r => r.status === "pending");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 text-left">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-4 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  မိုဒရေရှင်း မန်နေဂျာ (Community Moderation Center)
                </h3>
                {pendingReports.length > 0 && (
                  <span className="bg-rose-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pendingReports.length} Pending Reports
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                တိုင်ကြားချက်များ စစ်ဆေးခြင်း၊ စည်းကမ်းထိန်းသိမ်းခြင်းနှင့် အလိုအလျောက် Filter များ
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

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "reports"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>တိုင်ကြားချက်များ ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "users"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>အသုံးပြုသူ ထိန်းသိမ်းရေး</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "settings"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>အလိုအလျောက် ဆက်တင်များ</span>
          </button>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: REPORTS */}
        {activeTab === "reports" && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 scrollbar-thin">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1.5 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>လုံခြုံရေး: တိုင်ကြားသူ ကျောင်းသား၏ အချက်အလက်ကို လျှို့ဝှက်ကာကွယ်ထားပါသည် (Confidential Token Only)</span>
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-slate-400 font-mono">
                တိုင်ကြားချက်များကို ရယူနေပါသည်...
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 text-xs ${
                      rep.status === "pending"
                        ? "bg-rose-500/5 border-rose-500/20 dark:bg-rose-950/10"
                        : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20">
                          {rep.reason}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {rep.targetType.toUpperCase()} • {rep.timestamp ? new Date(rep.timestamp).toLocaleString() : 'Just now'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                          🔒 {rep.reporterAnonymousId || "Confidential Token #8a2f"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          rep.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                          rep.status === "resolved" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {rep.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {rep.contentTitle}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-sans">
                        "{rep.contentSnippet}"
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        ရေးသားသူ: {rep.contentAuthor}
                      </span>
                    </div>

                    {/* Admin Action Bar */}
                    {rep.status === "pending" && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <input
                          type="text"
                          value={adminReasonText}
                          onChange={(e) => setAdminReasonText(e.target.value)}
                          placeholder="အရေးယူဆောင်ရွက်ချက် အကြောင်းပြချက် ရေးရန် (အသုံးပြုသူထံ အလိုအလျောက် သတိပေးစာ ပို့ပါမည်)..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-purple-500"
                        />

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => handleHideContent(rep)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>အကြောင်းအရာ ဝှက်မည် (Hide)</span>
                          </button>

                          <button
                            onClick={() => handleDeleteContent(rep)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ဖျက်ပစ်မည် (Delete)</span>
                          </button>

                          <button
                            onClick={() => handleDismissReport(rep.id)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 transition-all cursor-pointer"
                          >
                            ပယ်ဖျက်မည် (Dismiss)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                စစ်ဆေးရန် တိုင်ကြားချက် မရှိသေးပါဗျာ။
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 scrollbar-thin">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="ကျောင်းသား အမည် သို့မဟုတ် အီးမေးလ်ဖြင့် ရှာဖွေရန်..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {userStatuses
                .filter(u => u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || (u.email && u.email.toLowerCase().includes(searchUserQuery.toLowerCase())))
                .map((usr) => (
                  <div
                    key={usr.uid}
                    className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{usr.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            usr.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                            usr.status === "warned" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                          }`}>
                            {usr.status.toUpperCase()}
                          </span>
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">{usr.email}</span>
                      </div>

                      <div className="text-right font-mono text-[11px] text-slate-400">
                        <span>သတိပေးချက်: {usr.warningCount} ကြိမ်</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUserAction(usr.uid, "warn")}
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold hover:bg-amber-500/20 cursor-pointer"
                      >
                        သတိပေးစာ ပို့မည် (Warn)
                      </button>

                      <button
                        onClick={() => handleUserAction(usr.uid, "suspend")}
                        className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-bold hover:bg-rose-500/20 cursor-pointer"
                      >
                        ယာယီ ပိတ်မည် (Suspend)
                      </button>

                      {usr.status !== "active" && (
                        <button
                          onClick={() => handleUserAction(usr.uid, "restore")}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg font-bold hover:bg-emerald-500/20 cursor-pointer"
                        >
                          ပုံမှန်ပြန်ဖွင့်ပေးမည် (Restore)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATED SETTINGS */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
            
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <h5 className="font-bold text-slate-900 dark:text-white">
                  ရိုင်းစိုင်းစကားလုံး အလိုအလျောက် စစ်ဆေးခြင်း (Profanity Auto-Filter)
                </h5>
                <p className="text-slate-500 text-[11px]">
                  မသင့်လျော်သော စကားလုံးနှင့် ရိုင်းစိုင်းသော စာသားများပါဝင်ပါက တင်ခွင့်မပြုဘဲ အလိုအလျောက် သတိပေးပါမည်။
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoFilterProfanity}
                onChange={(e) => setSettings({ ...settings, autoFilterProfanity: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <h5 className="font-bold text-slate-900 dark:text-white">
                  Anti-Spam တားဆီးမှုစနစ် (Anti-Spam Detection)
                </h5>
                <p className="text-slate-500 text-[11px]">
                  ထပ်ခါထပ်ခါ စာပို့ခြင်း၊ Mass Posting နှင့် Spam စာသားများကို အလိုအလျောက် ဖမ်းဆီးမည်။
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.antiSpamEnabled}
                onChange={(e) => setSettings({ ...settings, antiSpamEnabled: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <h5 className="font-bold text-slate-900 dark:text-white">
                  မသင်္ကာဖွယ်ရာ လင့်ခ်များ ပိတ်ဆို့ခြင်း (Block Suspicious External Links)
                </h5>
                <p className="text-slate-500 text-[11px]">
                  Bit.ly သို့မဟုတ် မသမာသော လင့်ခ်များ ပါဝင်ပါက စနစ်မှ တားဆီးပါမည်။
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.blockSuspiciousLinks}
                onChange={(e) => setSettings({ ...settings, blockSuspiciousLinks: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              ဆက်တင်များကို သိမ်းဆည်းမည် (Save Settings)
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
