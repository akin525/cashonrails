"use client";
import React from "react";

export const MerchantCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        </div>
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
            ))}
        </div>
    </div>
);

interface MerchantGridSkeletonProps {
    count?: number;
}

export const MerchantGridSkeleton: React.FC<MerchantGridSkeletonProps> = ({ count = 9 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(count)].map((_, i) => (
            <MerchantCardSkeleton key={i} />
        ))}
    </div>
);
