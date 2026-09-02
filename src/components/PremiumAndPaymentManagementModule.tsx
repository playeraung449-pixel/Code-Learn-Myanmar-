import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Crown,
  Users,
  Wallet,
  RotateCcw,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Bell,
  Send
} from "lucide-react";
import {
  PaymentRequest,
  RefundRequest,
  UserProfile,
  AdminPremiumPlan,
  AdminPaymentAccount,
  MembershipHistoryRecord,
  FinancialAuditRecord
} from "../types";
import {
  getAdminPremiumPlansFromDb,
  saveAdminPremiumPlanToDb,
  deleteAdminPremiumPlanFromDb,
  getAdminPaymentAccountsFromDb,
  saveAdminPaymentAccountToDb,
  deleteAdminPaymentAccountFromDb,
  getFinancialAuditLogsFromDb,
  addFinancialAuditLogToDb,
  getMembershipHistoryFromDb,
  addMembershipHistoryToDb,
  adminManualActivatePremium,
  adminExtendUserPremium,
  adminCancelUserPremium,
  approvePaymentRequestInDb,
  rejectPaymentRequestInDb,
  requestPaymentMoreInfoInDb,
  getPaymentRequestsFromDb,
  getRefundRequestsFromDb,
  approveRefundRequestInDb,
  rejectRefundRequestInDb
} from "../lib/db";

import { PaymentVerificationTab } from "./payment/PaymentVerificationTab";
import { PremiumPlansTab } from "./payment/PremiumPlansTab";
import { PremiumMembershipsTab } from "./payment/PremiumMembershipsTab";
import { PaymentAccountsTab } from "./payment/PaymentAccountsTab";
import { RefundManagementTab } from "./payment/RefundManagementTab";
import { FinancialAnalyticsTab } from "./payment/FinancialAnalyticsTab";
import { FinancialAuditLogsTab } from "./payment/FinancialAuditLogsTab";
import { TelegramVerificationAdminTab } from "./payment/TelegramVerificationAdminTab";

interface PremiumAndPaymentManagementModuleProps {
  adminUser: UserProfile;
  allUsers: UserProfile[];
  onRefreshAllUsers?: () => void;
  initialTab?: "verification" | "telegram" | "plans" | "memberships" | "accounts" | "refunds" | "analytics" | "audit" | string;
}

