import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ContactInfoContent from "./ContactInfoContent";
import { getAllContactInfo } from "@/actions/contactInfo";

export default async function ContactInfoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const contactInfos = await getAllContactInfo();

  return <ContactInfoContent contactInfos={contactInfos} />;
}
