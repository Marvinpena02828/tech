"use client";

import React from "react";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/about/banner.jpg"
          alt="Modern corporate building"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Content */}
      <div className="absolute top-1/4 left-[60%] transform -translate-x-1/2 z-10 text-center text-2xl px-4">
        <span className="font-sf-pro text-violet-950 tracking-widest text-3xl">
          Empowered by
        </span>
        <br />
        <span className="text-red-700 font-neuropol uppercase tracking-wider text-2xl">
          INNOVATIONS
        </span>
      </div>
    </section>
  );
}
