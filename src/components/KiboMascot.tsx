/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, memo } from "react";
import { performanceManager } from "../lib/performanceManager";

export type KiboEmotion = 
  | "happy" 
  | "thinking" 
  | "excited" 
  | "proud" 
  | "encouraging" 
  | "curious" 
  | "celebrating" 
  | "focused";

interface KiboMascotProps {
  emotion?: KiboEmotion;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  speechBubble?: string;
  className?: string;
}

function KiboMascotComponent({
  emotion = "happy",
  size = "md",
  animated = true,
  speechBubble,
  className = ""
}: KiboMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(
    performanceManager.shouldReduceAnimations()
  );

  useEffect(() => {
    const unsub = performanceManager.subscribe((st) => {
      setIsReducedMotion(st.dataSaver.enabled && st.dataSaver.reduceAnimations);
    });
    return unsub;
  }, []);

  // Performance: Pause animations when mascot is outside of viewport
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

  // Pause on tab hidden
  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) {
        setIsInViewport(false);
      } else if (containerRef.current) {
        setIsInViewport(true);
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, []);

  const shouldAnimate = animated && isInViewport && !isReducedMotion;
  
  // Dimensions map
  const sizeMap = {
    xs: "w-12 h-12",
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64"
  };

  // Get bubble alignment classes based on sizes
  const speechBubbleSizeClasses = speechBubble && speechBubble.length > 50 
    ? "max-w-xs text-xs" 
    : "max-w-64 text-xs sm:text-sm";

  // Dynamic colors for lights and elements based on emotion
  const getGlowColor = () => {
    switch (emotion) {
      case "happy": return "#10B981"; // Emerald
      case "thinking": return "#F59E0B"; // Amber
      case "excited": return "#EC4899"; // Pink
      case "proud": return "#EAB308"; // Gold
      case "encouraging": return "#3B82F6"; // Blue
      case "curious": return "#06B6D4"; // Cyan
      case "celebrating": return "#8B5CF6"; // Purple
      case "focused": return "#6366F1"; // Indigo
      default: return "#3B82F6";
    }
  };

  const glowColor = getGlowColor();

  return (
    <div ref={containerRef} className={`flex flex-col items-center select-none ${className}`}>
      {/* Dynamic Speech Bubble */}
      {speechBubble && (
        <div className={`mb-3 relative bg-slate-900 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl ${speechBubbleSizeClasses} leading-relaxed text-center shadow-lg font-sans animate-fade-in`}>
          <p>{speechBubble}</p>
          {/* Bubble Arrow pointing down to mascot */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-800" />
          <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-900" />
        </div>
      )}

      {/* Mascot Render Area */}
      <div className={`relative ${sizeMap[size]}`}>
        {/* CSS KEYFRAME STYLE INJECTOR (Keeps Mascot standalone, performant, and visual) */}
        {shouldAnimate && (
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes kibo-bob {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(1deg); }
            }
            @keyframes kibo-vibe {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-8px) scale(1.03) rotate(-1deg); }
            }
            @keyframes kibo-breath {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(0.98); }
            }
            @keyframes antenna-blink {
              0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px ${glowColor}); }
              50% { opacity: 0.4; filter: none; }
            }
            @keyframes gear-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes particle-rise {
              0% { transform: translateY(5px) scale(0.5); opacity: 0; }
              50% { opacity: 0.8; }
              100% { transform: translateY(-15px) scale(1); opacity: 0; }
            }
            .kibo-bobbing {
              animation: kibo-bob 3s ease-in-out infinite;
            }
            .kibo-excited {
              animation: kibo-vibe 1.5s ease-in-out infinite;
            }
            .kibo-breathing {
              animation: kibo-breath 4s ease-in-out infinite;
            }
            .kibo-blink {
              animation: antenna-blink 1.5s infinite;
            }
            .kibo-spin {
              transform-origin: center;
              animation: gear-spin 8s linear infinite;
            }
            .kibo-particle-1 { animation: particle-rise 2s ease-out infinite; }
            .kibo-particle-2 { animation: particle-rise 2.5s ease-out infinite 0.7s; }
            .kibo-particle-3 { animation: particle-rise 1.8s ease-out infinite 1.2s; }
          `}} />
        )}

        {/* Ambient background glow of Kibo's screen */}
        <div 
          style={{ backgroundColor: `${glowColor}1c` }} 
          className="absolute inset-2 rounded-full blur-[20px] pointer-events-none transition-all duration-500" 
        />

        {/* Mascot SVG */}
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full select-none ${
            !shouldAnimate 
              ? "" 
              : emotion === "excited" || emotion === "celebrating" 
              ? "kibo-excited" 
              : emotion === "thinking"
              ? "kibo-breathing"
              : "kibo-bobbing"
          }`}
        >
          {/* CELEBRATING BACKGROUND PARTICLES */}
          {(emotion === "celebrating" || emotion === "excited") && (
            <g>
              <circle cx="40" cy="50" r="3" fill="#EC4899" className="kibo-particle-1" style={{ transformOrigin: "40px 50px" }} />
              <circle cx="160" cy="40" r="4" fill="#F59E0B" className="kibo-particle-2" style={{ transformOrigin: "160px 40px" }} />
              <polygon points="150,70 154,76 148,74" fill="#10B981" className="kibo-particle-3" style={{ transformOrigin: "150px 70px" }} />
              <circle cx="50" cy="120" r="3" fill="#3B82F6" className="kibo-particle-2" style={{ transformOrigin: "50px 120px" }} />
            </g>
          )}

          {/* THINKING SPARK */}
          {emotion === "thinking" && (
            <g className="kibo-spin" style={{ transformOrigin: "160px 60px" }}>
              <path d="M160,50 L162,56 L168,58 L162,60 L160,66 L158,60 L152,58 L158,56 Z" fill="#F59E0B" />
            </g>
          )}

          {/* ROBOT HANDS & ARMS */}
          <g id="kibo-arms">
            {/* Left Arm */}
            {emotion === "encouraging" ? (
              // Bicep Flex Left
              <path d="M48,135 Q20,110 35,90 T45,105 Q35,115 48,135" fill="#334155" stroke="#475569" strokeWidth="2" />
            ) : (
              // Standard Wave/Float Left
              <path d="M50,135 Q25,120 28,105 T45,120" fill="#334155" stroke="#475569" strokeWidth="2" />
            )}

            {/* Right Arm */}
            {emotion === "celebrating" ? (
              // Hands up in the air
              <path d="M150,135 Q175,110 180,95 T160,110" fill="#334155" stroke="#475569" strokeWidth="2" />
            ) : emotion === "excited" ? (
              // Hands waving
              <path d="M150,135 Q180,120 178,105 T155,125" fill="#334155" stroke="#475569" strokeWidth="2" />
            ) : (
              // Standard Right Arm
              <path d="M150,135 Q175,125 172,110 T152,125" fill="#334155" stroke="#475569" strokeWidth="2" />
            )}
          </g>

          {/* ROBOT BODY */}
          <g id="kibo-body">
            {/* Base Stand/Float pad */}
            <ellipse cx="100" cy="180" rx="45" ry="12" fill="#1E293B" />
            <ellipse cx="100" cy="180" rx="30" ry="7" fill={glowColor} opacity="0.3" className="transition-all duration-500" />
            
            {/* Magnetic Hover Joint */}
            <path d="M92,165 L108,165 L104,178 L96,178 Z" fill="#475569" />
            
            {/* Body Shell */}
            <rect x="62" y="125" width="76" height="42" rx="18" fill="#1E293B" stroke="#475569" strokeWidth="3" />
            {/* Inner Power core indicator */}
            <circle cx="100" cy="146" r="10" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            {/* Pulsing Core LED */}
            <circle cx="100" cy="146" r="5" fill={glowColor} className="kibo-blink transition-all duration-500" />
          </g>

          {/* ANTENNA & SCREWS */}
          <g id="kibo-ears-antenna">
            {/* Left Screw Ear */}
            <rect x="42" y="76" width="10" height="14" rx="3" fill="#475569" />
            <rect x="38" y="80" width="4" height="6" rx="1" fill="#64748B" />

            {/* Right Screw Ear */}
            <rect x="148" y="76" width="10" height="14" rx="3" fill="#475569" />
            <rect x="158" y="80" width="4" height="6" rx="1" fill="#64748B" />

            {/* Main Antenna stem */}
            <rect x="97" y="24" width="6" height="24" rx="2" fill="#475569" />
            {/* Glowing Antenna Orb */}
            <circle cx="100" cy="18" r="9" fill={glowColor} className="kibo-blink transition-all duration-500" />
            <circle cx="100" cy="18" r="4" fill="#FFFFFF" />
          </g>

          {/* ROBOT HEAD */}
          <g id="kibo-head">
            {/* Neck Connection */}
            <rect x="88" y="114" width="24" height="14" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />

            {/* Head Outer Shell */}
            <rect x="50" y="44" width="100" height="74" rx="26" fill="#1E293B" stroke="#475569" strokeWidth="3.5" />
            
            {/* Dark LED screen Faceplate */}
            <rect x="58" y="52" width="84" height="58" rx="18" fill="#090D16" stroke="#334155" strokeWidth="1.5" />
          </g>

          {/* ACCESSORIES (CROWN / PARTY HAT / GLASSES) */}
          <g id="kibo-accessories">
            {emotion === "proud" && (
              // Golden crown
              <path d="M78,42 L84,30 L93,37 L100,26 L107,37 L116,30 L122,42 Z" fill="#EAB308" stroke="#F59E0B" strokeWidth="1.5" />
            )}
            
            {emotion === "celebrating" && (
              // Fun party hat
              <path d="M85,44 L100,14 L115,44 Z" fill="#EC4899" />
            )}
            
            {emotion === "celebrating" && (
              // Party hat pompom
              <circle cx="100" cy="14" r="4" fill="#F59E0B" className="kibo-blink" />
            )}
          </g>

          {/* ROBOT EMOTIONAL LED EYES */}
          <g id="kibo-eyes" stroke={glowColor} strokeWidth="4.5" strokeLinecap="round" fill="none" className="transition-all duration-500">
            {emotion === "happy" && (
              // Smiling Arches
              <g>
                <path d="M72,82 Q80,72 88,82" />
                <path d="M112,82 Q120,72 128,82" />
              </g>
            )}

            {emotion === "thinking" && (
              // Left: slanted up, Right: slanted down
              <g>
                <path d="M74,77 L86,83" />
                <path d="M114,83 L126,77" />
                {/* Thinking dots */}
                <circle cx="100" cy="94" r="2.5" fill={glowColor} stroke="none" className="kibo-blink" />
              </g>
            )}

            {emotion === "excited" && (
              // Massive Star/Twinkle or wide cross shapes
              <g strokeWidth="5">
                <path d="M72,80 L88,80 M80,72 L80,88" />
                <path d="M112,80 L128,80 M120,72 L120,88" />
              </g>
            )}

            {emotion === "proud" && (
              // Confident horizontal lines curved upwards at edges
              <g>
                <path d="M72,80 C74,78 84,78 86,81" />
                <path d="M114,81 C116,78 126,78 128,80" />
              </g>
            )}

            {emotion === "encouraging" && (
              // Arrowheads looking upwards (^ ^)
              <g strokeWidth="5">
                <path d="M72,85 L80,76 L88,85" />
                <path d="M112,85 L120,76 L128,85" />
              </g>
            )}

            {emotion === "curious" && (
              // Curved scanners looking sideways
              <g>
                <ellipse cx="80" cy="80" rx="7" ry="7" fill={glowColor} stroke="none" />
                <ellipse cx="120" cy="80" rx="7" ry="7" fill={glowColor} stroke="none" />
                {/* Scanner pupils */}
                <circle cx="83" cy="80" r="2" fill="#FFFFFF" stroke="none" />
                <circle cx="123" cy="80" r="2" fill="#FFFFFF" stroke="none" />
              </g>
            )}

            {emotion === "celebrating" && (
              // Shiny sparkling stars
              <g>
                <path d="M72,80 Q80,70 88,80" />
                <path d="M112,80 Q120,70 128,80" />
                <circle cx="100" cy="80" r="1.5" fill={glowColor} stroke="none" />
              </g>
            )}

            {emotion === "focused" && (
              // Concentrated narrow slits with books/spec icon overlays
              <g strokeWidth="4">
                <path d="M72,80 L88,80" />
                <path d="M112,80 L128,80" />
                {/* Spectacles frame connection */}
                <path d="M88,80 Q100,84 112,80" strokeWidth="2.5" />
              </g>
            )}
          </g>

          {/* LITERAL ROBOT MOUTH */}
          <g id="kibo-mouth" stroke={glowColor} strokeWidth="3" strokeLinecap="round" fill="none" className="transition-all duration-500">
            {emotion === "happy" || emotion === "excited" || emotion === "celebrating" ? (
              // Happy smile or open laugh mouth
              <path d="M92,96 Q100,105 108,96" />
            ) : emotion === "thinking" ? (
              // Flat line
              <path d="M94,98 L106,98" />
            ) : emotion === "encouraging" || emotion === "proud" ? (
              // Smiling line
              <path d="M93,97 Q100,102 107,97" />
            ) : (
              // Simple curved dot mouth or flat line
              <path d="M96,98 Q100,99 104,98" />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

export const KiboMascot = memo(KiboMascotComponent);
export default KiboMascot;
