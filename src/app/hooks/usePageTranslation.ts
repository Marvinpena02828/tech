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
    const cacheKey = `trans_${targetLang}_${text.substring(0, 50)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] ${text.substring(0, 30)}... → ${cached.substring(0, 30)}...`);
      return cached;
    }

    // Retry logic
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `[TRANSLATE START] Attempt ${attempt + 1}/${maxRetries}, Text length: ${text.length}, Target: ${targetLang}`
        );

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            targetLanguage: LANG_MAP[targetLang] || targetLang,
          }),
        });

        console.log(`[API RESPONSE] Status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[API ERROR] ${response.status}: ${errorText}`);
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const translated = data.translatedText || text;

        console.log(
          `[TRANSLATE SUCCESS] Original: ${text.substring(0, 30)}... → Translated: ${translated.substring(0, 30)}...`
        );

        // Cache it
        if (translated !== text) {
          localStorage.setItem(cacheKey, translated);
        }

        return translated;
      } catch (error) {
        lastError = error;
        console.error(`[TRANSLATE ERROR] Attempt ${attempt + 1}:`, error);

        // Wait before retrying
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error(`[TRANSLATE FAILED] After ${maxRetries} attempts:`, lastError);
    return text;
  };

  // Recursively translate all text in element and children
  const translateElement = async (el: HTMLElement, targetLanguage: string, depth = 0) => {
    try {
      const indent = "  ".repeat(depth);
      console.log(`${indent}[ELEMENT] ${el.tagName}, Children: ${el.childNodes.length}`);

      // Translate direct text content first
      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];

        // Text node
        if (node.nodeType === 3) {
          const text = node.textContent?.trim();
          if (text && text.length > 2) {
            console.log(`${indent}  [TEXT NODE] "${text.substring(0, 40)}..."`);
            const translated = await translateText(text, targetLanguage);
            if (translated !== text) {
              console.log(`${indent}  [TEXT UPDATED]`);
              node.textContent = translated;
            } else {
              console.log(`${indent}  [TEXT UNCHANGED - NO TRANSLATION]`);
            }
          } else {
            console.log(`${indent}  [TEXT SKIPPED] Too short (${text?.length || 0} chars)`);
          }
        }

        // Element node - recurse
        if (node.nodeType === 1) {
          const tag = (node as Element).tagName;
          // Skip script, style, and interactive elements
          if (!["SCRIPT", "STYLE", "BUTTON", "INPUT", "TEXTAREA", "NOSCRIPT"].includes(tag)) {
            console.log(`${indent}  [RECURSE] ${tag}`);
            await translateElement(node as HTMLElement, targetLanguage, depth + 1);
          } else {
            console.log(`${indent}  [SKIP] ${tag}`);
          }
        }
      }
    } catch (err) {
      console.error(`[ELEMENT ERROR]`, err);
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
        console.log(`[SELECTOR] "${selector}" found ${elements.length} elements`);
        contentElements.push(...(elements as HTMLElement[]));
      }

      // If nothing found, use body
      if (contentElements.length === 0) {
        console.log(`[NO SELECTORS FOUND] Using body`);
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
          console.log(`[SKIP] Element ${idx} - admin/language button`);
          continue;
        }

        console.log(`[ELEMENT ${idx}/${contentElements.length}]`);
        await translateElement(el, targetLanguage);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`[TRANSLATION COMPLETE]`);
    } catch (error) {
      console.error("[TRANSLATION ERROR]", error);
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
          console.log(`[INIT] Auto-translating to ${saved}`);
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
        console.log(`[PAGE CHANGE] Re-translating to ${currentLanguage}`);
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
