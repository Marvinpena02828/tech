"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ServicesSection() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log("🟢 Effect running");
    
    fetch("/api/services", { cache: "no-store" })
      .then(async (r) => {
        console.log("🟢 Response:", r.status);
        const json = await r.json();
        console.log("🟢 JSON:", json);
        setData(json);
      })
      .catch((e) => {
        console.error("🟢 Error:", e);
        setData([]);
      });
  }, []);

  console.log("🟢 Rendering with data:", data);

  if (!data) {
    return <section className="w-full py-16 bg-amber-200 border-4 border-amber-500"><div className="container text-center"><p className="font-bold">⏳ Loading...</p></div></section>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <section className="w-full py-16 bg-red-200 border-4 border-red-500"><div className="container text-center"><p className="font-bold">❌ No data: {JSON.stringify(data).substring(0, 50)}</p></div></section>;
  }

  const services = data.sort((a: any, b: any) => a.order - b.order).slice(0, 4);

  return (
    <section className="w-full py-16 bg-green-200 border-4 border-green-600">
      <div className="container px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-green-900">
          Our Services ({services.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {services.map((s: any, idx: number) => (
            <Link
              href={`/services#service-${idx}`}
              key={s.id}
              className="bg-white p-4 rounded-lg border-2 border-green-400 hover:border-green-600"
            >
              {s.image && (
                <div className="relative w-full h-24 mb-3 rounded bg-gray-300">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover rounded"
                    sizes="100px"
                    onError={(e) => {
                      (e.target as any).style.display = "none";
                    }}
                  />
                </div>
              )}
              <h3 className="font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{s.description.replace(/<[^>]*>/g, "")}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
