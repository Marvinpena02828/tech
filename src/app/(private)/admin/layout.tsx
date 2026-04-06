import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Poppins, Inter, Montserrat } from "next/font/google";
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
const neuropol = localFont({ src: "../../public/fonts/Neuropol.otf", variable: "--font-neuropol", display: "swap" });

async function getLogos() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("logos")
      .select("*");
    
    if (error) {
      console.error("Supabase error:", error);
      return { main: "", mobile: "", favicon: "" };
    }

    const logoMap: Record<string, string> = { 
      main: "", 
      mobile: "", 
      favicon: "" 
    };

    if (data && Array.isArray(data)) {
      data.forEach((logo: any) => {
        console.log("Logo found:", logo.logo_type, "=", logo.url);
        if (logo.logo_type && logo.url) {
          logoMap[logo.logo_type] = logo.url;
        }
      });
    }

    console.log("Final logoMap:", logoMap);
    return logoMap;
  } catch (error) {
    console.error("getLogos error:", error);
    return { main: "", mobile: "", favicon: "" };
  }
}

export const metadata: Metadata = {
  title: { default: "AyyanTech – Innovative Electronics & Smart Tech Accessories | ayyantech.net", template: "%s | AyyanTech" },
  description: "AyyanTech is a professional supplier of smart, reliable and innovative smartphone accessories and electronics.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const logos = await getLogos();
  return (
    <html lang="en">
      <head>
        {logos.favicon && <link rel="icon" href={logos.favicon} />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${montserrat.variable} ${neuropol.variable} antialiased`}>
        <Providers>
          <Header logos={logos} />
          {children}
          <Footer />
          <FloatingContactButtons />
        </Providers>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
