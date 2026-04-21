import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("service_banner")
      .update({
        image: body.image,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Clear the banner cache immediately
    revalidateTag("banner");
    
    // Also revalidate the services page path
    revalidatePath("/services", "page");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("service_banner")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Clear the banner cache immediately
    revalidateTag("banner");
    
    // Also revalidate the services page path
    revalidatePath("/services", "page");

    return NextResponse.json(
      { message: "Banner deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
