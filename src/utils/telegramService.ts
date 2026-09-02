/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TelegramChannelSettings, TelegramAccessRequest, UserProfile } from "../types";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

export const DEFAULT_TELEGRAM_SETTINGS: TelegramChannelSettings = {
  freeChannelName: "Code Learn Myanmar",
  freeChannelUrl: "https://t.me/code_Learn_myanmar",
  freeChannelHandle: "@code_Learn_myanmar",
  freeChannelDescription: "Code Learn Myanmar ၏ အခမဲ့ ဗီဒီယို သင်ခန်းစာများ၊ ပရိုဂရမ်မင်း အခြေခံ ဗီဒီယိုများ၊ Source Code ဖိုင်များနှင့် အမေးအဖြေများကို ကြည့်ရှုလေ့လာနိုင်သော တရားဝင် Public Telegram Channel ဖြစ်ပါသည်။",
  premiumChannelName: "Code Learn Myanmar (VIP / Premium Pro)",
  premiumChannelInviteLink: "https://t.me/+CLM_VIP_Verified_DirectAccess",
  premiumChannelHandle: "@CLM_VIP_Channel",
  premiumChannelDescription: "Premium VIP အဖွဲ့ဝင်များအတွက် သီးသန့် သတ်မှတ်ထားသော Private Telegram Channel ဖြစ်ပြီး၊ အဆင့်မြင့် ပရောဂျက်ဗီဒီယိုများ၊ 1080p HD Masterclasses နှင့် Downloadable Resource ZIP များကို ရယူနိုင်ပါသည်။ (Administrator အတည်ပြုချက် လိုအပ်ပါသည်)",
  adminVerificationRequired: true,
  supportTelegramHandle: "@Johnny_AZM",
  botUsername: "@CodeLearnMyanmarBot",
  allowInstantVerificationForVerifiedPayment: true
};

const TELEGRAM_SETTINGS_KEY = "clm_telegram_channel_settings";
const TELEGRAM_REQUESTS_KEY = "clm_telegram_access_requests";

// Get Telegram Channel Settings with Firestore & LocalStorage fallback
export async function getTelegramSettings(): Promise<TelegramChannelSettings> {
  try {
    if (db) {
      const snap = await getDoc(doc(db, "system_settings", "telegram_channels"));
      if (snap.exists()) {
        const data = snap.data() as Partial<TelegramChannelSettings>;
        return { ...DEFAULT_TELEGRAM_SETTINGS, ...data };
      }
    }
  } catch (err) {
    console.warn("Could not load Telegram settings from Firestore, using local fallback:", err);
  }

  const local = localStorage.getItem(TELEGRAM_SETTINGS_KEY);
  if (local) {
    try {
      return { ...DEFAULT_TELEGRAM_SETTINGS, ...JSON.parse(local) };
    } catch {
      // ignore
    }
  }
  return DEFAULT_TELEGRAM_SETTINGS;
}

// Save Telegram Channel Settings
export async function saveTelegramSettings(settings: TelegramChannelSettings): Promise<void> {
  localStorage.setItem(TELEGRAM_SETTINGS_KEY, JSON.stringify(settings));
  try {
    if (db) {
      await setDoc(doc(db, "system_settings", "telegram_channels"), settings, { merge: true });
    }
  } catch (err) {
    console.warn("Could not save Telegram settings to Firestore:", err);
  }
}

