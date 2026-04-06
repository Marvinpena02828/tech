"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  UserStar,
  Handshake,
  Smile,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Achievement {
  stats: string;
  label: string;
  image: string;
  description?: string;
}

export default function CompanyAchievements() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const achievements: Achievement[] = [
    {
      stats: "12+",

      label: "Years of Industry Mastery",
      image: "/about/experience.png",
      description:
        "A decade of refining our craft in the power and charging solution sector.",
    },
    {
      stats: "100%",
      label: "Commitment to Satisfaction",
      image: "/about/satisfaction.png",
      description:
        "A flawless track record of delivering quality and reliability to our global partners.",
    },
    {
      stats: "150+",
      label: "Strategic Brand Partnerships",
      image: "/about/brand.png",
      description:
        "Trusted by over 150 global brands to bring their product visions to life.",
    },
    {
      stats: "50+",
      label: "Intellectual Property Rights",
      image: "/about/intellectual.png",
      description:
        "Driven by innovation, protected by over 50 patents and proprietary designs.",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
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
          {achievements.map((achievement, index) => {
            return (
              <Link
                href={`/achievements#achivement-${index}`}
                key={index}
                className="text-center flex items-start gap-2 w-fit text-[#3A2E59]"
              >
                {/* Icon */}
                <div className="relative w-24 h-24 shrink-0 overflow-hidden aspect-square rounded-full group hover:bg-primary-blue">
                  <Image
                    src={achievement.image}
                    alt="icon"
                    fill
                    className="object-center aspect-square group-hover:brightness-0 group-hover:invert transition-colors duration-30"
                  />
                </div>

                <div className="text-left">
                  {/* Stats */}
                  <h3 className="font-bold text-4xl">{achievement.stats}</h3>

                  {/* Label */}
                  <p className="text-sm font-semibold">{achievement.label}</p>
                  <p className="text-xs">{achievement.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
