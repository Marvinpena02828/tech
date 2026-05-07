// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LIBRETRANSLATE_API = "https://api.libretranslate.de/translate";

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

    // Language code mapping for LibreTranslate
    const langMap: { [key: string]: string } = {
      "en-US": "en",
      "zh-CN": "zh",
      "ar": "ar",
      "ru": "ru",
      "de": "de",
      "ro": "ro",
      "es": "es",
      "fr": "fr",
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
      // Table might not exist yet, continue to translation
      console.log("Cache check skipped");
    }

    // Call LibreTranslate API
    const response = await fetch(LIBRETRANSLATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source_language: "en",
        target_language: targetLang,
      }),
    });

    if (!response.ok) {
      console.error("LibreTranslate API error:", response.status);
      return NextResponse.json(
        { error: "Translation failed", translatedText: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.translatedText || text;

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
        console.log("Cache save skipped:", err instanceof Error ? err.message : "Unknown error");
      }
    })();

    return NextResponse.json({
      translatedText: translatedText,
      fromCache: false,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      {
        error: "Translation failed",
        translatedText: text || "Translation failed",
      },
      { status: 500 }
    );
  }
}
