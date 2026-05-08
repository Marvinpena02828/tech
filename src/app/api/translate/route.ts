// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "https://libretranslate-production-d4e6.up.railway.app/";

// Language code mapping for LibreTranslate
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    console.log("[TRANSLATE] Request:", {
      textLength: text?.length,
      targetLanguage,
    });

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage", translatedText: text },
        { status: 400 }
      );
    }

    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    const targetLang = LANG_MAP[targetLanguage] || targetLanguage;

    // Auto-detect source language
    const hasChinese = /[\u4E00-\u9FFF]/.test(text);
    const sourceLang = hasChinese ? "zh" : "en";

    console.log("[TRANSLATE] Calling LibreTranslate:", {
      url: LIBRETRANSLATE_URL,
      sourceLang,
      targetLang,
      textLength: text.length,
    });

    // Call self-hosted LibreTranslate
    const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify({
  q: text,
  source: sourceLang,
  target: targetLang,
}),
    });

    console.log("[TRANSLATE] LibreTranslate response:", response.status);

    if (!response.ok) {
      console.error("[TRANSLATE] Failed:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Translation failed", translatedText: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.translatedText || text;

    console.log("[TRANSLATE] Success:", translatedText.substring(0, 50));

    return NextResponse.json({
      translatedText: translatedText,
    });
  } catch (error) {
    console.error("[TRANSLATE] Error:", error);
    return NextResponse.json(
      {
        error: "Translation failed",
        details: error instanceof Error ? error.message : String(error),
        translatedText: "",
      },
      { status: 500 }
    );
  }
}
