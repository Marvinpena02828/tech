"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-all ${
            currentPage === page
              ? "bg-[#1a1a40] text-white"
              : "bg-gray-300 text-gray-600 hover:bg-gray-400"
          }`}
        >
          {page}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center text-sm font-medium bg-gray-300 text-gray-600 hover:bg-gray-400 transition-all"
        >
          &gt;&gt;
        </button>
      )}
    </div>
  );
}
