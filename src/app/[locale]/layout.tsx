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
  src: "../../../public/fonts/Neuropol.otf",
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

// Generate metadata for all locales
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const finalLocale = locale || "en";

  // Base metadata for all locales
  const baseMetadata = {
    en: {
      title:
        "TechOn – Power Banks, Wall chargers, Car Chargers. Smaller, Cooler, Faster. High-performance charging solutions | tech-on.net",
      description:
        "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, TechOn delivers quality B2B tech solutions worldwide.",
      ogTitle:
        "TechOn – Power Banks, Wall chargers, Car Chargers. Smaller, Cooler, Faster",
      ogDescription:
        "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics since 2015.",
      locale: "en_US",
    },
    zh: {
      title:
        "TechOn – 移动电源、壁式充电器、车载充电器。更小、更酷、更快。高性能充电解决方案 | tech-on.net",
      description:
        "TechOn是一个专业的智能、可靠和创新的智能手机配件和电子产品供应商。自2015年以来，TechOn在全球提供优质的B2B技术解决方案。",
      ogTitle: "TechOn – 移动电源、壁式充电器、车载充电器。更小、更酷、更快。",
      ogDescription:
        "TechOn是专业的智能手机配件和电子产品供应商，自2015年起提供优质的B2B解决方案。",
      locale: "zh_CN",
    },
    ar: {
      title:
        "TechOn – بنوك الطاقة وشواحن الحائط وشواحن السيارات. أصغر وأبرد وأسرع. حلول الشحن عالية الأداء | tech-on.net",
      description:
        "TechOn هو مورد احترافي لملحقات الهواتف الذكية والمنتجات الإلكترونية الذكية والموثوقة والمبتكرة. منذ عام 2015، تقدم TechOn حلول B2B عالية الجودة في جميع أنحاء العالم.",
      ogTitle: "TechOn – بنوك الطاقة وشواحن الحائط وشواحن السيارات.",
      ogDescription:
        "TechOn هو مورد احترافي لملحقات الهواتف الذكية والمنتجات الإلكترونية. منذ عام 2015، تقدم حلول B2B عالية الجودة.",
      locale: "ar_SA",
    },
  };

  const currentMeta = baseMetadata[finalLocale as keyof typeof baseMetadata] || baseMetadata.en;

  return {
    title: {
      default: currentMeta.title,
      template: "%s | TechOn",
    },
    description: currentMeta.description,
    metadataBase: new URL("https://tech-on.net"),
    keywords: [
      "TechOn",
      "tech-on.net",
      "power banks",
      "wall chargers",
      "car chargers",
      "B2B electronics",
      "smartphone accessories",
      "tech solutions",
    ],
    icons: {
      icon: "/Unknown-18.png",
      apple: "/Unknown-18.png",
    },
    openGraph: {
      title: currentMeta.ogTitle,
      description: currentMeta.ogDescription,
      url: `https://tech-on.net/${finalLocale}`,
      siteName: "TechOn",
      images: [
        {
          url: "/Unknown-18.png",
          width: 1200,
          height: 630,
          alt: currentMeta.ogTitle,
        },
      ],
      locale: currentMeta.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: currentMeta.ogTitle,
      description: currentMeta.ogDescription,
      images: ["/Unknown-18.png"],
      site: "@TechOn",
    },
    alternates: {
      canonical: `https://tech-on.net/${finalLocale}`,
      languages: {
        en: "https://tech-on.net/en",
        zh: "https://tech-on.net/zh",
        ar: "https://tech-on.net/ar",
        "x-default": "https://tech-on.net",
      },
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
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const finalLocale = locale || "en";
  const logos = await getLogos();

  return (
    <html lang={finalLocale} dir={finalLocale === "ar" ? "rtl" : "ltr"} data-scroll-behavior="smooth">
      <head>
        {/* Hreflang tags for SEO */}
        <link rel="alternate" hrefLang="en" href="https://tech-on.net/en" />
        <link rel="alternate" hrefLang="zh" href="https://tech-on.net/zh" />
        <link rel="alternate" hrefLang="ar" href="https://tech-on.net/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://tech-on.net" />

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
                finalLocale === "en"
                  ? "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics since 2015."
                  : finalLocale === "zh"
                    ? "TechOn是一个专业的智能、可靠和创新的智能手机配件和电子产品供应商。"
                    : "TechOn هو مورد احترافي لملحقات الهواتف الذكية والمنتجات الإلكترونية.",
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
                url: `https://tech-on.net/${finalLocale}/contact`,
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
              inLanguage: finalLocale,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `https://tech-on.net/${finalLocale}/products?search={search_term_string}`,
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
                  name:
                    finalLocale === "en"
                      ? "TechOn Home"
                      : finalLocale === "zh"
                        ? "TechOn首页"
                        : "TechOn الصفحة الرئيسية",
                  item: `https://tech-on.net/${finalLocale}`,
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
