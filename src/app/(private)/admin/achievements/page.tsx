"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, Trash2, Edit2, Plus, Loader } from "lucide-react";
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

export default function AdminAchievements() {
  const supabase = createClient();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `achievements/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("public") // Make sure this bucket exists
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      return { url: data.publicUrl, path: filePath };
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Add or Update achievement
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      let imagePath = null;

      // If new file selected, upload it
      if (selectedFile) {
        const uploadResult = await handleImageUpload(selectedFile);
        if (uploadResult) {
          imageUrl = uploadResult.url;
          imagePath = uploadResult.path;
        } else {
          return;
        }
      }

      const payload: any = {
        title: formData.title,
        description: formData.description,
        order_index: formData.order_index,
        is_active: formData.is_active,
      };

      // Only update image if new one was uploaded
      if (imageUrl) {
        payload.image_url = imageUrl;
        payload.image_path = imagePath;
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Achievement updated!");
      } else {
        // Create
        const { error } = await supabase
          .from("achievements")
          .insert([payload]);

        if (error) throw error;
        toast.success("Achievement created!");
      }

      // Reset form
      setFormData({ title: "", description: "", order_index: 0, is_active: true });
      setSelectedFile(null);
      setEditingId(null);
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement");
    } finally {
      setLoading(false);
    }
  };

  // Edit achievement
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

  // Delete achievement
  const handleDelete = async (id: string, imagePath: string | null) => {
    if (!window.confirm("Delete this achievement?")) return;

    try {
      setLoading(true);

      // Delete image from storage if exists
      if (imagePath) {
        await supabase.storage.from("public").remove([imagePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Achievement deleted!");
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({ title: "", description: "", order_index: 0, is_active: true });
    setSelectedFile(null);
    setEditingId(null);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Achievements CMS</h1>
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Form Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Achievement" : "Add New Achievement"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., 12+ Years of Industry Experience"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter detailed description..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order_index: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                  <div className="text-center">
                    <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : "Click to upload"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || uploadingImage}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading || uploadingImage) && (
                <Loader size={16} className="animate-spin" />
              )}
              {editingId ? "Update Achievement" : "Add Achievement"}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>

          {loading && achievements.length === 0 ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No achievements yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {achievement.image_url && (
                      <div className="flex-shrink-0 w-24 h-24">
                        <Image
                          src={achievement.image_url}
                          alt={achievement.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {achievement.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Order: {achievement.order_index}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            achievement.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {achievement.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(achievement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(achievement.id, achievement.image_path)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
