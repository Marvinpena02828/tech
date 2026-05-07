// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

// We'll use a public Google Sheets that has GOOGLETRANSLATE formula
// Or we can use a workaround via google-translate-api unofficial

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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

    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    // Use unofficial google-translate-api endpoint (works without key)
    const langMap: { [key: string]: string } = {
      "en": "en",
      "zh-Hans": "zh-CN",
      "zh": "zh-CN",
      "ar": "ar",
      "ru": "ru",
      "de": "de",
      "ro": "ro",
      "es": "es",
      "fr": "fr",
    };

    const targetLang = langMap[targetLanguage] || targetLanguage;

    try {
      // Use translate.googleapis.com (free, no key needed)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Response format: [[[translated_text, original_text, ...]]]
        const translated = data[0][0][0] || text;
        return NextResponse.json({ translatedText: translated });
      }
    } catch (err) {
      console.error("Google Translate error:", err);
    }

    // Fallback
    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Translation failed", translatedText: "" },
      { status: 500 }
    );
  }
}
