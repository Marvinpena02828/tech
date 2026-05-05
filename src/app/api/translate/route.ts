// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    // Language code mapping
    const langMap: { [key: string]: string } = {
      "en": "en-US",
      "zh-CN": "zh-CN",
      "ar": "ar",
      "ru": "ru",
      "de": "de",
      "ro": "ro",
      "es": "es",
      "fr": "fr",
    };

    const targetLang = langMap[targetLanguage] || targetLanguage;

    // Use MyMemory Translation API (free, no key, works in China)
    const encodedText = encodeURIComponent(text);
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    const response = await fetch(myMemoryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();

    if (data?.responseData?.translatedText) {
      return NextResponse.json({ 
        translatedText: data.responseData.translatedText 
      });
    }

    return NextResponse.json({ translatedText: text });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation failed", translatedText: text },
      { status: 500 }
    );
  }
}
