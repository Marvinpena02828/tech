import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewsletterContent from "./NewsletterContent";

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Fetch ONLY newsletter subscribers
  const { data: subscribers } = await supabase
    .from('newsletter_subscriptions')
    .select('*')
    .order('subscribed_at', { ascending: false });

  return <NewsletterContent subscribers={subscribers || []} />;
}
