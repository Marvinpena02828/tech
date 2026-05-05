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

  // Get all translatable text from page - INCLUDING NESTED ELEMENTS
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
      // Skip if already visited
      if (visited.has(node)) continue;
      visited.add(node);

      const text = node.textContent?.trim();
      const parent = node.parentElement;

      // Skip if:
      // - text is empty or too short
      // - parent is script/style
      // - already in admin section
      // - is in an input/button with class "language-btn"
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

      // Get the actual text node's parent element
      const textParent = node.parentElement;
      if (!textParent) continue;

      // Store mapping of text to elements
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
      // Reset to English - just reload
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      const pageTexts = getPageText();
      const textsToTranslate = Array.from(pageTexts.keys())
        .filter((text) => text.length > 3)
        .slice(0, 150); // Increase limit to 150 items

      if (textsToTranslate.length === 0) {
        console.log("No text found to translate");
        setIsTranslating(false);
        return;
      }

      console.log(`Found ${textsToTranslate.length} text items to translate`);
      let successCount = 0;

      // Translate with batching to avoid API limits
      const batchSize = 10;
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
              try {
                // Replace text content - handles all node types
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
                
                // Fallback: if no direct text node found, replace element text
                if (!found && el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                  el.textContent = translatedText;
                  successCount++;
                }
              } catch (err) {
                console.error("Error replacing text:", err);
              }
            });
          }
        });

        // Add delay between batches to respect API rate limits
        if (i + batchSize < textsToTranslate.length) {
          await new Promise((resolve) => setTimeout(resolve, 400));
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
        }, 2000); // Increased delay to 2 seconds
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
