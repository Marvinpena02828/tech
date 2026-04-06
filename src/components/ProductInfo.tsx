"use client";

import { ContactInfo } from "@/types/contactInfo";
import Link from "next/link";
import { useState } from "react";

interface ProductInfoProps {
  product: {
    title: string;
    colors: { hex: string; name: string }[];
    sku?: string;
    category?: string | { id: string; title: string };
    short_description: string;
    features: string[];
    specifications: Record<string, string>;
  };

  contactInfo: ContactInfo[];
}

export default function ProductInfo({
  product,
  contactInfo,
}: ProductInfoProps) {
  const [showInquirySuccess] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const INITIAL_FEATURES_COUNT = 4;
  const displayedFeatures = showAllFeatures
    ? product.features
    : product.features.slice(0, INITIAL_FEATURES_COUNT);
  const hasMoreFeatures = product.features.length > INITIAL_FEATURES_COUNT;

  const chatWithUs = [
    ...contactInfo.map((info) => ({
      name:
        info.title.split(" ")[0] === "Phone"
          ? "WeChat"
          : info.title.split(" ")[0],
      link: info.link,
      order:
        info.title === "email"
          ? 1
          : info.title.split(" ")[0] === "Phone"
            ? 2
            : 3,
    })),
    {
      name: "Get Quote",
      order: 4,
      link: "/contact",
    },
  ];

  console.log(chatWithUs);

  return (
    <div className="font-poppins col-span-2 flex flex-col h-full text-justify w-8/10 ">
      <h1 className="text-xl md:text-[32px] font-semibold font-Metropolis_medium text-[#3A2E59] mb-6 line-clamp-3 text-left">
        {product.title}
      </h1>

      <p className="text-black text-lg leading-relaxed mb-10">{product.sku}</p>
      <div className="mb-4 rounded pl-4 text-left font-metropolis">
        <ul className="space-y-1.5 list-disc list-outside pl-4 relative overflow-hidden transition-all duration-500 ease-in-out">
          {displayedFeatures.map((feature, index) => (
            <li
              key={index}
              className={`text-sm text-gray-700 leading-tight transition-all duration-300 ease-in-out ${
                index >= INITIAL_FEATURES_COUNT && showAllFeatures
                  ? "animate-fadeIn"
                  : ""
              }`}
            >
              <span className="font-Metropolis_medium font-black">
                {feature.split(":")[0]}:
              </span>
              {feature.split(":")[1]}
            </li>
          ))}

          {!showAllFeatures && hasMoreFeatures && (
            <div className="absolute bg-gradient-to-t from-white to-transparent bottom-0 left-0 w-full h-8 pointer-events-none" />
          )}
        </ul>

        {hasMoreFeatures && (
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="mt-3 text-sm text-primary-blue hover:text-[#2d2347] cursor-pointer font-semibold transition-colors duration-200 flex items-center gap-1"
          >
            {showAllFeatures ? (
              <>
                See less
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                See more ({product.features.length - INITIAL_FEATURES_COUNT}{" "}
                more features)
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4">
        {product.colors.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-gray-200 pr-3"
                >
                  <button
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p>{color.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 w-full max-w-sm gap-3 mb-5">
        {chatWithUs.map((item, index) => (
          <button
            key={index}
            className="py-2 text-xs text-black font-medium rounded-full border-2 border-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-200"
          >
            <Link href={item.link || "#"} target="_blank">
              {item.name}
            </Link>
          </button>
        ))}
      </div>

      {showInquirySuccess && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-green-800 text-sm font-medium">
            WeChat ID copied!
          </span>
        </div>
      )}
    </div>
  );
}
