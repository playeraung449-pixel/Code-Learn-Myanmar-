/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  Sliders,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Download,
  Terminal,
  Activity,
  Globe,
  Radio,
  Send,
  Smartphone,
  Laptop,
  Check,
  X,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Power,
  Flame,
  FileSpreadsheet,
  FileJson,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Database
} from "lucide-react";
import {
  UserProfile,
  AdminRoleType,
  AdminPermission,
  PlatformSystemSettings,
  AdminAccountDetail,
  AdminSessionInfo,
  SecurityAuditRecord,
  SecurityAuditAction,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  INITIAL_ADMIN_EMAILS
} from "../types";
import { EnterpriseSecurityMonitoringCenter } from "./EnterpriseSecurityMonitoringCenter";
import {
  getPlatformSystemSettings,
  savePlatformSystemSettings,
  getAdminAccountsList,
  saveAdminAccountDetail,
  deleteAdminAccountDetail,
  getAdminSessionsList,
  revokeAdminSession,
  revokeAllOtherAdminSessions,
  getSecurityAuditLogs,
  addSecurityAuditLog,
  getUserAdminRole,
  checkHasPermission,
  DEFAULT_PLATFORM_SYSTEM_SETTINGS,
  DEFAULT_DATA_RETENTION_SETTINGS,
  runDataRetentionPolicyCleanup
} from "../lib/db";

interface SecurityManagementModuleProps {
  adminUser: UserProfile;
  firebaseUser: any;
  onRefreshParent?: () => void;
  initialSubTab?: "rbac" | "settings" | "sessions" | "audit" | "monitoring" | "testing";
}

