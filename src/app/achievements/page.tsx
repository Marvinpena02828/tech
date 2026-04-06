import type { Metadata } from "next";
import React from "react";
import Banner from "./Components/Banner";
import ListOfAchievments from "./Components/ListOfAchievments";

export const metadata: Metadata = {
  title: "AyyanTech Achievements – Awards & Milestones",
  description:
    "Explore AyyanTech's achievements, awards, and milestones in the electronics and smart technology industry since 2015.",
  alternates: {
    canonical: "https://ayyantech.net/achievements",
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
