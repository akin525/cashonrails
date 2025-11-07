import { cn } from '@/helpers/extras';
import { TrendIcon } from '@/public/assets/icons';
import React from 'react';

export interface MetricCardProps {
    title: string;
    count: string | number;
    trendPercentage?: number;
    variant?: 'blue' | 'purple' | 'success' | 'warning' | 'error' | 'danger' | 'info' | 'default';
    isLoading?: boolean;
}

const VARIANT_STYLES = {
    default: {
        background: "bg-gradient-to-br from-gray-50 to-gray-100/50",
        border: "border-gray-100",
        title: "text-gray-600",
        iconBg: "bg-white/50",
        shadow: "shadow-gray-200/50",
    },
    blue: {
        background: "bg-gradient-to-br from-blue-50 via-blue-50/50 to-white",
        border: "border-blue-100/50",
        title: "text-blue-600",
        iconBg: "bg-blue-50/50",
        shadow: "shadow-blue-200/50",
    },
    info: {
        background: "bg-gradient-to-br from-sky-50 via-sky-50/50 to-white",
        border: "border-sky-100/50",
        title: "text-sky-600",
        iconBg: "bg-sky-50/50",
        shadow: "shadow-sky-200/50",
    },
    purple: {
        background: "bg-gradient-to-br from-purple-50 via-purple-50/50 to-white",
        border: "border-purple-100/50",
        title: "text-purple-600",
        iconBg: "bg-purple-50/50",
        shadow: "shadow-purple-200/50",
    },
    success: {
        background: "bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white",
        border: "border-emerald-100/50",
        title: "text-emerald-600",
        iconBg: "bg-emerald-50/50",
        shadow: "shadow-emerald-200/50",
    },
    warning: {
        background: "bg-gradient-to-br from-amber-50 via-amber-50/50 to-white",
        border: "border-amber-100/50",
        title: "text-amber-600",
        iconBg: "bg-amber-50/50",
        shadow: "shadow-amber-200/50",
    },
    error: {
        background: "bg-gradient-to-br from-red-50 via-red-50/50 to-white",
        border: "border-red-100/50",
        title: "text-red-600",
        iconBg: "bg-red-50/50",
        shadow: "shadow-red-200/50",
    },
    danger: {
        background: "bg-gradient-to-br from-red-50 via-red-50/50 to-white",
        border: "border-red-100/50",
        title: "text-red-600",
        iconBg: "bg-red-50/50",
        shadow: "shadow-red-200/50",
    },
} as const;

const MetricCardSkeleton: React.FC<{ variant?: keyof typeof VARIANT_STYLES }> = ({ variant = 'default' }) => {
    // Fallback to default if variant is invalid
    const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

    return (
        <div className={cn(
            "animate-pulse rounded-xl border p-6 h-full",
            styles.background,
            styles.border
        )}>
            <div className="h-4 bg-gray-200/50 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200/50 rounded w-3/4"></div>
        </div>
    );
};

export const MetricCard: React.FC<MetricCardProps> = ({
                                                          title,
                                                          count,
                                                          trendPercentage,
                                                          variant = 'default',
                                                          isLoading,
                                                      }) => {
    if (isLoading) {
        return <MetricCardSkeleton variant={variant as keyof typeof VARIANT_STYLES} />;
    }

    const isPositiveTrend = trendPercentage && trendPercentage > 0;
    // Fallback to default if variant is invalid
    const styles = VARIANT_STYLES[variant as keyof typeof VARIANT_STYLES] || VARIANT_STYLES.default;

    return (
        <div className={cn(
            "group relative rounded-xl border",
            "transition-all duration-300 ease-in-out",
            "hover:shadow-lg hover:-translate-y-1",
            styles.background,
            styles.border,
            styles.shadow
        )}>
            <div className="p-6 h-full flex flex-col justify-between space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className={cn(
                        "text-sm font-medium",
                        styles.title
                    )}>
                        {title}
                    </h3>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <p className="text-3xl font-normal tracking-tight text-gray-600">
                        {count}
                    </p>

                    {trendPercentage !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-normal",
                            isPositiveTrend ? "text-emerald-600" : "text-red-600"
                        )}>
                            <TrendIcon
                                direction={isPositiveTrend ? 'up' : 'down'}
                                size={12}
                                color={isPositiveTrend ? '#10B981' : '#EF4444'}
                                animated
                            />
                            <span>{Math.abs(trendPercentage).toFixed(1)}% from last month</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
        </div>
    );
};
