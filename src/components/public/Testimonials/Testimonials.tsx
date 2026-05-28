"use client";

import Image from "next/image";
import { useState } from "react";
import { useTestimonials } from "@/hooks/useTestimonials";
import "./Testimonials.css";

export default function Testimonials() {
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formReview, setFormReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { testimonials: dbTestimonials, loading, error } = useTestimonials();
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formReview) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formName,
          rating: formRating,
          review: formReview,
          imageUrl: null,
          type: "standard",
          extraData: null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormName("");
        setFormReview("");
        setFormRating(5);
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 6000);
      }
    } catch (err) {
      console.error("Testimonial submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all testimonials (WhatsApp, Instagram, Standard) to show in one single unified grid
  const allReviews = dbTestimonials;

  const getClientAvatar = (name: string, id: string) => {
    // Curated high-quality, professional couple/portrait photos from Unsplash
    const premiumAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", // Female 1
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", // Male 1
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", // Female 2
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80", // Male 2
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80", // Female 3
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80", // Male 3
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", // Female 4
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80", // Male 4
    ];
    let hash = 0;
    const str = (name || "") + (id || "");
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % premiumAvatars.length;
    return premiumAvatars[index];
  };

  const cleanReviewText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/GK Studio Family/gi, "Team")
      .replace(/GK Studio/gi, "Shubham Singh")
      .replace(/Gk Studio/gi, "Shubham Singh")
      .replace(/gkstudio/gi, "shubhamsingh")
      .replace(/@gkstudio_/gi, "@lens.of.shubh")
      .replace(/@gkstudio/gi, "@lens.of.shubh")
      .replace(/——|—|--/g, " ")
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
  };

  // Helper to split and replicate testimonials for seamless vertical scroll looping
  const getColumnTestimonials = (items: typeof dbTestimonials, colIndex: number) => {
    // Split by column index
    const colItems = items.filter((_, idx) => idx % 3 === colIndex);
    if (colItems.length === 0) return [];
    
    // Ensure we have enough items (at least 6 cards) inside the column so the scrolling track is long enough
    let expanded = [...colItems];
    while (expanded.length < 6) {
      expanded = [...expanded, ...colItems];
    }
    // Duplicate the final set once more to establish the seamless loop at translateY(-50%)
    return [...expanded, ...expanded];
  };

  const col1 = getColumnTestimonials(allReviews, 0);
  const col2 = getColumnTestimonials(allReviews, 1);
  const col3 = getColumnTestimonials(allReviews, 2);

  return (
    <section id="testimonials">

      {/* ── Zone 1: Simplified Premium Section Header ── */}
      <div className="testimonials-section-header">
        <div className="section-label reveal">Client Love</div>
        <h2 className="section-heading reveal">
          Stories of<br />
          <em className="gold">Real Trust</em>
        </h2>
        <p className="testimonials-subtitle reveal">
          Not curated highlights: raw, real feedback from clients who trusted me to preserve their most cherished memories.
        </p>
      </div>

      {/* ── Zone 2: Unified Testimonials Vertical Marquee columns ── */}
      <div className="wol-section">
        {loading ? (
          <div className="wol-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="wol-skeleton">
                <div className="wol-skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="wol-error-msg">Failed to load testimonials. Please try again.</div>
        ) : allReviews.length > 0 ? (
          <div className="wol-marquee-mask">
            <div className="wol-marquee-grid">
              
              {/* Column 1: Upward Scroll */}
              <div className="wol-marquee-column">
                <div className="wol-marquee-track wol-scroll-up">
                  {col1.map((t, idx) => {
                    const cleanedText = cleanReviewText(t.review);
                    const avatar = getClientAvatar(t.clientName, t.id);
                    return (
                      <div key={`${t.id}-c1-${idx}`} className="wol-card">
                        <span className="wol-card-quote-icon">&ldquo;</span>
                        <div className="wol-card-header">
                          <div className="wol-author-info">
                            <div className="wol-avatar-wrap">
                              <Image
                                src={avatar}
                                alt={t.clientName}
                                width={44}
                                height={44}
                                className="wol-avatar-img"
                              />
                            </div>
                            <div className="wol-meta">
                              <span className="wol-author-name">{t.clientName}</span>
                              <div className="wol-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={`wol-star ${i < t.rating ? "active" : "inactive"}`}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="wol-card-body">
                          <p className="wol-text">&ldquo;{cleanedText}&rdquo;</p>
                        </div>
                        {(t.imageUrl || (t.type && t.type.toLowerCase() !== "standard")) && (
                          <div className="wol-card-footer">
                            {t.type && t.type.toLowerCase() !== "standard" && (
                              <span className={`wol-platform-badge ${t.type.toLowerCase().replace(/\s+/g, "-")}`}>
                                {t.type}
                              </span>
                            )}
                            {t.imageUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProofUrl(t.imageUrl || null);
                                }}
                                className="wol-proof-btn"
                              >
                                View Proof
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Downward Scroll */}
              <div className="wol-marquee-column">
                <div className="wol-marquee-track wol-scroll-down">
                  {col2.map((t, idx) => {
                    const cleanedText = cleanReviewText(t.review);
                    const avatar = getClientAvatar(t.clientName, t.id);
                    return (
                      <div key={`${t.id}-c2-${idx}`} className="wol-card">
                        <span className="wol-card-quote-icon">&ldquo;</span>
                        <div className="wol-card-header">
                          <div className="wol-author-info">
                            <div className="wol-avatar-wrap">
                              <Image
                                src={avatar}
                                alt={t.clientName}
                                width={44}
                                height={44}
                                className="wol-avatar-img"
                              />
                            </div>
                            <div className="wol-meta">
                              <span className="wol-author-name">{t.clientName}</span>
                              <div className="wol-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={`wol-star ${i < t.rating ? "active" : "inactive"}`}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="wol-card-body">
                          <p className="wol-text">&ldquo;{cleanedText}&rdquo;</p>
                        </div>
                        {(t.imageUrl || (t.type && t.type.toLowerCase() !== "standard")) && (
                          <div className="wol-card-footer">
                            {t.type && t.type.toLowerCase() !== "standard" && (
                              <span className={`wol-platform-badge ${t.type.toLowerCase().replace(/\s+/g, "-")}`}>
                                {t.type}
                              </span>
                            )}
                            {t.imageUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProofUrl(t.imageUrl || null);
                                }}
                                className="wol-proof-btn"
                              >
                                View Proof
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Upward Scroll */}
              <div className="wol-marquee-column">
                <div className="wol-marquee-track wol-scroll-up">
                  {col3.map((t, idx) => {
                    const cleanedText = cleanReviewText(t.review);
                    const avatar = getClientAvatar(t.clientName, t.id);
                    return (
                      <div key={`${t.id}-c3-${idx}`} className="wol-card">
                        <span className="wol-card-quote-icon">&ldquo;</span>
                        <div className="wol-card-header">
                          <div className="wol-author-info">
                            <div className="wol-avatar-wrap">
                              <Image
                                src={avatar}
                                alt={t.clientName}
                                width={44}
                                height={44}
                                className="wol-avatar-img"
                              />
                            </div>
                            <div className="wol-meta">
                              <span className="wol-author-name">{t.clientName}</span>
                              <div className="wol-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={`wol-star ${i < t.rating ? "active" : "inactive"}`}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="wol-card-body">
                          <p className="wol-text">&ldquo;{cleanedText}&rdquo;</p>
                        </div>
                        {(t.imageUrl || (t.type && t.type.toLowerCase() !== "standard")) && (
                          <div className="wol-card-footer">
                            {t.type && t.type.toLowerCase() !== "standard" && (
                              <span className={`wol-platform-badge ${t.type.toLowerCase().replace(/\s+/g, "-")}`}>
                                {t.type}
                              </span>
                            )}
                            {t.imageUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProofUrl(t.imageUrl || null);
                                }}
                                className="wol-proof-btn"
                              >
                                View Proof
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="wol-empty-msg">No approved reviews yet. Be the first to share your journey!</div>
        )}
      </div>

      {/* ── Zone 3: CTA & Embedded Feedback Form ── */}
      <div className="testimonials-cta-section reveal">
        <div className="cta-info-column">
          <div className="section-label">Share Your Story</div>
          <h3 className="cta-heading">Captured A Special<br /><em>Memory With Me?</em></h3>
          <p className="cta-sub">
            Loved working with me? Leave your rating and write a short review directly on the website. Your feedback helps others find their perfect photographer and means the world to me!
          </p>
        </div>

        <div className="cta-form-column">
          {submitSuccess ? (
            <div className="success-feedback-msg">
              <div className="success-checkmark-circle">✓</div>
              <h3 className="success-title">Thank you for sharing!</h3>
              <p className="success-sub">
                Your beautiful experience has been recorded. It will be published on the Wall of Love once approved.
              </p>
              <button onClick={() => setSubmitSuccess(false)} className="form-submit" style={{ marginTop: "1.5rem", padding: "0.85rem 1.55rem" }}>
                Submit Another Review →
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="feedback-direct-form">
              <div className="rating-container">
                <span className="rating-label">Your Rating</span>
                <div className="rating-stars-row">
                  <div className="rating-stars-input" aria-label="Select rating stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${(hoverRating !== null ? hoverRating >= star : formRating >= star) ? "active" : ""}`}
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        suppressHydrationWarning
                        aria-label={`Rate ${star} star`}
                      >★</button>
                    ))}
                  </div>
                  <span className="rating-phrase" suppressHydrationWarning>
                    {hoverRating !== null 
                      ? hoverRating === 5 ? "Pure Magic! ★★★★★"
                        : hoverRating === 4 ? "Amazing Experience! ★★★★☆"
                        : hoverRating === 3 ? "Great Experience! ★★★☆☆"
                        : hoverRating === 2 ? "Good Effort ★★☆☆☆"
                        : "Needs Improvement ★☆☆☆☆"
                      : formRating === 5 ? "Pure Magic! ★★★★★"
                        : formRating === 4 ? "Amazing Experience! ★★★★☆"
                        : formRating === 3 ? "Great Experience! ★★★☆☆"
                        : formRating === 2 ? "Good Effort ★★☆☆☆"
                        : "Needs Improvement ★☆☆☆☆"
                    }
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Neha Verma"
                  required
                  suppressHydrationWarning
                />
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  placeholder="Write your beautiful experience here..."
                  required
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="form-submit"
                suppressHydrationWarning
              >
                {isSubmitting ? "Submitting..." : "Submit Experience →"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox Proof Modal */}
      {selectedProofUrl && (
        <div
          className="wol-lightbox-overlay"
          onClick={() => setSelectedProofUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="wol-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="wol-lightbox-close"
              onClick={() => setSelectedProofUrl(null)}
              aria-label="Close proof"
            >
              ✕
            </button>
            <div className="wol-lightbox-header">
              <span className="wol-lightbox-title">Verification Proof</span>
              <span className="wol-lightbox-subtitle">Original feedback screenshot from client</span>
            </div>
            <div className="wol-lightbox-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProofUrl}
                alt="Client Feedback Verification Proof"
                className="wol-lightbox-img"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
