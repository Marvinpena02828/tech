"use client";

import { useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import Image from "next/image";
import Link from "next/link";

interface AchievementItemProps {
  index: number;
  image: string;
  end: number;
  suffix: string;
  title: string;
  subtitle: string;
  delay: number;
  isVisible: boolean;
}

function AchievementItem({
  index,
  image,
  end,
  suffix,
  title,
  subtitle,
  delay,
  isVisible,
}: AchievementItemProps) {
  const { count, start } = useCountUp({ end, suffix, duration: 2500 });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        start();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, start, delay]);

  return (
    <Link
      href={`/achievements#achivement-${index}`}
      className={`flex flex-col sm:flex-row items-start sm:items-start gap-4 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon - Red on hover */}
      <div className="relative w-24 h-24 shrink-0 overflow-hidden aspect-square rounded-full group hover:bg-red-600">
        <Image
          src={image}
          alt="icon"
          fill
          className="object-center aspect-square group-hover:brightness-0 group-hover:invert transition-colors duration-300"
          style={{
            filter: 'invert(0)',
          }}
        />
      </div>

      <div className="text-left">
        {/* Stats */}
        <h3 className="font-bold text-4xl">{count}</h3>

        {/* Label */}
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs ">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function AchievementsSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.8 });

  const achievements = [
    {
      image: "/achievements/11 years.png",
      end: 12,
      suffix: "+",
      title: "Years of Industry Mastery",
      subtitle:
        "A decade of refining our craft in the power and charging solution sector.",
    },
    {
      image: "/achievements/customerSatisfaction.png",
      end: 100,
      suffix: "%",
      title: "Commitment to Satisfaction",
      subtitle:
        "A flawless track record of delivering quality and reliability to our global partners.",
    },
    {
      image: "/achievements/brandBuilding.png",
      end: 150,
      suffix: "+",
      title: "Strategic Brand Partnerships",
      subtitle:
        "Trusted by over 150 global brands to bring their product visions to life.",
    },
    {
      image: "/achievements/intellectual.png",
      end: 50,
      suffix: "+",
      title: "Intellectual Property Rights",
      subtitle:
        "Driven by innovation, protected by over 50 patents and proprietary designs.",
    },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white mt-2"
    >
      <div className="container">
    
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
            Our Milestones in Excellence
          </h2>
          {/* Blue oval bar - smaller size */}
          <div style={{ 
            width: "3rem", 
            height: "0.25rem", 
            background: "#2563eb", 
            margin: "1rem auto 0",
            borderRadius: "9999px"
          }} />
        </div>

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
          {achievements.map((achievement, idx) => (
            <AchievementItem
              key={idx}
              index={idx}
              image={achievement.image}
              end={achievement.end}
              suffix={achievement.suffix}
              title={achievement.title}
              subtitle={achievement.subtitle}
              delay={idx * 100}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
