import Image from "next/image";
import React from "react";
const Banner = () => {
  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/achievements/page/Our Achievements.png"
        alt="Modern corporate building"
        fill
        className="object-contain w-full block md:hidden"
        priority
        quality={75}
      />
      <Image
        src="/achievements/page/Our Achievements.png"
        alt="Modern corporate building"
        fill
        className="object-cover w-full hidden md:block"
        priority
        quality={75}
      />

      <h1 className="absolute top-[5%] left-[60%] w-full lg:left-[12%] transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl">
        Our Achievements
      </h1>
    </section>
  );
};

export default Banner;
