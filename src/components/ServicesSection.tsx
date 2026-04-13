"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Image from "next/image";
import Link from "next/link";

export default function ServicesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  const services = [
    {
      image: "/services/oem odm.png",
      title: "End-to-End OEM/ODM Solutions",
      desc: "From concept to creation, we bring your unique product vision to life Product ID design, Unique Ul design, PCBA customize Product Development, Retail Package",
    },
    {
      image: "/services/professional certification.png",
      title: "Global Certifications & Compliance",
      desc: `Our products meet the highest international safety and quality standards, we are fully certified by:
CE · FCC · RoHS · UL · UKCA · PSE · CB · Qi · ETL · KCC · SAA`,
    },
    {
      image: "/services/factory qualification.png",
      title: "Manufacturing Excellence",
      desc: `Our facilities are fully audited and certified by global standards:
ISO 9001 & 14001, GRS Certified,  BSCI Audited
`,
    },
    {
      image: "/services/quality guarantee.png",
      title: "Quality Guarantee",
      desc: "2 Years Quality Warranty 100% Technology support OTA software update 1 to 1 service",
    },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white border-t border-gray-100 mt-2"
    >
      <div className="container">
        <h2
          className={`heading text-center text-gray-800 mb-12 font-arial transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services
        </h2>

        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={idx}
              className={`flex items-start gap-2 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <div className="relative min-w-22 h-22 overflow-hidden rounded-full aspect-square group hover:bg-primary-blue">
                <Image
                  src={service.image}
                  alt="icon"
                  width={1000}
                  height={1000}
                  className="object-cover aspect-square group-hover:brightness-0 group-hover:invert transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm md:text-[17px] text-gray-800 leading-5">
                  {service.title}
                </h3>
                <p className="text-xs  text-gray-600">{service.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
