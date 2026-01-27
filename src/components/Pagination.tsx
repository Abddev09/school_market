import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages = 20, currentPage, onPageChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages - 1, startPage + maxVisible - 2);

      if (endPage - startPage < maxVisible - 2) {
        startPage = Math.max(1, endPage - maxVisible + 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center mt-6 items-center gap-2 select-none">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`p-2 rounded-md transition ${
          currentPage === 1
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-[#2a2a2a] text-gray-300 hover:bg-yellow-400/20"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400 px-2">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition ${
              currentPage === p
                ? "bg-yellow-500 text-black"
                : "bg-[#2a2a2a] text-gray-300 hover:bg-yellow-400/20"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md transition ${
          currentPage === totalPages
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-[#2a2a2a] text-gray-300 hover:bg-yellow-400/20"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;