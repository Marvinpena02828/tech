"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  images: string[];
  thumbnail?: string[] | null;
}

export default function ProductCard({
  id,
  title,
  images,
  thumbnail,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMouseEnter = () => {
    if (images.length > 1) {
      // Cycle to next image
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleMouseLeave = () => {
    // Reset to first image
    setCurrentImageIndex(0);
  };

  

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="rounded-sm overflow-hidden transition-all duration-300  h-full flex flex-col">
        {/* Product Image - Fixed Aspect Ratio with Stacked Thumbnails */}
        <div
          className="relative w-full aspect-square p-6 flex-shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-full h-full">
            {thumbnail && Array.isArray(thumbnail) && thumbnail.length > 0 ? (
              <div className="relative w-full h-full">
                {thumbnail.slice(0, 5).map((thumb, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      top: `${index * 8}px`,
                      left: `${index * 8}px`,
                      width: `calc(100% - ${index * 16}px)`,
                      height: `calc(100% - ${index * 16}px)`,
                      zIndex: (thumbnail?.length || 1) - index,
                    }}
                  >
                    <div className="relative w-full h-full border-2 border-gray-800 bg-white rounded-sm shadow-md">
                      <Image
                        src={thumb}
                        alt={`${title} - ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Image
                src={
                  images[currentImageIndex] ||
                  "/Images/products-optimized/power-bank/1/titan-130rc-01-medium.avif"
                }
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-contain transition-all duration-300 group-hover:scale-105"
              />
            )}
          </div>
        </div>

        {/* Product Title - Fixed Height */}
        <div className="px-4 text-center flex items-center justify-center">
          <h3
            className="text-[13px] font-light text-gray-600 leading-tight line-clamp-3"
            suppressHydrationWarning
          >
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
