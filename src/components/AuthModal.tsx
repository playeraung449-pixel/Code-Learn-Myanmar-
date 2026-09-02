/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Send,
  ShieldAlert,
  Info,
  Clock,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  signInWithGoogle
} from "../lib/firebase";
import { 
  logAuditEvent, 
  addUserSecurityLog, 
  registerUserSessionOnLogin, 
  getLoginAttemptState, 
  recordFailedLogin, 
  resetLoginAttempts,
  LoginAttemptState,
  loadUserProfile
} from "../lib/db";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (uid: string, email: string, name?: string) => void;
}

type AuthView = "login" | "register" | "forgot" | "verify" | "suspended";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Rate limiting / Brute force states
  const [lockoutState, setLockoutState] = useState<LoginAttemptState>({
    attempts: 0,
    isLocked: false,
    lockedUntil: null,
    remainingMinutes: 0,
    remainingSeconds: 0
  });

  // Password reset cooldown (60 seconds)
  const [resetCooldown, setResetCooldown] = useState(0);

  // Suspension information for suspended accounts
  const [suspensionReason, setSuspensionReason] = useState("");

  // Track Firebase User state specifically for verification screen
  const currentUser = auth.currentUser;

  // Live countdown timer for lockout & reset cooldown
  useEffect(() => {
    let interval: any;
    if (lockoutState.isLocked && lockoutState.lockedUntil) {
      interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutState.lockedUntil!) {
          setLockoutState({
            attempts: 0,
            isLocked: false,
            lockedUntil: null,
            remainingMinutes: 0,
            remainingSeconds: 0
          });
        } else {
          const remainingMs = lockoutState.lockedUntil! - now;
          setLockoutState(prev => ({
            ...prev,
            remainingMinutes: Math.ceil(remainingMs / 60000),
            remainingSeconds: Math.ceil(remainingMs / 1000)
          }));
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutState.isLocked, lockoutState.lockedUntil]);

  useEffect(() => {
    let timer: any;
    if (resetCooldown > 0) {
      timer = setInterval(() => {
        setResetCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resetCooldown]);

  // Check login rate limit whenever email input changes
  useEffect(() => {
    if (email.trim()) {
      const state = getLoginAttemptState(email);
      setLockoutState(state);
    }
  }, [email]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMsg("");
      setToastMessage("");
      if (currentUser) {
        onClose();
      } else {
        setView("login");
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Trigger transient toasts
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Password strength checker helper
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "စကားဝှက် ရိုက်ထည့်ပါ", color: "text-slate-500", bg: "bg-slate-800", percentage: "0%" };
    
    let score = 0;
    const hasMinLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    if (hasMinLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (score <= 1) {
      return { score, label: "Weak (အားနည်းလွန်းသည်)", color: "text-red-400", bg: "bg-red-500", percentage: "25%" };
    } else if (score === 2) {
      return { score, label: "Medium (အသင့်အတင့်)", color: "text-yellow-400", bg: "bg-yellow-500", percentage: "50%" };
    } else if (score === 3 || score === 4) {
      return { score, label: "Strong (ခိုင်မာသည်)", color: "text-blue-400", bg: "bg-blue-500", percentage: "75%" };
    } else {
      return { score, label: "Excellent (အလွန်ကောင်းမွန်သည်)", color: "text-emerald-400", bg: "bg-emerald-500", percentage: "100%" };
    }
  };

  const strength = checkPasswordStrength(password);

  // Validate signup form inputs strictly as specified
  const validateSignUp = (): boolean => {
    if (name.trim().length < 3 || name.trim().length > 50) {
      setError("နာမည်သည် အနည်းဆုံး ၃ လုံးမှ အများဆုံး ၅၀ လုံးအတွင်း ဖြစ်ရပါမည်။");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("ကျေးဇူးပြု၍ မှန်ကန်သော Email လိပ်စာကို ရိုက်ထည့်ပေးပါဗျာ။");
      return false;
    }

    if (password.length < 8) {
      setError("စကားဝှက် (Password) သည် အနည်းဆုံး ၈ လုံး ရှိရပါမည်။");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError("စကားဝှက်တွင် စာလုံးကြီး (Uppercase) အနည်းဆုံး ၁ လုံး ပါဝင်ရပါမည်။");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError("စကားဝှက်တွင် စာလုံးသေး (Lowercase) အနည်းဆုံး ၁ လုံး ပါဝင်ရပါမည်။");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError("စကားဝှက်တွင် ကိန်းဂဏန်း (Number) အနည်းဆုံး ၁ လုံး ပါဝင်ရပါမည်။");
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("စကားဝှက်တွင် အထူးသင်္ကေတ (Special Character - ဥပမာ @, #, $) အနည်းဆုံး ၁ လုံး ပါဝင်ရပါမည်။");
      return false;
    }

    if (password !== confirmPassword) {
      setError("အတည်ပြုစကားဝှက် (Confirm Password) တိုက်ဆိုင်မှု မရှိပါခင်ဗျာ။");
      return false;
    }

    if (!agreeTerms) {
      setError("အသုံးပြုမှုဆိုင်ရာ သတ်မှတ်ချက်များအား သဘောတူညီရန် လိုအပ်ပါသည် ခင်ဗျာ။");
      return false;
    }

    return true;
  };

  // Error Mapper for Firebase Auth
  const mapAuthErrorToMyanmar = (errCode: string, fallbackMessage: string): string => {
    switch (errCode) {
      case "auth/wrong-password":
        return "ရိုက်ထည့်ထားသော စကားဝှက် (Password) မှားယွင်းနေပါသည် ခင်ဗျာ။";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Email သို့မဟုတ် စကားဝှက် (Password) မှားယွင်းနေပါသည် ခင်ဗျာ။";
      case "auth/user-disabled":
        return "ဤအကောင့်သည် စနစ်စည်းကမ်းဖောက်ဖျက်မှုကြောင့် ပိတ်ပင်ထားခြင်းခံထားရပါသည် ခင်ဗျာ။";
      case "auth/too-many-requests":
        return "တောင်းဆိုမှုများလွန်းနေပါသဖြင့် လုံခြုံရေးအရ ခေတ္တစောင့်ဆိုင်းပြီးမှ ထပ်မံကြိုးစားပေးပါရန်။";
      case "auth/network-request-failed":
        return "အင်တာနက်ချိတ်ဆက်မှု ပြတ်တောက်နေပါသည်၊ ချိတ်ဆက်မှုကို စစ်ဆေးပေးပါဗျာ။";
      case "auth/email-already-in-use":
        return "ဤ Email လိပ်စာကို အခြားသူတစ်ဦးမှ အသုံးပြုပြီးသား ဖြစ်နေပါသည် ခင်ဗျာ။";
      case "auth/invalid-email":
        return "ကျေးဇူးပြု၍ မှန်ကန်သော Email လိပ်စာကို ရိုက်ထည့်ပေးပါဗျာ။";
      case "auth/popup-closed-by-user":
        return "Google အကောင့်ဝင်ရောက်မှု မျက်နှာပြင်အား ပိတ်လိုက်ပါသဖြင့် မအောင်မြင်ပါဗျာ။";
      case "auth/popup-blocked":
        return "Browser မှ Popup Window ကို ပိတ်ပင်ထားပါသဖြင့် Popup ခွင့်ပြုပြီး ထပ်မံကြိုးစားပေးပါရန်။";
      case "auth/unauthorized-domain":
        return `ဤ Web Domain (${window.location.hostname}) သည် Firebase Console တွင် ခွင့်ပြုထားခြင်း မရှိသေးပါ (Unauthorized Domain Error)။

ဖြေရှင်းနည်းလမ်းညွှန် -
၁။ သင့် Firebase Console (https://console.firebase.google.com) သို့ သွားပါ။
၂။ Authentication > Settings > Authorized Domains ကဏ္ဍသို့ သွားပါ။
၃။ "Add domain" ကို နှိပ်ပြီး အောက်ဖော်ပြပါ Domain ကို ထည့်သွင်းပေးပါရန် -
   • ${window.location.hostname}
၄။ ထည့်သွင်းပြီးပါက ဤစာမျက်နှာကို Refresh ပြုလုပ်၍ Google ဖြင့် အကောင့်ပြန်ဝင်ကြည့်ပါခင်ဗျာ။`;
      default:
        return fallbackMessage || "အကောင့်လုပ်ဆောင်မှု မအောင်မြင်ပါဗျာ။ ခေတ္တစောင့်ဆိုင်းပြီး ထပ်မံကြိုးစားပေးပါ။";
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();

    // Check brute-force lockout
    const attemptState = getLoginAttemptState(cleanEmail);
    if (attemptState.isLocked) {
      setLockoutState(attemptState);
      setError(`လုံခြုံရေးအရ စကားဝှက်အကြိမ်ကြိမ် မှားယွင်းမှုကြောင့် အကောင့်ဝင်ရောက်မှုကို ခေတ္တပိတ်ထားပါသည်။ ကျေးဇူးပြု၍ ${attemptState.remainingMinutes} မိနစ် (${attemptState.remainingSeconds} စက္ကန့်) စောင့်ဆိုင်းပေးပါရန် သို့မဟုတ် စကားဝှက် ပြန်လည်ရယူပါ။`);
      return;
    }

    setIsLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCred.user;
      
      // Reset failed login counter on success
      resetLoginAttempts(cleanEmail);
      setLockoutState({ attempts: 0, isLocked: false, lockedUntil: null, remainingMinutes: 0, remainingSeconds: 0 });

      // Check user account suspension in database
      const cloudProfile = await loadUserProfile(user.uid);
      if (cloudProfile && cloudProfile.accountStatus === "suspended") {
        await signOut(auth);
        setSuspensionReason(cloudProfile.suspensionReason || "စနစ်စည်းမျဉ်းဖောက်ဖျက်မှုကြောင့် အကောင့်အား ရပ်ဆိုင်းထားပါသည်");
        setView("suspended");
        setIsLoading(false);
        return;
      }

      await logAuditEvent(user.uid, "Login Successful (အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်သည်)");
      await addUserSecurityLog(user.uid, "User Logged In", "အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်သည်", "success");
      await registerUserSessionOnLogin(user.uid);

      onAuthSuccess(user.uid, user.email || cleanEmail, user.displayName || undefined);
      showToast("အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်ခင်ဗျာ။");
      onClose();
    } catch (err: any) {
      console.error("Login error:", err);
      // Record failed attempt
      const newRateState = recordFailedLogin(cleanEmail);
      setLockoutState(newRateState);

      if (newRateState.isLocked) {
        setError(`စကားဝှက် ၅ ကြိမ် ဆက်တိုက် မှားယွင်းသွားသဖြင့် အကောင့်ကို ၁၅ မိနစ်ကြာ ခေတ္တ ပိတ်ထားလိုက်ပါပြီ။ စကားဝှက်မေ့နေပါက 'စကားဝှက် ပြန်လည်ရယူရန်' ကို နှိပ်၍ Reset ပြုလုပ်နိုင်ပါသည် ခင်ဗျာ။`);
      } else {
        const attemptsLeft = 5 - newRateState.attempts;
        const warningSuffix = newRateState.attempts >= 3 ? ` (သတိပေးချက်: လက်ကျန်အကြိမ်ရေ ${attemptsLeft} ကြိမ် ကျန်ပါသည်)` : "";
        setError(mapAuthErrorToMyanmar(err.code, err.message) + warningSuffix);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setIsGoogleLoading(true);

    try {
      const userCred = await signInWithGoogle();
      const user = userCred.user;

      // Check if suspended
      const cloudProfile = await loadUserProfile(user.uid);
      if (cloudProfile && cloudProfile.accountStatus === "suspended") {
        await signOut(auth);
        setSuspensionReason(cloudProfile.suspensionReason || "စနစ်စည်းမျဉ်းဖောက်ဖျက်မှုကြောင့် အကောင့်အား ရပ်ဆိုင်းထားပါသည်");
        setView("suspended");
        setIsGoogleLoading(false);
        return;
      }

      await logAuditEvent(user.uid, "Google Sign-In Successful (Google ဖြင့် အကောင့်ဝင်ခြင်း အောင်မြင်သည်)");
      await addUserSecurityLog(user.uid, "Google Sign-In", "Google ဖြင့် အကောင့်ဝင်ရောက်ခြင်း", "success");
      await registerUserSessionOnLogin(user.uid);

      onAuthSuccess(user.uid, user.email || "", user.displayName || undefined);
      showToast("Google ဖြင့် အကောင့်ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်ခင်ဗျာ။");
      onClose();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(mapAuthErrorToMyanmar(err.code, err.message));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!validateSignUp()) return;

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCred.user;

      // Update Firebase Profile displayName
      await updateProfile(user, { displayName: name.trim() });
      
      // Create initial profile in firestore first so audit log can find it
      onAuthSuccess(user.uid, user.email || cleanEmail, name.trim());
      await logAuditEvent(user.uid, "Account Registered Successfully (အကောင့်အသစ် ပြုလုပ်ခြင်း အောင်မြင်သည်)");
      await addUserSecurityLog(user.uid, "Account Created", "အကောင့်အသစ် ဖန်တီးခြင်း အောင်မြင်သည်", "success");
      await registerUserSessionOnLogin(user.uid);

      showToast("အကောင့်ပြုလုပ်ခြင်း အောင်မြင်ပြီး တိုက်ရိုက်ဝင်ရောက်သွားပါပြီခင်ဗျာ။");
      onClose();
    } catch (err: any) {
      console.error("Register error:", err);
      setError(mapAuthErrorToMyanmar(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("ကျေးဇူးပြု၍ သင့် Email လိပ်စာကို ရိုက်ထည့်ပေးပါရန်။");
      return;
    }

    if (resetCooldown > 0) {
      setError(`လုံခြုံရေးအရ စကားဝှက် Reset တောင်းဆိုမှုကို စက္ကန့် ${resetCooldown} အကြာမှ ထပ်မံ ပေးပို့နိုင်ပါမည် ခင်ဗျာ။`);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessMsg("စကားဝှက်အသစ်သတ်မှတ်ရန် လုံခြုံသော Link ကို သင့် Email သို့ ပို့ပေးလိုက်ပါပြီ။ ကျေးဇူးပြု၍ စစ်ဆေးကြည့်ပေးပါ ခင်ဗျာ။");
      setResetCooldown(60); // 60s cooldown
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(mapAuthErrorToMyanmar(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await sendEmailVerification(auth.currentUser);
      await logAuditEvent(auth.currentUser.uid, "Resend Verification Email (အီးမေးလ်အတည်ပြုချက် ထပ်မံတောင်းဆိုခြင်း)");
      setSuccessMsg("အီးမေးလ်အတည်ပြုချက် Link ကို သင့်ထံ နောက်တစ်ကြိမ် ထပ်မံပေးပို့ပြီးပါပြီ ခင်ဗျာ။");
    } catch (err: any) {
      setError(mapAuthErrorToMyanmar(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setIsVerifying(true);
    setError("");
    setSuccessMsg("");
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser.emailVerified) {
        await logAuditEvent(updatedUser.uid, "Email Verified Successfully (အီးမေးလ်အတည်ပြုချက် အောင်မြင်သည်)");
        onAuthSuccess(updatedUser.uid, updatedUser.email || "", updatedUser.displayName || undefined);
        showToast("အီးမေးလ်အတည်ပြုခြင်း အောင်မြင်ပါသည်ခင်ဗျာ။ စတင်လေ့လာနိုင်ပါပြီ။");
        onClose();
      } else {
        setError("အီးမေးလ် အတည်ပြုထားခြင်း မတွေ့ရှိသေးပါခင်ဗျာ။ သင့် Inbox (သို့မဟုတ်) Spam folder ကို စစ်ဆေးပေးပါ။");
      }
    } catch (err: any) {
      setError(mapAuthErrorToMyanmar(err.code, err.message));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView("login");
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-emerald-600 border border-emerald-500/30 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden my-8">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

        {/* Header Block */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-md shadow-blue-500/10 text-white font-bold text-lg">
              C
            </div>
            <div className="text-left">
              <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-tight">
                Code Learn <span className="text-blue-500">Myanmar</span>
              </h2>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">SECURE LEARNER PORTAL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Welcome message / View Titles */}
        <div className="text-left space-y-1">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
            <span>
              {view === "login" && "အကောင့်ဝင်ရောက်ရန်"}
              {view === "register" && "အကောင့်အသစ်ပြုလုပ်ရန်"}
              {view === "forgot" && "စကားဝှက် ပြန်လည်ရယူရန်"}
              {view === "verify" && "အီးမေးလ်အတည်ပြုရန်"}
              {view === "suspended" && "အကောင့်ပိတ်ပင်ခြင်းခံရပါသည်"}
            </span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {view === "login" && "ပြန်လည်ကြိုဆိုပါသည်! သင်တန်းများ ဆက်လက်လေ့လာရန် လုံခြုံစွာ ဝင်ရောက်ပါ"}
            {view === "register" && "မင်္ဂလာပါ! အခမဲ့ပရိုဂရမ်မင်း ပညာရေးလမ်းစဉ်ကို ယခုပဲ စတင်လိုက်ပါ"}
            {view === "forgot" && "သင့် Email ရိုက်ထည့်၍ စကားဝှက် အသစ်သတ်မှတ်နိုင်ပါသည်"}
            {view === "verify" && "လုံခြုံရေးအရ သင်ခန်းစာများ မလေ့လာမီ Email အတည်ပြုရန် လိုအပ်ပါသည်"}
            {view === "suspended" && "စည်းကမ်းဖောက်ဖျက်မှုကြောင့် အကောင့်အား ရပ်ဆိုင်းထားပါသည်"}
          </p>
        </div>

        {/* Lockout Warning Banner if Locked */}
        {lockoutState.isLocked && view === "login" && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-left space-y-2 text-rose-500">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Clock className="w-4 h-4 text-rose-500 animate-spin" />
              <span>အကောင့်အား ခေတ္တ ပိတ်ထားပါသည် (Rate Limit Lockout)</span>
            </div>
            <p className="text-[11px] text-rose-400 leading-relaxed">
              စကားဝှက် ၅ ကြိမ် ဆက်တိုက် မှားယွင်းခဲ့သဖြင့် အကောင့်ကို ၁၅ မိနစ် ခေတ္တ ပိတ်ထားပါသည်။
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-300">
                စောင့်ဆိုင်းရန်: {lockoutState.remainingMinutes} မိနစ် ({lockoutState.remainingSeconds}s)
              </span>
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-[11px] text-blue-400 hover:underline font-bold"
              >
                စကားဝှက် Reset ပြုလုပ်မည်
              </button>
            </div>
          </div>
        )}

        {/* Global Notifications */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-start space-x-2 text-red-600 dark:text-red-400 text-xs text-left">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span className="whitespace-pre-line leading-relaxed">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-start space-x-2 text-emerald-600 dark:text-emerald-400 text-xs text-left">
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================== VIEW: LOGIN ==================== */}
        {view === "login" && (
          <div className="space-y-4">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Google ဖြင့် အကောင့်ဝင်ရောက်မည်</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">သို့မဟုတ် Email ဖြင့်</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email လိပ်စာ</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">စကားဝှက် (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    စကားဝှက်မေ့နေပါသလား? (Forgot)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="စကားဝှက် ရိုက်ထည့်ပါ"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>အကောင့်ဝင်သိမ်းထားမည် (Remember Me)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || lockoutState.isLocked}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:opacity-60 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>စစ်ဆေးပြီး ဝင်ရောက်နေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>လုံခြုံစွာ အကောင့်ဝင်ရောက်မည်</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================== VIEW: REGISTER ==================== */}
        {view === "register" && (
          <div className="space-y-4">
            {/* Google Sign-in Shortcut */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Google အကောင့်ဖြင့် တစ်ချက်နှိပ် ဖွင့်မည်</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-850" />
              <span className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">သို့မဟုတ် အချက်အလက်ဖြည့်၍</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-850" />
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">နာမည်အပြည့်အစုံ (Full Name)</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="၃ လုံးမှ ၅၀ လုံးအတွင်း ဥပမာ - မောင်မောင်"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email လိပ်စာ</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">စကားဝှက်သစ် (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="အနည်းဆုံး ၈ လုံး (စာလုံးကြီး၊ သေး၊ ဂဏန်း၊ အထူးသင်္ကေတ)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>

                {/* LIVE PASSWORD STRENGTH DISPLAY */}
                {password && (
                  <div className="space-y-1.5 pt-1 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-medium">စကားဝှက်လုံခြုံမှုအခြေအနေ:</span>
                      <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${strength.bg}`}
                        style={{ width: strength.percentage }}
                      />
                    </div>
                    <ul className="text-[9px] text-slate-400 space-y-0.5 font-mono pt-1">
                      <li className={password.length >= 8 ? "text-emerald-500 font-semibold" : "text-slate-500"}>
                        {password.length >= 8 ? "✓" : "•"} အနည်းဆုံး စာလုံး ၈ လုံး ရှိရမည်
                      </li>
                      <li className={/[A-Z]/.test(password) ? "text-emerald-500 font-semibold" : "text-slate-500"}>
                        {/[A-Z]/.test(password) ? "✓" : "•"} အင်္ဂလိပ်စာလုံးကြီး (A-Z) ပါဝင်ရမည်
                      </li>
                      <li className={/[a-z]/.test(password) ? "text-emerald-500 font-semibold" : "text-slate-500"}>
                        {/[a-z]/.test(password) ? "✓" : "•"} အင်္ဂလိပ်စာလုံးသေး (a-z) ပါဝင်ရမည်
                      </li>
                      <li className={/[0-9]/.test(password) ? "text-emerald-500 font-semibold" : "text-slate-500"}>
                        {/[0-9]/.test(password) ? "✓" : "•"} ကိန်းဂဏန်း (0-9) ပါဝင်ရမည်
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-500 font-semibold" : "text-slate-500"}>
                        {/[^A-Za-z0-9]/.test(password) ? "✓" : "•"} အထူးသင်္ကေတ (!@#$%) ပါဝင်ရမည်
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">စကားဝှက် ပြန်ရိုက်ပါ (Confirm Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="စကားဝှက် တူညီစွာ ထပ်မံရိုက်ထည့်ပါ"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-1 select-none">
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="termsCheck" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer leading-tight text-left">
                  ကျွန်ုပ်သည် CLM ၏ <span className="text-blue-600 dark:text-blue-400 underline hover:text-blue-500">အသုံးပြုမှုစည်းကမ်းချက်များနှင့် သတ်မှတ်ချက်များ</span> ကို သဘောတူညီပါသည် ခင်ဗျာ။
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-75 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>အကောင့်ဖန်တီးနေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <span>အကောင့်အသစ်ဆောက်မည် (Create Account)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ==================== VIEW: FORGOT PASSWORD ==================== */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3 text-xs text-blue-600 dark:text-blue-400">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                စကားဝှက် ပြန်လည်ပြင်ဆင်ရန် လုံခြုံသော Link ကို သင့် Email လိပ်စာထံ ပို့ဆောင်ပေးမည် ဖြစ်ပါသည်။ ၎င်း Link အားနှိပ်၍ စကားဝှက်အသစ် ပြောင်းလဲသတ်မှတ်နိုင်ပါသည် ခင်ဗျာ။
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email လိပ်စာ</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || resetCooldown > 0}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:opacity-60 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>လုပ်ဆောင်နေပါသည်...</span>
                </>
              ) : resetCooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>စက္ကန့် {resetCooldown} အကြာမှ ထပ်မံတောင်းဆိုပါ</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>စကားဝှက်ပြန်လည်ရယူရန် Link ပို့မည်</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ==================== VIEW: EMAIL VERIFICATION ==================== */}
        {view === "verify" && (
          <div className="space-y-5 text-left">
            <div className="bg-yellow-500/5 border border-yellow-500/25 rounded-2xl p-4 flex gap-3 text-xs text-yellow-700 dark:text-yellow-400">
              <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5 text-yellow-500" />
              <div className="space-y-1">
                <p className="font-bold">အီးမေးလ် အတည်ပြုရန် လိုအပ်ပါသည် (Verify Email)</p>
                <p className="leading-relaxed">
                  သင့် Email အဖြစ် <strong>{currentUser?.email || email}</strong> ကို အသုံးပြုထားပါသည်။ အကောင့်အသက်သွင်းရန် ၎င်း Email ထဲရှိ Verification link ကို နှိပ်ပေးပါ။
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                အတည်ပြုပြီးပါက အောက်ပါ "အတည်ပြုချက်စစ်ဆေးမည်" ခလုတ်ကို နှိပ်ပေးပါရန်။
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleRefreshVerification}
                  disabled={isVerifying}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow transition-all cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>စစ်ဆေးနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>အတည်ပြုချက်စစ်ဆေးမည် (Refresh Status)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>အီးမေးလ် ထပ်မံပေးပို့ရန် (Resend Email)</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button 
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-400 font-bold hover:underline cursor-pointer"
              >
                အကောင့်မှ ပြန်ထွက်မည် (Logout)
              </button>
            </div>
          </div>
        )}

        {/* ==================== VIEW: SUSPENDED ==================== */}
        {view === "suspended" && (
          <div className="space-y-4 text-left">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-3 text-rose-400">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>အကောင့်အား ရပ်ဆိုင်းထားပါသည် (Suspended)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                သင့်အကောင့်သည် ပလက်ဖောင်း စည်းမျဉ်းစည်းကမ်းများ ဖောက်ဖျက်မှုကြောင့် ယာယီ သို့မဟုတ် အပြီးအပိုင် ရပ်ဆိုင်းခြင်း ခံထားရပါသည် ခင်ဗျာ။
              </p>
              <div className="bg-slate-900/60 border border-rose-500/30 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold">ရပ်ဆိုင်းရသည့် အကြောင်းအရင်း:</span>
                <p className="text-xs text-rose-300 font-medium">{suspensionReason}</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-2">
              <p className="font-bold text-white">အကူအညီ ရယူရန်:</p>
              <p className="leading-relaxed text-[11px]">
                မှားယွင်းစွာ ရပ်ဆိုင်းခြင်းဖြစ်သည်ဟု ယူဆပါက အုပ်ချုပ်သူထံ support@codelearnmm.com သို့မဟုတ် Help Desk မှတစ်ဆင့် အယူခံဝင်နိုင်ပါသည်။
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setView("login");
                setError("");
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              အကောင့်ဝင်ရန် စာမျက်နှာသို့ ပြန်သွားမည်
            </button>
          </div>
        )}

        {/* View Switches & Toggle links */}
        {view !== "verify" && view !== "suspended" && (
          <div className="text-center pt-2 text-xs border-t border-slate-100 dark:border-slate-850/60">
            {view === "login" && (
              <>
                <span className="text-slate-500 dark:text-slate-400">Code Learn Myanmar တွင် အကောင့်မရှိသေးဘူးလား? </span>
                <button
                  onClick={() => {
                    setView("register");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 ml-1 font-bold cursor-pointer underline"
                >
                  အခမဲ့အကောင့်သစ်ဆောက်မည်
                </button>
              </>
            )}
            {view === "register" && (
              <>
                <span className="text-slate-500 dark:text-slate-400">အကောင့်ရှိပြီးသား ဖြစ်ပါသလား? </span>
                <button
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 ml-1 font-bold cursor-pointer underline"
                >
                  အကောင့်ဝင်ရန်
                </button>
              </>
            )}
            {view === "forgot" && (
              <button
                onClick={() => {
                  setView("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold cursor-pointer underline"
              >
                အကောင့်ဝင်ရန် စာမျက်နှာသို့ ပြန်သွားမည်
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
