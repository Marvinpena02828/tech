// src/app/api/translate/stream/route.ts
import { NextRequest } from "next/server";

const LIBRETRANSLATE_URL = (
  process.env.LIBRETRANSLATE_URL || "https://libretranslate-production-d4e6.up.railway.app"
).replace(/\/$/, "");

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

const CHUNK_SIZE = 4500;

function detectSourceLanguage(text: string): string {
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  return "en";
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = "";
  const paragraphs = text.split(/\n\n+/);

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
    } else {
      if ((currentChunk + "\n\n" + paragraph).length > maxChunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function translateChunk(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText || text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing text or targetLanguage" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (targetLanguage === "en") {
      return new Response(
        JSON.stringify({ type: "complete", translatedText: text }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const sourceLang = detectSourceLanguage(text);
    const targetLang = LANG_MAP[targetLanguage] || targetLanguage;
    const chunks = splitTextIntoChunks(text, CHUNK_SIZE);

    // Streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < chunks.length; i++) {
            const translatedChunk = await translateChunk(
              chunks[i],
              sourceLang,
              targetLang
            );

            // Send progress update
            const data = {
              type: "chunk",
              index: i,
              total: chunks.length,
              text: translatedChunk,
            };

            controller.enqueue(
              encoder.encode(JSON.stringify(data) + "\n")
            );

            // Small delay between chunks to avoid overload
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "complete", message: "Done" }) + "\n"
            )
          );

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[TRANSLATE STREAM] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Stream failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
