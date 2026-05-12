"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Get parent categories (top-level categories where parent_category_id === null)
  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  // Get subcategories for a specific parent category
  const getSubcategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent_category_id === parentId);
  };

  const toggleDropdown = (categoryId: string) => {
    if (openDropdown === categoryId) {
      setOpenDropdown(null);
    } else {
      const button = buttonRefs.current[categoryId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
      setOpenDropdown(categoryId);
    }
  };

  // Update dropdown position on scroll or resize
  useEffect(() => {
    if (!openDropdown) return;

    const updatePosition = () => {
      const button = buttonRefs.current[openDropdown];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [openDropdown]);

  return (
    <>
      <section className="bg-[#e8e8e8] border-b border-gray-300 sticky top-0 z-20 shadow-sm">
        <div className="container pt-4 pb-2">
          {/* Row format for parent categories */}
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap py-2">
            {parentCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              const hasSubcategories = subcategories.length > 0;

              return (
                <div key={category.id}>
                  {hasSubcategories ? (
                    // Parent category with dropdown (has subcategories)
                    <button
                      ref={(el) => {
                        buttonRefs.current[category.id] = el;
                      }}
                      onClick={() => toggleDropdown(category.id)}
                      className={`flex items-center gap-1 min-w-max text-md transition-colors hover:text-[#e65b5b] ${
                        activeCategory === category.id ||
                        subcategories.some((sub) => sub.id === activeCategory)
                          ? "text-[#e65b5b]"
                          : "text-[#1a1a40]"
                      }`}
                    >
                      <span>{category.title}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          openDropdown === category.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    // Parent category without subcategories
                    <button
                      onClick={() => onCategoryChange(category.id)}
                      className={`flex min-w-max items-center gap-1 text-md transition-colors hover:text-[#e65b5b] ${
                        activeCategory === category.id
                          ? "text-[#e65b5b]"
                          : "text-[#1a1a40]"
                      }`}
                    >
                      {category.title}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dropdown Portal - Rendered with fixed positioning to avoid container overflow issues */}
      {openDropdown && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenDropdown(null)}
          />

          {/* Dropdown menu */}
          <div
            className="fixed z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {(() => {
              const category = parentCategories.find(
                (c) => c.id === openDropdown,
              );
              const subcategories = category
                ? getSubcategories(category.id)
                : [];

              return (
                <>
                  {/* "All [Category]" option */}
                  <button
                    onClick={() => {
                      if (category) onCategoryChange(category.id);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#e65b5b]"
                  >
                    All {category?.title}
                  </button>

                  <div className="my-1 border-t border-gray-200" />

                  {/* Subcategories list */}
                  <div className="flex flex-col">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          onCategoryChange(subcategory.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                          activeCategory === subcategory.id
                            ? "font-medium text-[#e65b5b]"
                            : "text-gray-600 hover:text-[#e65b5b]"
                        }`}
                      >
                        {subcategory.title}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </>
  );
}
