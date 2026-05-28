"use client";

import { useEffect, useState } from "react";
import "./CameraShutter.css";

export default function CameraShutter() {
  const [show, setShow] = useState(true);
  const [focusing, setFocusing] = useState(true);
  const [shutterClicked, setShutterClicked] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = "hidden";

    // 1. Snaps lens into sharp focus at 1.0 seconds
    const focusTimer = setTimeout(() => {
      setFocusing(false);
    }, 1000);

    // 2. Fires the camera shutter click flash at 2.4 seconds
    const clickTimer = setTimeout(() => {
      setShutterClicked(true);
    }, 2400);

    // 3. Fades out the background splash screen wrapper at 2.7 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2700);

    // 4. Completely unmounts the splash screen and unlocks scroll at 3.6 seconds
    const removeTimer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 3600);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(clickTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`shutter-wrapper ${fadeOut ? "fade-out" : ""} ${shutterClicked ? "shutter-flash-active" : ""}`}>
      {/* DSLR Viewfinder Technical Metrics Overlay */}
      <div className="viewfinder-metrics">
        <div className="metric-top-left">RAW  [ 4K ]</div>
        <div className="metric-top-right">BATT 100%</div>
        <div className="metric-bottom-left">ISO 100  F1.2  1/250s</div>
        <div className="metric-bottom-right">MF  [+]  AE-L</div>
      </div>

      {/* Viewfinder Corner Focus Brackets */}
      <div className={`viewfinder-focus-box ${focusing ? "focusing" : "locked"}`}>
        <div className="focus-bracket bracket-tl"></div>
        <div className="focus-bracket bracket-tr"></div>
        <div className="focus-bracket bracket-bl"></div>
        <div className="focus-bracket bracket-br"></div>
        <div className="focus-center-dot"></div>
      </div>

      {/* Bokeh / Text Focusing Container */}
      <div className="brand-focus-container">
        <h1 className={`brand-focus-logo ${focusing ? "out-of-focus" : "in-focus"}`}>
          LENS OF SHUBH
        </h1>
        <p className={`brand-focus-subtitle ${focusing ? "out-of-focus" : "in-focus"}`}>
          VISUAL STORYTELLER
        </p>
      </div>

      {/* Instant Shutter Light Flash Overlay */}
      <div className={`shutter-flash-overlay ${shutterClicked ? "flash" : ""}`}></div>
    </div>
  );
}

