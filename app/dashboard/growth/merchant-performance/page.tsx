"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { TrendIcon } from '@/public/assets/icons';
import Table, { Column } from '@/components/table';
import Tooltip from '@/components/tooltip';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import { useAuth } from '@/contexts/authContext';
import toast from 'react-hot-toast';
import { MetricCardSkeleton } from '@/components/loaders';
import { useFetchHook } from '@/helpers/globalRequests';
import Header from './Header';
import axiosInstance from '@/helpers/axiosInstance';
import { cn } from '@/helpers/extras';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';

// Types
export interface MerchantStats {
    transactions: {
        count: number;
        count_increase: number;
        value: number;
        value_increase: number;
    };
    revenue: {
        value: string;
        value_increase: number;
    };
}


interface MerchantSummary {
    total_transactions_count: number;
    total_transaction_value: number;
    total_revenue: number;
}

interface MerchantTableData {
    name: string;
    id: string;
    summary: MerchantSummary;
}

interface TableData extends MerchantTableData {
    name: string;
    id: string;
    summary: {
        total_transactions_count: number;
        total_transaction_value: number;
        total_revenue: number;
    }
}

interface MerchantPerformanceResponse {
    stats: MerchantStats;
    table: TableData[];
}



// Table Columns Configuration
const COLUMNS: Column<TableData>[] = [
    { id: "id", label: "MERCHANT ID" },
    { id: "name", label: "MERCHANT NAME" },
    {
        id: "summary",
        label: "TRANSACTIONS",
        type: "custom",
        renderCustom: (value) => value.summary.total_transactions_count.toString()
    },
    {
        id: "summary",
        label: "TOTAL VALUE",
        minWidth: 120,
        type: "custom",
        renderCustom: (value) => `₦${value.summary.total_transaction_value.toLocaleString()}`
    },
    {
        id: "summary",
        label: "TOTAL FEE",
        minWidth: 120,
        type: "custom",
        renderCustom: (value) => `₦${value.summary.total_revenue.toLocaleString()}`
    }
];

// Metrics Section Component
const MetricsSection: React.FC<{ data: MerchantStats; isLoading: boolean }> = ({ data, isLoading }) => {
    const metrics: MetricCardProps[] = [
        {
            title: "Total Transactions",
            count: data.transactions.count.toString(),
            trendPercentage: data.transactions.count_increase,
        },
        {
            title: "Transactions Value",
            count: `₦${data.transactions.value.toString()}`,
            trendPercentage: data.transactions.value_increase,
        },
        {
            title: "Total Revenue",
            count: `₦${data.revenue.value.toString()}`,
            trendPercentage: data.revenue.value_increase,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5 p-2">
            {metrics.map((metric, index) => (
                <MetricCard
                    key={index}
                    count={metric.count}
                    title={metric.title}
                    isLoading={isLoading}
                    variant="success"
                    trendPercentage={metric.trendPercentage}
                />
            ))}
        </div>
    );
};

// Main Page Component
const MerchantPerformancePage: React.FC = () => {
    const router = useRouter();
    const { setShowHeader, setShowSearchQuery, setHeaderTitle, filterState } = useUI();
    const { authState } = useAuth();
    const typedFilterState = filterState as FilterState;
    const [data, setData] = useState<MerchantPerformanceResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);
    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<MerchantPerformanceResponse>("/growth/merchants/performance", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setData(response.data?.data);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);
    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    useEffect(() => {
        setShowHeader(false);
        setHeaderTitle("Merchants Performance");
        setShowSearchQuery(true);

        return () => {
            setShowHeader(false);
            setShowSearchQuery(false);
            setHeaderTitle("Dashboard");
        };
    }, [setShowHeader, setShowSearchQuery, setHeaderTitle]);

    return (
        <div>
            <Header headerTitle={'Merchants Performance'} />
            <MetricsSection
                data={data?.stats ?? {
                    transactions: { count: 0, count_increase: 0, value: 0, value_increase: 0 },
                    revenue: { value: "0", value_increase: 0 }
                }}
                isLoading={loading}
            />
            <div className="p-4 mt-4">
                <Table<TableData>
                    headers={COLUMNS}
                    data={data?.table || []}
                    limit={pagination.limit}
                    onRowClick={(row) => router.push(`/dashboard/growth/merchant-performance/${row.id}` as RouteLiteral)}
                    loading={loading}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default MerchantPerformancePage;