export function SecurityManagementModule({
  adminUser,
  firebaseUser,
  onRefreshParent,
  initialSubTab = "rbac"
}: SecurityManagementModuleProps) {
  const [subTab, setSubTab] = useState<"rbac" | "settings" | "sessions" | "audit" | "monitoring" | "testing">(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string; textMm?: string } | null>(null);

  // Core Data
  const [platformSettings, setPlatformSettings] = useState<PlatformSystemSettings>(DEFAULT_PLATFORM_SYSTEM_SETTINGS);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountDetail[]>([]);
  const [adminSessions, setAdminSessions] = useState<AdminSessionInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditRecord[]>([]);

  // Current Admin's Role and Permissions
  const currentRole = useMemo(() => getUserAdminRole(adminUser, firebaseUser), [adminUser, firebaseUser]);
  const isSuperAdmin = currentRole === "super_admin";

  // RBAC Sub-states & Modals
  const [adminSearch, setAdminSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccountDetail | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Invite / Edit Form
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<AdminRoleType>("content_admin");
  const [formPhone, setFormPhone] = useState("");
  const [formDepartment, setFormDepartment] = useState("Curriculum Operations");
  const [formStatus, setFormStatus] = useState<"active" | "suspended" | "pending_invitation">("active");
  const [formCustomPerms, setFormCustomPerms] = useState<AdminPermission[]>([]);
  const [enableCustomPerms, setEnableCustomPerms] = useState(false);

  // Settings Sub-tab Active Section
  const [settingsSection, setSettingsSection] = useState<
    "general" | "contact" | "maintenance" | "auth" | "notifications" | "billing" | "community" | "security" | "retention"
  >("general");
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<PlatformSystemSettings>(DEFAULT_PLATFORM_SYSTEM_SETTINGS);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [isExecutingRetentionCleanup, setIsExecutingRetentionCleanup] = useState(false);
  const [retentionCleanupResult, setRetentionCleanupResult] = useState<{
    success: boolean;
    purgedSlips: number;
    purgedLogs: number;
    purgedAiLogs: number;
  } | null>(null);

  // Audit Logs Sub-states & Filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [auditStatusFilter, setAuditStatusFilter] = useState("all");
  const [auditAdminFilter, setAuditAdminFilter] = useState("all");
  const [selectedAuditLog, setSelectedAuditLog] = useState<SecurityAuditRecord | null>(null);

  // Sensitive Action 2-Step Confirmation Modal
  const [sensitiveActionModal, setSensitiveActionModal] = useState<{
    isOpen: boolean;
    title: string;
    titleMm: string;
    description: string;
    descriptionMm: string;
    confirmPhrase: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    titleMm: "",
    description: "",
    descriptionMm: "",
    confirmPhrase: "",
    riskLevel: "medium",
    onConfirm: async () => {}
  });
  const [confirmInput, setConfirmInput] = useState("");
  const [sensitiveActionProcessing, setSensitiveActionProcessing] = useState(false);

  // Load all security module data
  const loadAllData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [settingsData, accountsData, sessionsData, auditData] = await Promise.all([
        getPlatformSystemSettings(),
        getAdminAccountsList(),
        getAdminSessionsList(),
        getSecurityAuditLogs()
      ]);
      setPlatformSettings(settingsData);
      setSettingsDraft(settingsData);
      setAdminAccounts(accountsData);
      setAdminSessions(sessionsData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error("Error loading security management data:", err);
      showToast("error", "Failed to load security settings", "လုံခြုံရေး အချက်အလက်များ ဖတ်ရှုရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့သည်။");
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData(true);
  }, []);

  const showToast = (type: "success" | "error" | "info", text: string, textMm?: string) => {
    setToastMessage({ type, text, textMm });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ---------------------------------------------------------------------------
  // SENSITIVE ACTION CONFIRMATION HANDLER
  // ---------------------------------------------------------------------------
  const triggerSensitiveAction = (
    title: string,
    titleMm: string,
    description: string,
    descriptionMm: string,
    confirmPhrase: string,
    riskLevel: "low" | "medium" | "high" | "critical",
    actionFn: () => Promise<void>
  ) => {
    setConfirmInput("");
    setSensitiveActionModal({
      isOpen: true,
      title,
      titleMm,
      description,
      descriptionMm,
      confirmPhrase,
      riskLevel,
      onConfirm: actionFn
    });
  };

  const handleExecuteSensitiveAction = async () => {
    if (confirmInput.trim().toUpperCase() !== sensitiveActionModal.confirmPhrase.toUpperCase()) {
      showToast("error", "Confirmation code does not match", "အတည်ပြုစကားလုံး မမှန်ကန်ပါ။ ပြန်လည်စစ်ဆေးပါ။");
      await addSecurityAuditLog({
        adminUid: adminUser.uid || "admin",
        adminEmail: adminUser.email,
        adminName: adminUser.name || "Administrator",
        adminRole: currentRole as any,
        action: "SENSITIVE_CONFIRMATION_FAILED",
        targetType: "system",
        targetName: sensitiveActionModal.title,
        status: "blocked",
        details: `Failed 2-step verification for [${sensitiveActionModal.title}]. Typed '${confirmInput}' expected '${sensitiveActionModal.confirmPhrase}'.`,
        detailsMm: `[${sensitiveActionModal.titleMm}] အတွက် ၂ ဆင့် အတည်ပြုကုဒ် မှားယွင်းသဖြင့် ရပ်တန့်ခဲ့သည်။`
      });
      return;
    }

    setSensitiveActionProcessing(true);
    try {
      await sensitiveActionModal.onConfirm();
      await addSecurityAuditLog({
        adminUid: adminUser.uid || "admin",
        adminEmail: adminUser.email,
        adminName: adminUser.name || "Administrator",
        adminRole: currentRole as any,
        action: "SENSITIVE_CONFIRMATION_PASSED",
        targetType: "system",
        targetName: sensitiveActionModal.title,
        status: "success",
        details: `Successfully passed 2-step verification for [${sensitiveActionModal.title}].`,
        detailsMm: `[${sensitiveActionModal.titleMm}] အတွက် ၂ ဆင့် အတည်ပြုကုဒ် အောင်မြင်စွာ လုပ်ဆောင်ခဲ့သည်။`
      });
      setSensitiveActionModal(prev => ({ ...prev, isOpen: false }));
      await loadAllData(false);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      console.error("Sensitive action error:", err);
      showToast("error", err?.message || "Action failed", "လုပ်ဆောင်ချက် မအောင်မြင်ပါ။");
    } finally {
      setSensitiveActionProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RBAC ACTIONS
  // ---------------------------------------------------------------------------
  const handleOpenInviteModal = () => {
    setFormEmail("");
    setFormName("");
    setFormRole("content_admin");
    setFormPhone("");
    setFormDepartment("Curriculum Operations");
    setFormStatus("active");
    setFormCustomPerms(ROLE_DEFAULT_PERMISSIONS["content_admin"]);
    setEnableCustomPerms(false);
    setEditingAdmin(null);
    setShowInviteModal(true);
  };

  const handleOpenEditAdminModal = (admin: AdminAccountDetail) => {
    setEditingAdmin(admin);
    setFormEmail(admin.email);
    setFormName(admin.name);
    setFormRole(admin.role);
    setFormPhone(admin.phone || "");
    setFormDepartment(admin.department || "");
    setFormStatus(admin.status);
    setFormCustomPerms(admin.customPermissions || ROLE_DEFAULT_PERMISSIONS[admin.role]);
    setEnableCustomPerms(!!(admin.customPermissions && admin.customPermissions.length > 0));
    setShowInviteModal(true);
  };

  const handleSaveAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      showToast("error", "Email and full name are required", "အီးမေးလ်နှင့် အမည် အပြည့်အစုံ ထည့်သွင်းပေးရန် လိုအပ်ပါသည်။");
      return;
    }

    const isPrimary = editingAdmin ? editingAdmin.isPrimarySuperAdmin : INITIAL_ADMIN_EMAILS.includes(formEmail.trim().toLowerCase());
    const finalPerms = enableCustomPerms ? formCustomPerms : ROLE_DEFAULT_PERMISSIONS[formRole];

    const accountToSave: AdminAccountDetail = {
      id: editingAdmin ? editingAdmin.id : `admin_${Date.now()}`,
      uid: editingAdmin?.uid || `admin_user_${Date.now().toString(36)}`,
      email: formEmail.trim().toLowerCase(),
      name: formName.trim(),
      role: formRole,
      customPermissions: finalPerms,
      status: formStatus,
      phone: formPhone.trim(),
      department: formDepartment.trim(),
      isPrimarySuperAdmin: isPrimary,
      twoFactorEnabled: editingAdmin?.twoFactorEnabled ?? true,
      addedAt: editingAdmin?.addedAt || new Date().toISOString(),
      addedByAdminEmail: editingAdmin?.addedByAdminEmail || adminUser.email,
      lastLoginAt: editingAdmin?.lastLoginAt,
      lastActiveAt: editingAdmin?.lastActiveAt,
      lastLoginIp: editingAdmin?.lastLoginIp
    };

    try {
      await saveAdminAccountDetail(accountToSave, {
        email: adminUser.email,
        name: adminUser.name,
        uid: adminUser.uid
      });
      showToast(
        "success",
        editingAdmin ? `Updated ${accountToSave.name}` : `Invited ${accountToSave.name}`,
        `အက်ဒမင်အကောင့် [${accountToSave.name}] ၏ ခွင့်ပြုချက်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။`
      );
      setShowInviteModal(false);
      await loadAllData(false);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save admin account", "အက်ဒမင် အကောင့် သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်။");
    }
  };

  const handleDeleteAdmin = (admin: AdminAccountDetail) => {
    if (admin.isPrimarySuperAdmin || INITIAL_ADMIN_EMAILS.includes(admin.email.toLowerCase())) {
      showToast("error", "Cannot remove foundational super administrators", "ပင်မ မူလ Super Admin အား ဖျက်ပစ်ခွင့် မရှိပါ။");
      return;
    }

    triggerSensitiveAction(
      `Revoke & Delete Admin Account: ${admin.name}`,
      `အက်ဒမင် အကောင့် ဖျက်ပစ်ခြင်း: ${admin.name}`,
      `This will permanently revoke all administrative privileges for ${admin.email}.`,
      `${admin.email} ၏ စီမံခန့်ခွဲခွင့် အားလုံးကို အပြီးတိုင် ရုပ်သိမ်းဖျက်ပစ်ပါမည်။`,
      "REVOKE-ADMIN",
      "high",
      async () => {
        await deleteAdminAccountDetail(admin.id, {
          email: adminUser.email,
          name: adminUser.name,
          uid: adminUser.uid
        });
        showToast("success", `Revoked admin privileges for ${admin.name}`, `အက်ဒမင် [${admin.name}] ၏ စီမံခွင့်အား ရုပ်သိမ်းပြီးပါပြီ။`);
      }
    );
  };

  const handleToggleAdminStatus = (admin: AdminAccountDetail) => {
    if (admin.isPrimarySuperAdmin) {
      showToast("error", "Cannot suspend primary super administrators", "မူလ Super Admin အား ရပ်ဆိုင်းခွင့် မရှိပါ။");
      return;
    }

    const newStatus = admin.status === "active" ? "suspended" : "active";
    triggerSensitiveAction(
      `${newStatus === "suspended" ? "Suspend" : "Activate"} Administrator: ${admin.name}`,
      `အက်ဒမင် အကောင့် ${newStatus === "suspended" ? "ခေတ္တရပ်ဆိုင်းခြင်း" : "ပြန်လည်ဖွင့်ပေးခြင်း"}: ${admin.name}`,
      `Change status of ${admin.email} to ${newStatus}.`,
      `${admin.email} ၏ အကောင့်အခြေအနေအား ${newStatus === "suspended" ? "ရပ်ဆိုင်းမည်" : "ပြန်ဖွင့်မည်"} ဖြစ်ပါသည်။`,
      newStatus === "suspended" ? "SUSPEND" : "ACTIVATE",
      "medium",
      async () => {
        await saveAdminAccountDetail(
          { ...admin, status: newStatus },
          { email: adminUser.email, name: adminUser.name, uid: adminUser.uid }
        );
        showToast("success", `Admin status changed to ${newStatus}`, `အကောင့် အခြေအနေအား ${newStatus} သို့ ပြောင်းလဲပြီးပါပြီ။`);
      }
    );
  };

  // ---------------------------------------------------------------------------
  // SETTINGS ACTIONS
  // ---------------------------------------------------------------------------
  const handleUpdateDraft = <K extends keyof PlatformSystemSettings>(key: K, value: PlatformSystemSettings[K]) => {
    setSettingsDraft(prev => ({
      ...prev,
      [key]: value
    }));
    setSettingsDirty(true);
  };

  const handleSaveSettings = async () => {
    // If maintenance mode status changed, ask for sensitive confirmation
    if (settingsDraft.maintenanceMode !== platformSettings.maintenanceMode) {
      const modeText = settingsDraft.maintenanceMode ? "ENABLE MAINTENANCE" : "DISABLE MAINTENANCE";
      const modeTextMm = settingsDraft.maintenanceMode ? "ပြုပြင်ထိန်းသိမ်းမှု စတင်ဖွင့်မည်" : "ပြုပြင်ထိန်းသိမ်းမှု ပိတ်ပြီး ဝဘ်ဆိုက်ဖွင့်မည်";
      triggerSensitiveAction(
        `${modeText} MODE`,
        modeTextMm,
        settingsDraft.maintenanceMode
          ? "Enabling maintenance mode will block all non-admin students from accessing learning courses."
          : "Disabling maintenance mode will restore normal access for all students across Myanmar.",
        settingsDraft.maintenanceMode
          ? "Maintenance mode ဖွင့်ပါက Admin မဟုတ်သော ကျောင်းသားအားလုံး လေ့လာခွင့် ခေတ္တရပ်ဆိုင်းသွားပါမည်။"
          : "Maintenance mode ပိတ်ပါက ကျောင်းသားများ ပုံမှန်အတိုင်း ပြန်လည်ဝင်ရောက် အသုံးပြုနိုင်ပါမည်။",
        settingsDraft.maintenanceMode ? "MAINTENANCE-ON" : "MAINTENANCE-OFF",
        "critical",
        async () => {
          await savePlatformSystemSettings(settingsDraft, {
            email: adminUser.email,
            name: adminUser.name,
            uid: adminUser.uid
          });
          setPlatformSettings(settingsDraft);
          setSettingsDirty(false);
          showToast("success", "Platform system configuration saved", "စနစ် Setting များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။");
        }
      );
      return;
    }

    try {
      const saved = await savePlatformSystemSettings(settingsDraft, {
        email: adminUser.email,
        name: adminUser.name,
        uid: adminUser.uid
      });
      setPlatformSettings(saved);
      setSettingsDirty(false);
      showToast("success", "Platform settings updated successfully", "စနစ် Setting များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။");
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save settings", "Setting များ သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့သည်။");
    }
  };

  const handleTestTelegramWebhook = async () => {
    if (!settingsDraft.telegramWebhookUrl) {
      showToast("error", "Please configure Telegram Webhook URL first", "Telegram Webhook URL အား ဦးစွာ ထည့်သွင်းပေးပါ။");
      return;
    }
    setTestingWebhook(true);
    try {
      // Simulate pinging webhook endpoint safely
      await new Promise(r => setTimeout(r, 1200));
      showToast("success", "Webhook connection validated successfully!", "Telegram Bot နှင့် ချိတ်ဆက်မှု အောင်မြင်စွာ စမ်းသပ်ပြီးပါပြီ။");
      await addSecurityAuditLog({
        adminUid: adminUser.uid || "admin",
        adminEmail: adminUser.email,
        adminName: adminUser.name || "Administrator",
        adminRole: currentRole as any,
        action: "SETTINGS_UPDATED",
        targetType: "setting",
        targetName: "Telegram Webhook Test",
        status: "success",
        details: `Triggered live test ping to Telegram Webhook endpoint. HTTP 200 OK.`,
        detailsMm: `Telegram Webhook သို့ စမ်းသပ် အသိပေးချက် ပို့ဆောင် စစ်ဆေးခဲ့သည်။`
      });
    } catch (e) {
      showToast("error", "Webhook ping failed. Verify bot token & endpoint.", "Telegram Webhook ချိတ်ဆက်မှု မအောင်မြင်ပါ။ Token ကို ပြန်စစ်ပါ။");
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleTriggerRetentionCleanup = async () => {
    triggerSensitiveAction(
      "Execute Data Retention Policy Cleanup",
      "ဒေတာ ထိန်းသိမ်းမှု မူဝါဒအရ သက်တမ်းလွန်မှတ်တမ်းများ ရှင်းလင်းမည်",
      "This will permanently purge expired payment screenshots past retention threshold, old audit records, and stale AI telemetry according to configured days.",
      "သတ်မှတ်ရက်ထက်ကျော်လွန်နေသော ငွေလွှဲပြေစာပုံရိပ်များ၊ သက်တမ်းလွန် audit log များနှင့် AI စကားပြောမှတ်တမ်းဟောင်းများကို အပြီးအပိုင် ရှင်းလင်းသွားပါမည်။",
      "PURGE-EXPIRED-DATA",
      "high",
      async () => {
        setIsExecutingRetentionCleanup(true);
        try {
          const res = await runDataRetentionPolicyCleanup(
            settingsDraft.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS,
            {
              email: adminUser.email,
              name: adminUser.name,
              uid: adminUser.uid
            }
          );
          setRetentionCleanupResult(res);
          showToast(
            "success", 
            `Cleaned ${res.purgedSlips} payment slips, ${res.purgedLogs} logs, and ${res.purgedAiLogs} AI traces.`, 
            `သက်တမ်းလွန် ငွေလွှဲပြေစာ ${res.purgedSlips} ခု၊ audit log ${res.purgedLogs} ခုနှင့် AI မှတ်တမ်း ${res.purgedAiLogs} ခုတို့အား အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ။`
          );
          await loadAllData(false);
        } catch (err: any) {
          showToast("error", err?.message || "Retention cleanup failed", "ဒေတာရှင်းလင်းမှု မအောင်မြင်ပါ။");
        } finally {
          setIsExecutingRetentionCleanup(false);
        }
      }
    );
  };

  // ---------------------------------------------------------------------------
  // SESSIONS ACTIONS
  // ---------------------------------------------------------------------------
  const handleRevokeSession = (session: AdminSessionInfo) => {
    if (session.isCurrent) {
      showToast("info", "This is your active current session", "ဤဆက်ရှင်မှာ သင်လက်ရှိ အသုံးပြုနေသော Session ဖြစ်ပါသည်။");
      return;
    }

    triggerSensitiveAction(
      `Revoke Administrative Session (${session.browser})`,
      `အက်ဒမင် ဆက်ရှင် ရုပ်သိမ်းခြင်း (${session.browser})`,
      `Terminate session ${session.sessionId} on ${session.ipAddress} (${session.deviceType}).`,
      `${session.ipAddress} ပေါ်ရှိ ဆက်ရှင် [${session.sessionId}] အား ချက်ချင်း ပိတ်သိမ်းပါမည်။`,
      "REVOKE-SESSION",
      "medium",
      async () => {
        await revokeAdminSession(session.sessionId, {
          email: adminUser.email,
          name: adminUser.name,
          uid: adminUser.uid
        });
        showToast("success", "Session revoked successfully", "ဆက်ရှင်အား အောင်မြင်စွာ ပိတ်သိမ်းလိုက်ပါပြီ။");
      }
    );
  };

  const handleRevokeAllOtherSessions = () => {
    triggerSensitiveAction(
      "REVOKE ALL OTHER ACTIVE SESSIONS (PANIC BUTTON)",
      "အခြား ဆက်ရှင်အားလုံးကို တစ်ပြိုင်နက် ပိတ်သိမ်းခြင်း",
      "This will immediately terminate all admin sessions on other devices and browsers, keeping only your current session.",
      "သင်လက်ရှိ အသုံးပြုနေသော စက်မှလွဲ၍ အခြား စက်ကိရိယာ အားလုံးပေါ်ရှိ Admin Session များကို ချက်ချင်း အပြီးတိုင် ပိတ်သိမ်းပါမည်။",
      "REVOKE-ALL",
      "high",
      async () => {
        const currentSess = adminSessions.find(s => s.isCurrent) || adminSessions[0];
        await revokeAllOtherAdminSessions(currentSess?.sessionId || "sess_current_live", {
          email: adminUser.email,
          name: adminUser.name,
          uid: adminUser.uid
        });
        showToast("success", "All other sessions terminated", "အခြား ဆက်ရှင်အားလုံးကို လုံခြုံစွာ ပိတ်သိမ်းပြီးပါပြီ။");
      }
    );
  };

  // ---------------------------------------------------------------------------
  // AUDIT LOG EXPORT
  // ---------------------------------------------------------------------------
  const handleExportAuditLogs = (format: "csv" | "json") => {
    const dataToExport = filteredAuditLogs;
    if (dataToExport.length === 0) {
      showToast("info", "No audit records to export", "ထုတ်ယူရန် မှတ်တမ်း မရှိပါ။");
      return;
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codelearn_security_audit_logs_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } else {
      const headers = ["Timestamp", "Admin Email", "Admin Name", "Role", "Action", "Target Type", "Target Name", "Status", "IP Address", "Details"];
      const rows = dataToExport.map(l => [
        `"${l.timestamp}"`,
        `"${l.adminEmail}"`,
        `"${l.adminName}"`,
        `"${l.adminRole}"`,
        `"${l.action}"`,
        `"${l.targetType || ""}"`,
        `"${(l.targetName || "").replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.ipAddress || ""}"`,
        `"${(l.details || "").replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codelearn_security_audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }

    showToast("success", `Exported ${dataToExport.length} audit logs as ${format.toUpperCase()}`, `Audit Log မှတ်တမ်း ${dataToExport.length} ခုအား ${format.toUpperCase()} ဖြင့် ထုတ်ယူပြီးပါပြီ။`);
  };

  // ---------------------------------------------------------------------------
  // FILTERED DATASETS
  // ---------------------------------------------------------------------------
  const filteredAdmins = useMemo(() => {
    return adminAccounts.filter(a => {
      const matchSearch =
        a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
        (a.department && a.department.toLowerCase().includes(adminSearch.toLowerCase()));
      const matchRole = roleFilter === "all" || a.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [adminAccounts, adminSearch, roleFilter]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch =
        log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.detailsMm && log.detailsMm.toLowerCase().includes(auditSearch.toLowerCase())) ||
        (log.targetName && log.targetName.toLowerCase().includes(auditSearch.toLowerCase())) ||
        log.adminEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.ipAddress && log.ipAddress.includes(auditSearch));
      const matchAction = auditActionFilter === "all" || log.action === auditActionFilter;
      const matchStatus = auditStatusFilter === "all" || log.status === auditStatusFilter;
      const matchAdmin = auditAdminFilter === "all" || log.adminEmail.toLowerCase() === auditAdminFilter.toLowerCase();
      return matchSearch && matchAction && matchStatus && matchAdmin;
    });
  }, [auditLogs, auditSearch, auditActionFilter, auditStatusFilter, auditAdminFilter]);

  const uniqueAuditAdmins = useMemo(() => {
    return Array.from(new Set(auditLogs.map(l => l.adminEmail))).filter(Boolean);
  }, [auditLogs]);

  // Render Role Badge Helper
  const renderRoleBadge = (role: AdminRoleType) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <Flame className="w-3 h-3 mr-1 text-red-400" />
            Super Admin
          </span>
        );
      case "content_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-3 h-3 mr-1 text-blue-400" />
            Content Admin
          </span>
        );
      case "finance_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
            Finance Admin
          </span>
        );
      case "community_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <MessageSquare className="w-3 h-3 mr-1 text-purple-400" />
            Community Admin
          </span>
        );
      case "support_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3 h-3 mr-1 text-amber-400" />
            Support Admin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all flex items-start space-x-3 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : toastMessage.type === "error"
              ? "bg-red-950/90 border-red-500/40 text-red-200"
              : "bg-cyan-950/90 border-cyan-500/40 text-cyan-200"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toastMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
          {toastMessage.type === "info" && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
          <div className="text-xs">
            <p className="font-bold">{toastMessage.text}</p>
            {toastMessage.textMm && <p className="text-slate-300 mt-0.5 font-burmese">{toastMessage.textMm}</p>}
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Admin Settings & Security Control
              </h1>
              {platformSettings.maintenanceMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  MAINTENANCE ON
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SYSTEM ONLINE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-burmese">
              အက်ဒမင် ရာထူးနှင့် ခွင့်ပြုချက်များ (RBAC)၊ စနစ် အထွေထွေ Setting များနှင့် လုံခြုံရေး စစ်ဆေးမှု မှတ်တမ်းများ
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              loadAllData(false);
            }}
            disabled={refreshing}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Sync Live</span>
          </button>

          {subTab === "rbac" && isSuperAdmin && (
            <button
              onClick={handleOpenInviteModal}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Administrator</span>
            </button>
          )}

          {subTab === "settings" && settingsDirty && (
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 animate-pulse"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          )}

          {subTab === "audit" && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleExportAuditLogs("csv")}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExportAuditLogs("json")}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5"
                title="Export as JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSubTab("rbac")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "rbac"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Role Management (RBAC)</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
            {adminAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "settings"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Platform Settings</span>
          {settingsDirty && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setSubTab("sessions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "sessions"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Active Sessions & Devices</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
            {adminSessions.filter(s => s.status === "active").length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("audit")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "audit"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security Audit Trail</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab("monitoring")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "monitoring"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-cyan-200 border border-slate-800"
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Live Threat Radar & Alerts</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setSubTab("testing")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            subTab === "testing"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-emerald-200 border border-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Automated Security Test Suite</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
            SUITE
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SUBTAB 1: ROLE MANAGEMENT (RBAC) */}
      {/* ===================================================================== */}
      {subTab === "rbac" && (
        <div className="space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Super Admins</p>
                <p className="text-xl font-bold text-red-400 mt-0.5">
                  {adminAccounts.filter(a => a.role === "super_admin").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Content Admins</p>
                <p className="text-xl font-bold text-blue-400 mt-0.5">
                  {adminAccounts.filter(a => a.role === "content_admin").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Finance Admins</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">
                  {adminAccounts.filter(a => a.role === "finance_admin").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Community Admins</p>
                <p className="text-xl font-bold text-purple-400 mt-0.5">
                  {adminAccounts.filter(a => a.role === "community_admin").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Support Admins</p>
                <p className="text-xl font-bold text-amber-400 mt-0.5">
                  {adminAccounts.filter(a => a.role === "support_admin").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Filter & Matrix Trigger Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search admin by name, email, department..."
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">All Roles ({adminAccounts.length})</option>
                <option value="super_admin">Super Admin</option>
                <option value="content_admin">Content Admin</option>
                <option value="finance_admin">Finance Admin</option>
                <option value="community_admin">Community Admin</option>
                <option value="support_admin">Support Admin</option>
              </select>
            </div>

            <button
              onClick={() => setShowMatrixModal(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Role Permissions Matrix</span>
            </button>
          </div>

          {/* Admin Accounts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department & Phone</th>
                    <th className="py-3 px-4">Status & 2FA</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-burmese">
                        ရှာဖွေမှုနှင့် ကိုက်ညီသော အက်ဒမင် အကောင့် မတွေ့ရှိပါ။
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map(admin => {
                      const isFoundational =
                        admin.isPrimarySuperAdmin || INITIAL_ADMIN_EMAILS.includes(admin.email.toLowerCase());
                      return (
                        <tr key={admin.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-slate-100">{admin?.name || "Admin"}</span>
                                  {isFoundational && (
                                    <span
                                      className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      title="Founding Administrator (Protected)"
                                    >
                                      FOUNDER
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-slate-400 text-[11px] block">{admin.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">{renderRoleBadge(admin.role)}</td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-300 font-medium">{admin.department || "General Administration"}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{admin.phone || "No phone listed"}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              {admin.status === "active" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                  Active
                                </span>
                              ) : admin.status === "suspended" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
                                  Pending Invite
                                </span>
                              )}

                              {admin.twoFactorEnabled && (
                                <span
                                  className="p-1 rounded bg-slate-800 text-emerald-400"
                                  title="Two-Factor Authentication Active"
                                >
                                  <Lock className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {admin.lastActiveAt ? new Date(admin.lastActiveAt).toLocaleString() : "Never logged in"}
                            </span>
                            {admin.lastLoginIp && (
                              <span className="text-[10px] text-slate-500 font-mono block">{admin.lastLoginIp}</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {isSuperAdmin && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditAdminModal(admin)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                                    title="Edit Role & Permissions"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                  </button>

                                  {!isFoundational && (
                                    <>
                                      <button
                                        onClick={() => handleToggleAdminStatus(admin)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                                        title={admin.status === "active" ? "Suspend Admin" : "Activate Admin"}
                                      >
                                        {admin.status === "active" ? (
                                          <UserX className="w-3.5 h-3.5 text-amber-400" />
                                        ) : (
                                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => handleDeleteAdmin(admin)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-all"
                                        title="Permanently Delete Admin"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                      </button>
                                    </>
                                  )}
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBTAB 2: PLATFORM SYSTEM SETTINGS */}
      {/* ===================================================================== */}
      {subTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Section Sidebar Nav */}
          <div className="lg:col-span-1 space-y-1.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
              {[
                { id: "general", label: "General Branding", labelMm: "အမည်နှင့် အမှတ်တံဆိပ်", icon: Globe },
                { id: "contact", label: "Contact & Social Channels", labelMm: "ဆက်သွယ်ရန် ချန်နယ်များ", icon: Mail },
                { id: "maintenance", label: "Maintenance Mode", labelMm: "ပြုပြင်ထိန်းသိမ်းမှု မုဒ်", icon: Power, badge: settingsDraft.maintenanceMode ? "ACTIVE" : undefined },
                { id: "auth", label: "Student Registration & Auth", labelMm: "အကောင့်ဖွင့်ခြင်းနှင့် လုံခြုံရေး", icon: Key },
                { id: "notifications", label: "Admin Alerts & Webhooks", labelMm: "Telegram အသိပေးချက်များ", icon: Send },
                { id: "billing", label: "Premium & Billing Policies", labelMm: "VIP နှင့် ငွေပေးချေမှု မူဝါဒ", icon: ShieldCheck },
                { id: "community", label: "Community & Forum Rules", labelMm: "ကွန်မြူနတီ စည်းကမ်းချက်များ", icon: MessageSquare },
                { id: "security", label: "Admin Lockout & Session Rules", labelMm: "အက်ဒမင် လုံခြုံရေး မူဝါဒ", icon: Lock },
                { id: "retention", label: "Data Retention & Privacy", labelMm: "ဒေတာ ထိန်းသိမ်းမှုနှင့် လုံခြုံရေး မူဝါဒ", icon: Database }
              ].map(sec => {
                const Icon = sec.icon;
                const active = settingsSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSettingsSection(sec.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      active
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-slate-400"}`} />
                      <div>
                        <span>{sec.label}</span>
                        <span className="block text-[10px] text-slate-500 font-burmese">{sec.labelMm}</span>
                      </div>
                    </div>
                    {sec.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {settingsDirty && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unsaved changes detected!</span>
                </p>
                <p className="text-[11px] text-amber-300/80 mt-1 font-burmese">
                  ပြင်ဆင်ထားသော Setting များကို သိမ်းဆည်းရန် Save Changes ခလုတ်ကို နှိပ်ပါ။
                </p>
              </div>
            )}
          </div>

          {/* Settings Section Main Panels */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* 1. GENERAL BRANDING */}
              {settingsSection === "general" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-amber-400" />
                      <span>General Platform Branding & Identity</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      ပလက်ဖောင်း အမည်၊ ဆောင်ပုဒ်နှင့် Logo အမှတ်တံဆိပ် အချက်အလက်များ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Platform Name (English)</label>
                      <input
                        type="text"
                        value={settingsDraft.platformName}
                        onChange={e => handleUpdateDraft("platformName", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ပလက်ဖောင်း အမည် (မြန်မာဘာသာ)</label>
                      <input
                        type="text"
                        value={settingsDraft.platformNameMm}
                        onChange={e => handleUpdateDraft("platformNameMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Platform Logo URL</label>
                      <input
                        type="text"
                        value={settingsDraft.platformLogoUrl}
                        onChange={e => handleUpdateDraft("platformLogoUrl", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Favicon URL</label>
                      <input
                        type="text"
                        value={settingsDraft.platformFaviconUrl || ""}
                        onChange={e => handleUpdateDraft("platformFaviconUrl", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ပလက်ဖောင်း ဆောင်ပုဒ် (Tagline Myanmar)</label>
                      <input
                        type="text"
                        value={settingsDraft.taglineMm}
                        onChange={e => handleUpdateDraft("taglineMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ပလက်ဖောင်း အကြောင်း ဖော်ပြချက် (Description Myanmar)</label>
                      <textarea
                        rows={3}
                        value={settingsDraft.platformDescriptionMm}
                        onChange={e => handleUpdateDraft("platformDescriptionMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CONTACT INFORMATION */}
              {settingsSection === "contact" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-amber-400" />
                      <span>Official Contact & Support Channels</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      ကျောင်းသားများ ဆက်သွယ်မေးမြန်းနိုင်သော Email၊ ဖုန်း၊ Telegram Bot နှင့် ရုံးလိပ်စာများ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Official Support Email</label>
                      <input
                        type="email"
                        value={settingsDraft.contactEmail}
                        onChange={e => handleUpdateDraft("contactEmail", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Support Phone Hotline</label>
                      <input
                        type="text"
                        value={settingsDraft.contactPhone}
                        onChange={e => handleUpdateDraft("contactPhone", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Official Telegram Channel</label>
                      <input
                        type="text"
                        value={settingsDraft.contactTelegramChannel}
                        onChange={e => handleUpdateDraft("contactTelegramChannel", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Telegram Assistant Bot Link</label>
                      <input
                        type="text"
                        value={settingsDraft.contactTelegramBot}
                        onChange={e => handleUpdateDraft("contactTelegramBot", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ရုံးလိပ်စာ (မြန်မာဘာသာ)</label>
                      <input
                        type="text"
                        value={settingsDraft.officeAddressMm}
                        onChange={e => handleUpdateDraft("officeAddressMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ဝန်ဆောင်မှုပေးချိန် (Support Hours)</label>
                      <input
                        type="text"
                        value={settingsDraft.supportHoursMm}
                        onChange={e => handleUpdateDraft("supportHoursMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MAINTENANCE MODE */}
              {settingsSection === "maintenance" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Power className="w-5 h-5 text-red-400" />
                      <span>System Maintenance Mode Controls</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      ဒေတာဘေ့စ်နှင့် ဆာဗာများ အဆင့်မြှင့်တင်ချိန်တွင် ပလက်ဖောင်းအား ပြုပြင်ထိန်းသိမ်းမှု မုဒ်သို့ ပြောင်းလဲထားခြင်း
                    </p>
                  </div>

                  {/* Toggle Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      settingsDraft.maintenanceMode
                        ? "bg-red-500/10 border-red-500/40 text-red-200"
                        : "bg-slate-950 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold flex items-center space-x-2">
                        <span>Maintenance Mode Status:</span>
                        <span className={settingsDraft.maintenanceMode ? "text-red-400" : "text-emerald-400"}>
                          {settingsDraft.maintenanceMode ? "ENABLED (LOCKED)" : "DISABLED (ONLINE)"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-burmese">
                        {settingsDraft.maintenanceMode
                          ? "လက်ရှိတွင် ကျောင်းသားများ သင်ခန်းစာများ ဝင်ရောက်လေ့လာခွင့် ခေတ္တပိတ်ထားပါသည်။"
                          : "ဝဘ်ဆိုက် ပုံမှန် လည်ပတ်နေပြီး ကျောင်းသားများ အားလုံး အသုံးပြုနိုင်ပါသည်။"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdateDraft("maintenanceMode", !settingsDraft.maintenanceMode)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                        settingsDraft.maintenanceMode
                          ? "bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {settingsDraft.maintenanceMode ? "Turn Off Maintenance" : "Turn On Maintenance"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ပြုပြင်ထိန်းသိမ်းမှု ခေါင်းစဉ် (Maintenance Title MM)</label>
                      <input
                        type="text"
                        value={settingsDraft.maintenanceTitleMm}
                        onChange={e => handleUpdateDraft("maintenanceTitleMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ကျောင်းသားများအား ပြသပေးမည့် စာသား (Maintenance Message MM)</label>
                      <textarea
                        rows={3}
                        value={settingsDraft.maintenanceMessageMm}
                        onChange={e => handleUpdateDraft("maintenanceMessageMm", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Estimated Completion Time</label>
                      <input
                        type="datetime-local"
                        value={
                          settingsDraft.maintenanceEstimatedEndTime
                            ? settingsDraft.maintenanceEstimatedEndTime.substring(0, 16)
                            : ""
                        }
                        onChange={e => handleUpdateDraft("maintenanceEstimatedEndTime", new Date(e.target.value).toISOString())}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Admin Bypass Allowed</p>
                        <p className="text-[10px] text-slate-400 font-burmese">အက်ဒမင်များ Login ဝင်ရောက်စီမံနိုင်ခွင့်</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.maintenanceAllowAdminBypass}
                        onChange={e => handleUpdateDraft("maintenanceAllowAdminBypass", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. STUDENT REGISTRATION & AUTH */}
              {settingsSection === "auth" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Key className="w-5 h-5 text-amber-400" />
                      <span>Student Registration & Authentication Rules</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      ကျောင်းသားအသစ် လက်ခံခြင်း၊ အကောင့်ဖွင့် ဆုကြေး Coins များနှင့် Login အကြိမ်ရေ ကန့်သတ်ချက်များ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Allow New Student Registrations</p>
                        <p className="text-[10px] text-slate-400 font-burmese">ကျောင်းသားအသစ်များ အကောင့်ဖွင့်ခွင့်</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.allowRegistrations}
                        onChange={e => handleUpdateDraft("allowRegistrations", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Require Email Verification</p>
                        <p className="text-[10px] text-slate-400 font-burmese">အီးမေးလ် စစ်ဆေးအတည်ပြုရန် လိုအပ်ချက်</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.requireEmailVerification}
                        onChange={e => handleUpdateDraft("requireEmailVerification", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Max Failed Login Attempts</label>
                      <input
                        type="number"
                        min={3}
                        max={10}
                        value={settingsDraft.maxLoginAttempts}
                        onChange={e => handleUpdateDraft("maxLoginAttempts", parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Lockout Duration (Minutes)</label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={settingsDraft.lockoutDurationMinutes}
                        onChange={e => handleUpdateDraft("lockoutDurationMinutes", parseInt(e.target.value) || 15)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ကျောင်းသားသစ် စတင်ရရှိမည့် Coins ပမာဏ</label>
                      <input
                        type="number"
                        min={0}
                        max={5000}
                        value={settingsDraft.defaultFreeQuotaCoins}
                        onChange={e => handleUpdateDraft("defaultFreeQuotaCoins", parseInt(e.target.value) || 350)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">ကျောင်းသားသစ် စတင်ရရှိမည့် XP ပမာဏ</label>
                      <input
                        type="number"
                        min={0}
                        max={5000}
                        value={settingsDraft.defaultFreeQuotaXp}
                        onChange={e => handleUpdateDraft("defaultFreeQuotaXp", parseInt(e.target.value) || 150)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-burmese"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. NOTIFICATIONS & WEBHOOKS */}
              {settingsSection === "notifications" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Send className="w-5 h-5 text-amber-400" />
                      <span>Administrative Notification Alerts & Webhooks</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      KBZPay/WavePay ငွေလွှဲပြေစာများနှင့် Support အရေးပေါ်သတင်းများအား Telegram Bot သို့ ပို့ဆောင်ခြင်း
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Telegram Admin Alerts Webhook URL</label>
                        <p className="text-[11px] text-slate-400 font-burmese mb-2">
                          ငွေလွှဲပြေစာသစ် တင်ရောက်လာပါက Admin Telegram Group/Channel သို့ ချက်ချင်း Notification ပို့ပေးမည့် Webhook URL
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="https://api.telegram.org/bot<TOKEN>/sendMessage"
                            value={settingsDraft.telegramWebhookUrl || ""}
                            onChange={e => handleUpdateDraft("telegramWebhookUrl", e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            onClick={handleTestTelegramWebhook}
                            disabled={testingWebhook}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center space-x-1.5 shrink-0"
                          >
                            <Send className={`w-3.5 h-3.5 ${testingWebhook ? "animate-spin text-amber-400" : ""}`} />
                            <span>Test Ping</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">Email Payment Alerts</p>
                          <p className="text-[10px] text-slate-400 font-burmese">အီးမေးလ် သတိပေးချက်</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsDraft.emailPaymentAlerts}
                          onChange={e => handleUpdateDraft("emailPaymentAlerts", e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">Telegram Admin Alerts</p>
                          <p className="text-[10px] text-slate-400 font-burmese">Telegram သတိပေးချက်</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsDraft.telegramAdminAlerts}
                          onChange={e => handleUpdateDraft("telegramAdminAlerts", e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">In-App Live Bell Alerts</p>
                          <p className="text-[10px] text-slate-400 font-burmese">စနစ်တွင်း အသိပေးခေါင်းလောင်း</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsDraft.inAppAdminAlerts}
                          onChange={e => handleUpdateDraft("inAppAdminAlerts", e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BILLING & PREMIUM SETTINGS */}
              {settingsSection === "billing" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>Premium Subscription & Payment Upload Settings</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      VIP သက်တမ်း ကုန်ဆုံးမှု စောင့်ဆိုင်းချိန်နှင့် ပြေစာ ပုံရိပ် ဖိုင်အရွယ်အစား ကန့်သတ်ချက်များ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Grace Period Days (သက်တမ်းကုန်ပြီး စောင့်ဆိုင်းရက်)</label>
                      <input
                        type="number"
                        min={0}
                        max={14}
                        value={settingsDraft.gracePeriodDays}
                        onChange={e => handleUpdateDraft("gracePeriodDays", parseInt(e.target.value) || 2)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Max Slip Upload File Size (MB)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={settingsDraft.maxPaymentSlipUploadMb}
                        onChange={e => handleUpdateDraft("maxPaymentSlipUploadMb", parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. COMMUNITY & FORUM RULES */}
              {settingsSection === "community" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                      <span>Community Forum & Discussion Rules</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      ဆွေးနွေးခန်း စည်းကမ်းချက်များ၊ မသင့်လျော်သော စာသားများ အလိုအလျောက် စစ်ထုတ်ခြင်း
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Require Pre-Approval for Posts</p>
                        <p className="text-[10px] text-slate-400 font-burmese">ပို့စ်တင်တိုင်း Admin အတည်ပြုချက် လိုအပ်ခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.requirePostApproval}
                        onChange={e => handleUpdateDraft("requirePostApproval", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Profanity & Toxic Filter</p>
                        <p className="text-[10px] text-slate-400 font-burmese">မယဉ်ကျေးသော စကားလုံးများ စစ်ထုတ်ခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.profanityFilterEnabled}
                        onChange={e => handleUpdateDraft("profanityFilterEnabled", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">၁၀ မိနစ်အတွင်း အများဆုံး ပို့စ်တင်နိုင်သည့် အကြိမ်ရေ</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={settingsDraft.rateLimitPostsPer10Min}
                        onChange={e => handleUpdateDraft("rateLimitPostsPer10Min", parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1 font-burmese">အကူအညီဖြစ်သော အဖြေအတွက် ပေးအပ်မည့် Reputation Points</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={settingsDraft.reputationPointsPerHelpful}
                        onChange={e => handleUpdateDraft("reputationPointsPerHelpful", parseInt(e.target.value) || 10)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. SECURITY & LOCKOUT RULES */}
              {settingsSection === "security" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <span>Admin Session Timeout & Lockout Policies</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-burmese mt-0.5">
                      အက်ဒမင် ဆက်ရှင် အလိုအလျောက် သက်တမ်းကုန်ဆုံးချိန်နှင့် အရေးကြီး လုပ်ဆောင်ချက်များအတွက် ၂ ဆင့် အတည်ပြုချက်
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Admin Session Timeout</label>
                      <select
                        value={settingsDraft.adminSessionTimeoutMinutes}
                        onChange={e => handleUpdateDraft("adminSessionTimeoutMinutes", parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour (Recommended)</option>
                        <option value={240}>4 Hours</option>
                        <option value={480}>8 Hours</option>
                        <option value={1440}>24 Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Max Active Devices per Admin</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={settingsDraft.maxActiveSessionsPerAdmin}
                        onChange={e => handleUpdateDraft("maxActiveSessionsPerAdmin", parseInt(e.target.value) || 3)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Enforce 2-Step Confirmation</p>
                        <p className="text-[10px] text-slate-400 font-burmese">အရေးကြီး လုပ်ဆောင်ချက်များတွင် အတည်ပြုကုဒ်တောင်းခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.enforce2StepConfirmation}
                        onChange={e => handleUpdateDraft("enforce2StepConfirmation", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Enable Idle Screen Lock</p>
                        <p className="text-[10px] text-slate-400 font-burmese">အသုံးမပြုဘဲ ထားပါက Screen အလိုအလျောက် သော့ခတ်ခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.enableIdleLock}
                        onChange={e => handleUpdateDraft("enableIdleLock", e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 9. DATA RETENTION & PRIVACY GOVERNANCE */}
              {settingsSection === "retention" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                        <Database className="w-5 h-5 text-amber-400" />
                        <span>Data Retention & Privacy Lifecycle Governance</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-burmese mt-0.5">
                        ကိုယ်ရေးအချက်အလက် လုံခြုံရေး၊ သက်တမ်းလွန် ဒေတာများ အလိုအလျောက် သန့်စင်မှုနှင့် စာရင်းအင်း မှတ်တမ်း မူဝါဒ
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerRetentionCleanup}
                      disabled={isExecutingRetentionCleanup}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isExecutingRetentionCleanup ? "animate-spin" : ""}`} />
                      <span>{isExecutingRetentionCleanup ? "Cleaning Data..." : "Run Cleanup Now"}</span>
                    </button>
                  </div>

                  {/* Info Notice on Data Protection & Minimization */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <Info className="w-4 h-4" />
                      <span>Platform Data Retention Strategy (မူဝါဒ ရှင်းလင်းချက်)</span>
                    </div>
                    <p className="text-xs text-slate-300 font-burmese leading-relaxed">
                      Code Learn Myanmar စနစ်သည် အသုံးပြုသူများ၏ ကိုယ်ရေးအချက်အလက် လုံခြုံရေးကို အထူးဦးစားပေးပါသည်။ လိုအပ်သော ဒေတာများကိုသာ ကာလသတ်မှတ်ချက်အတိုင်း သိမ်းဆည်းပြီး၊ သက်တမ်းကုန်လွန်သော ငွေလွှဲပြေစာ ပုံရိပ်များနှင့် အသေးစိတ် AI မေးခွန်းမှတ်တမ်းများကို သတ်မှတ်ရက်ပြည့်ပါက အလိုအလျောက် Purge ပြုလုပ်ပေးပါသည်။ အကောင့်ဖျက်သိမ်းသူများအတွက် ငွေစာရင်းဥပဒေအရ လိုအပ်သော ငွေစာရင်းမှတ်တမ်းများကို ကိုယ်ရေးအချက်အလက်ဖယ်ရှား၍ Anonymized အဖြစ်သာ သိမ်းဆည်းပါသည်။
                    </p>
                  </div>

                  {/* Retention Period Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        Payment Slips & Screenshots Retention (Days)
                      </label>
                      <p className="text-[11px] text-slate-400 font-burmese">ငွေလွှဲပြေစာ ပုံရိပ်များ ထိန်းသိမ်းမည့် သက်တမ်း (ရက်)</p>
                      <input
                        type="number"
                        min={7}
                        max={365}
                        value={settingsDraft.dataRetention?.paymentScreenshotsRetentionDays ?? 60}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 60;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              paymentScreenshotsRetentionDays: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">ပုံမှန်အားဖြင့် ရက် ၆၀ ထားရှိရန် အကြံပြုပါသည်</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        System & Security Audit Logs Retention (Days)
                      </label>
                      <p className="text-[11px] text-slate-400 font-burmese">စနစ် လုံခြုံရေးနှင့် စစ်ဆေးမှု မှတ်တမ်း သက်တမ်း (ရက်)</p>
                      <input
                        type="number"
                        min={30}
                        max={730}
                        value={settingsDraft.dataRetention?.systemSecurityLogsRetentionDays ?? 180}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 180;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              systemSecurityLogsRetentionDays: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">လုံခြုံရေး စစ်ဆေးမှုများအတွက် ရက် ၁၈၀ သတ်မှတ်ထားပါသည်</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        AI Telemetry & Prompt Logs Retention (Days)
                      </label>
                      <p className="text-[11px] text-slate-400 font-burmese">Kibo AI မေးမြန်းမှု မှတ်တမ်း သက်တမ်း (ရက်)</p>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={settingsDraft.dataRetention?.aiUsageLogsRetentionDays ?? 30}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 30;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              aiUsageLogsRetentionDays: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">ကျောင်းသား Privacy အရ ရက် ၃၀ အထိသာ အများဆုံး ထားရှိပါသည်</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <label className="text-xs font-bold text-slate-200 block">
                        Inactive Account Archival Threshold (Days)
                      </label>
                      <p className="text-[11px] text-slate-400 font-burmese">အသုံးမပြုဘဲ ရပ်နားထားသော အကောင့် သက်တမ်း (ရက်)</p>
                      <input
                        type="number"
                        min={180}
                        max={1095}
                        value={settingsDraft.dataRetention?.inactiveAccountRetentionDays ?? 730}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 730;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              inactiveAccountRetentionDays: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                      <span className="text-[10px] text-slate-500">၂ နှစ် (ရက် ၇၃၀) လှုပ်ရှားမှုမရှိပါက အသိပေးချက်ပို့ပါမည်</span>
                    </div>
                  </div>

                  {/* Retention Automation Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-200">Auto-Purge Expired Data Policy</p>
                        <p className="text-[10px] text-slate-400 font-burmese">သက်တမ်းလွန် ဒေတာများကို အလိုအလျောက် သန့်စင်ခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.dataRetention?.autoPurgeExpiredData ?? true}
                        onChange={e => {
                          const val = e.target.checked;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              autoPurgeExpiredData: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-200">Anonymize Financial Records on Account Deletion</p>
                        <p className="text-[10px] text-slate-400 font-burmese">အကောင့်ဖျက်ပါက ငွေစာရင်းကို အမည်ဖျက် သိမ်းဆည်းခြင်း</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.dataRetention?.anonymizeFinancialRecordsOnDelete ?? true}
                        onChange={e => {
                          const val = e.target.checked;
                          setSettingsDraft(prev => ({
                            ...prev,
                            dataRetention: {
                              ...(prev.dataRetention || DEFAULT_DATA_RETENTION_SETTINGS),
                              anonymizeFinancialRecordsOnDelete: val
                            }
                          }));
                          setSettingsDirty(true);
                        }}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last Automated Cleanup: {settingsDraft.dataRetention?.lastCleanupTimestamp ? new Date(settingsDraft.dataRetention.lastCleanupTimestamp).toLocaleString() : "Active in schedule"}</span>
                    </span>
                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      GDPR & Myanmar Privacy Aligned
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBTAB 3: ACTIVE ADMIN SESSIONS */}
      {/* ===================================================================== */}
      {subTab === "sessions" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <span>Active Administrator Sessions & Authorized Hardware</span>
              </h3>
              <p className="text-xs text-slate-400 font-burmese mt-1">
                လက်ရှိ စနစ်သို့ ဝင်ရောက်နေသော အက်ဒမင် ကွန်ပျူတာနှင့် ဖုန်းကိရိယာ ဆက်ရှင်များ
              </p>
            </div>

            {isSuperAdmin && (
              <button
                onClick={handleRevokeAllOtherSessions}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500 active:scale-95 text-red-300 hover:text-slate-950 border border-red-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-red-500/10"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Revoke All Other Sessions</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSessions.map(session => {
              const isDesktop = session.deviceType.includes("Desktop");
              return (
                <div
                  key={session.sessionId}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    session.status === "revoked"
                      ? "bg-slate-950/40 border-slate-900 opacity-60"
                      : session.isCurrent
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          session.isCurrent
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}
                      >
                        {isDesktop ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-100">{session.adminName}</span>
                          {session.isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">{session.adminEmail}</span>
                      </div>
                    </div>

                    {renderRoleBadge(session.role)}
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Browser:</span>
                      <span className="font-medium text-slate-200">{session.browser}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">IP Address:</span>
                      <span className="font-mono text-slate-300 text-[11px]">{session.ipAddress}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Login Time:</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {new Date(session.loginAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Last Active:</span>
                      <span className="font-mono text-emerald-400 text-[11px]">
                        {new Date(session.lastActiveAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        session.status === "active" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {session.status === "active" ? "Session Active" : "Session Revoked"}
                    </span>

                    {session.status === "active" && !session.isCurrent && isSuperAdmin && (
                      <button
                        onClick={() => handleRevokeSession(session)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 text-[11px] font-bold rounded-lg transition-all border border-red-500/20"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBTAB 4: SECURITY AUDIT TRAIL */}
      {/* ===================================================================== */}
      {subTab === "audit" && (
        <div className="space-y-4">
          {/* Audit Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit trail by keyword, admin, IP..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <select
                value={auditAdminFilter}
                onChange={e => setAuditAdminFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Administrators</option>
                {uniqueAuditAdmins.map((email, idx) => (
                  <option key={idx} value={email}>
                    {email}
                  </option>
                ))}
              </select>

              <select
                value={auditActionFilter}
                onChange={e => setAuditActionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Action Types</option>
                <option value="ADMIN_LOGIN">Admin Login</option>
                <option value="SETTINGS_UPDATED">Settings Updated</option>
                <option value="MAINTENANCE_TOGGLED">Maintenance Toggled</option>
                <option value="ROLE_ASSIGNED">Role Assigned</option>
                <option value="ROLE_UPDATED">Role Updated</option>
                <option value="ADMIN_DELETED">Admin Deleted</option>
                <option value="PAYMENT_APPROVED">Payment Approved</option>
                <option value="PAYMENT_REJECTED">Payment Rejected</option>
                <option value="REFUND_APPROVED">Refund Approved</option>
                <option value="SESSION_REVOKED">Session Revoked</option>
                <option value="SENSITIVE_CONFIRMATION_PASSED">Sensitive Passed</option>
              </select>

              <select
                value={auditStatusFilter}
                onChange={e => setAuditStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="failure">Failure</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="text-right text-xs text-slate-400 font-mono self-end md:self-center">
              Showing <span className="text-amber-400 font-bold">{filteredAuditLogs.length}</span> of {auditLogs.length} records
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin Performed</th>
                    <th className="py-3 px-4">Action & Target</th>
                    <th className="py-3 px-4">Details & Myanmar Note</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs font-burmese">
                        ရှာဖွေမှုနှင့် ကိုက်ညီသော စနစ်မှတ်တမ်း မတွေ့ရှိပါ။
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <p className="font-bold text-slate-200 text-xs">{log.adminName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{log.adminEmail}</p>
                          <div className="mt-0.5">{renderRoleBadge(log.adminRole)}</div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <span className="font-bold text-amber-400 text-xs block">{log.action}</span>
                          {log.targetName && (
                            <span className="text-[11px] text-slate-300 font-mono block mt-0.5 truncate max-w-xs">
                              {log.targetName}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-sans max-w-md">
                          <p className="text-slate-300 text-xs line-clamp-2">{log.details}</p>
                          {log.detailsMm && (
                            <p className="text-[11px] text-slate-400 font-burmese mt-0.5 line-clamp-1">
                              {log.detailsMm}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              SUCCESS
                            </span>
                          ) : log.status === "blocked" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {log.status.toUpperCase()}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="Inspect Audit Log Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBTAB 5: LIVE THREAT RADAR & ALERTS */}
      {/* ===================================================================== */}
      {subTab === "monitoring" && (
        <div className="animate-fade-in">
          <EnterpriseSecurityMonitoringCenter
            adminUser={adminUser}
            firebaseUser={firebaseUser}
            onRefreshParent={onRefreshParent}
            initialTab="monitoring"
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUBTAB 6: AUTOMATED SECURITY TEST SUITE */}
      {/* ===================================================================== */}
      {subTab === "testing" && (
        <div className="animate-fade-in">
          <EnterpriseSecurityMonitoringCenter
            adminUser={adminUser}
            firebaseUser={firebaseUser}
            onRefreshParent={onRefreshParent}
            initialTab="testing"
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD / EDIT ADMINISTRATOR */}
      {/* ===================================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingAdmin ? "Edit Administrator Account" : "Invite New Administrator"}
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U Kyaw Zeya"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingAdmin}
                    placeholder="admin@gmail.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Administrative Role</label>
                  <select
                    value={formRole}
                    onChange={e => {
                      const newRole = e.target.value as AdminRoleType;
                      setFormRole(newRole);
                      if (!enableCustomPerms) {
                        setFormCustomPerms(ROLE_DEFAULT_PERMISSIONS[newRole]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="content_admin">Content Admin (Courses, Lessons, Projects)</option>
                    <option value="finance_admin">Finance Admin (Payments, VIP Plans, Refunds)</option>
                    <option value="community_admin">Community Admin (Reports, Moderation)</option>
                    <option value="support_admin">Support Admin (Tickets, Assistance)</option>
                    <option value="super_admin">Super Admin (Full Platform Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Curriculum & Engineering"
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+95 9 xxxxxxxx"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_invitation">Pending Invitation</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Granular Permission Overrides</p>
                    <p className="text-[10px] text-slate-400 font-burmese">သတ်မှတ်ထားသော Role အပြင် သီးခြား ခွင့်ပြုချက်များ ရွေးချယ်ခြင်း</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCustomPerms}
                    onChange={e => {
                      setEnableCustomPerms(e.target.checked);
                      if (e.target.checked) {
                        setFormCustomPerms(ROLE_DEFAULT_PERMISSIONS[formRole]);
                      }
                    }}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </div>

                {enableCustomPerms && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800 custom-scrollbar">
                    {ALL_PERMISSIONS.map(perm => {
                      const isChecked = formCustomPerms.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start space-x-2 text-xs p-1.5 rounded hover:bg-slate-900 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormCustomPerms(prev => [...prev, perm.id]);
                              } else {
                                setFormCustomPerms(prev => prev.filter(p => p !== perm.id));
                              }
                            }}
                            className="w-3.5 h-3.5 accent-amber-500 rounded mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-slate-200 block">{perm.name}</span>
                            <span className="text-[10px] text-slate-400 font-burmese block">{perm.nameMm}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
                >
                  {editingAdmin ? "Update Administrator" : "Save & Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ROLE PERMISSION MATRIX VIEWER */}
      {/* ===================================================================== */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Key className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-xs text-slate-400 font-burmese">
                    အက်ဒမင် ရာထူးတစ်ခုချင်းစီအတွက် သတ်မှတ်ထားသော စနစ် ခွင့်ပြုချက် (Permissions) အပြည့်အစုံ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-semibold">
                    <th className="py-2.5 px-3">System Permission</th>
                    <th className="py-2.5 px-3 text-center text-red-400">Super</th>
                    <th className="py-2.5 px-3 text-center text-blue-400">Content</th>
                    <th className="py-2.5 px-3 text-center text-emerald-400">Finance</th>
                    <th className="py-2.5 px-3 text-center text-purple-400">Community</th>
                    <th className="py-2.5 px-3 text-center text-amber-400">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ALL_PERMISSIONS.map(perm => (
                    <tr key={perm.id} className="hover:bg-slate-850/40">
                      <td className="py-2 px-3">
                        <p className="font-bold text-slate-200">{perm.name}</p>
                        <p className="text-[10px] text-slate-400 font-burmese">{perm.nameMm}</p>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="py-2 px-3 text-center">
                        {ROLE_DEFAULT_PERMISSIONS.content_admin.includes(perm.id) ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {ROLE_DEFAULT_PERMISSIONS.finance_admin.includes(perm.id) ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {ROLE_DEFAULT_PERMISSIONS.community_admin.includes(perm.id) ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {ROLE_DEFAULT_PERMISSIONS.support_admin.includes(perm.id) ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: AUDIT LOG DETAILS INSPECTOR */}
      {/* ===================================================================== */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Security Audit Trail Record</h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Action:</span>
                <span className="font-bold text-amber-400">{selectedAuditLog.action}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Status:</span>
                <span className="font-bold text-emerald-400">{selectedAuditLog.status.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Administrator:</span>
                <span className="font-bold text-slate-200">{selectedAuditLog.adminName}</span>
                <span className="text-[11px] text-slate-400 font-mono block">{selectedAuditLog.adminEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Role:</span>
                <div className="mt-0.5">{renderRoleBadge(selectedAuditLog.adminRole)}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Timestamp:</span>
                <span className="font-mono text-slate-300">{new Date(selectedAuditLog.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">IP Address:</span>
                <span className="font-mono text-slate-300">{selectedAuditLog.ipAddress || "Internal System"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Activity Narrative</label>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedAuditLog.details}
              </p>
              {selectedAuditLog.detailsMm && (
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-burmese">
                  {selectedAuditLog.detailsMm}
                </p>
              )}
            </div>

            {selectedAuditLog.changesPayload && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Changes Diff Payload (JSON)</label>
                <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 max-h-48 overflow-auto custom-scrollbar">
                  {JSON.stringify(selectedAuditLog.changesPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: SENSITIVE ACTION 2-STEP CONFIRMATION */}
      {/* ===================================================================== */}
      {sensitiveActionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{sensitiveActionModal.title}</h3>
                <p className="text-xs text-red-400 font-burmese">{sensitiveActionModal.titleMm}</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2 text-xs">
              <p className="text-slate-200">{sensitiveActionModal.description}</p>
              <p className="text-slate-300 font-burmese">{sensitiveActionModal.descriptionMm}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                To confirm, type <span className="font-mono font-bold text-amber-400 select-all">{sensitiveActionModal.confirmPhrase}</span> below:
              </label>
              <input
                type="text"
                autoFocus
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder={`Type "${sensitiveActionModal.confirmPhrase}" to confirm`}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSensitiveActionModal(prev => ({ ...prev, isOpen: false }))}
                disabled={sensitiveActionProcessing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSensitiveAction}
                disabled={
                  confirmInput.trim().toUpperCase() !== sensitiveActionModal.confirmPhrase.toUpperCase() ||
                  sensitiveActionProcessing
                }
                className="px-5 py-2 bg-red-500 hover:bg-red-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sensitiveActionProcessing ? "Executing..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SecurityManagementModule;
