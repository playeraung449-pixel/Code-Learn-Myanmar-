/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Sparkles,
  Bot,
  MessageSquare,
  HelpCircle,
  Code2,
  Bug,
  Lightbulb,
  Zap,
  Volume2,
  VolumeX,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Play,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { performanceManager } from "../lib/performanceManager";

export type Kibo3DState =
  | "idle"
  | "greeting"
  | "thinking"
  | "explaining"
  | "success"
  | "celebration"
  | "error_help";

interface Kibo3DMentorProps {
  state?: Kibo3DState;
  onStateChange?: (state: Kibo3DState) => void;
  onAskQuestion?: (question: string) => void;
  onRequestExplanation?: (topic?: string) => void;
  onAskCodingHelp?: (codeContext?: string) => void;
  onAskExample?: (concept?: string) => void;
  currentLessonTitle?: string;
  currentCourseTitle?: string;
  speechText?: string;
  className?: string;
  compact?: boolean;
  interactiveMode?: boolean;
}

function Kibo3DMentorComponent({
  state: externalState = "idle",
  onStateChange,
  onAskQuestion,
  onRequestExplanation,
  onAskCodingHelp,
  onAskExample,
  currentLessonTitle,
  currentCourseTitle,
  speechText,
  className = "",
  compact = false,
  interactiveMode = true
}: Kibo3DMentorProps) {
  // Internal state management for interactive mode
  const [activeState, setActiveState] = useState<Kibo3DState>(externalState);
  const [internalSpeech, setInternalSpeech] = useState<string>(
    speechText ||
      (currentLessonTitle
        ? `မင်္ဂလာပါ! "${currentLessonTitle}" သင်ခန်းစာနဲ့ပတ်သက်ပြီး သိချင်တာ သို့မဟုတ် ကုဒ်စမ်းသပ်မှုများအတွက် အချိန်မရွေး မေးမြန်းနိုင်ပါတယ်ခင်ဗျာ!`
        : "မင်္ဂလာပါ! ကျွန်တော် Kibo ပါ။ ပရိုဂရမ်မင်းနဲ့ ပတ်သက်ပြီး ဘာကူညီပေးရမလဲ ခင်ဗျာ။")
  );

  // Mouse hover 3D tilt tracking (performant CSS transform, no heavy WebGL)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isDataSaverOrReducedMotion, setIsDataSaverOrReducedMotion] = useState<boolean>(
    performanceManager.shouldReduceAnimations()
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Subscribe to performance & data saver settings
  useEffect(() => {
    const unsub = performanceManager.subscribe((perf) => {
      setIsDataSaverOrReducedMotion(perf.dataSaver.enabled && perf.dataSaver.reduceAnimations);
    });
    return unsub;
  }, []);

  // Performance: Intersection Observer to pause rendering/calculations when out of view
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Performance: Pause and clean up on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsInViewport(false);
      } else if (containerRef.current) {
        setIsInViewport(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Sync external state changes
  useEffect(() => {
    if (externalState) {
      setActiveState(externalState);
      updateSpeechForState(externalState);
    }
  }, [externalState]);

  useEffect(() => {
    if (speechText) {
      setInternalSpeech(speechText);
    }
  }, [speechText]);

  // Audio synthesize / sound effects using Web Audio API (lightweight, zero network overhead)
  const playSoundForState = useCallback((st: Kibo3DState) => {
    if (isMuted || isDataSaverOrReducedMotion || !isInViewport) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.04, now);

      if (st === "greeting" || st === "celebration" || st === "success") {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (st === "thinking") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(466.16, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (st === "error_help") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Safe audio policy fallback
    }
  }, [isMuted, isDataSaverOrReducedMotion, isInViewport]);

  const changeState = (newState: Kibo3DState, customSpeech?: string) => {
    setActiveState(newState);
    if (onStateChange) onStateChange(newState);
    playSoundForState(newState);

    if (customSpeech) {
      setInternalSpeech(customSpeech);
    } else {
      updateSpeechForState(newState);
    }
  };

  const updateSpeechForState = (st: Kibo3DState) => {
    switch (st) {
      case "greeting":
        setInternalSpeech("မင်္ဂလာပါ ခင်ဗျာ! အတူတူ ပရိုဂရမ်မင်း လေ့လာကြရအောင်!");
        break;
      case "thinking":
        setInternalSpeech("ခေတ္တစောင့်ပါခင်ဗျာ... အဖြေကို စဉ်းစားတွေးခေါ် နေပါတယ် 🤔💭");
        break;
      case "explaining":
        setInternalSpeech("ဒီအယူအဆကို မြန်မာလို အဆင့်ဆင့် ရှင်းပြပေးပါမယ်ခင်ဗျာ 📖✨");
        break;
      case "success":
        setInternalSpeech("အရမ်းတော်ပါတယ်! ကုဒ်မှန်ကန်စွာ အောင်မြင်သွားပါပြီ 🌟🎉");
        break;
      case "celebration":
        setInternalSpeech("ဂုဏ်ယူပါတယ်! သင်ခန်းစာ အောင်မြင်စွာ ပြီးဆုံးခဲ့ပါပြီ! 🏆🚀");
        break;
      case "error_help":
        setInternalSpeech("စိတ်မပူပါနဲ့! Error ဘယ်နားတက်နေလဲ အတူတူ ရှာဖွေပြီး ပြင်ဆင်ကြစို့ 🛠️💡");
        break;
      case "idle":
      default:
        if (!speechText) {
          setInternalSpeech(
            currentLessonTitle
              ? `"${currentLessonTitle}" နှင့်ပတ်သက်၍ မေးမြန်းလိုသည်များကို ကူညီပေးပါရစေခင်ဗျာ။`
              : "မေးခွန်းများ၊ ကုဒ်ဥပမာများနှင့် error များကို အချိန်မရွေး မေးမြန်းနိုင်ပါတယ်ခင်ဗျာ။"
          );
        }
        break;
    }
  };

  // Performance: Throttled mouse tracking with requestAnimationFrame (avoids 120Hz unneeded re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDataSaverOrReducedMotion || !isInViewport) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    animationFrameRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    });
  };

  const handleMouseLeave = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Visual Theme Colors and Glow based on state
  const getStateColors = () => {
    switch (activeState) {
      case "greeting":
        return { glow: "#38bdf8", accent: "#0284c7", halo: "rgba(56, 189, 248, 0.2)" };
      case "thinking":
        return { glow: "#f59e0b", accent: "#d97706", halo: "rgba(245, 158, 11, 0.2)" };
      case "explaining":
        return { glow: "#818cf8", accent: "#4f46e5", halo: "rgba(129, 140, 248, 0.2)" };
      case "success":
        return { glow: "#10b981", accent: "#059669", halo: "rgba(16, 185, 129, 0.2)" };
      case "celebration":
        return { glow: "#ec4899", accent: "#db2777", halo: "rgba(236, 72, 153, 0.25)" };
      case "error_help":
        return { glow: "#fb7185", accent: "#e11d48", halo: "rgba(251, 113, 133, 0.2)" };
      case "idle":
      default:
        return { glow: "#38bdf8", accent: "#2563eb", halo: "rgba(56, 189, 248, 0.15)" };
    }
  };

  const colors = getStateColors();

  // Eye movement calculation with tilt (disabled in data saver / reduced motion)
  const eyeOffsetX = isDataSaverOrReducedMotion ? 0 : tilt.x * 5;
  const eyeOffsetY = isDataSaverOrReducedMotion ? 0 : tilt.y * 4;

  const enableKeyframes = isInViewport && !isDataSaverOrReducedMotion;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col items-center select-none transition-all duration-300 ${className}`}
    >
      {/* 1. Kibo Speech Bubble */}
      <div className="relative mb-3 max-w-xs sm:max-w-md w-full animate-fade-in z-20">
        <div
          className="relative bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-100 p-3 sm:p-4 rounded-2xl shadow-xl shadow-black/40 text-left font-sans transition-all duration-300"
          style={{
            borderColor: `${colors.glow}40`,
            boxShadow: `0 10px 25px -5px ${colors.halo}`
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: colors.glow }}
              />
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                Kibo 3D Mentor
              </span>
              <span
                className="px-1.5 py-0.2 text-[9px] rounded-full uppercase font-bold"
                style={{
                  backgroundColor: `${colors.glow}20`,
                  color: colors.glow
                }}
              >
                {activeState.replace("_", " ")}
              </span>
            </div>

            {/* Sound Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
              title={isMuted ? "အသံဖွင့်မည် (Unmute Chimes)" : "အသံပိတ်မည် (Mute)"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          </div>

          {/* Speech Text */}
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {internalSpeech}
          </p>

          {/* Speech Bubble Pointer */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px]"
            style={{ borderTopColor: "rgba(30, 41, 59, 0.95)" }}
          />
        </div>
      </div>

      {/* 2. 3D Robot Mascot Canvas Container */}
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={() => {
          // Cycle friendly greeting / animation on direct tap
          if (activeState === "idle") {
            changeState("greeting");
            setTimeout(() => changeState("idle"), 4000);
          }
        }}
        style={{
          perspective: "800px"
        }}
      >
        {/* Ambient Halo & Shadow Ground */}
        <div
          className="absolute -bottom-2 w-32 h-6 rounded-full blur-md transition-all duration-500"
          style={{
            backgroundColor: colors.halo,
            transform: `scale(${isHovered ? 1.15 : 1}) translateY(${tilt.y * 3}px)`
          }}
        />

        {/* 3D Transform Wrapper with Physics Keyframes */}
        <div
          className={`relative transition-transform duration-200 ease-out ${
            compact ? "w-28 h-28 sm:w-36 sm:h-36" : "w-40 h-40 sm:w-52 sm:h-52"
          }`}
          style={{
            transform: `rotateX(${-tilt.y * 12}deg) rotateY(${tilt.x * 15}deg) translateY(${
              activeState === "celebration" || activeState === "success" ? "-8px" : "0px"
            })`
          }}
        >
          {/* Custom CSS Animation Keyframes */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @keyframes kibo-float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1deg); }
              }
              @keyframes kibo-cheer {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-14px) scale(1.05) rotate(-2deg); }
              }
              @keyframes kibo-think-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(0.97) rotate(1deg); }
              }
              @keyframes kibo-radar-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes kibo-sparkle {
                0% { transform: scale(0) rotate(0deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                100% { transform: scale(0) rotate(360deg); opacity: 0; }
              }
              .kibo-3d-floating {
                animation: kibo-float 3.6s ease-in-out infinite;
              }
              .kibo-3d-cheering {
                animation: kibo-cheer 1.4s ease-in-out infinite;
              }
              .kibo-3d-thinking {
                animation: kibo-think-pulse 2.8s ease-in-out infinite;
              }
              .kibo-sparkle-item {
                animation: kibo-sparkle 1.8s ease-out infinite;
              }
            `
            }}
          />

          {/* SVG 3D Shaded Robot Vector */}
          <svg
            viewBox="0 0 240 240"
            className={`w-full h-full filter drop-shadow-2xl ${
              !enableKeyframes
                ? ""
                : activeState === "celebration" || activeState === "success"
                ? "kibo-3d-cheering"
                : activeState === "thinking"
                ? "kibo-3d-thinking"
                : "kibo-3d-floating"
            }`}
          >
            <defs>
              {/* 3D Metallic Gradients */}
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="40%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>

              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <radialGradient id="antennaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor={colors.glow} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              <linearGradient id="chestCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.glow} />
                <stop offset="100%" stopColor={colors.accent} />
              </linearGradient>

              {/* 3D Bevel Highlight */}
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* SPARKLES & CONFETTI (Success / Celebration) */}
            {(activeState === "celebration" || activeState === "success") && (
              <g>
                <circle cx="35" cy="50" r="4" fill="#ec4899" className="kibo-sparkle-item" style={{ animationDelay: "0s" }} />
                <circle cx="205" cy="45" r="5" fill="#f59e0b" className="kibo-sparkle-item" style={{ animationDelay: "0.4s" }} />
                <polygon points="190,85 195,95 185,93" fill="#10b981" className="kibo-sparkle-item" style={{ animationDelay: "0.8s" }} />
                <circle cx="45" cy="140" r="3.5" fill="#38bdf8" className="kibo-sparkle-item" style={{ animationDelay: "1.1s" }} />
                <polygon points="30,85 36,92 28,90" fill="#a855f7" className="kibo-sparkle-item" style={{ animationDelay: "0.6s" }} />
              </g>
            )}

            {/* THINKING GEAR SPARK */}
            {activeState === "thinking" && (
              <g style={{ transformOrigin: "190px 65px", animation: "kibo-radar-spin 6s linear infinite" }}>
                <circle cx="190" cy="65" r="8" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M190,52 L193,59 L200,61 L193,64 L190,71 L187,64 L180,61 L187,59 Z" fill="#f59e0b" />
              </g>
            )}

            {/* 3D HOVER BASE / JET PROPULSION */}
            <g id="kibo-3d-base">
              {/* Outer hover disc ring */}
              <ellipse cx="120" cy="212" rx="48" ry="12" fill="#090d16" stroke="#334155" strokeWidth="2" />
              {/* Jet Thruster Energy Beam */}
              <ellipse cx="120" cy="212" rx="32" ry="7" fill={colors.glow} opacity="0.6" filter="url(#softGlow)" />
              <ellipse cx="120" cy="212" rx="16" ry="3.5" fill="#ffffff" opacity="0.9" />

              {/* Magnetic Gimbal Neck Connection */}
              <path d="M110,195 L130,195 L126,210 L114,210 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            </g>

            {/* 3D ROBOT ARMS & HANDS */}
            <g id="kibo-3d-arms">
              {/* LEFT ARM */}
              {activeState === "celebration" ? (
                // Left arm raised high
                <g>
                  <path d="M60,155 Q25,120 40,85 T55,100" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="42" cy="88" r="8" fill="#334155" stroke={colors.glow} strokeWidth="1.5" />
                </g>
              ) : activeState === "greeting" ? (
                // Left arm waving
                <g>
                  <path d="M60,155 Q20,135 25,100 T48,110" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="28" cy="102" r="8" fill="#334155" stroke={colors.glow} strokeWidth="1.5" />
                </g>
              ) : activeState === "explaining" ? (
                // Presenting left palm
                <g>
                  <path d="M60,155 Q28,150 35,125 T58,135" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="38" cy="128" r="7.5" fill="#334155" stroke={colors.glow} strokeWidth="1.5" />
                </g>
              ) : (
                // Idle resting floating arm
                <g>
                  <path d="M60,155 Q35,145 38,125 T58,138" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2" />
                  <circle cx="40" cy="128" r="7" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                </g>
              )}

              {/* RIGHT ARM */}
              {activeState === "celebration" ? (
                // Right arm raised high
                <g>
                  <path d="M180,155 Q215,120 200,85 T185,100" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="198" cy="88" r="8" fill="#334155" stroke={colors.glow} strokeWidth="1.5" />
                </g>
              ) : activeState === "error_help" ? (
                // Holding wrench / tool or gesturing support
                <g>
                  <path d="M180,155 Q215,140 205,115 T182,130" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="202" cy="118" r="8" fill="#334155" stroke="#fb7185" strokeWidth="2" />
                  {/* Tool icon */}
                  <path d="M198,114 L206,122 M206,114 L198,122" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : activeState === "explaining" ? (
                // Right pointer gesture
                <g>
                  <path d="M180,155 Q212,145 205,120 T182,130" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2.5" />
                  <circle cx="202" cy="122" r="7.5" fill="#334155" stroke={colors.glow} strokeWidth="1.5" />
                </g>
              ) : (
                // Idle resting floating arm
                <g>
                  <path d="M180,155 Q205,145 202,125 T182,138" fill="url(#bodyGrad)" stroke="#64748b" strokeWidth="2" />
                  <circle cx="200" cy="128" r="7" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                </g>
              )}
            </g>

            {/* 3D ROBOT BODY TORSO */}
            <g id="kibo-3d-torso">
              {/* Torso Capsule with metallic bevel */}
              <rect
                x="74"
                y="142"
                width="92"
                height="54"
                rx="22"
                fill="url(#bodyGrad)"
                stroke="#64748b"
                strokeWidth="3"
              />
              {/* Chest Accent Trim */}
              <path
                d="M84,152 Q120,160 156,152"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Glowing Core Reactor Power Gauge */}
              <circle cx="120" cy="169" r="14" fill="#090d16" stroke="#334155" strokeWidth="2" />
              <circle
                cx="120"
                cy="169"
                r="9"
                fill="url(#chestCoreGrad)"
                filter="url(#softGlow)"
                className="animate-pulse"
              />
              <circle cx="120" cy="169" r="4" fill="#ffffff" />
            </g>

            {/* 3D HEAD & ANTENNA */}
            <g id="kibo-3d-head">
              {/* Neck Hydralics */}
              <rect x="106" y="128" width="28" height="16" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2" />

              {/* Antenna Shaft */}
              <rect x="117" y="22" width="6" height="28" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />
              {/* Glowing Antenna Sphere */}
              <circle cx="120" cy="18" r="12" fill="url(#antennaGlow)" filter="url(#softGlow)" />
              <circle cx="120" cy="18" r="6" fill={colors.glow} />
              <circle cx="120" cy="18" r="2.5" fill="#ffffff" />

              {/* Ear Screws / Side Audio Sensors */}
              <rect x="48" y="82" width="12" height="18" rx="4" fill="#475569" stroke="#334155" strokeWidth="1.5" />
              <circle cx="54" cy="91" r="3" fill={colors.glow} opacity="0.8" />

              <rect x="180" y="82" width="12" height="18" rx="4" fill="#475569" stroke="#334155" strokeWidth="1.5" />
              <circle cx="186" cy="91" r="3" fill={colors.glow} opacity="0.8" />

              {/* Head Shell Outer Bevel */}
              <rect
                x="58"
                y="46"
                width="124"
                height="88"
                rx="30"
                fill="url(#headGrad)"
                stroke="#64748b"
                strokeWidth="3.5"
              />

              {/* Head Top Specular Reflection */}
              <path
                d="M80,52 Q120,47 160,52"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* OLED Faceplate Screen with Deep Bevel */}
              <rect
                x="68"
                y="56"
                width="104"
                height="68"
                rx="20"
                fill="url(#screenGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />

              {/* State Accessories: Graduation Cap / Party Crown / Glasses */}
              {activeState === "celebration" && (
                <g>
                  {/* Party Hat */}
                  <polygon points="102,46 120,12 138,46" fill="#ec4899" stroke="#f43f5e" strokeWidth="1.5" />
                  <circle cx="120" cy="12" r="5" fill="#f59e0b" filter="url(#softGlow)" />
                </g>
              )}

              {activeState === "success" && (
                <g>
                  {/* Golden Crown */}
                  <path
                    d="M94,46 L102,32 L112,40 L120,28 L128,40 L138,32 L146,46 Z"
                    fill="#eab308"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* 3D INTERACTIVE LED EYES */}
              <g
                id="kibo-3d-eyes"
                style={{
                  transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)`,
                  transition: "transform 0.1s ease-out"
                }}
              >
                {activeState === "greeting" || activeState === "idle" ? (
                  // Happy curved smiling arches
                  <g stroke={colors.glow} strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#softGlow)">
                    <path d="M86,88 Q96,75 106,88" />
                    <path d="M134,88 Q144,75 154,88" />
                  </g>
                ) : activeState === "thinking" ? (
                  // Analytical slanted eyes + loading dots
                  <g stroke={colors.glow} strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#softGlow)">
                    <path d="M88,84 L104,90" />
                    <path d="M136,90 L152,84" />
                    <circle cx="120" cy="102" r="2.5" fill={colors.glow} stroke="none" className="animate-ping" />
                  </g>
                ) : activeState === "explaining" ? (
                  // Big curious wide mentor eyes
                  <g fill={colors.glow} filter="url(#softGlow)">
                    <ellipse cx="96" cy="86" rx="9" ry="11" />
                    <ellipse cx="144" cy="86" rx="9" ry="11" />
                    {/* Pupil reflections */}
                    <circle cx="99" cy="83" r="3.5" fill="#ffffff" />
                    <circle cx="147" cy="83" r="3.5" fill="#ffffff" />
                  </g>
                ) : activeState === "success" || activeState === "celebration" ? (
                  // Star / Twinkle Sparkle eyes
                  <g stroke={colors.glow} strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#softGlow)">
                    <path d="M86,86 L106,86 M96,76 L96,96" />
                    <path d="M134,86 L154,86 M144,76 L144,96" />
                  </g>
                ) : (
                  // Error / Help supportive empathetic eyes
                  <g stroke={colors.glow} strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#softGlow)">
                    <path d="M88,88 Q96,96 104,88" />
                    <path d="M136,88 Q144,96 152,88" />
                  </g>
                )}
              </g>

              {/* 3D LED MOUTH */}
              <g
                id="kibo-3d-mouth"
                stroke={colors.glow}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#softGlow)"
              >
                {activeState === "celebration" || activeState === "success" ? (
                  <path d="M108,106 Q120,118 132,106" />
                ) : activeState === "thinking" ? (
                  <path d="M112,108 L128,108" />
                ) : activeState === "explaining" || activeState === "greeting" ? (
                  <path d="M110,107 Q120,114 130,107" />
                ) : activeState === "error_help" ? (
                  <path d="M112,110 Q120,106 128,110" />
                ) : (
                  <path d="M114,108 Q120,111 126,108" />
                )}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* 3. Interactive Quick Action Buttons (Under Kibo) */}
      {interactiveMode && (
        <div className="w-full mt-4 flex flex-col space-y-2 z-10">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Kibo Quick Mentoring:</span>
            </span>
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="text-blue-400 hover:text-blue-300 cursor-pointer hover:underline text-[10px]"
            >
              {showQuickMenu ? "Close Menu" : "All Prompts"}
            </button>
          </div>

          {/* Primary Quick Interaction Chips */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Request Explanation */}
            <button
              onClick={() => {
                changeState("explaining");
                if (onRequestExplanation) onRequestExplanation(currentLessonTitle);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left text-xs font-semibold text-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:border-indigo-500/50 group active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">ရှင်းပြချက်တောင်းမည် 📖</span>
            </button>

            {/* 2. Ask Coding Help */}
            <button
              onClick={() => {
                changeState("error_help");
                if (onAskCodingHelp) onAskCodingHelp();
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left text-xs font-semibold text-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:border-rose-500/50 group active:scale-95"
            >
              <Bug className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">ကုဒ် Error ကူညီပါ 🛠️</span>
            </button>

            {/* 3. Ask Example Code */}
            <button
              onClick={() => {
                changeState("thinking");
                if (onAskExample) onAskExample(currentLessonTitle);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left text-xs font-semibold text-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:border-amber-500/50 group active:scale-95"
            >
              <Code2 className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">ဥပမာကုဒ်ပြပါ 💻</span>
            </button>

            {/* 4. Ask Direct Question */}
            <button
              onClick={() => {
                changeState("greeting");
                if (onAskQuestion) onAskQuestion("ပရိုဂရမ်မင်း မေးခွန်းများ မေးမြန်းလိုပါသည်");
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left text-xs font-semibold text-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm hover:border-blue-500/50 group active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">မေးခွန်းမေးမည် 💬</span>
            </button>
          </div>

          {/* Secondary Animation States Showcase Drawer (if user opens full menu) */}
          {showQuickMenu && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 animate-fade-in text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Mascot State Previews (စမ်းသပ်ရန် ကာတွန်းပုံစံများ):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    "idle",
                    "greeting",
                    "thinking",
                    "explaining",
                    "success",
                    "celebration",
                    "error_help"
                  ] as Kibo3DState[]
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => changeState(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                      activeState === st
                        ? "bg-blue-600 text-white border-blue-400 shadow"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Kibo3DMentor = memo(Kibo3DMentorComponent);
export default Kibo3DMentor;
