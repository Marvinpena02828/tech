"use client";

import { ContactInfo } from "@/types/contactInfo";
import { useState, useEffect } from "react";
import {
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
  toggleContactInfoStatus,
} from "@/actions/contactInfo";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Send,
  Save,
  Upload,
  X,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface ContactInfoContentProps {
  contactInfos: ContactInfo[];
}

interface ContactBannerData {
  id?: string;
  banner_image_url: string;
  banner_height: number;
  banner_title: string;
  title_color: string;
  title_size: string;
  title_position_top: number;
  title_position_left: number;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  is_active: boolean;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Send,
};

export default function ContactInfoContent({
  contactInfos,
}: ContactInfoContentProps) {
  const router = useRouter();
  const supabase = createClient();

  // Contact Info States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "banner">("info");

  const [formData, setFormData] = useState({
    icon_name: "Mail",
    title: "",
    label: "",
    link: null as string | null,
    display_order: contactInfos.length + 1,
    is_active: true,
  });

  // Banner States
  const [banner, setBanner] = useState<ContactBannerData | null>(null);
  const [editedBanner, setEditedBanner] = useState<ContactBannerData>({
    banner_image_url: "",
    banner_height: 500,
    banner_title: "Contact Us",
    title_color: "text-black",
    title_size: "text-5xl",
    title_position_top: 85,
    title_position_left: 7,
    overlay_enabled: false,
    overlay_color: "rgba(0,0,0,0.3)",
    overlay_opacity: 0.3,
    is_active: true,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Load banner data on mount
  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setBannerLoading(true);

      const { data, error } = await supabase
        .from("contact_banner")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching banner:", error);
        return;
      }

      if (data) {
        setBanner(data);
        setEditedBanner(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setBannerLoading(false);
    }
  };

  // Contact Info Functions
  const handleOpenModal = (item?: ContactInfo) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        icon_name: item.icon_name,
        title: item.title,
        label: item.label,
        link: item.link,
        display_order: item.display_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        icon_name: "Mail",
        title: "",
        label: "",
        link: null,
        display_order: contactInfos.length + 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (editingItem) {
        result = await updateContactInfo(editingItem.id, formData);
      } else {
        result = await createContactInfo(formData);
      }

      if (result.success) {
        handleCloseModal();
        router.refresh();
      } else {
        alert(result.error || "Failed to save contact info");
      }
    } catch (error) {
      console.error("Error saving contact info:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact info?")) return;

    const result = await deleteContactInfo(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete contact info");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleContactInfoStatus(id, !currentStatus);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to toggle status");
    }
  };

  // Banner Functions
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = `contact-banner/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setEditedBanner({ ...editedBanner, banner_image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!editedBanner.banner_image_url.trim()) {
      toast.error("Banner image is required");
      return;
    }

    try {
      setIsSavingBanner(true);

      const updateData = {
        banner_image_url: editedBanner.banner_image_url,
        banner_height: editedBanner.banner_height,
        banner_title: editedBanner.banner_title,
        title_color: editedBanner.title_color,
        title_size: editedBanner.title_size,
        title_position_top: editedBanner.title_position_top,
        title_position_left: editedBanner.title_position_left,
        overlay_enabled: editedBanner.overlay_enabled,
        overlay_color: editedBanner.overlay_color,
        overlay_opacity: editedBanner.overlay_opacity,
        is_active: true,
      };

      if (banner?.id) {
        const { error } = await supabase
          .from("contact_banner")
          .update(updateData)
          .eq("id", banner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contact_banner")
          .insert([updateData]);

        if (error) throw error;
      }

      toast.success("Banner saved successfully");
      fetchBannerData();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    } finally {
      setIsSavingBanner(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Contact Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage contact information and banner for the contact page
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "info"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Contact Info
        </button>
        <button
          onClick={() => setActiveTab("banner")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "banner"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Banner Upload
        </button>
      </div>

      {/* Contact Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Contact Info
            </button>
          </div>

          {/* Contact Info List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contactInfos.map((item) => {
                  const IconComponent = iconMap[item.icon_name] || Mail;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <IconComponent size={24} className="text-purple-600" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            {item.link.substring(0, 30)}...
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, item.is_active)
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.is_active ? (
                            <>
                              <Eye size={14} /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {contactInfos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No contact information found</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add your first contact info
                </button>
              </div>
            )}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">
                  {editingItem ? "Edit Contact Info" : "Add Contact Info"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <select
                      value={formData.icon_name}
                      onChange={(e) =>
                        setFormData({ ...formData, icon_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="Mail">Mail</option>
                      <option value="Phone">Phone</option>
                      <option value="MessageCircle">WhatsApp</option>
                      <option value="Globe">Website</option>
                      <option value="MapPin">Location</option>
                      <option value="Send">Social</option>
                    </select>
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Email Us"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., sales@ayyantech.net"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.link || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          link: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., mailto:sales@ayyantech.net"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Banner Tab */}
      {activeTab === "banner" && (
        <div className="space-y-6">
          {/* Preview Toggle */}
          <div>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              <Eye size={18} />
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </button>
          </div>

          {bannerLoading ? (
            <div className="text-center py-12">Loading banner...</div>
          ) : previewMode ? (
            // Preview Section
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Preview</h3>
              <div
                className="relative w-full overflow-hidden rounded-lg shadow-lg"
                style={{ height: `${editedBanner.banner_height}px` }}
              >
                {/* Background Image */}
                {editedBanner.banner_image_url && (
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${editedBanner.banner_image_url}')`,
                    }}
                  />
                )}

                {/* Overlay */}
                {editedBanner.overlay_enabled && (
                  <div
                    className="absolute inset-0 z-5"
                    style={{
                      backgroundColor: editedBanner.overlay_color,
                      opacity: editedBanner.overlay_opacity,
                    }}
                  />
                )}

                {/* Title */}
                <div
                  className="absolute z-10 px-4"
                  style={{
                    bottom: `${100 - editedBanner.title_position_top}%`,
                    left: `${editedBanner.title_position_left}%`,
                    transform: "translateY(50%)",
                  }}
                >
                  <h1
                    className={`${editedBanner.title_color} font-semibold ${editedBanner.title_size}`}
                  >
                    {editedBanner.banner_title}
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            // Edit Section
            <div className="space-y-8">
              {/* Image Upload */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Banner Image
                  </h3>

                  {/* Image Preview */}
                  {editedBanner.banner_image_url && (
                    <div className="mb-4 relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <img
                          src={editedBanner.banner_image_url}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setEditedBanner({
                            ...editedBanner,
                            banner_image_url: "",
                          });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  {/* Upload Area */}
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      {uploadingImage ? (
                        <>
                          <Loader size={24} className="animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, WEBP up to 5MB
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Banner Settings */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Banner Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Height (px)
                    </label>
                    <input
                      type="number"
                      value={editedBanner.banner_height}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          banner_height: parseInt(e.target.value) || 500,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overlay Opacity (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={editedBanner.overlay_opacity}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          overlay_opacity: parseFloat(e.target.value) || 0.3,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overlay_enabled"
                    checked={editedBanner.overlay_enabled}
                    onChange={(e) =>
                      setEditedBanner({
                        ...editedBanner,
                        overlay_enabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="overlay_enabled"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Enable Overlay
                  </label>
                </div>
              </div>

              {/* Title Settings */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Title Settings
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title Text
                  </label>
                  <input
                    type="text"
                    value={editedBanner.banner_title}
                    onChange={(e) =>
                      setEditedBanner({
                        ...editedBanner,
                        banner_title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Contact Us"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Color
                    </label>
                    <select
                      value={editedBanner.title_color}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          title_color: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text-white">White</option>
                      <option value="text-black">Black</option>
                      <option value="text-gray-900">Dark Gray</option>
                      <option value="text-blue-600">Blue</option>
                      <option value="text-purple-600">Purple</option>
                      <option value="text-red-600">Red</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Size
                    </label>
                    <select
                      value={editedBanner.title_size}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          title_size: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text-3xl">3xl</option>
                      <option value="text-4xl">4xl</option>
                      <option value="text-5xl">5xl</option>
                      <option value="text-6xl">6xl</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position from Left ({editedBanner.title_position_left}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editedBanner.title_position_left}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          title_position_left: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position from Bottom ({editedBanner.title_position_top}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editedBanner.title_position_top}
                      onChange={(e) =>
                        setEditedBanner({
                          ...editedBanner,
                          title_position_top: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveBanner}
                disabled={isSavingBanner || uploadingImage}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg w-full justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingBanner ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Contact Banner
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
