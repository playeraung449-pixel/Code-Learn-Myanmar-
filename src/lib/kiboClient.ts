/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Kibo AI Client Optimizer
 * Handles:
 * 1. Client-Side Semantic & Hash Caching (Avoid repeating identical questions)
 * 2. In-Flight Duplicate Request Deduplication (Prevent double clicks / fast repeats)
 * 3. Context Window Reduction & Payload Trimming (Save mobile bandwidth & tokens)
 * 4. Response Length & Verbosity Controls
 * 5. Free vs Premium Tier Usage Allowance & Throttling Enforcement
 */

import { UserProfile, Course, Lesson } from "../types";
import { continuousPerfEngine } from "./continuousPerformanceMonitoring";

export interface KiboChatRequestOptions {
  messages: { role: "user" | "assistant"; content: string }[];
  currentCourse?: Course | null;
  currentLesson?: Lesson | null;
  userProfile?: UserProfile | null;
  stream?: boolean;
  maxResponseLength?: "concise" | "balanced" | "detailed";
  signal?: AbortSignal;
}

export interface KiboTierUsageStatus {
  isPremium: boolean;
  tierName: string;
  dailyChatCount: number;
  dailyChatLimit: number;
  remainingChats: number;
  dailyCodeReviewsCount: number;
  dailyCodeReviewsLimit: number;
  remainingCodeReviews: number;
  dailyDebugsCount: number;
  dailyDebugsLimit: number;
  remainingDebugs: number;
  dailyHintsCount: number;
  dailyHintsLimit: number;
  remainingHints: number;
  canAskChat: boolean;
  canAskCodeReview: boolean;
  canAskDebug: boolean;
  canAskHint: boolean;
  cooldownSeconds: number;
}

// In-flight active promise registry for deduplication
const inFlightRequests = new Map<string, Promise<any>>();

// Client-side LRU Cache for Kibo responses
interface CachedKiboResponse {
  timestamp: number;
  text: string;
  isCached: boolean;
}
const kiboResponseCache = new Map<string, CachedKiboResponse>();
const MAX_CACHE_SIZE = 150;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours client cache for static/explanation questions

/**
 * Normalizes and hashes strings for deterministic cache keys
 */
export function generateKiboCacheKey(
  feature: string,
  input: string,
  courseId?: string,
  lessonId?: string,
  tier: string = "free"
): string {
  const cleanInput = input.trim().toLowerCase().replace(/\s+/g, " ");
  return `kibo_cache_${feature}_${courseId || "none"}_${lessonId || "none"}_${tier}_${cleanInput.slice(0, 160)}`;
}

/**
 * Get cached response if available and not expired
 */
export function getCachedKiboResponse(cacheKey: string): string | null {
  const hit = kiboResponseCache.get(cacheKey);
  if (!hit) return null;

  if (Date.now() - hit.timestamp > CACHE_TTL_MS) {
    kiboResponseCache.delete(cacheKey);
    return null;
  }
  return hit.text;
}

/**
 * Store response in client LRU cache
 */
export function setCachedKiboResponse(cacheKey: string, text: string): void {
  if (!text || text.length < 5) return;

  if (kiboResponseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = kiboResponseCache.keys().next().value;
    if (oldestKey) kiboResponseCache.delete(oldestKey);
  }

  kiboResponseCache.set(cacheKey, {
    timestamp: Date.now(),
    text,
    isCached: true
  });
}

/**
 * Calculate client-side tier usage allowance
 */
export function getClientTierUsage(user?: UserProfile | null): KiboTierUsageStatus {
  const isPremium = user?.role === "premium" || user?.role === "teacher" || user?.role === "admin" || (user as any)?.isPremium === true;
  const today = new Date().toISOString().split("T")[0];

  // Retrieve today's counts from localStorage
  const chatCount = parseInt(localStorage.getItem(`clm_kibo_chat_count_${today}`) || "0", 10);
  const reviewCount = parseInt(localStorage.getItem(`clm_kibo_review_count_${today}`) || "0", 10);
  const debugCount = parseInt(localStorage.getItem(`clm_kibo_debug_count_${today}`) || "0", 10);
  const hintCount = parseInt(localStorage.getItem(`clm_kibo_hint_count_${today}`) || "0", 10);

  const limits = isPremium 
    ? { chats: 300, reviews: 50, debugs: 50, hints: 100 }
    : { chats: 15, reviews: 3, debugs: 5, hints: 10 };

  return {
    isPremium,
    tierName: isPremium ? "Kibo VIP Premium" : "Free Learning Plan",
    dailyChatCount: chatCount,
    dailyChatLimit: limits.chats,
    remainingChats: Math.max(0, limits.chats - chatCount),
    dailyCodeReviewsCount: reviewCount,
    dailyCodeReviewsLimit: limits.reviews,
    remainingCodeReviews: Math.max(0, limits.reviews - reviewCount),
    dailyDebugsCount: debugCount,
    dailyDebugsLimit: limits.debugs,
    remainingDebugs: Math.max(0, limits.debugs - debugCount),
    dailyHintsCount: hintCount,
    dailyHintsLimit: limits.hints,
    remainingHints: Math.max(0, limits.hints - hintCount),
    canAskChat: chatCount < limits.chats,
    canAskCodeReview: reviewCount < limits.reviews,
    canAskDebug: debugCount < limits.debugs,
    canAskHint: hintCount < limits.hints,
    cooldownSeconds: isPremium ? 1 : 2
  };
}

