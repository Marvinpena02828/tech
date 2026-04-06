"use client";

import { useState } from "react";
import { Newspaper, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AppImage from "@/components/ui/AppImage";
import { convertDriveUrl } from "@/lib/utils/DriveLinkConverter";

interface NewsItem {
  id: number;
  caption: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  last_edited: string;
}

export default function NewsContent({
  news: initialNews,
}: {
  news: NewsItem[];
}) {
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    caption: "",
    title: "",
    content: "",
    image_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete news article "${title}"?`)) return;

    setIsDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);

    setIsDeleting(null);

    if (error) {
      toast.error("Failed to delete news article");
    } else {
      toast.success("News article deleted");
      setNews(news.filter((n) => n.id !== id));
      router.refresh();
    }
  };

  const handleAdd = () => {
    setSelectedNews(null);
    setFormData({ caption: "", title: "", content: "", image_url: "" });
    setShowDialog(true);
  };

  const handleEdit = (item: NewsItem) => {
    setSelectedNews(item);
    setFormData({
      caption: item.caption,
      title: item.title,
      content: item.content,
      image_url: convertDriveUrl(item.image_url),
    });
    setShowDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const image_url = await convertDriveUrl(formData.image_url);

    const supabase = createClient();

    if (selectedNews) {
      // Update
      const { error } = await supabase
        .from("news")
        .update({
          ...formData,
          edited_at: new Date().toISOString(),
          image_url: image_url,
        })
        .eq("id", selectedNews.id);

      if (error) {
        toast.error("Failed to update news:" + error.message);
      } else {
        toast.success("News updated successfully");
        setShowDialog(false);
        router.refresh();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("news")
        .insert({ ...formData, image_url });

      if (error) {
        toast.error("Failed to create news");
      } else {
        toast.success("News created successfully");
        setShowDialog(false);
        router.refresh();
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                    Summary
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
                            <AppImage
                              src={item.image_url}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
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
                      {new Date(item.last_edited).toLocaleDateString("en-US", {
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

        {/* Dialog */}
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
                  {/* caption */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (Google Drive or Direct Link)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://drive.google.com/... or https://..."
                      required
                    />

                    {formData.image_url && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Image Preview:
                        </p>
                        <div className="flex items-center gap-4">
                          <AppImage
                            src={convertDriveUrl(formData.image_url)}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="rounded-lg shadow-md object-cover "
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving
                        ? "Saving..."
                        : selectedNews
                          ? "Update"
                          : "Create"}
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
      </div>
    </div>
  );
}
