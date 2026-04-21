import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[Banner PUT] Request received");
    
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    console.log("[Banner PUT] ID:", id);
    console.log("[Banner PUT] New image URL:", body.image);

    const { data, error } = await supabase
      .from("service_banner")
      .update({
        image: body.image,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Banner PUT] Supabase error:", error);
      throw error;
    }

    console.log("[Banner PUT] Update successful:", data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[Banner PUT] Error updating banner:", error);
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
    console.log("[Banner DELETE] Request received");
    
    const supabase = await createClient();
    const { id } = await params;

    console.log("[Banner DELETE] ID:", id);

    const { error } = await supabase
      .from("service_banner")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Banner DELETE] Supabase error:", error);
      throw error;
    }

    console.log("[Banner DELETE] Delete successful");
    return NextResponse.json(
      { message: "Banner deleted successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("[Banner DELETE] Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner", details: String(error) },
      { status: 500 }
    );
  }
}
