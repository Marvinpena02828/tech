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
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
            Corporate News
          </h2>
          <div style={{ 
            width: "4rem", 
            height: "0.25rem", 
            background: "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))", 
            margin: "1rem auto 0",
            borderRadius: "9999px"
          }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {news.map((item) => (
            <Link
              href={`/news/${item.id}`}
              key={item.id}
              className="group rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 flex flex-col h-full"
            >
              {/* Image Container - Vertical Aspect Ratio */}
              <div 
                className="relative w-full overflow-hidden bg-gray-100 flex-shrink-0" 
                style={{ aspectRatio: '1/1.2' }}
              >
                <AppImage
                  width={300}
                  height={360}
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Text Content - Below Image */}
              <div className="flex flex-col justify-between flex-grow p-4 sm:p-5 md:p-6">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {item.caption}
                  </p>
                </div>
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
