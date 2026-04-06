"use client";

import {
  ImageIcon,
  Plus,
  Edit,
  Trash2,
  X,
  Smartphone,
  Monitor,
  Home,
  Package,
  Star,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { ProductBanner, BannerPageType } from "@/lib/types";
import { useBanners } from "./hooks/use-banners";
import { useState, useEffect } from "react";
import { uploadBannerImageClient } from "@/lib/storage/bannersStorageClient";

interface BannersContentProps {
  banners: ProductBanner[];
}

function BannerDialog({
  isOpen,
  onClose,
  onSave,
  selectedBanner,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    mobileFile: File | null,
    desktopFile: File | null,
    pageType: BannerPageType,
    itemLink: string | undefined,
    headingLine1?: string,
    line1Color?: string,
    line1FontSize?: string,
    line1FontFamily?: string,
    headingLine2?: string,
    line2Color?: string,
    line2FontSize?: string,
    line2FontFamily?: string,
    headingLine3?: string,
    line3Color?: string,
    line3FontSize?: string,
    line3FontFamily?: string,
  ) => void;
  selectedBanner: ProductBanner | null;
  isSaving: boolean;
}) {
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [pageType, setPageType] = useState<BannerPageType>(
    selectedBanner?.page_type || "products",
  );

  // Item link for featured banners
  const [itemLink, setItemLink] = useState<string>(
    selectedBanner?.item_link || "",
  );

  // Line 1 state
  const [headingLine1, setHeadingLine1] = useState<string>(
    selectedBanner?.heading_line1 || "",
  );
  const [line1Color, setLine1Color] = useState<string>(
    selectedBanner?.line1_color || "#ffffff",
  );
  const [line1FontSize, setLine1FontSize] = useState<string>(
    selectedBanner?.line1_font_size || "48",
  );
  const [line1FontFamily, setLine1FontFamily] = useState<string>(
    selectedBanner?.line1_font_family || "Arial",
  );

  // Line 2 state
  const [headingLine2, setHeadingLine2] = useState<string>(
    selectedBanner?.heading_line2 || "",
  );
  const [line2Color, setLine2Color] = useState<string>(
    selectedBanner?.line2_color || "#ffffff",
  );
  const [line2FontSize, setLine2FontSize] = useState<string>(
    selectedBanner?.line2_font_size || "48",
  );
  const [line2FontFamily, setLine2FontFamily] = useState<string>(
    selectedBanner?.line2_font_family || "Arial",
  );

  // Line 3 state
  const [headingLine3, setHeadingLine3] = useState<string>(
    selectedBanner?.heading_line3 || "",
  );
  const [line3Color, setLine3Color] = useState<string>(
    selectedBanner?.line3_color || "#ffffff",
  );
  const [line3FontSize, setLine3FontSize] = useState<string>(
    selectedBanner?.line3_font_size || "48",
  );
  const [line3FontFamily, setLine3FontFamily] = useState<string>(
    selectedBanner?.line3_font_family || "Arial",
  );
  const [mobilePreview, setMobilePreview] = useState<string>(
    selectedBanner?.mobile_banner || "",
  );
  const [desktopPreview, setDesktopPreview] = useState<string>(
    selectedBanner?.desktop_banner || "",
  );
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when dialog opens/closes or selectedBanner changes
  useEffect(() => {
    if (isOpen) {
      setMobileFile(null);
      setDesktopFile(null);
      setPageType(selectedBanner?.page_type || "products");
      setItemLink(selectedBanner?.item_link || "");

      setHeadingLine1(selectedBanner?.heading_line1 || "");
      setLine1Color(selectedBanner?.line1_color || "#ffffff");
      setLine1FontSize(selectedBanner?.line1_font_size || "48");
      setLine1FontFamily(selectedBanner?.line1_font_family || "Arial");

      setHeadingLine2(selectedBanner?.heading_line2 || "");
      setLine2Color(selectedBanner?.line2_color || "#ffffff");
      setLine2FontSize(selectedBanner?.line2_font_size || "48");
      setLine2FontFamily(selectedBanner?.line2_font_family || "Arial");

      setHeadingLine3(selectedBanner?.heading_line3 || "");
      setLine3Color(selectedBanner?.line3_color || "#ffffff");
      setLine3FontSize(selectedBanner?.line3_font_size || "48");
      setLine3FontFamily(selectedBanner?.line3_font_family || "Arial");

      setMobilePreview(selectedBanner?.mobile_banner || "");
      setDesktopPreview(selectedBanner?.desktop_banner || "");
      setIsUploading(false);
    } else {
      // Reset when dialog closes
      setMobileFile(null);
      setDesktopFile(null);
      setPageType("products");
      setItemLink("");

      setHeadingLine1("");
      setLine1Color("#ffffff");
      setLine1FontSize("48");
      setLine1FontFamily("Arial");

      setHeadingLine2("");
      setLine2Color("#ffffff");
      setLine2FontSize("48");
      setLine2FontFamily("Arial");

      setHeadingLine3("");
      setLine3Color("#ffffff");
      setLine3FontSize("48");
      setLine3FontFamily("Arial");

      setMobilePreview("");
      setDesktopPreview("");
      setIsUploading(false);
    }
  }, [isOpen, selectedBanner]);

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMobilePreview(previewUrl);
    }
  };

  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setDesktopPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For updates, files are optional (only update if new file provided)
    // For new banners, both files are required
    if (!selectedBanner) {
      if (!mobileFile || !desktopFile) {
        return;
      }
    }

    setIsUploading(true);
    try {
      await onSave(
        mobileFile,
        desktopFile,
        pageType,
        itemLink || undefined,
        headingLine1 || undefined,
        line1Color || undefined,
        line1FontSize || undefined,
        line1FontFamily || undefined,
        headingLine2 || undefined,
        line2Color || undefined,
        line2FontSize || undefined,
        line2FontFamily || undefined,
        headingLine3 || undefined,
        line3Color || undefined,
        line3FontSize || undefined,
        line3FontFamily || undefined,
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="text-purple-600" size={28} />
            {selectedBanner ? "Edit Banner" : "Add New Banner"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Page Type Selection */}
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-green-900">
                Banner Page Type *
              </h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Select where this banner will be displayed
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPageType("homepage")}
                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  pageType === "homepage"
                    ? "border-green-600 bg-green-100 text-green-900"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Homepage</span>
              </button>
              <button
                type="button"
                onClick={() => setPageType("products")}
                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  pageType === "products"
                    ? "border-green-600 bg-green-100 text-green-900"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
                }`}
              >
                <Package size={20} />
                <span className="font-medium">Products Page</span>
              </button>
              <button
                type="button"
                onClick={() => setPageType("featured")}
                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  pageType === "featured"
                    ? "border-green-600 bg-green-100 text-green-900"
                    : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
                }`}
              >
                <Star size={20} />
                <span className="font-medium">Featured Products</span>
              </button>
            </div>
          </div>

          {/* Featured Item Link - Only for Featured products */}
          {pageType === "featured" && (
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="text-yellow-600" size={24} />
                <h3 className="text-lg font-semibold text-yellow-900">
                  Featured Product Link *
                </h3>
              </div>
              <p className="text-sm text-yellow-800 mb-3 block">
                Enter the product ID or complete URL for the featured item.
              </p>
              <input
                type="text"
                value={itemLink}
                onChange={(e) => setItemLink(e.target.value)}
                placeholder="e.g., /products/my-awesome-product"
                className="w-full px-4 py-2 border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 bg-white text-gray-900"
                required={pageType === "featured"}
              />
            </div>
          )}

          {/* 3-Line Banner Heading Section */}
          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold text-orange-900">
                Banner Heading - 3 Lines (Optional)
              </h3>
            </div>

            <div className="mb-4 p-3 bg-white border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900 font-medium mb-2">
                ✍️ Create a multi-line banner heading with individual styling
              </p>
              <p className="text-xs text-orange-800">
                Each line can have its own text, color, font size, and font
                family. Use &lt;b&gt;&lt;/b&gt; tags for bold text.
              </p>
            </div>

            {/* Line 1 */}
            <div className="mb-4 p-4 bg-linear-to-r from-orange-100 to-white rounded-lg border border-orange-300">
              <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  1
                </span>
                First Line
              </h4>
              <input
                type="text"
                value={headingLine1}
                onChange={(e) => setHeadingLine1(e.target.value)}
                placeholder="e.g., Welcome to <b>Our Store</b>"
                className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 mb-3"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🎨 Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={line1Color}
                      onChange={(e) => setLine1Color(e.target.value)}
                      placeholder="#ffffff"
                      className="col-span-3 px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="color"
                      value={
                        line1Color.startsWith("#") ? line1Color : "#ffffff"
                      }
                      onChange={(e) => setLine1Color(e.target.value)}
                      className="w-full h-10 cursor-pointer rounded border-2 border-orange-300 col-span-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    📏 Size (px)
                  </label>
                  <input
                    type="number"
                    value={line1FontSize}
                    onChange={(e) => setLine1FontSize(e.target.value)}
                    min="12"
                    max="200"
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🔤 Font
                  </label>
                  <select
                    value={line1FontFamily}
                    onChange={(e) => setLine1FontFamily(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Arial_bold">Arial Bold</option>
                    <option value="Mukta Mahee">Mukta Mahee</option>
                    <option value="MyriadPro:300">Myriad Pro Light</option>
                    <option value="MyriadPro:400">Myriad Pro Regular</option>
                    <option value="MyriadPro:600">Myriad Pro Semibold</option>
                    <option value="MyriadPro:700">Myriad Pro Bold</option>
                    <option value="MyriadPro Condensed:400">
                      Myriad Pro Condensed
                    </option>
                    <option value="MyriadPro Condensed:700">
                      Myriad Pro Condensed Bold
                    </option>
                    <option value="Neuropol">Neuropol</option>
                    <option value="Play:400">Play Regular</option>
                    <option value="Play:700">Play Bold</option>
                    <option value="Poppins:300">Poppins Light</option>
                    <option value="Poppins:400">Poppins Regular</option>
                    <option value="Poppins:500">Poppins Medium</option>
                    <option value="Poppins:600">Poppins Semibold</option>
                    <option value="Poppins:700">Poppins Bold</option>
                    <option value="SF Pro Display:400">
                      SF Pro Display Regular
                    </option>
                    <option value="SF Pro Display:500">
                      SF Pro Display Medium
                    </option>
                    <option value="SF Pro Display:600">
                      SF Pro Display Semibold
                    </option>
                    <option value="SF Pro Display:700">
                      SF Pro Display Bold
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line 2 */}
            <div className="mb-4 p-4 bg-linear-to-r from-orange-100 to-white rounded-lg border border-orange-300">
              <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  2
                </span>
                Second Line
              </h4>
              <input
                type="text"
                value={headingLine2}
                onChange={(e) => setHeadingLine2(e.target.value)}
                placeholder="e.g., Get <b>50% OFF</b> Today!"
                className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 mb-3"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🎨 Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={line2Color}
                      onChange={(e) => setLine2Color(e.target.value)}
                      placeholder="#ffffff"
                      className="col-span-3 px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="color"
                      value={
                        line2Color.startsWith("#") ? line2Color : "#ffffff"
                      }
                      onChange={(e) => setLine2Color(e.target.value)}
                      className="w-full h-10 cursor-pointer rounded border-2 border-orange-300 col-span-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    📏 Size (px)
                  </label>
                  <input
                    type="number"
                    value={line2FontSize}
                    onChange={(e) => setLine2FontSize(e.target.value)}
                    min="12"
                    max="200"
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🔤 Font
                  </label>
                  <select
                    value={line2FontFamily}
                    onChange={(e) => setLine2FontFamily(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Arial_bold">Arial Bold</option>
                    <option value="Mukta Mahee">Mukta Mahee</option>
                    <option value="MyriadPro:300">Myriad Pro Light</option>
                    <option value="MyriadPro:400">Myriad Pro Regular</option>
                    <option value="MyriadPro:600">Myriad Pro Semibold</option>
                    <option value="MyriadPro:700">Myriad Pro Bold</option>
                    <option value="MyriadPro Condensed:400">
                      Myriad Pro Condensed
                    </option>
                    <option value="MyriadPro Condensed:700">
                      Myriad Pro Condensed Bold
                    </option>
                    <option value="Neuropol">Neuropol</option>
                    <option value="Play:400">Play Regular</option>
                    <option value="Play:700">Play Bold</option>
                    <option value="Poppins:300">Poppins Light</option>
                    <option value="Poppins:400">Poppins Regular</option>
                    <option value="Poppins:500">Poppins Medium</option>
                    <option value="Poppins:600">Poppins Semibold</option>
                    <option value="Poppins:700">Poppins Bold</option>
                    <option value="SF Pro Display:400">
                      SF Pro Display Regular
                    </option>
                    <option value="SF Pro Display:500">
                      SF Pro Display Medium
                    </option>
                    <option value="SF Pro Display:600">
                      SF Pro Display Semibold
                    </option>
                    <option value="SF Pro Display:700">
                      SF Pro Display Bold
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line 3 */}
            <div className="mb-4 p-4 bg-linear-to-r from-orange-100 to-white rounded-lg border border-orange-300">
              <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  3
                </span>
                Third Line
              </h4>
              <input
                type="text"
                value={headingLine3}
                onChange={(e) => setHeadingLine3(e.target.value)}
                placeholder="e.g., Limited Time Offer"
                className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 mb-3"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🎨 Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={line3Color}
                      onChange={(e) => setLine3Color(e.target.value)}
                      placeholder="#ffffff"
                      className="col-span-3 px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="color"
                      value={
                        line3Color.startsWith("#") ? line3Color : "#ffffff"
                      }
                      onChange={(e) => setLine3Color(e.target.value)}
                      className="w-full h-10 cursor-pointer rounded border-2 border-orange-300 col-span-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    📏 Size (px)
                  </label>
                  <input
                    type="number"
                    value={line3FontSize}
                    onChange={(e) => setLine3FontSize(e.target.value)}
                    min="12"
                    max="200"
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-900 mb-1">
                    🔤 Font
                  </label>
                  <select
                    value={line3FontFamily}
                    onChange={(e) => setLine3FontFamily(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white text-gray-900 text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Arial_bold">Arial Bold</option>
                    <option value="Mukta Mahee">Mukta Mahee</option>
                    <option value="MyriadPro:300">Myriad Pro Light</option>
                    <option value="MyriadPro:400">Myriad Pro Regular</option>
                    <option value="MyriadPro:600">Myriad Pro Semibold</option>
                    <option value="MyriadPro:700">Myriad Pro Bold</option>
                    <option value="MyriadPro Condensed:400">
                      Myriad Pro Condensed
                    </option>
                    <option value="MyriadPro Condensed:700">
                      Myriad Pro Condensed Bold
                    </option>
                    <option value="Neuropol">Neuropol</option>
                    <option value="Play:400">Play Regular</option>
                    <option value="Play:700">Play Bold</option>
                    <option value="Poppins:300">Poppins Light</option>
                    <option value="Poppins:400">Poppins Regular</option>
                    <option value="Poppins:500">Poppins Medium</option>
                    <option value="Poppins:600">Poppins Semibold</option>
                    <option value="Poppins:700">Poppins Bold</option>
                    <option value="SF Pro Display:400">
                      SF Pro Display Regular
                    </option>
                    <option value="SF Pro Display:500">
                      SF Pro Display Medium
                    </option>
                    <option value="SF Pro Display:600">
                      SF Pro Display Semibold
                    </option>
                    <option value="SF Pro Display:700">
                      SF Pro Display Bold
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            {(headingLine1 || headingLine2 || headingLine3) && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Preview (as it will appear):
                </p>
                <div className="p-4 bg-linear-to-r from-orange-50 to-white rounded-lg space-y-2">
                  {headingLine1 && (
                    <div
                      className="leading-tight"
                      style={{
                        color: line1Color,
                        fontSize: `${line1FontSize}px`,
                        fontFamily: line1FontFamily.split(":")[0],
                        fontWeight: line1FontFamily.includes(":")
                          ? line1FontFamily.split(":")[1]
                          : "normal",
                      }}
                      dangerouslySetInnerHTML={{ __html: headingLine1 }}
                    />
                  )}
                  {headingLine2 && (
                    <div
                      className="leading-tight"
                      style={{
                        color: line2Color,
                        fontSize: `${line2FontSize}px`,
                        fontFamily: line2FontFamily.split(":")[0],
                        fontWeight: line2FontFamily.includes(":")
                          ? line2FontFamily.split(":")[1]
                          : "normal",
                      }}
                      dangerouslySetInnerHTML={{ __html: headingLine2 }}
                    />
                  )}
                  {headingLine3 && (
                    <div
                      className="leading-tight"
                      style={{
                        color: line3Color,
                        fontSize: `${line3FontSize}px`,
                        fontFamily: line3FontFamily.split(":")[0],
                        fontWeight: line3FontFamily.includes(":")
                          ? line3FontFamily.split(":")[1]
                          : "normal",
                      }}
                      dangerouslySetInnerHTML={{ __html: headingLine3 }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Banner Section */}
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-blue-900">
                Mobile Banner {!selectedBanner && "*"}
              </h3>
            </div>

            <div className="mb-3 p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">
                📱 Recommended size: 768 x 400px
              </p>
              <p className="text-xs text-blue-800">
                Upload a high-quality image for mobile devices. Images are
                stored in Supabase Storage for optimal performance.
              </p>
            </div>

            <div className="mb-3">
              <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors bg-white">
                <div className="text-center">
                  <Upload className="mx-auto text-blue-600 mb-2" size={32} />
                  <p className="text-sm text-blue-900 font-medium">
                    {mobileFile
                      ? mobileFile.name
                      : selectedBanner
                        ? "Change Mobile Banner"
                        : "Upload Mobile Banner"}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMobileFileChange}
                  className="hidden"
                  required={!selectedBanner}
                />
              </label>
            </div>

            {mobilePreview && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Mobile Preview (768px wide):
                </p>
                <div className="relative w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={mobilePreview}
                    alt="Mobile banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Banner Section */}
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-purple-900">
                Desktop Banner {!selectedBanner && "*"}
              </h3>
            </div>

            <div className="mb-3 p-3 bg-white border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900 font-medium mb-2">
                🖥️ Recommended size: 1920 x 400px
              </p>
              <p className="text-xs text-purple-800">
                Upload a high-quality image for desktop devices. Images are
                stored in Supabase Storage for optimal performance.
              </p>
            </div>

            <div className="mb-3">
              <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors bg-white">
                <div className="text-center">
                  <Upload className="mx-auto text-purple-600 mb-2" size={32} />
                  <p className="text-sm text-purple-900 font-medium">
                    {desktopFile
                      ? desktopFile.name
                      : selectedBanner
                        ? "Change Desktop Banner"
                        : "Upload Desktop Banner"}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDesktopFileChange}
                  className="hidden"
                  required={!selectedBanner}
                />
              </label>
            </div>

            {desktopPreview && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Desktop Preview (full width):
                </p>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={desktopPreview}
                    alt="Desktop banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={isSaving || isUploading}
            >
              {isSaving || isUploading
                ? "Uploading..."
                : selectedBanner
                  ? "Update Banner"
                  : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BannersContent({
  banners: initialBanners,
}: BannersContentProps) {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } =
    useBanners(initialBanners);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<ProductBanner | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedBanner(null);
    setShowDialog(true);
  };

  const handleEdit = (banner: ProductBanner) => {
    setSelectedBanner(banner);
    setShowDialog(true);
  };

  const handleSave = async (
    mobileFile: File | null,
    desktopFile: File | null,
    pageType: BannerPageType,
    itemLink: string | undefined, // Added itemLink
    headingLine1?: string,
    line1Color?: string,
    line1FontSize?: string,
    line1FontFamily?: string,
    headingLine2?: string,
    line2Color?: string,
    line2FontSize?: string,
    line2FontFamily?: string,
    headingLine3?: string,
    line3Color?: string,
    line3FontSize?: string,
    line3FontFamily?: string,
  ) => {
    try {
      let mobileUrl = selectedBanner?.mobile_banner || "";
      let desktopUrl = selectedBanner?.desktop_banner || "";

      // Upload mobile banner if new file provided
      if (mobileFile) {
        mobileUrl = await uploadBannerImageClient(
          mobileFile,
          "mobile",
          selectedBanner?.id,
        );
      }

      // Upload desktop banner if new file provided
      if (desktopFile) {
        desktopUrl = await uploadBannerImageClient(
          desktopFile,
          "desktop",
          selectedBanner?.id,
        );
      }

      // Save to database
      if (selectedBanner) {
        await updateBanner(
          selectedBanner.id,
          {
            ...(mobileFile && { mobile_banner: mobileUrl }),
            ...(desktopFile && { desktop_banner: desktopUrl }),
            page_type: pageType,
            item_link: itemLink || null,
            heading_line1: headingLine1 || null,
            line1_color: line1Color || null,
            line1_font_size: line1FontSize || null,
            line1_font_family: line1FontFamily || null,
            heading_line2: headingLine2 || null,
            line2_color: line2Color || null,
            line2_font_size: line2FontSize || null,
            line2_font_family: line2FontFamily || null,
            heading_line3: headingLine3 || null,
            line3_color: line3Color || null,
            line3_font_size: line3FontSize || null,
            line3_font_family: line3FontFamily || null,
          },
          mobileFile ? selectedBanner.mobile_banner : undefined,
          desktopFile ? selectedBanner.desktop_banner : undefined,
        );
      } else {
        if (!mobileUrl || !desktopUrl) {
          throw new Error("Both mobile and desktop banners are required");
        }
        await createBanner(
          mobileUrl,
          desktopUrl,
          pageType,
          itemLink, // Added itemLink
          headingLine1,
          line1Color,
          line1FontSize,
          line1FontFamily,
          headingLine2,
          line2Color,
          line2FontSize,
          line2FontFamily,
          headingLine3,
          line3Color,
          line3FontSize,
          line3FontFamily,
        );
      }
      setShowDialog(false);
    } catch (error: any) {
      console.error("Error saving banner:", error);
      // Error is already handled by toast in useBanners
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      setIsDeleting(id);
      await deleteBanner(id);
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-purple-600" size={32} />
            Product Banners
          </h1>
          <p className="text-gray-600 mt-1">
            Manage responsive banners for the products page
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Note:</strong> Only one banner per page type will be
          displayed at a time. Mobile users see the mobile banner, desktop users
          see the desktop banner. If multiple banners exist for the same page,
          the most recent one will be shown.
        </p>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No banners yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first banner to display on the products page
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Add Your First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Banner #{banner.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        banner.page_type === "homepage"
                          ? "bg-green-100 text-green-800"
                          : banner.page_type === "products"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {banner.page_type === "homepage"
                        ? "🏠 Homepage"
                        : banner.page_type === "products"
                          ? "📦 Products"
                          : "⭐ Featured"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(banner.created_at).toLocaleDateString()}
                  </p>
                  {banner.updated_at !== banner.created_at && (
                    <p className="text-xs text-gray-400">
                      Updated:{" "}
                      {new Date(banner.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    disabled={isLoading}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={isLoading || isDeleting === banner.id}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Banner Heading Display - 3 Lines */}
              {(banner.heading_line1 ||
                banner.heading_line2 ||
                banner.heading_line3) && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-semibold text-orange-900 mb-3 flex items-center gap-1">
                    ✍️ Banner Heading (3 Lines):
                  </p>

                  {/* Line 1 */}
                  {banner.heading_line1 && (
                    <div className="mb-3 p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          Line 1
                        </span>
                      </div>
                      <div
                        className="font-medium leading-tight mb-2"
                        style={{
                          color: banner.line1_color || "#ffffff",
                          fontSize: banner.line1_font_size
                            ? `${Math.min(Number(banner.line1_font_size) / 3, 24)}px`
                            : "14px",
                          fontFamily: banner.line1_font_family || "Arial",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line1,
                        }}
                      />
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Color: {banner.line1_color || "#ffffff"}</span>
                        <span>Size: {banner.line1_font_size || "48"}px</span>
                        <span>Font: {banner.line1_font_family || "Arial"}</span>
                      </div>
                    </div>
                  )}

                  {/* Line 2 */}
                  {banner.heading_line2 && (
                    <div className="mb-3 p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          Line 2
                        </span>
                      </div>
                      <div
                        className="font-medium leading-tight mb-2"
                        style={{
                          color: banner.line2_color || "#ffffff",
                          fontSize: banner.line2_font_size
                            ? `${Math.min(Number(banner.line2_font_size) / 3, 24)}px`
                            : "14px",
                          fontFamily: banner.line2_font_family || "Arial",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line2,
                        }}
                      />
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Color: {banner.line2_color || "#ffffff"}</span>
                        <span>Size: {banner.line2_font_size || "48"}px</span>
                        <span>Font: {banner.line2_font_family || "Arial"}</span>
                      </div>
                    </div>
                  )}

                  {/* Line 3 */}
                  {banner.heading_line3 && (
                    <div className="p-3 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          Line 3
                        </span>
                      </div>
                      <div
                        className="font-medium leading-tight mb-2"
                        style={{
                          color: banner.line3_color || "#ffffff",
                          fontSize: banner.line3_font_size
                            ? `${Math.min(Number(banner.line3_font_size) / 3, 24)}px`
                            : "14px",
                          fontFamily: banner.line3_font_family || "Arial",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line3,
                        }}
                      />
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Color: {banner.line3_color || "#ffffff"}</span>
                        <span>Size: {banner.line3_font_size || "48"}px</span>
                        <span>Font: {banner.line3_font_family || "Arial"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Banner Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="text-blue-600" size={18} />
                    <h4 className="text-sm font-medium text-gray-700">
                      Mobile Banner
                    </h4>
                  </div>
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                    <Image
                      src={banner.mobile_banner}
                      alt="Mobile banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Desktop Banner Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="text-purple-600" size={18} />
                    <h4 className="text-sm font-medium text-gray-700">
                      Desktop Banner
                    </h4>
                  </div>
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                    <Image
                      src={banner.desktop_banner}
                      alt="Desktop banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <BannerDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSave}
        selectedBanner={selectedBanner}
        isSaving={isLoading}
      />
    </div>
  );
}
