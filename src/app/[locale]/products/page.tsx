import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Layout/Footer";
import Banner from "./components/Banner";
import ProductsClient from "./components/ProductsClient";
import { getBannersByPageType } from "@/app/(private)/admin/banners/models/banners-model";
import { getPublicProductsPageData } from "@/features/products";

export const metadata: Metadata = {
  title: "TechOn Products – Wholesale Electronics & Smart Accessories",
  description:
    "Browse TechOn's full range of innovative smartphone accessories, electronics, and smart tech products. Quality B2B wholesale available worldwide.",
  alternates: {
    canonical: "https://tech-on.net/products",
  },
};

// Loading component
async function ProductsLoading() {
  const bannerResult = await getBannersByPageType("products");

  return (
    <div className="min-h-screen bg-white">
      <Banner banner={bannerResult.success ? bannerResult.data : null} />
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
// Main server component
export default async function ProductsPage() {
  const productsPageDataResult = await getPublicProductsPageData();
  const bannerResult = await getBannersByPageType("products");
  if (!productsPageDataResult.success || !bannerResult.success) {
    return <ProductsLoading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Banner banner={bannerResult.success ? bannerResult.data : null} />
      <Suspense fallback={<ProductsLoading />}>
        <ProductsClient
          initialProducts={productsPageDataResult.data.products}
          categories={productsPageDataResult.data.categories}
        />
      </Suspense>
    </div>
  );
}
