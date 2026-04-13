"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, Trash2, Edit2, Plus, Loader, AlertCircle } from "lucide-react";
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

// CHANGE THIS TO YOUR BUCKET NAME
// Supabase doesn't allow "public" - use something like:
// - "achievements" 
// - "techon-images"
// - "images"
// - "assets"
const STORAGE_BUCKET = "achievements"; // ← Change this to your bucket name!

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
  const [bucketsList, setBucketsList] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState(STORAGE_BUCKET);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    setDebugInfo((prev) => [...prev, log]);
    console.log(log);
  };

  // Fetch available buckets on mount
  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        addDebugLog("Fetching available storage buckets...");
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          addDebugLog(`❌ Error fetching buckets: ${error.message}`);
          toast.error("Could not load storage buckets");
          return;
        }

        const bucketNames = data.map((b: any) => b.name);
        setBucketsList(bucketNames);
        addDebugLog(`✅ Found buckets: ${bucketNames.join(", ")}`);

        // Check if our default bucket exists
        if (bucketNames.includes(STORAGE_BUCKET)) {
          setSelectedBucket(STORAGE_BUCKET);
          addDebugLog(`✅ Using bucket: '${STORAGE_BUCKET}'`);
        } else if (bucketNames.length > 0) {
          setSelectedBucket(bucketNames[0]);
          addDebugLog(`⚠️ Default bucket '${STORAGE_BUCKET}' not found!`);
          addDebugLog(`Using first available: '${bucketNames[0]}'`);
          addDebugLog(`💡 Create a bucket named '${STORAGE_BUCKET}' to use as default`);
        } else {
          addDebugLog("❌ No buckets found! Create one in Supabase Dashboard.");
          toast.error("No storage buckets found. Create one in Supabase Dashboard.");
        }
      } catch (error: any) {
        addDebugLog(`❌ Exception: ${error.message}`);
      }
    };

    fetchBuckets();
  }, []);

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      addDebugLog("Fetching achievements from database...");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        addDebugLog(`❌ Database error: ${error.message}`);
        throw error;
      }

      addDebugLog(`✅ Loaded ${data?.length || 0} achievements`);
      setAchievements(data || []);
    } catch (error: any) {
      addDebugLog(`❌ Error: ${error.message}`);
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
      addDebugLog(`📤 Starting upload: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

      // Validate file
      if (!file.type.startsWith("image/")) {
        addDebugLog(`❌ Invalid file type: ${file.type}`);
        toast.error("Please select a valid image file");
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        addDebugLog(`❌ File too large: ${file.size} bytes (max 5MB)`);
        toast.error("File size must be less than 5MB");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `achievements/${fileName}`;

      addDebugLog(`📁 Bucket: ${selectedBucket}`);
      addDebugLog(`📍 Path: ${filePath}`);

      // Check if bucket exists by trying to list it
      addDebugLog("🔍 Checking bucket access...");
      const { data: listData, error: listError } = await supabase.storage
        .from(selectedBucket)
        .list("", { limit: 1 });

      if (listError) {
        addDebugLog(`❌ Cannot access bucket '${selectedBucket}': ${listError.message}`);
        addDebugLog(`💡 Make sure the bucket '${selectedBucket}' is PUBLIC in Supabase Dashboard`);
        toast.error(`Cannot access bucket '${selectedBucket}'. Is it PUBLIC?`);
        return null;
      }

      addDebugLog("✅ Bucket is accessible");

      // Upload file
      addDebugLog("📤 Uploading to Supabase Storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(selectedBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        addDebugLog(`❌ Upload error: ${uploadError.message}`);
        throw uploadError;
      }

      addDebugLog(`✅ Upload successful: ${uploadData?.path}`);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(selectedBucket)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      addDebugLog(`🌐 Public URL: ${publicUrl}`);

      return { url: publicUrl, path: filePath };
    } catch (error: any) {
      addDebugLog(`❌ Exception during upload: ${error.message}`);
      toast.error(`Upload failed: ${error.message}`);
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

    if (!selectedFile && !editingId) {
      toast.error("Image is required for new achievements");
      return;
    }

    try {
      setLoading(true);
      addDebugLog(editingId ? "📝 Updating achievement..." : "➕ Creating new achievement...");

      let imageUrl = null;
      let imagePath = null;

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

      if (imageUrl) {
        payload.image_url = imageUrl;
        payload.image_path = imagePath;
      }

      if (editingId) {
        addDebugLog(`Updating ID: ${editingId}`);
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        addDebugLog("✅ Achievement updated in database");
        toast.success("Achievement updated!");
      } else {
        addDebugLog("Inserting new achievement into database");
        const { error } = await supabase
          .from("achievements")
          .insert([payload]);

        if (error) throw error;
        addDebugLog("✅ Achievement created in database");
        toast.success("Achievement created!");
      }

      setFormData({ title: "", description: "", order_index: 0, is_active: true });
      setSelectedFile(null);
      setEditingId(null);
      fetchAchievements();
    } catch (error: any) {
      addDebugLog(`❌ Save error: ${error.message}`);
      toast.error(`Failed to save: ${error.message}`);
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
    addDebugLog(`📝 Editing achievement: ${achievement.title}`);
  };

  // Delete achievement
  const handleDelete = async (id: string, imagePath: string | null) => {
    if (!window.confirm("Delete this achievement?")) return;

    try {
      setLoading(true);
      addDebugLog(`🗑️ Deleting achievement: ${id}`);

      if (imagePath) {
        addDebugLog(`Deleting image: ${imagePath}`);
        const { error: deleteError } = await supabase.storage
          .from(selectedBucket)
          .remove([imagePath]);

        if (deleteError) {
          addDebugLog(`⚠️ Could not delete image: ${deleteError.message}`);
        } else {
          addDebugLog("✅ Image deleted from storage");
        }
      }

      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id);

      if (error) throw error;
      addDebugLog("✅ Achievement deleted from database");
      toast.success("Achievement deleted!");
      fetchAchievements();
    } catch (error: any) {
      addDebugLog(`❌ Delete error: ${error.message}`);
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", order_index: 0, is_active: true });
    setSelectedFile(null);
    setEditingId(null);
    addDebugLog("❌ Edit cancelled");
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

        {/* Storage Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Storage Bucket</p>
              {bucketsList.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm text-blue-800">
                    Current: <span className="font-mono font-bold">{selectedBucket}</span>
                  </p>
                  {bucketsList.length > 1 && (
                    <select
                      value={selectedBucket}
                      onChange={(e) => setSelectedBucket(e.target.value)}
                      className="mt-2 px-2 py-1 border border-blue-300 rounded text-sm"
                    >
                      {bucketsList.map((bucket) => (
                        <option key={bucket} value={bucket}>
                          {bucket}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-blue-700 mt-2">
                    Available: {bucketsList.join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600 mt-1">
                  ❌ No buckets found. Create a PUBLIC bucket in Supabase Dashboard &gt; Storage
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
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
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image {!editingId && "*"}
              </label>
              <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                <div className="text-center">
                  <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to upload"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || uploadingImage || bucketsList.length === 0}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading || uploadingImage) && (
                <Loader size={16} className="animate-spin" />
              )}
              {editingId ? "Update Achievement" : "Add Achievement"}
            </button>
          </div>
        </div>

        {/* Debug Console */}
        {debugInfo.length > 0 && (
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-8 font-mono text-xs max-h-40 overflow-y-auto">
            <p className="text-gray-500 mb-2">📋 Debug Log:</p>
            {debugInfo.map((log, i) => (
              <p key={i} className="text-gray-300">
                {log}
              </p>
            ))}
          </div>
        )}

        {/* List */}
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
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {achievement.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {achievement.order_index}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            achievement.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100"
                          }`}
                        >
                          {achievement.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(achievement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(achievement.id, achievement.image_path)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
