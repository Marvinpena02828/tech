"use client";

import { useState, useRef, useEffect } from "react";
import OptimizedImage from "./OptimizedImage";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setMousePosition({ x: 50, y: 50 });
  };

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreen();
      } else if (e.key === "ArrowLeft") {
        handlePreviousImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-[10000] bg-black/50 hover:bg-black/20 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Close fullscreen"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={handlePreviousImage}
            className="absolute left-4 z-[10000] bg-black/50 hover:bg-black/20 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextImage}
            className="absolute right-4 z-[10000] bg-black/50 hover:bg-black/20 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Fullscreen Image */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            <div className="relative w-full h-full">
              <OptimizedImage
                src={images[selectedImage]}
                alt={`${title} - Image ${selectedImage + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <span className="text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        </div>
      )}

      {/* Regular Gallery View */}
      <div className="lg:sticky lg:top-0 flex flex-col-reverse w-full gap-4 col-span-2">
        {/* Vertical Thumbnail Strip - Left Side */}
        <div className="flex relative items-center justify-center gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-hide  order-2 lg:order-1 pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Previous Button */}
          <button
            onClick={(e) => {
              handlePreviousImage();
            }}
            className="text-black mr-4 relative w-10 h-16"
            aria-label="Next image"
          >
            <ChevronLeft
              size={24}
              className="absolute left-0 -translate-y-1/2"
            />
            <ChevronLeft
              size={24}
              className="absolute left-2 -translate-y-1/2"
            />
          </button>

          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden  transition-all duration-200 hover:scale-105 bg-gray-100 `}
            >
              <OptimizedImage
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-contain"
                sizes="80px"
              />
            </button>
          ))}
          {/* Next Button */}
          <button
            onClick={(e) => {
              handleNextImage();
            }}
            className="text-black ml-4 relative w-10 h-16"
            aria-label="Next image"
          >
            <ChevronRight
              size={24}
              className="absolute right-0 -translate-y-1/2"
            />
            <ChevronRight
              size={24}
              className="absolute right-2 -translate-y-1/2"
            />
          </button>
        </div>

        {/* Main Image Display - Right Side */}
        <div className="flex-1 order-1 lg:order-2 h-full max-h-[60vh] ">
          <div
            ref={imageRef}
            className="relative rounded-2xl overflow-hidden h-[60vh] cursor-pointer w-full group"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleImageClick}
          >
            {/* Image Container */}

            <OptimizedImage
              src={images[selectedImage]}
              alt={`${title} - Image ${selectedImage + 1}`}
              fill
              className={`object-contain transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : {}
              }
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {/* Zoom Indicator */}
            <div
              className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md transition-opacity duration-200 ${
                isZoomed ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex items-center space-x-2 text-gray-700">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
                <span className="text-xs font-medium">Click to fullscreen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
