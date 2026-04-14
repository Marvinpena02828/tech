// app/admin/floating-contact-buttons/page.tsx
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Trash2, Plus, ChevronUp, ChevronDown, Upload } from "lucide-react";

interface ContactButton {
  id: number;
  name: string;
  sub_name: string | null;
  link: string;
  icon_file_path: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function FloatingContactButtonsAdminPage() {
  const [buttons, setButtons] = useState<ContactButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sub_name: "",
    link: "",
    icon_file_path: "",
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("floating_contact_buttons")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setButtons(data || []);
    } catch (err) {
      toast.error("Failed to fetch buttons");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Button name is required");
      return;
    }

    if (!formData.link.trim()) {
      toast.error("Link is required");
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingId) {
        const { error } = await supabase
          .from("floating_contact_buttons")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Button updated successfully");
      } else {
        const { error } = await supabase
          .from("floating_contact_buttons")
          .insert([
            {
              ...formData,
              order_index: buttons.length,
            },
          ]);

        if (error) throw error;
        toast.success("Button created successfully");
      }

      resetForm();
      fetchButtons();
    } catch (err) {
      toast.error("Error saving button");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (button: ContactButton) => {
    setEditingId(button.id);
    setFormData({
      name: button.name,
      sub_name: button.sub_name || "",
      link: button.link,
      icon_file_path: button.icon_file_path || "",
      order_index: button.order_index,
      is_active: button.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this button?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("floating_contact_buttons")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Button deleted successfully");
      fetchButtons();
    } catch (err) {
      toast.error("Failed to delete button");
      console.error(err);
    }
  };

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const currentButton = buttons.find((b) => b.id === id);
    if (!currentButton) return;

    const currentIndex = buttons.findIndex((b) => b.id === id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= buttons.length) return;

    const swapButton = buttons[newIndex];
    const supabase = createClient();

    try {
      // Swap order indexes
      await supabase
        .from("floating_contact_buttons")
        .update({ order_index: swapButton.order_index })
        .eq("id", currentButton.id);

      await supabase
        .from("floating_contact_buttons")
        .update({ order_index: currentButton.order_index })
        .eq("id", swapButton.id);

      await fetchButtons();
      toast.success("Order updated");
    } catch (err) {
      toast.error("Failed to reorder");
      console.error(err);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const supabase = createClient();
      const fileName = `${Date.now()}-${file.name}`;
      const bucket = "contact-buttons";

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(`icons/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(`icons/${fileName}`);

      setFormData((prev) => ({
        ...prev,
        icon_file_path: data.publicUrl,
      }));

      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sub_name: "",
      link: "",
      icon_file_path: "",
      order_index: buttons.length,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Floating Contact Buttons
          </h1>
          <p className="text-gray-600 mt-2">
            Manage WhatsApp, WeChat, and other floating contact options
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          Add Button
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            {editingId ? "Edit Contact Button" : "Create New Contact Button"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Sub Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Contact Us in WhatsApp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sub_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sub_name: e.target.value }))
                  }
                  placeholder="e.g., +86 181 2416 1233"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (URL or Route) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://api.whatsapp.com/send?phone=... or /weChat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Can be external URLs or internal routes
              </p>
            </div>

            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon Image
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    disabled={uploading}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition ${
                      uploading
                        ? "bg-gray-50 opacity-50 cursor-not-allowed"
                        : "hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-gray-700">
                      {uploading ? "Uploading..." : "Click to upload icon"}
                    </span>
                  </label>
                </div>
              </div>

              {formData.icon_file_path && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={formData.icon_file_path}
                    alt="Icon preview"
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Icon uploaded</p>
                    <p className="text-xs text-gray-600 truncate">
                      {formData.icon_file_path}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, icon_file_path: "" }))
                    }
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (Show on website)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isSaving ? "Saving..." : editingId ? "Update Button" : "Create Button"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buttons List Section */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">Loading...</p>
          </div>
        ) : buttons.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">No contact buttons created yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create your first button
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {buttons.length} button{buttons.length !== 1 ? "s" : ""} created
            </p>
            {buttons.map((button, idx) => (
              <div
                key={button.id}
                className={`bg-white border rounded-lg p-5 flex items-center justify-between transition ${
                  button.is_active
                    ? "border-gray-200 hover:border-gray-300"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{button.name}</h3>
                    {!button.is_active && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  {button.sub_name && (
                    <p className="text-sm text-gray-600 mt-1">{button.sub_name}</p>
                  )}

                  <p className="text-sm text-blue-600 truncate mt-1">{button.link}</p>

                  {button.icon_file_path && (
                    <div className="mt-3">
                      <img
                        src={button.icon_file_path}
                        alt={button.name}
                        className="w-8 h-8 object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleReorder(button.id, "up")}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={() => handleReorder(button.id, "down")}
                    disabled={idx === buttons.length - 1}
                    title="Move down"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronDown size={18} />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(button)}
                    title="Edit"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(button.id)}
                    title="Delete"
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Import MessageCircle at the top if not already imported
import { MessageCircle } from "lucide-react";
