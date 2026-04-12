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
  { name: "Facebook", href: "#", image: "/socials/FB.png" },
  { name: "X", href: "#", image: "/socials/X.png" },
  { name: "Instagram", href: "#", image: "/socials/Instagram.png" },
  { name: "LinkedIn", href: "#", image: "/socials/Linked.png" },
  { name: "YouTube", href: "#", image: "/socials/youtube.png" },
  { name: "TikTok", href: "#", image: "/socials/tiktok.png" },
  { name: "SnapChat", href: "#", image: "/socials/Snapchat.png" },
];

export default function Footer() {
  const currentPath = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    description: "",
  });
  const [footerLogos, setFooterLogos] = useState<FooterLogos>({
    mainLogo: null,
    footerLogo: null,
    footerImage: null,
  });

  // 🔥 SCROLL ANIMATION (MAIN MAGIC)
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-reveal");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Fetch data
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: logos } = await supabase
        .from("logos")
        .select("logo_type, url");

      const map: any = {};
      logos?.forEach((l) => (map[l.logo_type] = l.url));

      setFooterLogos({
        mainLogo: map["main"],
        footerLogo: map["footer_logo"],
        footerImage: map["footer_image"],
      });

      const { data: company } = await supabase
        .from("company_info")
        .select("description")
        .single();

      if (company) setCompanyInfo(company);

      const categories = await getPublicCategories();
      if (categories.success) setCategories(categories.data);
    };

    load();
  }, [currentPath]);

  return (
    <>
      {/* 🔥 PREMIUM ANIMATION STYLE */}
      <style>{`
        @keyframes smoothFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .animate-reveal {
          animation: smoothFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .reveal {
          opacity: 0;
        }
      `}</style>

      <footer className="bg-[#d6202a] text-white px-8 py-16">
        <div className="max-w-7xl mx-auto">

          {/* Banner */}
          {footerLogos.footerImage && (
            <div className="mb-12 reveal">
              <img
                src={footerLogos.footerImage}
                className="rounded-lg w-full max-h-64 object-cover"
              />
            </div>
          )}

          <div className="grid md:grid-cols-5 gap-10">

            {/* Logo */}
            <div className="reveal" style={{ animationDelay: "0.1s" }}>
              <img
                src={footerLogos.footerLogo || footerLogos.mainLogo || ""}
                className="w-36 mb-4"
              />
              <p className="text-sm">{companyInfo.description}</p>
            </div>

            {/* Categories */}
            <div className="reveal" style={{ animationDelay: "0.2s" }}>
              <h3 className="mb-4 font-semibold">Categories</h3>
              {categories.slice(0, 4).map((c, i) => (
                <p
                  key={c.id}
                  className="text-sm mb-2 reveal"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                >
                  {c.title}
                </p>
              ))}
            </div>

            {/* Links */}
            <div className="reveal" style={{ animationDelay: "0.3s" }}>
              <h3 className="mb-4 font-semibold">Company</h3>
              {["About", "Contact", "Privacy"].map((l, i) => (
                <p
                  key={l}
                  className="text-sm mb-2 reveal"
                  style={{ animationDelay: `${0.35 + i * 0.05}s` }}
                >
                  {l}
                </p>
              ))}
            </div>

            {/* Newsletter */}
            <div className="reveal" style={{ animationDelay: "0.4s" }}>
              <h3 className="mb-4 font-semibold">Newsletter</h3>
              <input
                className="w-full p-2 rounded bg-white/10 text-white"
                placeholder="Email"
              />
            </div>

            {/* Social */}
            <div className="reveal" style={{ animationDelay: "0.5s" }}>
              <h3 className="mb-4 font-semibold">Follow</h3>
              <div className="grid grid-cols-4 gap-2">
                {socialLinks.map((s, i) => (
                  <div
                    key={s.name}
                    className="reveal border p-2 flex justify-center hover:scale-110 transition"
                    style={{ animationDelay: `${0.5 + i * 0.07}s` }}
                  >
                    <AppImage src={s.image} alt="" width={20} height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="mt-12 text-sm reveal"
            style={{ animationDelay: "0.8s" }}
          >
            © TechOn
          </div>
        </div>
      </footer>
    </>
  );
}
