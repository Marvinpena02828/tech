"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  const LANG_MAP: { [key: string]: string } = {
    en: "en",
    zh: "zh-Hans",
    ar: "ar",
    ru: "ru",
    de: "de",
    ro: "ro",
    es: "es",
    fr: "fr",
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === "en") return text;

    // Check localStorage cache
    const cacheKey = `trans_${targetLang}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: LANG_MAP[targetLang] || targetLang,
        }),
      });

      const data = await response.json();
      const translated = data.translatedText || text;

      // Cache it
      if (translated !== text) {
        localStorage.setItem(cacheKey, translated);
      }

      return translated;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  const translatePageContent = async (targetLanguage: string) => {
    if (targetLanguage === "en") {
      localStorage.setItem("currentLanguage", "en");
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      localStorage.setItem("currentLanguage", targetLanguage);
      setCurrentLanguage(targetLanguage);

      // Get ALL text nodes in page
      const textNodes: { node: Node; parent: HTMLElement; text: string }[] = [];
      const seen = new Set<string>();

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        const parent = node.parentElement;

        // Skip non-translatable content
        if (
          !text ||
          text.length < 2 ||
          !parent ||
          parent.tagName === "SCRIPT" ||
          parent.tagName === "STYLE" ||
          parent.tagName === "NOSCRIPT" ||
          pathname.includes("/admin") ||
          parent.classList.contains("language-btn") ||
          parent.closest(".goog-te-bubble") ||
          parent.closest("#google_translate_element")
        ) {
          continue;
        }

        // Skip duplicates
        if (seen.has(text)) continue;
        seen.add(text);

        textNodes.push({ node, parent, text });
      }

      if (textNodes.length === 0) {
        setIsTranslating(false);
        return;
      }

      console.log(`Found ${textNodes.length} text nodes to translate`);
      let successCount = 0;

      // Translate in batches (smaller batches = safer)
      const batchSize = 5;
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);

        const translations = await Promise.all(
          batch.map(({ text }) => translateText(text, targetLanguage))
        );

        // Apply translations
        batch.forEach(({ node, parent, text }, idx) => {
          const translated = translations[idx];
          if (translated && translated !== text) {
            try {
              // Check if node is still in DOM
              if (node.parentNode && document.contains(node)) {
                node.textContent = translated;
                successCount++;
              }
            } catch (err) {
              // Skip if error
            }
          }
        });

        // Delay between batches
        if (i + batchSize < textNodes.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`Successfully translated ${successCount}/${textNodes.length} nodes`);
    } catch (error) {
      console.error("Translation page error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const saved = localStorage.getItem("currentLanguage");

      if (saved && saved !== "en") {
        setCurrentLanguage(saved);
        setTimeout(() => {
          translatePageContent(saved);
        }, 1500);
      } else {
        setCurrentLanguage("en");
      }

      setIsInitialized(true);
    }
  }, []);

  // Re-translate on page change
  useEffect(() => {
    if (isInitialized && currentLanguage && currentLanguage !== "en") {
      const timer = setTimeout(() => {
        translatePageContent(currentLanguage);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [pathname, isInitialized]);

  return {
    translatePage: translatePageContent,
    currentLanguage: currentLanguage || "en",
    setCurrentLanguage,
    isTranslating,
  };
};
