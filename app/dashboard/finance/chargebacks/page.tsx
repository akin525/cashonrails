"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessTypeFilterState, FilterState, useUI } from '@/contexts/uiContext';

import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import Tooltip from '@/components/tooltip';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import FilterIcon from '@/assets/icons/filter/filled';
import { useFetchHook } from '@/helpers/globalRequests';
import { useAuth } from '@/contexts/authContext';
import { CardSkeleton, MetricCardSkeleton } from '@/components/loaders';
import CustomFilter, { BaseFilterConfig } from '@/components/dashboard/filters/CustomFilter';
import Header from './Header';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";
import moment from "moment/moment";
type FilterType = 'completed' | 'resolved' | 'ongoing' | 'refunded' | 'TotalChargebacks'

interface TableData {
    id: string;
    business_id: number;
    chargeBackId: string;
    merchantName: string;
    customerName: string;
    reasonCode: string;
    status: FilterType;
    amount: string;
    date: string;
}

interface StatsData {
    total_chargebacks: number;
    chargebacks_count_increase: number;
    resolved_chargebacks_count: number;
    resolved_chargebacks_count_increase: number;
    unresolved_chargebacks_count: number;
    unresolved_chargebacks_count_increase: number;
    total_refunded_amount: number;
}

const COLUMNS: Column<TableData>[] = [
    { id: "chargeBackId", label: "CHARGEBACK ID" },
    { id: "merchantName", label: "MERCHANT NAME" },
    { id: "customerName", label: "CUSTOMER NAME" },
    { id: "reasonCode", label: "REASON CODE" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => (
            <Chip withDot variant={value.status}>
                {value.status.charAt(0).toUpperCase() + value.status.slice(1)}
            </Chip>
        ),
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`
    },
    { id: "date", label: "DATE INITIATED", minWidth: 120 },
];


const Page: React.FC = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { setShowHeader, setShowSearchQuery, setHeaderTitle, filterState, setFilterState } = useUI();
    const [activeFilter, setActiveFilter] = useState<FilterType>('TotalChargebacks');
    const { authState } = useAuth();
    const typedFilterState = filterState as FilterState;
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<TableData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });

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
        await fetchData(currentPage);
        setLoading(false);
    };
    // const handleFilterApply = (filters: BusinessTypeFilterState) => {
    //     setFilterState(filters);
    //     setIsFilterOpen(false);
    // };

    const statsHook = useFetchHook<StatsData>({
        endpoint: '/finance/chargebacks/stats',
        token: authState?.token,
        dependencies: [activeFilter],
        includeDateFilter: true,
        additionalParams: {
            // status: typedFilterState.status,
            start_date: typedFilterState.dateRange.startDate,
            end_date: typedFilterState.dateRange.endDate,
        },
    });
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<TableData[]>("/finance/chargebacks", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });
            setData(response.data?.data || []);
            setPagination(response.data?.pagination || { totalItems: 0, totalPages: 1, limit: 20 });
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
        setHeaderTitle("Chargebacks");
        setShowSearchQuery(true);

        return () => {
            setShowHeader(false);
            setShowSearchQuery(false);
            setHeaderTitle("Dashboard");
        };
    }, []);

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
        const CARD_CONFIGS: MetricCardProps[] = [
            {
                title: "Total Chargebacks",
                count: formatCurrency(stats.total_chargebacks ?? '0'),
            },

            {
                title: "Resolved Chargebacks",
                count: stats.resolved_chargebacks_count?.toString() || '0',
            },
            {
                title: "Ongoing Disputes",
                count: stats.unresolved_chargebacks_count?.toString() || '0',
            },
            {
                title: "Total Amount Refunded",
                count: stats.resolved_chargebacks_count?.toString() || '0',
            },
        ];


        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
                {CARD_CONFIGS.map((card, index) => (
                    <MetricCard isLoading={isLoading} key={index} {...card} variant='success' />
                ))}
            </div>
        );
    };

    const userFilterConfig: BaseFilterConfig[] = [
        {
            type: 'text',
            label: 'Transaction Reference',
            name: 'transactionRef',
            placeholder: 'Enter transaction Reference'
        },
        {
            type: 'text',
            label: 'Beneficiary',
            name: 'beneficiaryName',
            placeholder: 'Enter beneficiary Name'
        },
        {
            type: 'select',
            label: 'Status',
            name: 'status',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' }
            ]
        },
        {
            type: 'select',
            label: 'Currency',
            name: 'currency',
            options: [
                { label: 'NGN', value: 'ngn' },
                { label: 'USD', value: 'usd' }
            ]
        }
    ];
    const [modalData, setModalData] = useState<TableData | null>(null)

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Chargeback Details</h2>
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
            <Header headerTitle={'Chargebacks'} />
            <MetricCards stats={statsHook.data ?? {
                chargebacks_count_increase: 0,
                resolved_chargebacks_count: 0,
                resolved_chargebacks_count_increase: 0,
                total_chargebacks: 0,
                total_refunded_amount: 0,
                unresolved_chargebacks_count: 0,
                unresolved_chargebacks_count_increase: 0
            }}  isLoading={statsHook.isLoading} />
            <div className="p-4 mt-4">
                <div className='flex justify-between items-center gap-2 mb-5 z-50 relative'>
                    <p>Chargeback Requests</p>
                    <div className='flex items-center gap-2'>
                        <button className='border-[#D0D5DD] border p-3 rounded-lg'
                                onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            <FilterIcon/>
                        </button>
                        <button className="border-[#D0D5DD] border font-medium text-sm py-2 px-4 rounded-md">
                            Download
                        </button>
                    </div>
                    {/*<CustomFilter*/}
                    {/*    isOpen={isFilterOpen}*/}
                    {/*    onClose={() => setIsFilterOpen(false)}*/}
                    {/*    onApply={handleFilterApply}*/}
                    {/*    filterConfig={userFilterConfig}*/}
                    {/*/>*/}
                </div>

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search chargeback..."
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
                    headers={COLUMNS}
                    data={filteredData}
                    limit={pagination.limit}
                    loading={loading}
                    onPaginate={setCurrentPage}
                    pagination={pagination}
                    // onRowClick={(row) => router.push(`/dashboard/finance/chargebacks/${row.id}` as RouteLiteral)}
                    onRowClick={(row) => setModalData(row)} // Handle row click
                />
            </div>
        </div>
    );
};

export default Page;