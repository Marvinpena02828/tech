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
    <div className="text-center">
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

      <section className="p-6 ">
        <h1 className="text-4xl font-arial font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-2">
          Published on: {new Date(created_at).toLocaleDateString()}
        </p>
        <p className="whitespace-pre-wrap font-arial">{content}</p>
      </section>
    </div>
  );
};

export default Page;
