import React, { useState } from "react";
import {
  Crown,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Calendar,
  DollarSign,
  Layers,
  Coins,
  AlertCircle
} from "lucide-react";
import { AdminPremiumPlan, UserProfile } from "../../types";

interface PremiumPlansTabProps {
  plans: AdminPremiumPlan[];
  adminUser: UserProfile;
  onSavePlan: (plan: AdminPremiumPlan) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onRefreshData: () => void;
}

export const PremiumPlansTab: React.FC<PremiumPlansTabProps> = ({
  plans,
  adminUser,
  onSavePlan,
  onDeletePlan,
  onRefreshData
}) => {
  const [editingPlan, setEditingPlan] = useState<AdminPremiumPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const initialFormState: AdminPremiumPlan = {
    id: `plan_${Date.now()}`,
    title: "",
    planType: "monthly",
    durationDays: 30,
    priceMMK: 5000,
    originalPriceMMK: 7500,
    priceCoins: 100,
    isPopular: false,
    isEnabled: true,
    description: "",
    features: [
      "Access to all Premium Lessons",
      "Interactive Code Sandbox",
      "Kibo AI Teacher Support",
      "Course Completion Certificates"
    ],
    badge: "Special",
    order: plans.length + 1,
    updatedAt: new Date().toISOString()
  };

  const [formData, setFormData] = useState<AdminPremiumPlan>(initialFormState);

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      id: `plan_${Date.now()}`,
      order: plans.length + 1
    });
    setEditingPlan(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (plan: AdminPremiumPlan) => {
    setFormData({ ...plan });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, featureInput.trim()]
    }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Plan Title is required");
      return;
    }
    setSaving(true);
    try {
      await onSavePlan(formData);
      setIsCreating(false);
      setEditingPlan(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to save plan: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      await onDeletePlan(planId);
      setDeleteConfirmId(null);
      onRefreshData();
    } catch (err: any) {
      alert("Failed to delete plan: " + (err?.message || "Unknown error"));
    }
  };

  const handleToggleEnable = async (plan: AdminPremiumPlan) => {
    try {
      await onSavePlan({ ...plan, isEnabled: !plan.isEnabled });
      onRefreshData();
    } catch (err: any) {
      alert("Failed to update status: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Premium Plans & Pricing Configurator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ကျောင်းသားများ ဝယ်ယူအသုံးပြုနိုင်သည့် Premium Package များ၏ စျေးနှုန်း၊ သက်တမ်း နှင့် Feature များကို တိုက်ရိုက် ပြင်ဆင်စီမံနိုင်သည်။
          </p>
        </div>
        <button
          id="btn-create-new-plan"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Premium Plan</span>
        </button>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isPopular = plan.isPopular;
          return (
            <div
              key={plan.id}
              id={`plan-card-${plan.id}`}
              className={`relative bg-slate-900 border ${
                plan.isEnabled
                  ? isPopular
                    ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
                    : "border-slate-800"
                  : "border-red-900/30 opacity-75"
              } rounded-2xl p-5 flex flex-col justify-between transition-all`}
            >
              {/* STATUS & BADGE */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      plan.isEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {plan.isEnabled ? "Active & For Sale" : "Disabled"}
                  </span>
                  {plan.badge && (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* TITLE & DURATION */}
                <h3 className="text-base font-bold text-slate-100">{plan.title}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description || "No description provided."}</p>

                {/* PRICING BLOCK */}
                <div className="my-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {plan.priceMMK.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">MMK</span>
                    {plan.originalPriceMMK && plan.originalPriceMMK > plan.priceMMK && (
                      <span className="text-xs text-slate-500 line-through ml-auto">
                        {plan.originalPriceMMK.toLocaleString()} MMK
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {plan.durationDays >= 3650 ? "Lifetime (တစ်သက်တာ)" : `${plan.durationDays} Days Duration`}
                    </span>
                    {plan.priceCoins && (
                      <span className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        {plan.priceCoins} Coins
                      </span>
                    )}
                  </div>
                </div>

                {/* FEATURES LIST */}
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Features:</p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.features && plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CARD ACTIONS */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  id={`btn-toggle-plan-${plan.id}`}
                  onClick={() => handleToggleEnable(plan)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    plan.isEnabled
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                >
                  {plan.isEnabled ? "Disable" : "Enable"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-edit-plan-${plan.id}`}
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-all"
                    title="Edit Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === plan.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(plan.id)}
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
                      id={`btn-delete-plan-${plan.id}`}
                      onClick={() => setDeleteConfirmId(plan.id)}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 transition-all"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>{editingPlan ? "Edit Premium Plan" : "Create New Premium Plan"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingPlan(null);
                }}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Title (English & Myanmar)</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 1 Month Premium"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Preset Type</label>
                  <select
                    value={formData.planType}
                    onChange={e => {
                      const val = e.target.value as any;
                      let days = 30;
                      if (val === "monthly") days = 30;
                      else if (val === "six_months") days = 180;
                      else if (val === "lifetime") days = 36500;
                      setFormData({ ...formData, planType: val, durationDays: days });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="monthly">Monthly (30 Days)</option>
                    <option value="six_months">6 Months (180 Days)</option>
                    <option value="lifetime">Lifetime Access</option>
                    <option value="custom">Custom Duration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationDays}
                    onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price (MMK)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.priceMMK}
                    onChange={e => setFormData({ ...formData, priceMMK: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Original Price (MMK, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPriceMMK || ""}
                    onChange={e => setFormData({ ...formData, originalPriceMMK: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 7500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Coins Price (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priceCoins || ""}
                    onChange={e => setFormData({ ...formData, priceCoins: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge Text (e.g. Most Popular)</label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Best Value"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this plan and target students..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* FEATURES BUILDER */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Plan Features & Privileges</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    placeholder="Enter feature title (e.g. Unlimited Kibo AI Chats)..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                      <span className="text-slate-300 truncate">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOGGLES */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Active & Available for Students</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Highlight as Most Popular</span>
                </label>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPlan(null);
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
                  {saving ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
