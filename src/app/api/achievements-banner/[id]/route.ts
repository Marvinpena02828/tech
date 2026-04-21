import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[Achievements Banner PUT] Request received");
    
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    console.log("[Achievements Banner PUT] ID:", id);
    console.log("[Achievements Banner PUT] New image URL:", body.image);

    const { data, error } = await supabase
      .from("achievements_banner")
      .update({
        image: body.image,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Achievements Banner PUT] Supabase error:", error);
      throw error;
    }

    console.log("[Achievements Banner PUT] Update successful:", data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[Achievements Banner PUT] Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[Achievements Banner DELETE] Request received");
    
    const supabase = await createClient();
    const { id } = await params;

    console.log("[Achievements Banner DELETE] ID:", id);

    const { error } = await supabase
      .from("achievements_banner")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Achievements Banner DELETE] Supabase error:", error);
      throw error;
    }

    console.log("[Achievements Banner DELETE] Delete successful");
    return NextResponse.json(
      { message: "Banner deleted successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("[Achievements Banner DELETE] Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner", details: String(error) },
      { status: 500 }
    );
  }
}
