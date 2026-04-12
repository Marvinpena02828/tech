"use client";

import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface CompanyInfo {
  description: string;
}

interface FooterLogos {
  mainLogo: string | null;
  footerLogo: string | null;
  footerImage: string | null;
}

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/AyyanInnovations/",
    image: "/socials/FB.png",
  },
  {
    name: "X",
    href: "https://x.com/AyyanInnov12181",
    image: "/socials/X.png",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ayyan_innovations/",
    image: "/socials/Instagram.png",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ayyan-innovations/",
    image: "/socials/Linked.png",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@AyyanInnovations",
    image: "/socials/youtube.png",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ayyan_innovations",
    image: "/socials/tiktok.png",
  },
  {
    name: "SnapChat",
    href: "https://snapchat.com/t/RSuD7Sx3",
    image: "/socials/Snapchat.png",
  },
];

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Contact Us", href: "/contact" },
    { label: "Newsroom", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms and Conditions", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const currentPath = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    description: "Since 2015, we've been crafting innovative, durable and functional tech accessories. With roots in China, we deliver quality worldwide built for everyday life.",
  });
  const [footerLogos, setFooterLogos] = useState<FooterLogos>({
    mainLogo: null,
    footerLogo: null,
    footerImage: null,
  });
  const [loadingLogos, setLoadingLogos] = useState(true);

  // Fetch all logos from CMS
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setLoadingLogos(true);
        const supabase = createClient();
        const { data } = await supabase
          .from("logos")
          .select("logo_type, url")
          .in("logo_type", ["main", "footer_logo", "footer_image"]);

        if (data) {
          const logoMap: Record<string, string> = {};
          data.forEach((item) => {
            if (item.url) {
              logoMap[item.logo_type] = item.url;
            }
          });

          setFooterLogos({
            mainLogo: logoMap["main"] || null,
            footerLogo: logoMap["footer_logo"] || null,
            footerImage: logoMap["footer_image"] || null,
          });
        }
      } catch (error) {
        console.error("Error fetching logos:", error);
      } finally {
        setLoadingLogos(false);
      }
    };
    fetchLogos();
  }, []);

  // Fetch company info from Supabase
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("company_info")
          .select("description")
          .single();

        if (error) {
          console.error("Error fetching company info:", error);
        } else if (data) {
          setCompanyInfo(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getPublicCategories();

      if (categories.success) {
        setCategories(categories.data);
      }
    };
    loadCategories();
  }, [currentPath]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Thank you for subscribing!");
        setEmail("");
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Error subscribing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }

        .fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
        }

        .social-icon {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          position: relative;
          overflow: hidden;
        }

        .social-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 1);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.3s ease;
          z-index: 0;
        }

        .social-icon:hover::before {
          transform: scaleY(1);
        }

        .social-icon:nth-child(1) { animation-delay: 0.1s; }
        .social-icon:nth-child(2) { animation-delay: 0.15s; }
        .social-icon:nth-child(3) { animation-delay: 0.2s; }
        .social-icon:nth-child(4) { animation-delay: 0.25s; }
        .social-icon:nth-child(5) { animation-delay: 0.3s; }
        .social-icon:nth-child(6) { animation-delay: 0.35s; }
        .social-icon:nth-child(7) { animation-delay: 0.4s; }

        .category-item {
          animation: fadeInLeft 0.5s ease-out forwards;
          opacity: 0;
        }

        .category-item:nth-child(1) { animation-delay: 0.2s; }
        .category-item:nth-child(2) { animation-delay: 0.25s; }
        .category-item:nth-child(3) { animation-delay: 0.3s; }
        .category-item:nth-child(4) { animation-delay: 0.35s; }

        .footer-column {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .footer-column:nth-child(1) { animation-delay: 0.1s; }
        .footer-column:nth-child(2) { animation-delay: 0.2s; }
        .footer-column:nth-child(3) { animation-delay: 0.3s; }
        .footer-column:nth-child(4) { animation-delay: 0.4s; }
        .footer-column:nth-child(5) { animation-delay: 0.5s; }

        .footer-link-item {
          animation: fadeInLeft 0.5s ease-out forwards;
          opacity: 0;
        }

        .social-icon-img {
          position: relative;
          z-index: 1;
          transition: filter 0.3s ease;
        }

        .social-icon:hover .social-icon-img {
          filter: brightness(0) invert(0);
        }
      `}</style>

      <footer
        className={`bg-[#d6202a] w-full text-white mt-2 mx-auto px-6 sm:px-8 lg:px-12 py-16 ${
          currentPath.startsWith("/admin") ? "hidden" : ""
        }`}
      >
        {/* Footer Image Banner */}
        {footerLogos.footerImage && (
          <div className="w-full max-w-7xl mx-auto mb-12 rounded-lg overflow-hidden fade-in-up">
            <img
              src={footerLogos.footerImage}
              alt="Footer Banner"
              className="w-full h-auto object-cover max-h-64"
            />
          </div>
        )}

        {/* Main Footer Content */}
        <div className="w-full max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
            
            {/* Column 1: Brand Section */}
            <div className="md:col-span-1 footer-column">
              <div className="mb-4">
                {footerLogos.footerLogo ? (
                  <img
                    src={footerLogos.footerLogo}
                    alt="Ayyan Innovations Footer Logo"
                    className="h-auto w-40 object-contain"
                  />
                ) : footerLogos.mainLogo ? (
                  <img
                    src={footerLogos.mainLogo}
                    alt="Ayyan Innovations"
                    className="h-auto w-32 object-contain"
                  />
                ) : (
                  <div className="h-20 w-20 bg-white/20 rounded animate-pulse" />
                )}
              </div>
              <p className="text-sm leading-6 text-white text-opacity-90">
                {companyInfo.description}
              </p>
            </div>

            {/* Column 2: Product Categories */}
            <div className="md:col-span-1 footer-column">
              <h3 className="text-white font-semibold text-base mb-4 font-arial">
                Product Categories
              </h3>
              <ul className="space-y-2">
                {categories
                  .filter((category) => category.parent_category_id === null)
                  .slice(0, 4)
                  .map((category) => (
                    <li key={category.id} className="category-item">
                      <Link
                        href={category.id}
                        className="text-sm text-white text-opacity-90 hover:text-opacity-100 transition-all duration-300 font-arial"
                      >
                        {category.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Column 3: About Baseus */}
            <div className="md:col-span-1 footer-column">
              <h3 className="text-white font-semibold text-base mb-4 font-arial">
                ABOUT Tech-On
              </h3>
              <ul className="space-y-2">
                {footerLinks.Company.map((link, index) => (
                  <li
                    key={link.label}
                    className="footer-link-item"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-white text-opacity-90 hover:text-opacity-100 transition-all duration-300 font-arial"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="md:col-span-1 footer-column">
              <h3 className="text-white font-semibold text-base mb-4 font-arial">
                NEWSLETTER
              </h3>
              <p className="text-sm text-white text-opacity-90 mb-4 font-arial">
                Get the latest news from Tech-On
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex items-center border border-white border-opacity-50 rounded-full px-4 py-2 bg-transparent hover:border-opacity-100 transition-all">
                  <input
                    type="email"
                    placeholder="Your E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-transparent text-white text-sm placeholder-white placeholder-opacity-70 flex-1 focus:outline-none disabled:opacity-50 font-arial"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="text-white ml-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`p-2 rounded text-sm font-arial ${
                      message.includes("Thank you") || message.includes("Successfully")
                        ? "bg-green-500/30 text-green-100"
                        : "bg-red-500/30 text-red-100"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>

            {/* Column 5: Follow Us */}
            <div className="md:col-span-1 footer-column">
              <h3 className="text-white font-semibold text-base mb-4 font-arial">
                FOLLOW US
              </h3>
              
              {/* Social Links Grid */}
              <div className="grid grid-cols-5 gap-2 w-full">
                {socialLinks.map((social) => (
                  <Link
                    target="_blank"
                    key={social.name}
                    href={social.href}
                    className="aspect-square border border-white border-opacity-50 flex items-center justify-center social-icon"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <AppImage
                      src={social.image}
                      alt={social.name}
                      width={20}
                      height={20}
                      className="object-contain w-5 h-5 brightness-0 invert social-icon-img"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-30 my-8" />

        {/* Bottom Section */}
        <div
          className="w-full max-w-7xl mx-auto fade-in-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <p className="text-sm text-white text-opacity-90 font-arial">
            All rights reserved. Ayyan Technology Co., Limited
          </p>
        </div>

        {/* Scroll to Top Button */}
        <div
          className="fixed bottom-8 right-8 z-50 fade-in-scale"
          style={{ animationDelay: "0.7s", opacity: 0 }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 hover:scale-110 transition-all duration-300 text-white shadow-lg border border-white border-opacity-30"
            aria-label="Scroll to top"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </footer>
    </>
  );
}
