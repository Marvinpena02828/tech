"use client";

import { PopularProductWithDetails } from "@/types/popularProducts";
import { useState, useEffect } from "react";
import {
  createPopularProduct,
  updatePopularProduct,
  deletePopularProduct,
  togglePopularProductStatus,
  getAvailableProducts,
} from "@/actions/popularProducts";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AppImage from "@/components/ui/AppImage";

interface PopularProductsContentProps {
  popularProducts: PopularProductWithDetails[];
}

interface Product {
  id: string;
  title: string;
  images: string[];
  thumbnail?: string;
}

export default function PopularProductsContent({
  popularProducts,
}: PopularProductsContentProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PopularProductWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    display_order: popularProducts.length + 1,
    is_active: true,
  });

  // Load available products
  useEffect(() => {
    const loadProducts = async () => {
      const result = await getAvailableProducts();
      if (result.success) {
        setAvailableProducts(result.data as Product[]);
      }
    };
    loadProducts();
  }, []);

  const handleOpenModal = (item?: PopularProductWithDetails) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        product_id: item.product_id,
        display_order: item.display_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        product_id: "",
        display_order: popularProducts.length + 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (editingItem) {
        result = await updatePopularProduct(editingItem.id, {
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
      } else {
        result = await createPopularProduct(formData);
      }

      if (result.success) {
        handleCloseModal();
        router.refresh();
      } else {
        alert(result.error || "Failed to save popular product");
      }
    } catch (error) {
      console.error("Error saving popular product:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Remove "${productTitle}" from popular products?`)) return;

    const result = await deletePopularProduct(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete popular product");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await togglePopularProductStatus(id, !currentStatus);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to toggle status");
    }
  };

  const handleMoveUp = async (item: PopularProductWithDetails) => {
    if (item.display_order <= 1) return;
    
    const result = await updatePopularProduct(item.id, {
      display_order: item.display_order - 1,
    });
    
    if (result.success) {
      router.refresh();
    }
  };

  const handleMoveDown = async (item: PopularProductWithDetails) => {
    const result = await updatePopularProduct(item.id, {
      display_order: item.display_order + 1,
    });
    
    if (result.success) {
      router.refresh();
    }
  };

  const filteredProducts = availableProducts.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="text-yellow-500" />
            Popular Products
          </h1>
          <p className="text-gray-600 mt-1">
            Manage products displayed in the Popular Product Lineup section
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Popular Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
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
            {popularProducts.map((item) => {
              const productImage = item.product?.images || item.product?.images?.[0];
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <AppImage
                            src={productImage[0]}
                            alt={item.product?.title || "Product"}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Star size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.product?.title || "Unknown Product"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{item.display_order}</span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(item)}
                          disabled={item.display_order <= 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(item)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Move down"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(item.id, item.is_active)}
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
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.product?.title || "Product")}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

        {popularProducts.length === 0 && (
          <div className="text-center py-12">
            <Star size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No popular products added yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Add your first popular product
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? "Edit Popular Product" : "Add Popular Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product {!editingItem && <span className="text-red-500">*</span>}
                </label>
                {editingItem ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      {editingItem.product?.images?.[0] && (
                        <AppImage
                          src={editingItem.product.images[0]}
                          alt={editingItem.product.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium">{editingItem.product?.title}</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                    />
                    <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, product_id: product.id })
                            }
                            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                              formData.product_id === product.id
                                ? "bg-purple-50 border-l-4 border-purple-600"
                                : ""
                            }`}
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {product.images?.[0] && (
                                <AppImage
                                  src={product.images[0]}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span className="text-left text-sm">{product.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
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
                  Active (Display on website)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || (!editingItem && !formData.product_id)}
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
  );
}
