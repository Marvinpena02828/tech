 "use client";
import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import Image from "next/image";
import { customerCategories } from "@/app/partners/components/ListOfPartners";
Image;
export default function BusinessNeedsSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white mt-2"
    >
      <div className="container">
        <div
          className={text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }}
        >
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "
#111827" }}>Who Are Our Partners?</h2>
 <div style={{ 
            width: "4rem", 
            height: "0.25rem", 
            background: "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))", 
            margin: "1rem auto 0",
            borderRadius: "9999px"
          }} />
        </div>

        </div>
        {/* Desktop Grid View (Hidden on Mobile/Tablet) */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] w-full gap-16 lg:gap-8">
          {[customerCategories.map](http://customerCategories.map)((item, index) => (
            <div
              key={index}
              className={grid h-full transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }}
              style={{
                gridTemplateRows: "20% 20% 50% 20%",
                transitionDelay: ${index * 100 + 200}ms,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <h3 className="text-base lg:text-xl font-arial font-bold mb-3 lg:mb-4 text-gray-900">
                {item.type}
              </h3>
              <p className="text-sm lg:text-md text-gray-600 mb-3 font-semibold lg:mb-4">
                {item.description}
              </p>
              <ul className="list-disc list-inside text-sm lg:text-md text-gray-600 mb-6 lg:mb-8 space-y-1 lg:space-y-2 leading-4">
                {[item.items.map](http://item.items.map)((point, idx) => (
                  <div className="flex items-center gap-2" key={idx}>
                    <Image
                      src="/check.png"
                      alt="icon"
                      width={15}
                      height={15}
                      className="object-cover aspect-square"
                    />
                    <p>{point.title}</p>
                  </div>
                ))}
              </ul>
              <Link
                href={/partners#partners-${index}}
                className="mt-auto block max-w-[150px] button-animation py-1 lg:py-2 text-center px-6 rounded-full border border-gray-200 shadow-sm text-sm lg:text-base transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-[
#1a1a3a]"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
