"use client";

import React from "react";
import Image from "next/image";

export default function ContactBanner() {
  return (
    <section className="relative h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/contact/banner.png"
          alt="Modern corporate building"
          fill
          className="object-cover md:object-fill"
          priority
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-[10%] left-[7%] transform  z-10 text-center text-2xl px-4">
       <h1 className="text-black font-semibold text-5xl">Contact Us</h1>
      </div>

      {/* Bottom Gradient */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-500 to-transparent z-10" /> */}
    </section>
  );
}
