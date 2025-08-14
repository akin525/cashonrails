"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import Tooltip from '@/components/tooltip';
import { MetricCardSkeleton } from '@/components/loaders';
import { useFetchHook } from '@/helpers/globalRequests';
import Header from './Header';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";
import moment from "moment";
import {PackageSearch} from "lucide-react";


interface StatsData {
    total: number,
    amount_pending: number,
    amount_processed: number,
    amount_success: number,
    amount_fail: number
}

// Define the Customer interface
interface Customer {
    id: number;
    business_id: number;
    account_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bvn: string;
    nin: string;
    address: string;
    dob: string;
    customer_code: string;
    metadata: string;
    domain: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Define the main interface that includes the Customer
interface CheckoutData {
    id: string;
    business_id: number;
    customer_id: number;
    currency: string;
    amount: string;
    fee: string;
    total: string;
    feeBearer: string;
    paidAmount: string | null;
    paidDifference: string | null;
    paidNote: string | null;
    name: string;
    email: string;
    phone: string;
    transactionRef: string;
    reference: string;
    initiationTranRef: string;
    access_code: string;
    paymentMethod: string;
    provider: string;
    gateway: string;
    account_number: string;
    account_name: string;
    bank_name: string;
    accountExpiry: string;
    domain: string;
    ip: string | null;
    trans_id: string | null;
    redirectUrl: string;
    title: string | null;
    description: string | null;
    logoUrl: string | null;
    status_desc: string | null;
    status: string;
    extra: string | null;
    created_at: string;
    updated_at: string;
    customer: Customer; // Nested customer object
}

interface CombinedResponse {
    stats: StatsData;
    table: CheckoutData[];
}

// Constants
const TABLE_COLUMNS: Column<CheckoutData>[] = [
    { id: "business_id", label: "BUSINESS ID" },
    { id: "account_name", label: "ACCOUNT NAME" },
    { id: "account_number", label: "ACCOUNT NUMBER" },
    { id: "bank_name", label: "BANK NAME" },
    { id: "provider", label: "PROVIDER" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
    },
    { id: "created_at", label: "DATE", type: "dateTime" },

];


const MetricCards: React.FC<{
    stats: StatsData;
    isLoading: boolean
}> = ({
    stats,
    isLoading
}) => {
    const formatNumber = (num: number): string => {
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + "M"; // Convert to millions
        } else if (num >= 1_000) {
            return (num / 1_000).toFixed(1) + "K"; // Convert to thousands
        }
        return num.toFixed(2); // Show two decimal places for small numbers
    };
        const cardConfigs: MetricCardProps[] = [
            {
                title: "Total",
                count: formatNumber(stats.total),
            },
            {
                title: "Processed",
                count: "₦" + formatNumber(stats.amount_processed),
            },
            {
                title: "Pending",
                count: "₦" + formatNumber(stats.amount_pending),
            },
            {
                title: "Successful",
                count: `₦${formatNumber(stats.amount_success)}`,
            },
            {
                title: "Failed",
                count: `₦${formatNumber(stats.amount_fail)}`,
            },
        ];
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5 px-2.5">
                {cardConfigs.map((card, index) => (
                    <MetricCard key={index} {...card} isLoading={isLoading} variant='success' />
                ))}
            </div>
        );
    };

// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [data, setData] = useState<CombinedResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
    const [searchQuery, setSearchQuery] = useState<string>("");

// Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data?.table) return [];
        return data.table.filter((item) =>
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
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/checkout", {
                params: { page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

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
        setShowSearchQuery(true);

        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);

    // const handleRowClick = useCallback((row: CheckoutData) => {
    //     router.push(`/dashboard/finance/virtual-wallets/${row.id}` as RouteLiteral);
    // }, [router]);
    const [modalData, setModalData] = useState<Customer | null>(null)

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Checkout Details</h2>
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
            <Header headerTitle={'Checkouts'} />
            <MetricCards isLoading={loading} stats={data?.stats ?? { total: 0, amount_pending: 0, amount_processed: 0, amount_success: 0, amount_fail: 0 }} />
            <div className="p-4 mt-4">

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search checkout..."
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
                    <button
                        onClick={() => router.push(`/dashboard/finance/search-checkout` as RouteLiteral)}
                        className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                    >
                        <PackageSearch className="w-5 h-5"/>
                        <span>Search General Checkout</span>
                    </button>
                </div>

                <Table<CheckoutData>
                    headers={TABLE_COLUMNS}
                    data={filteredData}
                    limit={pagination.limit}
                    // onRowClick={handleRowClick}
                    // onRowClick={(row) => setModalData(row)} // Handle row click
                    loading={loading}
                    onPaginate={setCurrentPage}
                    pagination={pagination}

                />
            </div>
        </div>
    );
};

export default Page;