"use client";
import React from "react";
import Header from "./Header";
import { useMerchants } from "@/hooks/useMerchants";
import { MetricsSection } from "@/components/merchants/MetricsSection";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { Pagination } from "@/components/merchants/Pagination";
import { MerchantGridSkeleton } from "@/components/merchants/MerchantCardSkeleton";
import { AlertCircle } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const MerchantsPage: React.FC = () => {
    const {
        stats,
        merchants,
        loading,
        error,
        currentPage,
        totalPages,
        setCurrentPage,
        refetch,
    } = useMerchants({ limit: ITEMS_PER_PAGE });

    return (
        <>
            <Header headerTitle="Business Merchants" />

            <div className="p-4 max-w-[1600px] mx-auto">
                {/* Metrics Section */}
                <MetricsSection stats={stats} loading={loading} />

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                            <p className="text-red-800 dark:text-red-200 font-medium">
                                Failed to load merchants
                            </p>
                            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Merchants Grid */}
                <section>
                    {loading ? (
                        <MerchantGridSkeleton count={ITEMS_PER_PAGE} />
                    ) : merchants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {merchants.map((merchant) => (
                                <MerchantCard
                                    key={merchant.merchant_id}
                                    merchant={merchant}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </section>

                {/* Pagination */}
                {!loading && merchants.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </>
    );
};

const EmptyState: React.FC = () => (
    <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No merchants found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later.
        </p>
    </div>
);

export default MerchantsPage;
