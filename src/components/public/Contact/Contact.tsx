"use client";

import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  // Form Input States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field

  // UI Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          eventDate: eventDate || null,
          eventType: eventType || null,
          location: location || null,
          message,
          website, // honeypot payload
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        // Clear all fields
        setName("");
        setPhone("");
        setEmail("");
        setEventType("");
        setEventDate("");
        setLocation("");
        setMessage("");
        setWebsite("");
      } else {
        setSubmitError(data.error || "Kuch galat hua! Koshish karein dobara.");
      }
    } catch {
      setSubmitError("Server se connect nahi ho paya. Apna internet check karein!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <div>
        <div className="section-label reveal">Let&apos;s Create Together</div>
        <h2 className="contact-heading reveal">
          Ready to tell<br /><em>your story?</em>
        </h2>
        <p className="contact-sub reveal">
          I&apos;m currently accepting bookings for late 2025 and 2026. Dates fill up fast for wedding season. Reach out early so we can plan something beautiful together.
        </p>

        <div className="contact-info reveal">
          <div className="contact-item">
            <span className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <div className="contact-detail">
              <span>Phone / WhatsApp</span>
              <a href="https://wa.me/917037307484" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                +91 70373 07484
              </a>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <div className="contact-detail">
              <span>Email</span>
              nishanttomar0402@gmail.com
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <div className="contact-detail">
              <span>Based In</span>
              Aligarh, Uttar Pradesh · Available Worldwide
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </span>
            <div className="contact-detail">
              <span>Instagram</span>
              @lens.ofshubh
            </div>
          </div>
        </div>
      </div>

      <div>
        {submitSuccess ? (
          <div className="contact-success-card">
            <div className="success-checkmark-circle">✓</div>
            <h3 className="success-title">Vision Received!</h3>
            <p className="success-message">
              Thank you for sharing your dream! Your inquiry has been saved directly to the database. Shubham will review your wedding details and reach out to you shortly.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="form-submit"
              style={{ marginTop: "2rem", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}
              suppressHydrationWarning
            >
              Send Another Vision →
            </button>
          </div>
        ) : (
          <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
            {/* Honeypot field for bot protection */}
            <div style={{ display: "none" }} aria-hidden="true">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {submitError && (
              <div className="contact-error-banner">
                {submitError}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  required
                  suppressHydrationWarning
                />
              </div>
              <div className="form-group">
                <label>Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@email.com"
                required
                suppressHydrationWarning
              />
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                suppressHydrationWarning
              >
                <option value="">Select a service...</option>
                <option value="Wedding Photography">Wedding Photography</option>
                <option value="Pre Wedding Shoot">Pre Wedding Shoot</option>
                <option value="Cinematic Film">Cinematic Film</option>
                <option value="Portrait Session">Portrait Session</option>
                <option value="Destination Shoot">Destination Shoot</option>
                <option value="Album / Prints">Album / Prints</option>
                <option value="Other">Other</option>
              </select>
            </div>
             <div className="form-row">
              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={eventDate ? "has-value" : ""}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker();
                    } catch {}
                  }}
                  suppressHydrationWarning
                />
                <span className="date-placeholder">Select Event Date (DD-MM-YYYY)</span>
              </div>
              <div className="form-group">
                <label>Event Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Venue"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="form-group">
              <label>Tell Me About Your Vision</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your ideas, inspiration, or any details you'd like me to know..."
                required
                suppressHydrationWarning
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="form-submit"
              id="submitBtn"
              suppressHydrationWarning
            >
              {isSubmitting ? "Sending Vision..." : "Send Message →"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
