"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Milestone {
  year: string;
  details: string;
}
const milestones: Milestone[] = [
  {
    year: "2014",
    details:
      "Foundations of Excellence Company was founded in the heart of Shenzhen’s technology hub, establishing our mission to deliver world-class manufacturing and innovation.",
  },
  {
    year: "2017",
    details:
      "Designing the Future We expanded our operations by opening our Shenzhen headquarters. This year marked our transition into an innovation-led company as we began designing in-house ODM projects, moving from sourcing to original creation.",
  },
  {
    year: "2018",
    details:
      "Product Breakthrough Our R&D team successfully developed six flagship models of advanced multiple-charging solutions, setting a new benchmark for versatility and efficiency in the charging industry.",
  },
  {
    year: "2019",
    details:
      "Manufacturing Excellence & Focus We established our dedicated factory in Dongguan and achieved the ISO9001:2000 quality management certificate. We officially centered our core mission on becoming a global leader in specialized charging solution products.",
  },
  {
    year: "2021",
    details:
      "Automated Production & Certification Our commitment to quality was solidified with 3C and CE certifications. We launched our state-of-the-art SMT (Surface Mount Technology) automated workshops, significantly increasing precision and production capacity.",
  },
  {
    year: "2022",
    details:
      "Industry Recognition Our manufacturing standards reached elite levels, leading Company to become the appointed OEM manufacturer for several world-renowned brands and industry-leading corporations.",
  },
  {
    year: "2024",
    details:
      "Customer-Centric Evolution We reaffirmed our core tenet: 'Uncompromising Quality, Unrivaled Service.' By refining our manufacturing processes, we ensured that global consumers receive the highest standard of modern power technology.",
  },
  {
    year: "2025 & Beyond",
    details:
      "Expanding Horizons As we look to the future, Ayyantech continues to expand its R&D capabilities and global logistics hubs. We remain dedicated to empowering our partners and innovating for an ever-evolving global market.",
  },
];

export default function TimelineSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleItems((prev) =>
              prev.includes(index) ? prev : [...prev, index],
            );
          }
        });
      },
      { threshold: 0.2 },
    );

    const items = document.querySelectorAll(".timeline-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-white overflow-hidden mt-2"
    >
      {/* Foreground Content Wrapper */}
      <div className="relative z-10 container">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <p className="text-3xl font-bold font-arial lg:px-6  lg:border-r">
            A Twelve-Year <br />
            Legacy of Innovation
          </p>

          {milestones.slice(0, 4).map((milestone, index) => (
            <div
              key={index}
              data-index={index}
              className="flex flex-col lg:border-r lg:px-6 timeline-item gap-4 max-w-sm lg:w-full mx-auto max-lg:pt-5 pb-2"
            >
              <h1 className="text-3xl font-semibold font-arial">
                {milestone.year}
              </h1>
              <p className={`text-sm`}>{milestone.details}</p>
            </div>
          ))}
        </div>

        <hr className="h-3 my-6 border-none rounded-r-3xl bg-gradient-to-r from-white to-[#32274e] w-full" />

        <div className="grid grid-cols-1 lg:grid-cols-5">
          {milestones.slice(4).map((milestone, index) => (
            <div
              key={index}
              data-index={index}
              className="flex flex-col justify-between lg:flex-col-reverse lg:border-r lg:px-6 timeline-item gap-4 max-w-sm lg:w-full mx-auto max-lg:pt-5 pb-2"
            >
              <h1 className="text-3xl">{milestone.year}</h1>
              <p className="text-sm">{milestone.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
