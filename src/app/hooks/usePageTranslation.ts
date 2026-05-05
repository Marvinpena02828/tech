"use client";
import { useEffect, useState } from "react";

const LANGUAGE_CODES: { [key: string]: string } = {
  English: "en",
  "中文": "zh",
  العربية: "ar",
  Русский: "ru",
  Deutsch: "de",
  Română: "ro",
  Español: "es",
  Français: "fr",
};

const REVERSE_LANGUAGE_CODES: { [key: string]: string } = {
  en: "English",
  zh: "中文",
  ar: "العربية",
  ru: "Русский",
  de: "Deutsch",
  ro: "Română",
  es: "Español",
  fr: "Français",
};

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  // Get all translatable text from page
  const getPageText = () => {
    const texts: { [key: string]: HTMLElement[] } = {};
    
    // Get all text nodes from paragraphs, headings, spans, divs, etc.
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, a, li, label, button:not(.language-btn)"
    );

    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text && text.length > 0 && !texts[text]) {
        texts[text] = [el as HTMLElement];
      } else if (text && texts[text]) {
        texts[text].push(el as HTMLElement);
      }
    });

    return texts;
  };

  // Translate page content
  const translatePage = async (targetLanguage: string) => {
    if (targetLanguage === "en") {
      // Reset to English
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    try {
      const pageTexts = getPageText();
      const textsToTranslate = Object.keys(pageTexts);

      if (textsToTranslate.length === 0) {
        console.log("No text found to translate");
        setIsTranslating(false);
        return;
      }

      // Batch translate
      const batchSize = 10;
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        try {
          const response = await fetch("https://api.libretranslate.de/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: batch.join("\n[SEP]\n"),
              source: "en",
              target: targetLanguage,
            }),
          });

          if (!response.ok) {
            console.error("Translation API error:", response.statusText);
            continue;
          }

          const data = await response.json();
          const translatedTexts = data.translatedText.split("\n[SEP]\n");

          // Apply translations
          batch.forEach((originalText, index) => {
            const translatedText = translatedTexts[index]?.trim();
            if (translatedText && pageTexts[originalText]) {
              pageTexts[originalText].forEach((el) => {
                if (el.textContent === originalText) {
                  el.textContent = translatedText;
                }
              });
            }
          });
        } catch (error) {
          console.error("Error translating batch:", error);
        }

        // Add small delay between batches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setCurrentLanguage(targetLanguage);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Load saved language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage && savedLanguage !== "en") {
        setCurrentLanguage(savedLanguage);
        // Delay translation to ensure page is fully loaded
        setTimeout(() => {
          translatePage(savedLanguage);
        }, 500);
      }
    }
  }, []);

  return {
    translatePage,
    currentLanguage,
    setCurrentLanguage,
    isTranslating,
  };
};
