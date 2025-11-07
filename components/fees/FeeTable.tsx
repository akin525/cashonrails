"use client";
import React from "react";
import { Edit2, Loader2 } from "lucide-react";
import type { MerchantFeeData, FeeType } from "@/types/fee.types";

interface FeeTableProps {
    data: MerchantFeeData[];
    type: FeeType;
    loading: boolean;
    onEdit: (fee: MerchantFeeData) => void;
}

export const FeeTable: React.FC<FeeTableProps> = ({ data, type, loading, onEdit }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                    No {type} fees configured yet
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="table-header">Currency</th>
                    <th className="table-header">Fee Type</th>
                    <th className="table-header">Fee Value</th>
                    {type === "collection" ? (
                        <th className="table-header">Cap Value</th>
                    ) : (
                        <>
                            <th className="table-header">Range Set</th>
                            <th className="table-header">Min Fee</th>
                            <th className="table-header">Max Fee</th>
                        </>
                    )}
                    <th className="table-header">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="table-cell font-medium">{fee.currency}</td>
                        <td className="table-cell">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {fee.fee_type === "percent" ? "Percentage" : "Flat"}
                                </span>
                        </td>
                        <td className="table-cell">
                            {fee.fee}
                            {fee.fee_type === "percent" ? "%" : ""}
                        </td>
                        {type === "collection" ? (
                            <td className="table-cell">
                                {(fee as any).fee_cap || "N/A"}
                            </td>
                        ) : (
                            <>
                                <td className="table-cell">
                                    {(fee as any).range_set || "N/A"}
                                </td>
                                <td className="table-cell">
                                    {(fee as any).min_fee || "N/A"}
                                </td>
                                <td className="table-cell">
                                    {(fee as any).max_fee || "N/A"}
                                </td>
                            </>
                        )}
                        <td className="table-cell">
                            <button
                                onClick={() => onEdit(fee)}
                                className="text-primary hover:text-primary/80 transition-colors p-2"
                                aria-label="Edit fee"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
