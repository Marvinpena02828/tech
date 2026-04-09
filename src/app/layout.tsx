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
    default:
      "TechOn – Innovative Electronics & Smart Tech Accessories | tech-on.net",
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
  openGraph: {
    title: "TechOn – Innovative Electronics & Smart Tech Accessories",
    description:
      "TechOn is a professional supplier of smart, reliable and innovative smartphone accessories and electronics. Since 2015, AyyanTech delivers quality B2B tech solutions worldwide.",
    url: "https://tech-on.net",
    siteName: "TechOn",
    images: [
      {
        url: "/techon.png",
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
    images: ["/techon.png"],
    site: "@AyyanInnov12181",
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
        {logos.favicon && <link rel="icon" href={logos.favicon} />}

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
        {/* Hide Google Translate UI elements */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* Hide Google Translate toolbar/banner - all variants */
          .goog-te-banner-frame,
          .goog-te-banner-frame.skiptranslate,
          iframe.goog-te-banner-frame,
          #goog-gt-tt,
          .goog-tooltip,
          .goog-tooltip-card,
          .goog-te-balloon-frame,
          div#goog-gt-tt,
          .goog-te-ftab-float {
            display: none !important;
            visibility: hidden !important;
          }
          /* Prevent body from being pushed down */
          body {
            top: 0px !important;
            position: static !important;
          }
          /* Hide Google Translate widget container */
          #google_translate_element {
            position: fixed;
            top: -9999px;
            left: -9999px;
            opacity: 0;
            pointer-events: none;
          }
          /* Hide Google Translate branding */
          .goog-te-gadget {
            color: transparent !important;
          }
          .goog-te-gadget > span {
            display: none !important;
          }
          .goog-te-gadget > div {
            display: none !important;
          }
          /* Keep only the select element */
          .goog-te-combo {
            display: block !important;
          }
        `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${montserrat.variable} ${neuropol.variable} antialiased`}
      >
        <Providers>
          <Header logos={logos} />
          {children}
          <Footer />
          <FloatingContactButtons />
        </Providers>

        {/* Google Translate Element - Hidden but functional */}
        <div id="google_translate_element" />

        {/* Google Translate Init */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,zh-CN,ar,ru,de,ro,es,fr',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }

            (function suppressGoogleTranslateBanner() {
              function removeBanner() {
                // Hide the banner iframe
                var els = document.querySelectorAll(
                  '.goog-te-banner-frame, iframe.goog-te-banner-frame, #goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame'
                );
                els.forEach(function(el) {
                  el.style.setProperty('display', 'none', 'important');
                });

                // Hide the injected skiptranslate wrapper div (contains the banner iframe)
                var wrappers = document.querySelectorAll('body > .skiptranslate');
                wrappers.forEach(function(el) {
                  el.style.setProperty('display', 'none', 'important');
                });

                // Reset body.top that Google sets to ~40px
                if (document.body) {
                  document.body.style.setProperty('top', '0px', 'important');
                }
              }

              // Intercept body.style.top so Google Translate can never shift the page down
              try {
                var _bodyStyleTop = '';
                var nativeStyleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
                Object.defineProperty(document.body, 'style', {
                  get: function() { return nativeStyleDescriptor.get.call(this); },
                  set: function(val) { nativeStyleDescriptor.set.call(this, val); this.style.top = '0px'; }
                });
              } catch(e) {}

              // MutationObserver for dynamic injection
              var observer = new MutationObserver(removeBanner);
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
              });

              // Interval as a safety net (clears after 30s to avoid overhead)
              var count = 0;
              var interval = setInterval(function() {
                removeBanner();
                count++;
                if (count > 300) clearInterval(interval);
              }, 100);

              removeBanner();
            })();
          `}
        </Script>

        {/* Google Translate Script */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
