"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  Loader,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  getProductById,
  uploadProductImage,
  deleteProductImage,
  type Product,
} from "@/lib/supabase/products";
import toast from "react-hot-toast";
import {
  cmsProductSchema,
  type CMSProductFormData,
} from "@/lib/validations/product";
import { z } from "zod";
import { Category } from "@/lib/types";

const PREDEFINED_COLORS = [
  { name: "UK Black", hex: "#1A1A1A" },
  { name: "EU (UE) Black", hex: "#000000" },
  { name: "AU Black", hex: "#0F0F0F" },
  { name: "US Black", hex: "#0B0B0B" },
  { name: "UK White", hex: "#F5F5F5" },
  { name: "EU (UE) White", hex: "#FFFFFF" },
  { name: "AU White", hex: "#FAFAFA" },
  { name: "US White", hex: "#FFFFFF" },
];

interface ProductFormProps {
  productId?: string;
  categories?: Category[];
}

interface UploadProgress {
  [key: string]: number;
}

export default function ProductForm({
  productId,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    category: "",
    tags: [] as string[],
    short_description: "",
    images: [] as string[],
    thumbnail: [] as string[],
    description_images: [] as string[],
    features: [] as string[],
    specifications: {} as Record<string, string>,
    colors: [] as Array<{ name: string; hex: string }>,
    description: "",
    related_products: [] as string[],
    is_active: true,
    video_link: "",
    downloads_link: "",
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [bulkSpecsInput, setBulkSpecsInput] = useState("");
  const [specInputMode, setSpecInputMode] = useState<"single" | "bulk">(
    "single"
  );

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    const product = await getProductById(productId);
    if (product) {
      setFormData({
        title: product.title,
        sku: product.sku,
        category: product.category.id,
        tags: product.tags || [],
        short_description: product.short_description || "",
        images: product.images || [],
        thumbnail: product.thumbnail || [],
        description_images: product.description_images || [],
        features: product.features || [],
        specifications: product.specifications || {},
        colors: product.colors || [],
        description: product.description || "",
        related_products: product.related_products || [],
        is_active: product.is_active ?? true,
        video_link: product.video_link || "",
        downloads_link: product.downloads_link || "",
      });
    }
    setLoading(false);
  };

  // Optimize image before upload (resize, compress)
  const optimizeImage = (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, "image/jpeg", quality);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload sa Supabase
  const handleFileUpload = async (
    files: File[],
    type: "thumbnail" | "image" | "description"
  ) => {
    setUploading(true);
    const uploadId = Date.now().toString();

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          continue;
        }

        const fileId = `${uploadId}-${file.name}`;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        try {
          // Optimize image
          const optimizedBlob = await optimizeImage(file);
          const optimizedFile = new File([optimizedBlob], file.name, {
            type: "image/jpeg",
          });

          // Upload to Supabase
          const url = await uploadProductImage(optimizedFile, type);

          // Add to form data
          setFormData((prev) => ({
            ...prev,
            [type === "description"
              ? "description_images"
              : type === "thumbnail"
                ? "thumbnail"
                : "images"]: [
              ...prev[
                type === "description"
                  ? "description_images"
                  : type === "thumbnail"
                    ? "thumbnail"
                    : "images"
              ],
              url,
            ],
          }));

          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "thumbnail" | "image"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files, type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const validatedData = cmsProductSchema.parse(formData);
      if (productId) {
        await updateProduct(productId, validatedData as any);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(validatedData as any);
        toast.success("Product created successfully!");
      }
      router.push("/admin/products");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        toast.error("Please fix the validation errors");
      } else {
        console.error("Error saving product:", error);
        toast.error("Failed to save product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number, type: "thumbnail" | "image" = "image") => {
    setFormData((prev) => ({
      ...prev,
      [type === "thumbnail" ? "thumbnail" : "images"]: prev[
        type === "thumbnail" ? "thumbnail" : "images"
      ].filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const addBulkSpecifications = () => {
    if (!bulkSpecsInput.trim()) return;

    const lines = bulkSpecsInput.trim().split("\n");
    const newSpecs: Record<string, string> = { ...formData.specifications };
    let successCount = 0;
    let errorLines: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const separators = [":", "=", "|"];
      let matched = false;

      for (const sep of separators) {
        if (trimmedLine.includes(sep)) {
          const parts = trimmedLine.split(sep);
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(sep).trim();
            if (key && value) {
              newSpecs[key] = value;
              successCount++;
              matched = true;
              break;
            }
          }
        }
      }

      if (!matched && trimmedLine) {
        errorLines.push(`Line ${index + 1}: "${trimmedLine}"`);
      }
    });

    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));

    if (successCount > 0) {
      toast.success(`Added ${successCount} specification(s)`);
      setBulkSpecsInput("");
    }

    if (errorLines.length > 0) {
      toast.error(
        `Skipped ${errorLines.length} invalid line(s). Check format.`
      );
    }
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addColor = () => {
    if (colorName.trim()) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { name: colorName.trim(), hex: colorHex }],
      }));
      setColorName("");
      setColorHex("#000000");
    }
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {productId ? "Edit Product" : "Add New Product"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Titan Power Bank 20000mAh"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sku ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., TITAN-130RC"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.short_description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  rows={3}
                  placeholder="Brief product description (10-500 characters)..."
                />
                {errors.short_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.short_description}
                  </p>
                )}
              </div>

              {/* Product Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status
                  </label>
                  <p className="text-sm text-gray-500">
                    {formData.is_active
                      ? "Product is visible on the website"
                      : "Product is hidden from the website"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.is_active ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail Images - Direct Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon size={24} />
              Thumbnail Images (Small Previews) - Up to 5 *
            </h2>

            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900 font-medium mb-2">
                📸 Direct upload to Supabase (no more Google Drive links - mas mabilis!)
              </p>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Suggested size: 1024x1024px or 1920x1080px</li>
                <li>Automatically optimized and compressed</li>
                <li>Max 10MB per image</li>
                <li>Drag & drop or click to select</li>
              </ul>
            </div>

            {/* Drag & Drop Zone - Thumbnails */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "thumbnail")}
              onClick={() => thumbnailInputRef.current?.click()}
              className={`mb-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                uploading
                  ? "border-purple-300 bg-purple-50"
                  : "border-purple-300 hover:border-purple-500 bg-purple-50 hover:bg-purple-100"
              }`}
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (formData.thumbnail.length + files.length > 5) {
                    toast.error("Maximum 5 thumbnails allowed");
                    return;
                  }
                  handleFileUpload(files, "thumbnail");
                }}
                className="hidden"
              />
              <Upload size={32} className="mx-auto mb-2 text-purple-600" />
              <p className="font-medium text-gray-900">
                Drag thumbnails here or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {5 - formData.thumbnail.length} slots remaining
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Thumbnail Preview */}
            {formData.thumbnail.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Preview ({formData.thumbnail.length}/5)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.thumbnail.map((thumb, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={thumb}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, "thumbnail")}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove thumbnail"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.thumbnail && (
              <p className="text-red-500 text-sm mt-2">{errors.thumbnail}</p>
            )}
          </div>

          {/* Product Images - Direct Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon size={24} />
              Product Images (Gallery - Direct Upload) *
            </h2>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">
                🖼️ Full-size gallery images - upload directly sa Supabase
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  Recommended: 1024x1024px or 1920x1080px (auto-optimized)
                </li>
                <li>First image becomes the main product image</li>
                <li>No Google Drive links needed - instant upload!</li>
              </ul>
            </div>

            {/* Drag & Drop Zone - Product Images */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "image")}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                uploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleFileUpload(files, "image");
                }}
                className="hidden"
              />
              <Upload size={32} className="mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-gray-900">
                Drag images here or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Support multiple selections
              </p>
            </div>

            {/* Gallery Preview */}
            {formData.images.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Gallery ({formData.images.length} images)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, "image")}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.images && (
              <p className="text-red-500 text-sm mt-4">{errors.images}</p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentFeature}
                onChange={(e) => setCurrentFeature(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>

            <ul className="space-y-2">
              {formData.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                >
                  <span className="flex-1">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>

            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                📋 How to Input Specifications
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-medium">You can use either method:</p>
                <div className="bg-white/50 p-3 rounded space-y-2">
                  <p className="font-semibold">1️⃣ Single Entry Mode:</p>
                  <p className="ml-4">
                    Add one specification at a time using the two input fields.
                  </p>

                  <p className="font-semibold mt-3">
                    2️⃣ Bulk Entry Mode (Recommended):
                  </p>
                  <p className="ml-4">Add multiple specifications at once.</p>
                  <ul className="ml-8 list-disc space-y-1 text-xs font-mono bg-gray-900 text-green-400 p-2 rounded">
                    <li>Weight: 355g</li>
                    <li>Battery Capacity = 20000mAh</li>
                    <li>Dimensions | 150 x 70 x 15 mm</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setSpecInputMode("single")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  specInputMode === "single"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Single Entry
              </button>
              <button
                type="button"
                onClick={() => setSpecInputMode("bulk")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  specInputMode === "bulk"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bulk Entry (Faster)
              </button>
            </div>

            {specInputMode === "single" && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., Weight)"
                />
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addSpecification())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., 355g)"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}

            {specInputMode === "bulk" && (
              <div className="mb-4">
                <textarea
                  value={bulkSpecsInput}
                  onChange={(e) => setBulkSpecsInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={8}
                  placeholder={`Weight: 355g
Battery Capacity = 20000mAh
Dimensions | 150 x 70 x 15 mm`}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={addBulkSpecifications}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add All
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSpecsInput("")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {Object.entries(formData.specifications).length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Specifications (
                      {Object.entries(formData.specifications).length})
                    </p>
                    {Object.entries(formData.specifications).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              "Clear all specifications?"
                            )
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              specifications: {},
                            }));
                            toast.success("Cleared");
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700 underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {Object.entries(formData.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-700 min-w-[150px]">
                          {key}:
                        </span>
                        <span className="flex-1 text-gray-600">{value}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  No specifications yet
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Colors</h2>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Quick Select:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PREDEFINED_COLORS.map((presetColor) => {
                  const isAdded = formData.colors.some(
                    (c) =>
                      c.name === presetColor.name && c.hex === presetColor.hex
                  );
                  return (
                    <button
                      key={presetColor.name}
                      type="button"
                      onClick={() => {
                        if (!isAdded) {
                          setFormData((prev) => ({
                            ...prev,
                            colors: [...prev.colors, presetColor],
                          }));
                        }
                      }}
                      disabled={isAdded}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        isAdded
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-gray-400"
                        style={{ backgroundColor: presetColor.hex }}
                      />
                      <span className="text-sm font-medium truncate">
                        {presetColor.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Or Add Custom:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Color name"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Selected:
              </p>
              {formData.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:shadow-sm"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-400"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-medium text-sm">{color.name}</span>
                      <span className="text-xs text-gray-500">
                        {color.hex.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="ml-2 text-red-600 hover:text-red-700 p-1 rounded"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  No colors added
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Full Description (HTML) *
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              rows={10}
              placeholder="Enter HTML formatted description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-2">{errors.description}</p>
            )}
          </div>

          {/* Video Link */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              🎥 YouTube Video (Optional)
            </h2>

            <input
              type="text"
              value={formData.video_link}
              onChange={(e) =>
                setFormData({ ...formData, video_link: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.video_link ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
            />

            {formData.video_link && extractYouTubeId(formData.video_link) && (
              <div className="mt-4 aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(
                    formData.video_link
                  )}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Downloads Link */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              📄 PDF Download (Optional)
            </h2>

            <input
              type="text"
              value={formData.downloads_link}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  downloads_link: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.downloads_link ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://drive.google.com/file/d/..."
            />

            {formData.downloads_link && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {formData.title || "Product Name"}
                    </h4>
                    <p className="text-xs text-gray-500">PDF</p>
                  </div>
                  <a
                    href={formData.downloads_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Test
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {loading
                ? "Saving..."
                : uploading
                  ? "Uploading..."
                  : productId
                    ? "Update"
                    : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
