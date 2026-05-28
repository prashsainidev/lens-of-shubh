"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSiteAsset } from "@/hooks/useSiteAsset";
import { Camera } from "lucide-react";
import "./About.css";

export default function About() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { asset: asset1, loading: loading1 } = useSiteAsset("about-photo-1");
  const { asset: asset2, loading: loading2 } = useSiteAsset("about-photo-2");

  const images = [asset1?.imageUrl, asset2?.imageUrl].filter(Boolean) as string[];

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const isLoading = loading1 || loading2;

  return (
    <section id="about">
      <div className="about-text">
        <div className="section-label">About Me</div>

        <h2 className="about-heading reveal">
          Light, Lens &<br /> <em>Pure Emotion</em>
        </h2>

        <p className="reveal">
          Hey, I&apos;m <strong style={{ color: "var(--cream)" }}>Shubham Singh</strong>, a passionate photographer based in Aligarh with over 3 years of experience capturing life&apos;s most beautiful and unscripted moments.
        </p>
        <p className="reveal">
          My journey began with a simple love of light and how it transforms ordinary scenes into extraordinary memories.
          Whether it&apos;s the quiet tear before the pheras, or the laughter at a haldi ceremony, every single moment has
          a story worth telling.
        </p>
        <p className="reveal">
          I work across weddings, pre weddings, portraits, and editorial shoots. Clients trust me for my calm presence,
          attention to detail, and the warmth I bring to every session.
        </p>

        <div className="about-skills reveal">
          <span className="skill-tag">Wedding</span>
          <span className="skill-tag">Pre Wedding</span>
          <span className="skill-tag">Portrait</span>
          <span className="skill-tag">Editorial</span>
          <span className="skill-tag">Cinematography</span>
          <span className="skill-tag">Events</span>
        </div>
      </div>

      <div className="about-image-wrap reveal">
        <div className="about-image-container">
          {isLoading ? (
            <div className="about-shimmer" />
          ) : images.length === 0 ? (
            <div className="about-placeholder" suppressHydrationWarning>
              <Camera className="about-camera-icon" />
            </div>
          ) : (
            images.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt={idx === 0 ? "Shubham Singh | Photographer" : "Shubham Singh | Visual Storyteller"}
                className={idx === activeIdx ? "active" : ""}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
