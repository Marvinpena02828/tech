"use client";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { ChevronDown, Menu, X, Search, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ProductsMegaMenu from "../ProductsMegaMenu";
import SearchDialog from "../SearchDialog";
import { usePathname } from "next/navigation";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface LogosProps {
  main?: string;
  mobile?: string;
  favicon?: string;
}

interface HeaderProps {
  logos?: LogosProps;
}

interface PromotionalBar {
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/17GuPDVnXE/",
    image: "/Images/social-media/facebook.png",
    imageHover: "/socials/FB-hover.png",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ayyan.innovations/",
    image: "/Images/social-media/Instagram.png",
    imageHover: "/socials/ig-hover.png",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ayyan-innovations/",
    image: "/Images/social-media/Linked.png",
    imageHover: "/socials/linked-hover.png",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@AyyanInnovations",
    image: "/Images/social-media/youtube.png",
    imageHover: "/socials/youtube-hover.png",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ayyaninnovations",
    image: "/Images/social-media/tiktok.png",
    imageHover: "/socials/tiktok-hover.png",
  },
  {
    name: "Snapchat",
    href: "https://snapchat.com/t/RSuD7Sx3",
    image: "/Images/social-media/Snapchat.png",
    imageHover: "/socials/snapchat-hover.png",
  },
  { name: "X", href: "https://x.com/AyyanInnov12181", image: "/socials/X.png" },
];

