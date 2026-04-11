import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

async function getServices(): Promise<Service[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("order", { ascending: true })
      .limit(4);

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export default async function ServicesSection() {
  const services = await getServices();

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 bg-white border-t border-gray-100 mt-2">
      <div className="container px-4">
        {/* Header */}
        <h2 className="heading text-center text-gray-800 mb-12 font-arial">
          Our Services
        </h2>

        {/* Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className="group flex flex-col gap-3 p-4 hover:bg-gray-50 rounded-lg transition"
            >
              {/* Image */}
              {service.image && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-300 group-hover:border-blue-500 transition-colors">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="100px"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors">
                {service.description.replace(/<[^>]*>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
