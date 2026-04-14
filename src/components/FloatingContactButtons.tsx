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

        const linkProps = isInternalLink && !isWhatsAppOrWeChat
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
            className="relative group"
            title={option.name}
            aria-label={option.name}
          >
            {/* Rounded square container - matches design exactly */}
            <div className="w-12 h-12 group p-1 bg-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:w-auto">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Image
                  src={iconSrc}
                  alt={option.name}
                  width={24}
                  height={24}
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/Icons/default.png";
                  }}
                />
              </div>
              {/* Tooltip Text - shown on hover */}
              <div className="text-[#1e2742] hidden group-hover:block pl-4 pr-4 whitespace-nowrap">
                <p className="text-sm font-medium leading-tight">
                  {option.name}
                </p>
                {option.sub_name && (
                  <p className="text-xs text-gray-600 leading-tight">
                    {option.sub_name}
                  </p>
                )}
              </div>
            </div>
          </LinkComponent>
        );
      })}
    </div>
  );
}
