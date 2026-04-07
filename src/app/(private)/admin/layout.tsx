"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Package,
  LogOut,
  Menu,
  Home,
  Star,
  Newspaper,
  Mail,
  Grid,
  ImageIcon,
  Settings,
  Phone,
  MapPin,
  Images,
  User,
  Award,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Don't show layout on login page
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "About Page", href: "/admin/about-cms", icon: FileText },
    {
      name: "Guaranteed Quality",
      href: "/admin/guaranteed-quality",
      icon: Award,
    },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Featured Items", href: "/admin/featured", icon: Star },
    { name: "Popular Products", href: "/admin/popular-products", icon: Star },
    { name: "Categories", href: "/admin/categories", icon: Grid },
    { name: "News", href: "/admin/news", icon: Newspaper },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Contact Info", href: "/admin/contact-info", icon: Phone },
    { name: "Address", href: "/admin/address", icon: MapPin },
    { name: "Logo Settings", href: "/admin/logos", icon: ImageIcon },
    { name: "Account Security", href: "/admin/account", icon: User },
    { name: "Section Settings", href: "/admin/settings", icon: Settings },
    { name: "About Marketing", href: "/admin/about-marketing", icon: Images },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Failed to sign out. Please try again.");
        setLoggingOut(false);
      } else {
        toast.success("Signed out successfully");
        router.push("/admin");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Ayyan B2B</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} />
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        {children}
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}
