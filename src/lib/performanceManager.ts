/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Device & Network Performance Optimization Engine
 * Adapts UI animations, image quality, and bandwidth usage for low-end mobile
 * devices, metered 2G/3G connections, and offline environments.
 */

import { DataSaverConfig } from "../types";

export interface NetworkPerformanceState {
  isOnline: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  downlinkMbps?: number;
  rttMs?: number;
  saveDataEnabled: boolean;
  isLowBandwidth: boolean;
  isLowEndDevice: boolean;
  liteMode: boolean; // Backward compatibility alias for dataSaver
  dataSaver: DataSaverConfig;
  estimatedBytesSaved: number; // Approximate bytes saved in session
}

export const DEFAULT_DATA_SAVER_CONFIG: DataSaverConfig = {
  enabled: false,
  reduceImageQuality: true,
  reduceAnimations: true,
  disablePreloading: true,
  loadContentOnDemand: true,
  reduceBackgroundRequests: true,
  avoidUnnecessaryRefreshes: true
};

type Listener = (state: NetworkPerformanceState) => void;

class PerformanceManager {
  private listeners: Set<Listener> = new Set();
  private storageKey = "clm_data_saver_preference";
  private legacyStorageKey = "clm_lite_mode_preference";
  private bytesSavedKey = "clm_data_saver_bytes_saved";

