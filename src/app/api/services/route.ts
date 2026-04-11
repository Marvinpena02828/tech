// app/api/services/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch services", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch services",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, image, order } = body;

    if (!title || !description || !image) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, image" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          title,
          description,
          image,
          order: order || 0,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create service", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      {
        error: "Failed to create service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
