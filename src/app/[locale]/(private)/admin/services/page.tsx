"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Edit2, Plus, Upload, X, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
  created_at: string;
}

interface BannerData {
  id: string;
  image: string;
  updated_at: string;
}

export default function ServicesCMS() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    order: 0,
  });

  // Fetch services and banner
  useEffect(() => {
    fetchServices();
    fetchBanner();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setServices(data.sort((a: Service, b: Service) => a.order - b.order));
    } catch (error) {
      toast.error("Failed to load services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanner = async () => {
    try {
      const response = await fetch("/api/banner");
      if (response.ok) {
        const data = await response.json();
        setBanner(data);
        setBannerImagePreview(data.image);
      }
    } catch (error) {
      console.error("Failed to load banner:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const fileName = `services/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerImageFile && !banner?.image) {
      toast.error("Please select a banner image");
      return;
    }

    try {
      let imageUrl = banner?.image || "";

      if (bannerImageFile) {
        imageUrl = await uploadImage(bannerImageFile);
      }

      const method = banner ? "PUT" : "POST";
      const url = banner ? `/api/banner/${banner.id}` : "/api/banner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (!imageFile && !formData.image) {
      toast.error("Please select an image");
      return;
    }

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/services/${editingId}` : "/api/services";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          image: imageUrl,
          order: formData.order,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success(editingId ? "Service updated!" : "Service created!");
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: "", description: "", image: "", order: 0 });
      setImageFile(null);
      setImagePreview(null);
      fetchServices();
    } catch (error) {
      toast.error(editingId ? "Failed to update service" : "Failed to create service");
      console.error(error);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      image: service.image,
      order: service.order,
    });
    setImagePreview(service.image);
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Service deleted!");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", image: "", order: 0 });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setBannerImageFile(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
  };

  const removeBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview(banner?.image || null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ title: "", description: "", image: "", order: services.length });
              setImageFile(null);
              setImagePreview(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>
        <p className="text-gray-600">Create and manage your services content</p>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No services yet. Create your first service!</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Service Image */}
                <div className="md:col-span-1">
                  {service.image && (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{service.description}</p>
                  </div>
                  <div className="mt-4">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                      Order: {service.order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex flex-col gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., End-to-End OEM/ODM Solutions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter service description..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">HTML tags are supported (e.g., &lt;b&gt;, &lt;br/&gt;, &lt;ul&gt;)</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image *
                </label>

                <div className="mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition bg-gray-50 hover:bg-blue-50">
                    <div className="flex flex-col items-center justify-center">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={uploading}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Loader size={32} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !imagePreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading && <Loader size={18} className="animate-spin" />}
                  {editingId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                        PNG, JPG, GIF up to 10MB (Recommended: 1920x500px or similar aspect ratio)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageSelect}
                      className="hidden"
                      disabled={uploading}
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
                      disabled={uploading}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                    {uploading && (
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
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !bannerImagePreview}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading && <Loader size={18} className="animate-spin" />}
                  Update Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
