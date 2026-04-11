"use client";

import { useEffect, useState } from "react";

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(data => {
        console.log("✅ Services loaded:", data);
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        console.error("❌ Error:", e);
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className="w-full py-32 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 border-4 border-yellow-400 mt-2">
      <div className="container px-4">
        <h2 className="text-5xl font-bold text-center mb-12 text-white drop-shadow-lg">
          🎯 OUR SERVICES 🎯
        </h2>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          {loading && (
            <p className="text-center text-2xl text-blue-600 font-bold">⏳ Loading...</p>
          )}

          {error && (
            <p className="text-center text-2xl text-red-600 font-bold">❌ Error: {error}</p>
          )}

          {!loading && !error && (
            <>
              <p className="text-center text-3xl font-bold text-green-600 mb-6">
                ✅ Found {services.length} Services!
              </p>

              {services.length === 0 ? (
                <p className="text-center text-xl text-gray-600">No services in database</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service: any, idx: number) => (
                    <div key={service.id} className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-blue-400">
                      <div className="text-sm font-bold text-blue-600">#{idx + 1}</div>
                      <h3 className="font-bold text-lg text-gray-800 mt-2">{service.title}</h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {service.description}
                      </p>
                      <p className="text-xs text-purple-600 mt-2 font-mono break-all">
                        Image: {service.image}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          ID: {service.id.substring(0, 8)}...
                        </span>
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                          Order: {service.order}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
