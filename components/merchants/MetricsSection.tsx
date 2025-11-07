"use client";
import React from "react";
import { MetricCard } from "@/components/MatricCard";
import type { StatsData } from "@/types/merchant.types";

interface MetricsSectionProps {
    stats: StatsData | null;
    loading: boolean;
}

interface MetricConfig {
    title: string;
    key: keyof StatsData;
    variant?: "success" | "warning" | "danger" | "info";
}

const METRICS_CONFIG: MetricConfig[] = [
    { title: "Total Merchants", key: "total_merchant", variant: "info" },
    { title: "Approved", key: "approved_merchant", variant: "success" },
    { title: "Pending", key: "pending_merchant", variant: "warning" },
    { title: "New", key: "new_merchant", variant: "info" },
    { title: "Rejected", key: "rejected_merchant", variant: "danger" },
];

export const MetricsSection: React.FC<MetricsSectionProps> = ({ stats, loading }) => {
    if (!stats && !loading) return null;

    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-6">
            {METRICS_CONFIG.map(({ title, key, variant }) => (
                <MetricCard
                    key={key}
                    title={title}
                    count={stats?.[key]?.toString() ?? "0"}
                    variant={variant ?? "success"}
                    isLoading={loading}
                />
            ))}
        </section>
    );
};
