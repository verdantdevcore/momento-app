"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Icon } from "@phosphor-icons/react";
import { X, Check, ChatCircle, DeviceMobile, Clock, SmileySad, Heart, Image as ImageIcon, DownloadSimple, LockSimple } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const before: { icon: Icon; text: string }[] = [
  { icon: DeviceMobile, text: "Memories trapped on hundreds of personal phones" },
  { icon: ChatCircle, text: "Videos lost in chat groups, never found" },
  { icon: Clock, text: "Guests forget to send photos days later" },
  { icon: SmileySad, text: "Couples receive only a fraction of what was captured" },
  { icon: X, text: "Irreplaceable candid moments lost forever" },
];

const after: { icon: Icon; text: string }[] = [
  { icon: Heart, text: "Every guest's photos collected in one beautiful album" },
  { icon: ImageIcon, text: "Candid videos and photos preserved permanently" },
  { icon: Check, text: "Guests upload instantly during or after the wedding" },
  { icon: DownloadSimple, text: "All memories available to download anytime" },
  { icon: LockSimple, text: "Private, secure album only you control" },
];

const stats = [
  { value: "97%", label: "of guest photos never shared with the couple" },
  { value: "3 days", label: "before guests forget to send photos" },
  { value: "200+", label: "average photos captured per guest" },
  { value: "1 album", label: "where every memory lives with Momento" },
];

export function MissingMemories() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #FBF4E4 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The problem"
          title="The most meaningful photos are often the ones you never receive"
          subtitle="After your wedding, most couples only see a fraction of the moments their guests captured. The rest stay trapped on phones forever."
        />

        <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl p-7 md:p-9 bg-white shadow-sm"
            style={{ border: "1px solid #FCE7E7" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#FDECEC" }}>
                <X size={20} className="text-[#E27878]" weight="bold" />
              </span>
              <div>
                <p style={{ color: "#D98A8A", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>WITHOUT MOMENTO APP</p>
                <h3 className="text-[#1A2410]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Memories Disappear</h3>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 176 }}>
              <Image src={`${BASE}/missing-scattered.jpg`} alt="Wedding moments scattered across different devices" fill className="object-cover" sizes="(max-width: 768px) 100vw, 560px" />
            </div>

            <ul className="space-y-3">
              {before.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center rounded-full shrink-0 mt-0.5" style={{ width: 24, height: 24, background: "#FDECEC" }}>
                    <item.icon size={13} className="text-[#E27878]" />
                  </span>
                  <span className="text-[#5A5A5A]" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-3xl p-7 md:p-9 shadow-sm"
            style={{ background: "#F8FAF5", border: "1px solid rgba(85,107,47,0.18)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "rgba(85,107,47,0.12)" }}>
                <Check size={20} className="text-[#556B2F]" weight="bold" />
              </span>
              <div>
                <p style={{ color: "#556B2F", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>WITH MOMENTO APP</p>
                <h3 className="text-[#1A2410]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Every Memory Preserved</h3>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 176 }}>
              <Image src={`${BASE}/missing-album.jpg`} alt="Beautiful wedding album with all guest photos collected" fill className="object-cover" sizes="(max-width: 768px) 100vw, 560px" />
            </div>

            <ul className="space-y-3">
              {after.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center rounded-full shrink-0 mt-0.5" style={{ width: 24, height: 24, background: "rgba(85,107,47,0.12)" }}>
                    <item.icon size={13} className="text-[#556B2F]" />
                  </span>
                  <span className="text-[#3A3A3A]" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-8 md:p-10"
          style={{ background: "linear-gradient(135deg, #556B2F 0%, #3D5220 100%)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ color: "#F7E7CE", fontWeight: 800, fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", lineHeight: 1.1, marginBottom: 6 }}>{stat.value}</div>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", lineHeight: 1.4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
