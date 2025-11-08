"use client"
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import { useAuth } from '@/contexts/authContext';
import Header from './Header';
import { StringUtils } from '@/helpers/extras';
import moment from 'moment';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import {
    Download,
    FileSpreadsheet,
    PackageSearch,
    RefreshCw,
    Search,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Send,
    Eye,
    EyeOff,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Hash,
    Wallet,
    Receipt,
    ChevronDown,
    ChevronUp,
    Sparkles,
    BarChart3,
    Info,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import {debounce} from "next/dist/server/utils";
import html2canvas from 'html2canvas';

interface StatsData {
    total: number,
    amount_processed: number,
    amount_success: number,
    amount_fail: number,
    amount_pending: number
}

interface Response {
    table: TableData[];
    stats: StatsData
};

interface BusinessSummary {
    total_transactions_count: number;
    total_transaction_value: number;
    total_revenue: number;
}

interface Business {
    id: number;
    user_id: number;
    name: string;
    trade_name: string;
    acc_prefix: string;
    industry_id: number;
    category_id: number;
    business_type: string;
    description: string | null;
    class: string | null;
    rcNumber: string | null;
    tin: string | null;
    logo: string | null;
    international_payment: number;
    local_settlement_day: number;
    foreign_settlement_day: number;
    rolling_reserve: string;
    rolling_duration: number;
    rs: number;
    trans_limit: string;
    biz_email: string;
    biz_bvn: string | null;
    bvn_verify: number;
    biz_phone: string;
    biz_url: string | null;
    biz_country: string;
    biz_country_isoName: string;
    biz_state: string | null;
    biz_city: string | null;
    biz_address: string;
    support_email: string;
    support_phone: string;
    chargeback_email: string | null;
    bc_notify: number;
    cc_notify: number;
    bp_notify: number;
    authMode: string;
    acc_prefix_mode: string;
    paymentMethod: string | null;
    defautPaymentMethod: string;
    momo_options: string;
    autoRefund: number;
    instant_settlement: string;
    kyc_status: string;
    kyc_reason_for_rejection: string | null;
    kyc_rejection_comment: string | null;
    phone_otp: string;
    phone_verified: number;
    id_verified: number;
    referral: string | null;
    ref_code: string;
    feeBearer: string;
    collection_status: number;
    payout_status: number;
    payout_limit_per_trans: string;
    status: string;
    created_at: string;
    updated_at: string;
    summary: BusinessSummary;
}

interface TableData {
    id: string;
    business_id: number;
    currency: string;
    amount: string;
    requested_amount: string;
    fee: string;
    stamp_duty: string;
    total: string;
    sys_fee: string;
    trx: string;
    reference: string;
    channel: string;
    type: string;
    domain: string;
    customer_id: number;
    plan: string | null;
    card_attempt: number;
    settlement_batchid: string;
    settled_at: string | null;
    split_code: string | null;
    ip_address: string;
    gateway: string;
    gateway_response: string;
    webhook_status: string | null;
    webhook_response: string | null;
    webhook_count: number;
    paid_at: string;
    status: string;
    created_at: string;
    updated_at: string;
    business: Business;
};

const COLUMNS: Column<TableData>[] = [
    {
        id: "reference", label: "TRANSACTION ID",
    },
    { id: "gateway", label: "GATEWAY" },
    {
        id: "business", label: "BUSINESS NAME",
        type: "custom",
        renderCustom: (value) => <p>{value.business.name}</p>,
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        type: "custom",
        renderCustom: (row: TableData) => (
            <p>
                {row.currency === 'NGN' ? '₦' : row.currency === 'USD' ? '$' : ''}
                {Number(row.amount).toLocaleString()}
            </p>
        )
    },
    {
        id: "currency",
        label: "CURRENCY"
    },
    {
        id: "fee",
        label: "FEE"
    },
    {
        id: "sys_fee",
        label: "SYSTEM FEE"
    },
    {
        id: "type", label: "PAYMENT TYPE",
        type: "custom",
        renderCustom: (value) => <p>{value.channel == "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(value.type)}</p>,
    },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => (
            <Chip variant={value.status}>
                {value.status}
            </Chip>
        ),
    },
    {
        id: "created_at", label: "DATE CREATED", minWidth: 120,
        type: "dateTime",
    },
];

const Page: React.FC = () => {
    const router = useRouter()
    const { setShowHeader, setShowSearchQuery, setHeaderTitle, filterState } = useUI();
    const [data, setData] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const { authState } = useAuth()
    const typedFilterState = filterState as FilterState;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const transactionReceiptRef = useRef<HTMLDivElement>(null);
    const [modalData, setModalData] = useState<TableData | null>(null)
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const handleScreenshot = async () => {
        if (!transactionReceiptRef.current || !modalData) return;

        try {
            const canvas = await html2canvas(transactionReceiptRef.current, {
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
                    link.download = `transaction-$${modalData.reference}-$$ {Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Transaction proof downloaded successfully!');
                }
            });
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            toast.error('Failed to capture screenshot');
        }
    };

    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
        search: searchQuery,
    }), [filterState, searchQuery]);

    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        fetchData(1);
    }, []);

    const debouncedSearch = useMemo(() => debounce(handleSearch, 500), [handleSearch]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
    };

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<Response>("/finance/transactions", {
                params: {
                    ...queryParams,
                    page,
                    limit: pagination.limit,
                    reference: searchQuery
                },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000
            });
            setData(response.data?.data);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 10 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        debouncedSearch();
    };

    useEffect(() => {
        return () => {
            debouncedSearch;
        };
    }, [debouncedSearch]);

    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            console.error("Missing businessId or transactionId");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_transaction_webhook/$${businessId}/live/$$ {transactionId}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout:60000
                }
            );
            if (response.data.success){
                toast.success(response.data.message);
            }else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportToMail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post('/export/export-transactions',
                {
                    start_date: startDate || null,
                    end_date: endDate || null
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout:60000
                }
            );

            setLoading(false);
            setShowModal(false);

            if (response.data.status) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error exporting transactions:", error);
            toast.error("Failed to export transactions. Please try again.");
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    const formatCurrency = (amount: number): string => {
        if (amount >= 1_000_000_000) {
            return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
        } else if (amount >= 1_000_000) {
            return `₦${(amount / 1_000_000).toFixed(2)}M`;
        } else if (amount >= 1_000) {
            return `₦${(amount / 1_000).toFixed(2)}K`;
        } else {
            return `₦${amount}`;
        }
    };

    const MetricCards: React.FC<{
        stats: StatsData;
        isLoading: boolean
    }> = ({ stats, isLoading }) => {
        const metrics = [
            {
                title: "Total Transactions",
                value: formatCurrency(stats.total),
                icon: <Activity className="w-6 h-6" />,
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                iconBg: "bg-blue-600",
                borderColor: "border-blue-200 dark:border-blue-800"
            },
            {
                title: "Amount Processed",
                value: formatCurrency(stats.amount_processed),
                icon: <DollarSign className="w-6 h-6" />,
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                iconBg: "bg-purple-600",
                borderColor: "border-purple-200 dark:border-purple-800"
            },
            {
                title: "Successful",
                value: formatCurrency(stats.amount_success),
                icon: <CheckCircle2 className="w-6 h-6" />,
                gradient: "from-emerald-500 to-emerald-600",
                bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
                iconBg: "bg-emerald-600",
                borderColor: "border-emerald-200 dark:border-emerald-800"
            },
            {
                title: "Pending",
                value: formatCurrency(stats.amount_pending),
                icon: <Clock className="w-6 h-6" />,
                gradient: "from-amber-500 to-amber-600",
                bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
                iconBg: "bg-amber-600",
                borderColor: "border-amber-200 dark:border-amber-800"
            },
            {
                title: "Failed",
                value: formatCurrency(stats.amount_fail),
                icon: <XCircle className="w-6 h-6" />,
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
                iconBg: "bg-red-600",
                borderColor: "border-red-200 dark:border-red-800"
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Transaction Details Modal */}
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
                                <Receipt className="w-7 h-7 text-emerald-600" />
                                Transaction Details
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
                                onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md font-medium text-sm"
                            >
                                <Building2 className="w-4 h-4" />
                                View Business
                            </button>
                            <button
                                onClick={() => resendwebhook(modalData?.business_id as any, modalData?.id)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium text-sm disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? "Sending..." : "Resend Webhook"}
                            </button>
                            <button
                                onClick={handleScreenshot}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md font-medium text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download Proof
                            </button>
                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                <div ref={transactionReceiptRef} className="bg-white dark:bg-gray-800 p-8 space-y-6">
                    {modalData ? (
                        <>
                            {/* Receipt Header */}
                            <div className="text-center pb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                                    <Receipt className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Transaction Receipt
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Generated on {new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                                </p>
                            </div>

                            {/* Status Banner */}
                            <div className={`p-6 rounded-2xl text-center font-semibold text-lg ${
                                modalData.status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                                    modalData.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
                                        'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            } shadow-lg`}>
                                <div className="flex items-center justify-center gap-3">
                                    {modalData.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                                    {modalData.status === 'pending' && <Clock className="w-6 h-6" />}
                                    {modalData.status === 'failed' && <XCircle className="w-6 h-6" />}
                                    <span className="uppercase tracking-wide">Status: {modalData.status}</span>
                                </div>
                            </div>

                            {/* Amount Highlight */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-8 text-center border-2 border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Transaction Amount
                                </p>
                                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {modalData.currency === 'NGN' ? '₦' : modalData.currency === 'USD' ? '$' : ''}
                                    {Number(modalData.amount).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {modalData.currency}
                                </p>
                            </div>

                            {/* Transaction Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={<Hash />} label="Transaction ID" value={modalData.id} />
                                <InfoCard icon={<CreditCard />} label="Reference" value={modalData.reference} />
                                <InfoCard icon={<Wallet />} label="Gateway" value={modalData.gateway} />
                                <InfoCard icon={<DollarSign />} label="Fee" value={modalData.fee} />
                                <InfoCard icon={<Activity />} label="Type" value={modalData.channel == "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(modalData.type)} />
                                <InfoCard icon={<Activity />} label="Channel" value={StringUtils.capitalizeWords(modalData.channel)} />
                                <InfoCard
                                    icon={<Calendar />}
                                    label="Transaction Date"
                                    value={moment(modalData.created_at).format('MMMM Do YYYY, h:mm A')}
                                    fullWidth
                                />
                            </div>

                            {/* Business Details */}
                            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-emerald-600" />
                                    Business Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard icon={<Building2 />} label="Business Name" value={modalData.business.name} />
                                    <InfoCard icon={<Mail />} label="Email" value={modalData.business.biz_email} />
                                    <InfoCard icon={<Phone />} label="Phone" value={modalData.business.biz_phone} />
                                    <InfoCard icon={<MapPin />} label="Address" value={modalData.business.biz_address} fullWidth />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    This is a computer-generated receipt and requires no signature.
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    For inquiries, please contact support
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading transaction details...</p>
                        </div>
                    )}
                </div>

                {/* Gateway Response (Outside Screenshot) */}
                {modalData && (
                    <div className="px-8 pb-8">
                        <button
                            onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                            className="flex items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    {showGatewayResponse ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
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
                                    {JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Header headerTitle={'Transactions'} />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 mx-6 mt-6 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Transaction Management
                            </h1>
                            <p className="text-emerald-50">
                                Monitor and manage all your transactions in one place
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <MetricCards
                isLoading={loading}
                stats={data?.stats ?? {
                    amount_fail: 0,
                    amount_pending: 0,
                    amount_processed: 0,
                    amount_success: 0,
                    total: 0
                }}
            />

            {/* Search and Actions */}
            <div className="px-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by reference, business name, or transaction ID..."

                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Export to CSV
                        </button>

                        <button
                            onClick={() => router.push(`/dashboard/finance/search-transaction` as RouteLiteral)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md font-medium"
                        >
                            <PackageSearch className="w-5 h-5" />
                            Advanced Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="px-6 mt-6 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        All Transactions
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pagination.totalItems} total records
                                    </p>
                                </div>
                            </div>
                            {searchQuery && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                        Filtered Results
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Table
                        headers={COLUMNS}
                        data={data?.table || []}
                        limit={pagination.limit}
                        loading={loading}
                        onRowClick={(row) => setModalData(row)}
                        pagination={pagination}
                        onPaginate={setCurrentPage}
                    />
                </div>
            </div>

            {/* Export Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                                        <FileSpreadsheet className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Export Transactions</h2>
                                        <p className="text-emerald-50 text-sm">Download as CSV file</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Info Banner */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-semibold mb-1">Export Information</p>
                                    <p>The CSV file will be sent to your registered email address. You can optionally filter by date range.</p>
                                </div>
                            </div>

                            {/* Date Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        max={endDate || undefined}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || undefined}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date Range Summary */}
                            {(startDate || endDate) && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                        <span className="font-bold">Exporting:</span>{' '}
                                        {startDate && endDate
                                            ? `$${moment(startDate).format('MMM D, YYYY')} -$$ {moment(endDate).format('MMM D, YYYY')}`
                                            : startDate
                                                ? `From ${moment(startDate).format('MMM D, YYYY')}`
                                                : `Until ${moment(endDate).format('MMM D, YYYY')}`}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setStartDate("");
                                        setEndDate("");
                                    }}
                                    className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={exportToMail}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Export Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Info Card Component for Modal
const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    fullWidth?: boolean;
}> = ({ icon, label, value, fullWidth }) => (
    <div className={`p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all ${fullWidth ? 'md:col-span-2' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
            </p>
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white break-words">
            {value}
        </p>
    </div>
);

export default Page;
