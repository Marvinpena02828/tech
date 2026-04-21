import Image from "next/image";
import React from "react";

async function fetchBannerImage() {
  try {
    const response = await fetch("/api/banner", { 
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (response.ok) {
      const data = await response.json();
      return data.image;
    }
  } catch (error) {
    console.error("Failed to fetch banner:", error);
  }
  // Fallback to default image
  return "/services/page/Our Services.png";
}

const Banner = async () => {
  const bannerImage = await fetchBannerImage();

  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {/* Mobile Version */}
      <Image
        src={bannerImage}
        alt="Our Services"
        fill
        className="object-cover w-full block md:hidden scale-110"
        priority
        quality={90}
      />
      
      {/* Desktop Version */}
      <Image
        src={bannerImage}
        alt="Our Services"
        fill
        className="object-cover w-full hidden md:block"
        priority
        quality={90}
      />
    </section>
  );
};

export default Banner;
