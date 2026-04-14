// app/api/list-icons/route.ts
import { readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const iconsDir = join(process.cwd(), "public", "Icons");
    
    // Get all files from Icons directory
    const files = readdirSync(iconsDir);
    
    // Filter for image files
    const icons = files
      .filter((file) => {
        const ext = file.toLowerCase();
        return (
          ext.endsWith(".png") ||
          ext.endsWith(".jpg") ||
          ext.endsWith(".jpeg") ||
          ext.endsWith(".gif") ||
          ext.endsWith(".webp") ||
          ext.endsWith(".svg")
        );
      })
      .map((file) => `/Icons/${file}`)
      .sort();

    return NextResponse.json({ icons });
  } catch (error) {
    console.error("Error listing icons:", error);
    // Return empty array if folder doesn't exist or error occurs
    return NextResponse.json({ icons: [] }, { status: 200 });
  }
}
