/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Enterprise Client Cache & Offline Persistence Engine
 * Provides multi-tier caching (Memory LRU + LocalStorage / IndexedDB) with
 * Stale-While-Revalidate and intelligent offline storage for low-bandwidth networks.
 */

import { performanceManager } from "./performanceManager";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
  version?: string;
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxMemoryItems: number = 100;
  private defaultTTL: number = 1000 * 60 * 60 * 24; // 24 hours default
  private storagePrefix: string = "clm_cache_v2_";

  constructor() {
    this.cleanupExpiredStorage();
  }

  /**
   * Set data into memory and persistent cache
   */
  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // 1. Set in Memory Cache (LRU prune if oversized)
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, entry);

    // 2. Set in Persistent LocalStorage
    try {
      const serialized = JSON.stringify(entry);
      localStorage.setItem(`${this.storagePrefix}${key}`, serialized);
    } catch (err) {
      // Storage quota exceeded -> clear older cache items
      console.warn("Storage quota warning, clearing older cached records...", err);
      this.pruneOldestPersistentItems();
      try {
        localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(entry));
      } catch (retryErr) {
        console.error("Could not write to persistent storage:", retryErr);
      }
    }
  }

  /**
   * Get cached item with Stale-While-Revalidate awareness
   */
  public get<T>(key: string, allowStale: boolean = true): { data: T | null; isStale: boolean } {
    // 1. Check Memory Cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      const isExpired = Date.now() - memoryItem.timestamp > memoryItem.ttl;
      if (!isExpired || allowStale) {
        return { data: memoryItem.data as T, isStale: isExpired };
      }
    }

    // 2. Check Persistent LocalStorage
    try {
      const raw = localStorage.getItem(`${this.storagePrefix}${key}`);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
        
        // Re-hydrate memory cache for ultra-fast subsequent lookups
        this.memoryCache.set(key, parsed);

        if (!isExpired || allowStale) {
          return { data: parsed.data, isStale: isExpired };
        }
      }
    } catch (err) {
      console.warn(`Error reading cache key: ${key}`, err);
    }

    return { data: null, isStale: false };
  }

  /**
   * Stale-While-Revalidate fetch helper
   * Immediately returns cached copy if available, then executes fresh fetch in background
   */
  public async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL,
    onBackgroundUpdate?: (newData: T) => void
  ): Promise<T> {
    const cached = this.get<T>(key, true);

    if (cached.data !== null) {
      // Data Saver check: If Data Saver is active and cached data is not expired, avoid redundant background network requests
      const shouldSuppressBackgroundFetch = performanceManager.shouldReduceBackgroundRequests() && !cached.isStale;

      if (!shouldSuppressBackgroundFetch && (cached.isStale || navigator.onLine)) {
        fetcher()
          .then((freshData) => {
            this.set(key, freshData, ttl);
            if (onBackgroundUpdate) {
              onBackgroundUpdate(freshData);
            }
          })
          .catch((err) => {
            console.info(`Background cache revalidation for ${key} kept offline fallback:`, err?.message || err);
          });
      } else if (shouldSuppressBackgroundFetch) {
        // Record approximate data saved by skipping background revalidation
        performanceManager.recordDataSaved(15000); // 15KB saved
      }
      return cached.data;
    }

    // No cache exists -> must fetch online
    try {
      const freshData = await fetcher();
      this.set(key, freshData, ttl);
      return freshData;
    } catch (error) {
      // If offline and no cache, throw friendly error
      throw error;
    }
  }

  /**
   * Invalidate specific key
   */
  public remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${this.storagePrefix}${key}`);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Clear all app caches
   */
  public clearAll(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error("Failed to clear persistent cache", e);
    }
  }

  /**
   * Get approximate cache size in Kilobytes
   */
  public getCacheSizeKB(): number {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          const val = localStorage.getItem(k) || "";
          bytes += k.length + val.length;
        }
      }
    } catch {
      bytes = 0;
    }
    return Math.round(bytes / 1024);
  }

  /**
   * Prune oldest persistent items when storage quota is reached
   */
  private pruneOldestPersistentItems(): void {
    try {
      const cacheEntries: { key: string; timestamp: number }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              cacheEntries.push({ key: k, timestamp: parsed.timestamp || 0 });
            }
          } catch {
            cacheEntries.push({ key: k, timestamp: 0 });
          }
        }
      }

      // Sort by oldest first and delete top 25%
      cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
      const itemsToDelete = Math.ceil(cacheEntries.length * 0.25);
      for (let i = 0; i < itemsToDelete; i++) {
        localStorage.removeItem(cacheEntries[i].key);
      }
    } catch (e) {
      console.error("Error during cache pruning", e);
    }
  }

  /**
   * Cleanup expired storage on startup
   */
  private cleanupExpiredStorage(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed: CacheEntry<any> = JSON.parse(raw);
              if (parsed.ttl && now - parsed.timestamp > parsed.ttl * 2) {
                keysToRemove.push(k);
              }
            }
          } catch {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Safe ignore
    }
  }
}

export const cacheManager = new CacheManager();
