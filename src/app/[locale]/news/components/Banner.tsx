import Image from "next/image";
import { getNewsBanner } from "@/app/(private)/admin/news/models/news-banner-model";

interface BannerProps {
  bannerImageUrl?: string;
  subtitle?: string;
  mainText?: string;
  title?: string;
}

async function Banner(props?: BannerProps) {
  try {
    // Fetch banner data from server
    const bannerResult = await getNewsBanner();
    const banner = bannerResult.success ? bannerResult.data : null;

    const finalImageUrl = props?.bannerImageUrl || banner?.image_url || "/news/banner.jpg";
    const finalSubtitle = props?.subtitle || banner?.subtitle || "Empowered by";
    const finalMainText = props?.mainText || banner?.main_text || "INNOVATIONS";
    const finalTitle = props?.title || banner?.title || "News";

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
              className="font-bold uppercase tracking-wider text-3xl md:text-4xl block"
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
  } catch (error) {
    console.error("Banner error:", error);
    // Fallback to static banner
    return (
      <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <Image
            fill
            src="/news/banner.jpg"
            alt="News Banner"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
          <div className="absolute top-[10%] left-1/2 md:left-[10%] transform -translate-x-1/2 md:translate-x-0 z-10 text-center md:text-left text-white">
            <span className="uppercase tracking-wider text-2xl font-bold block mb-2">
              Empowered by
            </span>
            <span
              className="font-bold uppercase tracking-wider text-3xl md:text-4xl block"
              style={{ fontFamily: "var(--font-neuropol), sans-serif" }}
            >
              INNOVATIONS
            </span>
          </div>
          <div className="absolute bottom-[10%] right-[10%] text-white z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
              News
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

export default Banner;
