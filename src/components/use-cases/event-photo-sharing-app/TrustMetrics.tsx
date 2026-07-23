"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const METRICS = [
  { value: 50000, suffix: "+", label: "Events Hosted" },
  { value: 5, suffix: "M+", label: "Photos Shared" },
  { value: 200, suffix: "+", label: "Countries" },
  { value: 99.9, suffix: "%", label: "Upload Success Rate", decimals: 1 },
  { value: 1, suffix: "M+", label: "Happy Guests" },
];

function CountUp({ target, suffix, decimals = 0, run }: { target: number; suffix: string; decimals?: number; run: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!run) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [run, target]);

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export function TrustMetrics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} style={{ background: "#556B2F", padding: "64px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <motion.div
          className="text-center"
          style={{ marginBottom: 48 }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#C8D8B0", letterSpacing: "1.3px", marginBottom: 8 }}>Trusted Globally</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            The numbers speak for themselves
          </h2>
        </motion.div>

        <div className="grid metrics-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem" }}>
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="text-center"
              style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 20px", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
                <CountUp target={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} run={inView} />
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0, fontWeight: 500 }}>{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .metrics-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 560px) { .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}
