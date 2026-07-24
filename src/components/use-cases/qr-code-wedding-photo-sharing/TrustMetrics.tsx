"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { SectionHeader } from "./SectionHeader";

const METRICS = [
  { value: 25000, suffix: "+", label: "Wedding QR Codes Generated", icon: "💍" },
  { value: 2000000, suffix: "+", label: "Photos Uploaded", icon: "📸", abbrev: true },
  { value: 150, suffix: "+", label: "Countries", icon: "🌍" },
  { value: 99.9, suffix: "%", label: "Upload Success Rate", icon: "✨", decimal: true },
];

function Counter({ target, suffix, decimal, abbrev, run }: { target: number; suffix: string; decimal?: boolean; abbrev?: boolean; run: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!run) return;
    const start = Date.now();
    const dur = 2000;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [run, target]);

  let display: string;
  if (decimal) display = val.toFixed(1);
  else if (abbrev && val >= 1000000) display = (val / 1000000).toFixed(val / 1000000 >= 1.95 ? 0 : 1) + "M";
  else if (val >= 1000) display = Math.round(val / 1000) + "K";
  else display = Math.round(val).toString();

  return <span>{display}{suffix}</span>;
}

export function TrustMetrics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} style={{ background: "#fff", padding: "80px 24px", borderBottom: "1px solid rgba(85,107,47,0.08)" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 56 }}>
          <SectionHeader badge="Trusted worldwide" title="The world's favourite wedding QR platform" />
        </div>

        <div className="grid metrics-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="relative overflow-hidden text-center"
              style={{ background: "linear-gradient(135deg, #fafdf7, #f4f9ee)", border: "1px solid rgba(85,107,47,0.12)", borderRadius: 20, padding: "36px 28px" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="absolute rounded-full" style={{ top: -20, right: -20, width: 80, height: 80, background: "radial-gradient(circle, rgba(85,107,47,0.06) 0%, transparent 70%)" }} />
              <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
              <div style={{ fontSize: "clamp(32px, 3vw, 48px)", color: "#556B2F", fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>
                <Counter target={m.value} suffix={m.suffix} decimal={m.decimal} abbrev={m.abbrev} run={inView} />
              </div>
              <p style={{ fontSize: 15, color: "#6b7280", fontWeight: 500, lineHeight: 1.4 }}>{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .metrics-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .metrics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
