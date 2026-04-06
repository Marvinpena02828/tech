"use client";

import { useRouter } from "next/navigation";
import {
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  Newspaper,
  Star,
  Mail,
  Grid,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getKPIStats } from "./action";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalNews: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getKPIStats();
      if (res) {
        setStats({
          totalProducts: res.totalProducts,
          totalCategories: res.totalCategories,
          totalNews: res.totalNews,
          totalUsers: res.totalUsers,
        });
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      name: "Add New Product",
      description: "Create a new product with Google Drive images",
      href: "/admin/products/new",
      icon: Package,
      color: "bg-blue-600",
    },
    {
      name: "Manage Products",
      description: "View and edit all products",
      href: "/admin/products",
      icon: ShoppingCart,
      color: "bg-green-600",
    },
    {
      name: "Featured Items",
      description: "Manage homepage featured items",
      href: "/admin/featured",
      icon: Star,
      color: "bg-yellow-600",
    },
    {
      name: "News & Updates",
      description: "Manage news articles and updates",
      href: "/admin/news",
      icon: Newspaper,
      color: "bg-purple-600",
    },
    {
      name: "Newsletter",
      description: "View newsletter subscriptions",
      href: "/admin/newsletter",
      icon: Mail,
      color: "bg-pink-600",
    },
    {
      name: "Section Settings",
      description: "Show/hide sections across the website",
      href: "/admin/settings",
      icon: Grid,
      color: "bg-orange-600",
    },
    {
      name: "Mega Menu",
      description: "Configure mega menu featured items",
      href: "/admin/mega-menu",
      icon: Star,
      color: "bg-indigo-600",
    },
    {
      name: "Categories",
      description: "Manage product categories for dropdown",
      href: "/admin/categories",
      icon: Grid,
      color: "bg-teal-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
              <div className={`bg-blue-600 p-3 rounded-lg`}>
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCategories}
                </p>
              </div>
              <div className={`bg-blue-600 p-3 rounded-lg`}>
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total News</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalNews}
                </p>
              </div>
              <div className={`bg-blue-600 p-3 rounded-lg`}>
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <div className={`bg-blue-600 p-3 rounded-lg`}>
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={() => router.push(action.href)}
                  className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${action.color} p-3 rounded-lg flex-shrink-0`}
                    >
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {action.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Content Management System</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Products</h4>
                <p className="text-blue-100 text-sm">
                  Manage your product catalog with Google Drive images
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Featured Items & News</h4>
                <p className="text-blue-100 text-sm">
                  Update homepage featured items and news articles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Content Management</h4>
                <p className="text-blue-100 text-sm">
                  Manage all website content from one central location
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
