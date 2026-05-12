"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

const ListOfServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setServices(data.sort((a: Service, b: Service) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="font-poppins bg-white">
        <div className="lg:container p-2 mx-auto">
          <div className="mt-6 space-y-10 xl:px-16">
            <h1 className="text-black text-4xl pl-4">Our Services</h1>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="font-poppins bg-white">
      <div className="lg:container p-2 mx-auto">
        <div className="mt-6 max-lg:space-y-6 space-y-10 xl:px-16">
          <h1 className="text-black text-4xl pl-4">Our Services</h1>
          {services.map((service, index) => (
            <div
              id={`service-${index}`}
              className={`flex flex-col-reverse items-stretch justify-between my-10 mx-auto bg-white ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
              key={service.id}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-2xl mx-auto">
                <div className="p-4">
                  <h1 className="text-xl lg:text-xl font-bold mb-4">
                    {service.title}
                  </h1>
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                </div>
              </div>

              <Image
                src={service.image}
                alt={service.title}
                width={1280}
                height={1080}
                className="object-cover w-full aspect-video lg:aspect-square lg:max-w-1/2 h-full flex-1 xl:aspect-auto px-8"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListOfServices;
