"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface CompanyProfile {
  id: number;
  title: string;
  content: string;
}

export default function CompanyProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("company_profile")
        .select("id, title, content")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="pt-8 pb-12 bg-white font-poppins mt-2">
        <div className="container">
          <div className="space-y-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl">Company Overview</h1>
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null; // Don't show section if no profile
  }

  return (
    <section className="pt-8 pb-12 bg-white font-poppins mt-2">
      <div className="container">
        <div className="">
          <div className="space-y-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl">{profile.title}</h1>
              <div className="text-sm text-black text-center max-w-7xl mx-auto leading-7">
                <p>{profile.content}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
