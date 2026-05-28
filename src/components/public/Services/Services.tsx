"use client";
import { useServices } from "@/hooks/useServices";
import "./Services.css";

export default function Services() {
  const { services, loading, error } = useServices();

  // Loading state with card skeletons
  if (loading) {
    return (
      <section id="services">
        <div className="section-label reveal">What I Offer</div>
        <h2 className="section-heading reveal">
          Services &<br />
          <em className="gold">Packages</em>
        </h2>

        <div className="services-grid">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="service-card-skeleton">
              <div className="shimmer-block num-shimmer" />
              <div className="shimmer-block title-shimmer" />
              <div className="shimmer-block desc-shimmer" />
              <div className="shimmer-block features-shimmer" />
              <div className="shimmer-block price-shimmer" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Graceful error representation
  if (error) {
    return (
      <section id="services">
        <div className="section-label reveal">What I Offer</div>
        <h2 className="section-heading reveal">
          Services &<br />
          <em className="gold">Packages</em>
        </h2>

        <div className="error-container" style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed rgba(201, 168, 76, 0.2)", borderRadius: "8px", background: "rgba(250, 250, 248, 0.01)", marginTop: "40px" }}>
          <p className="gold" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--gold)" }}>Could not load services</p>
          <p style={{ color: "var(--text-faint)", fontSize: "14px", marginTop: "12px", fontFamily: "var(--font-body)" }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services">
      <div className="section-label reveal">What I Offer</div>
      <h2 className="section-heading reveal">
        Services &<br />
        <em className="gold">Packages</em>
      </h2>

      {services.length === 0 ? (
        <div className="empty-container" style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed rgba(201, 168, 76, 0.15)", borderRadius: "8px", background: "rgba(250, 250, 248, 0.01)", marginTop: "40px" }}>
          <p className="gold" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--gold)" }}>Services coming soon</p>
          <p style={{ color: "var(--text-faint)", fontSize: "14px", marginTop: "12px", fontFamily: "var(--font-body)" }}>Packages are currently being structured. Stay tuned!</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((srv, idx) => {
            // Generate standard double-digit number
            const numStr = String(idx + 1).padStart(2, "0");
            
            return (
              <div key={srv.id} className="service-card">
                {srv.popular && <span className="popular-badge">Most Popular</span>}
                <div className="service-num">{numStr}</div>
                <div className="service-title">{srv.title}</div>
                <div className="service-desc">{srv.description}</div>
                
                {srv.features && srv.features.length > 0 && (
                  <ul className="service-features">
                    {srv.features.map((feat, fIdx) => (
                      <li key={fIdx}>
                        <span className="feat-bullet">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="service-price">{srv.price}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
