"use client";
import { usePageTranslation } from "@/app/hooks/usePageTranslation";
import { useEffect } from "react";

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { isTranslating } = usePageTranslation();

  useEffect(() => {
    // This ensures translation hook runs on all pages
  }, [isTranslating]);

  return <>{children}</>;
}