/**
 * Increment local usage count
 */
export function recordClientTierUsage(feature: "chat" | "review" | "debug" | "hint") {
  const today = new Date().toISOString().split("T")[0];
  const key = `clm_kibo_${feature}_count_${today}`;
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, (current + 1).toString());
}

/**
 * Context Window Reduction:
 * Prunes long conversation history to only the relevant recent context
 * (Free tier gets 4 recent messages, Premium gets 8 recent messages)
 * to save payload size and mobile data without losing semantic continuity.
 */
export function reduceContextMessages(
  messages: { role: "user" | "assistant"; content: string }[],
  isPremium: boolean
): { role: "user" | "assistant"; content: string }[] {
  if (!messages || messages.length === 0) return [];

  const maxHistory = isPremium ? 8 : 4;
  if (messages.length <= maxHistory) {
    return messages.map(m => ({
      role: m.role,
      content: m.content.trim().slice(0, isPremium ? 6000 : 2500)
    }));
  }

  // Always keep first welcome/context if informative, and the trailing N messages
  const trailing = messages.slice(-maxHistory);
  return trailing.map(m => ({
    role: m.role,
    content: m.content.trim().slice(0, isPremium ? 6000 : 2500)
  }));
}

/**
 * Slim Down Course & Lesson Context (Reduce unnecessary verbose objects in payload)
 */
export function reduceLessonContext(course?: Course | null, lesson?: Lesson | null) {
  if (!course || !lesson) return { course: null, lesson: null };

  return {
    course: {
      id: course.id,
      title: course.title,
      category: course.category,
      difficulty: course.difficulty
    },
    lesson: {
      id: lesson.id,
      title: lesson.title,
      whatIsIt: lesson.whatIsIt || lesson.title,
      syntax: lesson.syntax || ""
    }
  };
}

/**
 * Optimized Non-Streaming Fetch with Deduplication and Caching
 */
export async function fetchKiboOptimized(
  endpoint: string,
  payload: any,
  feature: "chat" | "review" | "debug" | "hint" | "quiz" = "chat"
): Promise<{ data: any; fromCache: boolean }> {
  const cacheKey = generateKiboCacheKey(
    feature,
    JSON.stringify(payload),
    payload.currentCourse?.id,
    payload.currentLesson?.id,
    payload.userProfile?.isPremium ? "premium" : "free"
  );

  // 1. Check client cache
  const cached = getCachedKiboResponse(cacheKey);
  if (cached) {
    continuousPerfEngine.recordKiboMetric({
      feature: feature as any,
      totalDurationMs: 4,
      streamMode: "cached",
      promptLength: JSON.stringify(payload).length,
      responseLength: cached.length,
      status: "success"
    });
    try {
      const parsed = JSON.parse(cached);
      return { data: parsed, fromCache: true };
    } catch {
      return { data: { text: cached }, fromCache: true };
    }
  }

  // 2. Check in-flight duplicate request
  if (inFlightRequests.has(cacheKey)) {
    const existingPromise = inFlightRequests.get(cacheKey)!;
    const result = await existingPromise;
    return { data: result, fromCache: false };
  }

  // 3. Execute fetch
  const startTime = performance.now();
  const requestPromise = (async () => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      continuousPerfEngine.recordKiboMetric({
        feature: feature as any,
        totalDurationMs: elapsed,
        streamMode: "non_streaming",
        status: "error",
        error: errJson.error || "Request failed"
      });
      throw new Error(errJson.myanmar || errJson.error || "AI service request failed");
    }

    const data = await res.json();
    continuousPerfEngine.recordKiboMetric({
      feature: feature as any,
      totalDurationMs: elapsed,
      tokensPerSec: Math.round(((data.text?.length || 500) / Math.max(1, elapsed)) * 1000),
      streamMode: "non_streaming",
      promptLength: JSON.stringify(payload).length,
      responseLength: (data.text || JSON.stringify(data)).length,
      status: "success"
    });
    // Cache successful responses
    setCachedKiboResponse(cacheKey, JSON.stringify(data));
    return data;
  })();

  inFlightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return { data: result, fromCache: false };
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}
