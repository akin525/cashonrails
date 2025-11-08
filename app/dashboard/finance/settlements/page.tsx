"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { BusinessTypeFilterState, FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import { MetricCardSkeleton } from "@/components/loaders";
import { useFetchHook } from "@/helpers/globalRequests";
import moment from "moment";
import Header from "./Header";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard, MetricCardProps } from "@/components/MatricCard";
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";
import {
    Banknote,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    TrendingDown,
    Search,
    RefreshCw,
    Building2,
    Hash,
    Calendar,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    Wallet,
    CreditCard,
    BarChart3,
    Filter,
    Download,
    ExternalLink,
    Info,
    Sparkles,
    X,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Coins,
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

// Types
interface TableData {
    id: string;
    business_id: number;
    total_amount: string;
    settled_amount: string;
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

type FilterStatus = "all" | "completed" | "pending" | "failed";

// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
    { id: "id", label: "SETTLEMENT ID" },
    { id: "business_id", label: "BUSINESS ID" },
    {
        id: "total_amount",
        label: "Total Amount",
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`,
    },
    {
        id: "settled_amount",
        label: "SETTLED AMOUNT",
        minWidth: 120,
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`,
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
        format: (value) => moment(value).format("MMM D, YYYY"),
    },
];

const useFetchStats = (filterStatus?: string) => {
    const { authState } = useAuth();

    return useFetchHook<StatsData>({
        endpoint: "/finance/settlements/stats",
        token: authState?.token,
        includeDateFilter: false,
    });
};

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

const MetricCards: React.FC<{
    stats: StatsData;
    isLoading: boolean;
}> = ({ stats, isLoading }) => {
    const metrics = [
        {
            title: "Total Settled Amount",
            value: formatCurrency(stats.total_settled_amount),
            trend: stats.total_settled_amount_increase,
            icon: <CircleDollarSign className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
            iconBg: "bg-blue-600",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            title: "Completed",
            value: stats.completed_settlements_count,
            trend: stats.completed_settlements_count_increase,
            icon: <CheckCircle2 className="w-6 h-6" />,
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
            iconBg: "bg-emerald-600",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
            title: "Pending",
            value: stats.pending_settlements_count,
            trend: stats.pending_settlements_count_increase,
            icon: <Clock className="w-6 h-6" />,
            gradient: "from-amber-500 to-amber-600",
            bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
            iconBg: "bg-amber-600",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            title: "Failed",
            value: stats.failed_settlements_count,
            trend: stats.failed_settlements_count_increase,
            icon: <XCircle className="w-6 h-6" />,
            gradient: "from-red-500 to-red-600",
            bgGradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
            iconBg: "bg-red-600",
            borderColor: "border-red-200 dark:border-red-800",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 px-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className={`group relative bg-gradient-to-br $${metric.bgGradient} rounded-2xl p-6 border$$ {metric.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className={`w-12 h-12 rounded-xl ${metric.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                        >
                            {metric.icon}
                        </div>
                        {metric.trend !== 0 && (
                            <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                    metric.trend > 0
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                            >
                                {metric.trend > 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {Math.abs(metric.trend)}%
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? (
                            <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                        ) : (
                            metric.value
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
};

// Page Component
const SettlementsPage = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const receiptRef = useRef<HTMLDivElement>(null);
    const typedFilterState = filterState as FilterState;
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

    const { data: stats, isLoading: isLoadingStats, error: statsError } = useFetchStats(activeFilter);
    const [data, setData] = useState<TableData[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [modalData, setModalData] = useState<TableData | null>(null);
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const queryParams = useMemo(
        () => ({
            status: typedFilterState.status,
            start_date: filterState.dateRange.startDate,
            end_date: filterState.dateRange.endDate,
        }),
        [typedFilterState.status, filterState.dateRange.startDate, filterState.dateRange.endDate]
    );

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((item) =>
            Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [data, searchQuery]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage, searchQuery);
        setLoading(false);
        toast.success("Data refreshed successfully!");
    };

    const fetchData = useCallback(
        async (page: number, search: string) => {
            if (!authState.token) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get<TableData[]>("/finance/settlements", {
                    params: { ...queryParams, page, limit: pagination.limit, search },
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000,
                });
                setData(response.data?.data);
                setPagination(
                    response.data.pagination
                        ? response.data.pagination
                        : { totalItems: 0, totalPages: 1, limit: 50 }
                );
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch settlements data");
            } finally {
                setLoading(false);
            }
        },
        [authState.token, queryParams, pagination.limit]
    );

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

    const handleScreenshot = async () => {
        if (!receiptRef.current || !modalData) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `settlement-$${modalData.id}-$$ {Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success("Settlement receipt downloaded successfully!");
                }
            });
        } catch (error) {
            console.error("Error capturing screenshot:", error);
            toast.error("Failed to capture screenshot");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Settlement Details Modal */}
            {modalData && (
                <Modal
                    isOpen={!!modalData}
                    onClose={() => {
                        setModalData(null);
                        setShowGatewayResponse(false);
                    }}
                    header={
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Coins className="w-7 h-7 text-blue-600" />
                                    Settlement Details
                                </h2>
                                <button
                                    onClick={() => setModalData(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={handleScreenshot}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Receipt
                                </button>
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral
                                        )
                                    }
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md font-medium text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Business
                                </button>
                            </div>
                        </div>
                    }
                    scrollableContent={true}
                >
                    <div ref={receiptRef} className="bg-white dark:bg-gray-800 p-8 space-y-6">
                        {/* Receipt Header */}
                        <div className="text-center pb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                                <Coins className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Settlement Receipt
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Generated on{" "}
                                {new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
                            </p>
                        </div>

                        {/* Status Banner */}
                        <div
                            className={`p-6 rounded-2xl text-center font-semibold text-lg ${
                                modalData.status === "completed" || modalData.status === "success"
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                    : modalData.status === "pending"
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                        : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                            } shadow-lg`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {(modalData.status === "completed" || modalData.status === "success") && (
                                    <CheckCircle2 className="w-6 h-6" />
                                )}
                                {modalData.status === "pending" && <Clock className="w-6 h-6" />}
                                {modalData.status === "failed" && <XCircle className="w-6 h-6" />}
                                <span className="uppercase tracking-wide">Status: {modalData.status}</span>
                            </div>
                        </div>

                        {/* Amount Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 text-center border-2 border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Total Amount
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    ₦{Number(modalData.total_amount).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 text-center border-2 border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Settled Amount
                                </p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₦{Number(modalData.settled_amount).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Settlement Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailCard icon={<Hash />} label="Settlement ID" value={modalData.id} fullWidth />
                            <DetailCard icon={<Building2 />} label="Business ID" value={modalData.business_id} />
                            <DetailCard icon={<Receipt />} label="Transaction Ref" value={modalData.trx} />
                            <DetailCard icon={<Hash />} label="Session ID" value={modalData.sessionid} />
                            <DetailCard icon={<Wallet />} label="Currency" value={modalData.currency} />
                            <DetailCard icon={<DollarSign />} label="Fee" value={`₦${modalData.fee}`} />
                            <DetailCard icon={<DollarSign />} label="System Fee" value={`₦${modalData.sys_fee}`} />
                            <DetailCard icon={<CreditCard />} label="Payment Mode" value={modalData.paymentMode} />
                            <DetailCard
                                icon={<Building2 />}
                                label="Account Name"
                                value={modalData.account_name}
                            />
                            <DetailCard
                                icon={<Hash />}
                                label="Account Number"
                                value={modalData.account_number}
                            />
                            <DetailCard icon={<Building2 />} label="Bank Name" value={modalData.bank_name} />
                            <DetailCard icon={<Hash />} label="Bank Code" value={modalData.bank_code} />
                            <DetailCard
                                icon={<Calendar />}
                                label="Created At"
                                value={moment(modalData.created_at).format("MMMM Do YYYY, h:mm A")}
                                fullWidth
                            />
                            <DetailCard
                                icon={<Calendar />}
                                label="Updated At"
                                value={moment(modalData.updated_at).format("MMMM Do YYYY, h:mm A")}
                                fullWidth
                            />
                        </div>

                        {/* Narration */}
                        {modalData.narration && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Narration
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">{modalData.narration}</p>
                            </div>
                        )}

                        {/* Note */}
                        {modalData.note && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                                    Note
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">{modalData.note}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This is a computer-generated receipt and requires no signature.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                For inquiries, please contact support
                            </p>
                        </div>
                    </div>

                    {/* Gateway Response (Outside Screenshot) */}
                    {modalData.gateway_response && (
                        <div className="px-8 pb-8">
                            <button
                                onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                                className="flex items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        {showGatewayResponse ? (
                                            <EyeOff className="w-5 h-5 text-white" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white">Gateway Response</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {showGatewayResponse ? "Click to hide" : "Click to view"} detailed response
                                        </p>
                                    </div>
                                </div>
                                {showGatewayResponse ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>

                            {showGatewayResponse && (
                                <div className="mt-4 bg-gray-900 dark:bg-black rounded-xl p-6 overflow-auto">
                                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                        {typeof modalData.gateway_response === "string"
                                            ? JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)
                                            : JSON.stringify(modalData.gateway_response, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            )}

            <Header headerTitle="Settlements" />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 mx-6 mt-6 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <Coins className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Settlement Management</h1>
                            <p className="text-blue-50">Track and manage all business settlements and payouts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            {isLoadingStats ? (
                <MetricCardSkeleton />
            ) : (
                <MetricCards
                    stats={
                        stats ?? {
                            completed_settlements_count: 0,
                            completed_settlements_count_increase: 0,
                            failed_settlements_count: 0,
                            failed_settlements_count_increase: 0,
                            pending_settlements_count: 0,
                            pending_settlements_count_increase: 0,
                            total_settled_amount: 0,
                            total_settled_amount_increase: 0,
                            total_settlements_count: 0,
                            total_settlements_count_increase: 0,
                        }
                    }
                    isLoading={isLoadingStats}
                />
            )}

            {/* Search and Actions */}
            <div className="px-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by settlement ID, business ID, or amount..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Settlements Table */}
            <div className="px-6 mt-6 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient
-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Settlements</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pagination.totalItems} total records
                                    </p>
                                </div>
                            </div>
                            {searchQuery && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Filtered Results
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Table
                        headers={TABLE_COLUMNS}
                        data={filteredData}
                        limit={pagination.limit}
                        loading={loading}
                        onRowClick={(row) => setModalData(row)}
                        pagination={pagination}
                        onPaginate={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

// Detail Card Component for Modal
const DetailCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    fullWidth?: boolean;
}> = ({ icon, label, value, fullWidth }) => (
    <div
        className={`p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all ${
            fullWidth ? "md:col-span-2" : ""
        }`}
    >
        <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white break-words">{value || "N/A"}</p>
    </div>
);

export default SettlementsPage;
