"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppImage from "@/components/ui/AppImage";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/lib/types";

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
  const [logo, setLogo] = useState<string | null>(null);

  // ✅ EXACT SCROLL TRIGGER (same behavior as modern UI)
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.animationDelay = el.dataset.delay || "0s";
            el.classList.add("active");
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Load data
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("logos")
        .select("logo_type, url");

      const mainLogo = data?.find((l) => l.logo_type === "main")?.url;
      setLogo(mainLogo || null);

      const categories = await getPublicCategories();
      if (categories.success) setCategories(categories.data);
    };

    load();
  }, [currentPath]);

  return (
    <>
      {/* ✅ EXACT ANIMATION */}
      <style>{`
        @keyframes revealUpExact {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .reveal {
          opacity: 0;
        }

        .reveal.active {
          animation: revealUpExact 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <footer className="bg-[#d6202a] text-white px-8 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10">

          {/* LOGO */}
          <div className="reveal" data-delay="0s">
            {logo && <img src={logo} className="w-32 mb-4" />}
            <p className="text-sm">
              Since 2015, we've been crafting innovative tech accessories.
            </p>
          </div>

          {/* CATEGORIES */}
          <div className="reveal" data-delay="0.08s">
            <h3 className="mb-4 font-semibold">Categories</h3>
            {categories.slice(0, 4).map((c, i) => (
              <p
                key={c.id}
                className="reveal text-sm mb-2"
                data-delay={`${0.1 + i * 0.06}s`}
              >
                {c.title}
              </p>
            ))}
          </div>

          {/* LINKS */}
          <div className="reveal" data-delay="0.16s">
            <h3 className="mb-4 font-semibold">Company</h3>
            {["About", "Contact", "Privacy"].map((l, i) => (
              <p
                key={l}
                className="reveal text-sm mb-2"
                data-delay={`${0.18 + i * 0.06}s`}
              >
                {l}
              </p>
            ))}
          </div>

          {/* NEWSLETTER */}
          <div className="reveal" data-delay="0.24s">
            <h3 className="mb-4 font-semibold">Newsletter</h3>
            <input
              className="w-full p-2 rounded bg-white/10"
              placeholder="Your email"
            />
          </div>

          {/* SOCIAL */}
          <div className="reveal" data-delay="0.32s">
            <h3 className="mb-4 font-semibold">Follow</h3>

            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map((s, i) => (
                <Link
                  key={s.name}
                  href={s.href}
                  className="reveal border p-2 flex justify-center hover:scale-110 transition duration-300"
                  data-delay={`${0.34 + i * 0.06}s`}
                >
                  <AppImage
                    src={s.image}
                    alt={s.name}
                    width={20}
                    height={20}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="mt-12 text-sm reveal"
          data-delay="0.6s"
        >
          © TechOn Technology Co., Limited
        </div>
      </footer>
    </>
  );
}
