"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Milestone {
  id: number;
  year: string;
  details: string;
  sort_order: number;
}

export default function TimelineSection() {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from("timeline_milestones")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleItems((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = document.querySelectorAll(".timeline-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [milestones]);

  if (loading || milestones.length === 0) {
    return null;
  }

  const firstHalf = milestones.slice(0, Math.ceil(milestones.length / 2));
  const secondHalf = milestones.slice(Math.ceil(milestones.length / 2));

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-white overflow-hidden mt-2"
    >
      {/* First Row */}
      <div className="relative z-10 container">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <p className="text-3xl font-bold font-arial lg:px-6 lg:border-r">
            A Twelve-Year <br />
            Legacy of Innovation
          </p>

          {firstHalf.map((milestone, index) => (
            <div
              key={milestone.id}
              data-index={index}
              className="flex flex-col lg:border-r lg:px-6 timeline-item gap-4 max-w-sm lg:w-full mx-auto max-lg:pt-5 pb-2"
            >
              <h1 className="text-3xl font-semibold font-arial">
                {milestone.year}
              </h1>
              <p className="text-sm">{milestone.details}</p>
            </div>
          ))}
        </div>

        <hr className="h-3 my-6 border-none rounded-r-3xl bg-gradient-to-r from-white to-[#32274e] w-full" />

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {secondHalf.map((milestone, index) => (
            <div
              key={milestone.id}
              data-index={firstHalf.length + index}
              className="flex flex-col justify-between lg:flex-col-reverse lg:border-r lg:px-6 timeline-item gap-4 max-w-sm lg:w-full mx-auto max-lg:pt-5 pb-2"
            >
              <h1 className="text-3xl font-arial">{milestone.year}</h1>
              <p className="text-sm">{milestone.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
