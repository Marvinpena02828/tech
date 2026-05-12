"use client";

import { Eye, EyeOff, Layout, Plus, Trash2, X } from "lucide-react";
import { SectionSetting } from "@/lib/types";
import { useSectionSettings } from "./hooks/use-section-settings";
import { useState } from "react";

interface SectionSettingsContentProps {
  settings: SectionSetting[];
}

const sectionLabels: Record<string, { label: string; description: string }> = {
  global_marketing: {
    label: "Global Marketing Section",
    description: "Offline marketing section on About page showing global reach",
  },
};

function AddSectionDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionName: string, isVisible: boolean) => void;
  isSaving: boolean;
}) {
  const [sectionName, setSectionName] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      return;
    }
    onSave(sectionName.trim().toLowerCase().replace(/\s+/g, "_"), isVisible);
  };

  const handleClose = () => {
    setSectionName("");
    setIsVisible(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plus className="text-purple-600" size={28} />
            Add New Section Setting
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Global Marketing, Hero Banner, etc."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Will be converted to:{" "}
              {sectionName.toLowerCase().replace(/\s+/g, "_") || "section_name"}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Make section visible by default
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? "Adding..." : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SectionSettingsContent({
  settings: initialSettings,
}: SectionSettingsContentProps) {
  const {
    settings,
    isLoading,
    createSetting,
    updateVisibility,
    deleteSetting,
  } = useSectionSettings(initialSettings);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (sectionName: string, isVisible: boolean) => {
    await createSetting(sectionName, "general", isVisible);
    setShowAddDialog(false);
  };

  const handleDelete = async (id: string, sectionName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the "${sectionName}" section setting?`
      )
    ) {
      setDeletingId(id);
      await deleteSetting(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="text-purple-600" size={32} />
            Section Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Control visibility of sections across your website
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>

      {/* Info Box */}
      {settings.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>How to use:</strong> Click the toggle button to show/hide
            sections. Green (👁️ Visible) means shown on the website. Red (👁️‍🗨️
            Hidden) means hidden from visitors.
          </p>
        </div>
      )}

      {/* Settings List */}
      {settings.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="p-6 space-y-4">
            {settings.map((setting) => {
              const info = sectionLabels[setting.section_name] || {
                label: setting.section_name,
                description: "No description available",
              };

              return (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {info.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {setting.section_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateVisibility(
                          setting.section_name,
                          !setting.is_visible
                        )
                      }
                      disabled={isLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        setting.is_visible
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {setting.is_visible ? (
                        <>
                          <Eye size={18} />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={18} />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id, info.label)}
                      disabled={isLoading || deletingId === setting.id}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete section"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {settings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Layout className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No section settings yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first section setting to control visibility
          </p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Add Your First Section
          </button>
        </div>
      )}

      {/* Add Section Dialog */}
      <AddSectionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAdd}
        isSaving={isLoading}
      />
    </div>
  );
}
