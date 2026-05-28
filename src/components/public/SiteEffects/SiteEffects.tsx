"use client";

import { useEffect } from "react";

export default function SiteEffects() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02 },
    );

    // Dynamic binder for unobserved elements
    const observeExisting = () => {
      const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.visible)"));
      reveals.forEach((el) => observer.observe(el));
    };

    observeExisting();

    // Monitor the DOM for lazy-loaded content mounting later
    const mutationObserver = new MutationObserver(() => {
      observeExisting();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    const navAnchors = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a"));

    const handleScroll = () => {
      let current = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) {
          current = section.id;
        }
      });

      navAnchors.forEach((anchor) => {
        anchor.style.color = anchor.getAttribute("href") === `#${current}` ? "var(--gold)" : "";
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
