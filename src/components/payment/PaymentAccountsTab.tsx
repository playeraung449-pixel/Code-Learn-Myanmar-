import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  QrCode,
  Smartphone,
  Building,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { AdminPaymentAccount, UserProfile } from "../../types";

interface PaymentAccountsTabProps {
  accounts: AdminPaymentAccount[];
  adminUser: UserProfile;
  onSaveAccount: (account: AdminPaymentAccount) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<void>;
  onRefreshData: () => void;
}

export const PaymentAccountsTab: React.FC<PaymentAccountsTabProps> = ({
  accounts,
  adminUser,
  onSaveAccount,
  onDeleteAccount,
  onRefreshData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminPaymentAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialFormState: AdminPaymentAccount = {
    id: `acc_${Date.now()}`,
    name: "KBZPay (KPay)",
    type: "kpay",
    accountNumber: "",
    accountName: "",
    qrCodeUrl: "",
    isEnabled: true,
    isDefault: false,
    instructions: "ငွေလွှဲပြီးပါက Transaction Ref နှင့် ပြေစာ Screenshot ပေးပို့ပေးပါ ခင်ဗျာ။",
    dailyLimitMMK: 5000000
  };

  const [formData, setFormData] = useState<AdminPaymentAccount>(initialFormState);

  const handleOpenCreate = () => {
    setFormData({ ...initialFormState, id: `acc_${Date.now()}` });
    setEditingAccount(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (acc: AdminPaymentAccount) => {
    setFormData({ ...acc });
    setEditingAccount(acc);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountNumber.trim() || !formData.accountName.trim()) {
      alert("Account number and account name are required");
      return;
    }
    setSaving(true);
    try {
      await onSaveAccount(formData);
      setIsEditing(false);
      setEditingAccount(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to save account: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteAccount(id);
      setDeleteConfirmId(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to delete account: " + (err?.message || "Unknown error"));
    }
  };

  const handleToggle = async (acc: AdminPaymentAccount) => {
    try {
      await onSaveAccount({ ...acc, isEnabled: !acc.isEnabled });
      onRefreshData();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err?.message || "Unknown error"));
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "kpay":
      case "wave":
      case "ayapay":
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      case "cbbank":
      case "bank_transfer":
        return <Building className="w-5 h-5 text-sky-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span>Receiving Payment Accounts & Wallets</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ကျောင်းသားများ ငွေလွှဲပေးပို့ရမည့် KPay, WavePay, CB Bank, AYA Pay အကောင့်များကို စီမံပြင်ဆင်နိုင်သည်။
          </p>
        </div>
        <button
          id="btn-create-payment-account"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Receiving Account</span>
        </button>
      </div>

      {/* ACCOUNTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map(acc => (
          <div
            key={acc.id}
            id={`acc-card-${acc.id}`}
            className={`bg-slate-900 border ${
              acc.isEnabled ? "border-slate-800" : "border-red-900/30 opacity-75"
            } rounded-2xl p-5 flex flex-col justify-between transition-all`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{acc.name}</h3>
                    <span className="text-[10px] uppercase font-mono text-slate-400">{acc.type}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    acc.isEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {acc.isEnabled ? "Active & Visible" : "Disabled"}
                </span>
              </div>

              {/* ACCOUNT CREDENTIALS */}
              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 my-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account No / Phone:</span>
                  <span className="text-amber-400 font-bold text-sm tracking-wider">{acc.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Holder Name:</span>
                  <span className="text-slate-200 font-bold">{acc.accountName}</span>
                </div>
                {acc.dailyLimitMMK && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Daily Limit:</span>
                    <span className="text-slate-400">{acc.dailyLimitMMK.toLocaleString()} MMK</span>
                  </div>
                )}
              </div>

              {/* INSTRUCTIONS */}
              <p className="text-xs text-slate-400 line-clamp-2">{acc.instructions}</p>
            </div>

            {/* ACTIONS */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-3">
              <button
                onClick={() => handleToggle(acc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  acc.isEnabled
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                }`}
              >
                {acc.isEnabled ? "Disable" : "Enable"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(acc)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-all"
                  title="Edit Account"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {deleteConfirmId === acc.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(acc.id)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 transition-all"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>{editingAccount ? "Edit Payment Account" : "Add Payment Account"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingAccount(null);
                }}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. KBZPay (KPay)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="kpay">KBZPay (KPay)</option>
                    <option value="wave">Wave Money (WavePay)</option>
                    <option value="cbbank">CB Bank / CB Pay</option>
                    <option value="ayapay">AYA Pay</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="other">Other Wallet / Method</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Number / Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 09426012797"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="e.g. U Aung Myo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instructions for Students</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Instructions displayed to students on checkout..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Active & Shown to Students</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingAccount ? "Update Account" : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
