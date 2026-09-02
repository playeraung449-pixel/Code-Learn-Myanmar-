/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Beginner-Friendly Error Translation Engine
 * Translates technical error codes (500, 404, 403, Network Errors, Chunk Load Errors, 
 * TypeErrors, Firebase Auth Errors) into clear, friendly, and actionable explanations 
 * in simple Myanmar language + clean English terminology.
 */

export interface FriendlyErrorDetails {
  title: string;
  titleMm: string;
  explanationMm: string;
  actionMm: string;
  category: "network" | "server" | "auth" | "not_found" | "permission" | "validation" | "timeout" | "general";
  statusCode?: number | string;
  rawMessage?: string;
  canRetry: boolean;
  suggestedActionLabel?: string;
  suggestedActionLabelMm?: string;
}

export function getFriendlyErrorMessage(error: any): FriendlyErrorDetails {
  if (!error) {
    return {
      title: "Something went slightly off",
      titleMm: "စနစ်တွင် အနည်းငယ် ချို့ယွင်းချက်ရှိခဲ့ပါသည်",
      explanationMm: "ခေတ္တစောင့်ဆိုင်းပြီး ပြန်လည်ကြိုးစားကြည့်ပါရန်။ သင်၏ သင်ယူမှုမှတ်တမ်းများ ဆုံးရှုံးသွားခြင်းမရှိပါ။",
      actionMm: "'ပြန်လည်ကြိုးစားမည်' ခလုတ်ကို နှိပ်၍ ဆက်လက်လုပ်ဆောင်နိုင်ပါသည်။",
      category: "general",
      canRetry: true,
      suggestedActionLabel: "Retry",
      suggestedActionLabelMm: "ပြန်လည်ကြိုးစားမည်"
    };
  }

  const raw = typeof error === "string" ? error : error?.message || error?.statusText || JSON.stringify(error);
  const status = error?.status || error?.statusCode || error?.code;

  // 1. 500 & Internal Server Error
  if (
    status === 500 || 
    status === "500" ||
    raw.includes("500") || 
    raw.toLowerCase().includes("internal server error")
  ) {
    return {
      title: "Server is Temporarily Busy",
      titleMm: "ဆာဗာ ယာယီအလုပ်များနေပါသည်",
      explanationMm: "ကျွန်ုပ်တို့၏ သင်ကြားရေး ဆာဗာသည် လက်ရှိတွင် အလုပ်များနေပါသည် သို့မဟုတ် ယာယီအဆင့်မြှင့်တင်နေပါသည်။ သင်၏ အကောင့်နှင့် သင်ခန်းစာမှတ်တမ်းများ လုံခြုံစွာ ရှိနေပါသည်။",
      actionMm: "ခေတ္တမျှ စက္ကန့်အနည်းငယ် စောင့်ဆိုင်းပြီးနောက် 'ပြန်လည်ကြိုးစားမည်' ကို နှိပ်ပေးပါ။",
      category: "server",
      statusCode: 500,
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Retry Server",
      suggestedActionLabelMm: "ပြန်လည်ကြိုးစားမည်"
    };
  }

  // 2. 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout
  if (
    status === 502 || status === 503 || status === 504 ||
    raw.includes("502") || raw.includes("503") || raw.includes("504") ||
    raw.toLowerCase().includes("bad gateway") || raw.toLowerCase().includes("service unavailable")
  ) {
    return {
      title: "Service Maintenance in Progress",
      titleMm: "စနစ်ကို ယာယီထိန်းသိမ်းပြုပြင်နေပါသည်",
      explanationMm: "ဝန်ဆောင်မှုများကို ပိုမိုကောင်းမွန်စေရန် ခေတ္တမွမ်းမံနေခြင်း ဖြစ်နိုင်ပါသည်။ မကြာမီ ပုံမှန်အတိုင်း ပြန်လည်အသုံးပြုနိုင်ပါမည်။",
      actionMm: "မိနစ်အနည်းငယ်အတွင်း ပြန်လည်ကြိုးစားကြည့်ပါရန်။",
      category: "server",
      statusCode: status || 503,
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Check Again",
      suggestedActionLabelMm: "ပြန်လည်စစ်ဆေးမည်"
    };
  }

  // 3. 404 Not Found
  if (
    status === 404 || 
    status === "404" || 
    raw.includes("404") || 
    raw.toLowerCase().includes("not found")
  ) {
    return {
      title: "Content Not Found",
      titleMm: "ရှာဖွေနေသော သင်ခန်းစာ သို့မဟုတ် စာမျက်နှာ မတွေ့ရှိပါ",
      explanationMm: "သင်ရှာဖွေနေသော သင်ခန်းစာ သို့မဟုတ် လင့်ခ်သည် အသစ်ပြောင်းလဲထားခြင်း သို့မဟုတ် ဖယ်ရှားထားခြင်း ဖြစ်နိုင်ပါသည်။",
      actionMm: "ပင်မစာမျက်နှာသို့ သွားရောက်၍ သင်တန်းစာရင်းမှ ပြန်လည်ရွေးချယ်နိုင်ပါသည်။",
      category: "not_found",
      statusCode: 404,
      rawMessage: raw,
      canRetry: false,
      suggestedActionLabel: "Back to Home",
      suggestedActionLabelMm: "ပင်မစာမျက်နှာသို့"
    };
  }

  // 4. 401 & 403 Authentication / Permission Denied
  if (
    status === 401 || status === 403 ||
    raw.includes("401") || raw.includes("403") ||
    raw.toLowerCase().includes("unauthorized") ||
    raw.toLowerCase().includes("permission-denied") ||
    raw.toLowerCase().includes("forbidden")
  ) {
    return {
      title: "Sign In Required",
      titleMm: "အကောင့်ဝင်ရောက်ရန် လိုအပ်ပါသည်",
      explanationMm: "ဤသင်ခန်းစာ သို့မဟုတ် အပိုင်းကို ဝင်ရောက်ကြည့်ရှုရန် အကောင့်ဝင်ရန် လိုအပ်ပါသည် သို့မဟုတ် ခွင့်ပြုချက်မရှိသေးပါ။",
      actionMm: "သင့် Google သို့မဟုတ် အီးမေးလ်ဖြင့် အကောင့်ဝင်ပြီး ပြန်လည်ကြိုးစားပါ။",
      category: "auth",
      statusCode: status || 401,
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Sign In",
      suggestedActionLabelMm: "အကောင့်ဝင်မည်"
    };
  }

  // 5. Network / Offline / Fetch Failure / Chunk Load Error
  if (
    raw.toLowerCase().includes("failed to fetch") ||
    raw.toLowerCase().includes("networkerror") ||
    raw.toLowerCase().includes("net::err") ||
    raw.toLowerCase().includes("loading chunk") ||
    raw.toLowerCase().includes("dynamically imported module") ||
    raw.toLowerCase().includes("offline")
  ) {
    return {
      title: "Internet Connection Weak",
      titleMm: "အင်တာနက် ချိတ်ဆက်မှု အားနည်းနေပါသည်",
      explanationMm: "သင်၏ အင်တာနက်လိုင်း ခေတ္တနှေးနေခြင်း သို့မဟုတ် ပြတ်တောက်သွားခြင်း ဖြစ်နိုင်ပါသည်။ အချက်အလက်များ မပျောက်ပျက်စေရန် အလိုအလျောက် ထိန်းသိမ်းထားပေးပါသည်။",
      actionMm: "Wi-Fi သို့မဟုတ် မိုဘိုင်းဒေတာကို စစ်ဆေးပြီး 'ပြန်လည်ကြိုးစားမည်' ကို နှိပ်ပါ။",
      category: "network",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Retry Connection",
      suggestedActionLabelMm: "ပြန်လည်ချိတ်ဆက်မည်"
    };
  }

  // 6. Firebase Auth Specific Errors
  if (raw.includes("auth/user-not-found") || raw.includes("auth/wrong-password") || raw.includes("auth/invalid-credential")) {
    return {
      title: "Incorrect Login Details",
      titleMm: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်",
      explanationMm: "ရိုက်ထည့်ထားသော အီးမေးလ်နှင့် စကားဝှက်ကို သေချာစွာ စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပေးပါ။",
      actionMm: "စကားဝှက်ကို သေချာစစ်ဆေးပြီး ပြန်လည်ရိုက်ထည့်ပါရန်။",
      category: "auth",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Try Again",
      suggestedActionLabelMm: "ပြန်လည်ကြိုးစားမည်"
    };
  }

  if (raw.includes("auth/email-already-in-use")) {
    return {
      title: "Email Already Registered",
      titleMm: "ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးဖြစ်ပါသည်",
      explanationMm: "အဆိုပါ အီးမေးလ်ဖြင့် အကောင့်ရှိပြီးဖြစ်သဖြင့် Sign In ဖြင့် တိုက်ရိုက်ဝင်ရောက်နိုင်ပါသည်။",
      actionMm: "Sign In tab သို့ ပြောင်းလဲ၍ ဝင်ရောက်ပေးပါ။",
      category: "auth",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Go to Sign In",
      suggestedActionLabelMm: "အကောင့်ဝင်ရန်သို့"
    };
  }

  if (raw.includes("auth/popup-closed-by-user") || raw.includes("auth/cancelled-popup-request")) {
    return {
      title: "Sign In Cancelled",
      titleMm: "အကောင့်ဝင်ခြင်းကို ရပ်တန့်ခဲ့ပါသည်",
      explanationMm: "Google Login popup ဝင်းဒိုးကို ပိတ်လိုက်သောကြောင့် အကောင့်ဝင်ခြင်း မပြီးဆုံးခဲ့ပါ။",
      actionMm: "အကောင့်ဝင်ရန် လိုအပ်ပါက ထပ်မံနှိပ်၍ ဝင်ရောက်နိုင်ပါသည်။",
      category: "auth",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Sign In Again",
      suggestedActionLabelMm: "ထပ်မံအကောင့်ဝင်မည်"
    };
  }

  // 7. Timeout Error
  if (raw.toLowerCase().includes("timeout") || raw.toLowerCase().includes("timed out")) {
    return {
      title: "Request Timed Out",
      titleMm: "တုံ့ပြန်ချိန် ကြာမြင့်နေပါသည်",
      explanationMm: "ဆာဗာမှ အချက်အလက်များ ပေးပို့ရန် အချိန်ကြာမြင့်နေပါသည်။ အင်တာနက်လိုင်းနှေးနေခြင်းကြောင့် ဖြစ်နိုင်ပါသည်။",
      actionMm: "'ပြန်လည်ကြိုးစားမည်' ကို နှိပ်၍ ထပ်မံလုပ်ဆောင်နိုင်ပါသည်။",
      category: "timeout",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Retry Now",
      suggestedActionLabelMm: "ပြန်လည်ကြိုးစားမည်"
    };
  }

  // 8. Quota / Rate Limit
  if (raw.toLowerCase().includes("quota") || raw.toLowerCase().includes("rate limit") || raw.includes("429")) {
    return {
      title: "Usage Limit Reached",
      titleMm: "ခေတ္တ အနားပေးပါရန် (Usage Limit)",
      explanationMm: "တောင်းဆိုမှု အကြိမ်ရေ များပြားနေသောကြောင့် ဆာဗာမှ ခေတ္တအနားယူရန် သတ်မှတ်ထားပါသည်။",
      actionMm: "စက္ကန့် ၃၀ ခန့် စောင့်ဆိုင်းပြီးနောက် ပြန်လည်ကြိုးစားနိုင်ပါသည်။",
      category: "validation",
      rawMessage: raw,
      canRetry: true,
      suggestedActionLabel: "Try in a moment",
      suggestedActionLabelMm: "ခေတ္တစောင့်ပြီး ကြိုးစားမည်"
    };
  }

  // Default fallback with empathetic, non-technical explanation
  return {
    title: "Notice: Temporary Issue",
    titleMm: "အသိပေးချက်: ယာယီချို့ယွင်းချက်",
    explanationMm: "လုပ်ဆောင်ချက် မအောင်မြင်သေးပါ။ သင်၏ ဒေတာများ ဆုံးရှုံးသွားခြင်းမရှိဘဲ စနစ်မှ လုံခြုံစွာ ထိန်းသိမ်းထားပေးပါသည်။",
    actionMm: "'ပြန်လည်ကြိုးစားမည်' ခလုတ်ကို နှိပ်ပေးပါ သို့မဟုတ် ပင်မစာမျက်နှာသို့ ပြန်သွားပါ။",
    category: "general",
    rawMessage: raw,
    canRetry: true,
    suggestedActionLabel: "Retry",
    suggestedActionLabelMm: "ပြန်လည်ကြိုးစားမည်"
  };
}
