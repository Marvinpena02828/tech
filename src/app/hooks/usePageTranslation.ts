"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
  const translateText = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!text || targetLang === "en") return text;

    // MyMemory has 500 char limit, so chunk if needed
    const MAX_CHARS = 500;
    
    if (text.length <= MAX_CHARS) {
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
          console.error("Translation API error:", response.statusText);
          return text;
        }

        const data = await response.json();
        return data.translatedText || text;
      } catch (error) {
        console.error("Translation error:", error);
        return text;
      }
    }

    // For longer text, chunk it up
    try {
      const chunks = [];
      for (let i = 0; i < text.length; i += MAX_CHARS) {
        chunks.push(text.slice(i, i + MAX_CHARS));
      }

      const translatedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: chunk,
              targetLanguage: LANG_MAP[targetLang] || targetLang,
            }),
          });

          if (!response.ok) return chunk;
          const data = await response.json();
          return data.translatedText || chunk;
        })
      );

      return translatedChunks.join("");
    } catch (error) {
      console.error("Translation chunking error:", error);
      return text;
    }
  };

  // Get all translatable text from page
  const getPageText = () => {
    const texts: Map<string, HTMLElement[]> = new Map();
    const visited = new Set<Node>();

    // Walk through ALL nodes in the DOM
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (visited.has(node)) continue;
      visited.add(node);

      const text = node.textContent?.trim();
      const parent = node.parentElement;

      if (
        !text ||
        text.length < 3 ||
        !parent ||
        parent.tagName === "SCRIPT" ||
        parent.tagName === "STYLE" ||
        pathname.includes("/admin") ||
        parent.classList.contains("language-btn") ||
        parent.closest(".goog-te-bubble") ||
        parent.closest("#google_translate_element")
      ) {
        continue;
      }

      const textParent = node.parentElement;
      if (!textParent) continue;

      if (!texts.has(text)) {
        texts.set(text, []);
      }
      texts.get(text)!.push(textParent);
    }

    return texts;
  };

  // Translate page content
  const translatePage = async (targetLanguage: string) => {
    if (targetLanguage === "en") {
      // Reset to English - save to localStorage and reload
      localStorage.setItem("currentLanguage", "en");
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      // Save language preference BEFORE translating
      localStorage.setItem("currentLanguage", targetLanguage);
      setCurrentLanguage(targetLanguage);

      const pageTexts = getPageText();
      const textsToTranslate = Array.from(pageTexts.keys())
        .filter((text) => text.length > 3);

      if (textsToTranslate.length === 0) {
        console.log("No text found to translate");
        setIsTranslating(false);
        return;
      }

      console.log(`Found ${textsToTranslate.length} text items to translate`);
      let successCount = 0;

      // Translate with batching (optimized batch size)
      const batchSize = 20;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        const translations = await Promise.all(
          batch.map((text) => translateText(text, targetLanguage))
        );

        batch.forEach((originalText, idx) => {
          const translatedText = translations[idx];
          if (translatedText && translatedText !== originalText) {
            const elements = pageTexts.get(originalText) || [];
            elements.forEach((el) => {
              try {
                let found = false;
                for (let i = 0; i < el.childNodes.length; i++) {
                  const child = el.childNodes[i];
                  if (
                    child.nodeType === 3 &&
                    child.textContent?.trim() === originalText
                  ) {
                    child.textContent = translatedText;
                    found = true;
                    successCount++;
                    break;
                  }
                }

                if (
                  !found &&
                  el.childNodes.length === 1 &&
                  el.childNodes[0].nodeType === 3
                ) {
                  el.textContent = translatedText;
                  successCount++;
                }
              } catch (err) {
                console.error("Error replacing text:", err);
              }
            });
          }
        });

        if (i + batchSize < textsToTranslate.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      console.log(`Successfully translated ${successCount} text elements`);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Initialize language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedLanguage = localStorage.getItem("currentLanguage");
      console.log("Saved language from localStorage:", savedLanguage);

      if (savedLanguage && savedLanguage !== "en") {
        setCurrentLanguage(savedLanguage);
        // Translate page after a delay to ensure it's loaded
        setTimeout(() => {
          translatePage(savedLanguage);
        }, 1500);
      } else {
        setCurrentLanguage("en");
      }

      setIsInitialized(true);
    }
  }, []); // Only run once on mount

  // Re-translate when navigating to a new page
  useEffect(() => {
    if (isInitialized && currentLanguage && currentLanguage !== "en") {
      console.log("Page changed, re-translating to:", currentLanguage);
      // Delay to allow page content to load
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
