import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountSecurityContent from "./AccountSecurityContent";

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  return <AccountSecurityContent currentEmail={user.email || ""} />;
}
