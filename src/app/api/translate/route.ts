// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let text = "";
  let targetLanguage = "";

  try {
    const body = await request.json();
    text = body.text;
    targetLanguage = body.targetLanguage;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    // Language code mapping for MyMemory
    const langMap: { [key: string]: string } = {
      en: "en-US",
      zh: "zh-CN",
      ar: "ar",
      ru: "ru",
      de: "de",
      ro: "ro",
      es: "es",
      fr: "fr",
    };

    const targetLang = langMap[targetLanguage] || targetLanguage;

    // Check Supabase cache first
    try {
      const { data: cached, error: cacheError } = await supabase
        .from("translations")
        .select("translated_text")
        .eq("original_text", text)
        .eq("target_language", targetLang)
        .single();

      if (cached && !cacheError) {
        console.log("Cache hit for:", text.substring(0, 30));
        return NextResponse.json({
          translatedText: cached.translated_text,
          fromCache: true,
        });
      }
    } catch (cacheErr) {
      console.log("Cache check skipped");
    }

    // Call MyMemory API (free, no key required, works in China)
    const encodedText = encodeURIComponent(text);
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    const response = await fetch(myMemoryUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error("MyMemory API error:", response.status);
      return NextResponse.json(
        { error: "Translation failed", translatedText: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data?.responseData?.translatedText || text;

    // Save to cache (non-blocking) - fire and forget
    (async () => {
      try {
        await supabase
          .from("translations")
          .insert({
            original_text: text,
            translated_text: translatedText,
            target_language: targetLang,
          });
        console.log("Translation cached");
      } catch (err) {
        console.log(
          "Cache save skipped:",
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    })();

    return NextResponse.json({
      translatedText: translatedText,
      fromCache: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Translation API error:", errorMessage);
    return NextResponse.json(
      {
        error: "Translation failed",
        details: errorMessage,
        translatedText: text || "Translation failed",
      },
      { status: 500 }
    );
  }
}
