"use client";
import React from "react";
import { Plus } from "lucide-react";
import { FeeTable } from "./FeeTable";
import type { MerchantFeeData, FeeType } from "@/types/fee.types";

interface FeeSectionProps {
    title: string;
    type: FeeType;
    data: MerchantFeeData[];
    loading: boolean;
    onCreateClick: () => void;
    onEditClick: (fee: MerchantFeeData) => void;
}

export const FeeSection: React.FC<FeeSectionProps> = ({
                                                          title,
                                                          type,
                                                          data,
                                                          loading,
                                                          onCreateClick,
                                                          onEditClick,
                                                      }) => {
    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage {type} fee configurations
                    </p>
                </div>
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700
                             text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Fee
                </button>
            </div>

            {/* Table */}
            <FeeTable data={data} type={type} loading={loading} onEdit={onEditClick} />
        </section>
    );
};
