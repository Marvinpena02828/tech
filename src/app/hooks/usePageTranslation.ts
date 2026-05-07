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

  // Split mixed language text into parts
  const splitMixedText = (text: string) => {
    const parts: { text: string; isCJK: boolean }[] = [];
    let current = "";
    let currentIsCJK = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isCJKChar = /[\u4E00-\u9FFF\u3040-\u309F\uAC00-\uD7AF]/.test(char);

      if (i === 0) {
        currentIsCJK = isCJKChar;
      }

      if (isCJKChar === currentIsCJK) {
        current += char;
      } else {
        if (current.trim()) {
          parts.push({ text: current, isCJK: currentIsCJK });
        }
        current = char;
        currentIsCJK = isCJKChar;
      }
    }

    if (current.trim()) {
      parts.push({ text: current, isCJK: currentIsCJK });
    }

    return parts;
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === "en") return text;

    // Check localStorage cache
    const cacheKey = `trans_${targetLang}_${text}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      // If text is very long, split into sentences
      let textToTranslate = text;
      if (text.length > 500) {
        // Split by sentences (., !, ?)
        const sentences = text.split(/([.!?])\s+/);
        const chunks: string[] = [];
        let current = "";

        for (let i = 0; i < sentences.length; i += 2) {
          const sentence = sentences[i] + (sentences[i + 1] || "");
          if ((current + sentence).length < 450) {
            current += sentence + " ";
          } else {
            if (current) chunks.push(current.trim());
            current = sentence + " ";
          }
        }
        if (current) chunks.push(current.trim());

        // Translate each chunk and rejoin
        const translatedChunks = await Promise.all(
          chunks.map(async (chunk) => {
            try {
              const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: chunk,
                  targetLanguage: LANG_MAP[targetLang] || targetLang,
                }),
              });

              const data = await response.json();
              return data.translatedText || chunk;
            } catch (error) {
              return chunk;
            }
          })
        );

        const translated = translatedChunks.join(" ");
        if (translated !== text) {
          localStorage.setItem(cacheKey, translated);
        }
        return translated;
      }

      // Short text - translate directly
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
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

  // Translate mixed language text intelligently
  const translateMixedText = async (text: string, targetLanguage: string) => {
    // Don't translate if target is English
    if (targetLanguage === "en") return text;

    const parts = splitMixedText(text);
    
    const translated = await Promise.all(
      parts.map(async (part) => {
        // Translate all parts (both English and CJK)
        return await translateText(part.text, targetLanguage);
      })
    );

    return translated.join("");
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
            const translated = await translateMixedText(text, targetLanguage);
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