  private state: NetworkPerformanceState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    effectiveType: "unknown",
    downlinkMbps: undefined,
    rttMs: undefined,
    saveDataEnabled: false,
    isLowBandwidth: false,
    isLowEndDevice: false,
    liteMode: false,
    dataSaver: { ...DEFAULT_DATA_SAVER_CONFIG },
    estimatedBytesSaved: 0
  };

  constructor() {
    if (typeof window === "undefined") return;

    this.detectHardware();
    this.detectNetwork();
    this.loadUserPreference();
    this.applyDomEffects();
    this.setupListeners();
  }

  public getState(): NetworkPerformanceState {
    return { 
      ...this.state,
      dataSaver: { ...this.state.dataSaver }
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Set master toggle for Data Saver Mode
   */
  public setDataSaver(enabled: boolean, partialConfig?: Partial<DataSaverConfig>): void {
    this.state.dataSaver.enabled = enabled;
    if (partialConfig) {
      this.state.dataSaver = {
        ...this.state.dataSaver,
        ...partialConfig,
        enabled
      };
    }
    this.state.liteMode = enabled;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state.dataSaver));
      localStorage.setItem(this.legacyStorageKey, JSON.stringify(enabled));
    } catch {
      // safe ignore
    }

    this.applyDomEffects();
    this.notify();
  }

  public toggleDataSaver(): boolean {
    const next = !this.state.dataSaver.enabled;
    this.setDataSaver(next);
    return next;
  }

  // Backward compatibility alias for setLiteMode
  public setLiteMode(enabled: boolean): void {
    this.setDataSaver(enabled);
  }

  // Backward compatibility alias for toggleLiteMode
  public toggleLiteMode(): boolean {
    return this.toggleDataSaver();
  }

  /**
   * Update granular Data Saver preferences
   */
  public updateDataSaverConfig(config: Partial<DataSaverConfig>): void {
    this.state.dataSaver = {
      ...this.state.dataSaver,
      ...config
    };
    this.state.liteMode = this.state.dataSaver.enabled;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state.dataSaver));
    } catch {
      // safe ignore
    }

    this.applyDomEffects();
    this.notify();
  }

  /**
   * Quick check helpers
   */
  public isDataSaverActive(): boolean {
    return this.state.dataSaver.enabled;
  }

  public shouldReduceImages(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.reduceImageQuality;
  }

  public shouldReduceAnimations(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.reduceAnimations;
  }

  public shouldDisablePreloading(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.disablePreloading;
  }

  public shouldLoadOnDemand(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.loadContentOnDemand;
  }

  public shouldReduceBackgroundRequests(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.reduceBackgroundRequests;
  }

  public shouldAvoidRefreshes(): boolean {
    return this.state.dataSaver.enabled && this.state.dataSaver.avoidUnnecessaryRefreshes;
  }

  /**
   * Record estimated data saved by avoiding heavy assets
   */
  public recordDataSaved(estimatedBytes: number): void {
    this.state.estimatedBytesSaved += estimatedBytes;
    try {
      localStorage.setItem(this.bytesSavedKey, String(this.state.estimatedBytesSaved));
    } catch {
      // safe ignore
    }
  }

  /**
   * Return an optimized, low-bandwidth version of an image URL
   */
  public getOptimizedImageUrl(originalUrl: string, options?: { width?: number; quality?: number; lowQualityOnlyOnDataSaver?: boolean }): string {
    if (!originalUrl) return "";

    const isDataSaver = this.isDataSaverActive();
    const shouldOptimize = options?.lowQualityOnlyOnDataSaver !== false ? isDataSaver : true;

    if (!shouldOptimize) {
      return originalUrl;
    }

    // Record estimated saving when compressing images
    this.recordDataSaved(35000); // approx 35KB saved per image

    // Unsplash image optimization
    if (originalUrl.includes("images.unsplash.com")) {
      const targetWidth = options?.width || (isDataSaver ? 300 : 600);
      const targetQuality = options?.quality || (isDataSaver ? 40 : 75);
      const urlObj = new URL(originalUrl);
      urlObj.searchParams.set("w", String(targetWidth));
      urlObj.searchParams.set("q", String(targetQuality));
      urlObj.searchParams.set("auto", "format");
      return urlObj.toString();
    }

    return originalUrl;
  }

  private applyDomEffects(): void {
    if (typeof document === "undefined") return;

    const isEnabled = this.state.dataSaver.enabled;
    const root = document.documentElement;

    if (isEnabled) {
      root.classList.add("data-saver-mode");
      root.setAttribute("data-data-saver", "enabled");
    } else {
      root.classList.remove("data-saver-mode");
      root.setAttribute("data-data-saver", "disabled");
    }
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        console.error("Error in performance listener:", e);
      }
    });
  }

  private detectHardware(): void {
    if (typeof navigator === "undefined") return;

    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4; // in GB

    // Flag low-end if less than 4 CPU cores or <= 2GB RAM
    const isLowEnd = cores < 4 || memory <= 2;
    this.state.isLowEndDevice = isLowEnd;
  }

  private detectNetwork(): void {
    if (typeof navigator === "undefined") return;

    this.state.isOnline = navigator.onLine;

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType || "unknown";
      const downlink = connection.downlink;
      const rtt = connection.rtt;
      const saveData = connection.saveData || false;

      const isSlow = effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g" || (downlink && downlink < 1.0) || (rtt && rtt > 500);

      this.state.effectiveType = effectiveType;
      this.state.downlinkMbps = downlink;
      this.state.rttMs = rtt;
      this.state.saveDataEnabled = saveData;
      this.state.isLowBandwidth = isSlow || saveData;
    }
  }

  private loadUserPreference(): void {
    try {
      const savedBytes = localStorage.getItem(this.bytesSavedKey);
      if (savedBytes) {
        this.state.estimatedBytesSaved = parseInt(savedBytes, 10) || 0;
      }

      const savedDataSaver = localStorage.getItem(this.storageKey);
      if (savedDataSaver !== null) {
        const parsed = JSON.parse(savedDataSaver);
        if (typeof parsed === "boolean") {
          this.state.dataSaver = {
            ...DEFAULT_DATA_SAVER_CONFIG,
            enabled: parsed
          };
        } else if (typeof parsed === "object" && parsed !== null) {
          this.state.dataSaver = {
            ...DEFAULT_DATA_SAVER_CONFIG,
            ...parsed
          };
        }
        this.state.liteMode = this.state.dataSaver.enabled;
        return;
      }

      // Check legacy preference
      const savedLegacy = localStorage.getItem(this.legacyStorageKey);
      if (savedLegacy !== null) {
        const enabled = JSON.parse(savedLegacy);
        this.state.dataSaver = {
          ...DEFAULT_DATA_SAVER_CONFIG,
          enabled
        };
        this.state.liteMode = enabled;
        return;
      }

      // Auto-enable Data Saver if on 2G/3G, client saveData header, or low-end device
      if (this.state.isLowBandwidth || this.state.saveDataEnabled) {
        this.state.dataSaver = {
          ...DEFAULT_DATA_SAVER_CONFIG,
          enabled: true
        };
        this.state.liteMode = true;
      }
    } catch {
      this.state.dataSaver = { ...DEFAULT_DATA_SAVER_CONFIG };
      this.state.liteMode = false;
    }
  }

  private setupListeners(): void {
    window.addEventListener("online", () => {
      this.state.isOnline = true;
      this.detectNetwork();
      this.notify();
    });

    window.addEventListener("offline", () => {
      this.state.isOnline = false;
      this.notify();
    });

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && typeof connection.addEventListener === "function") {
      connection.addEventListener("change", () => {
        this.detectNetwork();
        this.notify();
      });
    }
  }
}

export const performanceManager = new PerformanceManager();
