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
import "./globals.css";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { Providers } from "@/components/Providers";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import TranslationProvider from "@/components/providers/TranslationProvider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const neuropol = localFont({
  src: "../../public/fonts/Neuropol.otf",
  variable: "--font-neuropol",
  display: "swap",
  weight: "400",
});

async function getLogos() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("logos")
      .select("logo_type, url");

    if (error) {
      return { main: "", mobile: "", favicon: "" };
    }

    const logoMap: Record<string, string> = { main: "", mobile: "", favicon: "" };
    
    if (data && Array.isArray(data)) {
      data.forEach((logo: any) => {
        if (logo.logo_type && logo.url) {
          logoMap[logo.logo_type] = logo.url;
        }
      });
    }

    return logoMap;
  } catch {
    return { main: "", mobile: "", favicon: "" };
  }
}

export const metadata: Metadata = {
  title: {
    default: "TechOn – Power Banks, Wall chargers, Car Chargers. Smaller, Cooler, Faster. High-performance charging solutions | tech-on.net",
    template: "%s | TechOn",
  },
  description:
    "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, TechOn delivers quality B2B tech solutions worldwide. Visit tech-on.net.",
  metadataBase: new URL("https://tech-on.net"),
  keywords: [
    "TechOn",
    "TechOn",
    "tech-on.net",
    "TechOn Technology",
    "TechOn Innovations",
    "B2B electronics supplier",
    "smartphone accessories wholesale",
    "tech accessories",
    "electronics wholesale",
    "smart tech solutions",
    "innovative electronics",
  ],
  // Favicon from public folder
  icons: {
    icon: "/Unknown-18.png",
    apple: "/Unknown-18.png",
  },
  openGraph: {
    title: "TechOn – Innovative Electronics & Smart Tech Accessories",
    description:
      "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, AyyanTech delivers quality B2B tech solutions worldwide.",
    url: "https://tech-on.net",
    siteName: "TechOn",
    images: [
      {
        url: "/Unknown-18.png",
        width: 1200,
        height: 630,
        alt: "TechOn – Innovative Electronics & Smart Tech Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechOn – Innovative Electronics & Smart Tech Accessories",
    description:
      "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, AyyanTech delivers quality B2B tech solutions worldwide.",
    images: ["/Unknown-18.png"],
    site: "@TechOn",
  },
  alternates: {
    canonical: "https://tech-on.net",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE",
  },
  other: {
    "msvalidate.01": "YOUR_BING_VERIFICATION_CODE",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logos = await getLogos();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Organization Schema - JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TechOn",
              alternateName: [
                "TechOn Technology",
                "TechOn Innovations",
                "TechOn",
              ],
              url: "https://tech-on.net",
              logo: logos.main || "https://tech-on.net/techon.png",
              description:
                "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics since 2015.",
              foundingDate: "2015",
              sameAs: [
                "https://www.facebook.com/share/17GuPDVnXE/",
                "https://www.instagram.com/ayyan.innovations/",
                "https://www.linkedin.com/company/ayyan-innovations/",
                "https://www.youtube.com/@AyyanInnovations",
                "https://www.tiktok.com/@ayyaninnovations",
                "https://x.com/AyyanInnov12181",
                "https://snapchat.com/t/RSuD7Sx3",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                url: "https://tech-on.net/contact",
              },
            }),
          }}
        />
        {/* WebSite Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TechOn",
              alternateName: "TechOn",
              url: "https://tech-on.net",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://tech-on.net/products?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "TechOn Home",
                  item: "https://tech-on.net",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${montserrat.variable} ${neuropol.variable} antialiased m-0 p-0`}
      >
        <Providers>
          {/* Translation Provider - wraps entire app */}
          <TranslationProvider>
            {/* Header with integrated promo bar */}
            <Header logos={logos} />

            {/* Main page content */}
            {children}

            {/* Footer */}
            <Footer />

            {/* Floating buttons */}
            <FloatingContactButtons />
          </TranslationProvider>
        </Providers>
      </body>
    </html>
  );
}
