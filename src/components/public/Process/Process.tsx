import React from "react";
import "./Process.css";

export default function Process() {
  const steps = [
    { num: "01", title: "Discovery Call", desc: "We hop on a quick call to understand your vision, event details, and expectations." },
    { num: "02", title: "Book & Plan", desc: "Lock your date with a booking advance. I send a detailed questionnaire to plan every shot." },
    { num: "03", title: "The Shoot Day", desc: "I arrive early, blend into your celebration, and capture every real, raw moment." },
    { num: "04", title: "Delivery", desc: "Edited photos in 30 days via a private online gallery. Videos within 60 days." }
  ];

  return (
    <section id="process">
      <div className="section-label reveal">How It Works</div>
      <h2 className="section-heading reveal">Simple <em className="gold">Process</em></h2>

      <div className="process-steps">
        {steps.map((st) => (
          <div key={st.num} className="process-step reveal">
            <div className="step-num">{st.num}</div>
            <div className="step-title">{st.title}</div>
            <div className="step-desc">{st.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
