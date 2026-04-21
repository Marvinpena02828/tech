import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add secret header for security
    const secret = request.headers.get("x-revalidate-secret");
    if (secret !== process.env.REVALIDATE_SECRET && process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tag, path } = body;

    if (tag) {
      revalidateTag(tag);
    }

    if (path) {
      revalidatePath(path, "page");
    }

    return NextResponse.json(
      { revalidated: true, now: Date.now() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
