import Image from "next/image";
import { getNewsBanner } from "@/app/(private)/admin/news/models/news-banner-model";

interface BannerProps {
  bannerImageUrl?: string;
  subtitle?: string;
  mainText?: string;
  title?: string;
}

async function Banner({ bannerImageUrl, subtitle, mainText, title }: BannerProps = {}) {
  // Fetch banner data from server
  const bannerResult = await getNewsBanner();
  const banner = bannerResult.success ? bannerResult.data : null;

  const finalImageUrl = bannerImageUrl || banner?.image_url || "/news/banner.jpg";
  const finalSubtitle = subtitle || banner?.subtitle || "Empowered by";
  const finalMainText = mainText || banner?.main_text || "INNOVATIONS";
  const finalTitle = title || banner?.title || "News";

  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          fill
          src={finalImageUrl}
          alt="News Banner"
          className="w-full h-full object-cover"
          priority
          onError={(e) => {
            // Fallback to placeholder if image fails
            e.currentTarget.src = "/news/banner.jpg";
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
        {/* Top Content - Subtitle and Main Text */}
        <div className="absolute top-[10%] left-1/2 md:left-[10%] transform -translate-x-1/2 md:translate-x-0 z-10 text-center md:text-left text-white">
          <span className="uppercase tracking-wider text-2xl font-bold block mb-2">
            {finalSubtitle}
          </span>
          <span
            className="font-bold uppercase tracking-wider text-3xl md:text-4xl block font-neuropol"
            style={{ fontFamily: "var(--font-neuropol), sans-serif" }}
          >
            {finalMainText}
          </span>
        </div>
        {/* Bottom Content - Title */}
        <div className="absolute bottom-[10%] right-[10%] text-white z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
            {finalTitle}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Banner;
