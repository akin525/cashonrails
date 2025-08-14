"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessTypeFilterState, FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import Tooltip from '@/components/tooltip';
import { MetricCardSkeleton } from '@/components/loaders';
import { useFetchHook } from '@/helpers/globalRequests';
import moment from 'moment';
import Header from './Header';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';

// Types
interface TableData {
    id: string;
    business_id: number;
    total_amount: string
    settled_amount: string
    trx: string;
    reference: string;
    transactionRef: string;
    sessionid: string;
    currency: string;
    amount: string;
    fee: string;
    fee_source: string;
    sys_fee: string;
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    narration: string;
    sender_name: string;
    paymentMode: string;
    domain: string;
    source: string;
    gateway: string;
    gateway_response: string;
    status: string;
    reversed: string;
    reversed_by: string | null;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface StatsData {
    total_settlements_count: number;
    total_settlements_count_increase: number;
    completed_settlements_count: number;
    completed_settlements_count_increase: number;
    pending_settlements_count: number;
    pending_settlements_count_increase: number;
    failed_settlements_count: number;
    failed_settlements_count_increase: number;
    total_settled_amount: number;
    total_settled_amount_increase: number;
}

type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';


// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
    { id: "id", label: "SETTLEMENT ID" },
    { id: "business_id", label: "BUSINESS ID" },
    { id: "total_amount", label: "Total Amount",
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`

    },
    {
        id: "settled_amount",
        label: "SETTLED AMOUNT",
        minWidth: 120,
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`
    },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
    },

    {
        id: "created_at",
        label: "DATE CREATED",
        minWidth: 120,
        format: (value) => moment(value).format('MMM D, YYYY')
    },
];

const useFetchStats = (filterStatus?: string) => {
    const { authState } = useAuth();

    return useFetchHook<StatsData>({
        endpoint: '/finance/settlements/stats',
        token: authState?.token,
        includeDateFilter: false,
    });
};



const MetricCards: React.FC<{
    stats: StatsData;
    isLoading: boolean
}> = ({
    stats,
    isLoading
}) => {

    const formatCurrency = (amount: number): string => {
        if (amount >= 1_000_000_000) {
            return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
        } else if (amount >= 1_000_000) {
            return `₦${(amount / 1_000_000).toFixed(2)}M`;
        } else if (amount >= 1_000) {
            return `₦${(amount / 1_000).toFixed(2)}K`;
        } else {
            return `₦${amount.toLocaleString()}`;
        }
    };
        const cardConfigs: MetricCardProps[] = [
            {
                title: "Total Settlements",
                count: formatCurrency(stats.total_settled_amount),
                trendPercentage: stats.total_settled_amount_increase,
            },
            {
                title: "Completed Settlements",
                count: stats.completed_settlements_count,
                trendPercentage: stats.completed_settlements_count_increase,
            },
            {
                title: "Pending Settlements",
                count: stats.pending_settlements_count,
                trendPercentage: stats.pending_settlements_count_increase,
            },
            {
                title: "Failed Settlements",
                count: stats.failed_settlements_count,
                trendPercentage: stats.failed_settlements_count_increase,
            },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
                {cardConfigs.map((card, index) => (
                    <MetricCard key={index} {...card} isLoading={isLoading} variant='success' />
                ))}
            </div>
        );
    };

// Page Component
const SettlementsPage = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

    const { data: stats, isLoading: isLoadingStats, error: statsError } = useFetchStats(activeFilter);
    const [data, setData] = useState<TableData[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);
    const [searchQuery, setSearchQuery] = useState<string>("");

// Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);
    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage, searchQuery);
        setLoading(false);
    };
    const fetchData = useCallback(async (page: number, search: string) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<TableData[]>("/finance/settlements", {
                params: { ...queryParams, page, limit: pagination.limit, search },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000
            });
            setData(response.data?.data);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 50 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData(currentPage, searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, currentPage, fetchData]);

    useEffect(() => {
        setShowSearchQuery(true);

        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);

    const [modalData, setModalData] = useState<TableData | null>(null)

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Settlement Details</h2>
                        <div className="flex gap-4">
                            <Buttons
                                onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)}
                                label="Go to business"
                                type="smOutlineButton"
                            />
                            {/*<Buttons label="Resend Notification" fullWidth type="smOutlineButton" />*/}
                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                {modalData ? (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(modalData).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <p className="text-sm text-gray-600 font-semibold">{key.replace(/_/g, " ").toUpperCase()}:</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {key.includes("created_at") || key.includes("updated_at")
                                            ? `${moment(value).format("MMMM Do YYYY, h:mm:ss a")}`
                                            : value ?? "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading...</p>
                )}
            </Modal>
            <Header headerTitle={'Settlements'} />
            <MetricCards
                stats={stats ?? {
                    completed_settlements_count: 0,
                    completed_settlements_count_increase: 0,
                    failed_settlements_count: 0,
                    failed_settlements_count_increase: 0,
                    pending_settlements_count: 0, pending_settlements_count_increase: 0,
                    total_settled_amount: 0, total_settled_amount_increase: 0,
                    total_settlements_count: 0,
                    total_settlements_count_increase: 0,
                }}
                isLoading={isLoadingStats}
            />

            <div className="p-4 mt-4">

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search settlement..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-2 border-green-400 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold m-2"
                    />


                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition flex items-center gap-2 m-2"
                    >
                        {loading ? (
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                            </svg>
                        ) : (
                            "Refresh"
                        )}
                    </button>
                </div>

                <Table<TableData>
                    headers={TABLE_COLUMNS}
                    data={filteredData}
                    limit={pagination.limit}
                    loading={loading}
                    // onRowClick={(row) => router.push(`/dashboard/finance/settlements/${row.id}` as RouteLiteral)}
                    onRowClick={(row) => setModalData(row)} // Handle row click
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default SettlementsPage;