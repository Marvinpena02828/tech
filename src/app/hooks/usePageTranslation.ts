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

  // Detect if text contains Chinese/CJK characters
  const hasCJK = (text: string) => {
    return /[\u4E00-\u9FFF\u3040-\u309F\uAC00-\uD7AF]/.test(text);
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === "en") return text;

    // Check localStorage cache
    const cacheKey = `trans_${targetLang}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    // Retry logic
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Send FULL text to backend - let backend handle chunking
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            targetLanguage: LANG_MAP[targetLang] || targetLang,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const translated = data.translatedText || text;

        // Cache it
        if (translated !== text) {
          localStorage.setItem(cacheKey, translated);
        }

        return translated;
      } catch (error) {
        lastError = error;
        console.error(`Translation attempt ${attempt + 1} failed:`, error);

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error(`Translation failed after ${maxRetries} attempts:`, lastError);
    return text;
  };

  // Recursively translate all text in element and children
  const translateElement = async (el: HTMLElement, targetLanguage: string) => {
    try {
      // Translate direct text content first
      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];

        // Text node
        if (node.nodeType === 3) {
          const text = node.textContent?.trim();
          if (text && text.length > 2) {
            const translated = await translateText(text, targetLanguage);
            if (translated !== text) {
              node.textContent = translated;
            }
          }
        }

        // Element node - recurse
        if (node.nodeType === 1) {
          const tag = (node as Element).tagName;
          // Skip script, style, and interactive elements
          if (!["SCRIPT", "STYLE", "BUTTON", "INPUT", "TEXTAREA"].includes(tag)) {
            await translateElement(node as HTMLElement, targetLanguage);
          }
        }
      }
    } catch (err) {
      // Silent fail
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

      // Find main content areas
      const contentSelectors = [
        "main",
        "article",
        "[role='main']",
        ".content",
        ".main-content",
        "body > *:not(script):not(style):not(noscript)",
      ];

      let contentElements: HTMLElement[] = [];

      for (const selector of contentSelectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        contentElements.push(...(elements as HTMLElement[]));
      }

      // If nothing found, use body
      if (contentElements.length === 0) {
        contentElements = [document.body];
      }

      // Remove duplicates
      contentElements = Array.from(new Set(contentElements));

      console.log(`Translating ${contentElements.length} elements`);

      // Translate each element
      for (const el of contentElements) {
        // Skip admin and language buttons
        if (
          pathname.includes("/admin") ||
          el.classList.contains("language-btn") ||
          el.closest(".goog-te-bubble") ||
          el.closest("#google_translate_element")
        ) {
          continue;
        }

        await translateElement(el, targetLanguage);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log(`Translation complete`);
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
