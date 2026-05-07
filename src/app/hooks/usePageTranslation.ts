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

    // Check localStorage first
    const cacheKey = `trans_${targetLang}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: LANG_MAP[targetLang] || targetLang }),
      });

      const data = await response.json();
      const translated = data.translatedText || text;

      // Cache it
      if (translated !== text) {
        localStorage.setItem(cacheKey, translated);
      }

      return translated;
    } catch (error) {
      return text;
    }
  };

  const getTextNodes = () => {
    const results: { node: Node; text: string }[] = [];
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

      if (
        !text ||
        text.length < 3 ||
        text.length > 500 ||
        !parent ||
        seen.has(text) ||
        parent.tagName === "SCRIPT" ||
        parent.tagName === "STYLE" ||
        pathname.includes("/admin") ||
        parent.classList.contains("language-btn")
      ) {
        continue;
      }

      seen.add(text);
      results.push({ node, text });
    }

    return results;
  };

  const translatePage = async (targetLanguage: string) => {
    if (targetLanguage === "en") {
      localStorage.setItem("currentLanguage", "en");
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      localStorage.setItem("currentLanguage", targetLanguage);
      setCurrentLanguage(targetLanguage);

      const textNodes = getTextNodes();
      if (textNodes.length === 0) {
        setIsTranslating(false);
        return;
      }

      console.log(`Translating ${textNodes.length} text nodes`);
      let count = 0;

      // Translate in small batches
      for (let i = 0; i < textNodes.length; i += 3) {
        const batch = textNodes.slice(i, i + 3);

        const translations = await Promise.all(
          batch.map(({ text }) => translateText(text, targetLanguage))
        );

        batch.forEach(({ node, text }, idx) => {
          const translated = translations[idx];
          if (translated && translated !== text) {
            try {
              if (node.parentNode) {
                node.textContent = translated;
                count++;
              }
            } catch (err) {
              // Silently skip
            }
          }
        });

        if (i + 3 < textNodes.length) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      console.log(`Translated ${count} nodes`);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Init
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const saved = localStorage.getItem("currentLanguage");
      if (saved && saved !== "en") {
        setCurrentLanguage(saved);
        setTimeout(() => translatePage(saved), 1500);
      } else {
        setCurrentLanguage("en");
      }
      setIsInitialized(true);
    }
  }, []);

  // Page change
  useEffect(() => {
    if (isInitialized && currentLanguage && currentLanguage !== "en") {
      const timer = setTimeout(() => {
        translatePage(currentLanguage);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname, isInitialized]);

  return {
    translatePage,
    currentLanguage: currentLanguage || "en",
    setCurrentLanguage,
    isTranslating,
  };
};
