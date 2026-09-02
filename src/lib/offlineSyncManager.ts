/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Enterprise Offline Sync & Resilience Engine
 * Provides persistent queuing of student progress, quiz results, notes,
 * and forum actions during slow or offline network conditions.
 * Automatically synchronizes changes when connection returns without
 * interrupting the student's learning experience.
 */

import { performanceManager } from "./performanceManager";

export type QueuedActionType = 
  | "SAVE_USER_PROFILE"
  | "SAVE_QUIZ_ATTEMPT"
  | "SAVE_LESSON_PROGRESS"
  | "SAVE_PROJECT_SUBMISSION"
  | "SAVE_CERTIFICATE"
  | "SAVE_PERSONAL_NOTE"
  | "DELETE_PERSONAL_NOTE"
  | "SUBMIT_FORUM_POST"
  | "SUBMIT_FORUM_REPLY"
  | "LIKE_FORUM_POST"
  | "CLAIM_DAILY_REWARD"
  | "SAVE_SNIPPET";

export interface QueuedSyncItem {
  id: string;
  actionType: QueuedActionType;
  payload: any;
  createdAt: number;
  retryCount: number;
  lastError?: string;
  descriptionMm: string;
}

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  lastSyncSuccess: boolean;
  lastSyncError: string | null;
}

type SyncListener = (state: SyncStatusState) => void;

