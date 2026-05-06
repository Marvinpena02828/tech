"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ContactOption {
  id: number;
  name: string;
  sub_name: string | null;
  link: string;
  icon_file_path: string | null;
  order_index: number;
}

export default function FloatingContactButtons() {
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactOptions = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("floating_contact_buttons")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (error) {
          console.error("Error fetching contact options:", error.message);
          setLoading(false);
          return;
        }

        setContactOptions(data || []);
      } catch (err) {
        console.error("Unexpected error fetching contact buttons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactOptions();
  }, []);

  if (loading || contactOptions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-[9998] flex flex-col items-end gap-4">
      {contactOptions.map((option) => {
        const iconSrc = option.icon_file_path || "/Icons/default.png";
        const isInternalLink = option.link.startsWith("/");
        const isWhatsAppOrWeChat =
          option.name.toLowerCase().includes("whatsapp") ||
          option.name.toLowerCase().includes("wechat");

        // Force external link for WhatsApp/WeChat, otherwise check if internal
        const shouldOpenNewTab = !isInternalLink || isWhatsAppOrWeChat;

        const LinkComponent = isInternalLink && !isWhatsAppOrWeChat ? Link : "a";
        const linkProps =
          isInternalLink && !isWhatsAppOrWeChat
            ? { href: option.link }
            : {
                href: option.link,
                target: "_blank",
                rel: "noopener noreferrer",
              };

        return (
          <LinkComponent
            key={option.id}
            {...linkProps}
            className="relative group w-12 transition-all duration-300 group-hover:w-56"
            title={option.name}
            aria-label={option.name}
          >
            {/* Expanded button background - shown on hover */}
            <div className="absolute bottom-0 right-0 hidden group-hover:flex items-center gap-4 bg-[#e5dedb] rounded-full px-4 py-3 shadow-lg w-56 z-50">
              {/* Icon */}
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <Image
                  src={iconSrc}
                  alt={option.name}
                  width={40}
                  height={40}
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/Icons/default.png";
                  }}
                />
              </div>
              {/* Text content */}
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm font-medium text-[#1e2742] leading-tight truncate">
                  {option.name}
                </p>
                {option.sub_name && (
                  <p className="text-xs text-gray-600 leading-tight truncate">
                    {option.sub_name}
                  </p>
                )}
              </div>
            </div>

            {/* Icon only - shown by default */}
            <div className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
              <Image
                src={iconSrc}
                alt={option.name}
                width={56}
                height={56}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Icons/default.png";
                }}
              />
            </div>
          </LinkComponent>
        );
      })}
    </div>
  );
}
