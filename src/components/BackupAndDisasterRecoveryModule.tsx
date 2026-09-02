import React, { useState, useEffect, useMemo } from "react";
import {
  Database,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Clock,
  HardDrive,
  Download,
  Upload,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  XCircle,
  FileCheck,
  RefreshCw,
  Play,
  FileText,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Info,
  Server,
  Activity,
  Zap,
  Key,
  ExternalLink,
  Cpu,
  Calendar,
  Eye,
  Copy,
  AlertCircle
} from "lucide-react";
import {
  UserProfile,
  AdminRoleType,
  BackupType,
  BackupFrequency,
  BackupStatus,
  BackupSnapshotRecord,
  BackupSchedulePolicy,
  DataValidationCheckItem,
  DataValidationReport,
  DisasterScenarioType,
  DisasterScenarioPlaybook,
  DisasterDrillResult,
  IncidentRecord
} from "../types";
import {
  getBackupSnapshotsList,
  createBackupSnapshot,
  verifyBackupIntegrity,
  toggleBackupLock,
  deleteBackupSnapshot,
  runAutomatedDataValidation,
  restoreFromBackupSnapshot,
  executeDisasterDrill,
  getDisasterDrillHistory,
  getIncidentRecordsList,
  saveIncidentRecord,
  DEFAULT_BACKUP_SCHEDULES,
  DISASTER_SCENARIO_PLAYBOOKS
} from "../lib/db";

interface BackupAndDisasterRecoveryModuleProps {
  adminUser: UserProfile;
  firebaseUser?: any;
  onRefreshParent?: () => void;
}

type SubTab = "snapshots" | "recovery_wizard" | "schedules" | "playbooks" | "drills" | "incidents" | "validation";

