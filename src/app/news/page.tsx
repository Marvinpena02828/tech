import type { Metadata } from "next";
import Banner from "./components/Banner";
import NewsHomeSection from "@/components/NewsHomeSection";

export const metadata: Metadata = {
  title: "AyyanTech News – Latest Updates from Ayyan Technology",
  description:
    "Stay up to date with the latest news, product launches, and industry insights from AyyanTech. Discover what's new at Ayyan Technology.",
  alternates: {
    canonical: "https://ayyantech.net/news",
  },
};

export const dynamic = "force-dynamic";

const page = () => {
  return (
    <>
      <main className="">
        <Banner />

        <NewsHomeSection showViewAll={false} />
      </main>
    </>
  );
};

export default page;
