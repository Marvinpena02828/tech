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
      <section className="w-full py-12 sm:py-16 md:py-20 bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading mb-6 sm:mb-8 md:mb-12 tracking-tight text-center">
            Corporate News
          </h2>
          <div className="flex justify-center">
            <p className="text-gray-500 text-sm sm:text-base">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 mt-2 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="heading mb-6 sm:mb-8 md:mb-12 tracking-tight text-center">
          Corporate News
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {news.map((item) => (
            <Link
              href={`/news/${item.id}`}
              key={item.id}
              className="group rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:border-gray-200"
            >
              {/* Image Container - Vertical Portrait Aspect Ratio (9/16) */}
              <div className="relative w-full overflow-hidden flex-shrink-0 bg-gray-100" style={{ aspectRatio: '9/16' }}>
                <AppImage
                  width={300}
                  height={534}
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-grow p-3 sm:p-4 md:p-5 text-left">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold font-arial text-black line-clamp-2 group-hover:text-[#4A90E2] transition-colors">
                  {item.title}
                </h1>
                <p className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-600 font-arial text-left flex-grow group-hover:text-[#4A90E2] transition-colors line-clamp-3 sm:line-clamp-4">
                  {item.caption}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {showViewAll && (
          <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
            <Link
              href="/news"
              className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-black text-white text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 shadow-md inline-block active:scale-95"
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
