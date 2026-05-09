import {
  getNews,
  getNewsById,
} from "@/app/(private)/admin/news/models/news-model";
import AppImage from "@/components/ui/AppImage";
import React from "react";

export const dynamic = "force-dynamic";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const news = await getNewsById(id);

  if (news.success === false) {
    return (
      <div className="text-center mt-20 text-red-500">Error: {news.error}</div>
    );
  }

  if (!news.data) {
    return <div className="text-center mt-20 text-red-500">News not found</div>;
  }

  const { created_at, image_url, title, content } = news.data;

  return (
    <div>
      {/* banner */}
      <section className="relative w-full h-[500px]">
        <AppImage
          priority
          src={image_url}
          alt={title}
          fill
          className="absolute left-0 top-0 w-full h-[80vh] aspect-video object-cover"
        />
      </section>

      {/* content section with proper spacing */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-arial font-bold mb-6 text-gray-900">
            {title}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Published on: {new Date(created_at).toLocaleDateString()}
          </p>
          <p className="whitespace-pre-wrap font-arial text-gray-700 leading-8 text-base text-justify">
            {content}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Page;
