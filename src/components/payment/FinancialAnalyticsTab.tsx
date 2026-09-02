import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Wallet,
  Crown,
  CreditCard,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { PaymentRequest, RefundRequest, AdminPremiumPlan } from "../../types";

interface FinancialAnalyticsTabProps {
  paymentRequests: PaymentRequest[];
  refundRequests: RefundRequest[];
  plans: AdminPremiumPlan[];
}

export const FinancialAnalyticsTab: React.FC<FinancialAnalyticsTabProps> = ({
  paymentRequests,
  refundRequests,
  plans
}) => {
  const [timeRange, setTimeRange] = useState<"all" | "this_month" | "last_30_days">("all");

  const approvedPayments = useMemo(() => {
    return paymentRequests.filter(p => p.status === "approved");
  }, [paymentRequests]);

  const approvedRefunds = useMemo(() => {
    return refundRequests.filter(r => r.status === "approved" || r.status === "completed");
  }, [refundRequests]);

  // Overall Financial Metrics
  const grossRevenue = useMemo(() => {
    return approvedPayments.reduce((acc, curr) => acc + (curr.amountMMK || 0), 0);
  }, [approvedPayments]);

  const totalRefundAmount = useMemo(() => {
    return approvedRefunds.reduce((acc, curr) => acc + (curr.refundAmountMMK || 0), 0);
  }, [approvedRefunds]);

  const netRevenue = grossRevenue - totalRefundAmount;

  const aov = useMemo(() => {
    return approvedPayments.length > 0 ? Math.round(grossRevenue / approvedPayments.length) : 0;
  }, [grossRevenue, approvedPayments]);

  // Revenue by Plan
  const planRevenueBreakdown = useMemo(() => {
    const map: { [key: string]: { count: number; total: number; title: string } } = {
      monthly: { count: 0, total: 0, title: "1 Month Plan" },
      six_months: { count: 0, total: 0, title: "6 Months Plan" },
      lifetime: { count: 0, total: 0, title: "Lifetime Access" },
      other: { count: 0, total: 0, title: "Other Custom" }
    };

    approvedPayments.forEach(p => {
      const planKey = (p.planId === "monthly" || p.planId === "six_months" || p.planId === "lifetime") ? p.planId : "other";
      map[planKey].count += 1;
      map[planKey].total += (p.amountMMK || 0);
    });

    return map;
  }, [approvedPayments]);

  // Revenue by Payment Method
  const methodRevenueBreakdown = useMemo(() => {
    const map: { [key: string]: { count: number; total: number } } = {
      "KBZPay (KPay)": { count: 0, total: 0 },
      "Wave Money": { count: 0, total: 0 },
      "CB Bank": { count: 0, total: 0 },
      "AYA Pay": { count: 0, total: 0 },
      "Other": { count: 0, total: 0 }
    };

    approvedPayments.forEach(p => {
      const method = (p.paymentMethod || "").toLowerCase();
      let key = "Other";
      if (method.includes("kpay") || method.includes("kbz")) key = "KBZPay (KPay)";
      else if (method.includes("wave")) key = "Wave Money";
      else if (method.includes("cb")) key = "CB Bank";
      else if (method.includes("aya")) key = "AYA Pay";

      map[key].count += 1;
      map[key].total += (p.amountMMK || 0);
    });

    return map;
  }, [approvedPayments]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Request ID,Student Name,Email,Plan,Amount MMK,Method,Transaction Ref,Status,Date\n";
    const rows = paymentRequests.map(p => {
      return `"${p.requestId}","${p.userName || ""}","${p.userEmail || ""}","${p.planId}",${p.amountMMK || 0},"${p.paymentMethod || ""}","${p.transactionRef || ""}","${p.status}","${p.submittedAt}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CLM_Financial_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Revenue, Financial Analytics & Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ပလက်ဖောင်း၏ စုစုပေါင်း ဝင်ငွေ၊ အသားတင် ဝင်ငွေ (Net Revenue) နှင့် Payment Method အလိုက် ရှင်းတမ်းများ။
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-2 border border-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {grossRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">MMK</span>
          </div>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{approvedPayments.length} Total Paid Orders</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Net Revenue (After Refunds)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {netRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">MMK</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Deducted {totalRefundAmount.toLocaleString()} MMK in refunds
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Average Order Value (AOV)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-400 font-mono">
              {aov.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">MMK</span>
          </div>
          <p className="text-[10px] text-slate-400">Average spending per paid student</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs text-slate-400 font-medium">Refund Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-200 font-mono">
              {grossRevenue > 0 ? ((totalRefundAmount / grossRevenue) * 100).toFixed(1) : "0"}%
            </span>
            <span className="text-xs font-bold text-slate-400">Rate</span>
          </div>
          <p className="text-[10px] text-slate-400">{approvedRefunds.length} total approved refunds</p>
        </div>
      </div>

      {/* BREAKDOWN SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REVENUE BY PLAN */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Revenue by Premium Plan Tier</span>
          </h3>

          <div className="space-y-4 pt-2">
            {(Object.entries(planRevenueBreakdown) as [string, { count: number; total: number; title: string }][]).map(([key, item]) => {
              const percent = grossRevenue > 0 ? Math.round((item.total / grossRevenue) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.title} ({item.count} orders)</span>
                    <span className="font-mono font-bold text-amber-400">{item.total.toLocaleString()} MMK ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REVENUE BY METHOD */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sky-400" />
            <span>Revenue by Payment Method</span>
          </h3>

          <div className="space-y-4 pt-2">
            {(Object.entries(methodRevenueBreakdown) as [string, { count: number; total: number }][]).map(([methodName, item]) => {
              const percent = grossRevenue > 0 ? Math.round((item.total / grossRevenue) * 100) : 0;
              return (
                <div key={methodName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{methodName} ({item.count} txns)</span>
                    <span className="font-mono font-bold text-sky-400">{item.total.toLocaleString()} MMK ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
