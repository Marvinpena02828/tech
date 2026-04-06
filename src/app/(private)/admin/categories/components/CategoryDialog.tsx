"use client";

import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { convertGoogleDriveUrl } from "@/lib/supabase/products";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    title: string;
    description: string;
    image_icon: string;
    image_link: string;
    parent_category_id: string | null;
    is_highlighted: boolean;
  }) => Promise<void>;
  selectedCategory: Category | null;
  isSaving: boolean;
  categories: Category[];
}

export default function CategoryDialog({
  isOpen,
  onClose,
  onSave,
  selectedCategory,
  isSaving,
  categories,
}: CategoryDialogProps) {
  const [imageIcon, setImageIcon] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLinkPreview, setImageLinkPreview] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Filter categories to get only top-level categories (parent_category_id is null)
  const topLevelCategories = categories.filter(
    (cat) => !cat.parent_category_id && cat.id !== selectedCategory?.id, // Exclude current category from parent options
  );

  // Update state when dialog opens or selectedCategory changes
  useEffect(() => {
    if (isOpen) {
      setImageIcon(selectedCategory?.image_icon || "");
      setImageLink(selectedCategory?.image_link || "");
      setParentCategoryId(selectedCategory?.parent_category_id || "");
      setIsHighlighted(selectedCategory?.is_highlighted || false);
      setImagePreview(
        selectedCategory?.image_icon
          ? convertGoogleDriveUrl(selectedCategory.image_icon)
          : "",
      );
      setImageLinkPreview(
        selectedCategory?.image_link
          ? convertGoogleDriveUrl(selectedCategory.image_link)
          : "",
      );
    }
  }, [isOpen, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSave({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_icon: imageIcon,
      image_link: imageLink,
      parent_category_id: parentCategoryId || null,
      is_highlighted: isHighlighted,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {selectedCategory ? "Edit Category" : "Add Category"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              name="title"
              defaultValue={selectedCategory?.title || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Power Bank"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={selectedCategory?.description || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description shown in dropdown"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category (Optional)
            </label>
            <select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None (Top Level Category)</option>
              {topLevelCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a parent category to create a subcategory
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlight on Landing Page
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_highlighted"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="is_highlighted"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Show this category in the Product Category section on the
                landing page
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only highlighted categories will appear in the homepage carousel
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Icon (Google Drive Link)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageIcon}
                  onChange={(e) => setImageIcon(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageIcon.trim()) {
                      setImagePreview(convertGoogleDriveUrl(imageIcon.trim()));
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shrink-0"
                >
                  <ImageIcon size={18} />
                  Preview
                </button>
              </div>
              {imagePreview && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Category icon preview"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Upload icon to Google Drive → Right-click → Get link → Anyone
                with link → Paste here
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image Link (Google Drive Link)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageLink.trim()) {
                      setImageLinkPreview(
                        convertGoogleDriveUrl(imageLink.trim()),
                      );
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shrink-0"
                >
                  <ImageIcon size={18} />
                  Preview
                </button>
              </div>
              {imageLinkPreview && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageLinkPreview}
                    alt="Category image preview"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Upload category image to Google Drive → Right-click → Get link →
                Anyone with link → Paste here
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
