"use client";

import { useState } from "react";
import { Upload, Trash2, Eye, AlertCircle } from "lucide-react";
import { useLogos } from "@/lib/hooks/useLogos";
import toast from "react-hot-toast";

const LOGO_SPECS = {
  main: {
    label: "Main Logo",
    description: "Desktop header logo",
    recommendedSize: "300x100px (or 3:1 ratio)",
    maxSize: "2MB",
  },
  mobile: {
    label: "Mobile Logo",
    description: "Mobile header logo (smaller)",
    recommendedSize: "150x150px (or square)",
    maxSize: "1MB",
  },
  favicon: {
    label: "Favicon",
    description: "Browser tab icon",
    recommendedSize: "32x32px or 64x64px",
    maxSize: "500KB",
  },
};

export default function LogoSettings() {
  const { logos, loading, handleLogoUpload, getLogo } = useLogos();
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    logoType: "main" | "mobile" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (in MB)
    const maxSizeMB =
      logoType === "favicon" ? 0.5 : logoType === "mobile" ? 1 : 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        `File size should be less than ${maxSizeMB}MB for ${logoType}`
      );
      return;
    }

    try {
      setUploading(logoType);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      await handleLogoUpload(file, logoType, {
        alt_text: `AyyanTech ${logoType} logo`,
      });

      // Reset preview
      setTimeout(() => setPreviewUrl(null), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(null);
      e.target.value = ""; // Reset input
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading logo settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Logo Management
          </h1>
          <p className="text-gray-600">
            Manage your website logos - main, mobile, and favicon
          </p>
        </div>

        {/* Logo Cards */}
        <div className="grid gap-6">
          {(["main", "mobile", "favicon"] as const).map((logoType) => {
            const logo = getLogo(logoType);
            const spec = LOGO_SPECS[logoType];

            return (
              <div
                key={logoType}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Title & Description */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {spec.label}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {spec.description}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Recommended size:</p>
                        <p>{spec.recommendedSize}</p>
                        <p className="mt-1">Max file size: {spec.maxSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Logo Preview */}
                  {logo?.url && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Current Logo
                      </p>
                      <div className="bg-gray-100 rounded p-4 flex items-center justify-center min-h-32">
                        <img
                          src={logo.url}
                          alt={logo.alt_text || logoType}
                          className="max-w-full max-h-32 object-contain"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Updated: {new Date(logo.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="mb-4">
                    <label
                      htmlFor={`logo-${logoType}`}
                      className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Upload size={20} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {uploading === logoType ? "Uploading..." : "Upload New Logo"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click to select or drag and drop
                      </p>
                      <input
                        id={`logo-${logoType}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, logoType)}
                        disabled={uploading === logoType}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview (if uploading) */}
                  {uploading === logoType && previewUrl && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded p-4">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        Preview
                      </p>
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="max-w-full max-h-32 mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Usage Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Main logo appears in desktop header navigation</li>
            <li>• Mobile logo displays on mobile/tablet screens</li>
            <li>• Favicon shows in browser tabs and bookmarks</li>
            <li>• Use PNG or SVG format for best quality</li>
            <li>• Transparent backgrounds work best for logos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
