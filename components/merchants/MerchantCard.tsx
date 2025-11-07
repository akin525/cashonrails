"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import { Chip } from "@/components/chip";
import { StringUtils } from "@/helpers/extras";
import type { TableData } from "@/types/merchant.types";

interface MerchantCardProps {
    merchant: TableData;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(
            `/dashboard/operations/merchant/${merchant.merchant_id}/business` as RouteLiteral
        );
    };

    return (
        <article
            onClick={handleClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl
                       transition-all duration-300 p-5 cursor-pointer group
                       border border-gray-100 dark:border-gray-700 hover:border-primary/30"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            {/* Header */}
            <div className="flex justify-between items-start gap-3 mb-4">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white
                               group-hover:text-primary transition-colors line-clamp-1">
                    {merchant.merchant_name}
                </h2>
                <Chip variant={merchant.status.toLowerCase()}>
                    {StringUtils.capitalizeWords(merchant.status)}
                </Chip>
            </div>

            {/* Details */}
            <dl className="space-y-2 text-sm">
                <DetailRow label="Merchant ID" value={merchant.merchant_id} />
                <DetailRow label="Business Type" value={merchant.business_type} />
                <DetailRow label="Date Created" value={merchant.date_created} />
                <DetailRow
                    label="Risk Score"
                    value={merchant.risk_score}
                    valueClassName={getRiskScoreColor(merchant.risk_score)}
                />
            </dl>
        </article>
    );
};

interface DetailRowProps {
    label: string;
    value: string;
    valueClassName?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, valueClassName }) => (
    <div className="flex justify-between items-center">
        <dt className="text-gray-600 dark:text-gray-400 font-medium">{label}:</dt>
        <dd className={`text-gray-900 dark:text-gray-100 ${valueClassName || ''}`}>
            {value}
        </dd>
    </div>
);

const getRiskScoreColor = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 70) return "text-red-600 font-semibold";
    if (numScore >= 40) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
};
