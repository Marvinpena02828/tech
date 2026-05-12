"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Layout/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductTabs from "@/components/ProductTabs";
import { getProductById } from "@/lib/supabase/products";
import PopularProductLineup from "@/components/PopularProductLineup";
import { getContactInfo } from "@/actions/contactInfo";
import { ContactInfo } from "@/types/contactInfo";
import type { ProductDetailModel } from "@/features/products";
// Placeholder image for products without images
const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/e5e7eb/6b7280?text=Product+Image";

// Get product data from database
const getProductData = async (id: string): Promise<ProductDetailModel> => {
  const dbProduct = await getProductById(id);

  if (dbProduct) {
    return {
      ...dbProduct,
      // Use placeholder if no images
      images:
        dbProduct.images && dbProduct.images.length > 0
          ? dbProduct.images
          : [PLACEHOLDER_IMAGE],
      thumbnail: dbProduct.thumbnail ?? [],
      short_description: dbProduct.short_description ?? "",
      description: dbProduct.description ?? "",
      relatedProducts: [], // We'll fetch related products separately
    };
  }

  // Fallback data if product not found in database
  return {
    id,
    title: "Product Not Found",
    sku: "N/A",
    category: {
      id: "unknown",
      title: "Unknown",
    },
    tags: [],
    short_description: "This product could not be found in the database.",
    images: [PLACEHOLDER_IMAGE],
    thumbnail: [],
    features: [],
    specifications: {},
    colors: [],
    description: "",
    video_link: null,
    downloads_link: null,
    relatedProducts: [],
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductData(productId);
      setProduct(data);
      setLoading(false);
    };

    const loadContactInfo = async () => {
      const contactInfoData = await getContactInfo();
      setContactInfo(contactInfoData);
    };

    loadContactInfo();
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600">
              The product you are looking for does not exist.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log(contactInfo);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-gray-500 hover:text-[#3A2E59] transition-colors"
              >
                Home
              </Link>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href="/products"
                className="text-gray-500 hover:text-[#3A2E59] transition-colors"
              >
                Products
              </Link>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-gray-500 hover:text-[#3A2E59] transition-colors"
              >
                {product.category.title}
              </Link>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900 ">{product.sku}</span>
            </nav>
          </div>
        </div>

        <section className="bg-white h-full min-h-[80vh] max-w-[1600px] mx-auto">
          {/* Main Product Section - Two Column Layout */}
          <div className="container py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-4 gap-16 lg:gap-12  min-h-[80vh] place-items-start">
            {/* Left Column - Sticky Gallery */}
            <ProductGallery images={product.images} title={product.title} />

            {/* Right Column - Product Info */}
            <ProductInfo product={product} contactInfo={contactInfo} />
          </div>
        </section>

        {/* Tabbed Content Section */}
        <div className="bg-white py-12 mt-2">
          <div className="slim-container">
            <ProductTabs
              description={product.description}
              specifications={product.specifications}
              productImages={product.images || []}
              productThumbnails={product.thumbnail || []}
              videoLink={product.video_link}
              downloadsLink={product.downloads_link}
              productTitle={product.title}
            />
          </div>
        </div>

        {/* Related Products */}
        <PopularProductLineup />
      </div>
    </>
  );
}
