"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Save,
  Upload,
  Eye,
  X,
  Loader,
} from "lucide-react";

interface ContactBannerData {
  id?: string;
  banner_image_url: string;
  banner_height: number;
  banner_title: string;
  title_color: string;
  title_size: string;
  title_position_top: number;
  title_position_left: number;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ContactBannerAdmin() {
  const supabase = createClient();

  const [banner, setBanner] = useState<ContactBannerData | null>(null);
  const [editedBanner, setEditedBanner] = useState<ContactBannerData>({
    banner_image_url: "",
    banner_height: 500,
    banner_title: "Contact Us",
    title_color: "text-black",
    title_size: "text-5xl",
    title_position_top: 85,
    title_position_left: 7,
    overlay_enabled: false,
    overlay_color: "rgba(0,0,0,0.3)",
    overlay_opacity: 0.3,
    is_active: true,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("contact_banner")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching banner:", error);
        return;
      }

      if (data) {
        setBanner(data);
        setEditedBanner(data);
        setBannerImagePreview(data.banner_image_url);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = `contact-banner/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setEditedBanner({ ...editedBanner, banner_image_url: publicUrl });
      setBannerImagePreview(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!editedBanner.banner_image_url.trim()) {
      toast.error("Banner image required");
      return;
    }

    try {
      const updateData = {
        ...editedBanner,
        updated_at: new Date().toISOString(),
      };

      if (banner?.id) {
        await supabase
          .from("contact_banner")
          .update(updateData)
          .eq("id", banner.id);
      } else {
        await supabase
          .from("contact_banner")
          .insert([{ ...updateData, is_active: true }]);
      }

      toast.success("Banner saved successfully");
      fetchBannerData();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Contact Banner CMS
        </h1>
        <p className="text-gray-600">
          Manage the contact banner displayed at the top of the contact page
        </p>
      </div>

      {/* Preview Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
        >
          <Eye size={18} />
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </button>
      </div>

      {previewMode ? (
        // Preview Section
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Preview</h3>
          <div
            className="relative w-full overflow-hidden rounded-lg shadow-lg"
            style={{ height: `${editedBanner.banner_height}px` }}
          >
            {/* Background Image */}
            {editedBanner.banner_image_url && (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${editedBanner.banner_image_url}')`,
                }}
              />
            )}

            {/* Overlay */}
            {editedBanner.overlay_enabled && (
              <div
                className="absolute inset-0 z-5"
                style={{
                  backgroundColor: editedBanner.overlay_color,
                  opacity: editedBanner.overlay_opacity,
                }}
              />
            )}

            {/* Title */}
            <div
              className="absolute z-10 px-4"
              style={{
                bottom: `${100 - editedBanner.title_position_top}%`,
                left: `${editedBanner.title_position_left}%`,
                transform: "translateY(50%)",
              }}
            >
              <h1
                className={`${editedBanner.title_color} font-semibold ${editedBanner.title_size}`}
              >
                {editedBanner.banner_title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        // Edit Section
        <div className="space-y-8">
          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Banner Image
              </h3>

              {/* Image Preview */}
              {bannerImagePreview && (
                <div className="mb-4 relative">
                  <img
                    src={bannerImagePreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setBannerImagePreview("");
                      setEditedBanner({
                        ...editedBanner,
                        banner_image_url: "",
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Upload Area */}
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  {uploadingImage ? (
                    <>
                      <Loader size={24} className="animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Banner Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Banner Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Height (px)
                </label>
                <input
                  type="number"
                  value={editedBanner.banner_height}
                  onChange={(e) =>
                    setEditedBanner({
                      ...editedBanner,
                      banner_height: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overlay Opacity (0-1)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={editedBanner.overlay_opacity}
                  onChange={(e) =>
                    setEditedBanner({
                      ...editedBanner,
                      overlay_opacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="overlay_enabled"
                checked={editedBanner.overlay_enabled}
                onChange={(e) =>
                  setEditedBanner({
                    ...editedBanner,
                    overlay_enabled: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <label htmlFor="overlay_enabled" className="text-sm font-medium text-gray-700">
                Enable Overlay
              </label>
            </div>
          </div>

          {/* Title Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Title Settings</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Text
              </label>
              <input
                type="text"
                value={editedBanner.banner_title}
                onChange={(e) =>
                  setEditedBanner({
                    ...editedBanner,
                    banner_title: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Color
                </label>
                <select
                  value={editedBanner.title_color}
                  onChange={(e) =>
                    setEditedBanner({
                      ...editedBanner,
                      title_color: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="text-white">White</option>
                  <option value="text-black">Black</option>
                  <option value="text-gray-900">Dark Gray</option>
                  <option value="text-blue-600">Blue</option>
                  <option value="text-purple-600">Purple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Size
                </label>
                <select
                  value={editedBanner.title_size}
                  onChange={(e) =>
                    setEditedBanner({
                      ...editedBanner,
                      title_size: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="text-3xl">3xl</option>
                  <option value="text-4xl">4xl</option>
                  <option value="text-5xl">5xl</option>
                  <option value="text-6xl">6xl</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position from Left (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editedBanner.title_position_left}
                    onChange={(e) =>
                      setEditedBanner({
                        ...editedBanner,
                        title_position_left: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {editedBanner.title_position_left}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position from Bottom (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editedBanner.title_position_top}
                    onChange={(e) =>
                      setEditedBanner({
                        ...editedBanner,
                        title_position_top: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {editedBanner.title_position_top}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveBanner}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg w-full justify-center"
          >
            <Save size={20} />
            Save Contact Banner
          </button>
        </div>
      )}
    </div>
  );
}
