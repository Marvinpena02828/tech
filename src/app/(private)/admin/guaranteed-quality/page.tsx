"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, Upload, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Certificate {
  id: number;
  title: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
}

export default function GuaranteedQualityAdmin() {
  const supabase = createClient();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    alt_text: "",
    image_url: "",
  });

  // Fetch certificates
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("guaranteed_quality_certificates")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("certificates") // Bucket name
        .upload(`guaranteed-quality/${fileName}`, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("certificates")
        .getPublicUrl(`guaranteed-quality/${fileName}`);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.alt_text || !formData.image_url) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from("guaranteed_quality_certificates")
          .update({
            title: formData.title,
            alt_text: formData.alt_text,
            image_url: formData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Certificate updated");
      } else {
        // Insert
        const maxSort = Math.max(
          0,
          ...certificates.map((c) => c.sort_order)
        );

        const { error } = await supabase
          .from("guaranteed_quality_certificates")
          .insert([
            {
              title: formData.title,
              alt_text: formData.alt_text,
              image_url: formData.image_url,
              sort_order: maxSort + 1,
              is_active: true,
            },
          ]);

        if (error) throw error;
        toast.success("Certificate added");
      }

      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save certificate");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      const { error } = await supabase
        .from("guaranteed_quality_certificates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Certificate deleted");
      fetchCertificates();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("guaranteed_quality_certificates")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      fetchCertificates();
      toast.success(
        `Certificate ${!currentStatus ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update certificate");
    }
  };

  const handleDragEnd = async () => {
    if (draggedId === null) return;

    // Re-order certificates
    const reorderedCerts = certificates.map((cert, idx) => ({
      ...cert,
      sort_order: idx,
    }));

    try {
      for (const cert of reorderedCerts) {
        await supabase
          .from("guaranteed_quality_certificates")
          .update({ sort_order: cert.sort_order })
          .eq("id", cert.id);
      }

      setCertificates(reorderedCerts);
      setDraggedId(null);
      toast.success("Order updated");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to update order");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", alt_text: "", image_url: "" });
    setEditingId(null);
    setShowModal(false);
  };

  const openEditModal = (cert: Certificate) => {
    setFormData({
      title: cert.title,
      alt_text: cert.alt_text,
      image_url: cert.image_url,
    });
    setEditingId(cert.id);
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Guaranteed Quality Certificates
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Certificate
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">Loading...</div>
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              draggable
              onDragStart={() => setDraggedId(cert.id)}
              onDragEnd={handleDragEnd}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-move border border-gray-200"
            >
              {/* Image Preview */}
              <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {cert.image_url && (
                  <Image
                    src={cert.image_url}
                    alt={cert.alt_text}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewId(cert.id)}
                    className="p-2 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Eye size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <GripVertical size={16} className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{cert.alt_text}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <button
                    onClick={() => handleToggleActive(cert.id, cert.is_active)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      cert.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cert.is_active ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(cert)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No certificates yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add First Certificate
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Certificate" : "Add Certificate"}
            </h2>

            {/* Form */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Certificate title"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) =>
                    setFormData({ ...formData, alt_text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Image alt text"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Image
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors relative">
                    <Upload size={20} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {uploading ? "Uploading..." : "Choose Image"}
                    </span>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {formData.image_url && (
                  <div className="mt-3 relative">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        setFormData({ ...formData, image_url: "" })
                      }
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingId ? "Update" : "Add"} Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId !== null && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={certificates[certificates.findIndex((c) => c.id === previewId)]
                ?.image_url || ""}
              alt="Preview"
              width={500}
              height={667}
              className="w-full h-auto"
            />
            <button
              onClick={() => setPreviewId(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
