"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioItem } from "@/types";
import { Star } from "lucide-react";
import "./Portfolio.css";

type GalleryFilter = "wedding" | "portrait" | "prewedding" | "all";

const filters = [
  { label: "All", value: "all" },
  { label: "Wedding", value: "wedding" },
  { label: "Portrait", value: "portrait" },
  { label: "Pre Wedding", value: "prewedding" },
] satisfies { label: string; value: GalleryFilter }[];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  // Use dynamic React hook connected to the backend API
  const { items, loading, error } = usePortfolio(activeFilter);

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxItem]);

  useEffect(() => {
    if (!lightboxItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxItem(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxItem]);

  // Loading state with gold shimmer card skeletons
  if (loading) {
    return (
      <section id="portfolio">
        <div className="portfolio-shell">
          <div className="section-top">
            <div>
              <div className="section-label">Portfolio</div>
              <h2 className="section-heading">
                Selected<br /><em className="gold">Works</em>
              </h2>
            </div>
            <div className="filter-tabs" aria-label="Portfolio filters">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  className={`filter-btn ${activeFilter === filter.value ? "active" : ""}`}
                  type="button"
                  disabled
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="gallery-item-skeleton">
                <div className="shimmer-media" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Graceful error state representation
  if (error) {
    return (
      <section id="portfolio">
        <div className="portfolio-shell">
          <div className="error-container" style={{ padding: "80px 20px", textAlign: "center", border: "1px dashed rgba(201, 168, 76, 0.2)", borderRadius: "8px", background: "rgba(250, 250, 248, 0.01)" }}>
            <p className="gold" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--gold)" }}>Could not load portfolio</p>
            <p style={{ color: "var(--text-faint)", fontSize: "14px", marginTop: "12px", fontFamily: "var(--font-body)" }}>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {lightboxItem && (
        <div className="lightbox open" onClick={() => setLightboxItem(null)}>
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setLightboxItem(null)}
            suppressHydrationWarning
            aria-label="Close portfolio image"
          >
            Close
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              className="lightbox-image"
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title}
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 92vw, 76vw"
              quality={88}
            />
            <div className="lightbox-caption" suppressHydrationWarning>
              <div className="lightbox-info">
                <span className="lightbox-category">{lightboxItem.category}</span>
                <h3 className="lightbox-title">{lightboxItem.title}</h3>
              </div>
              <div className="lightbox-meta">
                {lightboxItem.featured && (
                  <span className="lightbox-featured">
                    <Star size={10} fill="currentColor" />
                    Featured
                  </span>
                )}
                {lightboxItem.description && (
                  <span className="lightbox-exif">{lightboxItem.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="portfolio">
        <div className="portfolio-shell">
          <div className="section-top">
            <div>
              <div className="section-label">Portfolio</div>
              <h2 className="section-heading">
                Selected<br /><em className="gold">Works</em>
              </h2>
            </div>
            <div className="filter-tabs" aria-label="Portfolio filters">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  className={`filter-btn ${activeFilter === filter.value ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  suppressHydrationWarning
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-container" style={{ padding: "80px 20px", textAlign: "center", border: "1px dashed rgba(201, 168, 76, 0.15)", borderRadius: "8px", background: "rgba(250, 250, 248, 0.01)" }}>
              <p className="gold" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--gold)" }}>Portfolio coming soon</p>
              <p style={{ color: "var(--text-faint)", fontSize: "14px", marginTop: "12px", fontFamily: "var(--font-body)" }}>New visual stories are being captured. Stay tuned!</p>
            </div>
          ) : (
            <div className="gallery-grid" id="galleryGrid">
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`gallery-item ${item.featured ? "featured" : ""}`}
                  type="button"
                  onClick={() => setLightboxItem(item)}
                  aria-label={`Open ${item.title} portfolio image`}
                  suppressHydrationWarning
                >
                  <span className="gallery-top-row" suppressHydrationWarning>
                    {item.featured && (
                      <span className="featured-badge" suppressHydrationWarning>
                        <Star size={10} fill="currentColor" className="star-icon" />
                        Featured
                      </span>
                    )}
                    {item.description && (
                      <span className="exif-overlay">
                        {item.description}
                      </span>
                    )}
                  </span>
                  <span className="gallery-media">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 1024px) calc((100vw - 96px) / 2), 370px"
                      quality={82}
                      style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                  </span>
                  <span className="gallery-overlay">
                    <span className="gallery-cat">{item.category}</span>
                    <span className="gallery-title">{item.title}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
