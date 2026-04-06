"use client";
import Link from "next/link";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ProductsMegaMenu from "../ProductsMegaMenu";
import SearchDialog from "../SearchDialog";
import { usePathname } from "next/navigation";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import { Category } from "@/lib/types";

interface LogosProps {
  main?: string;
}

export default function Header({ logos }: { logos?: LogosProps }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [openParentCategory, setOpenParentCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentPath = usePathname();
  const mainLogo = logos?.main || "";

  const isPathActive = (href: string): boolean => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cat = await getPublicCategories();
        if (cat.success) setCategories(cat.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleMenuHover = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setIsMegaMenuOpen(false), 100);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
      const productsButton = document.querySelector("[data-products-menu]");
      if (productsButton && !productsButton.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }
  };

  useEffect(() => {
    setIsVisible(true);
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 60);
      if (isMegaMenuOpen) setIsMegaMenuOpen(false);
      if (currentScrollY > lastScroll && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScroll) {
        setShowHeader(true);
      }
      if (currentScrollY < 10) setShowHeader(true);
      lastScroll = currentScrollY;
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, [isMegaMenuOpen]);

  return (
    <>
      <header className={`w-full fixed top-0 left-0 right-0 z-40 bg-primary-blue h-16 md:h-20 lg:h-20 font-sans border-b transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0"} ${isScrolled ? "shadow-lg" : ""} ${showHeader ? "translate-y-0" : "-translate-y-full"} ${currentPath.startsWith("/admin") ? "hidden" : ""}`}>
        <div className="w-full flex items-center max-w-[1800px] mx-auto px-4 md:px-12 justify-between h-full">
          <div className={`flex items-center h-full shrink-0 transition-all duration-700 self-start delay-100 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"}`}>
            <Link href="/" className="flex items-center group h-full">
              {mainLogo ? (
                <img src={mainLogo} alt="AyyanTech" className="h-7 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" loading="eager" />
              ) : (
                <div className="h-7 md:h-10 bg-white/20 rounded w-32 animate-pulse" />
              )}
            </Link>
          </div>

          <nav className={`hidden xl:flex items-end justify-end h-full gap-6 transition-all duration-700 delay-300 pb-8 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
            <Link href="/" className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 ${isPathActive("/") ? "text-red-500 font-bold" : "text-white hover:text-red-500"}`}>HOME</Link>
            <div className="relative whitespace-nowrap shrink-0" data-products-menu onMouseEnter={handleMenuHover} onMouseLeave={handleMenuLeave}>
              <Link href="/products" className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 flex items-center space-x-1 ${isPathActive("/products") ? "text-red-500 font-bold" : "text-white hover:text-red-500"}`}>
                <span>PRODUCTS</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180" : ""}`} />
              </Link>
            </div>
            <Link href="/about" className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 ${isPathActive("/about") ? "text-red-500 font-bold" : "text-white hover:text-red-500"}`}>ABOUT US</Link>
            <Link href="/news" className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 ${isPathActive("/news") ? "text-red-500 font-bold" : "text-white hover:text-red-500"}`}>NEWS</Link>
            <Link href="/contact" className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 ${isPathActive("/contact") ? "text-red-500 font-bold" : "text-white hover:text-red-500"}`}>CONTACT US</Link>
          </nav>

          <div className={`hidden h-full xl:flex flex-col justify-end gap-3 items-start space-x-3 shrink-0 transition-all duration-700 delay-500 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
            <div className="flex items-end space-x-2 mt-1 pb-8">
              <button onClick={() => setIsSearchOpen(true)} className="hover:bg-gray-100 rounded-full transition-colors">
                <Search size={25} className="text-white cursor-pointer hover:text-red-500 transition-all duration-300 hover:scale-110" />
              </button>
            </div>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden ml-auto px-3 sm:px-4 md:px-6 text-white hover:text-red-500 transition-colors">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className={`h-[calc(100vh-64px)] w-[85vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 xl:hidden fixed top-16 md:top-20 lg:top-24 left-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <nav className="flex flex-col p-6 space-y-6 overflow-y-auto h-full">
          <Link href="/" className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 ${isPathActive("/") ? "text-red-500 font-bold" : "text-gray-900 hover:text-red-500"}`} onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
          <div className="border-b border-white">
            <button onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)} className={`w-full text-lg font-medium transition-colors py-3 flex items-center justify-between border-b border-primary-blue/30 ${isPathActive("/products") ? "text-red-500 font-bold" : "text-gray-900 hover:text-red-500"}`}>
              <span>PRODUCTS</span>
              <ChevronDown size={20} className={`transition-transform ${isMobileDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isMobileDropdownOpen && (
              <div className="pl-4 pb-3 space-y-2">
                {categories.filter((cat) => cat.parent_category_id === null).map((category) => {
                  const childCategories = categories.filter((cat) => cat.parent_category_id === category.id);
                  const hasChildren = childCategories.length > 0;
                  const isOpen = openParentCategory === category.id;
                  return (
                    <div key={category.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Link href={`/products?category=${category.id}`} className="flex-1 text-gray-900 text-base hover:text-red-500 transition-colors py-2" onClick={() => { setIsMobileMenuOpen(false); setIsMobileDropdownOpen(false); }}>
                          {category.title}
                        </Link>
                        {hasChildren && (
                          <button onClick={() => setOpenParentCategory(isOpen ? null : category.id)} className="p-2 hover:text-red-500 transition-colors">
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {hasChildren && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                          <div className="pl-4 space-y-1 border-l-2 border-gray-200 pt-1">
                            {childCategories.map((childCategory) => (
                              <Link key={childCategory.id} href={`/products?category=${childCategory.id}`} className="block text-gray-700 text-sm hover:text-red-500 transition-colors py-2" onClick={() => { setIsMobileMenuOpen(false); setIsMobileDropdownOpen(false); }}>
                                {childCategory.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Link href="/about" className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 ${isPathActive("/about") ? "text-red-500 font-bold" : "text-gray-900 hover:text-red-500"}`} onClick={() => setIsMobileMenuOpen(false)}>ABOUT US</Link>
          <Link href="/news" className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 ${isPathActive("/news") ? "text-red-500 font-bold" : "text-gray-900 hover:text-red-500"}`} onClick={() => setIsMobileMenuOpen(false)}>NEWS</Link>
          <Link href="/contact" className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 ${isPathActive("/contact") ? "text-red-500 font-bold" : "text-gray-900 hover:text-red-500"}`} onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</Link>
          <div className="pt-4">
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center space-x-2 bg-gray-300 text-primary-blue py-3 px-4 rounded-lg transition-colors">
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </nav>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 xl:hidden top-16 md:top-20 lg:top-24" onClick={() => setIsMobileMenuOpen(false)} />}

      <div ref={megaMenuRef} className={`fixed top-16 left-0 right-0 z-[9999] md:top-20 lg:top-24 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] lg:max-h-none overflow-y-auto transition-opacity duration-200 ${isMegaMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onMouseEnter={handleMenuHover} onMouseLeave={handleMenuLeave}>
        <ProductsMegaMenu onClose={() => setIsMegaMenuOpen(false)} />
      </div>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className={`w-full h-16 md:h-20 lg:h-20 ${currentPath.startsWith("/admin") ? "hidden" : ""}`} />
    </>
  );
}
