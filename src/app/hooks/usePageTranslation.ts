"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const pathname = usePathname();

  // Map language codes to MyMemory codes
  const LANG_MAP: { [key: string]: string } = {
    en: "en-US",
    zh: "zh-CN",
    ar: "ar",
    ru: "ru",
    de: "de",
    ro: "ro",
    es: "es",
    fr: "fr",
  };

  // Translate text using our API route (backend proxy to MyMemory)
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === "en") return text;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 500), // MyMemory has char limit
          targetLanguage: LANG_MAP[targetLang] || targetLang,
        }),
      });

      if (!response.ok) {
        console.error("Translation API error:", response.statusText);
        return text;
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Get all translatable text from page
  const getPageText = () => {
    const texts: Map<string, HTMLElement[]> = new Map();

    // Get all text nodes
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li, label, button:not(.language-btn), td, th, div, button"
    );

    elements.forEach((el) => {
      // Only get direct text content, not nested elements
      let text = "";
      el.childNodes.forEach((node) => {
        if (node.nodeType === 3) { // TEXT_NODE
          text += node.textContent || "";
        }
      });

      text = text.trim();

      // Skip if text is too short, contains only numbers, or admin routes
      if (
        text &&
        text.length > 3 &&
        !/^\d+$/.test(text) &&
        !pathname.includes("/admin")
      ) {
        if (!texts.has(text)) {
          texts.set(text, []);
        }
        texts.get(text)!.push(el as HTMLElement);
      }
    });

    return texts;
  };

  // Translate page content
  const translatePage = async (targetLanguage: string) => {
    if (targetLanguage === "en") {
      // Reset to English - just reload
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      const pageTexts = getPageText();
      const textsToTranslate = Array.from(pageTexts.keys()).slice(0, 100); // Limit to 100 items

      if (textsToTranslate.length === 0) {
        console.log("No text found to translate");
        setIsTranslating(false);
        return;
      }

      let successCount = 0;

      // Translate with batching to avoid API limits
      const batchSize = 5;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        // Process batch in parallel
        const translations = await Promise.all(
          batch.map((text) => translateText(text, targetLanguage))
        );

        // Apply translations
        batch.forEach((originalText, idx) => {
          const translatedText = translations[idx];
          if (translatedText && translatedText !== originalText) {
            const elements = pageTexts.get(originalText) || [];
            elements.forEach((el) => {
              // Only replace if it's a pure text element
              if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                el.textContent = translatedText;
                successCount++;
              }
            });
          }
        });

        // Add delay between batches to respect API rate limits
        if (i + batchSize < textsToTranslate.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (successCount > 0) {
        setCurrentLanguage(targetLanguage);
        localStorage.setItem("currentLanguage", targetLanguage);
        console.log(`Successfully translated ${successCount} text elements`);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Load saved language on mount and on page change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("currentLanguage");
      if (savedLanguage && savedLanguage !== "en") {
        setCurrentLanguage(savedLanguage);
        // Delay translation to ensure page is fully loaded
        setTimeout(() => {
          translatePage(savedLanguage);
        }, 1500);
      }
    }
  }, [pathname]); // Re-run when pathname changes (page navigation)

  return {
    translatePage,
    currentLanguage,
    setCurrentLanguage,
    isTranslating,
  };
};
