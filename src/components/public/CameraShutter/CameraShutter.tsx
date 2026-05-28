"use client";

import { useEffect, useState } from "react";
import "./CameraShutter.css";

export default function CameraShutter() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = "hidden";

    // 1. Fades out the background splash screen wrapper at 3.0 seconds (smooth 0.9s transition)
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // 2. Completely unmounts the splash screen and unlocks scroll at 3.9 seconds
    const removeTimer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 3900);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`shutter-wrapper ${fadeOut ? "fade-out" : ""}`}>
      {/* DSLR Viewfinder Technical Metrics Overlay */}
      <div className="viewfinder-metrics">
        <div className="metric-top-left">LENS OF SHUBH</div>
        <div className="metric-top-right">4K  RAW</div>
        <div className="metric-bottom-left">ISO 100  f/1.2  1/250s</div>
        <div className="metric-bottom-right">MF  LOCKED</div>
      </div>

      {/* Center Content Group (Focus Box + Brand text stacked in flow to prevent overlap) */}
      <div className="shutter-center-group">
        {/* Viewfinder Corner Focus Brackets */}
        <div className="viewfinder-focus-box">
          <div className="focus-bracket bracket-tl"></div>
          <div className="focus-bracket bracket-tr"></div>
          <div className="focus-bracket bracket-bl"></div>
          <div className="focus-bracket bracket-br"></div>
          
          {/* Beautiful vector gold shutter logo watermark in the center of focus brackets */}
          <div className="focus-logo-container">
            <svg className="focus-svg-logo" viewBox="0 0 512 512">
              <defs>
                <linearGradient id="gold-grad-splash" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9C7A35" />
                  <stop offset="25%" stopColor="#E5C77F" />
                  <stop offset="50%" stopColor="#C9A84C" />
                  <stop offset="75%" stopColor="#FDF1A9" />
                  <stop offset="100%" stopColor="#A6843C" />
                </linearGradient>
              </defs>
              <circle cx="256" cy="256" r="180" fill="none" stroke="url(#gold-grad-splash)" strokeWidth="6" />
              <circle cx="256" cy="256" r="168" fill="none" stroke="url(#gold-grad-splash)" strokeWidth="1" opacity="0.3" />
              <circle cx="256" cy="256" r="125" fill="none" stroke="url(#gold-grad-splash)" strokeWidth="3" />
              <text 
                x="256" 
                y="288" 
                fontFamily="'Cormorant Garamond', 'Georgia', serif" 
                fontSize="120" 
                fontWeight="400" 
                fill="url(#gold-grad-splash)" 
                textAnchor="middle" 
                letterSpacing="2"
              >LOS</text>
            </svg>
          </div>
        </div>

        {/* Bokeh / Text Focusing Container */}
        <div className="brand-focus-container">
          <h1 className="brand-focus-logo">
            LENS OF SHUBH
          </h1>
          <p className="brand-focus-subtitle">
            LIGHT & EMOTION
          </p>
        </div>
      </div>
    </div>
  );
}
