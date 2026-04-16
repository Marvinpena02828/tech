"use client";

import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { News } from "@/lib/types";
import { useEffect, useState } from "react";
import { getNews } from "@/app/(private)/admin/news/models/news-model";

const NewsHomeSection = ({ showViewAll = true }: { showViewAll?: boolean }) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNews();
        if (response.success) {
          // Get only the latest 2 news items for home page
          setNews(response.data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-20 bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading mb-8 md:mb-12 tracking-tight text-center">
            Corporate News
          </h2>
          <div className="flex justify-center">
            <p className="text-gray-500">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null; // Don't show section if no news
  }

  return (
    <section className="w-full py-20 mt-2 bg-white">
      <div className="container">
        <h2 className="heading mb-8 md:mb-12 tracking-tight text-center">
          Corporate News
        </h2>

        <div className="flex items-start justify-center gap-6 md:gap-8">
          {news.map((item) => (
            <Link
              href={`/news/${item.id}`}
              key={item.id}
              className="group flex-1 h-[500px] w-full max-w-[350px] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                {/* Image */}
                <AppImage
                  width={600}
                  height={300}
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Overlay */}
              <div className="inset-0 flex flex-col  z-20 text-left px-1 py-2">
                <h1 className="text-xl font-semibold font-arial text-black line-clamp-1 no-ellipsis">
                  {item.title}
                </h1>
                <h3 className="text-sm mt-2 text-black font-arial text-left w-full group-hover:text-[#4A90E2] transition-colors line-clamp-5">
                  {item.caption}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {showViewAll && (
          <div className="flex justify-center mt-10 md:mt-12">
            <Link
              href="/news"
              className="px-8 md:px-10 py-3 md:py-4 bg-black text-white text-sm md:text-base font-semibold rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 shadow-md inline-block"
            >
              View All News
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsHomeSection;
