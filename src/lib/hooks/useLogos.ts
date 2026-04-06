// lib/hooks/useLogos.ts
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export interface Logo {
  id: number;
  logo_type: "main" | "mobile" | "favicon";
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  updated_at: string;
}

export function useLogos() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch all logos
  const fetchLogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .order("logo_type");

      if (error) throw error;
      setLogos(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch logos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (
    file: File,
    logoType: "main" | "mobile" | "favicon"
  ) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${logoType}-${Date.now()}.${fileExt}`;
      const filePath = `${logoType}/${fileName}`;

      // Delete old file if exists
      const existingLogo = logos.find((l) => l.logo_type === logoType);
      if (existingLogo?.url) {
        const oldPath = existingLogo.url.split("/logos/")[1];
        if (oldPath) {
          await supabase.storage.from("logos").remove([`${logoType}/${oldPath}`]);
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  // Update logo in database
  const updateLogo = async (
    logoType: "main" | "mobile" | "favicon",
    url: string,
    metadata?: { alt_text?: string; width?: number; height?: number }
  ) => {
    try {
      const { error } = await supabase
        .from("logos")
        .update({
          url,
          alt_text: metadata?.alt_text,
          width: metadata?.width,
          height: metadata?.height,
          updated_at: new Date().toISOString(),
        })
        .eq("logo_type", logoType);

      if (error) throw error;
      await fetchLogos();
      toast.success(`${logoType} logo updated successfully`);
    } catch (error: any) {
      toast.error(`Failed to update logo: ${error.message}`);
      throw error;
    }
  };

  // Handle file upload and update
  const handleLogoUpload = async (
    file: File,
    logoType: "main" | "mobile" | "favicon",
    metadata?: { alt_text?: string; width?: number; height?: number }
  ) => {
    try {
      const url = await uploadImage(file, logoType);
      await updateLogo(logoType, url, metadata);
      return url;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  // Get specific logo
  const getLogo = (logoType: "main" | "mobile" | "favicon") => {
    return logos.find((l) => l.logo_type === logoType);
  };

  useEffect(() => {
    fetchLogos();

    // Subscribe to real-time changes (new Supabase API)
    const channel = supabase
      .channel("logos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logos",
        },
        () => {
          fetchLogos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    logos,
    loading,
    fetchLogos,
    handleLogoUpload,
    getLogo,
  };
}
