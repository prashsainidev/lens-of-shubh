"use client";

import { useEffect, useState } from "react";
import "./CustomCursor.css";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const cursor = document.getElementById("cursor");
    const cursorRing = document.getElementById("cursor-ring");

    if (!cursor || !cursorRing) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let cursorScale = 1;
    let ringScale = 1;
    let ringOpacity = 0.5;
    let hasMoved = false;

    const render = () => {
      ringX += (x - ringX) * 0.22;
      ringY += (y - ringY) * 0.22;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${cursorScale})`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      cursorRing.style.opacity = String(ringOpacity);
      frame = 0;
    };

    const scheduleRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;

      const target = event.target instanceof Element ? event.target : null;
      const isInteractive = Boolean(target?.closest("a, button, .gallery-item, .carousel-btn, .tab-trigger, .star-btn"));
      cursorScale = isInteractive ? 2.5 : 1;
      ringScale = isInteractive ? 1.5 : 1;
      ringOpacity = isInteractive ? 0.8 : 0.5;

      if (isInteractive) {
        document.body.classList.add("cursor-focus");
      } else {
        document.body.classList.remove("cursor-focus");
      }

      if (!hasMoved) {
        hasMoved = true;
        ringX = x;
        ringY = y;
        document.body.classList.add("cursor-ready");
      }

      scheduleRender();
    };

    const handleMouseLeave = () => {
      hasMoved = false;
      document.body.classList.remove("cursor-ready");
      document.body.classList.remove("cursor-focus");
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.body.classList.remove("cursor-ready");
      document.body.classList.remove("cursor-focus");
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div id="cursor" />
      <div id="cursor-ring" />
    </>
  );
}
