import type { Metadata } from "next";
import React from "react";
import Banner from "./components/Banner";
import ListOfPartners from "./components/ListOfPartners";

export const metadata: Metadata = {
  title: "AyyanTech Partners – Our Trusted Global Partners",
  description:
    "Discover AyyanTech's trusted global partners and collaborators. Learn about our B2B partnerships across the electronics and technology industry.",
  alternates: {
    canonical: "https://ayyantech.net/partners",
  },
};

const page = () => {
  return (
    <>
      <main>
        <Banner />
        <ListOfPartners />
      </main>
    </>
  );
};

export default page;
