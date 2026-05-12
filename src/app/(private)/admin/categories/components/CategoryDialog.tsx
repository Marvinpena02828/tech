"use client";

import { useState, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    title: string;
    description: string;
    imageIcon?: File | null;
    imageLink?: File | null;
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
  const [imageIconFile, setImageIconFile] = useState<File | null>(null);
  const [imageLinkFile, setImageLinkFile] = useState<File | null>(null);
  const [imageIconPreview, setImageIconPreview] = useState("");
  const [imageLinkPreview, setImageLinkPreview] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [removeIconImage, setRemoveIconImage] = useState(false);
  const [removeLinkImage, setRemoveLinkImage] = useState(false);

  // Filter categories to get only top-level categories
  const topLevelCategories = categories.filter(
    (cat) => !cat.parent_category_id && cat.id !== selectedCategory?.id,
  );

  // Update state when dialog opens or selectedCategory changes
  useEffect(() => {
    if (isOpen) {
      setImageIconFile(null);
      setImageLinkFile(null);
      setParentCategoryId(selectedCategory?.parent_category_id || "");
      setIsHighlighted(selectedCategory?.is_highlighted || false);
      setRemoveIconImage(false);
      setRemoveLinkImage(false);

      // Set preview if category has existing images
      if (selectedCategory?.image_icon) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${selectedCategory.image_icon}`;
        setImageIconPreview(url);
      } else {
        setImageIconPreview("");
      }

      if (selectedCategory?.image_link) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${selectedCategory.image_link}`;
        setImageLinkPreview(url);
      } else {
        setImageLinkPreview("");
      }
    }
  }, [isOpen, selectedCategory]);

  const handleImageIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageIconFile(file);
      setRemoveIconImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageIconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageLinkFile(file);
      setRemoveLinkImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageLinkPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageIcon = () => {
    setImageIconFile(null);
    setImageIconPreview("");
    setRemoveIconImage(true);
  };

  const clearImageLink = () => {
    setImageLinkFile(null);
    setImageLinkPreview("");
    setRemoveLinkImage(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await onSave({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageIcon: removeIconImage ? null : imageIconFile,
      imageLink: removeLinkImage ? null : imageLinkFile,
      parent_category_id: parentCategoryId || null,
      is_highlighted: isHighlighted,
    });

    // Reset state after save
    setImageIconFile(null);
    setImageLinkFile(null);
    setRemoveIconImage(false);
    setRemoveLinkImage(false);
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
              Image Icon
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageIconChange}
                disabled={isSaving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {imageIconPreview && !removeIconImage && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                  <Image
                    src={imageIconPreview}
                    alt="Category icon preview"
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={clearImageIcon}
                    disabled={isSaving}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP. Max 5MB
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image Link
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageLinkChange}
                disabled={isSaving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {imageLinkPreview && !removeLinkImage && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                  <Image
                    src={imageLinkPreview}
                    alt="Category image preview"
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={clearImageLink}
                    disabled={isSaving}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP. Max 5MB
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
