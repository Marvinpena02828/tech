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

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/ayyan_innovations/",
    image: "/socials/Instagram.png",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/AyyanInnovations/",
    image: "/socials/FB.png",
  },
  {
    name: "SnapChat",
    href: "https://snapchat.com/t/RSuD7Sx3",
    image: "/socials/Snapchat.png",
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
  { name: "X", href: "https://x.com/AyyanInnov12181", image: "/socials/X.png" },
];

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Contact Us", href: "/contact" },
    { label: "Events", href: "#" },
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
  const [logoUrl, setLogoUrl] = useState("");

  // Fetch logo from CMS
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("logos")
          .select("url")
          .eq("logo_type", "main")
          .single();
        
        if (data?.url) {
          setLogoUrl(data.url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();
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
    <footer
      className={`bg-primary-blue w-full text-gray-300 mt-2 mx-auto px-6 sm:px-8 lg:px-12 py-16 ${
        currentPath.startsWith("/admin") ? " hidden" : ""
      }`}
    >
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2 mb-8">
          {/* Brand Section */}
          <div className="flex flex-1 flex-col max-w-sm">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Ayyan Innovations"
                className="h-auto w-24 md:w-50 object-contain -mt-6 mb-4"
              />
            ) : (
              <div className="h-24 w-24 bg-white/20 rounded animate-pulse mb-4" />
            )}
            <p className="text-sm leading-5 text-white font-arial mb-6">
              {companyInfo.description}
            </p>
          </div>

          {/* Links Sections */}
          <div className="flex-1 flex flex-col md:flex-row  gap-12 px-6">
            <div>
              <h3 className="text-white font-arial font-semibold text-lg mb-2 md:mb-4 lg:mb-6">
                Product Categories
              </h3>
              <ul className="space-y-1.5 md:space-y-2 lg:space-y-2 grid grid-cols-2 space-x-6">
                {categories
                  .filter((category) => category.parent_category_id === null)
                  .map((category) => (
                    <li key={category.id}>
                      <Link
                        href={category.id}
                        className="text-sm font-bold font-arial hover:scale-110 transition-all duration-300 flex items-center space-x-1.5 md:space-x-2 group"
                      >
                        <span>{category.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-white font-arial font-semibold text-lg mb-2 md:mb-4 lg:mb-6">
                  {category}
                </h3>
                <ul className="space-y-1.5 md:space-y-2 lg:space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold font-arial hover:scale-110 transition-all duration-300 flex items-center space-x-1.5 md:space-x-2 group"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex-1 max-w-2xs">
            <div className="space-y-3 text-white">
              <div className="flex items-end gap-2">
                <AppImage
                  src="/Icons/envelope.png"
                  alt="Mail"
                  width={50}
                  height={50}
                />
                <div className="">
                  <h4 className="font-semibold text-md">Join Our Newsletter</h4>
                  <p className="text-sm">
                    Be the first to know Sign up to newsletter today
                  </p>
                </div>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="grid grid-cols-3 gap-2 row-span-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="col-span-2 bg-gray-100 p-2 text-black text-sm rounded focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="col-span-1 bg-white text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
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
                      </span>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 animate-fade-in ${
                      message.includes("Thank you") ||
                      message.includes("Successfully")
                        ? "bg-green-500/20 border border-green-400 text-green-100"
                        : "bg-red-500/20 border border-red-400 text-red-100"
                    }`}
                  >
                    {message.includes("Thank you") ||
                    message.includes("Successfully") ? (
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{message}</span>
                  </div>
                )}
              </form>

              {/* Social Links */}
              <div className="flex items-center space-x-3 order-1 md:order-2 mt-2">
                {socialLinks.map((social) => {
                  return (
                    <Link
                      target="_blank"
                      key={social.name}
                      href={social.href}
                      className="w-9 md:w-10 h-8 md:h-[29px] rounded-full bg-white flex items-center justify-center hover:bg-primary-blue hover:scale-110 hover:shadow-xl transition-all duration-300"
                      aria-label={social.name}
                    >
                      <AppImage
                        src={social.image}
                        alt={social.name}
                        width={40}
                        height={40}
                        className="object-contain filter hover:brightness-0 hover:invert"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 w-fit">
          {/* Copyright */}
          <p className="text-xs md:text-sm text-white font-arial text-left md:text-left order-3 md:order-1 w-full md:w-auto ">
            All rights reserved. Ayyan Technology Co., Limited
          </p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4A90E2] to-[#357ABD] flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 text-white shadow-lg"
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
  );
}
