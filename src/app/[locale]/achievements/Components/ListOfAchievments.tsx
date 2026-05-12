"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
}

const ListOfAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from("achievements")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <section className="font-poppins bg-white py-12">
        <div className="flex justify-center items-center">
          <Loader className="animate-spin" />
        </div>
      </section>
    );
  }

  if (achievements.length === 0) {
    return (
      <section className="font-poppins bg-white py-12">
        <div className="text-center text-gray-500">No achievements to display</div>
      </section>
    );
  }

  return (
    <section className="font-poppins bg-white">
      <div className="lg:container px-2 xl:px-16 mx-auto">
        <div className="mt-6 max-lg:space-y-6 space-y-10">
          {achievements.map((achievement, index) => (
            <div
              id={`achievement-${achievement.id}`}
              className={`flex flex-col-reverse items-stretch justify-between mx-auto bg-white ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
              key={achievement.id}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-xl mx-auto">
                <div className="lg:px-4 max-lg:mt-2">
                  <h1 className="text-lg lg:text-xl font-bold mb-4">
                    {achievement.title}
                  </h1>
                  <p className="text-black text-base whitespace-pre-line">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {achievement.image_url && (
                <Image
                  src={achievement.image_url}
                  alt={achievement.title}
                  width={1280}
                  height={1080}
                  className="object-cover w-full aspect-video lg:aspect-square lg:max-w-1/2 h-full flex-1 xl:aspect-auto px-8"
                  priority={index < 2}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListOfAchievements;
