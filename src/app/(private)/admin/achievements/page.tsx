"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, Trash2, Edit2, Plus, Loader, AlertCircle, CheckCircle } from "lucide-react";
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

const STORAGE_BUCKET = "achievements";

export default function AdminAchievements() {
  const supabase = createClient();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_active: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [bucketReady, setBucketReady] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    setDebugInfo((prev) => [...prev, log]);
    console.log(log);
  };

  // Check authentication and bucket access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        addDebugLog("🔐 Checking authentication status...");
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          addDebugLog("❌ Not authenticated - please log in");
          setIsAuthenticated(false);
          return;
        }

        addDebugLog(`✅ Authenticated as: ${user.email}`);
        setUserEmail(user.email || "Unknown");
        setIsAuthenticated(true);

        // Now test bucket access
        testBucketAccess();
      } catch (error: any) {
        addDebugLog(`❌ Auth check error: ${error.message}`);
      }
    };

    const testBucketAccess = async () => {
      try {
        addDebugLog(`🔍 Testing bucket access for: '${STORAGE_BUCKET}'`);
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .list("", { limit: 1 });

        if (error) {
          addDebugLog(`❌ Cannot access bucket: ${error.message}`);
          toast.error(`Cannot access '${STORAGE_BUCKET}' bucket.`);
          setBucketReady(false);
          return;
        }

        addDebugLog(`✅ Bucket '${STORAGE_BUCKET}' is accessible!`);
        setBucketReady(true);
      } catch (error: any) {
        addDebugLog(`❌ Exception: ${error.message}`);
        setBucketReady(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      addDebugLog("📚 Fetching achievements from database...");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        addDebugLog(`❌ Database error: ${error.message}`);
        toast.error(`Database error: ${error.message}`);
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
    if (isAuthenticated) {
      fetchAchievements();
    }
  }, [isAuthenticated]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      addDebugLog(`📤 Starting upload: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

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

      addDebugLog(`📁 Using bucket: ${STORAGE_BUCKET}`);
      addDebugLog(`📍 File path: ${filePath}`);

      addDebugLog("🚀 Uploading to Supabase Storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        addDebugLog(`❌ Upload error: ${uploadError.message}`);
        throw uploadError;
      }

      addDebugLog(`✅ Upload successful: ${uploadData?.path}`);

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      addDebugLog(`🌐 Public URL: ${publicUrl}`);

      return { url: publicUrl, path: filePath };
    } catch (error: any) {
      addDebugLog(`❌ Upload exception: ${error.message}`);
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
        addDebugLog(`📝 Updating ID: ${editingId}`);
        const { error } = await supabase
          .from("achievements")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          addDebugLog(`❌ Update error: ${error.message}`);
          throw error;
        }
        addDebugLog("✅ Achievement updated in database");
        toast.success("Achievement updated!");
      } else {
        addDebugLog("📝 Inserting new achievement into database");
        const { error } = await supabase
          .from("achievements")
          .insert([payload]);

        if (error) {
          addDebugLog(`❌ Insert error: ${error.message}`);
          addDebugLog("💡 This might be an RLS policy issue - check: Supabase > Database > Policies");
          throw error;
        }
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
          .from(STORAGE_BUCKET)
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

  if (!isAuthenticated) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
            <h1 className="text-2xl font-bold mb-2">Not Authenticated</h1>
            <p className="text-gray-600">Please log in to access this page.</p>
            <a href="/admin" className="mt-4 inline-block text-blue-600 hover:underline">
              Go to Login →
            </a>
          </div>
          {debugInfo.length > 0 && (
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mt-8 font-mono text-xs max-h-40 overflow-y-auto">
              <p className="text-gray-500 mb-2">📋 Debug Log:</p>
              {debugInfo.map((log, i) => (
                <p key={i} className="text-gray-300">
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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

        {/* Auth Status */}
        {isAuthenticated && userEmail && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Authenticated</p>
                <p className="text-sm text-green-700">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Storage Status */}
        <div className={`rounded-lg p-4 mb-6 border-2 ${
          bucketReady 
            ? "bg-green-50 border-green-200" 
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className={`mt-0.5 flex-shrink-0 ${
              bucketReady ? "text-green-600" : "text-yellow-600"
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Storage Status</p>
              <p className={`text-sm mt-1 ${
                bucketReady 
                  ? "text-green-700" 
                  : "text-yellow-700"
              }`}>
                {bucketReady 
                  ? `✅ Bucket '${STORAGE_BUCKET}' is ready` 
                  : `⏳ Checking bucket access...`
                }
              </p>
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
              disabled={loading || uploadingImage || !bucketReady}
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
          <h2 className="text-xl font-semibold mb-4">Achievements ({achievements.length})</h2>

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
                          Order: {achievement.order_index}
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
