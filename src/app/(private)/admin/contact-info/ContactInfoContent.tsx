"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Settings,
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
  toggleContactInfoStatus,
} from "@/actions/contactInfo";
import {
  createContactFormField,
  updateContactFormField,
  deleteContactFormField,
} from "@/actions/contactFormField";
import {
  getContactPageSettings,
  updateContactPageSettings,
} from "@/actions/contactPageSettings";
import {
  createContactSubmission,
  getContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from "@/actions/contactSubmission";

// Types
interface ContactInfo {
  id: string;
  icon_name: string;
  title: string;
  label: string;
  link?: string;
  display_order: number;
  is_active: boolean;
}

interface FormField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "email" | "phone" | "textarea" | "select";
  placeholder?: string;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

interface PageSettings {
  id: string;
  banner_title: string;
  banner_description: string;
  banner_image_url: string;
  page_heading: string;
  page_description: string;
  main_email: string;
  form_heading: string;
}

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Send,
};

interface ContactPageAdminProps {
  initialSettings: PageSettings;
  initialFormFields: FormField[];
  initialContactInfos: ContactInfo[];
  initialSubmissions: ContactSubmission[];
}

export default function ContactPageAdminComplete({
  initialSettings,
  initialFormFields,
  initialContactInfos,
  initialSubmissions,
}: ContactPageAdminProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");

  const tabs: Tab[] = [
    { id: "settings", label: "Page Settings", icon: Settings },
    { id: "form-fields", label: "Form Fields", icon: FileText },
    { id: "contact-info", label: "Contact Info", icon: Users },
    { id: "submissions", label: "Submissions", icon: MessageSquare },
  ];

  // ============================================================================
  // PAGE SETTINGS TAB
  // ============================================================================
  const PageSettingsTab = () => {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSettings = async () => {
      setIsSaving(true);
      try {
        const result = await updateContactPageSettings(settings);
        if (result.success) {
          router.refresh();
          alert("Settings saved successfully!");
        } else {
          alert(result.error || "Failed to save settings");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        alert("An error occurred while saving");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Title
            </label>
            <input
              type="text"
              value={settings.banner_title}
              onChange={(e) =>
                setSettings({ ...settings, banner_title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Get in Touch with AyyanTech"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Description
            </label>
            <textarea
              value={settings.banner_description}
              onChange={(e) =>
                setSettings({ ...settings, banner_description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Tell us what you need..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image URL
            </label>
            <input
              type="url"
              value={settings.banner_image_url}
              onChange={(e) =>
                setSettings({ ...settings, banner_image_url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Heading
              </label>
              <input
                type="text"
                value={settings.page_heading}
                onChange={(e) =>
                  setSettings({ ...settings, page_heading: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Email
              </label>
              <input
                type="email"
                value={settings.main_email}
                onChange={(e) =>
                  setSettings({ ...settings, main_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Description
            </label>
            <textarea
              value={settings.page_description}
              onChange={(e) =>
                setSettings({ ...settings, page_description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Heading
            </label>
            <input
              type="text"
              value={settings.form_heading}
              onChange={(e) =>
                setSettings({ ...settings, form_heading: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // FORM FIELDS TAB
  // ============================================================================
  const FormFieldsTab = () => {
    const [formFields, setFormFields] = useState(initialFormFields);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldForm, setFieldForm] = useState({
      field_name: "",
      field_label: "",
      field_type: "text" as const,
      placeholder: "",
      is_required: true,
      display_order: 0,
      is_active: true,
    });

    const handleOpenFieldModal = (field?: FormField) => {
      if (field) {
        setEditingField(field);
        setFieldForm({
          field_name: field.field_name,
          field_label: field.field_label,
          field_type: field.field_type,
          placeholder: field.placeholder || "",
          is_required: field.is_required,
          display_order: field.display_order,
          is_active: field.is_active,
        });
      } else {
        setEditingField(null);
        setFieldForm({
          field_name: "",
          field_label: "",
          field_type: "text",
          placeholder: "",
          is_required: true,
          display_order: formFields.length + 1,
          is_active: true,
        });
      }
      setShowModal(true);
    };

    const handleSaveField = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        let result;
        if (editingField) {
          result = await updateContactFormField(editingField.id, fieldForm);
        } else {
          result = await createContactFormField(fieldForm);
        }

        if (result.success) {
          router.refresh();
          setShowModal(false);
        } else {
          alert(result.error || "Failed to save field");
        }
      } catch (error) {
        console.error("Error saving field:", error);
        alert("An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDeleteField = async (id: string) => {
      if (!confirm("Delete this field?")) return;

      try {
        const result = await deleteContactFormField(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to delete field");
        }
      } catch (error) {
        console.error("Error deleting field:", error);
        alert("An error occurred");
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Form Fields</h3>
          <button
            onClick={() => handleOpenFieldModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Field
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {field.field_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {field.field_label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {field.field_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {field.is_required ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {field.display_order}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        field.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {field.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenFieldModal(field)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Field Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">
                {editingField ? "Edit Field" : "Add Field"}
              </h2>
              <form onSubmit={handleSaveField} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={fieldForm.field_name}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        field_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={fieldForm.field_label}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        field_label: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type
                  </label>
                  <select
                    value={fieldForm.field_type}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        field_type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={fieldForm.placeholder}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        placeholder: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={fieldForm.display_order}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        display_order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_required}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        is_required: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-gray-700">Required</label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_active}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        is_active: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // CONTACT INFO TAB
  // ============================================================================
  const ContactInfoTab = () => {
    const [contactInfos, setContactInfos] = useState(initialContactInfos);
    const [editingInfo, setEditingInfo] = useState<ContactInfo | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoForm, setInfoForm] = useState({
      icon_name: "Mail",
      title: "",
      label: "",
      link: "",
      display_order: 0,
      is_active: true,
    });

    const handleOpenInfoModal = (info?: ContactInfo) => {
      if (info) {
        setEditingInfo(info);
        setInfoForm({
          icon_name: info.icon_name,
          title: info.title,
          label: info.label,
          link: info.link || "",
          display_order: info.display_order,
          is_active: info.is_active,
        });
      } else {
        setEditingInfo(null);
        setInfoForm({
          icon_name: "Mail",
          title: "",
          label: "",
          link: "",
          display_order: contactInfos.length + 1,
          is_active: true,
        });
      }
      setShowModal(true);
    };

    const handleSaveInfo = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        let result;
        if (editingInfo) {
          result = await updateContactInfo(editingInfo.id, infoForm);
        } else {
          result = await createContactInfo(infoForm);
        }

        if (result.success) {
          router.refresh();
          setShowModal(false);
        } else {
          alert(result.error || "Failed to save contact info");
        }
      } catch (error) {
        console.error("Error saving contact info:", error);
        alert("An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDeleteInfo = async (id: string) => {
      if (!confirm("Delete this contact info?")) return;

      try {
        const result = await deleteContactInfo(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || "Failed to delete contact info");
        }
      } catch (error) {
        console.error("Error deleting contact info:", error);
        alert("An error occurred");
      }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
      try {
        const result = await toggleContactInfoStatus(id, !currentStatus);
        if (result.success) {
          router.refresh();
        }
      } catch (error) {
        console.error("Error toggling status:", error);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <button
            onClick={() => handleOpenInfoModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Contact Info
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contactInfos.map((info) => {
                const IconComponent = iconMap[info.icon_name] || Mail;
                return (
                  <tr key={info.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <IconComponent size={24} className="text-purple-600" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {info.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {info.label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {info.link ? (
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline truncate block max-w-xs"
                        >
                          {info.link.substring(0, 30)}...
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {info.display_order}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() =>
                          handleToggleStatus(info.id, info.is_active)
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          info.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {info.is_active ? (
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
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenInfoModal(info)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteInfo(info.id)}
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
        </div>

        {/* Contact Info Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">
                {editingInfo ? "Edit Contact Info" : "Add Contact Info"}
              </h2>
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={infoForm.icon_name}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, icon_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    value={infoForm.title}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, title: e.target.value })
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
                    value={infoForm.label}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, label: e.target.value })
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
                    value={infoForm.link}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, link: e.target.value })
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
                    value={infoForm.display_order}
                    onChange={(e) =>
                      setInfoForm({
                        ...infoForm,
                        display_order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={infoForm.is_active}
                    onChange={(e) =>
                      setInfoForm({ ...infoForm, is_active: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // SUBMISSIONS TAB
  // ============================================================================
  const SubmissionsTab = () => {
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [selectedSubmission, setSelectedSubmission] =
      useState<ContactSubmission | null>(null);

    const handleMarkAsRead = async (id: string) => {
      try {
        const result = await updateContactSubmissionStatus(id, "read");
        if (result.success) {
          router.refresh();
        }
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    };

    const handleDelete = async (id: string) => {
      if (!confirm("Delete this submission?")) return;

      try {
        const result = await deleteContactSubmission(id);
        if (result.success) {
          router.refresh();
          setSelectedSubmission(null);
        } else {
          alert(result.error || "Failed to delete submission");
        }
      } catch (error) {
        console.error("Error deleting submission:", error);
        alert("An error occurred");
      }
    };

    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4">Submissions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => {
                  setSelectedSubmission(submission);
                  handleMarkAsRead(submission.id);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSubmission?.id === submission.id
                    ? "bg-purple-100 border-2 border-purple-600"
                    : submission.status === "new"
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <p className="font-medium text-sm text-gray-900">
                  {submission.full_name}
                </p>
                <p className="text-xs text-gray-500">{submission.email}</p>
                <p className="text-xs text-gray-400 truncate">
                  {submission.subject}
                </p>
                {submission.status === "new" && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          {selectedSubmission ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedSubmission.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedSubmission.email}
                  </p>
                  {selectedSubmission.phone && (
                    <p className="text-sm text-gray-600">
                      {selectedSubmission.phone}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSubmission.status === "new"
                      ? "bg-red-100 text-red-800"
                      : selectedSubmission.status === "read"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedSubmission.status.charAt(0).toUpperCase() +
                    selectedSubmission.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Subject</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedSubmission.subject}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Message</p>
                <div className="bg-gray-50 rounded p-3 max-h-48 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Submitted:{" "}
                {new Date(selectedSubmission.created_at).toLocaleString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 flex items-center justify-center">
              <p className="text-gray-500">Select a submission to view</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Contact Page Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all aspects of your contact page from here
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "settings" && <PageSettingsTab />}
          {activeTab === "form-fields" && <FormFieldsTab />}
          {activeTab === "contact-info" && <ContactInfoTab />}
          {activeTab === "submissions" && <SubmissionsTab />}
        </div>
      </div>
    </div>
  );
}