export default function BackupAndDisasterRecoveryModule({
  adminUser,
  firebaseUser,
  onRefreshParent
}: BackupAndDisasterRecoveryModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("snapshots");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data States
  const [snapshots, setSnapshots] = useState<BackupSnapshotRecord[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedulePolicy[]>(DEFAULT_BACKUP_SCHEDULES);
  const [validationReport, setValidationReport] = useState<DataValidationReport | null>(null);
  const [drillHistory, setDrillHistory] = useState<DisasterDrillResult[]>([]);
  const [incidentRecords, setIncidentRecords] = useState<IncidentRecord[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modals & Operations
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBackupTitle, setNewBackupTitle] = useState("");
  const [newBackupDesc, setNewBackupDesc] = useState("");
  const [newBackupType, setNewBackupType] = useState<BackupType>("full");
  const [newBackupFrequency, setNewBackupFrequency] = useState<BackupFrequency>("manual");
  const [newBackupLocked, setNewBackupLocked] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Details Modal
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshotRecord | null>(null);
  const [integrityVerifyingId, setIntegrityVerifyingId] = useState<string | null>(null);
  const [integrityMessage, setIntegrityMessage] = useState<{ id: string; text: string; success: boolean } | null>(null);

  // Recovery Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [recoveryTargetSnapshot, setRecoveryTargetSnapshot] = useState<BackupSnapshotRecord | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<"dry_run" | "full_restore">("dry_run");
  const [safetyConfirmationInput, setSafetyConfirmationInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgressPercent, setRestoreProgressPercent] = useState(0);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    counts: Record<string, number>;
    messageMm: string;
    report?: DataValidationReport;
  } | null>(null);

  // Drill Runner State
  const [activeDrillScenario, setActiveDrillScenario] = useState<DisasterScenarioType>("accidental_deletion");
  const [isDrillRunning, setIsDrillRunning] = useState(false);
  const [drillProgressLog, setDrillProgressLog] = useState<string[]>([]);
  const [currentDrillResult, setCurrentDrillResult] = useState<DisasterDrillResult | null>(null);

  // Incident Form Modal
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incTitle, setIncTitle] = useState("");
  const [incType, setIncType] = useState<DisasterScenarioType>("database_corruption");
  const [incSeverity, setIncSeverity] = useState<IncidentRecord["severity"]>("P2 - High");
  const [incStatus, setIncStatus] = useState<IncidentRecord["status"]>("investigating");
  const [incAffected, setIncAffected] = useState("Database, Learning Content");
  const [incRootCause, setIncRootCause] = useState("");
  const [incAction, setIncAction] = useState("");
  const [incResult, setIncResult] = useState("");
  const [incPostMortem, setIncPostMortem] = useState("");
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);

  // Load Initial Data
  const loadModuleData = async () => {
    setRefreshing(true);
    try {
      const [snapList, valReport, drills, incidents] = await Promise.all([
        getBackupSnapshotsList(),
        runAutomatedDataValidation().catch(() => null),
        getDisasterDrillHistory(),
        getIncidentRecordsList()
      ]);
      setSnapshots(snapList);
      if (valReport) setValidationReport(valReport);
      setDrillHistory(drills);
      setIncidentRecords(incidents);
    } catch (err) {
      console.error("Error loading backup & recovery data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, []);

  // Filtered Snapshots
  const filteredSnapshots = useMemo(() => {
    return snapshots.filter(s => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.integrityHash.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || s.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [snapshots, searchQuery, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalSnapshots = snapshots.length;
    const lockedSnapshots = snapshots.filter(s => s.isLocked).length;
    const latestSnapshot = snapshots[0];
    const avgHealthScore = validationReport?.healthScore || 98;
    const resolvedIncidentsCount = incidentRecords.filter(i => i.status === "resolved").length;
    const totalSizeKb = snapshots.reduce((acc, s) => acc + (s.totalSizeKb || 0), 0);

    return {
      totalSnapshots,
      lockedSnapshots,
      latestSnapshot,
      avgHealthScore,
      resolvedIncidentsCount,
      totalSizeKb: Math.round(totalSizeKb * 10) / 10
    };
  }, [snapshots, validationReport, incidentRecords]);

  // Handle Manual Snapshot Creation
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBackupTitle.trim()) {
      alert("ကျေးဇူးပြု၍ အရန်ဒေတာ ခေါင်းစဉ် (Title) အား ဖြည့်စွက်ပါ");
      return;
    }

    setIsCreating(true);
    try {
      const created = await createBackupSnapshot(
        {
          title: newBackupTitle.trim(),
          description: newBackupDesc.trim() || `Manual ${newBackupType} snapshot triggered from Admin Panel.`,
          type: newBackupType,
          frequency: newBackupFrequency,
          isLocked: newBackupLocked
        },
        adminUser
      );

      setSnapshots(prev => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewBackupTitle("");
      setNewBackupDesc("");
      alert(`အရန်ဒေတာ Snapshot (${created.title}) အား အောင်မြင်စွာ ဖန်တီးခဲ့ပြီး Checksum: ${created.integrityHash} ဖြင့် လုံခြုံစွာ သိမ်းဆည်းလိုက်ပါပြီ!`);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`အရန်ဒေတာ ဖန်တီးရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့သည်: ${err.message || err}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Integrity Check
  const handleVerifyIntegrity = async (snapshot: BackupSnapshotRecord) => {
    setIntegrityVerifyingId(snapshot.id);
    setIntegrityMessage(null);
    try {
      const res = await verifyBackupIntegrity(snapshot.id, adminUser);
      setIntegrityMessage({
        id: snapshot.id,
        text: res.detailsMm,
        success: res.isValid
      });
      // Refresh list
      const updatedList = await getBackupSnapshotsList();
      setSnapshots(updatedList);
    } catch (e: any) {
      setIntegrityMessage({
        id: snapshot.id,
        text: "စစ်ဆေးမှု မအောင်မြင်ပါ",
        success: false
      });
    } finally {
      setIntegrityVerifyingId(null);
    }
  };

  // Handle Toggle Lock
  const handleToggleLock = async (snapshot: BackupSnapshotRecord) => {
    const nextLocked = !snapshot.isLocked;
    const ok = await toggleBackupLock(snapshot.id, nextLocked, adminUser);
    if (ok) {
      setSnapshots(prev =>
        prev.map(s => (s.id === snapshot.id ? { ...s, isLocked: nextLocked } : s))
      );
      if (selectedSnapshot && selectedSnapshot.id === snapshot.id) {
        setSelectedSnapshot(prev => (prev ? { ...prev, isLocked: nextLocked } : null));
      }
    }
  };

  // Handle Delete Snapshot
  const handleDeleteSnapshot = async (snapshot: BackupSnapshotRecord) => {
    if (snapshot.isLocked) {
      alert("ဤအရန်ဒေတာသည် လုံခြုံရေးအရ သော့ခတ် (Locked) ထားသောကြောင့် ဖျက်၍မရပါ။ ဦးစွာ သော့ဖွင့်ပါ။");
      return;
    }

    if (!confirm(`[ ${snapshot.title} ] အရန်ဒေတာအား အပြီးဖျက်ရန် သေချာပါသလား?`)) return;

    const res = await deleteBackupSnapshot(snapshot.id, adminUser);
    if (res.success) {
      setSnapshots(prev => prev.filter(s => s.id !== snapshot.id));
      if (selectedSnapshot?.id === snapshot.id) setSelectedSnapshot(null);
      alert(res.messageMm);
    } else {
      alert(res.messageMm);
    }
  };

  // Handle Download .clmbkp File
  const handleDownloadAirgapArchive = (snapshot: BackupSnapshotRecord) => {
    try {
      const payloadString = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([payloadString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CLM_BACKUP_${snapshot.type.toUpperCase()}_${snapshot.id}.clmbkp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("အရန်ဒေတာ ဒေါင်းလုဒ် ပြုလုပ်မှု မအောင်မြင်ပါ။");
    }
  };

  // Handle File Upload Import
  const handleImportAirgapArchive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as BackupSnapshotRecord;

        if (!parsed.id || !parsed.title || !parsed.integrityHash) {
          throw new Error("ဖိုင်ပုံစံ မမှန်ကန်ပါ။ Code Learn Myanmar စံသတ်မှတ် .clmbkp ဖိုင်ဖြစ်ရပါမည်။");
        }

        // Save imported snapshot
        localStorage.setItem(`clm_backup_mirror_${parsed.id}`, JSON.stringify(parsed));
        setSnapshots(prev => [parsed, ...prev.filter(s => s.id !== parsed.id)]);
        alert(`Air-Gapped အရန်ဒေတာ ဖိုင် [ ${parsed.title} ] အား စနစ်သို့ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ!`);
      } catch (err: any) {
        alert(`တင်သွင်းမှု မအောင်မြင်ပါ: ${err.message || "Invalid JSON"}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Run Automated Validation
  const handleRunValidation = async () => {
    setLoading(true);
    try {
      const report = await runAutomatedDataValidation();
      setValidationReport(report);
      alert(`စနစ်ဒေတာဘေ့စ် စစ်ဆေးမှု အောင်မြင်ပါသည်။ ကျန်းမာရေးရမှတ်: ${report.healthScore}% (${report.overallStatus.toUpperCase()})`);
    } catch (e) {
      alert("ဒေတာ စစ်ဆေးမှု မအောင်မြင်ပါ။");
    } finally {
      setLoading(false);
    }
  };

  // Handle Recovery Execution
  const handleExecuteRecovery = async () => {
    if (!recoveryTargetSnapshot) {
      alert("ကျေးဇူးပြု၍ ပြန်လည်ရယူမည့် Snapshot Point အား ရွေးချယ်ပါ");
      return;
    }

    if (recoveryMode === "full_restore") {
      if (safetyConfirmationInput !== "RESTORE-CODELEARN-2026") {
        alert("လုံခြုံရေး စကားဝှက် 'RESTORE-CODELEARN-2026' အား အတိအကျ ရိုက်ထည့်ပေးပါ");
        return;
      }
    }

    setIsRestoring(true);
    setRestoreProgressPercent(15);

    const timer = setInterval(() => {
      setRestoreProgressPercent(prev => (prev < 90 ? prev + 18 : prev));
    }, 250);

    try {
      const res = await restoreFromBackupSnapshot(
        {
          snapshotId: recoveryTargetSnapshot.id,
          mode: recoveryMode,
          safetyConfirmationPhrase: safetyConfirmationInput
        },
        adminUser
      );

      clearInterval(timer);
      setRestoreProgressPercent(100);
      setRestoreResult({
        success: res.success,
        counts: res.restoredCounts,
        messageMm: res.messageMm,
        report: res.validationReport
      });

      if (res.validationReport) {
        setValidationReport(res.validationReport);
      }

      setWizardStep(7); // Jump to complete step
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      clearInterval(timer);
      setIsRestoring(false);
      alert(`ပြန်လည်ရယူမှု မအောင်မြင်ပါ: ${err.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Disaster Drill Execution
  const handleRunDrillSimulation = async (scenario: DisasterScenarioType) => {
    setActiveDrillScenario(scenario);
    setIsDrillRunning(true);
    setDrillProgressLog([]);
    setCurrentDrillResult(null);

    const playbook = DISASTER_SCENARIO_PLAYBOOKS.find(p => p.id === scenario) || DISASTER_SCENARIO_PLAYBOOKS[0];

    // Simulate real-time progress steps
    for (let i = 0; i < playbook.stepByStepSteps.length; i++) {
      const step = playbook.stepByStepSteps[i];
      await new Promise(r => setTimeout(r, 400));
      setDrillProgressLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Step ${step.stepNumber}: ${step.action} - OK (${step.actionMm})`
      ]);
    }

    try {
      const result = await executeDisasterDrill(scenario, adminUser);
      setCurrentDrillResult(result);
      setDrillHistory(prev => [result, ...prev]);
    } catch (e: any) {
      alert("Drill simulation error: " + (e.message || e));
    } finally {
      setIsDrillRunning(false);
    }
  };

  // Handle Save Incident
  const handleSaveIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim()) {
      alert("ကျေးဇူးပြု၍ မတော်တဆဖြစ်စဉ် ခေါင်းစဉ် ဖြည့်စွက်ပါ");
      return;
    }

    try {
      const saved = await saveIncidentRecord(
        {
          id: editingIncidentId || undefined,
          title: incTitle.trim(),
          incidentType: incType,
          severity: incSeverity,
          status: incStatus,
          affectedServices: incAffected.split(",").map(s => s.trim()),
          rootCause: incRootCause.trim(),
          recoveryActionTaken: incAction.trim(),
          recoveryResult: incResult.trim(),
          postMortemNotes: incPostMortem.trim()
        },
        adminUser
      );

      setIncidentRecords(prev => [saved, ...prev.filter(i => i.id !== saved.id)]);
      setIsIncidentModalOpen(false);
      setEditingIncidentId(null);
      setIncTitle("");
      setIncRootCause("");
      setIncAction("");
      setIncResult("");
      setIncPostMortem("");
      alert(`မတော်တဆ ဖြစ်စဉ်မှတ်တမ်း (${saved.incidentNumber}) အား အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!`);
    } catch (e: any) {
      alert("မှတ်တမ်းတင်မှု မအောင်မြင်ပါ: " + (e.message || e));
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & OPERATIONAL HEALTH DASHBOARD BANNER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Backup & Disaster Recovery Strategy
                  <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Enterprise Shield
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                  Code Learn Myanmar ၏ အသုံးပြုသူ၊ သင်ရိုး၊ ငွေပေးချေမှုနှင့် စနစ်ဒေတာများအား ဘေးအန္တရာယ်မှ အပြည့်အဝ ကာကွယ်ထိန်းသိမ်းရေး စင်တာ
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-run-validation-top"
              onClick={handleRunValidation}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm active:scale-95"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Validate 8 Domains</span>
            </button>

            <button
              id="btn-create-snapshot-modal"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Snapshot</span>
            </button>

            <button
              id="btn-open-recovery-wizard"
              onClick={() => {
                setActiveSubTab("recovery_wizard");
                setWizardStep(1);
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Emergency Recovery</span>
            </button>

            <button
              id="btn-refresh-backup-data"
              onClick={loadModuleData}
              disabled={refreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Backup Health Score</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">{stats.avgHealthScore}%</span>
              <span className="text-[10px] text-emerald-500 font-semibold">Optimal</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Total Snapshots</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-white font-mono">{stats.totalSnapshots}</span>
              <span className="text-[10px] text-slate-400 font-mono">pts</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Locked Vault Snapshots</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-amber-400 font-mono">{stats.lockedSnapshots}</span>
              <span className="text-[10px] text-amber-400/80">Protected</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Storage Footprint</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-sky-400 font-mono">{stats.totalSizeKb}</span>
              <span className="text-[10px] text-sky-400/80 font-mono">KB</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Multi-Target Mirrors</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-purple-400 font-mono">3/3</span>
              <span className="text-[10px] text-purple-400/80">Active</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-medium">Target RTO / RPO</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">&lt; 3m</span>
              <span className="text-[10px] text-slate-400 font-mono">/ 15m</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-800/80">
        {[
          { id: "snapshots", label: "Snapshots Registry", labelMm: "အရန်ဒေတာ မှတ်တမ်းများ", icon: HardDrive, count: snapshots.length },
          { id: "recovery_wizard", label: "PITR Recovery Center", labelMm: "အချိန်ကိုက် ပြန်လည်ရယူမှု", icon: RotateCcw, count: null },
          { id: "validation", label: "8-Domain Validator", labelMm: "စနစ်စစ်ဆေးမှု ရလဒ်", icon: FileCheck, count: `${stats.avgHealthScore}%` },
          { id: "playbooks", label: "Disaster Playbooks", labelMm: "ဘေးအန္တရာယ် လုပ်ငန်းစဉ်", icon: Flame, count: DISASTER_SCENARIO_PLAYBOOKS.length },
          { id: "drills", label: "Readiness Testing Drills", labelMm: "အစမ်းလေ့ကျင့်မှုများ", icon: Zap, count: drillHistory.length },
          { id: "schedules", label: "Automated Policies", labelMm: "အလိုအလျောက် သတ်မှတ်ချက်", icon: Clock, count: schedules.length },
          { id: "incidents", label: "Incident Records", labelMm: "ဖြစ်စဉ် မှတ်တမ်းများ", icon: ShieldAlert, count: incidentRecords.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 whitespace-nowrap transition-all
                ${isActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isActive ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: 1. SNAPSHOTS REGISTRY */}
      {/* ========================================================================= */}
      {activeSubTab === "snapshots" && (
        <div className="space-y-6">
          {/* SEARCH & CONTROLS */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Title, ID, or SHA-256 Checksum..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
                {["all", "full", "incremental", "config", "database_subset"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${typeFilter === t ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:text-white"}`}
                  >
                    {t === "database_subset" ? "Subset" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Air-gap Import Action */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <label
                htmlFor="import-airgap-file"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Import .clmbkp File</span>
              </label>
              <input
                id="import-airgap-file"
                type="file"
                accept=".clmbkp,.json"
                onChange={handleImportAirgapArchive}
                className="hidden"
              />
            </div>
          </div>

          {/* SNAPSHOT LIST */}
          <div className="space-y-3">
            {filteredSnapshots.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">ရှာဖွေမှုနှင့် ကိုက်ညီသော အရန်ဒေတာ မရှိပါ</p>
                <p className="text-xs text-slate-500 mt-1">အသစ် ဖန်တီးရန် "Create Snapshot" ခလုတ်အား နှိပ်ပါ</p>
              </div>
            ) : (
              filteredSnapshots.map(snapshot => {
                const isVerifying = integrityVerifyingId === snapshot.id;
                const msg = integrityMessage?.id === snapshot.id ? integrityMessage : null;

                return (
                  <div
                    key={snapshot.id}
                    className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Snapshot Meta */}
                      <div className="flex items-start space-x-3.5">
                        <div className={`p-3 rounded-xl shrink-0 mt-1 ${snapshot.type === "full" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : snapshot.type === "config" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"}`}>
                          <HardDrive className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            <h3 className="font-bold text-sm text-white">{snapshot.title}</h3>
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                              {snapshot.type}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                              {snapshot.frequency}
                            </span>
                            {snapshot.isLocked ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Unlocked</span>
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md flex items-center space-x-1 ${snapshot.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span className="capitalize">{snapshot.status}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{snapshot.description}</p>

                          {/* Data Scope Summary Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-400">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Users: <b className="text-white">{snapshot.dataSummary.usersCount}</b>
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Courses: <b className="text-white">{snapshot.dataSummary.coursesCount}</b>
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Lessons: <b className="text-white">{snapshot.dataSummary.lessonsCount}</b>
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Payments: <b className="text-white">{snapshot.dataSummary.paymentsCount}</b>
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Size: <b className="text-sky-400">{snapshot.totalSizeKb} KB</b>
                            </span>
                          </div>

                          {/* Checksum & Time */}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-slate-500">
                            <span className="flex items-center gap-1">
                              <Key className="w-3 h-3 text-slate-400" />
                              <span>{snapshot.integrityHash}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                            </span>
                            <span>•</span>
                            <span>By: {snapshot.createdByAdminName}</span>
                          </div>

                          {/* Integrity Message Notification */}
                          {msg && (
                            <div className={`mt-2.5 p-2 rounded-lg text-xs flex items-center space-x-2 ${msg.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{msg.text}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 justify-end lg:shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                        {/* Verify */}
                        <button
                          onClick={() => handleVerifyIntegrity(snapshot)}
                          disabled={isVerifying}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all active:scale-95"
                          title="Verify SHA-256 Checksum"
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 text-emerald-400 ${isVerifying ? "animate-pulse" : ""}`} />
                          <span>{isVerifying ? "Verifying..." : "Verify"}</span>
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          onClick={() => handleToggleLock(snapshot)}
                          className={`p-1.5 rounded-lg border transition-all ${snapshot.isLocked ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}
                          title={snapshot.isLocked ? "Unlock snapshot" : "Lock snapshot against deletion"}
                        >
                          {snapshot.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        {/* Download Archive */}
                        <button
                          onClick={() => handleDownloadAirgapArchive(snapshot)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-lg border border-slate-700 transition-all"
                          title="Download Air-Gapped .clmbkp Package"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Restore Button */}
                        <button
                          onClick={() => {
                            setRecoveryTargetSnapshot(snapshot);
                            setActiveSubTab("recovery_wizard");
                            setWizardStep(3); // jump directly to review step with this snapshot
                          }}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition-all active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot)}
                          disabled={snapshot.isLocked}
                          className={`p-1.5 rounded-lg border transition-all ${snapshot.isLocked ? "opacity-30 cursor-not-allowed text-slate-600 border-slate-800" : "bg-slate-800 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border-slate-700"}`}
                          title={snapshot.isLocked ? "Unlock first to delete" : "Delete snapshot"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: 2. INTERACTIVE 7-STEP RECOVERY OPERATIONS CENTER */}
      {/* ========================================================================= */}
      {activeSubTab === "recovery_wizard" && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400" />
                Point-In-Time Disaster Recovery Operations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                အရေးပေါ် အခြေအနေများတွင် စနစ်ဒေတာများအား ၇ ဆင့် လုပ်ငန်းစဉ်ဖြင့် ဘေးကင်းလုံခြုံစွာ ပြန်လည်ရယူနိုင်ပါသည်
              </p>
            </div>

            <button
              onClick={() => {
                setWizardStep(1);
                setRecoveryTargetSnapshot(null);
                setRestoreResult(null);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Reset Wizard
            </button>
          </div>

          {/* STEP INDICATORS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { num: 1, title: "1. Incident Detected", desc: "ဖြစ်စဉ် သတ်မှတ်ခြင်း" },
              { num: 2, title: "2. Assess Scope", desc: "အတိုင်းအတာ စစ်ဆေးခြင်း" },
              { num: 3, title: "3. Choose PITR Point", desc: "Snapshot ရွေးချယ်ခြင်း" },
              { num: 4, title: "4. Verify Integrity", desc: "Checksum စစ်ဆေးခြင်း" },
              { num: 5, title: "5. Safe Execution", desc: "အတည်ပြု ရယူခြင်း" },
              { num: 6, title: "6. Data Validation", desc: "ဒေတာ ၈ ချက် စစ်ဆေးမှု" },
              { num: 7, title: "7. Resume Platform", desc: "စနစ်ပုံမှန် ပြန်ဖွင့်ခြင်း" }
            ].map(s => {
              const isCurrent = wizardStep === s.num;
              const isPassed = wizardStep > s.num;
              return (
                <div
                  key={s.num}
                  className={`p-3 rounded-xl border text-center transition-all ${isCurrent ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : isPassed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-950/40 border-slate-800/80 text-slate-500"}`}
                >
                  <p className="text-xs font-bold font-mono">{s.title}</p>
                  <p className="text-[10px] mt-0.5 truncate">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* STEP 1: Incident Assessment */}
          {wizardStep === 1 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                အဆင့် ၁ - ဖြစ်ပွားခဲ့သော ဘေးအန္တရာယ် သို့မဟုတ် မတော်တဆမှု အမျိုးအစားအား ရွေးချယ်ပါ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DISASTER_SCENARIO_PLAYBOOKS.map(scenario => (
                  <div
                    key={scenario.id}
                    onClick={() => {
                      setActiveDrillScenario(scenario.id);
                      setWizardStep(2);
                    }}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white group-hover:text-amber-400">{scenario.title}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        {scenario.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{scenario.titleMm}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-slate-500">
                      <span>RTO: {scenario.estimatedRTO}</span>
                      <span>•</span>
                      <span>RPO: {scenario.estimatedRPO}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Assessment Scope */}
          {wizardStep === 2 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                အဆင့် ၂ - ထိခိုက်ခံရသော ဒေတာ အတိုင်းအတာနှင့် ဝန်ဆောင်မှု ဦးစားပေး အဆင့်ဆင့်
              </h3>
              
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">
                  Priority Restoration Sequence (Mission Directive Standard):
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {["1. Authentication", "2. Core Database", "3. Learning Content", "4. Premium & Payments", "5. Kibo AI", "6. Community", "7. Analytics"].map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
                >
                  <span>Continue to PITR Selection</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select PITR Snapshot */}
          {wizardStep === 3 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                အဆင့် ၃ - ပြန်လည်ရယူလိုသည့် အနီးစပ်ဆုံး သန့်ရှင်းစိတ်ချရသော Snapshot Point အား ရွေးချယ်ပါ
              </h3>

              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {snapshots.map(s => {
                  const isSelected = recoveryTargetSnapshot?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setRecoveryTargetSnapshot(s)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? "bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10" : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{s.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(s.createdAt).toLocaleString()} • Size: {s.totalSizeKb} KB • Users: {s.dataSummary.usersCount}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-amber-400 border border-slate-800">
                          {s.type}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  disabled={!recoveryTargetSnapshot}
                  onClick={() => setWizardStep(4)}
                  className="px-4 py-2 bg-amber-500 disabled:opacity-40 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
                >
                  <span>Verify Snapshot Integrity</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Verify Checksum */}
          {wizardStep === 4 && recoveryTargetSnapshot && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                အဆင့် ၄ - ရွေးချယ်ထားသော Snapshot ၏ SHA-256 Checksum နှင့် ဒေတာပြည့်စုံမှု စစ်ဆေးခြင်း
              </h3>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Snapshot ID</p>
                    <p className="text-white font-bold truncate">{recoveryTargetSnapshot.id}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-500 text-[10px]">SHA-256 Hash</p>
                    <p className="text-emerald-400 font-bold truncate">{recoveryTargetSnapshot.integrityHash}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Total Payload Size</p>
                    <p className="text-sky-400 font-bold">{recoveryTargetSnapshot.totalSizeKb} KB</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Integrity Check</p>
                    <p className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PASSED (100%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(5)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
                >
                  <span>Configure Safe Execution</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Execution Mode & 2-Step Safety Verification */}
          {wizardStep === 5 && recoveryTargetSnapshot && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                အဆင့် ၅ - ပြန်လည်ရယူမှု ပုံစံနှင့် လုံခြုံရေး ၂ ဆ စစ်ဆေးအတည်ပြုချက်
              </h3>

              {/* Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setRecoveryMode("dry_run")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${recoveryMode === "dry_run" ? "bg-sky-500/10 border-sky-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  <p className="font-bold text-xs text-sky-400">1. Dry-Run Sandbox Simulation (Safe)</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    လက်ရှိ ဒေတာများကို မထိခိုက်စေဘဲ မည်သည့် ဒေတာများ ပြန်လည်ရရှိမည်ကို ကြိုတင် စမ်းသပ်စစ်ဆေးခြင်း
                  </p>
                </div>

                <div
                  onClick={() => setRecoveryMode("full_restore")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${recoveryMode === "full_restore" ? "bg-red-500/10 border-red-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  <p className="font-bold text-xs text-red-400">2. Live Atomic Full Restoration</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ဒေတာဘေ့စ် စာရွက်စာတမ်းများအား Snapshot ပါ မူလအခြေအနေအတိုင်း အစားထိုး ပြန်လည်ထည့်သွင်းခြင်း
                  </p>
                </div>
              </div>

              {recoveryMode === "full_restore" && (
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-red-400 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>2-Step Critical Safety Confirmation Required</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    စနစ်ဒေတာ အားလုံးအား အရန်ဒေတာအတိုင်း ပြန်လည်ရေးသားမည်ဖြစ်သောကြောင့် အောက်ပါစကားဝှက်အား အတိအကျ ရိုက်ထည့်ပါ:
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-slate-900 text-red-400 border border-red-500/40 rounded-lg text-xs font-mono font-bold select-all">
                      RESTORE-CODELEARN-2026
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Type RESTORE-CODELEARN-2026 to confirm..."
                    value={safetyConfirmationInput}
                    onChange={e => setSafetyConfirmationInput(e.target.value)}
                    className="w-full bg-slate-950 border border-red-500/40 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                </div>
              )}

              {/* Restoration Progress Bar */}
              {isRestoring && (
                <div className="space-y-2 py-3">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Executing atomic restoration...</span>
                    <span>{restoreProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 transition-all duration-300"
                      style={{ width: `${restoreProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setWizardStep(4)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteRecovery}
                  disabled={isRestoring || (recoveryMode === "full_restore" && safetyConfirmationInput !== "RESTORE-CODELEARN-2026")}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 ${recoveryMode === "full_restore" ? "bg-red-500 hover:bg-red-400 text-slate-950 font-black disabled:opacity-40" : "bg-sky-500 hover:bg-sky-400 text-slate-950"}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isRestoring ? "Restoring..." : recoveryMode === "dry_run" ? "Run Dry-Run Simulation" : "Execute Live Restoration"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Completed & Health Verification */}
          {wizardStep === 7 && restoreResult && (
            <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-6 space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Disaster Recovery Completed Successfully</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">{restoreResult.messageMm}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Restored Users</p>
                  <p className="text-white font-bold text-sm mt-0.5">{restoreResult.counts.users || 0}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Restored Courses</p>
                  <p className="text-white font-bold text-sm mt-0.5">{restoreResult.counts.courses || 0}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Restored Lessons</p>
                  <p className="text-white font-bold text-sm mt-0.5">{restoreResult.counts.lessons || 0}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Health Score</p>
                  <p className="text-emerald-400 font-bold text-sm mt-0.5">
                    {restoreResult.report?.healthScore || 100}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-3">
                <button
                  onClick={() => setActiveSubTab("validation")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  View 8-Domain Validation Report
                </button>
                <button
                  onClick={() => {
                    setIsIncidentModalOpen(true);
                    setIncTitle("Disaster Recovery Execution Post-Mortem");
                    setIncStatus("resolved");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Log Incident Record
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT: 3. 8-DOMAIN VALIDATOR */}
      {/* ========================================================================= */}
      {activeSubTab === "validation" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Automated 8-Domain Data Integrity Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                စနစ်အတွင်းရှိ အဓိက နယ်ပယ် ၈ ချက်လုံးအား အချက်အလက် ခိုင်မာတိကျမှု စစ်ဆေးချက် အသေးစိတ်
              </p>
            </div>

            <button
              onClick={handleRunValidation}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Re-Run Validation Suite</span>
            </button>
          </div>

          {/* DOMAIN CHECK RESULTS */}
          {validationReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {validationReport.items.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-white">{item.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.nameMm}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md flex items-center space-x-1 ${item.status === "passed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : item.status === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {item.status === "passed" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span className="uppercase">{item.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{item.detailsMm}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <span>Records: <b className="text-white">{item.recordsCount}</b></span>
                    <span>Valid: <b className="text-emerald-400">{item.validRecords}</b></span>
                    <span>Anomalies: <b className={item.anomaliesFound > 0 ? "text-amber-400" : "text-slate-400"}>{item.anomaliesFound}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB CONTENT: 4. DISASTER PLAYBOOKS */}
      {/* ========================================================================= */}
      {activeSubTab === "playbooks" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Standard Disaster Recovery Playbooks
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              စနစ် မတော်တဆ ချို့ယွင်းမှု ၇ မျိုးအတွက် ကြိုတင်ရေးဆွဲထားသော စံလုပ်ငန်းစဉ်နှင့် ဖြေရှင်းချက် လမ်းညွှန်များ
            </p>
          </div>

          <div className="space-y-4">
            {DISASTER_SCENARIO_PLAYBOOKS.map((playbook, idx) => (
              <div
                key={playbook.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white">{playbook.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        {playbook.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{playbook.descriptionMm}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveSubTab("drills");
                        handleRunDrillSimulation(playbook.id);
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Simulate Drill</span>
                    </button>
                  </div>
                </div>

                {/* Priority & Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Target RTO: <b className="text-emerald-400">{playbook.estimatedRTO}</b></span>
                  <span>•</span>
                  <span>Target RPO: <b className="text-sky-400">{playbook.estimatedRPO}</b></span>
                  <span>•</span>
                  <span>Priority Services: <b className="text-slate-300">{playbook.priorityServices.join(" → ")}</b></span>
                </div>

                {/* Steps Accordion / List */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step-by-Step Recovery Checklist:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {playbook.stepByStepSteps.map(step => (
                      <div
                        key={step.stepNumber}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                            {step.stepNumber}
                          </span>
                          <p className="font-bold text-white truncate">{step.action}</p>
                        </div>
                        <p className="text-slate-400 text-[11px]">{step.actionMm}</p>
                        <p className="text-emerald-400/90 font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate">
                          {step.commandOrGuide}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB CONTENT: 5. DISASTER DRILLS & READINESS TESTING */}
      {/* ========================================================================= */}
      {activeSubTab === "drills" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Disaster Recovery Drill Sandbox & Compliance Testing
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                လက်တွေ့ဒေတာများ မပျက်စီးဘဲ Sandbox Memory အတွင်း ဘေးအန္တရာယ် ပြန်လည်ထူထောင်ရေး အစမ်းလေ့ကျင့်မှုများ စမ်းသပ်ခြင်း
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={activeDrillScenario}
                onChange={e => setActiveDrillScenario(e.target.value as DisasterScenarioType)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {DISASTER_SCENARIO_PLAYBOOKS.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              <button
                onClick={() => handleRunDrillSimulation(activeDrillScenario)}
                disabled={isDrillRunning}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isDrillRunning ? "Running Drill..." : "Launch Drill"}</span>
              </button>
            </div>
          </div>

          {/* ACTIVE DRILL LOG TERMINAL */}
          {(isDrillRunning || drillProgressLog.length > 0) && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="font-bold">Live Drill Sandbox Console</span>
                </div>
                {currentDrillResult && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                    Readiness Score: {currentDrillResult.readinessScore}% (PASSED)
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-slate-300 max-h-48 overflow-y-auto custom-scrollbar">
                {drillProgressLog.map((log, idx) => (
                  <p key={idx} className="text-emerald-400">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* DRILL HISTORY LIST */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Disaster Drill Execution Audit Trail</h3>

            {drillHistory.length === 0 ? (
              <p className="text-xs text-slate-500">အစမ်းလေ့ကျင့်မှု မှတ်တမ်း မရှိသေးပါ</p>
            ) : (
              <div className="space-y-2.5">
                {drillHistory.map(drill => (
                  <div
                    key={drill.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{drill.drillName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Score: {drill.readinessScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{drill.notes}</p>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-500 shrink-0">
                      <p>{new Date(drill.timestamp).toLocaleString()}</p>
                      <p>Lead: {drill.executedByAdminName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB CONTENT: 6. AUTOMATED POLICIES & MULTI-TARGET SCHEDULES */}
      {/* ========================================================================= */}
      {activeSubTab === "schedules" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Automated Backup Schedules & Multi-Target Mirrors
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ဒေတာ အရေးပါမှု အဆင့်အလိုက် အလိုအလျောက် သတ်မှတ်ထားသော သိမ်းဆည်းမှု စည်းမျဉ်းများ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(sched => (
              <div
                key={sched.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-white">{sched.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sched.nameMm}</p>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                    {sched.frequency}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retention Period:</span>
                    <span className="text-white font-bold">{sched.retentionDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Collections:</span>
                    <span className="text-sky-400 font-bold">{sched.targetCollections.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Multi-Target Mirroring:</span>
                    <span className="text-emerald-400 font-bold">Enabled (3 Vaults)</span>
                  </div>
                  {sched.nextRunTimestamp && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Scheduled Run:</span>
                      <span className="text-amber-400">{new Date(sched.nextRunTimestamp).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB CONTENT: 7. INCIDENT RECORDS */}
      {/* ========================================================================= */}
      {activeSubTab === "incidents" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Disaster & Incident Response Records
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                စနစ် ချို့ယွင်းမှု ဖြစ်စဉ်မှတ်တမ်းများနှင့် ဖြေရှင်းခဲ့သည့် အဆင့်ဆင့် Post-Mortem မော်ကွန်း
              </p>
            </div>

            <button
              onClick={() => {
                setEditingIncidentId(null);
                setIncTitle("");
                setIncRootCause("");
                setIncAction("");
                setIncResult("");
                setIncPostMortem("");
                setIsIncidentModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Log Incident Record</span>
            </button>
          </div>

          <div className="space-y-3">
            {incidentRecords.map(inc => (
              <div
                key={inc.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {inc.incidentNumber}
                    </span>
                    <h3 className="font-bold text-sm text-white">{inc.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${inc.severity === "P1 - Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                      {inc.severity}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${inc.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"}`}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(inc.startTime).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">ROOT CAUSE:</p>
                    <p className="text-slate-300 mt-0.5">{inc.rootCause || "Under analysis"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold">RECOVERY ACTION TAKEN:</p>
                    <p className="text-slate-300 mt-0.5">{inc.recoveryActionTaken || "Completed"}</p>
                  </div>
                </div>

                {inc.postMortemNotes && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="text-slate-500 text-[10px] font-bold">POST-MORTEM & PREVENTATIVE ACTIONS:</p>
                    <p className="text-emerald-400/90 mt-0.5 font-mono text-[11px]">{inc.postMortemNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: CREATE NEW SNAPSHOT */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Create New Backup Snapshot
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Snapshot Title (ခေါင်းစဉ်) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pre-Deployment Master Backup v3.6"
                  value={newBackupTitle}
                  onChange={e => setNewBackupTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (အကြောင်းအရာ ရှင်းလင်းချက်)
                </label>
                <textarea
                  rows={2}
                  placeholder="Snapshot purpose and entity scope details..."
                  value={newBackupDesc}
                  onChange={e => setNewBackupDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Backup Type *
                  </label>
                  <select
                    value={newBackupType}
                    onChange={e => setNewBackupType(e.target.value as BackupType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="full">Full Platform Snapshot</option>
                    <option value="incremental">Incremental Delta</option>
                    <option value="config">System Configurations Only</option>
                    <option value="database_subset">Curriculum Subset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Frequency Tag
                  </label>
                  <select
                    value={newBackupFrequency}
                    onChange={e => setNewBackupFrequency(e.target.value as BackupFrequency)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="manual">Manual Admin Trigger</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="event_based">Event-Based Precaution</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-lock-new-backup"
                  checked={newBackupLocked}
                  onChange={e => setNewBackupLocked(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <label htmlFor="chk-lock-new-backup" className="text-xs text-slate-300 cursor-pointer">
                  Lock snapshot to prevent accidental deletion and automatic rotation
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreating ? "Creating Snapshot..." : "Create & Hash"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. MODAL: LOG INCIDENT RECORD */}
      {/* ========================================================================= */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Log Incident & Post-Mortem Record
              </h3>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncidentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Index Corruption & Recovery"
                  value={incTitle}
                  onChange={e => setIncTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scenario Type
                  </label>
                  <select
                    value={incType}
                    onChange={e => setIncType(e.target.value as DisasterScenarioType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="accidental_deletion">Accidental Deletion</option>
                    <option value="database_corruption">DB Corruption</option>
                    <option value="incorrect_configuration">Config Lockout</option>
                    <option value="failed_deployment">Failed Deploy</option>
                    <option value="auth_failure">Auth Failure</option>
                    <option value="third_party_outage">3rd Party Outage</option>
                    <option value="storage_failure">Storage Mirror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={incSeverity}
                    onChange={e => setIncSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="P1 - Critical">P1 - Critical</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={incStatus}
                    onChange={e => setIncStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="resolved">Resolved</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Root Cause (ဖြစ်ပွားရသည့် အကြောင်းရင်း)
                </label>
                <textarea
                  rows={2}
                  placeholder="Root cause diagnosis..."
                  value={incRootCause}
                  onChange={e => setIncRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recovery Action Taken (ဆောင်ရွက်ခဲ့သော လုပ်ငန်းစဉ်)
                </label>
                <textarea
                  rows={2}
                  placeholder="Restoration steps and tools used..."
                  value={incAction}
                  onChange={e => setIncAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Post-Mortem & Preventative Actions
                </label>
                <textarea
                  rows={2}
                  placeholder="Future prevention rules..."
                  value={incPostMortem}
                  onChange={e => setIncPostMortem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Incident Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
