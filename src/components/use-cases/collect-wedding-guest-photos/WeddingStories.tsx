"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Users, Image as ImageIcon } from "@phosphor-icons/react";
import { SectionHeader } from "./SectionHeader";

const BASE = "/use-cases/collect-wedding-guest-photos";

const stories = [
  {
    image: `${BASE}/stories-sophia-james.jpg`,
    alt: "Sophia & James wedding in Tuscany, Italy",
    guests: "180",
    memories: "2,340",
    highlight: "Found 47 photos from grandparents they'd never seen",
    story: "Three months after the wedding, we discovered James's grandfather had captured the exact moment we saw each other for the first time — a shot our photographer missed completely. We would never have found it without Momento App.",
  },
  {
    image: `${BASE}/stories-amara-david.jpg`,
    alt: "Amara & David wedding in New Orleans, Louisiana",
    guests: "240",
    memories: "3,180",
    highlight: "12 videos of moments they didn't get to see",
    story: "Guests uploaded 12 videos of the second-line through the French Quarter while we were busy greeting family. Opening the Momento App album felt like reliving every magical moment we'd missed in real time.",
  },
  {
    image: `${BASE}/stories-elena-marco.jpg`,
    alt: "Elena & Marco wedding in Santorini, Greece",
    guests: "95",
    memories: "1,567",
    highlight: "1,500+ guest memories from just 95 attendees",
    story: "My maid of honor secretly photographed me stepping into my dress — a moment I'll treasure forever. With just 95 guests, we still collected over 1,500 memories we never would have had.",
  },
];

export function WeddingStories() {
  return (
    <section id="stories" className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #F8FAF5 0%, #FDFBF7 100%)" }}>
      <div className="site-container">
        <SectionHeader
          badge="Real wedding stories"
          title="Memories couples almost never received"
          subtitle="These aren't testimonials — these are love stories told through photos couples almost never received."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stories.map((story, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500"
            >
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <Image src={story.image} alt={story.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px" />
              </div>

              <div className="flex" style={{ borderBottom: "1px solid #F0F0EC" }}>
                {[
                  { icon: Users, value: story.guests, label: "Guests", border: true },
                  { icon: ImageIcon, value: story.memories, label: "Memories", border: false },
                ].map((stat, j) => (
                  <div key={j} className="flex-1 py-4 flex flex-col items-center" style={stat.border ? { borderRight: "1px solid #F0F0EC" } : undefined}>
                    <div className="text-[#556B2F]" style={{ fontWeight: 700, fontSize: "1.3rem" }}>{stat.value}</div>
                    <div className="flex items-center gap-1 text-[#9A9A9A] mt-0.5" style={{ fontSize: "0.78rem" }}>
                      <stat.icon size={13} /> {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6">
                <div className="inline-flex items-center gap-2 rounded-full mb-4" style={{ background: "#F7E7CE", padding: "6px 12px" }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: "#556B2F" }} />
                  <span className="text-[#2C3A1E]" style={{ fontSize: "0.78rem", fontWeight: 500 }}>{story.highlight}</span>
                </div>
                <p className="text-[#3A3A3A]" style={{ fontStyle: "italic", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  &ldquo;{story.story}&rdquo;
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