// Get all Telegram access requests (Admin View)
export async function getAllTelegramRequests(): Promise<TelegramAccessRequest[]> {
  try {
    if (db) {
      const q = query(collection(db, "telegram_access_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: TelegramAccessRequest[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as TelegramAccessRequest));
        return list;
      }
    }
  } catch (err) {
    console.warn("Could not load Telegram access requests from Firestore:", err);
  }

  const local = localStorage.getItem(TELEGRAM_REQUESTS_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }

  // Sample initial seed requests for demo/admin view
  const seedRequests: TelegramAccessRequest[] = [
    {
      id: "tg_req_001",
      requestId: "TG-2025-001",
      uid: "user_aung_01",
      userName: "Aung Kaung Myat",
      userEmail: "aungkaung@gmail.com",
      telegramUsername: "@aung_kaung_dev",
      status: "approved",
      planName: "Pro Membership (1 Year)",
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      approvedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      approvedBy: "Admin System",
      privateInviteLink: "https://t.me/+CLM_VIP_Verified_DirectAccess",
      adminNote: "Payment verified via KPay"
    },
    {
      id: "tg_req_002",
      requestId: "TG-2025-002",
      uid: "user_su_02",
      userName: "Su Myat Noe",
      userEmail: "sumyat@gmail.com",
      telegramUsername: "@su_myat_noe99",
      status: "pending",
      planName: "Full Stack Pro (Lifetime)",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      adminNote: "Awaiting admin verification of Telegram handle"
    }
  ];

  localStorage.setItem(TELEGRAM_REQUESTS_KEY, JSON.stringify(seedRequests));
  return seedRequests;
}

export const getAllTelegramAccessRequests = getAllTelegramRequests;

// Submit a new Telegram Verification Request
export async function submitTelegramAccessRequest(
  user: UserProfile,
  telegramUsername: string,
  planName: string = "Premium VIP Membership"
): Promise<TelegramAccessRequest> {
  const cleanHandle = telegramUsername.startsWith("@") ? telegramUsername.trim() : `@${telegramUsername.trim()}`;
  const newReq: TelegramAccessRequest = {
    id: `tg_req_${Date.now()}`,
    requestId: `TG-${Date.now().toString().slice(-6)}`,
    uid: user.uid,
    userName: user.name || "Student",
    userEmail: user.email || "",
    telegramUsername: cleanHandle,
    status: "pending",
    planName: planName,
    createdAt: new Date().toISOString(),
    adminNote: "User requested Private Telegram VIP Channel access"
  };

  // Save locally
  const current = await getAllTelegramRequests();
  // Filter out any older pending requests from same user
  const updated = [newReq, ...current.filter(r => r.uid !== user.uid || r.status === "approved")];
  localStorage.setItem(TELEGRAM_REQUESTS_KEY, JSON.stringify(updated));

  // Save in Firestore if available
  try {
    if (db) {
      await setDoc(doc(db, "telegram_access_requests", newReq.id), newReq);
      await updateDoc(doc(db, "users", user.uid), {
        telegramUsername: cleanHandle,
        telegramVerificationStatus: "pending"
      });
    }
  } catch (err) {
    console.warn("Could not save Telegram access request to Firestore:", err);
  }

  return newReq;
}

// Approve Telegram access request
export async function approveTelegramAccessRequest(
  requestId: string,
  adminUid: string,
  inviteLink?: string,
  note?: string
): Promise<void> {
  const settings = await getTelegramSettings();
  const linkToUse = inviteLink || settings.premiumChannelInviteLink;

  const current = await getAllTelegramRequests();
  const target = current.find(r => r.id === requestId);
  const updated = current.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: "approved" as const,
        approvedAt: new Date().toISOString(),
        approvedBy: adminUid || "Admin",
        privateInviteLink: linkToUse,
        adminNote: note || "Verified & approved by Administrator"
      };
    }
    return r;
  });

  localStorage.setItem(TELEGRAM_REQUESTS_KEY, JSON.stringify(updated));

  try {
    if (db) {
      await updateDoc(doc(db, "telegram_access_requests", requestId), {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: adminUid || "Admin",
        privateInviteLink: linkToUse,
        adminNote: note || "Verified & approved by Administrator"
      });

      if (target?.uid) {
        await updateDoc(doc(db, "users", target.uid), {
          telegramVerified: true,
          telegramVerificationStatus: "approved",
          telegramInviteLink: linkToUse,
          telegramApprovedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn("Could not update Telegram access request in Firestore:", err);
  }
}

// Reject or revoke Telegram access request
export async function rejectTelegramAccessRequest(
  requestId: string,
  adminUid: string,
  note: string = "Admin rejected access request"
): Promise<void> {
  const current = await getAllTelegramRequests();
  const target = current.find(r => r.id === requestId);
  const updated = current.map(r => {
    if (r.id === requestId) {
      return {
        ...r,
        status: "rejected" as const,
        approvedBy: adminUid || "Admin",
        adminNote: note
      };
    }
    return r;
  });

  localStorage.setItem(TELEGRAM_REQUESTS_KEY, JSON.stringify(updated));

  try {
    if (db) {
      await updateDoc(doc(db, "telegram_access_requests", requestId), {
        status: "rejected",
        approvedBy: adminUid || "Admin",
        adminNote: note
      });

      if (target?.uid) {
        await updateDoc(doc(db, "users", target.uid), {
          telegramVerified: false,
          telegramVerificationStatus: "rejected"
        });
      }
    }
  } catch (err) {
    console.warn("Could not update Telegram access request in Firestore:", err);
  }
}

// Get Telegram Access Status for a specific user
export async function getUserTelegramStatus(uid: string): Promise<{
  status: "none" | "pending" | "approved" | "rejected" | "revoked";
  request: TelegramAccessRequest | null;
  inviteLink?: string;
}> {
  if (!uid) {
    return { status: "none", request: null };
  }

  // Check from all requests
  const allReqs = await getAllTelegramRequests();
  const userReq = allReqs.find(r => r.uid === uid);

  // Also check Firestore user record if available
  let firestoreStatus: any = null;
  let firestoreInviteLink: string | undefined;
  let isVerified = false;

  try {
    if (db) {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const u = snap.data() as UserProfile;
        firestoreStatus = u.telegramVerificationStatus;
        firestoreInviteLink = u.telegramInviteLink;
        isVerified = !!u.telegramVerified;
      }
    }
  } catch (err) {
    console.warn("Could not check user telegram status from Firestore:", err);
  }

  if (isVerified || firestoreStatus === "approved" || userReq?.status === "approved") {
    const settings = await getTelegramSettings();
    return {
      status: "approved",
      request: userReq || null,
      inviteLink: firestoreInviteLink || userReq?.privateInviteLink || settings.premiumChannelInviteLink
    };
  }

  if (userReq) {
    return {
      status: userReq.status,
      request: userReq,
      inviteLink: userReq.privateInviteLink
    };
  }

  if (firestoreStatus) {
    return {
      status: firestoreStatus,
      request: null,
      inviteLink: firestoreInviteLink
    };
  }

  return {
    status: "none",
    request: null
  };
}

// User Verification Result Structure for Admin
export interface UserTelegramVerificationDetail {
  user: UserProfile;
  isFound: boolean;
  isPremiumEligible: boolean;
  isExpired: boolean;
  daysRemaining?: number;
  paymentStatus: "verified" | "pending" | "unpaid" | "no_record";
  telegramStatus: "none" | "pending" | "approved" | "rejected" | "revoked";
  telegramRequest?: TelegramAccessRequest;
  canApprove: boolean;
  warnings: string[];
}

// Search user by UID across Firestore & Local Storage for Telegram Verification
export async function searchUserByUidForVerification(uid: string): Promise<UserTelegramVerificationDetail | null> {
  if (!uid || !uid.trim()) return null;
  const cleanUid = uid.trim();

  let foundUser: UserProfile | null = null;

  // 1. Try Firestore
  try {
    if (db) {
      const userDoc = await getDoc(doc(db, "users", cleanUid));
      if (userDoc.exists()) {
        foundUser = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
      }
    }
  } catch (err) {
    console.warn("Error searching user in Firestore:", err);
  }

  // 2. Fallback to LocalStorage
  if (!foundUser) {
    try {
      // Check current user in local storage
      const stored = localStorage.getItem("clm_user_profile");
      if (stored) {
        const u = JSON.parse(stored) as UserProfile;
        if (u.uid === cleanUid || (u as any).id === cleanUid) {
          foundUser = u;
        }
      }

      // Check all users cache
      if (!foundUser) {
        const allUsers = localStorage.getItem("clm_all_users");
        if (allUsers) {
          const list = JSON.parse(allUsers) as UserProfile[];
          const match = list.find(u => u.uid === cleanUid || (u as any).id === cleanUid || u.email?.toLowerCase() === cleanUid.toLowerCase());
          if (match) {
            foundUser = match;
          }
        }
      }
    } catch (err) {
      console.warn("Error parsing local users:", err);
    }
  }

  if (!foundUser) {
    return null;
  }

  // Check Expiry
  const now = new Date();
  let isExpired = false;
  let daysRemaining: number | undefined = undefined;

  if (foundUser.premiumUntil || foundUser.premiumExpiresAt) {
    const expiry = new Date(foundUser.premiumUntil || foundUser.premiumExpiresAt || "");
    if (!isNaN(expiry.getTime())) {
      isExpired = expiry < now;
      daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  const isPremiumActive = Boolean(foundUser.isPremium) && !isExpired;

  // Find associated Telegram request
  const allRequests = await getAllTelegramRequests();
  const tgRequest = allRequests.find(r => r.uid === cleanUid);

  // Check Payment Request status
  let paymentStatus: "verified" | "pending" | "unpaid" | "no_record" = "no_record";
  try {
    const payHistory = localStorage.getItem("clm_payment_requests");
    if (payHistory) {
      const payments = JSON.parse(payHistory) as any[];
      const userPayments = payments.filter(p => p.uid === cleanUid);
      if (userPayments.some(p => p.status === "approved")) {
        paymentStatus = "verified";
      } else if (userPayments.some(p => p.status === "pending")) {
        paymentStatus = "pending";
      } else if (userPayments.length > 0) {
        paymentStatus = "unpaid";
      }
    }
  } catch {
    // ignore
  }

  if (isPremiumActive && paymentStatus === "no_record") {
    paymentStatus = "verified";
  }

  const warnings: string[] = [];
  if (!foundUser.isPremium) {
    warnings.push("User is not an active Premium subscriber. Upgrading to Premium in database is required before granting VIP Telegram access.");
  }
  if (isExpired) {
    warnings.push(`User's Premium plan expired on ${foundUser.premiumUntil || foundUser.premiumExpiresAt}. Access must be revoked or renewed.`);
  }
  if (foundUser.accountStatus === "suspended" || foundUser.accountStatus === "restricted") {
    warnings.push(`User account is currently ${foundUser.accountStatus.toUpperCase()}. Caution advised.`);
  }

  const telegramStatus = foundUser.telegramVerificationStatus || tgRequest?.status || (foundUser.telegramVerified ? "approved" : "none");

  return {
    user: foundUser,
    isFound: true,
    isPremiumEligible: isPremiumActive,
    isExpired,
    daysRemaining,
    paymentStatus,
    telegramStatus,
    telegramRequest: tgRequest,
    canApprove: isPremiumActive && foundUser.accountStatus !== "suspended",
    warnings
  };
}

// Admin update user Telegram status by UID directly
export async function adminVerifyUserTelegramByUid(
  uid: string,
  newStatus: "approved" | "rejected" | "revoked" | "pending",
  adminUid: string,
  adminName: string = "Admin",
  inviteLink?: string,
  note?: string
): Promise<{ success: boolean; message: string; inviteLink?: string }> {
  const settings = await getTelegramSettings();
  const linkToUse = inviteLink || settings.premiumChannelInviteLink;
  const isApproved = newStatus === "approved";

  // Update in Telegram Requests collection
  const allRequests = await getAllTelegramRequests();
  let targetReq = allRequests.find(r => r.uid === uid);

  if (targetReq) {
    targetReq = {
      ...targetReq,
      status: newStatus,
      approvedAt: isApproved ? new Date().toISOString() : targetReq.approvedAt,
      approvedBy: `${adminName} (${adminUid})`,
      privateInviteLink: isApproved ? linkToUse : undefined,
      adminNote: note || `Updated to ${newStatus} by ${adminName}`
    };
  } else {
    targetReq = {
      id: `tg_req_${Date.now()}`,
      requestId: `TG-${Date.now().toString().slice(-6)}`,
      uid: uid,
      userName: "Verified User",
      userEmail: "",
      telegramUsername: "@user",
      status: newStatus,
      createdAt: new Date().toISOString(),
      approvedAt: isApproved ? new Date().toISOString() : undefined,
      approvedBy: `${adminName} (${adminUid})`,
      privateInviteLink: isApproved ? linkToUse : undefined,
      adminNote: note || `Created & verified by ${adminName}`
    };
  }

  const updatedList = [
    targetReq,
    ...allRequests.filter(r => r.uid !== uid)
  ];
  localStorage.setItem(TELEGRAM_REQUESTS_KEY, JSON.stringify(updatedList));

  // Update Firestore
  try {
    if (db) {
      await setDoc(doc(db, "telegram_access_requests", targetReq.id), targetReq, { merge: true });
      await updateDoc(doc(db, "users", uid), {
        telegramVerified: isApproved,
        telegramVerificationStatus: newStatus,
        telegramInviteLink: isApproved ? linkToUse : null,
        telegramApprovedAt: isApproved ? new Date().toISOString() : null
      });
    }
  } catch (err) {
    console.warn("Could not sync telegram verification to Firestore:", err);
  }

  // Update localStorage user profile if it's the current user
  try {
    const stored = localStorage.getItem("clm_user_profile");
    if (stored) {
      const u = JSON.parse(stored) as UserProfile;
      if (u.uid === uid || (u as any).id === uid) {
        u.telegramVerified = isApproved;
        u.telegramVerificationStatus = newStatus;
        u.telegramInviteLink = isApproved ? linkToUse : undefined;
        u.telegramApprovedAt = isApproved ? new Date().toISOString() : undefined;
        localStorage.setItem("clm_user_profile", JSON.stringify(u));
      }
    }
  } catch {
    // ignore
  }

  return {
    success: true,
    message: isApproved 
      ? `အသုံးပြုသူ (UID: ${uid}) ၏ VIP Telegram Channel ခွင့်ပြုချက်ကို အောင်မြင်စွာ အတည်ပြုပေးပြီးဖြစ်ပါသည်။`
      : `အသုံးပြုသူ (UID: ${uid}) ၏ Telegram ခွင့်ပြုချက်အခြေအနေကို ${newStatus.toUpperCase()} သို့ ပြောင်းလဲလိုက်ပါသည်။`,
    inviteLink: isApproved ? linkToUse : undefined
  };
}

// Admin verify Telegram request helper
export async function adminVerifyTelegramRequest(
  requestId: string,
  uid: string,
  newStatus: "approved" | "rejected",
  adminEmailOrUid: string,
  inviteLink?: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  return await adminVerifyUserTelegramByUid(
    uid,
    newStatus,
    adminEmailOrUid,
    "Administrator",
    inviteLink,
    note
  );
}
