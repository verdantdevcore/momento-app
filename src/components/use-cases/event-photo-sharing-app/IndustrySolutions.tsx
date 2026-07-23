"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Briefcase, Microphone, GraduationCap, Heart, Users, MusicNotes, Check } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const INDUSTRIES = [
  {
    Icon: Briefcase,
    label: "Corporate Events",
    title: "Elevate your corporate events",
    desc: "Momento App transforms company retreats, product launches, AGMs, and team-building days into fully documented experiences. Collect photos from every department, create branded albums, and share highlights with stakeholders.",
    image: "/use-cases/event/corporate.jpg",
    imageAlt: "Corporate event gathering and photo sharing",
    benefits: ["Branded event albums", "Multi-organizer access", "Executive-ready downloads", "Post-event reports"],
  },
  {
    Icon: Microphone,
    label: "Conferences & Expo",
    title: "The ultimate conference photo platform",
    desc: "From keynotes to breakout sessions to evening receptions, Momento App captures it all. Place QR codes at every session entrance, registration desk, and booth to build a complete visual record of your conference.",
    image: "/use-cases/event/conference-stage.jpg",
    imageAlt: "Conference speaker on stage event photo sharing",
    benefits: ["Per-session albums", "Booth-specific albums", "Speaker photo collections", "Sponsor-ready content"],
  },
  {
    Icon: GraduationCap,
    label: "Education",
    title: "For universities & schools",
    desc: "Graduation ceremonies, school plays, sports events, science fairs — Momento App helps educational institutions create lasting digital archives. Let families contribute their perspective alongside official photography.",
    image: "/use-cases/event/graduation.jpg",
    imageAlt: "Graduation ceremony event photo sharing",
    benefits: ["Graduation albums", "Parent-friendly upload", "Archival storage", "Privacy controls"],
  },
  {
    Icon: Heart,
    label: "Non-Profit Events",
    title: "Power your fundraising with photos",
    desc: "Turn your charity galas, community fundraisers, and awareness events into compelling visual stories. Use attendee photos in donor reports, social campaigns, and future fundraising materials.",
    image: "/use-cases/event/charity-gala.jpg",
    imageAlt: "Charity fundraiser event photo collection",
    benefits: ["Donor-facing albums", "Social media exports", "Event documentation", "Impact storytelling"],
  },
  {
    Icon: Users,
    label: "Community Events",
    title: "Unite your community through photos",
    desc: "Neighborhood gatherings, cultural festivals, religious programs, and civic events deserve to be remembered. Momento App makes it easy for entire communities to contribute to a shared visual memory.",
    image: "/use-cases/event/reunion.jpg",
    imageAlt: "Community gathering event photo sharing",
    benefits: ["Open community uploads", "Neighborhood albums", "Cultural event archives", "Easy sharing"],
  },
  {
    Icon: MusicNotes,
    label: "Entertainment",
    title: "Festivals, concerts & live events",
    desc: "Capture the energy of live events from every angle. Momento App lets festival organizers and concert promoters build massive crowd-sourced albums that can be used for press, marketing, and social media.",
    image: "/use-cases/event/festival.jpg",
    imageAlt: "Music festival crowd event photography sharing",
    benefits: ["Crowd-sourced coverage", "Press-ready downloads", "Social media integration", "Fan engagement"],
  },
];

export function IndustrySolutions() {
  const [active, setActive] = useState(0);
  const current = INDUSTRIES[active];

  return (
    <section id="industries" style={{ background: "#fff", padding: "96px 24px" }}>
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 56 }}>
          <SectionHeader badge="Industry solutions" title="Built for your industry" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center" style={{ gap: 8, marginBottom: 48 }}>
          {INDUSTRIES.map((ind, i) => {
            const on = active === i;
            return (
              <button
                key={ind.label}
                onClick={() => setActive(i)}
                className="inline-flex items-center gap-2"
                style={{ padding: "10px 20px", borderRadius: 100, border: on ? "1.5px solid #556B2F" : "1.5px solid #e5e5e5", background: on ? "#556B2F" : "#fff", color: on ? "#fff" : "#4a4a4a", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
              >
                <span style={{ opacity: on ? 1 : 0.6 }}><ind.Icon size={18} weight="regular" /></span>
                {ind.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={active}
          className="grid items-center industry-content"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "4rem" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, color: "#1A1A1A", marginBottom: 16, lineHeight: 1.3 }}>{current.title}</h3>
            <p style={{ fontSize: 16, color: "#5A5A5A", lineHeight: 1.75, marginBottom: 28 }}>{current.desc}</p>
            <ul className="flex flex-col" style={{ listStyle: "none", padding: 0, margin: 0, gap: 12 }}>
              {current.benefits.map((b) => (
                <li key={b} className="flex items-center" style={{ gap: 12 }}>
                  <span className="flex items-center justify-center shrink-0 rounded-full" style={{ width: 22, height: 22, background: "#eef2e8" }}>
                    <Check size={12} weight="bold" color="#556B2F" />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#3a3a3a" }}>{b}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2"
                style={{ background: "#556B2F", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
              >
                Start Free for {current.label} &rarr;
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden" style={{ borderRadius: 20, height: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <Image src={current.image} alt={current.imageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) { .industry-content { grid-template-columns: 1fr !important; gap: 2rem !important; } }
      `}</style>
    </section>
  );
}
