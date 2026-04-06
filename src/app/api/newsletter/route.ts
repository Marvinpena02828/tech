import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    const supabase = await createClient();

    console.log(email);
    if (!email) {
      return NextResponse.json(
        { message: "Email is required", success: false },
        { status: 400 },
      );
    }
    const { data, error } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email })
      .select()
      .single();

    console.log(error);

    if (error) {
      return NextResponse.json(
        { message: "Email is required", success: false },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Email is required", success: true },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
