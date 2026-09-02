import React, { useState } from "react";
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  ShieldCheck, 
  Lock, 
  Check, 
  Calendar,
  Layers
} from "lucide-react";

export type ReportType = 
  | "master_summary"
  | "users"
  | "learning"
  | "premium"
  | "payments"
  | "kibo_ai"
  | "content"
  | "community"
  | "support";

interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: any;
  dateFilterName: string;
}

export const AnalyticsExportModal: React.FC<AnalyticsExportModalProps> = ({
  isOpen,
  onClose,
  analyticsData,
  dateFilterName
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>("master_summary");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [enablePrivacyMasking, setEnablePrivacyMasking] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const reportDescriptions: Record<ReportType, { title: string; desc: string }> = {
    master_summary: {
      title: "Master Executive Analytics Summary",
      desc: "Complete multi-dimensional KPI summary of users, revenue, learning progress, AI and community."
    },
    users: {
      title: "User Growth & Engagement Report",
      desc: "Detailed user brackets, XP progress, streaks, active/inactive metrics, and conversion rates."
    },
    learning: {
      title: "Learning Progress & Assessment Report",
      desc: "Course enrollments, lesson completions, quiz attempts, pass rates, and assignment submissions."
    },
    premium: {
      title: "Premium Membership & Retention Report",
      desc: "VIP plan distribution (1M, 3M, 6M, 1Y, Lifetime), active vs expired, and conversion timeline."
    },
    payments: {
      title: "Financial & Transactions Report",
      desc: "Transaction logs, payment methods breakdown (KBZPay, WavePay, etc.), revenue and refunds."
    },
    kibo_ai: {
      title: "Kibo AI Assistant Usage & Telemetry",
      desc: "Request volume, breakdown by feature (Code Review, Debugging, Tutor), token usage, and latency."
    },
    content: {
      title: "Content & Curriculum Analytics Report",
      desc: "Most viewed courses, completion rates, high drop-off lessons, and quiz difficulty rankings."
    },
    community: {
      title: "Community Forum & Moderation Report",
      desc: "Discussion volume, replies, reports resolution rate, and top student contributor leaderboard."
    },
    support: {
      title: "Support Tickets & Feedback Report",
      desc: "Student support tickets, issue categories, resolution statuses, and turnaround time."
    }
  };

  // Convert object array to standard CSV string
  const convertToCSV = (rows: any[]): string => {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(","),
      ...rows.map(row => 
        headers.map(field => {
          let val = row[field] ?? "";
          if (typeof val === "object") val = JSON.stringify(val);
          const escaped = ("" + val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",")
      )
    ];
    return "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM for Excel Myanmar support
  };

  const handleDownload = () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      let exportContent = "";
      let filename = `CLM_Report_${selectedReport}_${Date.now()}`;

      // Mask PII helper
      const maskEmail = (email: string) => {
        if (!enablePrivacyMasking || !email) return email;
        const [user, domain] = email.split("@");
        if (!domain) return email;
        const masked = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user}***`;
        return `${masked}@${domain}`;
      };

      if (exportFormat === "json") {
        const payload = {
          reportType: selectedReport,
          generatedAt: new Date().toISOString(),
          timeFilter: dateFilterName,
          privacyMasked: enablePrivacyMasking,
          data: analyticsData[selectedReport] || analyticsData
        };
        exportContent = JSON.stringify(payload, null, 2);
        filename += ".json";
      } else {
        // CSV formatting based on report
        let rowsToExport: any[] = [];
        
        if (selectedReport === "users" && analyticsData.userList) {
          rowsToExport = analyticsData.userList.map((u: any) => ({
            UID: enablePrivacyMasking ? "usr_***" : u.uid,
            Name: enablePrivacyMasking ? u.name?.slice(0, 3) + "***" : u.name,
            Email: maskEmail(u.email),
            Role: u.role || "student",
            IsPremium: u.isPremium ? "VIP Premium" : "Free User",
            XP: u.xp || 0,
            Coins: u.coins || 0,
            Level: u.level || 1,
            StreakDays: u.streak || 0,
            CompletedLessonsCount: u.completedLessons?.length || 0,
            EnrolledCoursesCount: u.enrolledCourses?.length || 0,
            JoinedDate: u.createdAt || "N/A"
          }));
        } else if (selectedReport === "payments" && analyticsData.paymentList) {
          rowsToExport = analyticsData.paymentList.map((p: any) => ({
            RequestID: p.requestId || p.id,
            StudentEmail: maskEmail(p.studentEmail),
            Plan: p.planName || p.planId,
            AmountMMK: p.amountMMK,
            PaymentMethod: p.paymentMethod,
            Status: p.status,
            TransactionRef: enablePrivacyMasking ? "TX_***" : (p.transactionId || "N/A"),
            CreatedAt: p.createdAt,
            ReviewedAt: p.reviewedAt || "Pending"
          }));
        } else if (selectedReport === "content" && analyticsData.courseList) {
          rowsToExport = analyticsData.courseList.map((c: any) => ({
            CourseID: c.id,
            Title: c.title,
            Category: c.category,
            Difficulty: c.difficulty,
            LessonsCount: c.lessons?.length || 0,
            EstimatedHours: c.estimatedTime,
            EnrolledStudents: c.enrolledCount || 0,
            CompletedStudents: c.completedCount || 0,
            CompletionRatePct: c.completionRate || 0
          }));
        } else {
          // Flatten summary metric object into key-value CSV rows
          const summaryObj = analyticsData[selectedReport] || analyticsData;
          rowsToExport = Object.entries(summaryObj).map(([k, v]) => ({
            MetricKey: k,
            Value: typeof v === "object" ? JSON.stringify(v) : v
          }));
        }

        exportContent = convertToCSV(rowsToExport);
        filename += ".csv";
      }

      // Trigger download
      const mimeType = exportFormat === "json" ? "application/json" : "text/csv;charset=utf-8;";
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (e) {
      console.error("Export error:", e);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Export Administrative Reports</h3>
              <p className="text-xs text-slate-400">ဒေတာအစီရင်ခံစာများအား လုံခြုံစွာ Download ရယူခြင်း</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* REPORT TYPE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Report Category (အစီရင်ခံစာ အမျိုးအစား)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(reportDescriptions) as ReportType[]).map((key) => {
                const info = reportDescriptions[key];
                const isSelected = selectedReport === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedReport(key)}
                    className={`
                      p-3 rounded-xl border text-left transition-all
                      ${isSelected
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"}
                    `}
                  >
                    <p className="text-xs font-bold truncate">{info.title}</p>
                    <p className="text-[10px] text-slate-400/90 line-clamp-1 mt-0.5">{info.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPORT FORMAT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Choose File Format (ဖိုင်ပုံစံ ရွေးချယ်ပါ)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`
                  p-3 rounded-xl border flex items-center space-x-3 transition-all
                  ${exportFormat === "csv"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"}
                `}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div className="text-left text-xs">
                  <p className="font-bold">CSV / Excel Format</p>
                  <p className="text-[10px] text-slate-400">Standard spreadsheet with Unicode</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat("json")}
                className={`
                  p-3 rounded-xl border flex items-center space-x-3 transition-all
                  ${exportFormat === "json"
                    ? "bg-sky-500/15 border-sky-500/40 text-sky-300 font-bold"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"}
                `}
              >
                <FileCode className="w-5 h-5 text-sky-400" />
                <div className="text-left text-xs">
                  <p className="font-bold">JSON Data Object</p>
                  <p className="text-[10px] text-slate-400">Structured raw machine data</p>
                </div>
              </button>
            </div>
          </div>

          {/* PRIVACY & FILTERS */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Privacy Masking (ကိုယ်ရေးအချက်အလက် ကာကွယ်ခြင်း)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePrivacyMasking}
                  onChange={(e) => setEnablePrivacyMasking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When enabled, student emails, transaction tokens, and personal names are masked in compliance with platform privacy standards.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-amber-400/90 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>Applied Filter: {dateFilterName}</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Generating..." : `Download ${exportFormat.toUpperCase()}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
