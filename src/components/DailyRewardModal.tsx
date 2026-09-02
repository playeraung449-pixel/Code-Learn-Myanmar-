import React, { useState, useEffect } from "react";
import { 
  X, Flame, Trophy, Award, Gift, Star, Calendar, 
  Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2 
} from "lucide-react";
import KiboMascot from "./KiboMascot";
import { UserProfile, PaymentSettings } from "../types";

interface DailyRewardModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (xpReward: number, coinsReward: number, newStreak: number) => void;
  activeSettings: PaymentSettings | null;
}

export default function DailyRewardModal({
  user,
  isOpen,
  onClose,
  onClaim,
  activeSettings
}: DailyRewardModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [gainedXp, setGainedXp] = useState(0);
  const [gainedCoins, setGainedCoins] = useState(0);

  // Get date strings
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();
  const alreadyCheckedInToday = user.lastCheckInDate === todayStr;

  // Determine current streak if we check in today
  let projectedStreak = user.learningStreak || 0;
  if (!alreadyCheckedInToday) {
    if (user.lastCheckInDate === yesterdayStr) {
      projectedStreak = (user.learningStreak || 0) + 1;
    } else {
      projectedStreak = 1;
    }
  }

  // Define rewards based on streak day (1-7 cycle)
  const currentDayInCycle = ((projectedStreak - 1) % 7) + 1; // 1 to 7

  const getBaseXpReward = (day: number) => {
    const baseRewards = [50, 60, 70, 80, 100, 120, 150];
    return baseRewards[(day - 1) % 7] || 50;
  };

  const getBaseCoinsReward = (day: number) => {
    // Milestones give bonus coins
    if (day === 3) return 15;
    if (day === 7) return 30;
    return 10;
  };

  const baseXp = getBaseXpReward(currentDayInCycle);
  const baseCoins = getBaseCoinsReward(currentDayInCycle);

  // Check for active special events (e.g. HTML Week, CSS Design Contest) from Admin
  const isEventActive = activeSettings?.currentEventId && activeSettings.currentEventId !== "none";
  const eventMultiplier = isEventActive ? (activeSettings?.currentEventBonusXpPercent || 0) : 0;
  const bonusXp = isEventActive ? Math.round(baseXp * (eventMultiplier / 100)) : 0;

  const totalXpReward = baseXp + bonusXp;
  const totalCoinsReward = baseCoins;

  // Check if milestone achievements can be unlocked
  const checkMilestoneAchievements = (streak: number) => {
    const unlockedAchievements = [];
    if (streak === 3) {
      unlockedAchievements.push({
        id: "streak-3",
        title: "၃ ရက်ဆက်တိုက် ဇွဲရှင်",
        description: "Code Learn Myanmar တွင် ၃ ရက်ဆက်တိုက် နေ့စဉ်ဝင်ရောက်လေ့လာနိုင်ခဲ့ခြင်း။",
        icon: "Flame",
        unlockedAt: new Date().toLocaleDateString()
      });
    } else if (streak === 7) {
      unlockedAchievements.push({
        id: "streak-7",
        title: "တစ်ပတ်တာ စံပြကျောင်းသား",
        description: "Code Learn Myanmar တွင် ၇ ရက်ဆက်တိုက် နေ့စဉ်မပျက်မကွက် ဝင်ရောက်လေ့လာနိုင်ခဲ့ခြင်း။",
        icon: "Award",
        unlockedAt: new Date().toLocaleDateString()
      });
    } else if (streak === 15) {
      unlockedAchievements.push({
        id: "streak-15",
        title: "၁၅ ရက် စွမ်းအားရှင်",
        description: "၁၅ ရက်ဆက်တိုက် ပရိုဂရမ်မင်းသင်ခန်းစာများကို မဆုတ်မနစ် ကြိုးစားအားထုတ်ခဲ့ခြင်း။",
        icon: "Trophy",
        unlockedAt: new Date().toLocaleDateString()
      });
    } else if (streak === 30) {
      unlockedAchievements.push({
        id: "streak-30",
        title: "ဒဏ္ဍာရီလာ Streak ဘုရင်",
        description: "ရက်ပေါင်း ၃၀ တိတိ နေ့စဉ်မပြတ် လေ့လာသင်ယူမှုပြုလုပ်ခဲ့သည့် ထူးချွန်ကျောင်းသား။",
        icon: "Sparkles",
        unlockedAt: new Date().toLocaleDateString()
      });
    }
    return unlockedAchievements;
  };

  const handleClaimClick = async () => {
    if (alreadyCheckedInToday || claimed) return;
    setIsSubmitting(true);

    try {
      setGainedXp(totalXpReward);
      setGainedCoins(totalCoinsReward);
      setClaimed(true);

      // Trigger callback with new rewards
      onClaim(totalXpReward, totalCoinsReward, projectedStreak);
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Generate 7-day timeline status
  const daysOfWeek = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7 (Bonus)"];

  // Kibo Speech Bubble text based on premium status & check-in day
  const getKiboSpeech = () => {
    if (user.isPremium) {
      return `မင်္ဂလာပါ ${user.name} ဗျာ! Premium ကျောင်းသားကြီး နေ့စဉ်လေ့လာနေလို့ အရမ်းဂုဏ်ယူပါတယ်။ ဒီနေ့ဆုလာဘ်ကို ရယူလိုက်ပါ!`;
    }
    if (projectedStreak >= 3) {
      return `${projectedStreak} ရက်ဆက်တိုက် လေ့လာနေတာ တကယ့်ကို အံ့ဩဖို့ကောင်းပါတယ်ဗျာ! Professional Developer ဖြစ်ဖို့ ခြေလှမ်းတစ်လှမ်း ပိုနီးလာပြီ!`;
    }
    return "မင်္ဂလာပါခင်ဗျာ! နေ့စဉ် Check-in ဝင်ရောက်ပြီး 🏆 XP နှင့် 🪙 Coins ဆုလာဘ်များကို နေ့တိုင်း အခမဲ့ရယူနိုင်ပါတယ်ခင်ဗျာ။";
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in text-slate-200">
      <div className="bg-[#1E293B] border border-slate-700/60 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Dynamic Theme Banner Based on Special Events */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${
          isEventActive 
            ? "from-amber-500 via-pink-500 to-purple-500 animate-pulse" 
            : "from-blue-500 via-indigo-500 to-purple-500"
        }`} />

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-yellow-400 animate-bounce" />
            <div>
              <h2 className="text-sm font-extrabold text-white font-display">နေ့စဉ်ဝင်ရောက်မှု ဆုလာဘ် (Daily Check-in)</h2>
              <p className="text-[10px] text-slate-400">လေ့လာမှုအရှိန် မပျက်စေရန် နေ့တိုင်း ဝင်ရောက်ဆုယူပါ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Active Campaign / Special Event Banner (Admin Configurable) */}
          {isEventActive && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-pink-500/30 rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden animate-pulse">
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-[9px] bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                  🔥 Special Event Active
                </span>
                <h4 className="text-xs font-bold text-white">{activeSettings?.currentEventTitle || "Special Challenge"}</h4>
                <p className="text-[10px] text-slate-300">
                  {activeSettings?.currentEventDescription || "XP ဆုလာဘ်များ ပိုမိုရယူနိုင်မည့် ပွဲတော်ကြီးဖြစ်ပါသည်!"}
                  {eventMultiplier > 0 && ` (Daily Check-in XP +${eventMultiplier}%)`}
                </p>
              </div>
            </div>
          )}

          {/* Kibo Mascot Greeting */}
          <div className="flex justify-center py-1">
            <KiboMascot 
              emotion={claimed ? "celebrating" : projectedStreak >= 3 ? "excited" : "encouraging"}
              size="md"
              animated={true}
              speechBubble={getKiboSpeech()}
            />
          </div>

          {/* Streak Progression Week Row (1 - 7 Days Cycle) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-indigo-400" />
                ၇ ရက်ပတ်လည် တိုးတက်မှု (Streak Cycle)
              </span>
              <span className="font-extrabold text-amber-500 font-mono">
                Current Streak: {projectedStreak} Day{projectedStreak > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {daysOfWeek.map((dayLabel, idx) => {
                const dayNum = idx + 1;
                const isCurrentDay = dayNum === currentDayInCycle;
                const isCompletedDay = dayNum < currentDayInCycle || (alreadyCheckedInToday && dayNum === currentDayInCycle);
                
                return (
                  <div 
                    key={dayNum} 
                    className={`p-2.5 rounded-xl border text-center flex flex-col justify-between items-center transition-all ${
                      isCurrentDay && !alreadyCheckedInToday
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30 animate-pulse"
                        : isCompletedDay
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-slate-900/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    <span className="text-[8px] font-bold font-mono tracking-wider uppercase block truncate max-w-full">
                      Day {dayNum}
                    </span>
                    <div className="my-1.5">
                      {isCompletedDay ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : dayNum === 7 ? (
                        <Award className={`w-4 h-4 ${isCurrentDay ? "text-yellow-400" : "text-slate-600"}`} />
                      ) : (
                        <Flame className={`w-4 h-4 ${isCurrentDay ? "text-amber-500" : "text-slate-600"}`} />
                      )}
                    </div>
                    <span className="text-[8px] font-bold font-mono">
                      +{getBaseXpReward(dayNum)} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Summary Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 text-left">ယနေ့အတွက် ရရှိမည့် ဆုလာဘ်များ -</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1E293B] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Experience points</p>
                  <p className="text-sm font-extrabold text-white font-mono">+{totalXpReward} XP</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold">
                  🏆
                </div>
              </div>

              <div className="bg-[#1E293B] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Learning Coins</p>
                  <p className="text-sm font-extrabold text-yellow-400 font-mono">+{totalCoinsReward} Coins</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-sm font-bold">
                  🪙
                </div>
              </div>
            </div>

            {isEventActive && bonusXp > 0 && (
              <p className="text-[10px] text-pink-400 text-left font-semibold">
                ✨ Event Bonus: Includes +{bonusXp} XP extra from {activeSettings?.currentEventTitle}!
              </p>
            )}
          </div>

          {/* Elegant closeable premium promotion for Free Users ONLY */}
          {!user.isPremium && (
            <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-purple-500/15 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden text-left space-y-2.5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                  👑 Kibo Premium Upgrade
                </span>
                
                {/* Dynamic configured discount timer or alert if promo is active */}
                {activeSettings?.isPromoActive && activeSettings.promoDiscountPercent && (
                  <span className="text-[8px] bg-red-600/20 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider animate-pulse">
                    Save {activeSettings.promoDiscountPercent}% Now!
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>Premium နဲ့ Lesson အားလုံးကို လေ့လာနိုင်ပါတယ်!</strong> Assignments, Quiz မေးခွန်းများ၊ Project mentor နှင့် Certified အောင်လက်မှတ်များအားလုံးကို ရယူလိုက်ပါ။
              </p>

              <button
                onClick={() => {
                  onClose();
                  // Dispatch a navigation to premium tab or scroll to Premium section
                  const tabBtn = document.getElementById("nav-premium");
                  if (tabBtn) tabBtn.click();
                }}
                className="flex items-center space-x-1 text-[10px] text-amber-400 hover:text-amber-300 font-extrabold transition-all group cursor-pointer"
              >
                <span>Premium အကျိုးကျေးဇူးများ ကြည့်ရှုမည်</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/30 flex items-center justify-end">
          {alreadyCheckedInToday || claimed ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[10px] text-emerald-400 font-semibold text-center sm:text-left">
                🎉 ယနေ့အတွက် Check-in အောင်မြင်စွာ ဆုယူပြီးပါပြီ။ မနက်ဖြန်တွင် ထပ်မံလာရောက်ဆုယူပါ!
              </p>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ပိတ်မည် (Close)
              </button>
            </div>
          ) : (
            <button
              onClick={handleClaimClick}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Claim Daily Rewards</span>
                  <span>🎁</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
