"use client";

import { useState } from "react";
import AppImage from "@/components/ui/AppImage";

interface ProductTabsProps {
  description: string;
  specifications: Record<string, string>;
  productImages?: string[]; // Array of product images for description tab
  productThumbnails?: string[]; // Array of product images for description tab
  videoLink?: string | null; // Single YouTube video link
  downloadsLink?: string | null; // Single Google Drive PDF link
  productTitle?: string; // Product title for download file name
}

export default function ProductTabs({
  description,
  specifications,
  productImages = [],
  productThumbnails = [],
  videoLink = null,
  downloadsLink = null,
  productTitle = "Product",
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "videos" | "downloads"
  >("description");

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Get video ID if link exists
  const videoId = videoLink ? extractYouTubeId(videoLink) : null;

  const tabs = [
    { id: "description", label: "DESCRIPTION" },
    { id: "specs", label: "SPECIFICATIONS" },
    { id: "videos", label: "VIDEOS" },
    { id: "downloads", label: "DOWNLOADS" },
  ] as const;

  return (
    <div className="min-h-[100px]">
      {/* Tab Headers */}
      <div className="flex border-b border-black overflow-auto scrollbar-thin">
        {tabs.map((tab, index) => (
          <div key={index} className="relative pr-5 mr-5 border-r border-black">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm mr- md:text-lg font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? "text-red-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="animate-fadeIn">
            {/* Text Content */}
            <div className="text-gray-800 leading-relaxed space-y-4 mb-8 pr-10">
              <div
                className="description-content text-sm"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* product tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-row-2 bg-white mx-auto h-[120vh] max-lg:p-0">
              {/* main side image */}
              <div className="relative colspan-1 row-span-2 w-full">
                <AppImage
                  src={productThumbnails[0] || productImages[0]}
                  alt={productTitle}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative col-span-1 row-span-1 w-full">
                <AppImage
                  src={productThumbnails[1] || productImages[1]}
                  alt={productTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative col-span-1 row-span-1 w-full">
                <AppImage
                  src={productThumbnails[2] || productImages[2]}
                  alt={productTitle}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specs" && (
          <div className="animate-fadeIn pr-10">
            <div className="space-y-3">
              {Object.entries(specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-4 border-b border-gray-200 pb-2"
                >
                  <dt className="text-sm font-semibold text-gray-900">{key}</dt>
                  <dd className="text-sm text-gray-700">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="animate-fadeIn">
            {videoId ? (
              <div className="rounded overflow-hidden max-w-7xl mx-auto">
                <div className="aspect-video bg-gray-100 w-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No videos available</p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="animate-fadeIn">
            {downloadsLink ? (
              <div className="max-w-2xl mx-auto">
                <a
                  href={downloadsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {productTitle} - Technical Specifications
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>PDF</span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No downloads available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
