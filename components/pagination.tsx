import React from "react";

type PaginationProps = {
    totalPages: number;
    currentPage: number;
    limit: number;
    onChange: (page: number) => void;
};

export default function Pagination({ totalPages, currentPage, limit, onChange }: PaginationProps) {

    const handlePrev = () => {
        if (currentPage > 1) {
            onChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onChange(currentPage + 1);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPageNumbers = 7; // Maximum number of displayed pages

        if (totalPages <= maxPageNumbers) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const leftBound = Math.max(1, currentPage - 2);
            const rightBound = Math.min(totalPages, currentPage + 2);

            if (leftBound > 1) {
                pageNumbers.push(1);
                if (leftBound > 2) {
                    pageNumbers.push("...");
                }
            }

            for (let i = leftBound; i <= rightBound; i++) {
                pageNumbers.push(i);
            }

            if (rightBound < totalPages) {
                if (rightBound < totalPages - 1) {
                    pageNumbers.push("...");
                }
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers.map((page, index) => (
            <div
                key={index}
                onClick={() => typeof page === "number" && onChange(page)}
                className={`cursor-pointer flex justify-center items-center w-[45px] h-[45px] rounded-md ${
                    typeof page === "number"
                        ? page === currentPage
                            ? "font-semibold text-[#01AB79] bg-[#F1FDF6]"
                            : "text-[#667085] hover:bg-gray-50"
                        : "text-[#272363] cursor-default"
                }`}
            >
                {page}
            </div>
        ));
    };

    // if (totalPages < 1) return null;

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-5 md:gap-0">
            <div className="hidden lg:block"></div>
            <div className="flex items-center gap-x-1 justify-center md:justify-start">
                {renderPageNumbers()}
            </div>

            <div className="flex items-center gap-x-2 justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`cursor-pointer flex justify-center items-center border-[1.7px] rounded-md text-sm px-8 py-2.5 ${
                        currentPage === 1
                            ? "border-[#e1e5ea] text-[#9a9fa5] cursor-not-allowed"
                            : "border-[#D0D5DD] text-[#475467] hover:bg-gray-50"
                    }`}
                >
                    <svg
                        className={currentPage === 1 ? "opacity-50" : ""}
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 3.33334L5.33333 8L10 12.6667"
                            stroke="#272363"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Previous
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`cursor-pointer flex justify-center items-center border-[1.7px] rounded-md text-sm px-8 py-2.5 ${
                        currentPage === totalPages
                            ? "border-[#e1e5ea] text-[#9a9fa5] cursor-not-allowed"
                            : "border-[#D0D5DD] text-[#475467] hover:bg-gray-50"
                    }`}
                >
                    Next
                    <svg
                        className={currentPage === totalPages ? "opacity-50" : ""}
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 3.33334L10.6667 8L6 12.6667"
                            stroke="#272363"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
