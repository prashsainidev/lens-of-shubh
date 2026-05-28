"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSiteAsset } from "@/hooks/useSiteAsset";
import "./Hero.css";

export default function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { asset, loading } = useSiteAsset("hero-bg");

  return (
    <section id="hero">
      <div className={`hero-bg${imageLoaded ? " loaded" : ""}`} id="heroBg">
        {!loading && asset?.imageUrl && (
          <Image
            src={asset.imageUrl}
            alt={asset.altText || "Shubham Singh Hero Background"}
            fill
            priority
            quality={90}
            onLoad={() => setImageLoaded(true)}
            className={`hero-bg-img ${imageLoaded ? "image-visible" : ""}`}
          />
        )}
      </div>

      <div className="hero-content">
        <div className="hero-brand-block">
          <div className="hero-eyebrow">
            <span>Based in Aligarh - Available Worldwide</span>
          </div>

          <h1 className="hero-title">
            Shubham Singh <br />
            <em>Light and Emotion</em>
          </h1>
        </div>

        <p className="hero-sub">
          Capturing the poetry of human emotion through weddings, portraits, and moments that deserve to live forever. Every frame is a feeling.
        </p>

        <div className="hero-actions-block">
          <div className="hero-cta">
            <a href="#portfolio" className="btn-primary">View Portfolio</a>
            <a href="#contact" className="btn-outline">Book a Session</a>
          </div>

          <div className="hero-socials">
            <a href="https://www.instagram.com/lens.ofshubh" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="mailto:nishanttomar0402@gmail.com" className="social-link" title="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
            <a href="https://wa.me/917037307484" className="social-link" target="_blank" rel="noopener noreferrer" title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <div className="stat-num">3+</div>
          <div className="stat-label">Years of Experience</div>
        </div>
        <div className="stat">
          <div className="stat-num">150+</div>
          <div className="stat-label">Events Covered</div>
        </div>
        <div className="stat">
          <div className="stat-num">500+</div>
          <div className="stat-label">Happy Clients</div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span className="scroll-mouse">
          <span className="scroll-wheel"></span>
        </span>
        <span className="scroll-line"></span>
      </div>
    </section>
  );
}
