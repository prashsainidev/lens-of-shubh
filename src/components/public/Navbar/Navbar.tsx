"use client";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav id="navbar" className={`${isScrolled ? "scrolled" : ""} ${isOpen ? "menu-open" : ""}`}>
      <a href="#hero" className="nav-logo" onClick={() => setIsOpen(false)}>LENS OF SHUBH</a>
      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        {/* Mobile Menu Logo & Brand Header */}
        <div className="mobile-menu-brand">
          <svg className="menu-camera-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>

        <li><a href="#about" onClick={() => setIsOpen(false)}>About</a></li>
        <li><a href="#portfolio" onClick={() => setIsOpen(false)}>Portfolio</a></li>
        <li><a href="#services" onClick={() => setIsOpen(false)}>Services</a></li>
        <li><a href="#testimonials" onClick={() => setIsOpen(false)}>Stories</a></li>
        <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
      </ul>
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        suppressHydrationWarning
      >
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
