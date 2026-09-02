import React, { useState, useMemo } from "react";
import {
  Crown,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  MoreVertical,
  UserCheck,
  UserX,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { UserProfile, AdminPremiumPlan, MembershipHistoryRecord } from "../../types";

interface PremiumMembershipsTabProps {
  users: UserProfile[];
  plans: AdminPremiumPlan[];
  membershipHistory: MembershipHistoryRecord[];
  adminUser: UserProfile;
  onManualActivate: (targetUser: UserProfile, planId: string, customDays: number, reason: string) => Promise<void>;
  onExtendPremium: (targetUser: UserProfile, additionalDays: number, reason: string) => Promise<void>;
  onCancelPremium: (targetUser: UserProfile, reason: string) => Promise<void>;
  onRefreshData: () => void;
}

export const PremiumMembershipsTab: React.FC<PremiumMembershipsTabProps> = ({
  users,
  plans,
  membershipHistory,
  adminUser,
  onManualActivate,
  onExtendPremium,
  onCancelPremium,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active_premium" | "expired" | "lifetime" | "monthly" | "six_months">("active_premium");

  // Modals & Action states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalMode, setModalMode] = useState<"activate" | "extend" | "cancel" | "history" | null>(null);

  // Manual Activate inputs
  const [selectedPlanId, setSelectedPlanId] = useState("monthly");
  const [customDays, setCustomDays] = useState(30);
  const [activateReason, setActivateReason] = useState("Manual Customer Support / Promo Winner");

  // Extend inputs
  const [extendDays, setExtendDays] = useState(30);
  const [extendReason, setExtendReason] = useState("Extension granted by Admin");

  // Cancel inputs
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmed, setCancelConfirmed] = useState(false);

  const [processing, setProcessing] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const now = new Date();
    return users.filter(u => {
      const matchSearch =
        (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.uid || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      const isPrem = !!u.isPremium;
      const isExpired = u.premiumUntil && new Date(u.premiumUntil) < now;
      const isLife = u.premiumPlan === "lifetime" || (u.premiumUntil && new Date(u.premiumUntil).getFullYear() > 2090);

      if (filterType === "active_premium") {
        return isPrem && !isExpired;
      }
      if (filterType === "expired") {
        return !isPrem || isExpired;
      }
      if (filterType === "lifetime") {
        return isPrem && isLife;
      }
      if (filterType === "monthly") {
        return isPrem && u.premiumPlan === "monthly";
      }
      if (filterType === "six_months") {
        return isPrem && u.premiumPlan === "six_months";
      }

      return true; // all
    });
  }, [users, searchQuery, filterType]);

  const activePremiumCount = useMemo(() => {
    const now = new Date();
    return users.filter(u => u.isPremium && (!u.premiumUntil || new Date(u.premiumUntil) >= now)).length;
  }, [users]);

  const lifetimeCount = useMemo(() => {
    return users.filter(u => u.isPremium && (u.premiumPlan === "lifetime" || (u.premiumUntil && new Date(u.premiumUntil).getFullYear() > 2090))).length;
  }, [users]);

  const handleOpenAction = (u: UserProfile, mode: "activate" | "extend" | "cancel" | "history") => {
    setSelectedUser(u);
    setModalMode(mode);
    setCancelConfirmed(false);
    setCancelReason("");
    setExtendDays(30);
    setSelectedPlanId("monthly");
  };

  const handleExecuteActivate = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await onManualActivate(selectedUser, selectedPlanId, customDays, activateReason);
      setModalMode(null);
      setSelectedUser(null);
      onRefreshData();
    } catch (err: any) {
      alert("Activation failed: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteExtend = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await onExtendPremium(selectedUser, extendDays, extendReason);
      setModalMode(null);
      setSelectedUser(null);
      onRefreshData();
    } catch (err: any) {
      alert("Extension failed: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteCancel = async () => {
    if (!selectedUser) return;
    if (!cancelReason.trim()) {
      alert("Cancellation reason is required");
      return;
    }
    setProcessing(true);
    try {
      await onCancelPremium(selectedUser, cancelReason);
      setModalMode(null);
      setSelectedUser(null);
      onRefreshData();
    } catch (err: any) {
      alert("Cancellation failed: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  // User specific membership logs
  const userHistoryLogs = useMemo(() => {
    if (!selectedUser) return [];
    return membershipHistory.filter(
      h => h.uid === selectedUser.uid || h.userEmail === selectedUser.email
    );
  }, [selectedUser, membershipHistory]);

  return (
    <div className="space-y-6">
      {/* QUICK STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Active Premium Members</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400 font-mono">{activePremiumCount}</span>
            <span className="text-[10px] text-amber-400/80">Active</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Lifetime Members</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{lifetimeCount}</span>
            <span className="text-[10px] text-emerald-400/80">Permanent VIP</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-200 font-mono">{users.length}</span>
            <span className="text-[10px] text-slate-400">Total</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Conversion Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-sky-400 font-mono">
              {users.length > 0 ? ((activePremiumCount / users.length) * 100).toFixed(1) : "0"}%
            </span>
            <span className="text-[10px] text-sky-400/80">Paid Ratio</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-memberships"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student name, email, UID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "active_premium", label: `Active Premium (${activePremiumCount})` },
            { id: "lifetime", label: `Lifetime (${lifetimeCount})` },
            { id: "monthly", label: "Monthly" },
            { id: "six_months", label: "6 Months" },
            { id: "expired", label: "Free / Expired" },
            { id: "all", label: "All Users" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MEMBERS TABLE */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Activated At</th>
                <th className="py-3 px-4">Expiration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Membership Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    ကျောင်းသား အကောင့် မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const now = new Date();
                  const isPrem = !!u.isPremium;
                  const isExpired = u.premiumUntil && new Date(u.premiumUntil) < now;
                  const isLife = u.premiumPlan === "lifetime" || (u.premiumUntil && new Date(u.premiumUntil).getFullYear() > 2090);

                  return (
                    <tr key={u.uid || u.email} id={`member-row-${u.uid}`} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{u.name || "Student"}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isPrem ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 capitalize">
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isLife ? "Lifetime Access" : u.premiumPlan?.replace("_", " ") || "Standard Premium"}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Free Tier</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {u.premiumActivatedAt
                          ? new Date(u.premiumActivatedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : "N/A"}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {isLife ? (
                          <span className="text-emerald-400 font-bold">Never Expires (Lifetime)</span>
                        ) : u.premiumUntil ? (
                          <span className={isExpired ? "text-red-400" : "text-slate-300"}>
                            {new Date(u.premiumUntil).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPrem && !isExpired
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : isExpired
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isPrem && !isExpired ? "Active Member" : isExpired ? "Expired" : "Free Member"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPrem && !isExpired ? (
                            <>
                              <button
                                onClick={() => handleOpenAction(u, "extend")}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
                                title="Extend Validity"
                              >
                                Extend
                              </button>
                              <button
                                onClick={() => handleOpenAction(u, "cancel")}
                                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold"
                                title="Revoke Premium"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenAction(u, "activate")}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/10"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenAction(u, "history")}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
                            title="Membership History Logs"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION MODALS */}
      {modalMode && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {modalMode === "activate" && <UserCheck className="w-5 h-5 text-emerald-400" />}
                {modalMode === "extend" && <RotateCcw className="w-5 h-5 text-amber-400" />}
                {modalMode === "cancel" && <UserX className="w-5 h-5 text-red-400" />}
                {modalMode === "history" && <History className="w-5 h-5 text-sky-400" />}
                <span>
                  {modalMode === "activate" && "Manual Premium Activation"}
                  {modalMode === "extend" && "Extend Membership Validity"}
                  {modalMode === "cancel" && "Revoke Premium Access"}
                  {modalMode === "history" && "Membership Audit Timeline"}
                </span>
              </h3>
              <button
                onClick={() => {
                  setModalMode(null);
                  setSelectedUser(null);
                }}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* USER CARD PREVIEW */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <p className="font-bold text-slate-100 text-sm">{selectedUser.name}</p>
                <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                <p className="text-[10px] text-slate-500 font-mono">UID: {selectedUser.uid}</p>
              </div>
            </div>

            {/* ACTIVATE BODY */}
            {modalMode === "activate" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Plan Preset</label>
                  <select
                    value={selectedPlanId}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedPlanId(val);
                      if (val === "monthly") setCustomDays(30);
                      else if (val === "six_months") setCustomDays(180);
                      else if (val === "lifetime") setCustomDays(36500);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="monthly">1 Month (30 Days)</option>
                    <option value="six_months">6 Months (180 Days)</option>
                    <option value="lifetime">Lifetime Access</option>
                    <option value="custom">Custom Duration Days</option>
                  </select>
                </div>

                {selectedPlanId === "custom" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={customDays}
                      onChange={e => setCustomDays(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Manual Activation</label>
                  <input
                    type="text"
                    required
                    value={activateReason}
                    onChange={e => setActivateReason(e.target.value)}
                    placeholder="e.g. Offline Payment / Winner / Scholarship..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* EXTEND BODY */}
            {modalMode === "extend" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Select Extension Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 30, label: "+30 Days" },
                      { days: 90, label: "+90 Days" },
                      { days: 180, label: "+180 Days" },
                      { days: 365, label: "+1 Year" }
                    ].map(item => (
                      <button
                        key={item.days}
                        type="button"
                        onClick={() => setExtendDays(item.days)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          extendDays === item.days
                            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Days (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={extendDays}
                    onChange={e => setExtendDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Extension</label>
                  <input
                    type="text"
                    value={extendReason}
                    onChange={e => setExtendReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* CANCEL BODY */}
            {modalMode === "cancel" && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>High-Risk Financial Action</span>
                  </p>
                  <p>
                    This will immediately revoke Premium access for {selectedUser.name}. They will lose access to premium lessons, Kibo AI priority, and sandbox features.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Revocation *</label>
                  <textarea
                    rows={2}
                    required
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="e.g. Refund issued / Terms Violation / Chargeback..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={cancelConfirmed}
                    onChange={e => setCancelConfirmed(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-red-500"
                  />
                  <span>I confirm that I want to revoke this student's Premium membership.</span>
                </label>
              </div>
            )}

            {/* HISTORY LOGS BODY */}
            {modalMode === "history" && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {userHistoryLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">ယခင် Membership မှတ်တမ်း မရှိပါ</p>
                ) : (
                  userHistoryLogs.map((log, idx) => (
                    <div key={log.id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 uppercase tracking-wide text-[10px]">
                          Action: {log.action.replace("_", " ")}
                        </span>
                        <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">Plan: {log.planId} | {log.reason || "No notes"}</p>
                      <p className="text-[10px] text-slate-400">Performed by: {log.performedBy}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalMode(null);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>

              {modalMode === "activate" && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleExecuteActivate}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {processing ? "Activating..." : "Grant Premium"}
                </button>
              )}

              {modalMode === "extend" && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleExecuteExtend}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {processing ? "Extending..." : `Extend (+${extendDays} Days)`}
                </button>
              )}

              {modalMode === "cancel" && (
                <button
                  type="button"
                  disabled={processing || !cancelConfirmed || !cancelReason.trim()}
                  onClick={handleExecuteCancel}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20 disabled:opacity-40"
                >
                  {processing ? "Revoking..." : "Confirm Revocation"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