class OfflineSyncManager {
  private queueKey = "clm_offline_sync_queue_v1";
  private syncQueue: QueuedSyncItem[] = [];
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private maxRetries = 5;
  private syncHandlers: Map<QueuedActionType, (payload: any) => Promise<any>> = new Map();
  private lastSyncTime: number | null = null;
  private lastSyncSuccess = true;
  private lastSyncError: string | null = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.loadQueueFromStorage();
    this.setupNetworkListeners();
  }

  /**
   * Register executor for each action type (avoids circular dependency with db.ts)
   */
  public registerHandler(actionType: QueuedActionType, handler: (payload: any) => Promise<any>): void {
    this.syncHandlers.set(actionType, handler);
  }

  public getState(): SyncStatusState {
    const perfState = performanceManager.getState();
    return {
      isOnline: perfState.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      lastSyncSuccess: this.lastSyncSuccess,
      lastSyncError: this.lastSyncError,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error("OfflineSyncManager listener error:", err);
      }
    });

    // Also dispatch a browser CustomEvent for global component hooks
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clm_sync_state_changed", { detail: state }));
    }
  }

  /**
   * Enqueue a mutation for background sync
   */
  public enqueue(actionType: QueuedActionType, payload: any, descriptionMm?: string): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Deduplicate certain actions (e.g. repeated user profile updates)
    if (actionType === "SAVE_USER_PROFILE" && payload?.uid) {
      this.syncQueue = this.syncQueue.filter(
        item => !(item.actionType === "SAVE_USER_PROFILE" && item.payload?.uid === payload.uid)
      );
    } else if (actionType === "LIKE_FORUM_POST" && payload?.postId && payload?.uid) {
      this.syncQueue = this.syncQueue.filter(
        item => !(item.actionType === "LIKE_FORUM_POST" && item.payload?.postId === payload.postId && item.payload?.uid === payload.uid)
      );
    }

    const defaultDescriptions: Record<QueuedActionType, string> = {
      SAVE_USER_PROFILE: "ကျောင်းသား အချက်အလက်နှင့် သင်ယူမှုတိုးတက်မှု",
      SAVE_QUIZ_ATTEMPT: "ဉာဏ်စမ်းဖြေဆိုမှု ရမှတ်မှတ်တမ်း",
      SAVE_LESSON_PROGRESS: "သင်ခန်းစာ ပြီးဆုံးမှုနှင့် XP ရမှတ်",
      SAVE_PROJECT_SUBMISSION: "ပရောဂျက် တင်သွင်းမှု မှတ်တမ်း",
      SAVE_CERTIFICATE: "အောင်မြင်မှုလက်မှတ် သိမ်းဆည်းမှု",
      SAVE_PERSONAL_NOTE: "ကိုယ်ပိုင် မှတ်စုနှင့် စာညှပ်များ",
      DELETE_PERSONAL_NOTE: "မှတ်စု ဖျက်သိမ်းမှု",
      SUBMIT_FORUM_POST: "ဖိုရမ် ဆွေးနွေးချက်အသစ်",
      SUBMIT_FORUM_REPLY: "ဖိုရမ် အမေး/အဖြေ တုံ့ပြန်ချက်",
      LIKE_FORUM_POST: "ဆွေးနွေးချက် ထောက်ခံမဲ",
      CLAIM_DAILY_REWARD: "နေ့စဉ် ရက်ဆက်လေ့လာမှု ဆုလာဘ်",
      SAVE_SNIPPET: "ကုဒ် အတိုအထွာ သိမ်းဆည်းမှု"
    };

    const newItem: QueuedSyncItem = {
      id,
      actionType,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      descriptionMm: descriptionMm || defaultDescriptions[actionType] || "သိမ်းဆည်းထားသော အချက်အလက်များ"
    };

    this.syncQueue.push(newItem);
    this.persistQueue();
    this.notify();

    console.info(`[OfflineSyncManager] Enqueued "${actionType}" (Queue size: ${this.syncQueue.length})`);

    // If we are online, attempt immediate sync in background
    if (performanceManager.getState().isOnline && !this.isSyncing) {
      this.triggerSync();
    }

    return id;
  }

  /**
   * Process and synchronize all queued items
   */
  public async triggerSync(): Promise<{ success: boolean; syncedCount: number; remainingCount: number }> {
    if (this.isSyncing) {
      return { success: true, syncedCount: 0, remainingCount: this.syncQueue.length };
    }

    if (this.syncQueue.length === 0) {
      this.notify();
      return { success: true, syncedCount: 0, remainingCount: 0 };
    }

    if (!performanceManager.getState().isOnline) {
      console.info("[OfflineSyncManager] Skipping sync: Device is currently offline.");
      return { success: false, syncedCount: 0, remainingCount: this.syncQueue.length };
    }

    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    const remainingItems: QueuedSyncItem[] = [];

    console.info(`[OfflineSyncManager] Starting sync of ${this.syncQueue.length} items...`);

    for (const item of this.syncQueue) {
      const handler = this.syncHandlers.get(item.actionType);
      if (!handler) {
        console.warn(`[OfflineSyncManager] No handler registered for ${item.actionType}. Keeping item.`);
        remainingItems.push(item);
        continue;
      }

      try {
        await handler(item.payload);
        syncedCount++;
        console.info(`[OfflineSyncManager] Successfully synced item ${item.id} (${item.actionType})`);
      } catch (err: any) {
        console.warn(`[OfflineSyncManager] Failed to sync ${item.id} (${item.actionType}):`, err?.message || err);
        item.retryCount += 1;
        item.lastError = err?.message || String(err);

        if (item.retryCount < this.maxRetries) {
          remainingItems.push(item);
        } else {
          console.error(`[OfflineSyncManager] Item ${item.id} exceeded max retries (${this.maxRetries}). Discarding.`);
        }
      }
    }

    this.syncQueue = remainingItems;
    this.persistQueue();
    this.isSyncing = false;
    this.lastSyncTime = Date.now();
    this.lastSyncSuccess = remainingItems.length === 0;
    this.lastSyncError = remainingItems.length > 0 ? `${remainingItems.length} items waiting for stable network` : null;

    this.notify();

    if (syncedCount > 0 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("clm_sync_completed", {
          detail: {
            syncedCount,
            remainingCount: remainingItems.length,
            timestamp: this.lastSyncTime
          }
        })
      );
    }

    return {
      success: remainingItems.length === 0,
      syncedCount,
      remainingCount: remainingItems.length
    };
  }

  /**
   * Clear sync queue manually if requested
   */
  public clearQueue(): void {
    this.syncQueue = [];
    this.persistQueue();
    this.notify();
  }

  /**
   * Get all currently queued items
   */
  public getQueue(): QueuedSyncItem[] {
    return [...this.syncQueue];
  }

  private loadQueueFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.queueKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.syncQueue = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read offline sync queue from localStorage:", e);
      this.syncQueue = [];
    }
  }

  private persistQueue(): void {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(this.syncQueue));
    } catch (e) {
      console.error("Could not write offline sync queue to localStorage:", e);
    }
  }

  private setupNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      console.info("[OfflineSyncManager] Network restored to ONLINE. Triggering sync in 1.5s...");
      setTimeout(() => {
        this.triggerSync();
      }, 1500);
    });

    // Subscribe to performanceManager network state
    performanceManager.subscribe((state) => {
      if (state.isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
        this.triggerSync();
      }
    });

    // Periodic sync attempt every 45 seconds if queue has items and device is online
    this.heartbeatInterval = setInterval(() => {
      if (performanceManager.getState().isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
        this.triggerSync();
      }
    }, 45000);
  }
}

export const offlineSyncManager = new OfflineSyncManager();
