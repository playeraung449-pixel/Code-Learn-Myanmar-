import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { FinancialAuditRecord, UserProfile } from "../../types";

interface FinancialAuditLogsTabProps {
  auditLogs: FinancialAuditRecord[];
  adminUser: UserProfile;
}

export const FinancialAuditLogsTab: React.FC<FinancialAuditLogsTabProps> = ({
  auditLogs,
  adminUser
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<FinancialAuditRecord | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch =
        (log.adminEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetUserEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchAction = actionFilter === "all" || log.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const handleExportCSV = () => {
    const headers = "Timestamp,Admin,Target Student,Action,Plan,Amount MMK,Notes\n";
    const rows = auditLogs.map(l => {
      return `"${l.timestamp}","${l.adminEmail}","${l.targetUserEmail || ""}","${l.action}","${l.planId || ""}",${l.amountMMK || 0},"${(l.notes || "").replace(/"/g, '""')}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Financial_Audit_Trail_${Date.now()}.csv`);
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
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Financial & Membership Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ငွေလွှဲအတည်ပြုမှု၊ ပယ်ဖျက်မှု၊ လက်စွဲ Premium ဖွင့်ပေးမှု အစရှိသော စီမံခန့်ခွဲမှုဆိုင်ရာ လုပ်ဆောင်ချက်အားလုံး၏ တိကျသော မှတ်တမ်းများ။
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-2 border border-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search admin, student email, action, note..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Actions</option>
          <option value="payment_approved">Payment Approved</option>
          <option value="payment_rejected">Payment Rejected</option>
          <option value="manual_activation">Manual Activation</option>
          <option value="manual_extension">Manual Extension</option>
          <option value="manual_cancellation">Manual Cancellation</option>
          <option value="refund_approved">Refund Approved</option>
        </select>
      </div>

      {/* AUDIT TABLE */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Student</th>
                <th className="py-3 px-4">Plan / Amount</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-sans">
                    Audit log မှတ်တမ်း မရှိပါ
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-bold">
                      {log.adminEmail}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                        {log.action.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {log.targetUserEmail || log.targetUid || "N/A"}
                    </td>

                    <td className="py-3 px-4 text-amber-400 font-bold">
                      {log.amountMMK ? `${log.amountMMK.toLocaleString()} MMK` : log.planId || "N/A"}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-sans truncate max-w-xs">
                      {log.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
