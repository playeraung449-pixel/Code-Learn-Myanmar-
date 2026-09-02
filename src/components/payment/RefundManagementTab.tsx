import React, { useState, useMemo } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  DollarSign,
  ShieldAlert,
  User,
  ExternalLink
} from "lucide-react";
import { RefundRequest, UserProfile } from "../../types";

interface RefundManagementTabProps {
  refundRequests: RefundRequest[];
  adminUser: UserProfile;
  onApproveRefund: (refundId: string, adminNote: string, premiumAction: "cancelled" | "remain_active" | "adjusted") => Promise<void>;
  onRejectRefund: (refundId: string, adminNote: string) => Promise<void>;
  onRefreshData: () => void;
}

export const RefundManagementTab: React.FC<RefundManagementTabProps> = ({
  refundRequests,
  adminUser,
  onApproveRefund,
  onRejectRefund,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  const [decisionMode, setDecisionMode] = useState<"view" | "approve" | "reject">("view");
  const [adminNote, setAdminNote] = useState("");
  const [premiumAction, setPremiumAction] = useState<"cancelled" | "remain_active" | "adjusted">("cancelled");
  const [processing, setProcessing] = useState(false);

  const filteredRefunds = useMemo(() => {
    return refundRequests.filter(r => {
      const matchSearch =
        (r.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.refundId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.requestId || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refundRequests, searchQuery, statusFilter]);

  const handleOpenReview = (refund: RefundRequest, mode: "view" | "approve" | "reject" = "view") => {
    setSelectedRefund(refund);
    setDecisionMode(mode);
    setAdminNote(refund.adminNote || "");
    setPremiumAction(refund.premiumAction || "cancelled");
  };

  const handleExecuteApprove = async () => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      await onApproveRefund(selectedRefund.refundId, adminNote, premiumAction);
      setSelectedRefund(null);
      onRefreshData();
    } catch (err: any) {
      alert("Approval failed: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteReject = async () => {
    if (!selectedRefund) return;
    if (!adminNote.trim()) {
      alert("Please provide reason for rejection");
      return;
    }
    setProcessing(true);
    try {
      await onRejectRefund(selectedRefund.refundId, adminNote);
      setSelectedRefund(null);
      onRefreshData();
    } catch (err: any) {
      alert("Rejection failed: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = refundRequests.filter(r => r.status === "requested" || r.status === "under_review").length;
  const approvedTotal = refundRequests
    .filter(r => r.status === "approved" || r.status === "completed")
    .reduce((acc, curr) => acc + (curr.refundAmountMMK || 0), 0);

  return (
    <div className="space-y-6">
      {/* QUICK SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Pending Refund Claims</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-400/80">Awaiting Action</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Approved Refunds</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {refundRequests.filter(r => r.status === "approved" || r.status === "completed").length}
            </span>
            <span className="text-[10px] text-emerald-400/80">Processed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Total Refund Volume</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-200 font-mono">{approvedTotal.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">MMK</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Fraud Flagged Requests</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-400 font-mono">
              {refundRequests.filter(r => r.fraudFlagged).length}
            </span>
            <span className="text-[10px] text-red-400/80">Flagged</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student, email, refund ID, txn ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Refund Statuses</option>
          <option value="requested">Pending / Requested ({pendingCount})</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* REFUNDS TABLE */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Refund ID & Reason</th>
                <th className="py-3 px-4">Amount (MMK)</th>
                <th className="py-3 px-4">Date Requested</th>
                <th className="py-3 px-4">Fraud Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Refund တောင်းဆိုမှု မှတ်တမ်း မရှိပါ
                  </td>
                </tr>
              ) : (
                filteredRefunds.map(ref => {
                  const isPending = ref.status === "requested" || ref.status === "under_review";
                  return (
                    <tr key={ref.id || ref.refundId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-200">{ref.userName || "Student"}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{ref.userEmail}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-mono text-amber-400 font-bold">{ref.refundId}</p>
                        <p className="text-slate-300 truncate mt-0.5">{ref.reason}</p>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {ref.refundAmountMMK?.toLocaleString()} MMK
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {new Date(ref.requestedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      <td className="py-3 px-4">
                        {ref.fraudFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Risk Flagged</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Normal</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ref.status === "approved" || ref.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : isPending
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReview(ref, "view")}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                            title="Inspect Refund"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenReview(ref, "approve")}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(ref, "reject")}
                                className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs"
                              >
                                Reject
                              </button>
                            </>
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
      </div>

      {/* INSPECT / DECISION MODAL */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>Refund Claim Review ({selectedRefund.refundId})</span>
              </h3>
              <button
                onClick={() => setSelectedRefund(null)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* DETAILS */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px]">Student</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedRefund.userName} ({selectedRefund.userEmail})</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 text-[10px]">Claim Amount</span>
                  <p className="font-bold text-amber-400 font-mono mt-0.5">
                    {selectedRefund.refundAmountMMK?.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px]">Refund Reason & Explanation</span>
                <p className="font-semibold text-slate-200">{selectedRefund.reason}</p>
                <p className="text-slate-400 text-[11px] mt-1">{selectedRefund.description || "No further details provided."}</p>
              </div>

              {selectedRefund.fraudFlagged && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Fraud / Duplicate Warning Flag</p>
                    <p className="text-[11px] mt-0.5">{selectedRefund.fraudReason || "Multiple refund claims detected."}</p>
                  </div>
                </div>
              )}

              {/* ACTION SELECTION */}
              {decisionMode === "approve" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Refund & Process Payout</span>
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student Premium Status Action</label>
                    <select
                      value={premiumAction}
                      onChange={e => setPremiumAction(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="cancelled">Revoke / Cancel Premium Access Immediately</option>
                      <option value="remain_active">Keep Active (Goodwill / Partial refund)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Admin Audit Notes</label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="e.g. Refunded 25,000 MMK via KPay Ref #..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {decisionMode === "reject" && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                  <p className="font-bold text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>Reject Refund Claim</span>
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rejection Reason to Student *</label>
                    <textarea
                      rows={2}
                      required
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Explain why this claim cannot be refunded..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionMode("view")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    decisionMode === "view" ? "bg-slate-800 text-slate-200" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  View Only
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionMode("reject")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    decisionMode === "reject" ? "bg-red-500/20 text-red-300" : "text-slate-400 hover:text-red-300"
                  }`}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionMode("approve")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    decisionMode === "approve" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  Approve
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRefund(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>

                {decisionMode === "approve" && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleExecuteApprove}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {processing ? "Approving..." : "Confirm Refund Approval"}
                  </button>
                )}

                {decisionMode === "reject" && (
                  <button
                    type="button"
                    disabled={processing || !adminNote.trim()}
                    onClick={handleExecuteReject}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {processing ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
