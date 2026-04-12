"use client";

import Link from "next/link";
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
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.9 6.75H2.556l7.73-8.835L1.75 2.25h6.74l4.97 6.58 5.484-6.58zM17.007 18.519h1.823L5.97 5.08H4.05l13.007 13.44z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.88 2.88 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
      </svg>
    ),
  },
  {
    name: "Snapchat",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.206.5c6.16 0 8.25 5.585 8.47 7.547.133 1.188-.086 2.055-1.035 2.813.526.637.973 1.307 1.206 2.272.323 1.348.117 3.25-1.496 4.66-.508.433-.715 1.082-.528 1.676.188.594.738 1.02 1.383 1.02h.543c.653 0 1.187.533 1.187 1.187 0 .652-.534 1.186-1.187 1.186h-.543c-1.903 0-3.684-.988-4.66-2.61-.305.06-.613.092-.925.092-1.285 0-2.505-.368-3.55-1.006-1.045.638-2.265 1.006-3.55 1.006-.312 0-.62-.032-.925-.092-.976 1.622-2.757 2.61-4.66 2.61h-.543C1.186 21.813.652 21.28.652 20.626c0-.654.534-1.187 1.187-1.187h.543c.645 0 1.195-.426 1.383-1.02.187-.594-.02-1.243-.528-1.676-1.613-1.41-1.819-3.312-1.496-4.66.233-.965.68-1.635 1.206-2.272-.949-.758-1.168-1.625-1.035-2.813C3.456 6.085 5.545.5 11.706.5h.5z" />
      </svg>
    ),
  },
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
      <style>{`
        .social-hover {
          position: relative;
          overflow: hidden;
          aspect-square;
          border: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-default,
        .icon-hover {
          position: absolute;
          transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1),
            opacity 0.4s ease;
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
                alt="Footer Logo"
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
              className="w-full p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20"
              placeholder="Your email"
            />
          </div>

          {/* SOCIAL ICONS */}
          <div>
            <h3 className="mb-4 font-semibold">Follow</h3>

            <div className="grid grid-cols-5 gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-hover"
                  title={social.name}
                >
                  {/* DEFAULT ICON */}
                  <div className="absolute brightness-0 invert icon-default">
                    {social.icon}
                  </div>

                  {/* HOVER ICON */}
                  <div className="absolute icon-hover text-white">
                    {social.icon}
                  </div>
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
