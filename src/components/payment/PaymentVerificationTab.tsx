import React, { useState, useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  Send,
  HelpCircle,
  RotateCw,
  ZoomIn,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { PaymentRequest, UserProfile, AdminPremiumPlan } from "../../types";

interface PaymentVerificationTabProps {
  paymentRequests: PaymentRequest[];
  allUsers: UserProfile[];
  plans: AdminPremiumPlan[];
  adminUser: UserProfile;
  onApprovePayment: (requestId: string, uid: string, planId: string, internalNote?: string) => Promise<void>;
  onRejectPayment: (requestId: string, uid: string, reason: string, internalNote?: string) => Promise<void>;
  onRequestMoreInfo: (requestId: string, uid: string, note: string) => Promise<void>;
  onRefreshData: () => void;
}

export const PaymentVerificationTab: React.FC<PaymentVerificationTabProps> = ({
  paymentRequests,
  allUsers,
  plans,
  adminUser,
  onApprovePayment,
  onRejectPayment,
  onRequestMoreInfo,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);

  // Verification action states
  const [actionType, setActionType] = useState<"view" | "approve" | "reject" | "info">("view");
  const [rejectionReason, setRejectionReason] = useState("ငွေလွှဲပြေစာ မပြည့်စုံပါ သို့မဟုတ် Transaction ID ရှာမတွေ့ပါ");
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [infoRequestNote, setInfoRequestNote] = useState("ကျေးဇူးပြု၍ Transaction History မျက်နှာပြင် အပြည့်အစုံကို ပြန်လည် ပေးပို့ပေးပါ ခင်ဗျာ။");
  const [internalAdminNote, setInternalAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // Screenshot viewer controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Find user details for selected request
  const requestUser = useMemo(() => {
    if (!selectedRequest) return null;
    return allUsers.find(u => u.uid === selectedRequest.uid || u.email === selectedRequest.userEmail);
  }, [selectedRequest, allUsers]);

  // Duplicate slip detection
  const duplicateRequests = useMemo(() => {
    if (!selectedRequest?.transactionRef) return [];
    return paymentRequests.filter(
      p =>
        p.transactionRef &&
        p.transactionRef.toLowerCase() === selectedRequest.transactionRef?.toLowerCase() &&
        p.requestId !== selectedRequest.requestId
    );
  }, [selectedRequest, paymentRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return paymentRequests.filter(req => {
      const matchSearch =
        (req.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.requestId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.transactionRef || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || req.status === statusFilter;
      const matchMethod = methodFilter === "all" || req.paymentMethod?.toLowerCase().includes(methodFilter.toLowerCase());

      return matchSearch && matchStatus && matchMethod;
    });
  }, [paymentRequests, searchQuery, statusFilter, methodFilter]);

  const handleOpenReview = (req: PaymentRequest, mode: "view" | "approve" | "reject" | "info" = "view") => {
    setSelectedRequest(req);
    setActionType(mode);
    setZoomLevel(1);
    setRotation(0);
    setCustomRejectNote("");
    setInternalAdminNote(req.notes || "");
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await onApprovePayment(
        selectedRequest.requestId,
        selectedRequest.uid,
        selectedRequest.planId,
        internalAdminNote
      );
      setSelectedRequest(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to approve payment: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    const finalReason = customRejectNote.trim()
      ? `${rejectionReason}: ${customRejectNote.trim()}`
      : rejectionReason;

    setProcessing(true);
    try {
      await onRejectPayment(
        selectedRequest.requestId,
        selectedRequest.uid,
        finalReason,
        internalAdminNote
      );
      setSelectedRequest(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to reject payment: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedRequest) return;
    if (!infoRequestNote.trim()) {
      alert("Please provide instructions for the student");
      return;
    }
    setProcessing(true);
    try {
      await onRequestMoreInfo(
        selectedRequest.requestId,
        selectedRequest.uid,
        infoRequestNote
      );
      setSelectedRequest(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to send information request: " + (err?.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard: " + text);
  };

  const pendingCount = paymentRequests.filter(p => p.status === "pending").length;
  const infoReqCount = paymentRequests.filter(p => p.status === "info_requested").length;

  return (
    <div className="space-y-6">
      {/* QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Pending Verification</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-400/80">Require Review</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Info Requested</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-sky-400 font-mono">{infoReqCount}</span>
            <span className="text-[10px] text-sky-400/80">Waiting Student</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Approved Payments</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {paymentRequests.filter(p => p.status === "approved").length}
            </span>
            <span className="text-[10px] text-emerald-400/80">Completed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Rejected / Cancelled</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-red-400 font-mono">
              {paymentRequests.filter(p => p.status === "rejected" || p.status === "cancelled").length}
            </span>
            <span className="text-[10px] text-red-400/80">Denied</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-payments"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, transaction ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* STATUS FILTER */}
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only ({pendingCount})</option>
            <option value="info_requested">Info Requested ({infoReqCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* METHOD FILTER */}
          <select
            id="select-method-filter"
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Methods</option>
            <option value="kpay">KBZPay (KPay)</option>
            <option value="wave">Wave Money</option>
            <option value="cb">CB Pay / CB Bank</option>
            <option value="aya">AYA Pay</option>
            <option value="coins">Coins</option>
          </select>
        </div>
      </div>

      {/* REQUESTS LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student & Account</th>
                <th className="py-3 px-4">Plan & Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    စစ်ဆေးရန် ငွေလွှဲမှတ်တမ်း မတွေ့ရှိပါ
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const isPending = req.status === "pending";
                  const isInfoReq = req.status === "info_requested";

                  return (
                    <tr
                      key={req.id || req.requestId}
                      id={`payment-row-${req.requestId}`}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPending ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-200">{req.userName || "Student"}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{req.userEmail}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="font-semibold text-amber-400 capitalize">
                            {req.planId?.replace("_", " ")}
                          </span>
                          <p className="text-slate-300 font-mono font-bold mt-0.5">
                            {req.amountMMK ? `${req.amountMMK.toLocaleString()} MMK` : "Free / Coins"}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                          {req.paymentMethod || "Direct Transfer"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        {req.transactionRef ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {req.transactionRef}
                            </span>
                            <button
                              onClick={() => copyToClipboard(req.transactionRef || "")}
                              className="text-slate-400 hover:text-slate-200"
                              title="Copy Ref"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {new Date(req.submittedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : req.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : req.status === "info_requested"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {req.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === "pending" && <Clock className="w-3 h-3" />}
                          {req.status === "info_requested" && <HelpCircle className="w-3 h-3" />}
                          {req.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-view-${req.requestId}`}
                            onClick={() => handleOpenReview(req, "view")}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
                            title="Inspect Slip & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                id={`btn-quick-approve-${req.requestId}`}
                                onClick={() => handleOpenReview(req, "approve")}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-emerald-500/10"
                              >
                                Approve
                              </button>
                              <button
                                id={`btn-quick-reject-${req.requestId}`}
                                onClick={() => handleOpenReview(req, "reject")}
                                className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isInfoReq && (
                            <button
                              onClick={() => handleOpenReview(req, "approve")}
                              className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs"
                            >
                              Approve Now
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
      </div>

      {/* DETAILED VERIFICATION & AUDIT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-6 shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Payment Verification & Audit</span>
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ID: {selectedRequest.requestId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted by {selectedRequest.userName} on {new Date(selectedRequest.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* LEFT COLUMN: SCREENSHOT & IMAGE CONTROLS */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Transfer Slip / Receipt
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : 1))}
                      className="p-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                      title="Zoom"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      className="p-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                      title="Rotate"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 min-h-[320px] max-h-[420px] flex items-center justify-center overflow-hidden relative">
                  {selectedRequest.screenshot ? (
                    <img
                      src={selectedRequest.screenshot}
                      alt="Payment Receipt Slip"
                      className="max-h-[380px] max-w-full object-contain rounded transition-transform duration-200"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                      }}
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-500 text-xs">
                      <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                      <p>ပြေစာ ဓာတ်ပုံ ပူးတွဲမပါရှိပါ (Coins/Direct Activation)</p>
                    </div>
                  )}
                </div>

                {/* DUPLICATE WARNING */}
                {duplicateRequests.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Duplicate Slip / Ref Detected!</p>
                      <p className="text-[11px] text-red-400/90 mt-0.5">
                        ဤ Transaction Ref ({selectedRequest.transactionRef}) အား အခြားငွေလွှဲတောင်းဆိုမှုတွင် အသုံးပြုခဲ့ပြီးဖြစ်ပါသည်။ ({duplicateRequests.length} matching entries found)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: METADATA & DECISION CONTROLS */}
              <div className="md:col-span-6 space-y-4">
                {/* STUDENT PROFILE CARD */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Info</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      requestUser?.isPremium ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {requestUser?.isPremium ? "Active Premium Member" : "Free Member"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                      {selectedRequest.userName ? selectedRequest.userName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm">{selectedRequest.userName}</p>
                      <p className="text-xs text-slate-400 font-mono">{selectedRequest.userEmail}</p>
                      <p className="text-[10px] text-slate-500 font-mono">UID: {selectedRequest.uid}</p>
                    </div>
                  </div>
                </div>

                {/* TRANSACTION METRICS */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-semibold">Requested Plan</span>
                    <p className="font-bold text-amber-400 mt-0.5 capitalize">{selectedRequest.planId?.replace("_", " ")}</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-semibold">Payment Amount</span>
                    <p className="font-bold text-slate-100 font-mono mt-0.5">
                      {selectedRequest.amountMMK ? `${selectedRequest.amountMMK.toLocaleString()} MMK` : "Coins Exchange"}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-semibold">Payment Method</span>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedRequest.paymentMethod || "N/A"}</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-semibold">Transaction Ref</span>
                    <p className="font-bold text-slate-200 font-mono mt-0.5 truncate">{selectedRequest.transactionRef || "N/A"}</p>
                  </div>
                </div>

                {/* ACTION FORMS */}
                {actionType === "approve" && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Payment & Activate Membership</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Approval will immediately grant Premium access to {selectedRequest.userName}, generate a verifiable Membership ID, and stack remaining days onto their active account.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Internal Note (Optional)</label>
                      <input
                        type="text"
                        value={internalAdminNote}
                        onChange={e => setInternalAdminNote(e.target.value)}
                        placeholder="e.g. Verified via KPay Inbox ref #..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {actionType === "reject" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Reject Payment Request</span>
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason for Rejection</label>
                      <select
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="ငွေလွှဲပြေစာ မပြည့်စုံပါ သို့မဟုတ် Transaction ID ရှာမတွေ့ပါ">ငွေလွှဲပြေစာ မပြည့်စုံပါ သို့မဟုတ် Transaction ID ရှာမတွေ့ပါ</option>
                        <option value="ငွေလွှဲပမာဏ မကိုက်ညီပါ (Amount Mismatch)">ငွေလွှဲပမာဏ မကိုက်ညီပါ (Amount Mismatch)</option>
                        <option value="ပြေစာအတု သို့မဟုတ် အခြားသူ၏ ပြေစာဖြစ်နေပါသည် (Fraudulent Slip)">ပြေစာအတု သို့မဟုတ် အခြားသူ၏ ပြေစာဖြစ်နေပါသည် (Fraudulent Slip)</option>
                        <option value="ငွေလွှဲချိန် သက်တမ်းလွန်နေပါသည် (Expired Slip)">ငွေလွှဲချိန် သက်တမ်းလွန်နေပါသည် (Expired Slip)</option>
                        <option value="အခြား အကြောင်းပြချက် (Custom Reason)">အခြား အကြောင်းပြချက် (Custom Reason)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Detailed Explanation to Student</label>
                      <textarea
                        rows={2}
                        value={customRejectNote}
                        onChange={e => setCustomRejectNote(e.target.value)}
                        placeholder="ကျောင်းသားအား အကြောင်းပြချက် ရှင်းပြချက် ထည့်သွင်းပါ..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}

                {actionType === "info" && (
                  <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Request More Information from Student</span>
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Message to Student</label>
                      <textarea
                        rows={3}
                        value={infoRequestNote}
                        onChange={e => setInfoRequestNote(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActionType("view")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    actionType === "view" ? "bg-slate-800 text-slate-200" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("info")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    actionType === "info" ? "bg-sky-500/20 text-sky-300" : "text-slate-400 hover:text-sky-300"
                  }`}
                >
                  Request Info
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("reject")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    actionType === "reject" ? "bg-red-500/20 text-red-300" : "text-slate-400 hover:text-red-300"
                  }`}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("approve")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    actionType === "approve" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  Approve
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>

                {actionType === "approve" && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleApprove}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {processing ? "Approving..." : "Confirm Approval"}
                  </button>
                )}

                {actionType === "reject" && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleReject}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {processing ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                )}

                {actionType === "info" && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleRequestInfo}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50"
                  >
                    {processing ? "Sending..." : "Send Info Request"}
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
