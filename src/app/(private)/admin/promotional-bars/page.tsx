"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { X, Loader2, Eye, EyeOff } from "lucide-react";

interface PromotionalBar {
  id: string;
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  created_at: string;
}

export default function PromotionalBarsPage() {
  const [bars, setBars] = useState<PromotionalBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    background_color: "#D4B896",
    text_color: "#1F2937",
  });
  const supabase = createClient();

  // Fetch bars
  const fetchBars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotional_bars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBars(data || []);
    } catch (err) {
      console.error("Error fetching bars:", err);
      toast.error("Failed to load promotional bars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBars();
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!formData.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("promotional_bars").insert({
        message: formData.message,
        background_color: formData.background_color,
        text_color: formData.text_color,
        is_active: false,
      });

      if (error) throw error;

      toast.success("Promotional bar created successfully");
      setFormData({
        message: "",
        background_color: "#D4B896",
        text_color: "#1F2937",
      });
      await fetchBars();
    } catch (err) {
      console.error("Error saving bar:", err);
      toast.error("Failed to create promotional bar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (bar: PromotionalBar) => {
    try {
      // If activating, deactivate others first
      if (!bar.is_active) {
        await supabase
          .from("promotional_bars")
          .update({ is_active: false })
          .neq("id", bar.id);
      }

      const { error } = await supabase
        .from("promotional_bars")
        .update({ is_active: !bar.is_active })
        .eq("id", bar.id);

      if (error) throw error;
      await fetchBars();
      toast.success(bar.is_active ? "Bar hidden" : "Bar activated");
    } catch (err) {
      console.error("Error toggling visibility:", err);
      toast.error("Failed to update visibility");
    }
  };

  // Delete bar
  const handleDelete = async (barId: string) => {
    if (!confirm("Are you sure you want to delete this promotional bar?")) return;

    try {
      const { error } = await supabase
        .from("promotional_bars")
        .delete()
        .eq("id", barId);

      if (error) throw error;
      toast.success("Promotional bar deleted successfully");
      await fetchBars();
    } catch (err) {
      console.error("Error deleting bar:", err);
      toast.error("Failed to delete promotional bar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Promotional Bars
          </h1>
          <p className="text-slate-600">Create and manage promotional messages</p>
        </div>

        {/* Create Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Create New Promotional Bar
          </h2>

          <div className="space-y-6">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Enter promotional message (e.g., 🎉 50% OFF - Limited Time!)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">
                You can include emojis and special characters
              </p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_color: e.target.value,
                      })
                    }
                    className="w-12 h-10 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_color: e.target.value,
                      })
                    }
                    placeholder="#D4B896"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) =>
                      setFormData({ ...formData, text_color: e.target.value })
                    }
                    className="w-12 h-10 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={formData.text_color}
                    onChange={(e) =>
                      setFormData({ ...formData, text_color: e.target.value })
                    }
                    placeholder="#1F2937"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-3">Preview</p>
              <div
                className="p-4 rounded text-center"
                style={{
                  backgroundColor: formData.background_color,
                  color: formData.text_color,
                }}
              >
                {formData.message || "Your message will appear here..."}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                "Create Promotional Bar"
              )}
            </button>
          </div>
        </div>

        {/* Bars List */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            All Promotional Bars ({bars.length})
          </h2>

          {bars.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-lg">
                No promotional bars yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bars.map((bar) => (
                <div
                  key={bar.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                >
                  {/* Header with visibility toggle */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bar.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {bar.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => handleToggleVisibility(bar)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                      title={bar.is_active ? "Hide" : "Show"}
                    >
                      {bar.is_active ? (
                        <Eye size={20} className="text-slate-600" />
                      ) : (
                        <EyeOff size={20} className="text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Message Preview */}
                  <div
                    className="p-4 rounded-lg mb-4"
                    style={{
                      backgroundColor: bar.background_color,
                      color: bar.text_color,
                    }}
                  >
                    <p className="font-medium">{bar.message}</p>
                  </div>

                  {/* Colors Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                    <div className="text-sm">
                      <p className="text-slate-500">Background</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border border-slate-300"
                          style={{ backgroundColor: bar.background_color }}
                        />
                        <span className="font-mono text-xs text-slate-600">
                          {bar.background_color}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-500">Text</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border border-slate-300"
                          style={{ backgroundColor: bar.text_color }}
                        />
                        <span className="font-mono text-xs text-slate-600">
                          {bar.text_color}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => handleDelete(bar.id)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
