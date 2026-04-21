"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, Trash2, Edit2, Loader, X } from "lucide-react";
import Image from "next/image";

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  order_index: number;
  is_active: boolean;
}

interface BannerData {
  id: string;
  image: string;
  updated_at: string;
}

// Try different bucket names
const STORAGE_BUCKETS = ["achievements", "uploads", "media", "images"];

export default function AdminAchievements() {
  const supabase = createClient();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    setDebugInfo((prev) => [...prev, log]);
    console.log(log);
  };

  // Find working bucket
  useEffect(() => {
    const findWorkingBucket = async () => {
      addDebugLog("🔍 Finding accessible storage bucket...");
      
      for (const bucket of STORAGE_BUCKETS) {
        try {
          const { error } = await supabase.storage.from(bucket).list("", { limit: 1 });
          
          if (!error) {
            addDebugLog(`✅ Using bucket: '${bucket}'`);
            setActiveBucket(bucket);
            return;
          }
        } catch (err) {
          // Continue to next bucket
        }
      }
      
      addDebugLog(`⚠️ No accessible buckets found`);
      toast.error("No accessible storage buckets found");
    };

    findWorkingBucket();
  }, []);

  // Fetch banner
  const fetchBanner = async () => {
    try {
      const response = await fetch("/api/achievements-banner");
      if (response.ok) {
        const data = await response.json();
        setBanner(data);
        setBannerImagePreview(data.image);
      }
    } catch (error) {
      console.error("Failed to load banner:", error);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      addDebugLog("📚 Fetching achievements...");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        addDebugLog(`❌ Fetch error: ${error.message}`);
        throw error;
      }

      addDebugLog(`✅ Loaded ${data?.length || 0} achievements`);
      setAchievements(data || []);
    } catch (error: any) {
      addDebugLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
    fetchAchievements();
  }, []);

  // Handle banner image select
  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner image must be less than 10MB");
      return;
    }

    setBannerImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload banner image
  const uploadBannerImage = async (file: File): Promise<string> => {
    try {
      setUploadingBanner(true);
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const fileName = `achievements/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const { data, error } = await supabase.storage
        .from(activeBucket || "images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(activeBucket || "images").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handle banner submit
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerImageFile && !banner?.image) {
      toast.error("Please select a banner image");
      return;
    }

    try {
      let imageUrl = banner?.image || "";

      if (bannerImageFile) {
        imageUrl = await uploadBannerImage(bannerImageFile);
      }

      const method = banner ? "PUT" : "POST";
      const url = banner ? `/api/achievements-banner/${banner.id}` : "/api/achievements-banner";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Banner updated successfully!");
      setIsBannerModalOpen(false);
      setBannerImageFile(null);
      fetchBanner();
    } catch (error) {
      toast.error("Failed to update banner");
      console.error(error);
    }
  };

  // Handle image upload with fallback
  const handleImageUpload = async (file: File) => {
    if (!activeBucket) {
      addDebugLog("❌ No active bucket available");
      toast.error("No storage bucket available");
      return null;
    }

    try {
      setUploadingImage(true);
      addDebugLog(`📤 Uploading: ${file.name}`);

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be smaller than 5MB");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `achievements/${fileName}`;

      addDebugLog(`🚀 Uploading to bucket: ${activeBucket}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(activeBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        addDebugLog(`❌ Upload error: ${uploadError.message}`);
        
        // Try other buckets as fallback
        addDebugLog("🔄 Trying fallback buckets...");
        for (const bucket of STORAGE_BUCKETS) {
          if (bucket === activeBucket) continue;
          
          try {
            const { data: fallbackData, error: fallbackError } = await supabase.storage
              .from(bucket)
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (!fallbackError) {
              addDebugLog(`✅ Uploaded to fallback bucket: ${bucket}`);
              const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
              
              return { url: urlData.publicUrl, path: filePath, bucket };
            }
          } catch (err) {
            continue;
          }
        }
        
        throw uploadError;
      }

      addDebugLog(`✅ Upload successful`);

      const { data: publicUrlData } = supabase.storage
        .from(activeBucket)
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl, path: filePath, bucket: activeBucket };
    } catch (error: any) {
      addDebugLog(`❌ Exception: ${error.message}`);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Save achievement
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description required");
      return;
    }

    if (!selectedFile && !editingId) {
      toast.error("Image required");
      return;
    }

    try {
      setLoading(true);
      addDebugLog(editingId ? "📝 Updating..." : "➕ Creating...");

      let imageUrl = null;
      let imagePath = null;

      if (selectedFile) {
        const uploadResult = await handleImageUpload(selectedFile);
        if (!uploadResult) return;
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
      }

      const payload: any = {
        title: formData.title,
        description: formData.description,
        order_index: formData.order_index,
        is_active: formData.is_active,
      };

      if (imageUrl) {
        payload.image_url = imageUrl;
        payload.image_path = imagePath;
      }

      if (editingId) {
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Updated!");
      } else {
        const { error } = await supabase
          .from("achievements")
          .insert([payload]);

        if (error) throw error;
        toast.success("Created!");
      }

      setFormData({ title: "", description: "", order_index: 0, is_active: true });
      setSelectedFile(null);
      setEditingId(null);
      fetchAchievements();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setFormData({
      title: achievement.title,
      description: achievement.description,
      order_index: achievement.order_index,
      is_active: achievement.is_active,
    });
    setEditingId(achievement.id);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete?")) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Deleted!");
      fetchAchievements();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview(banner?.image || null);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setBannerImageFile(null);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Achievements Management</h1>

        {/* Banner Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Page Banner</h2>
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Edit2 size={20} />
              Edit Banner
            </button>
          </div>
          {banner?.image && (
            <div className="relative max-md:aspect-video md:h-[400px] overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={banner.image}
                alt="Page Banner"
                fill
                className="object-cover w-full"
                priority
                quality={90}
              />
            </div>
          )}
        </div>

        {/* Status */}
        {activeBucket && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              ✅ Storage bucket ready: <strong>{activeBucket}</strong>
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit" : "Add New"} Achievement
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                }
                placeholder="Order"
                className="px-4 py-2 border rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                Active
              </label>
            </div>

            <label className="block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Upload size={20} className="mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Click to upload image"}
              </p>
            </label>

            <button
              onClick={handleSave}
              disabled={loading || uploadingImage || !activeBucket}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(loading || uploadingImage) && <Loader size={16} className="animate-spin" />}
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>

        {/* Debug Log */}
        {debugInfo.length > 0 && (
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-8 font-mono text-xs max-h-32 overflow-y-auto">
            {debugInfo.map((log, i) => (
              <p key={i}>{log}</p>
            ))}
          </div>
        )}

        {/* List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Achievements ({achievements.length})</h2>

          {achievements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              No achievements yet
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white border rounded-lg p-4 flex gap-4"
                >
                  {achievement.image_url && (
                    <div className="flex-shrink-0 w-20 h-20">
                      <Image
                        src={achievement.image_url}
                        alt={achievement.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {achievement.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(achievement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner Modal */}
        {isBannerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Page Banner</h2>
                <button
                  onClick={handleCloseBannerModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleBannerSubmit} className="p-6 space-y-6">
                {/* Banner Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image *
                  </label>

                  <div className="mb-4">
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition bg-gray-50 hover:bg-purple-50">
                      <div className="flex flex-col items-center justify-center">
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB (Recommended: 1920x500px or similar)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageSelect}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                    </label>
                  </div>

                  {bannerImagePreview && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={bannerImagePreview}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeBannerImage}
                        disabled={uploadingBanner}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <X size={20} />
                      </button>
                      {uploadingBanner && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader size={32} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseBannerModal}
                    disabled={uploadingBanner}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingBanner || !bannerImagePreview}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadingBanner && <Loader size={18} className="animate-spin" />}
                    Update Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
