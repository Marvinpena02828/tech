"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Store, Users, Globe2 } from "lucide-react";

export default function GlobalMarketing() {
  const regions = [
    { name: "Industry Exhibition Show", countries: 1, color: "#00CED1" },
    { name: "More than 150 Employees", countries: 40, color: "#00CED1" },
    { name: "Our Team & Values", countries: 12, color: "#00CED1" },
    // { name: "Australia", countries: 1, color: "#00CED1" },
    // { name: "Southeast Asia", countries: 11, color: "#00CED1" },
  ];

  return (
    <section className="py-8 bg-white mt-2">
      <h2 className="heading text-center text-black mb-6 md:mb-10">
        Offline Marketing
      </h2>

      <div className="container font-arial">
        <div className="flex flex-col md:flex-row gap-14">
          {/* Header */}
          <div className="flex-1 text-center lg:text-left lf:mb-16 flex flex-col ">
            <h3 className="text-xl md:text-2xl text-[#3A2E59] mb-4">
              Exporting to over 50 Countries and Regions Worldwide
            </h3>
            <p className="text-lg md:text-lg text-gray-700 max-w-3xl ">
              US l Europe l South America l Australia l Southeast Asia
            </p>

            {/* Total Stats */}
            <div className="mt-auto text-[#3A2E59]">
              <div className="inline-flex items-start gap-2 max-md:mt-6 md:gap-14 ">
                <div>
                  <div className="text-4xl font-semibold ">50+</div>
                  <div className="text-lg mt-1">Countries/Regions</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold ">150+</div>
                  <div className="text-lg mt-1">Global Major Customers</div>
                </div>
              </div>
            </div>
          </div>

          {/* World Map Section */}
          <div className="relative w-full aspect-20/9 flex-1/8">
            <Image
              src="/about/worldmap.png"
              alt="Global Distribution Map"
              fill
              className=" object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