export const PremiumAndPaymentManagementModule: React.FC<PremiumAndPaymentManagementModuleProps> = ({
  adminUser,
  allUsers,
  onRefreshAllUsers,
  initialTab = "verification"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "verification" | "telegram" | "plans" | "memberships" | "accounts" | "refunds" | "analytics" | "audit"
  >((initialTab as any) || "verification");

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<AdminPremiumPlan[]>([]);
  const [accounts, setAccounts] = useState<AdminPaymentAccount[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditRecord[]>([]);
  const [membershipHistory, setMembershipHistory] = useState<MembershipHistoryRecord[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        fetchedPlans,
        fetchedAccounts,
        fetchedPayments,
        fetchedRefunds,
        fetchedAudits,
        fetchedHistory
      ] = await Promise.all([
        getAdminPremiumPlansFromDb(),
        getAdminPaymentAccountsFromDb(),
        getPaymentRequestsFromDb(),
        getRefundRequestsFromDb(),
        getFinancialAuditLogsFromDb(),
        getMembershipHistoryFromDb()
      ]);

      setPlans(fetchedPlans);
      setAccounts(fetchedAccounts);
      setPaymentRequests(fetchedPayments);
      setRefundRequests(fetchedRefunds);
      setAuditLogs(fetchedAudits);
      setMembershipHistory(fetchedHistory);
    } catch (err) {
      console.error("Error loading payment admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Plans
  const handleSavePlan = async (plan: AdminPremiumPlan) => {
    await saveAdminPremiumPlanToDb(plan);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "plan_config_changed",
      planId: plan.id,
      notes: `Saved/Updated plan "${plan.title}" (${plan.priceMMK} MMK, ${plan.durationDays} days)`
    });
    await loadData();
  };

  const handleDeletePlan = async (planId: string) => {
    await deleteAdminPremiumPlanFromDb(planId);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "plan_config_changed",
      planId: planId,
      notes: `Deleted premium plan ID: ${planId}`
    });
    await loadData();
  };

  // Handlers for Accounts
  const handleSaveAccount = async (account: AdminPaymentAccount) => {
    await saveAdminPaymentAccountToDb(account);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "payment_account_changed",
      notes: `Saved receiving payment account "${account.name}" (${account.accountNumber})`
    });
    await loadData();
  };

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAdminPaymentAccountFromDb(accountId);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "payment_account_changed",
      notes: `Deleted payment account ID: ${accountId}`
    });
    await loadData();
  };

  // Handlers for Payment Verification
  const handleApprovePayment = async (
    requestId: string,
    uid: string,
    planId: string,
    internalNote?: string
  ) => {
    await approvePaymentRequestInDb(requestId, adminUser.email, internalNote);
    const targetUser = allUsers.find(u => u.uid === uid);
    if (targetUser) {
      let days = 30;
      const matchedPlan = plans.find(p => p.id === planId || p.planType === planId);
      if (matchedPlan) days = matchedPlan.durationDays;
      else if (planId === "six_months") days = 180;
      else if (planId === "lifetime") days = 36500;

      await adminManualActivatePremium(
        targetUser,
        planId,
        days,
        adminUser,
        `Payment Approved by ${adminUser.email}. Note: ${internalNote || "Approved"}`
      );
    }
    if (onRefreshAllUsers) onRefreshAllUsers();
    await loadData();
  };

  const handleRejectPayment = async (
    requestId: string,
    uid: string,
    reason: string,
    internalNote?: string
  ) => {
    await rejectPaymentRequestInDb(requestId, adminUser.email, reason, internalNote);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "payment_rejected",
      targetUid: uid,
      notes: `Rejected payment ${requestId}. Reason: ${reason}. Internal: ${internalNote || "None"}`
    });
    await loadData();
  };

  const handleRequestMoreInfo = async (requestId: string, uid: string, note: string) => {
    await requestPaymentMoreInfoInDb(requestId, note);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "payment_info_requested",
      targetUid: uid,
      notes: `Requested more info on payment ${requestId}: "${note}"`
    });
    await loadData();
  };

  // Handlers for Memberships
  const handleManualActivate = async (
    targetUser: UserProfile,
    planId: string,
    customDays: number,
    reason: string
  ) => {
    await adminManualActivatePremium(targetUser, planId, customDays, adminUser, reason);
    if (onRefreshAllUsers) onRefreshAllUsers();
    await loadData();
  };

  const handleExtendPremium = async (
    targetUser: UserProfile,
    additionalDays: number,
    reason: string
  ) => {
    await adminExtendUserPremium(targetUser, additionalDays, adminUser, reason);
    if (onRefreshAllUsers) onRefreshAllUsers();
    await loadData();
  };

  const handleCancelPremium = async (targetUser: UserProfile, reason: string) => {
    await adminCancelUserPremium(targetUser, adminUser, reason);
    if (onRefreshAllUsers) onRefreshAllUsers();
    await loadData();
  };

  // Handlers for Refunds
  const handleApproveRefund = async (
    refundId: string,
    adminNote: string,
    premiumAction: "cancelled" | "remain_active" | "adjusted"
  ) => {
    await approveRefundRequestInDb(refundId, adminNote, premiumAction as any);
    const refund = refundRequests.find(r => r.refundId === refundId);
    if (refund && premiumAction === "cancelled") {
      const targetUser = allUsers.find(u => u.uid === refund.uid || u.email === refund.userEmail);
      if (targetUser) {
        await adminCancelUserPremium(
          targetUser,
          adminUser,
          `Refund Approved: ${adminNote || "Refund processed"}`
        );
      }
    }
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "refund_approved",
      amountMMK: refund?.refundAmountMMK,
      notes: `Approved refund ${refundId}. Action on premium: ${premiumAction}. Admin note: ${adminNote}`
    });
    if (onRefreshAllUsers) onRefreshAllUsers();
    await loadData();
  };

  const handleRejectRefund = async (refundId: string, adminNote: string) => {
    await rejectRefundRequestInDb(refundId, adminNote);
    await addFinancialAuditLogToDb({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      action: "refund_rejected",
      notes: `Rejected refund ${refundId}. Reason: ${adminNote}`
    });
    await loadData();
  };

  const pendingPaymentsCount = paymentRequests.filter(p => p.status === "pending").length;
  const pendingRefundsCount = refundRequests.filter(r => r.status === "requested" || r.status === "under_review").length;

  return (
    <div className="space-y-6">
      {/* NAVIGATION TABS */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1">
          <button
            id="tab-verification"
            onClick={() => setActiveSubTab("verification")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "verification"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Verification</span>
            {pendingPaymentsCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                activeSubTab === "verification" ? "bg-slate-950 text-amber-400" : "bg-amber-500 text-slate-950"
              }`}>
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            id="tab-telegram"
            onClick={() => setActiveSubTab("telegram")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "telegram"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Telegram VIP Verification</span>
          </button>

          <button
            id="tab-plans"
            onClick={() => setActiveSubTab("plans")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "plans"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Premium Plans & Pricing</span>
          </button>

          <button
            id="tab-memberships"
            onClick={() => setActiveSubTab("memberships")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "memberships"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Subscriptions</span>
          </button>

          <button
            id="tab-accounts"
            onClick={() => setActiveSubTab("accounts")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "accounts"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Receiving Accounts</span>
          </button>

          <button
            id="tab-refunds"
            onClick={() => setActiveSubTab("refunds")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "refunds"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refund Claims</span>
            {pendingRefundsCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                activeSubTab === "refunds" ? "bg-slate-950 text-amber-400" : "bg-red-500 text-white"
              }`}>
                {pendingRefundsCount}
              </span>
            )}
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveSubTab("analytics")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "analytics"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Analytics</span>
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveSubTab("audit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === "audit"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 shrink-0"
          title="Refresh Financial Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
        </button>
      </div>

      {/* SUB TAB VIEWS */}
      {activeSubTab === "verification" && (
        <PaymentVerificationTab
          paymentRequests={paymentRequests}
          allUsers={allUsers}
          plans={plans}
          adminUser={adminUser}
          onApprovePayment={handleApprovePayment}
          onRejectPayment={handleRejectPayment}
          onRequestMoreInfo={handleRequestMoreInfo}
          onRefreshData={loadData}
        />
      )}

      {activeSubTab === "telegram" && (
        <TelegramVerificationAdminTab
          adminUser={adminUser}
          allUsers={allUsers}
          onRefreshAllUsers={onRefreshAllUsers}
        />
      )}

      {activeSubTab === "plans" && (
        <PremiumPlansTab
          plans={plans}
          adminUser={adminUser}
          onSavePlan={handleSavePlan}
          onDeletePlan={handleDeletePlan}
          onRefreshData={loadData}
        />
      )}

      {activeSubTab === "memberships" && (
        <PremiumMembershipsTab
          users={allUsers}
          plans={plans}
          membershipHistory={membershipHistory}
          adminUser={adminUser}
          onManualActivate={handleManualActivate}
          onExtendPremium={handleExtendPremium}
          onCancelPremium={handleCancelPremium}
          onRefreshData={loadData}
        />
      )}

      {activeSubTab === "accounts" && (
        <PaymentAccountsTab
          accounts={accounts}
          adminUser={adminUser}
          onSaveAccount={handleSaveAccount}
          onDeleteAccount={handleDeleteAccount}
          onRefreshData={loadData}
        />
      )}

      {activeSubTab === "refunds" && (
        <RefundManagementTab
          refundRequests={refundRequests}
          adminUser={adminUser}
          onApproveRefund={handleApproveRefund}
          onRejectRefund={handleRejectRefund}
          onRefreshData={loadData}
        />
      )}

      {activeSubTab === "analytics" && (
        <FinancialAnalyticsTab
          paymentRequests={paymentRequests}
          refundRequests={refundRequests}
          plans={plans}
        />
      )}

      {activeSubTab === "audit" && (
        <FinancialAuditLogsTab
          auditLogs={auditLogs}
          adminUser={adminUser}
        />
      )}
    </div>
  );
};
