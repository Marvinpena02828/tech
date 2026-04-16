import Link from "next/link";
import Image from "next/image";
import { News } from "@/lib/types";

const LatestNews = ({ news }: { news: News[] }) => {
  if (news.length === 0 || !news) {
    return <p className="text-center p-16">No news available.</p>;
  }

  return (
    <div className="py-12 mt-2 container">
      <h1 className="text-center text-4xl font-semibold">Corporate News</h1>
      <div className="flex flex-wrap items-start justify-between gap-2 mt-12">
        {news.map((item) => (
          <Link
            href={`/news/${item.id}`}
            key={item.id}
            className="w-full max-w-2xl group"
          >
            <div className="relative w-full h-96 overflow-hidden rounded-lg bg-gray-200">
              <Image
                width={500}
                height={400}
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <p className="text-center text-lg font-medium mt-4 group-hover:text-blue-500 transition-colors duration-200">
              {item.caption}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
