"use client";
import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          onPageChange,
                                                          maxVisible = 5,
                                                      }) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisible + 2) {
            // Show all pages
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        const startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

        if (startPage > 2) {
            pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) {
            pages.push("...");
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    }, [currentPage, totalPages, maxVisible]);

    if (totalPages <= 1) return null;

    return (
        <nav className="flex justify-center items-center mt-8 gap-2" aria-label="Pagination">
            <PaginationButton
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
            </PaginationButton>

            <div className="flex gap-1">
                {pageNumbers.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-gray-500"
                            >
                                …
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <PaginationButton
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            isActive={isActive}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {pageNum}
                        </PaginationButton>
                    );
                })}
            </div>

            <PaginationButton
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
            </PaginationButton>
        </nav>
    );
};

interface PaginationButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean;
    children: React.ReactNode;
    "aria-label"?: string;
    "aria-current"?: string;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
                                                               onClick,
                                                               disabled = false,
                                                               isActive = false,
                                                               children,
                                                               ...props
                                                           }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                px-3 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center justify-center min-w-[2.5rem]
                ${
                isActive
                    ? "bg-primary text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
                ${disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-md"}
                border border-gray-200 dark:border-gray-700
            `}
            {...props}
        >
            {children}
        </button>
    );
};
