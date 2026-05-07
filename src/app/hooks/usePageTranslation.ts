"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Map language codes
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

  // Translate text with localStorage cache
  const translateText = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!text || targetLang === "en") return text;

    const cacheKey = `trans_${targetLang}_${text}`;
    const localCached = localStorage.getItem(cacheKey);
    if (localCached) {
      return localCached;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          targetLanguage: LANG_MAP[targetLang] || targetLang,
        }),
      });

      if (!response.ok) {
        return text;
      }

      const data = await response.json();
      const translatedText = data.translatedText || text;

      if (translatedText !== text) {
        localStorage.setItem(cacheKey, translatedText);
      }

      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Get all text elements to translate
  const getTextElements = () => {
    const elements: { el: HTMLElement; text: string }[] = [];
    
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        null
      );

      let node: any;
      const seenTexts = new Set<string>();

      while ((node = walker.nextNode())) {
        if (
          node.tagName === "SCRIPT" ||
          node.tagName === "STYLE" ||
          node.tagName === "NOSCRIPT" ||
          pathname.includes("/admin") ||
          node.classList.contains("language-btn") ||
          node.closest(".goog-te-bubble") ||
          node.closest("#google_translate_element")
        ) {
          continue;
        }

        const text = node.innerText?.trim();
        if (
          text &&
          text.length > 3 &&
          text.length < 1000 &&
          !seenTexts.has(text)
        ) {
          seenTexts.add(text);
          elements.push({ el: node, text });
        }
      }
    } catch (error) {
      console.error("Error getting text elements:", error);
    }

    return elements;
  };

  // Translate page
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

      const elements = getTextElements();
      if (elements.length === 0) {
        setIsTranslating(false);
        return;
      }

      console.log(`Translating ${elements.length} elements`);
      let successCount = 0;

      // Translate in batches
      const batchSize = 5;
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = elements.slice(i, i + batchSize);

        const results = await Promise.all(
          batch.map(async ({ text }) => {
            const translated = await translateText(text, targetLanguage);
            return { original: text, translated };
          })
        );

        // Apply translations
        results.forEach(({ original, translated }) => {
          if (translated !== original) {
            const elementsToUpdate = elements.filter(
              (e) => e.text === original
            );
            elementsToUpdate.forEach(({ el }) => {
              try {
                if (el.innerText?.trim() === original) {
                  el.innerText = translated;
                  successCount++;
                }
              } catch (err) {
                // Silently fail
              }
            });
          }
        });

        if (i + batchSize < elements.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      console.log(`Translated ${successCount} elements`);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedLanguage = localStorage.getItem("currentLanguage");

      if (savedLanguage && savedLanguage !== "en") {
        setCurrentLanguage(savedLanguage);
        setTimeout(() => {
          translatePage(savedLanguage);
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
