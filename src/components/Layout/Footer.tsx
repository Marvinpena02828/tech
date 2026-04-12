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

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("logos")
        .select("logo_type, url");

      const map: any = {};
      data?.forEach((l) => (map[l.logo_type] = l.url));

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
      {/* 🔥 HOVER ANIMATION (ADDED LANG) */}
      <style>{`
        .social-hover {
          position: relative;
          overflow: hidden;
        }

        .icon-default,
        .icon-hover {
          position: absolute;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease;
        }

        .icon-default {
          transform: translateY(0);
          opacity: 1;
        }

        .icon-hover {
          transform: translateY(100%);
          opacity: 0;
        }

        .social-hover:hover .icon-default {
          transform: translateY(-100%);
          opacity: 0;
        }

        .social-hover:hover .icon-hover {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>

      <footer className="bg-[#d6202a] w-full text-white px-6 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10">

          {/* LOGO */}
          <div>
            {footerLogos.footerLogo || footerLogos.mainLogo ? (
              <img
                src={footerLogos.footerLogo || footerLogos.mainLogo || ""}
                className="w-32 mb-4"
              />
            ) : null}
            <p className="text-sm">{companyInfo.description}</p>
          </div>

          {/* CATEGORIES */}
          <div>
            <h3 className="mb-4 font-semibold">Categories</h3>
            {categories.slice(0, 4).map((c) => (
              <p key={c.id} className="text-sm mb-2">
                {c.title}
              </p>
            ))}
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            {["About", "Contact", "Privacy"].map((l) => (
              <p key={l} className="text-sm mb-2">
                {l}
              </p>
            ))}
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="mb-4 font-semibold">Newsletter</h3>
            <input
              className="w-full p-2 rounded bg-white/10"
              placeholder="Your email"
            />
          </div>

          {/* 🔥 SOCIAL WITH HOVER SLIDE */}
          <div>
            <h3 className="mb-4 font-semibold">Follow</h3>

            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  className="aspect-square border border-white border-opacity-50 flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-all duration-300 social-hover"
                >
                  {/* DEFAULT ICON */}
                  <AppImage
                    src={social.image}
                    alt={social.name}
                    width={20}
                    height={20}
                    className="object-contain w-5 h-5 brightness-0 invert icon-default"
                  />

                  {/* HOVER ICON */}
                  <AppImage
                    src={social.image}
                    alt={social.name}
                    width={20}
                    height={20}
                    className="object-contain w-5 h-5 icon-hover"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-12 text-sm">
          © TechOn Technology Co., Limited
        </div>
      </footer>
    </>
  );
}
