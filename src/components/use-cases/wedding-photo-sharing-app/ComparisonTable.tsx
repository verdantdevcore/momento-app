"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, X } from "@phosphor-icons/react";
import { SectionHeading } from "../shared/SectionHeading";

const RIVALS = ["WhatsApp", "Google Drive", "AirDrop", "Email"];

// `true`/`false` render as the tick and cross pills; a string renders as a
// caveat chip, which is how the design qualifies the partial answers.
const ROWS: { feature: string; momento: true | string; rivals: (boolean | string)[] }[] = [
  { feature: "No app download required", momento: true, rivals: [true, true, false, true] },
  { feature: "Unlimited photo uploads", momento: true, rivals: [false, true, false, false] },
  { feature: "Video uploads", momento: true, rivals: ["Limited", true, true, false] },
  { feature: "Private shared album", momento: true, rivals: [false, false, false, false] },
  { feature: "High-resolution originals", momento: true, rivals: [false, true, true, false] },
  { feature: "Custom QR code", momento: true, rivals: [false, false, false, false] },
  { feature: "Real-time uploads", momento: true, rivals: [true, false, true, false] },
  { feature: "Easy bulk download", momento: true, rivals: [false, true, false, false] },
  { feature: "Works internationally", momento: true, rivals: ["Depends", true, false, true] },
  { feature: "Permanent storage", momento: true, rivals: [false, true, false, false] },
  { feature: "Branded experience", momento: true, rivals: [false, false, false, false] },
  { feature: "Guest upload limit", momento: "Unlimited", rivals: ["25MB/file", "15 GB free", "Limited", "25MB/file"] },
];

function Mark({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span
        className="inline-block rounded-full"
        style={{ background: "#F0F0EE", color: "#7A7A7A", fontSize: "0.75rem", lineHeight: "16px", padding: "4px 10px" }}
      >
        {value}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: 22, height: 22, background: value ? "#E8F0D8" : "#FDEAEA" }}
      aria-label={value ? "Yes" : "No"}
    >
      {value ? <Check size={12} weight="bold" color="#6B8A3A" /> : <X size={12} weight="bold" color="#E06B6B" />}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-28 bg-white">
      <div className="site-container">
        <SectionHeading
          badge="The clear choice"
          title={
            <>
              Why choose <span style={{ color: "#556B2F" }}>Momento App</span>
            </>
          }
          subtitle="See how Momento App compares to other photo sharing methods couples use."
        />

        <motion.div
          className="mt-16 overflow-x-auto"
          style={{ borderRadius: 20, border: "1.36px solid #EFE7DB" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <table className="w-full border-collapse" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th
                  className="text-left"
                  style={{ background: "#FDFAF6", padding: "22px 24px", fontSize: "0.75rem", fontWeight: 500, color: "#9A9A9A", letterSpacing: "1.2px" }}
                >
                  FEATURE
                </th>
                <th style={{ background: "#556B2F", padding: "16px 20px" }}>
                  <span className="block" style={{ fontSize: "0.625rem", fontWeight: 700, color: "#D8E4C0", letterSpacing: "0.8px", lineHeight: "14px" }}>
                    BEST CHOICE
                  </span>
                  <span className="block" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#fff", lineHeight: "22px" }}>
                    Momento App
                  </span>
                </th>
                {RIVALS.map((r) => (
                  <th
                    key={r}
                    style={{ background: "#FDFAF6", padding: "22px 20px", fontSize: "0.9375rem", fontWeight: 600, color: "#3A3A3A" }}
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, i) => {
                const striped = i % 2 === 1;
                return (
                  <tr key={row.feature} style={{ background: striped ? "#FDFAF6" : "#fff", borderTop: "1.36px solid #F2ECE2" }}>
                    <th
                      scope="row"
                      className="text-left"
                      style={{ padding: "18px 24px", fontSize: "0.875rem", fontWeight: 400, color: "#3A3A3A", lineHeight: "20px" }}
                    >
                      {row.feature}
                    </th>
                    <td className="text-center" style={{ padding: "18px 20px", background: striped ? "#F4F1E7" : "#F8F6EF" }}>
                      {row.momento === true ? (
                        <span
                          className="inline-flex items-center justify-center rounded-full"
                          style={{ width: 24, height: 24, background: "#556B2F" }}
                          aria-label="Yes"
                        >
                          <Check size={13} weight="bold" color="#fff" />
                        </span>
                      ) : (
                        <span
                          className="inline-block rounded-full"
                          style={{ background: "#556B2F", color: "#fff", fontSize: "0.75rem", fontWeight: 600, lineHeight: "16px", padding: "4px 12px" }}
                        >
                          {row.momento}
                        </span>
                      )}
                    </td>
                    {row.rivals.map((value, r) => (
                      <td key={RIVALS[r]} className="text-center" style={{ padding: "18px 20px" }}>
                        <Mark value={value} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: "#556B2F",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "16px 32px",
              textDecoration: "none",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
            }}
          >
            Start Free — No Card Required
          </Link>
        </div>
      </div>
    </section>
  );
}
