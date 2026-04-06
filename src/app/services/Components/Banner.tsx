import Image from "next/image";
import React from "react";
const Banner = () => {
  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/services/page/Our Services.png"
        alt="Modern corporate building"
        fill
        className="object-cover w-full block md:hidden scale-110"
        priority
        quality={90}
      />
      <Image
        src="/services/page/Our Services.png"
        alt="Modern corporate building"
        fill
        className="object-cover w-full hidden md:block"
        priority
        quality={90}
      />

     
    </section>
  );
};

export default Banner;
