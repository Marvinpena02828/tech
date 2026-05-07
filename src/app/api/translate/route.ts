// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage", translatedText: text },
        { status: 400 }
      );
    }

    // If English, return as is
    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    // Map to Bing language codes
    const langMap: { [key: string]: string } = {
      "en": "en",
      "zh-Hans": "zh-Hans",
      "zh": "zh-Hans",
      "ar": "ar",
      "ru": "ru",
      "de": "de",
      "ro": "ro",
      "es": "es",
      "fr": "fr",
    };

    const bingLang = langMap[targetLanguage] || targetLanguage;

    // Try Bing Translator
    try {
      const bingUrl = `https://api.microsofttranslator.com/v2/Ajax.svc/Translate?text=${encodeURIComponent(text)}&from=en&to=${bingLang}`;

      const response = await fetch(bingUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (response.ok) {
        const result = await response.text();
        const translated = result.replace(/^"(.*)"$/, "$1") || text;
        return NextResponse.json({ translatedText: translated });
      }
    } catch (err) {
      console.error("Bing error:", err);
    }

    // Fallback: return original text
    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Translation service error", translatedText: "" },
      { status: 500 }
    );
  }
}
