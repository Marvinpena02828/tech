"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export const usePageTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // For i18n routing, translation is handled by the locale in URL
  // This hook is now a minimal compatibility layer
  
  const translatePageContent = async (targetLanguage: string) => {
    // No-op: routing-based i18n doesn't need client-side translation
    console.log(`[i18n] Using locale: ${targetLanguage}`);
    setCurrentLanguage(targetLanguage);
  };

  // Initialize with current locale from URL
  useEffect(() => {
    if (!isInitialized) {
      setCurrentLanguage(locale);
      setIsInitialized(true);
    }
  }, [locale, isInitialized]);

  return {
    translatePage: translatePageContent,
    currentLanguage: locale || "en",
    setCurrentLanguage,
    isTranslating: false, // No longer needed with i18n routing
  };
};
