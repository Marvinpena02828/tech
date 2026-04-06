import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> },
) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(request.url);
    const encodedUrl = searchParams.get("url");
    const size = searchParams.get("sz") || "w1000";

    // When a full URL is provided, proxy it directly (used for Supabase assets)
    let targetUrl = encodedUrl ? decodeURIComponent(encodedUrl) : undefined;

    // Backward-compatible Google Drive thumbnail proxy using fileId path param
    if (!targetUrl) {
      const fileId = params?.fileId;
      if (!fileId) {
        return new NextResponse("fileId is required", { status: 400 });
      }

      targetUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    }

    const targetHost = new URL(targetUrl).hostname;
    const isGoogleDrive = targetHost === "drive.google.com";
    const isSupabase = targetHost.includes("supabase.co");

    if (!isGoogleDrive && !isSupabase) {
      return new NextResponse("Blocked host", { status: 400 });
    }

    const response = await fetch(targetUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
