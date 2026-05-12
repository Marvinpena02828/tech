"use client";

import { Star, Plus, Edit, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import Image from "next/image";
import { Category, Product } from "@/lib/types";
import { useFeaturedItems } from "./hooks/use-featured";
import { FeaturedItemWithDetails } from "./models/featured-model";
import { useState } from "react";

interface FeaturedContentProps {
  items: FeaturedItemWithDetails[];
  categories: Category[];
  products: Product[];
}

function FeaturedDialog({
  isOpen,
  onClose,
  onSave,
  selectedItem,
  categories,
  products,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, categoryId: string, isActive: boolean) => void;
  selectedItem: FeaturedItemWithDetails | null;
  categories: Category[];
  products: Product[];
  isSaving: boolean;
}) {
  const [selectedProductId, setSelectedProductId] = useState(
    selectedItem?.product_id || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    selectedItem?.category_id || ""
  );
  const [isActive, setIsActive] = useState(selectedItem?.is_active ?? true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedCategoryId) {
      return;
    }
    onSave(selectedProductId, selectedCategoryId, isActive);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {selectedItem ? "Edit Featured Item" : "Add Featured Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Product *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>
            <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedProductId === product.id ? "bg-yellow-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="product"
                        value={product.id}
                        checked={selectedProductId === product.id}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                      />
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Star className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          ID: {product.id}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Toggle */}
          {selectedItem && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving || !selectedProductId || !selectedCategoryId}
              className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving
                ? "Saving..."
                : selectedItem
                ? "Update Featured Item"
                : "Add Featured Item"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FeaturedContent({
  items: initialItems,
  categories,
  products,
}: FeaturedContentProps) {
  const {
    items,
    isDeleting,
    showDialog,
    selectedItem,
    isSaving,
    handleAdd,
    handleEdit,
    handleCloseDialog,
    handleSave,
    handleDelete,
    handleReorder,
    handleToggleStatus,
  } = useFeaturedItems(initialItems);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-yellow-600" size={32} />
                Featured Items
              </h1>
              <p className="text-gray-600 mt-1">
                Manage mega menu featured items ({items.length} total)
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus size={20} />
              Add Featured Item
            </button>
          </div>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Star className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No featured items yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add items to showcase in your mega menu
            </p>
            <button
              onClick={handleAdd}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
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
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {item.product?.images &&
                      item.product.images.length > 0 ? (
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Star className="text-gray-400" size={24} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.product?.title || "Unknown Product"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {item.product_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {item.category?.title || "Unknown"}
                      </span>
                    </td>
             
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(item.id, item.is_active)
                        }
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          item.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </button>
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
                          onClick={() =>
                            handleDelete(
                              item.id,
                              item.product?.title || "Unknown"
                            )
                          }
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
        <FeaturedDialog
          isOpen={showDialog}
          onClose={handleCloseDialog}
          onSave={handleSave}
          selectedItem={selectedItem}
          categories={categories}
          products={products}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
