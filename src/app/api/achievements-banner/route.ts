import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("[Achievements Banner API] GET request");
    
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("achievements_banner")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("[Achievements Banner API] Query error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("[Achievements Banner API] No banner data found, using fallback");
      return NextResponse.json(
        { 
          image: "/achievements/page/Our Achievements.png",
          message: "No banner configured, using default"
        },
        { status: 200 }
      );
    }

    const banner = data[0];
    console.log("[Achievements Banner API] Returning banner:", banner);
    return NextResponse.json(banner, { status: 200 });
    
  } catch (error) {
    console.error("[Achievements Banner API] Error:", error);
    
    // Return fallback instead of error
    return NextResponse.json(
      { 
        image: "/achievements/page/Our Achievements.png",
        error: "Failed to fetch banner, using default"
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("achievements_banner")
      .insert([
        {
          image: body.image,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("[Achievements Banner API] Banner created:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Achievements Banner API] Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
