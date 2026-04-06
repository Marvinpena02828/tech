import Image from "next/image";
import React from "react";

const Banner = () => {
  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {/* Background Image */}
        <Image
          src="/partners/banner-mobile.jpg"
          alt="Modern corporate building"
          fill
          className="object-fill w-full block lg:hidden"
          priority
          quality={90}
        />
        <Image
          src="/partners/banner.jpg"
          alt="Modern corporate building"
          fill
          className="object-fill w-full hidden lg:block"
          priority
          quality={90}
        />
    </section>
  );
};

export default Banner;
