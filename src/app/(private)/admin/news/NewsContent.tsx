"use client";

import { useState, useRef } from "react";
import { Newspaper, Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  createNews,
  updateNews,
  deleteNews,
  uploadNewsImage,
  type NewsItem,
} from "@/app/(private)/admin/news/models/news-model";
import {
  updateNewsBanner,
  uploadNewsBannerImage,
} from "@/app/(private)/admin/news/models/news-banner-model";

interface NewsContentProps {
  news: NewsItem[];
  currentBannerUrl?: string;
}

export default function NewsContent({ news: initialNews, currentBannerUrl = "" }: NewsContentProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [news, setNews] = useState(initialNews);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showBannerDialog, setShowBannerDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    caption: "",
    title: "",
    content: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Banner states
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentBannerUrl);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);
  const [bannerText, setBannerText] = useState({
    subtitle: "Empowered by",
    mainText: "INNOVATIONS",
    title: "News",
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete news article "${title}"?`)) return;

    setIsDeleting(id);
    const result = await deleteNews(id);

    setIsDeleting(null);

    if (!result.success) {
      toast.error(result.error || "Failed to delete news article");
    } else {
      toast.success("News article deleted");
      setNews(news.filter((n) => n.id !== id));
      router.refresh();
    }
  };

  const handleAdd = () => {
    setSelectedNews(null);
    setFormData({ caption: "", title: "", content: "", image_url: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowDialog(true);
  };

  const handleEdit = (item: NewsItem) => {
    setSelectedNews(item);
    setFormData({
      caption: item.caption,
      title: item.title,
      content: item.content,
      image_url: item.image_url,
    });
    setImageFile(null);
    setImagePreview(item.image_url);
    setShowDialog(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner image must be smaller than 10MB");
      return;
    }

    setBannerFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !imagePreview) {
      toast.error("Please select an image");
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadNewsImage(imageFile);

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed to upload image");
          setIsSaving(false);
          setIsUploadingImage(false);
          return;
        }

        imageUrl = uploadResult.data;
        setIsUploadingImage(false);
      }

      if (selectedNews) {
        const result = await updateNews(selectedNews.id, {
          caption: formData.caption,
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to update news");
        } else {
          toast.success("News updated successfully");
          
          // Update local state with the new data
          setNews(news.map(item =>
            item.id === selectedNews.id
              ? {
                  ...item,
                  caption: formData.caption,
                  title: formData.title,
                  content: formData.content,
                  image_url: imageUrl,
                  edited_at: new Date().toISOString(),
                }
              : item
          ));
          
          setShowDialog(false);
          router.refresh();
        }
      } else {
        const result = await createNews({
          caption: formData.caption,
          title: formData.title,
          content: formData.content,
          image_url: imageUrl,
        });

        if (!result.success) {
          toast.error(result.error || "Failed to create news");
        } else {
          toast.success("News created successfully");
          setShowDialog(false);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + (error instanceof Error ? error.message : "")
      );
    }

    setIsSaving(false);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFile && !bannerPreview) {
      toast.error("Please select a banner image");
      return;
    }

    setIsSavingBanner(true);

    try {
      let bannerUrl = bannerPreview;

      if (bannerFile) {
        setIsUploadingBannerImage(true);
        const uploadResult = await uploadNewsBannerImage(bannerFile);

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed to upload banner");
          setIsSavingBanner(false);
          setIsUploadingBannerImage(false);
          return;
        }

        bannerUrl = uploadResult.data;
        setIsUploadingBannerImage(false);
      }

      if (!bannerUrl) {
        toast.error("Banner image URL is missing");
        setIsSavingBanner(false);
        return;
      }

      // Call banner update server action
      const result = await updateNewsBanner({
        image_url: bannerUrl,
        subtitle: bannerText.subtitle,
        main_text: bannerText.mainText,
        title: bannerText.title,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update banner");
      } else {
        toast.success("Banner updated successfully");
        setBannerPreview(bannerUrl);
        setShowBannerDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        "An error occurred: " + (error instanceof Error ? error.message : "")
      );
    }

    setIsSavingBanner(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 mb-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="text-purple-600" size={32} />
                News & Updates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage news articles ({news.length} total)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBannerDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ImageIcon size={20} />
                Edit Banner
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} />
                Add News
              </button>
            </div>
          </div>
        </div>

        {/* News List */}
        {news.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Newspaper className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No news articles yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first news article
            </p>
            <button
              onClick={handleAdd}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add First Article
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    News
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Caption
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Edited
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {news.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Image failed to load:", item.image_url);
                                e.currentTarget.src = "";
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="line-clamp-2">{item.caption}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.edited_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={isDeleting === item.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* News Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedNews ? "Edit News Article" : "Add News Article"}
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={formData.caption}
                      onChange={(e) =>
                        setFormData({ ...formData, caption: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={6}
                      required
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative">
                        <div className="w-full bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              console.error("Preview image failed to load");
                              e.currentTarget.src = "";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors flex flex-col items-center gap-2"
                      >
                        <Upload className="text-gray-400" size={32} />
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500">
                          Max 5MB (PNG, JPG, GIF, WebP)
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving || isUploadingImage}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <>
                          {isUploadingImage ? "Uploading image..." : "Saving..."}
                        </>
                      ) : selectedNews ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDialog(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Banner Dialog */}
        {showBannerDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Edit News Banner</h2>

                <form onSubmit={handleSaveBanner} className="space-y-4">
                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image
                    </label>

                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      className="hidden"
                    />

                    {bannerPreview ? (
                      <div className="relative">
                        <div className="w-full bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                          <img
                            src={bannerPreview}
                            alt="Banner Preview"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              console.error("Banner preview failed to load");
                              e.currentTarget.src = "";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFile(null);
                            setBannerPreview(null);
                            if (bannerInputRef.current) {
                              bannerInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
                      >
                        <Upload className="text-gray-400" size={32} />
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload banner image
                        </span>
                        <span className="text-xs text-gray-500">
                          Max 10MB (PNG, JPG, GIF, WebP) - Recommended: 1920x500px
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Banner Text Fields */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Banner Text Overlay
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={bannerText.subtitle}
                        onChange={(e) =>
                          setBannerText({ ...bannerText, subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Empowered by"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Main Text
                      </label>
                      <input
                        type="text"
                        value={bannerText.mainText}
                        onChange={(e) =>
                          setBannerText({ ...bannerText, mainText: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., INNOVATIONS"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={bannerText.title}
                        onChange={(e) =>
                          setBannerText({ ...bannerText, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., News"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSavingBanner || isUploadingBannerImage}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSavingBanner ? (
                        <>
                          {isUploadingBannerImage ? "Uploading..." : "Saving..."}
                        </>
                      ) : (
                        "Update Banner"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBannerDialog(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
