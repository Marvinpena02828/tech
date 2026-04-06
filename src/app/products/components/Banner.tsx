"use client";

import React from "react";
import { ProductBanner } from "@/lib/types";
import ResponsiveBanner from "@/components/ResponsiveBanner";

const Banner = ({ banner }: { banner: ProductBanner | null }) => {
  return <ResponsiveBanner banner={banner} />;
};

export default Banner;