export default function Header({ logos }: HeaderProps) {
  const [promoBar, setPromoBar] = useState<PromotionalBar | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [openParentCategory, setOpenParentCategory] = useState<string | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastClickedRoute, setLastClickedRoute] = useState<string>("/");
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const supabase = createClient();

  const currentPath = usePathname();

  // ✅ USE LOGOS FROM CMS PROP
  const mainLogo = logos?.main || "";
  const mobileLogo = logos?.mobile || "";

  // Helper function to check if a path is active
  const isPathActive = (href: string): boolean => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };

  // Fetch promotional bar
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const { data } = await supabase
          .from("promotional_bars")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data) setPromoBar(data);
      } catch (err) {
        console.error("Error fetching promo:", err);
      }
    };

    fetchPromo();
  }, []);

  // Function to change language using Google Translate
  const changeLanguage = (languageCode: string, languageName: string) => {
    setSelectedLanguage(languageName);
    setIsLanguageDropdownOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", languageCode);
      localStorage.setItem("preferredLanguageName", languageName);
    }

    const setCookie = (name: string, value: string, days: number) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    const triggerLanguageChange = () => {
      try {
        const languageValue =
          languageCode === "en" ? "/auto/en" : `/auto/${languageCode}`;
        setCookie("googtrans", languageValue, 365);
        setCookie("googtrans", `${languageValue}`, 365);
        window.location.reload();
        return true;
      } catch (error) {
        console.error("Error changing language:", error);
        return false;
      }
    };

    triggerLanguageChange();
  };

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguageCode = localStorage.getItem("preferredLanguage");
      const savedLanguageName = localStorage.getItem("preferredLanguageName");

      if (savedLanguageName) {
        setSelectedLanguage(savedLanguageName);
      }

      if (savedLanguageCode && savedLanguageCode !== "en") {
        const setCookie = (name: string, value: string, days: number) => {
          const expires = new Date();
          expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
          document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        };

        const languageValue = `/auto/${savedLanguageCode}`;
        setCookie("googtrans", languageValue, 365);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cat = await getPublicCategories();

        if (cat.success) {
          setCategories(cat.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleMenuHover = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 100);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      megaMenuRef.current &&
      !megaMenuRef.current.contains(e.target as Node)
    ) {
      const productsButton = document.querySelector("[data-products-menu]");
      if (productsButton && !productsButton.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }

    if (
      languageDropdownRef.current &&
      !languageDropdownRef.current.contains(e.target as Node)
    ) {
      setIsLanguageDropdownOpen(false);
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isMegaMenuOpen) {
      setIsMegaMenuOpen(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);

    let lastScroll = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 60);

      if (isMegaMenuOpen) {
        setIsMegaMenuOpen(false);
      }

      if (currentScrollY > lastScroll && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScroll) {
        setShowHeader(true);
      }

      if (currentScrollY < 10) {
        setShowHeader(true);
      }

      lastScroll = currentScrollY;
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, [isMegaMenuOpen]);

  // Add smooth scroll behavior to html element
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setLastClickedRoute("/");
  };

  return (
    <>
      {/* CONTAINER FOR PROMO + HEADER - MOVES TOGETHER */}
      <div
        className={`w-full fixed left-0 right-0 z-40 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        } ${currentPath.startsWith("/admin") ? "hidden" : ""}`}
      >
        {/* PROMO BAR - ALWAYS VISIBLE WHEN SHOWING */}
        {promoBar?.is_active && (
          <div
            className="w-full transition-all duration-300 overflow-hidden flex items-center"
            style={{
              backgroundColor: promoBar.background_color,
              height: "30px",
              margin: 0,
            }}
          >
            <style>{`
              @keyframes marquee {
                0% {
                  transform: translateX(100%);
                }
                100% {
                  transform: translateX(-100%);
                }
              }
              .marquee-text {
                display: inline-block;
                animation: marquee 15s linear infinite;
                white-space: nowrap;
              }
            `}</style>
            <div className="marquee-text" style={{ color: promoBar.text_color }}>
              <p className="text-xs font-medium m-0">
                {promoBar.message}
              </p>
            </div>
          </div>
        )}

        {/* HEADER - DIRECTLY BELOW PROMO BAR (NO SPACING) */}
        <header
          className={`w-full z-40 h-16 md:h-20 lg:h-20 font-sans transition-all duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          } ${isScrolled ? "shadow-lg" : ""}`}
          style={{ backgroundColor: "#d6202a" }}
        >
          <div className="w-full flex items-center max-w-[1800px] mx-auto px-4 md:px-12 justify-between h-full">
            {/* ========== LOGO AREA ========== */}
            <div
              className={`flex items-center h-full shrink-0 transition-all duration-700 self-start delay-100 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <button
                onClick={handleLogoClick}
                className="flex items-center group h-full hover:opacity-80 transition-opacity"
                aria-label="Go to home and scroll to top"
              >
                {mainLogo ? (
                  <img
                    src={mainLogo}
                    alt="AyyanTech Logo"
                    className="h-7 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                  />
                ) : (
                  <div className="h-7 md:h-10 bg-white/20 rounded w-32 animate-pulse" />
                )}
              </button>
            </div>

            {/* ========== DESKTOP NAVIGATION MENU (Right of Logo) ========== */}
            <nav
              className={`hidden xl:flex items-end justify-end h-full gap-6 transition-all duration-700 delay-300 pb-8 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0"
              }`}
            >
              <Link
                href="/"
                onClick={() => setLastClickedRoute("/")}
                className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isPathActive("/")
                    ? "text-red-500 font-bold"
                    : "text-white hover:text-red-500"
                }`}
                suppressHydrationWarning
              >
                HOME
              </Link>

              {/* Products Mega Menu */}
              <div
                className="relative whitespace-nowrap shrink-0"
                data-products-menu
                onMouseEnter={handleMenuHover}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  href="/products"
                  onClick={() => setLastClickedRoute("/products")}
                  className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 flex items-center space-x-1 whitespace-nowrap shrink-0 ${
                    isPathActive("/products")
                      ? "text-red-500 font-bold"
                      : "text-white hover:text-red-500"
                  }`}
                  aria-expanded={isMegaMenuOpen}
                  aria-label="Products menu"
                >
                  <span suppressHydrationWarning>PRODUCTS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      isMegaMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </Link>
              </div>

              <Link
                href="/about"
                onClick={() => setLastClickedRoute("/about")}
                className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isPathActive("/about")
                    ? "text-red-500 font-bold"
                    : "text-white hover:text-red-500"
                }`}
                suppressHydrationWarning
              >
                ABOUT US
              </Link>

              <Link
                href="/news"
                onClick={() => setLastClickedRoute("/news")}
                className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isPathActive("/news")
                    ? "text-red-500 font-bold"
                    : "text-white hover:text-red-500"
                }`}
                suppressHydrationWarning
              >
                NEWS
              </Link>

              <Link
                href="/contact"
                onClick={() => setLastClickedRoute("/contact")}
                className={`font-medium text-sm uppercase tracking-wide transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isPathActive("/contact")
                    ? "text-red-500 font-bold"
                    : "text-white hover:text-red-500"
                }`}
                suppressHydrationWarning
              >
                CONTACT US
              </Link>
            </nav>

            {/* ========== SOCIAL ICONS & SEARCH (Far Right) ========== */}
            <div
              className={`hidden h-full xl:flex flex-col justify-end gap-3 items-start space-x-3 shrink-0  transition-all duration-700 delay-500 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              {/* Search Icon */}
              <div className="flex items-end space-x-2 mt-1 pb-8">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className=" hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Open search"
                >
                  <Search
                    size={25}
                    className="text-white cursor-pointer hover:text-red-500 transition-all duration-300 hover:scale-110  nav-link-hover"
                  />
                </button>

                {/* Language Dropdown */}
                <div className="relative z-40" ref={languageDropdownRef}>
                  <button
                    onClick={() =>
                      setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                    }
                    className="flex items-center space-x-2 hover:text-red-500 transition-all duration-300"
                  >
                    <Globe className="text-white hover:text-red-500 transition-colors" />
                    <span
                      className="text-white cursor-pointer hover:text-red-500 transition-all duration-300"
                      suppressHydrationWarning
                    >
                      {selectedLanguage}
                    </span>
                    <ChevronDown
                      className={`text-white transition-transform duration-300 ${
                        isLanguageDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isLanguageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => changeLanguage("en", "English")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "English"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => changeLanguage("zh-CN", "中文")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "中文"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        中文 (Chinese)
                      </button>
                      <button
                        onClick={() => changeLanguage("ar", "العربية")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "العربية"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        العربية (Arabic)
                      </button>
                      <button
                        onClick={() => changeLanguage("ru", "Русский")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "Русский"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        Русский (Russian)
                      </button>
                      <button
                        onClick={() => changeLanguage("de", "Deutsch")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "Deutsch"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        Deutsch (German)
                      </button>
                      <button
                        onClick={() => changeLanguage("ro", "Română")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "Română"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        Română (Romanian)
                      </button>
                      <button
                        onClick={() => changeLanguage("es", "Español")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                          selectedLanguage === "Español"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        Español (Spanish)
                      </button>
                      <button
                        onClick={() => changeLanguage("fr", "Français")}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors rounded-b-lg ${
                          selectedLanguage === "Français"
                            ? "bg-gray-50 font-semibold text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        Français (French)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden ml-auto px-3 sm:px-4 md:px-6 text-white hover:text-red-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
              ) : (
                <Menu size={24} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Menu - Off-Canvas Drawer */}
      <div
        className={`h-[calc(100vh-64px)] w-[85vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 xl:hidden fixed  top-16  md:top-20 lg:top-24 left-0                   
    ${
      isMobileMenuOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }
  `}
      >
        <nav className="flex flex-col p-6 space-y-6 overflow-y-auto h-full">
          <Link
            href="/"
            className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 nav-link-hover ${
              isPathActive("/")
                ? "text-red-500 font-bold"
                : "text-gray-900 hover:text-red-500"
            }`}
            onClick={() => {
              setLastClickedRoute("/");
              setIsMobileMenuOpen(false);
            }}
          >
            HOME
          </Link>

          {/* Mobile Products Dropdown */}
          <div className="border-b border-white">
            <button
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className={`w-full text-lg font-medium transition-colors py-3 flex items-center justify-between border-b border-primary-blue/30 nav-link-hover ${
                isPathActive("/products")
                  ? "text-red-500 font-bold"
                  : "text-gray-900 hover:text-red-500"
              }`}
            >
              <span>PRODUCTS</span>
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  isMobileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isMobileDropdownOpen && (
              <div className="pl-4 pb-3 space-y-2">
                {categories
                  .filter((cat) => cat.parent_category_id === null)
                  .map((category) => {
                    const childCategories = categories.filter(
                      (cat) => cat.parent_category_id === category.id,
                    );
                    const hasChildren = childCategories.length > 0;
                    const isOpen = openParentCategory === category.id;

                    return (
                      <div key={category.id} className="space-y-1">
                        {/* Parent Category */}
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/products?category=${category.id}`}
                            className="flex-1 text-gray-900 text-base hover:text-red-500 transition-colors py-2 nav-link-hover"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileDropdownOpen(false);
                              setOpenParentCategory(null);
                            }}
                          >
                            {category.title}
                          </Link>

                          {/* Toggle button for child categories */}
                          {hasChildren && (
                            <button
                              onClick={() => {
                                setOpenParentCategory(
                                  isOpen ? null : category.id,
                                );
                              }}
                              className="p-2 hover:text-red-500 transition-colors"
                              aria-label={`Toggle ${category.title} subcategories`}
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Child Categories Dropdown */}
                        {hasChildren && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "max-h-[500px] opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="pl-4 space-y-1 border-l-2 border-gray-200 pt-1">
                              {childCategories.map((childCategory) => (
                                <Link
                                  key={childCategory.id}
                                  href={`/products?category=${childCategory.id}`}
                                  className="block text-gray-700 text-sm hover:text-red-500 transition-colors py-2 nav-link-hover"
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsMobileDropdownOpen(false);
                                    setOpenParentCategory(null);
                                  }}
                                >
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

          <Link
            href="/about"
            className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 nav-link-hover ${
              isPathActive("/about")
                ? "text-red-500 font-bold"
                : "text-gray-900 hover:text-red-500"
            }`}
            onClick={() => {
              setLastClickedRoute("/about");
              setIsMobileMenuOpen(false);
            }}
          >
            ABOUT US
          </Link>
          <Link
            href="/news"
            className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 nav-link-hover ${
              isPathActive("/news")
                ? "text-red-500 font-bold"
                : "text-gray-900 hover:text-red-500"
            }`}
            onClick={() => {
              setLastClickedRoute("/news");
              setIsMobileMenuOpen(false);
            }}
          >
            NEWS
          </Link>
          <Link
            href="/contact"
            className={`text-lg font-medium transition-colors py-3 border-b border-primary-blue/30 nav-link-hover ${
              isPathActive("/contact")
                ? "text-red-500 font-bold"
                : "text-gray-900 hover:text-red-500"
            }`}
            onClick={() => {
              setLastClickedRoute("/contact");
              setIsMobileMenuOpen(false);
            }}
          >
            CONTACT US
          </Link>

          {/* Mobile Social Icons */}
          <div className="pt-8 ">
            <h4 className="text-gray-900 text-sm font-bold mb-4 uppercase tracking-wider">
              Follow Us
            </h4>
            <div className="grid grid-cols-6 gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="group relative flex items-center justify-center"
                  aria-label={social.name}
                  title={social.name}
                >
                  <div className="flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-linear-to-br hover:from-primary-blue hover:to-purple-600 hover:scale-110 hover:shadow-lg">
                    <AppImage
                      src={social.image}
                      alt={social.name}
                      width={36}
                      height={36}
                      className="object-contain filter  w-9 h-9"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="pt-4">
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-gray-300 text-primary-blue py-3 px-4 rounded-lg transition-colors"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>

          {/* Mobile Language Selector */}
          <div className="pt-4 border-t border-gray-900/30">
            <h4 className="text-white text-sm font-bold mb-3 uppercase tracking-wider">
              Language
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  changeLanguage("en", "English");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "English"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  changeLanguage("zh-CN", "中文");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "中文"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                中文 (Chinese)
              </button>
              <button
                onClick={() => {
                  changeLanguage("ar", "العربية");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "العربية"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                العربية (Arabic)
              </button>
              <button
                onClick={() => {
                  changeLanguage("ru", "Русский");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "Русский"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                Русский (Russian)
              </button>
              <button
                onClick={() => {
                  changeLanguage("de", "Deutsch");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "Deutsch"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                Deutsch (German)
              </button>
              <button
                onClick={() => {
                  changeLanguage("ro", "Română");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "Română"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                Română (Romanian)
              </button>
              <button
                onClick={() => {
                  changeLanguage("es", "Español");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "Español"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                Español (Spanish)
              </button>
              <button
                onClick={() => {
                  changeLanguage("fr", "Français");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === "Français"
                    ? "bg-gray-300 text-red-500 font-semibold "
                    : "bg-gray-300 text-primary-blue hover:bg-primary-blue"
                }`}
              >
                Français (French)
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden top-16  md:top-20 lg:top-24  "
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Products Mega Menu - Positioned outside header, preloaded but hidden for instant display */}
      <div
        ref={megaMenuRef}
        className={`fixed top-16 left-0 right-0 z-[9999] md:top-20 lg:top-24 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] lg:max-h-none overflow-y-auto transition-opacity duration-200 ${
          isMegaMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
      >
        <ProductsMegaMenu onClose={() => setIsMegaMenuOpen(false)} />
      </div>

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div
        className={`w-full ${
          promoBar?.is_active
            ? "h-[calc(64px+30px)] md:h-[calc(80px+30px)] lg:h-[calc(80px+30px)]"
            : "h-16 md:h-20 lg:h-20"
        } ${currentPath.startsWith("/admin") ? "hidden" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}
