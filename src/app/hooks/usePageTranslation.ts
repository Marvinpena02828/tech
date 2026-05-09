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
    "zh-Hans": "zh",
    zh: "zh",
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
    const cacheKey = `trans_${targetLang}_${text.substring(0, 50)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] ${text.substring(0, 30)}...`);
      return cached;
    }

    // Retry logic
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `[TRANSLATE] Attempt ${attempt + 1}/${maxRetries}, Length: ${text.length}, Lang: ${targetLang}`
        );

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            targetLanguage: LANG_MAP[targetLang] || targetLang,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `[TRANSLATE ERROR] Status ${response.status}: ${errorBody}`
          );
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // CHECK IF RESPONSE HAS TRANSLATEDTEXT
        if (!data.translatedText) {
          console.error(
            `[TRANSLATE EMPTY RESPONSE] No translatedText in response:`,
            data
          );
          throw new Error("Empty translation response");
        }

        const translated = data.translatedText;

        console.log(
          `[TRANSLATE SUCCESS] ${text.substring(0, 30)}... → ${translated.substring(0, 30)}...`
        );

        // Cache it
        if (translated !== text) {
          localStorage.setItem(cacheKey, translated);
        }

        return translated;
      } catch (error) {
        lastError = error;
        console.error(`[TRANSLATE ATTEMPT ${attempt + 1} FAILED]:`, error);

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error(
      `[TRANSLATE FINAL FAILURE] After ${maxRetries} attempts: ${lastError?.message || lastError}`
    );
    console.error(
      `[RETURNING ORIGINAL] Text length: ${text.length}, returning untranslated`
    );
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
            console.log(`[TEXT NODE] ${text.substring(0, 40)}... (${text.length} chars)`);
            const translated = await translateText(text, targetLanguage);
            if (translated !== text) {
              console.log(`[TEXT UPDATED]`);
              node.textContent = translated;
            } else {
              console.warn(`[TEXT NOT UPDATED] Translation returned same text`);
            }
          }
        }

        // Element node - recurse
        if (node.nodeType === 1) {
          const tag = (node as Element).tagName;
          if (!["SCRIPT", "STYLE", "BUTTON", "INPUT", "TEXTAREA", "NOSCRIPT"].includes(tag)) {
            await translateElement(node as HTMLElement, targetLanguage);
          }
        }
      }
    } catch (err) {
      console.error(`[ELEMENT TRANSLATE ERROR]`, err);
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

      console.log(`[TRANSLATION START] ${contentElements.length} elements, Language: ${targetLanguage}`);

      // Translate each element
      for (let idx = 0; idx < contentElements.length; idx++) {
        const el = contentElements[idx];

        // Skip admin and language buttons
        if (
          pathname.includes("/admin") ||
          el.classList.contains("language-btn") ||
          el.closest(".goog-te-bubble") ||
          el.closest("#google_translate_element")
        ) {
          continue;
        }

        console.log(`[ELEMENT ${idx + 1}/${contentElements.length}]`);
        await translateElement(el, targetLanguage);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`[TRANSLATION COMPLETE]`);
    } catch (error) {
      console.error("[TRANSLATION FATAL ERROR]", error);
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
