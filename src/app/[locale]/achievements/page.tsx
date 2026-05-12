import type { Metadata } from "next";
import React from "react";
import Banner from "./components/Banner";
import ListOfAchievments from "./components/ListOfAchievments";

export const metadata: Metadata = {
  title: "TechOn Achievements – Awards & Milestones",
  description:
    "Explore TechOn's achievements, awards, and milestones in the electronics and smart technology industry since 2015.",
  alternates: {
    canonical: "https://tech-on.net/achievements",
  },
};

const page = () => {
  return (
    <main>
      <Banner />
      <ListOfAchievments />
    </main>
  );
};

export default page;
