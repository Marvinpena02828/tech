"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface DropdownItem {
  id: string;
  title: string;
  detail: string;
}

interface PartnerItem {
  id: string;
  title: string;
  detail: string;
}

interface CustomerCategory {
  id: string;
  type: string;
  description: string;
  items: PartnerItem[];
  dropdownItems: DropdownItem[];
  image: string;
  contact?: {
    company: string;
    address: string;
    email: string;
  };
  displayOrder: number;
}

const ListOfPartners = () => {
  const supabase = createClient();
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners_categories")
        .select("*")
        .order("displayOrder", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (loading) {
    return (
      <section className="font-poppins bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Loading partners...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="font-poppins bg-white">
      <div className="lg:container px-2 mx-auto">
        <div className="py-6">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Our Valued Partners
          </h2>
          <p className="text-base text-center px-4">
            Ayyan Tech delivers tailored manufacturing, supply chain, and
            service solutions for a diverse range of global business partners.
            <br />
            We customize our support to ensure your success, regardless of your
            market position.
          </p>
        </div>

        <div className="mt-2 max-lg:space-y-6 space-y-10 xl:px-16 pb-2">
          {categories.map((category, index) => (
            <div
              id={`partners-${category.id}`}
              className={`flex flex-col-reverse items-stretch justify-between mx-auto bg-white ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
              key={category.id}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-xl mx-auto">
                <div className="lg:px-4 max-lg:mt-2">
                  <h3 className="text-xl font-bold">{category.type}</h3>
                  <p className="tracking-wider text-sm">{category.description}</p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {category.items?.map((item) => (
                      <li key={item.id}>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Button */}
                  {category.dropdownItems && category.dropdownItems.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="button-animation rounded-full py-1 px-4 inline-flex items-center gap-2"
                        aria-expanded={openCategories[category.id]}
                      >
                        <span>Learn More</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${
                            openCategories[category.id] ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Accordion Dropdown Content */}
                  {category.dropdownItems && category.dropdownItems.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        openCategories[category.id]
                          ? "max-h-[2000px] opacity-100 mt-6"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-4 border-t border-gray-200 pt-6">
                        {category.dropdownItems.map((dropItem) => (
                          <div
                            key={dropItem.id}
                            className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                          >
                            <h5 className="font-bold text-lg text-primary-blue mb-2">
                              {dropItem.title}
                            </h5>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {dropItem.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {category.image && (
                <Image
                  src={category.image}
                  alt={category.type}
                  width={1280}
                  height={1080}
                  className="object-cover w-full aspect-video lg:aspect-square lg:max-w-1/2 h-full flex-1 xl:aspect-auto px-8"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListOfPartners;
