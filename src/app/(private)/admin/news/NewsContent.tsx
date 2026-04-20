"use client";

import { useState, useRef } from "react";
import { Newspaper, Plus, Edit, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface NewsItem {
  id: string;
  caption: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  edited_at: string;
}

interface NewsContentProps {
  news: NewsItem[];
}

// Server actions
async function uploadNewsImage(file: File) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Image must be smaller than 5MB" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `news/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("news-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    return { success: false, error: `Upload failed: ${uploadError.message}` };
  }

  const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);
  return { success: true, data: data.publicUrl };
}

async function createNews(input: any) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("news")
    .insert({
      title: input.title.trim(),
      caption: input.caption.trim(),
      content: input.content.trim(),
      image_url: input.image_url,
      created_at: now,
      edited_at: now,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to create news" };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");

  return { success: true, data };
}

async function updateNews(id: string, input: any) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: any = { edited_at: new Date().toISOString() };
  if (input.title?.trim()) updateData.title = input.title.trim();
  if (input.caption?.trim()) updateData.caption = input.caption.trim();
  if (input.content?.trim()) updateData.content = input.content.trim();
  if (input.image_url?.trim()) updateData.image_url = input.image_url;

  const { data, error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to update news" };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");

  return { success: true, data };
}

async function deleteNews(id: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    return { success: false, error: "Failed to delete news" };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");

  return { success: true };
}

export default function NewsContent({ news: initialNews }: NewsContentProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete news article "${title}"?`)) return;

    setIsDeleting(id);
    const result = await deleteNews(id);

    setIsDeleting(null);

    if (!result.success) {
      toast.error(result.error || "Failed to delete");
    } else {
      toast.success("News deleted");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          toast.error(result.error || "Failed to update");
        } else {
          toast.success("News updated");
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
          toast.error(result.error || "Failed to create");
        } else {
          toast.success("News created");
          setShowDialog(false);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    }

    setIsSaving(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
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
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              Add News
            </button>
          </div>
        </div>

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
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "";
                              }}
                            />
                          </div>
                        )}
                        <p className="font-semibold text-gray-900">{item.title}</p>
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
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={isDeleting === item.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
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
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 flex flex-col items-center gap-2"
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
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isSaving
                        ? isUploadingImage
                          ? "Uploading..."
                          : "Saving..."
                        : selectedNews
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDialog(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
