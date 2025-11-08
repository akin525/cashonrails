"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useUI, FilterState } from "@/contexts/uiContext";
import { Chip } from "@/components/chip";
import Table, { Column } from "@/components/table";
import { MetricCardSkeleton } from "@/components/loaders";
import Header from "./Header";
import moment from "moment";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard, MetricCardProps } from "@/components/MatricCard";
import Modal from "@/components/modal";
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    RefreshCw,
    Send,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    Wallet,
    Building2,
    CreditCard,
    Hash,
    Calendar,
    User,
    MapPin,
    Globe,
    Info,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    ArrowLeftRight,
    Banknote,
    Receipt,
    Download,
    Filter,
    BarChart3,
    Sparkles,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from 'html2canvas';

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
    reversed: "Yes" | "No";
    reversed_by?: string;
    note?: string;
    currency: string;
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

const MetricCards: React.FC<{ stats: StatsData; isLoading: boolean }> = ({ stats, isLoading }) => {
    const metrics = [
        {
            title: "Total Transfers",
            value: formatCurrency(stats.total),
            icon: <ArrowLeftRight className="w-6 h-6" />,
            gradient: "from-indigo-500 to-indigo-600",
            bgGradient: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
            iconBg: "bg-indigo-600",
            borderColor: "border-indigo-200 dark:border-indigo-800",
        },
        {
            title: "Amount Processed",
            value: formatCurrency(stats.amount_processed),
            icon: <Banknote className="w-6 h-6" />,
            gradient: "from-violet-500 to-violet-600",
            bgGradient: "from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20",
            iconBg: "bg-violet-600",
            borderColor: "border-violet-200 dark:border-violet-800",
        },
        {
            title: "Amount Pending",
            value: formatCurrency(stats.amount_pending),
            icon: <Clock className="w-6 h-6" />,
            gradient: "from-amber-500 to-amber-600",
            bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
            iconBg: "bg-amber-600",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            title: "Successful",
            value: formatCurrency(stats.amount_success),
            icon: <CheckCircle2 className="w-6 h-6" />,
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
            iconBg: "bg-emerald-600",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
            title: "Failed",
            value: formatCurrency(stats.amount_fail),
            icon: <XCircle className="w-6 h-6" />,
            gradient: "from-red-500 to-red-600",
            bgGradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
            iconBg: "bg-red-600",
            borderColor: "border-red-200 dark:border-red-800",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-6 px-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className={`group relative bg-gradient-to-br $${metric.bgGradient} rounded-2xl p-6 border$$ {metric.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${metric.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            {metric.icon}
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {metric.title}
                    </p>
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

const Page: React.FC = () => {
    const { setShowSearchQuery, filterState } = useUI();
    const { authState } = useAuth();
    const router = useRouter();
    const receiptRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<ApiResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [modalData, setModalData] = useState<TableData | null>(null);
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });

    const typedFilterState = filterState as FilterState;
    const queryParams = useMemo(
        () => ({
            status: typedFilterState.status,
            start_date: filterState.dateRange.startDate,
            end_date: filterState.dateRange.endDate,
            search: searchQuery,
        }),
        [typedFilterState, filterState.dateRange, searchQuery]
    );

    const fetchData = useCallback(
        async (page: number) => {
            if (!authState.token) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get<ApiResponse>("/finance/payouts", {
                    params: { ...queryParams, page, limit: pagination.limit },
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000,
                });
                setData(response.data?.data);
                setPagination((prev) => {
                    const newPagination = response.data.pagination || { totalItems: 0, totalPages: 1, limit: 20 };
                    return JSON.stringify(prev) === JSON.stringify(newPagination) ? prev : newPagination;
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch transfers data");
            } finally {
                setLoading(false);
            }
        },
        [authState.token, queryParams, pagination.limit]
    );

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    useEffect(() => {
        setShowSearchQuery(true);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchData(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
        toast.success("Data refreshed successfully!");
    };

    const handleScreenshot = async () => {
        if (!receiptRef.current || !modalData) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `transfer-$${modalData.id}-$$ {Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Transfer receipt downloaded successfully!');
                }
            });
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            toast.error('Failed to capture screenshot');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Transfer Details Modal */}
            {modalData && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setModalData(null);
                        setShowGatewayResponse(false);
                    }}
                    header={
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Send className="w-7 h-7 text-indigo-600" />
                                    Transfer Details
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
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md font-medium text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Receipt
                                </button>
                            </div>
                        </div>
                    }
                    scrollableContent={true}
                >
                    <div ref={receiptRef} className="bg-white dark:bg-gray-800 p-8 space-y-6">
                        {/* Receipt Header */}
                        <div className="text-center pb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                                <Send className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Transfer Receipt
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Generated on {new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                        </div>

                        {/* Status Banner */}
                        <div
                            className={`p-6 rounded-2xl text-center font-semibold text-lg ${
                                modalData.status === 'success'
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                    : modalData.status === 'pending'
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            } shadow-lg`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {modalData.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                                {modalData.status === 'pending' && <Clock className="w-6 h-6" />}
                                {modalData.status === 'failed' && <XCircle className="w-6 h-6" />}
                                <span className="uppercase tracking-wide">Status: {modalData.status}</span>
                            </div>
                        </div>

                        {/* Reversed Banner (if applicable) */}
                        {modalData.reversed === 'Yes' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                                <Info className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="font-semibold text-red-900 dark:text-red-100">
                                        This transfer has been reversed
                                    </p>
                                    {modalData.reversed_by && (
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            Reversed by: {modalData.reversed_by}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Amount Highlight */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-8 text-center border-2 border-indigo-200 dark:border-indigo-800">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                Transfer Amount
                            </p>
                            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                                {modalData.currency === 'NGN' ? '₦' : modalData.currency === 'USD' ? '$' : ''}
                                {Number(modalData.amount).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{modalData.currency}</p>
                        </div>

                        {/* Beneficiary Details */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                Beneficiary Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Name:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {modalData.account_name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Number:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {modalData.account_number}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {modalData.bank_name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailCard icon={<Hash />} label="Transaction ID" value={modalData.id} />
                            <DetailCard icon={<Building2 />} label="Business ID" value={modalData.business_id} />
                            <DetailCard icon={<Receipt />} label="Transaction Ref" value={modalData.trx} />
                            <DetailCard icon={<Hash />} label="Session ID" value={modalData.sessionid} />
                            <DetailCard icon={<DollarSign />} label="Fee" value={`₦${modalData.fee}`} />
                            <DetailCard icon={<DollarSign />} label="System Fee" value={`₦${modalData.sys_fee}`} />
                            <DetailCard icon={<CreditCard />} label="Payment Method" value={modalData.paymentMode} />
                            <DetailCard icon={<Wallet />} label="Fee Source" value={modalData.fee_source} />
                            <DetailCard icon={<Globe />} label="Domain" value={modalData.domain} />
                            <DetailCard icon={<MapPin />} label="Request IP" value={modalData.request_ip} />
                            <DetailCard
                                icon={<Calendar />}
                                label="Created At"
                                value={moment(modalData.created_at).format('MMMM Do YYYY, h:mm A')}
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

                        {/* Message */}
                        {modalData.message && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                                    Message
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">{modalData.message}</p>
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
                                        {showGatewayResponse ? 'Click to hide' : 'Click to view'} detailed response
                                    </p>
                                </div>
                            </div>
                            {showGatewayResponse ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>

                        {showGatewayResponse && modalData.gateway_response && (
                            <div className="mt-4 bg-gray-900 dark:bg-black rounded-xl p-6 overflow-auto">
                                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                    {typeof modalData.gateway_response === 'string'
                                        ? JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)
                                        : JSON.stringify(modalData.gateway_response, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            <Header headerTitle="Transfers" />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 mx-6 mt-6 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <Send className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Transfer Management</h1>
                            <p className="text-indigo-50">Track and manage all outgoing transfers and payouts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            {loading ? <MetricCardSkeleton /> : data?.stats && <MetricCards isLoading={loading} stats={data.stats} />}

            {/* Search and Actions */}
            <div className="px-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by transaction ID, account name, or bank name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Transfers Table */}
            <div className="px-6 mt-6 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Transfers</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pagination.totalItems} total records
                                    </p>
                                </div>
                            </div>
                            {searchQuery && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        Filtered Results
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Table
                        headers={COLUMNS}
                        data={data?.payouts || []}
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
        className={`p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all ${
            fullWidth ? 'md:col-span-2' : ''
        }`}
    >
        <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white break-words">{value || 'N/A'}</p>
    </div>
);

export default Page;

