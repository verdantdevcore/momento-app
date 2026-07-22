"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div style={{ fontFamily: "var(--font-urbanist, 'Urbanist', sans-serif)" }}>
      <Navbar solid />

      {/* Header */}
      <div className="pt-28 pb-12 px-6" style={{ background: "#556B2F" }}>
        <div className="max-w-3xl mx-auto">
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#F7E7CE",
              marginBottom: "0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(247,231,206,0.6)" }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-14" style={{ background: "#fff", minHeight: "60vh" }}>
        <div
          className="max-w-3xl mx-auto"
          style={{ color: "#374151", lineHeight: 1.8 }}
        >
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "#556B2F",
          marginBottom: "0.75rem",
          paddingBottom: "0.4rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#374151",
        marginTop: "1.25rem",
        marginBottom: "0.4rem",
      }}
    >
      {children}
    </h3>
  );
}

export function Para({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: "0.95rem", color: "#4B5563", marginBottom: "0.75rem" }}>
      {children}
    </p>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: "0.95rem", color: "#4B5563", marginBottom: "0.3rem", listStyleType: "disc" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function NumberedList({ items, start = 1 }: { items: string[]; start?: number }) {
  return (
    <ol start={start} style={{ paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: "0.95rem", color: "#4B5563", marginBottom: "0.3rem", listStyleType: "decimal" }}>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "1.5rem 0" }} />;
}

export function MailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} style={{ color: "#556B2F", fontWeight: 500 }}>
      {email}
    </a>
  );
}
