/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Premium Authentication, Expiration Management & Feature Gating
 * Enforces server-side validated state and trusted permissions.
 */

import { UserProfile } from "../types";

export interface PremiumStatusDetails {
  isPremium: boolean;
  isExpired: boolean;
  isLifetime: boolean;
  daysRemaining: number;
  planId?: "monthly" | "six_months" | "lifetime" | string;
  planName: string;
  activatedAt?: string;
  expiresAt?: string;
  formattedExpiry: string;
  membershipStatus: "free" | "premium" | "expired" | "pending";
}

export interface PremiumFeatureAccess {
  canAccessAdvancedLessons: boolean;
  canAccessPremiumVideos: boolean;
  canAccessPremiumResources: boolean;
  canAccessAdvancedProjects: boolean;
  canAccessHigherKiboUsage: boolean;
  canAccessPremiumTelegram: boolean;
  canAccessCertificates: boolean;
  isAdFree: boolean;
}

/**
 * Checks if a user has an active, valid, non-expired Premium subscription
 * Controlled by trusted timestamps and role verification.
 */
export function isUserPremium(user?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Teachers and Admins have full access
  if (user.role === "admin" || user.role === "teacher") {
    return true;
  }

  const isMarkedPremium = user.isPremium === true || 
                          user.role === "premium" || 
                          (user as any).membershipStatus === "premium";

  if (!isMarkedPremium) {
    return false;
  }

  // Lifetime plan never expires
  if (user.premiumPlan === "lifetime" || (user as any).isLifetime) {
    return true;
  }

  // Expiration check
  const expiryStr = user.premiumUntil || user.premiumExpiresAt;
  if (!expiryStr) {
    // If marked premium but no expiry string, treat as active
    return true;
  }

  const expiryDate = new Date(expiryStr);
  if (isNaN(expiryDate.getTime())) {
    return true;
  }

  return expiryDate.getTime() > Date.now();
}

/**
 * Checks if a user's Premium subscription has expired
 */
export function isUserPremiumExpired(user?: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "teacher") return false;
  if (user.premiumPlan === "lifetime") return false;

  const isMarkedPremium = user.isPremium === true || 
                          user.role === "premium" || 
                          (user as any).membershipStatus === "premium" ||
                          (user as any).membershipStatus === "expired";

  if (!isMarkedPremium) return false;

  const expiryStr = user.premiumUntil || user.premiumExpiresAt;
  if (!expiryStr) return false;

  const expiryDate = new Date(expiryStr);
  if (isNaN(expiryDate.getTime())) return false;

  return expiryDate.getTime() <= Date.now();
}

/**
 * Calculates comprehensive status details for a user
 */
export function getPremiumStatusDetails(user?: UserProfile | null): PremiumStatusDetails {
  if (!user) {
    return {
      isPremium: false,
      isExpired: false,
      isLifetime: false,
      daysRemaining: 0,
      planName: "Free Student",
      formattedExpiry: "N/A",
      membershipStatus: "free"
    };
  }

  const isLifetime = user.premiumPlan === "lifetime" || user.role === "admin" || user.role === "teacher";
  const isPremiumActive = isUserPremium(user);
  const isExpired = isUserPremiumExpired(user);

  let daysRemaining = 0;
  const expiryStr = user.premiumUntil || user.premiumExpiresAt;
  let formattedExpiry = isLifetime ? "Lifetime Access (အမြဲတမ်းအသုံးပြုခွင့်)" : "N/A";

  if (expiryStr) {
    const expiryDate = new Date(expiryStr);
    if (!isNaN(expiryDate.getTime())) {
      const diffMs = expiryDate.getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      formattedExpiry = expiryDate.toLocaleDateString("my-MM", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
  }

  let planName = "Free Plan";
  if (user.role === "admin") planName = "System Administrator (Full Access)";
  else if (user.role === "teacher") planName = "Instructor / Teacher (Full Access)";
  else if (user.premiumPlan === "lifetime") planName = "Lifetime VIP Plan 👑";
  else if (user.premiumPlan === "six_months") planName = "6 Months Pro Plan 🚀";
  else if (user.premiumPlan === "monthly") planName = "Monthly Pro Plan ⭐";
  else if (isPremiumActive) planName = "Kibo Premium Active 👑";

  const membershipStatus: PremiumStatusDetails["membershipStatus"] = 
    isPremiumActive ? "premium" : isExpired ? "expired" : "free";

  return {
    isPremium: isPremiumActive,
    isExpired,
    isLifetime,
    daysRemaining,
    planId: user.premiumPlan,
    planName,
    activatedAt: user.premiumActivatedAt,
    expiresAt: expiryStr,
    formattedExpiry,
    membershipStatus
  };
}

/**
 * Returns feature-level access permissions
 */
export function getPremiumFeatureAccess(user?: UserProfile | null): PremiumFeatureAccess {
  const premium = isUserPremium(user);

  return {
    canAccessAdvancedLessons: premium,
    canAccessPremiumVideos: premium,
    canAccessPremiumResources: premium,
    canAccessAdvancedProjects: premium,
    canAccessHigherKiboUsage: premium,
    canAccessPremiumTelegram: premium,
    canAccessCertificates: premium,
    isAdFree: premium
  };
}

/**
 * Validates user premium status with trusted server-side API
 */
export async function verifyPremiumWithServer(uid: string, email?: string): Promise<{
  isPremium: boolean;
  isExpired: boolean;
  status: string;
  details?: PremiumStatusDetails;
}> {
  try {
    const res = await fetch(`/api/premium/verify-status?uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(email || "")}`);
    if (res.ok) {
      const data = await res.json();
      return {
        isPremium: data.isPremium === true,
        isExpired: data.isExpired === true,
        status: data.status || "ok",
        details: data.details
      };
    }
  } catch (err) {
    console.warn("Could not verify premium status with server, falling back to client cache:", err);
  }

  return {
    isPremium: false,
    isExpired: false,
    status: "fallback"
  };
}

export const PREMIUM_FEATURE_DEFINITIONS = [
  {
    id: "advanced_lessons",
    name: "Advanced Lessons",
    myanmarName: "အဆင့်မြင့် သင်ခန်းစာများ",
    desc: "Full access to advanced programming courses and special tracks",
    icon: "book"
  },
  {
    id: "premium_videos",
    name: "Premium Videos",
    myanmarName: "သီးသန့် ဗီဒီယိုသင်ခန်းစာများ",
    desc: "HD videos and Telegram fast-mirror stream downloads",
    icon: "video"
  },
  {
    id: "premium_resources",
    name: "Premium Resources",
    myanmarName: "ဒေါင်းလုဒ် ရင်းမြစ်များ",
    desc: "Downloadable starter kits, cheat sheets, and source codes",
    icon: "folder"
  },
  {
    id: "advanced_projects",
    name: "Advanced Projects",
    myanmarName: "လက်တွေ့ အဆင့်မြင့် ပရောဂျက်များ",
    desc: "Enterprise projects with code review and grading",
    icon: "code"
  },
  {
    id: "higher_kibo_usage",
    name: "Higher Kibo Usage",
    myanmarName: "Kibo AI မြင့်မားသော ကန့်သတ်ချက်",
    desc: "Unlimited deep code reviews and AI coding guidance",
    icon: "zap"
  },
  {
    id: "telegram_access",
    name: "Premium Telegram Access",
    myanmarName: "သီးသန့် Telegram VIP Channel",
    desc: "Direct mentor Q&A and private VIP channel",
    icon: "send"
  }
];
