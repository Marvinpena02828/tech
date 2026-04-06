import Link from "next/link";

import Image from "next/image";
import { News } from "@/lib/types";

const LatestNews = ({ news }: { news: News[] }) => {

  if (news.length === 0 || !news) {
    return <p className="text-center p-16">No news available.</p>;
  }

  return (
    <div className="py-12 mt-2 container">
      <h1 className="text-center text-4xl font-semibold">Latest News</h1>

      <div className="flex flex-wrap items-start justify-between gap-2 mt-12">
        {news.map((item, index) => (
          <Link
            href={`/news/${item.id}`}
            key={index}
            className="w-full max-w-2xl group"
          >
            <Image
              width={192}
              height={192}
              src={item.image_url}
              alt={item.title}
              className="w-full h-auto object-cover aspect-13/9 hover:scale-101 transition-all"
            />

            <p className="text-center text-lg group-hover:text-blue-500 transition-all">{item.caption}</p>
          </Link>
        ))}
       
      </div>
    </div>
  );
};

export default LatestNews;
