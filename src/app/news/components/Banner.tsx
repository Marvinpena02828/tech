// src/app/(public)/news/page.tsx

import { Suspense } from "react";
import Image from "next/image";
import Banner from "@/components/news/banner";
import { getNewsBanner } from "@/app/(private)/admin/news/models/news-banner-model";
import { getNews } from "@/app/(private)/admin/news/models/news-model";

export const metadata = {
  title: "News & Updates | TechOn",
  description: "Latest news and updates from TechOn",
};

async function NewsPageContent() {
  const [bannerResult, newsResult] = await Promise.all([
    getNewsBanner(),
    getNews(),
  ]);

  const banner = bannerResult.success ? bannerResult.data : null;
  const newsArticles = newsResult.success ? newsResult.data : [];

  return (
    <>
      {/* Banner */}
      <Banner
        bannerImageUrl={banner?.image_url || "/news/banner.jpg"}
        subtitle={banner?.subtitle || "Empowered by"}
        mainText={banner?.main_text || "INNOVATIONS"}
        title={banner?.title || "News"}
      />

      {/* News List */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {newsArticles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No articles yet
            </h2>
            <p className="text-gray-600">
              Check back soon for the latest news and updates.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {newsArticles.map((article) => (
              <article
                key={article.id}
                className="grid md:grid-cols-3 gap-6 pb-8 border-b last:border-b-0"
              >
                {/* Image */}
                {article.image_url && (
                  <div className="md:col-span-1 relative h-64 md:h-48 rounded-lg overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error("Article image failed to load:", article.image_url);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                      {article.caption}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {article.content}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <a
                      href={`/news/${article.id}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="h-[500px] bg-gray-200 animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid md:grid-cols-3 gap-6 pb-8 border-b">
                  <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="md:col-span-2 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <NewsPageContent />
    </Suspense>
  );
}
