// app/(private)/layout.tsx - SIMPLIFIED VERSION

import type { Metadata } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Inter,
  Montserrat,
} from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { Providers } from "@/components/Providers";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["700", "900"] });
const neuropol = localFont({ src: "../../public/fonts/Neuropol.otf", variable: "--font-neuropol", display: "swap", weight: "400" });

async function getLogos() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("logos").select("logo_type, url");
    
    const logoMap: Record<string, string> = { main: "", mobile: "", favicon: "" };
    
    data?.forEach((logo: any) => {
      if (logo.url) {
        logoMap[logo.logo_type] = logo.url;
      }
    });
    
    return logoMap;
  } catch (error) {
    return { main: "", mobile: "", favicon: "" };
  }
}

export const metadata: Metadata = {
  title: { default: "AyyanTech – Innovative Electronics & Smart Tech Accessories | ayyantech.net", template: "%s | AyyanTech" },
  description: "AyyanTech is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, AyyanTech delivers quality B2B tech solutions worldwide. Visit ayyantech.net.",
  metadataBase: new URL("https://ayyantech.net"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const logos = await getLogos();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {logos.favicon && <link rel="icon" href={logos.favicon} type="image/x-icon" />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${montserrat.variable} ${neuropol.variable} antialiased`}>
        <Providers>
          <Header logos={logos} />
          {children}
          <Footer />
          <FloatingContactButtons />
        </Providers>
        <div id="google_translate_element" />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,zh-CN,ar,ru,de,ro,es,fr', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
