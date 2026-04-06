"use client";

import { useState } from "react";
import {
  Images,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AppImage from "@/components/ui/AppImage";
import { convertDriveUrl } from "@/lib/utils/DriveLinkConverter";
import {
  createMarketingPhoto,
  updateMarketingPhoto,
  deleteMarketingPhoto,
  type MarketingPhoto,
} from "./models/marketing-photos-model";
import { convertGoogleDriveUrl } from "@/lib/supabase/products";

const EMPTY_FORM = {
  image_url: "",
  title: "",
  description: "",
  sort_order: 0,
  is_active: true,
};

export default function MarketingPhotosContent({
  photos: initialPhotos,
}: {
  photos: MarketingPhoto[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MarketingPhoto | null>(
    null,
  );
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setSelectedPhoto(null);
    setFormData({ ...EMPTY_FORM, sort_order: photos.length });
    setImagePreview("");
    setShowDialog(true);
  };

  const handleEdit = (photo: MarketingPhoto) => {
    setSelectedPhoto(photo);
    setFormData({
      image_url: photo.image_url,
      title: photo.title,
      description: photo.description,
      sort_order: photo.sort_order,
      is_active: photo.is_active,
    });
    setImagePreview(photo.image_url);
    setShowDialog(true);
  };

  const handleImageUrlChange = (raw: string) => {
    setFormData((prev) => ({ ...prev, image_url: raw }));
    if (raw.trim()) {
      const converted = convertDriveUrl(raw.trim());
      setImagePreview(converted);
    } else {
      setImagePreview("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);

    const payload = {
      image_url: formData.image_url.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      sort_order: Number(formData.sort_order) || 0,
      is_active: formData.is_active,
    };

    const result = selectedPhoto
      ? await updateMarketingPhoto(selectedPhoto.id, payload)
      : await createMarketingPhoto(payload);

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to save");
      return;
    }

    toast.success(selectedPhoto ? "Photo updated" : "Photo added");
    setShowDialog(false);
    router.refresh();
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    setIsDeleting(id);
    const result = await deleteMarketingPhoto(id);
    setIsDeleting(null);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete");
    } else {
      toast.success("Photo deleted");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Images className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                About — Marketing Photos
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage the 4-column photo grid on the About page
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Photo
          </button>
        </div>

        {/* Drive link hint */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <span className="font-semibold">
            How to get a Google Drive image link:
          </span>{" "}
          Upload image → Right-click → <em>Get link</em> → Set to{" "}
          <em>"Anyone with the link"</em> → Paste the share URL below. The link
          will be converted automatically.
        </div>

        {/* Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Images className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No photos yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Photo" to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-opacity ${
                  !photo.is_active ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative aspect-4/6 bg-gray-100">
                  <AppImage
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Order badge */}
                  <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    #{photo.sort_order + 1}
                  </span>
                  {/* Active badge */}
                  <span
                    className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      photo.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {photo.is_active ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {photo.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex border-t divide-x">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id, photo.title)}
                    disabled={isDeleting === photo.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {isDeleting === photo.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Dialog header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedPhoto ? "Edit Photo" : "Add Photo"}
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Google Drive image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Google Drive share link) *
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste any Google Drive share link — it will be converted
                  automatically.
                </p>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-4/3 relative">
                  <AppImage
                    src={convertGoogleDriveUrl(imagePreview)}
                    alt="Preview"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. More than 100 Employees"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Short description for this photo…"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              {/* Sort order & Active row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sort_order: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-indigo-600"
                    />
                    Active (visible on site)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : selectedPhoto ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
