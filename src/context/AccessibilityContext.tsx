/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Code Learn Myanmar - Enterprise Accessibility (A11y) & Inclusive Learning Context
 * Provides comprehensive accessibility controls including:
 * - Dynamic Text Size Scaling (Normal, Large, Extra Large)
 * - High Contrast WCAG AAA Mode
 * - Enhanced Keyboard Focus Rings & Navigation
 * - Large Touch Targets (Minimum 48px for mobile accessibility)
 * - Dyslexia-Friendly & High-Legibility Typography
 * - Global Keyboard Shortcuts Manager
 * - Screen Reader Announcements
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type FontSizeOption = "normal" | "large" | "xlarge";

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  highContrast: boolean;
  largeTouchTargets: boolean;
  focusHighlight: boolean;
  readingSpacing: boolean;
  reducedMotion: boolean;
  textToSpeechHighlight: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setFontSize: (size: FontSizeOption) => void;
  toggleHighContrast: () => void;
  toggleLargeTouchTargets: () => void;
  toggleFocusHighlight: () => void;
  toggleReadingSpacing: () => void;
  toggleReducedMotion: () => void;
  resetToDefaults: () => void;
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  announceToScreenReader: (message: string) => void;
}

const STORAGE_KEY = "clm_accessibility_preferences_v2";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  largeTouchTargets: true,
  focusHighlight: true,
  readingSpacing: false,
  reducedMotion: false,
  textToSpeechHighlight: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Persist settings whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save accessibility preferences:", e);
    }
  }, [settings]);

  // Apply HTML Root Classes for global CSS inheritance
  useEffect(() => {
    const root = document.documentElement;

    // Font size classes
    root.classList.remove("a11y-font-normal", "a11y-font-large", "a11y-font-xlarge");
    root.classList.add(`a11y-font-${settings.fontSize}`);

    // High contrast class
    if (settings.highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    // Touch targets class
    if (settings.largeTouchTargets) {
      root.classList.add("a11y-large-touch");
    } else {
      root.classList.remove("a11y-large-touch");
    }

    // Focus highlight class
    if (settings.focusHighlight) {
      root.classList.add("a11y-focus-visible");
    } else {
      root.classList.remove("a11y-focus-visible");
    }

    // Reading spacing class
    if (settings.readingSpacing) {
      root.classList.add("a11y-reading-spacing");
    } else {
      root.classList.remove("a11y-reading-spacing");
    }

    // Reduced motion class
    if (settings.reducedMotion) {
      root.classList.add("a11y-reduced-motion");
    } else {
      root.classList.remove("a11y-reduced-motion");
    }
  }, [settings]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys when the user is typing in input or textarea
      const target = e.target as HTMLElement | null;
      const isInput = 
        target && 
        (target.tagName === "INPUT" || 
         target.tagName === "TEXTAREA" || 
         target.isContentEditable);

      if (isInput) return;

      // 1. Shift + ? or ? (Slash key with shift) -> Toggle Shortcuts Modal
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
        return;
      }

      // 2. Alt + A -> Toggle Accessibility Settings Modal
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setIsAccessibilityModalOpen(prev => !prev);
        return;
      }

      // 3. Escape key -> Close modals
      if (e.key === "Escape") {
        if (isAccessibilityModalOpen) {
          setIsAccessibilityModalOpen(false);
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAccessibilityModalOpen, isShortcutsModalOpen]);

  const setFontSize = (fontSize: FontSizeOption) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleLargeTouchTargets = () => {
    setSettings(prev => ({ ...prev, largeTouchTargets: !prev.largeTouchTargets }));
  };

  const toggleFocusHighlight = () => {
    setSettings(prev => ({ ...prev, focusHighlight: !prev.focusHighlight }));
  };

  const toggleReadingSpacing = () => {
    setSettings(prev => ({ ...prev, readingSpacing: !prev.readingSpacing }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const announceToScreenReader = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 3000);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setFontSize,
        toggleHighContrast,
        toggleLargeTouchTargets,
        toggleFocusHighlight,
        toggleReadingSpacing,
        toggleReducedMotion,
        resetToDefaults,
        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        announceToScreenReader
      }}
    >
      {children}
      {/* Live Region for Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="a11y-live-announcer"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
