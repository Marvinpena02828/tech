import Image from "next/image";
import React from "react";

async function fetchBannerImage() {
  try {
    const timestamp = new Date().getTime();
    const url = `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/banner?t=${timestamp}`;
    
    console.log("[Banner] Fetching from:", url);
    
    const response = await fetch(url, { 
      next: { 
        revalidate: 60
      }
    });
    
    console.log("[Banner] Response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("[Banner] Data received:", data);
      console.log("[Banner] Image URL:", data.image);
      return data.image;
    } else {
      console.error("[Banner] API response not OK:", response.status);
    }
  } catch (error) {
    console.error("[Banner] Fetch error:", error);
  }
  
  // Fallback to default image
  const fallback = "/services/page/Our Services.png";
  console.log("[Banner] Using fallback image:", fallback);
  return fallback;
}

const Banner = async () => {
  console.log("[Banner] Component rendering...");
  const bannerImage = await fetchBannerImage();
  console.log("[Banner] Final image to render:", bannerImage);

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
