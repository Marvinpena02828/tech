"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, X, Loader2, Eye, EyeOff } from "lucide-react";

interface Award {
  id: string;
  images: string[]; // Array of image URLs
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AwardPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Fetch awards
  const fetchAwards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("awards")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setAwards(data || []);
    } catch (err) {
      console.error("Error fetching awards:", err);
      toast.error("Failed to load awards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImagePreviews((prev) => [
          ...prev,
          event.target?.result as string,
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Remove uploaded image preview
  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = async (awardId: string, imageUrl: string) => {
    try {
      const award = awards.find((a) => a.id === awardId);
      if (!award) return;

      const updatedImages = award.images.filter((img) => img !== imageUrl);
      
      if (updatedImages.length === 0) {
        // If no images left, delete the award
        const { error } = await supabase
          .from("awards")
          .delete()
          .eq("id", awardId);
        if (error) throw error;
      } else {
        // Otherwise just update the images
        const { error } = await supabase
          .from("awards")
          .update({ images: updatedImages })
          .eq("id", awardId);
        if (error) throw error;
      }
      
      await fetchAwards();
      toast.success("Image removed");
    } catch (err) {
      console.error("Error removing image:", err);
      toast.error("Failed to remove image");
    }
  };

  // Upload images to storage
  const uploadImagesToStorage = async (
    awardId: string
  ): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of uploadedImages) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${awardId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("awards")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("awards").getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Failed to upload one or more images");
      }
    }

    return uploadedUrls;
  };

  // Save award (upload images)
  const handleSave = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate unique ID for this award entry
      const awardId = Date.now().toString();

      // Upload new images
      const newImageUrls = await uploadImagesToStorage(awardId);

      if (newImageUrls.length === 0) {
        toast.error("Failed to upload images");
        return;
      }

      // Create new award
      const { error } = await supabase.from("awards").insert({
        images: newImageUrls,
        display_order: (awards.length || 0) + 1,
        is_active: true,
      });

      if (error) throw error;
      toast.success("Award images uploaded successfully");

      setUploadedImages([]);
      setUploadedImagePreviews([]);
      await fetchAwards();
    } catch (err) {
      console.error("Error saving award:", err);
      toast.error("Failed to save award");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete entire award entry
  const handleDelete = async (awardId: string) => {
    if (!confirm("Are you sure you want to delete this award entry?")) return;

    try {
      const { error } = await supabase.from("awards").delete().eq("id", awardId);

      if (error) throw error;
      toast.success("Award deleted successfully");
      await fetchAwards();
    } catch (err) {
      console.error("Error deleting award:", err);
      toast.error("Failed to delete award");
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (award: Award) => {
    try {
      const { error } = await supabase
        .from("awards")
        .update({ is_active: !award.is_active })
        .eq("id", award.id);

      if (error) throw error;
      await fetchAwards();
      toast.success(
        award.is_active ? "Award hidden" : "Award displayed"
      );
    } catch (err) {
      console.error("Error toggling visibility:", err);
      toast.error("Failed to update visibility");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Awards Management</h1>
          <p className="text-slate-600">Upload and manage award images</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Upload Award Images
          </h2>

          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Images
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                  <p className="text-slate-600 font-medium">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Uploaded Image Previews */}
              {uploadedImagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Images to Upload ({uploadedImagePreviews.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSubmitting || uploadedImages.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Uploading...
                  </>
                ) : (
                  "Upload Award Images"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Awards List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            All Awards ({awards.length})
          </h2>

          {awards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-lg">No awards yet. Upload some images to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                >
                  {/* Header with visibility toggle */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        award.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {award.is_active ? "Active" : "Hidden"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(award)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                        title={award.is_active ? "Hide" : "Show"}
                      >
                        {award.is_active ? (
                          <Eye size={20} className="text-slate-600" />
                        ) : (
                          <EyeOff size={20} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Images Grid */}
                  {award.images && award.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        Images ({award.images.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {award.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Award ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeExistingImage(award.id, imageUrl)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleDelete(award.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 rounded-lg transition"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
