import type { Metadata } from "next";
import React from "react";
import Banner from "./Components/Banner";
import ListOfServices from "./Components/ListOfServices";

export const metadata: Metadata = {
  title: "AyyanTech Services – Smart Tech & Electronics Solutions",
  description:
    "Explore AyyanTech's professional services including R&D, product design, manufacturing, and global distribution of innovative smartphone accessories.",
  alternates: {
    canonical: "https://ayyantech.net/services",
  },
};

const page = () => {
  return (
    <>
      <main>
        <Banner />
        <ListOfServices />
      </main>
    </>
  );
};

export default page;
