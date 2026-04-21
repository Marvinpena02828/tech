import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[Upload Banner API] Request received");
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be less than 10MB" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `achievements/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    console.log("[Upload Banner API] Uploading:", fileName);
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[Upload Banner API] Upload error:", error);
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(data.path);

    console.log("[Upload Banner API] Success, URL:", publicUrl);

    return NextResponse.json({ 
      url: publicUrl,
      path: data.path,
      success: true
    });

  } catch (error: any) {
    console.error("[Upload Banner API] Exception:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
