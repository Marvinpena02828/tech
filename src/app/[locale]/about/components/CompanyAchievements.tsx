"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Achievement {
  id: number;
  stats: string;
  label: string;
  description?: string;
  image_url: string;
  sort_order: number;
}

export default function CompanyAchievements() {
  const supabase = createClient();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("company_achievements")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  if (loading || achievements.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-8 relative overflow-hidden bg-white mt-2"
    >
      <div className="container relative z-10">
        <h1 className="heading text-center text-black mb-8">
          Our Milestones in Excellence
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <Link
              href={`/achievements#achievement-${index}`}
              key={achievement.id}
              className="text-center flex items-start gap-2 w-fit text-[#3A2E59]"
            >
              {/* Icon */}
              <div className="relative w-24 h-24 shrink-0 overflow-hidden aspect-square rounded-full group hover:bg-primary-blue">
                <Image
                  src={achievement.image_url}
                  alt={achievement.label}
                  fill
                  className="object-center aspect-square group-hover:brightness-0 group-hover:invert transition-colors duration-300"
                />
              </div>

              <div className="text-left">
                {/* Stats */}
                <h3 className="font-bold text-4xl">{achievement.stats}</h3>

                {/* Label */}
                <p className="text-sm font-semibold">{achievement.label}</p>
                {achievement.description && (
                  <p className="text-xs">{achievement.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
