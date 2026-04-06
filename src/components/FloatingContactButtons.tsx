"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { link } from "fs";
import Link from "next/link";

export default function FloatingContactButtons() {
  const contactOptions = [
    {
      name: "Contact Us in WeChat",
      icon: "/Icons/wechat icon.png",
      subName: "+86 181 2416 1233", // Replace with your WeChat link
      link: "/weChat", // Replace with actual WeChat link
    },
    {
      name: "Contact Us in WhatsApp",
      icon: "/Icons/whatsapp icon (1).png",
      subName: "+86 181 2416 1233", // Replace with your WhatsApp number
      link: "https://api.whatsapp.com/send?phone=8618124161233",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[9998] flex flex-col items-end gap-4">
      {contactOptions.map((option, index) => (
        <Link
        target="_blank"
          href={option.link}
          key={option.name}
          className="relative"
          title={option.name}
          aria-label={option.name}
        >
          {/* Rounded square container - matches design exactly */}
          <div className="w-12 h-12 group hover:w-3xs p-1 bg-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl">
            {/* Inner navy blue rounded square */}
            <div className="w-12 h-12 rounded-xl flex items-center  justify-center">
              <Image
                src={option.icon}
                alt={option.name}
                width={20}
                height={20}
                className="object-contain filter brightness-100 convert-to-gray right-0 scale-150"
              />
            </div>
            <p className="text-[#1e2742] hidden group-hover:block pl-5  mr-auto leading-4">
              {option.name}
              <br />
              <span className="text-xs">{option.subName}</span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
