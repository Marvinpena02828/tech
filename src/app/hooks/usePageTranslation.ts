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

  // Check cache first: localStorage → Supabase → API
  const translateText = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!text || targetLang === "en") return text;

    // 1. Check localStorage cache first (instant, offline)
    const cacheKey = `trans_${targetLang}_${text}`;
    const localCached = localStorage.getItem(cacheKey);
    if (localCached) {
      console.log("Local cache hit");
      return localCached;
    }

    // 2. Call backend (checks Supabase, then MyMemory if needed)
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
      const translatedText = data.translatedText || text;

      // 3. Save to localStorage for next time (avoid repeat API calls)
      if (translatedText !== text) {
        localStorage.setItem(cacheKey, translatedText);
      }

      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Get all translatable text from page
  const getPageText = () => {
    const texts: Map<string, { nodes: Node[]; parent: HTMLElement }[]> = new Map();
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

      // Get all consecutive text nodes in parent (combine fragmented text)
      const textNodes: Node[] = [];
      let combinedText = "";
      
      for (let i = 0; i < parent.childNodes.length; i++) {
        const child = parent.childNodes[i];
        
        // Skip script/style tags
        if (child.nodeType === 1) {
          const tag = (child as Element).tagName;
          if (tag === "SCRIPT" || tag === "STYLE") continue;
        }
        
        // Collect text nodes
        if (child.nodeType === 3) {
          const nodeText = child.textContent?.trim();
          if (nodeText && nodeText.length > 0) {
            textNodes.push(child);
            combinedText += (combinedText ? " " : "") + nodeText;
          }
        }
      }

      if (combinedText.length < 3) continue;

      if (!texts.has(combinedText)) {
        texts.set(combinedText, []);
      }
      texts.get(combinedText)!.push({ nodes: textNodes, parent });
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
        .filter((text) => text.length > 3)
        // Deduplicate to avoid translating same text twice
        .filter((value, index, self) => self.indexOf(value) === index);

      if (textsToTranslate.length === 0) {
        console.log("No text found to translate");
        setIsTranslating(false);
        return;
      }

      console.log(`Found ${textsToTranslate.length} unique text items to translate`);
      let successCount = 0;

      // Translate with batching (reduce API calls)
      const batchSize = 10;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        const translations = await Promise.all(
          batch.map((text) => translateText(text, targetLanguage))
        );

        batch.forEach((originalText, idx) => {
          const translatedText = translations[idx];
          if (translatedText && translatedText !== originalText) {
            const elements = pageTexts.get(originalText) || [];
            elements.forEach(({ nodes, parent }) => {
              try {
                // Replace combined text nodes
                if (nodes.length > 0) {
                  // Replace first node with translated text
                  nodes[0].textContent = translatedText;
                  
                  // Remove other nodes
                  for (let i = 1; i < nodes.length; i++) {
                    nodes[i].parentNode?.removeChild(nodes[i]);
                  }
                  
                  successCount++;
                } else if (
                  parent.childNodes.length === 1 &&
                  parent.childNodes[0].nodeType === 3
                ) {
                  parent.textContent = translatedText;
                  successCount++;
                }
              } catch (err) {
                console.error("Error replacing text:", err);
              }
            });
          }
        });

        // Delay between batches (be nice to MyMemory API)
        if (i + batchSize < textsToTranslate.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
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
