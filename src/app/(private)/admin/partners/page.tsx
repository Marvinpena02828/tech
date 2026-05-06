"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Save,
  X,
  Eye,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

interface DropdownItem {
  id: string;
  title: string;
  detail: string;
}

interface PartnerItem {
  id: string;
  title: string;
  detail: string;
}

interface CustomerCategory {
  id: string;
  type: string;
  description: string;
  items: PartnerItem[];
  dropdownItems: DropdownItem[];
  image: string;
  contact?: {
    company: string;
    address: string;
    email: string;
  };
  displayOrder: number;
}

export default function PartnersCMS() {
  const supabase = createClient();

  // States
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "categories" | "items" | "dropdown" | "contact"
  >("categories");
  const [selectedCategory, setSelectedCategory] =
    useState<CustomerCategory | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState<Partial<CustomerCategory>>({
    type: "",
    description: "",
    image: "",
    displayOrder: 0,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

  const [itemForm, setItemForm] = useState<Partial<PartnerItem>>({
    title: "",
    detail: "",
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [dropdownForm, setDropdownForm] = useState<Partial<DropdownItem>>({
    title: "",
    detail: "",
  });
  const [editingDropdownId, setEditingDropdownId] = useState<string | null>(
    null
  );

  const [contactForm, setContactForm] = useState({
    company: "",
    address: "",
    email: "",
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners_categories")
        .select("*")
        .order("displayOrder", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // ============ CATEGORIES TAB ============
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileName = `partners/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, { upsert: false });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName);

      setCategoryForm((prev) => ({
        ...prev,
        image: publicUrl,
      }));
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.type || !categoryForm.description) {
        toast.error("Type and description required");
        return;
      }

      setLoading(true);

      if (editingCategoryId) {
        const { error } = await supabase
          .from("partners_categories")
          .update(categoryForm)
          .eq("id", editingCategoryId);

        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase
          .from("partners_categories")
          .insert([
            {
              ...categoryForm,
              items: [],
              dropdownItems: [],
              contact: {
                company: "",
                address: "",
                email: "",
              },
            },
          ]);

        if (error) throw error;
        toast.success("Category created");
      }

      fetchCategories();
      resetCategoryForm();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: CustomerCategory) => {
    setCategoryForm(category);
    setEditingCategoryId(category.id);
    setSelectedCategory(category);
    setActiveTab("categories");
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("partners_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Category deleted");
      fetchCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
        setCategoryForm({
          type: "",
          description: "",
          image: "",
          displayOrder: 0,
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      type: "",
      description: "",
      image: "",
      displayOrder: 0,
    });
    setEditingCategoryId(null);
  };

  // ============ ITEMS TAB ============
  const handleSaveItem = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }

    try {
      if (!itemForm.title || !itemForm.detail) {
        toast.error("Title and detail required");
        return;
      }

      let updatedItems = [...(selectedCategory.items || [])];

      if (editingItemId) {
        updatedItems = updatedItems.map((item) =>
          item.id === editingItemId ? { ...(itemForm as PartnerItem) } : item
        );
      } else {
        updatedItems.push({
          id: Math.random().toString(),
          ...(itemForm as PartnerItem),
        });
      }

      setLoading(true);
      const { error } = await supabase
        .from("partners_categories")
        .update({ items: updatedItems })
        .eq("id", selectedCategory.id);

      if (error) throw error;

      toast.success(editingItemId ? "Item updated" : "Item added");
      fetchCategories();
      setSelectedCategory((prev) =>
        prev ? { ...prev, items: updatedItems } : null
      );
      resetItemForm();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: PartnerItem) => {
    setItemForm(item);
    setEditingItemId(item.id);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedCategory) return;

    try {
      setLoading(true);
      const updatedItems = selectedCategory.items.filter(
        (item) => item.id !== itemId
      );

      const { error } = await supabase
        .from("partners_categories")
        .update({ items: updatedItems })
        .eq("id", selectedCategory.id);

      if (error) throw error;

      toast.success("Item deleted");
      fetchCategories();
      setSelectedCategory((prev) =>
        prev ? { ...prev, items: updatedItems } : null
      );
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const resetItemForm = () => {
    setItemForm({ title: "", detail: "" });
    setEditingItemId(null);
  };

  // ============ DROPDOWN ITEMS TAB ============
  const handleSaveDropdownItem = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }

    try {
      if (!dropdownForm.title || !dropdownForm.detail) {
        toast.error("Title and detail required");
        return;
      }

      let updatedDropdownItems = [...(selectedCategory.dropdownItems || [])];

      if (editingDropdownId) {
        updatedDropdownItems = updatedDropdownItems.map((item) =>
          item.id === editingDropdownId ? { ...(dropdownForm as DropdownItem) } : item
        );
      } else {
        updatedDropdownItems.push({
          id: Math.random().toString(),
          ...(dropdownForm as DropdownItem),
        });
      }

      setLoading(true);
      const { error } = await supabase
        .from("partners_categories")
        .update({ dropdownItems: updatedDropdownItems })
        .eq("id", selectedCategory.id);

      if (error) throw error;

      toast.success(editingDropdownId ? "Detail updated" : "Detail added");
      fetchCategories();
      setSelectedCategory((prev) =>
        prev ? { ...prev, dropdownItems: updatedDropdownItems } : null
      );
      resetDropdownForm();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save detail");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDropdownItem = (item: DropdownItem) => {
    setDropdownForm(item);
    setEditingDropdownId(item.id);
  };

  const handleDeleteDropdownItem = async (itemId: string) => {
    if (!selectedCategory) return;

    try {
      setLoading(true);
      const updatedDropdownItems = selectedCategory.dropdownItems.filter(
        (item) => item.id !== itemId
      );

      const { error } = await supabase
        .from("partners_categories")
        .update({ dropdownItems: updatedDropdownItems })
        .eq("id", selectedCategory.id);

      if (error) throw error;

      toast.success("Detail deleted");
      fetchCategories();
      setSelectedCategory((prev) =>
        prev ? { ...prev, dropdownItems: updatedDropdownItems } : null
      );
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete detail");
    } finally {
      setLoading(false);
    }
  };

  const resetDropdownForm = () => {
    setDropdownForm({ title: "", detail: "" });
    setEditingDropdownId(null);
  };

  // ============ CONTACT TAB ============
  const handleSaveContact = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("partners_categories")
        .update({ contact: contactForm })
        .eq("id", selectedCategory.id);

      if (error) throw error;

      toast.success("Contact info updated");
      fetchCategories();
      setSelectedCategory((prev) =>
        prev ? { ...prev, contact: contactForm } : null
      );
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save contact info");
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleSelectCategory = (category: CustomerCategory) => {
    setSelectedCategory(category);
    setCategoryForm(category);
    setContactForm(
      category.contact || {
        company: "",
        address: "",
        email: "",
      }
    );
    resetItemForm();
    resetDropdownForm();
  };

  if (loading && categories.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partners Management</h1>
        <p className="text-gray-600">
          Manage customer categories, benefits, and details
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: "categories", label: "Categories" },
            {
              id: "items",
              label: "Items",
              disabled: !selectedCategory,
            },
            {
              id: "dropdown",
              label: "Learn More Details",
              disabled: !selectedCategory,
            },
            { id: "contact", label: "Contact Info", disabled: !selectedCategory },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.disabled}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ============ CATEGORIES TAB ============ */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Form */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {editingCategoryId ? "Edit Category" : "Add New Category"}
                  </h3>
                  {editingCategoryId && (
                    <button
                      onClick={resetCategoryForm}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Are You a Brand Owner?"
                      value={categoryForm.type || ""}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={categoryForm.displayOrder || 0}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          displayOrder: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Short description"
                    value={categoryForm.description || ""}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <Upload size={18} />
                      <span className="text-sm text-gray-600">
                        {uploading ? "Uploading..." : "Click to upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {categoryForm.image && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                        <Image
                          src={categoryForm.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSaveCategory}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCategoryId ? "Update Category" : "Add Category"}
                </button>
              </div>

              {/* Categories List */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleSelectCategory(category)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedCategory?.id === category.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{category.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>{category.items?.length || 0} items</span>
                            <span>•</span>
                            <span>
                              {category.dropdownItems?.length || 0} details
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ ITEMS TAB ============ */}
          {activeTab === "items" && selectedCategory && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium">
                  Category: <span className="text-blue-600">{selectedCategory.type}</span>
                </p>
              </div>

              {/* Form */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-semibold text-lg">
                  {editingItemId ? "Edit Item" : "Add New Item"}
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Exclusive Cooperation"
                    value={itemForm.title || ""}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Detail
                  </label>
                  <textarea
                    placeholder="Item description"
                    value={itemForm.detail || ""}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        detail: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveItem}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {editingItemId ? "Update Item" : "Add Item"}
                  </button>
                  {editingItemId && (
                    <button
                      onClick={resetItemForm}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Benefits Items</h3>
                <div className="space-y-3">
                  {(selectedCategory.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            {item.detail}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedCategory.items || selectedCategory.items.length === 0) && (
                    <p className="text-center py-8 text-gray-600">
                      No items yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ DROPDOWN ITEMS TAB ============ */}
          {activeTab === "dropdown" && selectedCategory && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium">
                  Category: <span className="text-blue-600">{selectedCategory.type}</span>
                </p>
              </div>

              {/* Form */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-semibold text-lg">
                  {editingDropdownId ? "Edit Detail" : "Add New Detail"}
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Exclusive Strategic Cooperation"
                    value={dropdownForm.title || ""}
                    onChange={(e) =>
                      setDropdownForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Detail Description
                  </label>
                  <textarea
                    placeholder="Detailed description (supports line breaks)"
                    value={dropdownForm.detail || ""}
                    onChange={(e) =>
                      setDropdownForm((prev) => ({
                        ...prev,
                        detail: e.target.value,
                      }))
                    }
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDropdownItem}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {editingDropdownId ? "Update Detail" : "Add Detail"}
                  </button>
                  {editingDropdownId && (
                    <button
                      onClick={resetDropdownForm}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Items List */}
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Learn More Details
                </h3>
                <div className="space-y-3">
                  {(selectedCategory.dropdownItems || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-600">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            {item.detail}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditDropdownItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDropdownItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedCategory.dropdownItems ||
                    selectedCategory.dropdownItems.length === 0) && (
                    <p className="text-center py-8 text-gray-600">
                      No details yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ CONTACT TAB ============ */}
          {activeTab === "contact" && selectedCategory && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium">
                  Category: <span className="text-blue-600">{selectedCategory.type}</span>
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Ayyan Technology Co. LTD."
                    value={contactForm.company}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <textarea
                    placeholder="Full address"
                    value={contactForm.address}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="contact@example.com"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveContact}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Contact Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
