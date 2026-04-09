"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Trash2, Eye, EyeOff, Edit2, Plus, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllPromotionalBars,
  createPromotionalBar,
  updatePromotionalBar,
  deletePromotionalBar,
  setActivePromotionalBar,
} from "@/app/(private)/admin/promotional-bars/models/promotional-bars-model";

interface PromotionalBar {
  id: string;
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromotionalBarsPage() {
  const [bars, setBars] = useState<PromotionalBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    message: "",
    backgroundColor: "#D4B896",
    textColor: "#1F2937",
  });

  // ========== LOAD BARS ==========
  useEffect(() => {
    loadBars();
  }, []);

  const loadBars = async () => {
    try {
      setLoading(true);
      const result = await getAllPromotionalBars();

      if (result.success) {
        setBars(result.data as PromotionalBar[]);
      } else {
        toast.error(result.error || "Failed to load promotional bars");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading bars");
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE CREATE/UPDATE ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    try {
      setSubmitting(true);

      let result;

      if (editingId) {
        result = await updatePromotionalBar(editingId, {
          message: formData.message,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
        });
      } else {
        result = await createPromotionalBar({
          message: formData.message,
          backgroundColor: formData.backgroundColor,
          textColor: formData.textColor,
        });
      }

      if (result.success) {
        toast.success(result.message || "Saved successfully");
        setShowForm(false);
        setEditingId(null);
        setFormData({
          message: "",
          backgroundColor: "#D4B896",
          textColor: "#1F2937",
        });
        await loadBars();
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // ========== HANDLE EDIT ==========
  const handleEdit = (bar: PromotionalBar) => {
    setFormData({
      message: bar.message,
      backgroundColor: bar.background_color,
      textColor: bar.text_color,
    });
    setEditingId(bar.id);
    setShowForm(true);
  };

  // ========== HANDLE DELETE ==========
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this promotional bar?")) {
      return;
    }

    try {
      const result = await deletePromotionalBar(id);

      if (result.success) {
        toast.success("Deleted successfully");
        await loadBars();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  // ========== HANDLE TOGGLE ACTIVE ==========
  const handleSetActive = async (id: string) => {
    try {
      const result = await setActivePromotionalBar(id);

      if (result.success) {
        toast.success("Promotional bar activated");
        await loadBars();
      } else {
        toast.error(result.error || "Failed to activate");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  // ========== HANDLE CLOSE FORM ==========
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      message: "",
      backgroundColor: "#D4B896",
      textColor: "#1F2937",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Promotional Bars
            </h1>
            <p className="text-gray-600 mt-2">
              Manage promotional messages shown at the top of your site
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Bar
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? "Edit Promotional Bar" : "Create New Promotional Bar"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message: e.target.value,
                        })
                      }
                      placeholder="Enter promotional message (e.g., 🎉 LIMITED TIME OFFER: Get 30% OFF! Use code: SAVE30)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can include emojis and special characters
                    </p>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Background Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.backgroundColor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              backgroundColor: e.target.value,
                            })
                          }
                          placeholder="#D4B896"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Default: Beige (#D4B896)
                      </p>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              textColor: e.target.value,
                            })
                          }
                          className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              textColor: e.target.value,
                            })
                          }
                          placeholder="#1F2937"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Default: Dark Gray (#1F2937)
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 mb-3">
                      Preview
                    </p>
                    <div
                      className="p-3 rounded text-center"
                      style={{
                        backgroundColor: formData.backgroundColor,
                        color: formData.textColor,
                      }}
                    >
                      {formData.message || "Your message will appear here..."}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors font-medium"
                    >
                      {submitting
                        ? "Saving..."
                        : editingId
                          ? "Update"
                          : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading promotional bars...</p>
          </div>
        ) : bars.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              No promotional bars yet
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create First Bar
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bars.map((bar) => (
              <div
                key={bar.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Bar Preview */}
                <div
                  className="p-4 text-center text-sm font-medium"
                  style={{
                    backgroundColor: bar.background_color,
                    color: bar.text_color,
                  }}
                >
                  {bar.message}
                </div>

                {/* Bar Info & Actions */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Info */}
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {bar.is_active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} />
                            <span className="font-semibold">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Eye size={16} />
                            <span>Inactive</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600">
                        Created:{" "}
                        {new Date(bar.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {!bar.is_active && (
                        <button
                          onClick={() => handleSetActive(bar.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          <Eye size={16} />
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(bar)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bar.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
