"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useUI, FilterState } from "@/contexts/uiContext";
import { useFetchHook } from "@/helpers/globalRequests";
import { Chip } from "@/components/chip";
import Table, { Column } from "@/components/table";
import Tooltip from "@/components/tooltip";
import { MetricCardSkeleton } from "@/components/loaders";
import {
    ActiveShopIcon,
    DisabledShopIcon,
    NormalShopIcon,
} from "@/public/assets/icons";
import { RouteLiteral } from "nextjs-routes";
import Header from "./Header";
import moment from "moment";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard, MetricCardProps } from "@/components/MatricCard";
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";


type TableData = {
    id: string;
    account_name: string;
    bank_name: string;
    amount: string;
    status: "pending" | "success" | "failed";
    created_at: string;
    batch_id?: string;
    business_id: string;
    trx: string;
    reference?: string;
    transactionRef?: string;
    sessionid: string;
    fee: string;
    fee_source: string;
    sys_fee: string;
    bank_code: string;
    account_number: string;
    narration: string;
    sender_name: string;
    paymentMode: string;
    request_ip: string;
    initiator: string;
    domain: string;
    source: string;
    gateway: string;
    gateway_response?: string;
    message?: string;
    reversed: "Yes" | "No",
    reversed_by?: string,
    note?: string,
    currency: string,
};

type StatsData = {
    total: number;
    amount_pending: number;
    amount_processed: number;
    amount_success: number;
    amount_fail: number;
};

type ApiResponse = {
    stats: StatsData;
    payouts: TableData[];
};

const COLUMNS: Column<TableData>[] = [
    { id: "id", label: "TRANSACTION ID" },
    { id: "account_name", label: "BENEFICIARY NAME" },
    { id: "bank_name", label: "DESTINATION" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        format: (value) => `₦${Number(value).toLocaleString()}`,
    },
    {
        id: "currency",
        label: "CURRENCY",

    },
    {
        id: "fee",
        label: "FEE",

    },
    {
        id: "sys_fee",
        label: "SYSTEM FEE",

    },
    {
        id: "created_at",
        label: "DATE CREATED",
        minWidth: 120,
        format: (value) => moment(value).format("MMM DD, YYYY"),
    },
];

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
const MetricCards: React.FC<{ stats: StatsData, isLoading: boolean }> = ({ stats, isLoading }) => {
    const CARD_CONFIGS: MetricCardProps[] = [
        {
            title: "Total Transfers",
            count: formatCurrency(stats.total),
        },
        {
            title: "Total Amount Processed",
            count: formatCurrency(stats.amount_processed),
        },
        {
            title: "Amount Pending",
            count: formatCurrency(stats.amount_pending),
        },
        {
            title: "Successful Transfers",
            count: formatCurrency(stats.amount_success),
        },
        {
            title: "Failed Transfers",
            count: formatCurrency(stats.amount_fail),
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5 p-2">
            {CARD_CONFIGS.map((card, index) => (
                <MetricCard key={index} {...card} isLoading={isLoading} variant="success" />
            ))}
        </div>
    );
};

const Page: React.FC = () => {
    const { setShowSearchQuery, filterState } = useUI();
    const { authState } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<ApiResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [modalData, setModalData] = useState<TableData | null>(null);
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });

    const typedFilterState = filterState as FilterState;
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
        search: searchQuery,  // Include search in query params
    }), [typedFilterState, filterState.dateRange, searchQuery]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>("/finance/payouts", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });
            setData(response.data?.data);
            setPagination(prev => {
                const newPagination = response.data.pagination || { totalItems: 0, totalPages: 1, limit: 20 };
                return JSON.stringify(prev) === JSON.stringify(newPagination) ? prev : newPagination;
            });
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
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    // Debounced search (prevents excessive API calls)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData(1); // Fetch new data when search query changes
        }, 500); // 500ms debounce time

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchData]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
    };

    return (
        <div>
            {modalData && (
                <Modal isOpen={true} onClose={() => setModalData(null)} header={<h2 className="text-xl font-semibold text-gray-800">Transfer Details</h2>} scrollableContent={true}>
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[{label: "Transaction ID", value: modalData.id}, {
                                label: "Business ID",
                                value: modalData.business_id
                            },
                                {label: "Currency", value: modalData.currency}, {
                                    label: "Amount",
                                    value: modalData.amount
                                },
                                {label: "Fee", value: modalData.fee}, {label: "System Fee", value: modalData.sys_fee},
                                {label: "Transaction Reference", value: modalData.trx}, {
                                    label: "Bank Code",
                                    value: modalData.bank_code
                                },
                                {label: "Bank Name", value: modalData.bank_name}, {
                                    label: "Account Name",
                                    value: modalData.account_name
                                },
                                {label: "Account Number", value: modalData.account_number}, {
                                    label: "Reversed",
                                    value: modalData.reversed
                                },
                                {label: "Domain", value: modalData.domain}, {
                                    label: "Fee Source",
                                    value: modalData.fee_source
                                },
                                {label: "Message", value: modalData.message}, {
                                    label: "Narration",
                                    value: modalData.narration
                                },
                                {label: "Payment Method", value: modalData.paymentMode}, {
                                    label: "Request IP",
                                    value: modalData.request_ip
                                },
                                {label: "Session ID", value: modalData.sessionid}, {
                                    label: "Status",
                                    value: modalData.status
                                },
                                {
                                    label: "Created At",
                                    value: moment(modalData.created_at).format('MMMM Do YYYY, h:mm:ss a')
                                }]
                                .map(({label, value}) => (
                                    <div key={label} className="space-y-2">
                                        <p className="text-sm text-gray-600"><strong>{label}:</strong></p>
                                        <p className="text-sm font-medium text-gray-800">{value ?? "N/A"}</p>
                                    </div>
                                ))}
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                                    className="flex items-center justify-between w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                                >
                                <span className="text-sm font-medium text-gray-700">
                                    {showGatewayResponse ? 'Hide Gateway Response' : 'Show Gateway Response'}
                                </span>
                                    <svg
                                        className={`w-5 h-5 transition-transform ${showGatewayResponse ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>

                                {showGatewayResponse && modalData.gateway_response && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <pre className="text-sm text-gray-800">
            {typeof modalData.gateway_response === "string"
                ? JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)
                : JSON.stringify(modalData.gateway_response, null, 2)}
        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {modalData.gateway_response && (
                            <div className="mt-6">
                                <button onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                                        className="flex items-center justify-between w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none">
                                    <span className="text-sm font-medium text-gray-700">
                                        {showGatewayResponse ? 'Hide Gateway Response' : 'Show Gateway Response'}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 transition-transform ${showGatewayResponse ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>
                                {showGatewayResponse && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <pre
                                            className="text-sm text-gray-800">{JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            <Header headerTitle="Transfers"/>
            {loading ? <MetricCardSkeleton/> : data?.stats && <MetricCards isLoading={loading} stats={data.stats}/>}

            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search transfer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-2 border-green-400 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold m-2"
                />
                <button onClick={handleRefresh} disabled={loading} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition flex items-center gap-2 m-2">
                    {loading ? (
                        <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                        </svg>
                    ) : "Refresh"}
                </button>
            </div>

            <div className="p-4 mt-4">
                <Table<TableData> headers={COLUMNS} data={data?.payouts || []} limit={pagination.limit} loading={loading} onRowClick={setModalData} pagination={pagination} onPaginate={setCurrentPage}/>
            </div>
        </div>
    );
};

export default Page;
