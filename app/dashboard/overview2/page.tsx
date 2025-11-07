"use client";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { FilterState, useUI } from '@/contexts/uiContext';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import moment from 'moment';
import Header from './Header';
import { CardSkeleton } from '@/components/loaders';
import axiosInstance from '@/helpers/axiosInstance';
import React from 'react';
import toast from 'react-hot-toast';
import { MetricCard } from '@/components/MatricCard';
import { Chip } from '@/components/chip';
import Table, { Column } from '@/components/table';
import { StringUtils } from '@/helpers/extras';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import { RouteLiteral } from 'nextjs-routes';
import {
    FiRefreshCcw,
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiUsers,
    FiCreditCard,
    FiSmartphone,
    FiActivity,
    FiFilter,
    FiCalendar,
    FiDownload,
    FiEye,
    FiEyeOff,
    FiChevronDown,
    FiChevronUp,
    FiExternalLink,
    FiSend,
    FiAlertCircle,
} from 'react-icons/fi';
import {
    Building2,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Layers,
} from 'lucide-react';

// [Keep all your existing interfaces - OverviewStatsData, ChartData, etc.]
interface OverviewStatsData {
    sumTransaction: number,
    totalTransactions: number,
    totalMerchants: number,
    totalActiveBusiness: number,
    transationSystemFee: number,
    collectionRevenue: number,
    payoutSystemFee: number,
    transationFee: number,
    payoutFee: number,
    totalPayout: number,
    totalPayoutCount: number,
    totalIncoming: number,
    totalIncomingCount: number,
    totalIncomingFee: number,
    totalCheckout: number,
    totalCheckoutCount: number,
    totalCheckoutFee: number,
    totalMerchant: number,
    totalBusiness: number,
    payoutRevenue: number,
    transationRevenue: number,
    totalPayinFee: number,
    TotalPayinCount: number,
    totalPayin: number,
    totalCardTransactionValue: number,
    totalBlacklistedMerchants: number,
    totalPwbTransferValue: number,
    totalPayWithPhone: number,
    totalRejectedMerchants: number,
    totalPayWithMobileMoney: number,
    totalPendingMerchants: number,
    cardRevenue: number,
    pwbTransferRevenue: number,
    payWithPhoneRevenue: number,
    mobileMoneyRevenue: number,
    totalActiveMerchants: number
}

interface Response {
    table: TableData[];
    pagination?: any;
    data?: any;
}

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
}

const COLUMNS: Column<TableData>[] = [
    { id: "reference", label: "TRANSACTION ID" },
    {
        id: "business",
        label: "BUSINESS NAME",
        type: "custom",
        renderCustom: (value) => <p>{value.business.name}</p>,
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`
    },
    {
        id: "type",
        label: "PAYMENT TYPE",
        type: "custom",
        renderCustom: (value) => (
            <p>{value.channel == "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(value.type)}</p>
        ),
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
        id: "created_at",
        label: "DATE CREATED",
        minWidth: 120,
        type: "dateTime",
    },
];

// Enhanced Stat Card Component
interface EnhancedStatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    gradient: string;
    trend?: number;
    isLoading?: boolean;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
                                                               title,
                                                               value,
                                                               icon,
                                                               gradient,
                                                               trend,
                                                               isLoading
                                                           }) => {
    const isPositive = trend !== undefined && trend >= 0;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        );
    }

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background gradient effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />

            <div className="relative z-10">
                {/* Icon and Trend */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg text-white`}>
                        {icon}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isPositive
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}>
                            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {Math.abs(trend).toFixed(1)}%
                        </div>
                    )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {title}
                </h4>

                {/* Value */}
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );
};

// Main Payment Cards Component
const PaymentCards: React.FC = () => {
    const { authState } = useAuth();
    const { setShowSearchQuery } = useUI();
    const [loadingCards, setLoadingCards] = useState(true);
    const [statsData, setStatsData] = useState<any>();
    const [selectedCategory, setSelectedCategory] = useState<CategoryKeys | "all">("all");
    const [currency, setCurrency] = useState<"NGN" | "USD" | "KES">("NGN");
    const [showFilters, setShowFilters] = useState(false);

    const [startDate, setStartDate] = useState<string>(() => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        return twoDaysAgo.toISOString().slice(0, 10);
    });

    const [endDate, setEndDate] = useState<string>(() =>
        new Date().toISOString().slice(0, 10)
    );

    const queryParams = useMemo(() => ({
        start_date: startDate,
        end_date: endDate,
    }), [startDate, endDate]);

    const fetchStats = useCallback(async () => {
        if (!authState.token) return;
        setLoadingCards(true);
        try {
            const response = await axiosInstance.get("/overviewnew", {
                params: queryParams,
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000,
            });
            setStatsData(response.data?.data);
            toast.success("Data refreshed successfully");
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch statistics");
        } finally {
            setLoadingCards(false);
        }
    }, [authState.token, queryParams]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        setShowSearchQuery(false);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    const formatNumber = (amount: number): string => {
        if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
        if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
        return amount.toLocaleString();
    };

    const categories = {
        Transactions: [
            { title: "Card Transaction Value", key: "totalCardTransactionValue", isMoney: true, icon: <FiCreditCard className="w-6 h-6" />, gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
            { title: "PWB Transfer Value", key: "totalPwbTransferValue", isMoney: true, icon: <Wallet className="w-6 h-6" />, gradient: "bg-gradient-to-br from-purple-500 to-purple-600" },
            { title: "Pay with Phone", key: "totalPayWithPhone", isMoney: true, icon: <FiSmartphone className="w-6 h-6" />, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
            { title: "Mobile Money", key: "totalPayWithMobileMoney", isMoney: true, icon: <FiDollarSign className="w-6 h-6" />, gradient: "bg-gradient-to-br from-orange-500 to-orange-600" },
        ],
        Revenue: [
            { title: "Card Revenue", key: "cardRevenue", isMoney: true, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "bg-gradient-to-br from-green-500 to-green-600" },
            { title: "PWB Transfer Revenue", key: "pwbTransferRevenue", isMoney: true, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "bg-gradient-to-br from-teal-500 to-teal-600" },
            { title: "Pay with Phone Revenue", key: "payWithPhoneRevenue", isMoney: true, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
            { title: "Mobile Money Revenue", key: "mobileMoneyRevenue", isMoney: true, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "bg-gradient-to-br from-pink-500 to-pink-600" },
        ],
        Merchants: [
            { title: "Total Merchants", key: "totalMerchants", isMoney: false, icon: <FiUsers className="w-6 h-6" />, gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
            { title: "Active Merchants", key: "totalActiveMerchants", isMoney: false, icon: <CheckCircle2 className="w-6 h-6" />, gradient: "bg-gradient-to-br from-green-500 to-green-600" },
            { title: "Pending Merchants", key: "totalPendingMerchants", isMoney: false, icon: <Clock className="w-6 h-6" />, gradient: "bg-gradient-to-br from-yellow-500 to-yellow-600" },
            { title: "Rejected Merchants", key: "totalRejectedMerchants", isMoney: false, icon: <XCircle className="w-6 h-6" />, gradient: "bg-gradient-to-br from-red-500 to-red-600" },
            { title: "Blacklisted Merchants", key: "totalBlacklistedMerchants", isMoney: false, icon: <AlertCircle className="w-6 h-6" />, gradient: "bg-gradient-to-br from-gray-500 to-gray-600" },
        ],
    } as const;

    type CategoryKeys = keyof typeof categories;
    type CardItem = (typeof categories)[keyof typeof categories][number];

    const getCardValue = (key: string): number => {
        if (selectedCategory === "Merchants") {
            return statsData?.merchantStats?.[key] || 0;
        }
        return statsData?.[currency]?.[key] || 0;
    };

    const filteredCards: CardItem[] =
        selectedCategory === "all"
            ? [...Object.values(categories).flat()]
            : [...(categories[selectedCategory] || [])];

    const currencyOptions = [
        { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
        { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
        { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
    ];

    return (
        <div className="space-y-6">
            {/* Header Card with Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            Payment Metrics Overview
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track your payment performance and merchant statistics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors text-sm"
                        >
                            <FiFilter className="w-4 h-4" />
                            Filters
                            {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={fetchStats}
                            disabled={loadingCards}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
                        >
                            <FiRefreshCcw className={`w-4 h-4 ${loadingCards ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm">
                            <FiDownload className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Layers className="w-4 h-4 inline mr-1" />
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as CategoryKeys | "all")}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Transactions">Transactions</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Merchants">Merchants</option>
                                </select>
                            </div>

                            {/* Currency Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FiDollarSign className="w-4 h-4 inline mr-1" />
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as "NGN" | "USD" | "KES")}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                >
                                    {currencyOptions.map((cur) => (
                                        <option key={cur.code} value={cur.code}>
                                            {cur.flag} {cur.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FiCalendar className="w-4 h-4 inline mr-1" />
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FiCalendar className="w-4 h-4 inline mr-1" />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Date Range Display */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FiActivity className="w-4 h-4" />
                            <span>
                                Showing data from <strong>{new Date(startDate).toLocaleDateString()}</strong> to{" "}
                                <strong>{new Date(endDate).toLocaleDateString()}</strong>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCards.map((card, index) => (
                    <EnhancedStatCard
                        key={index}
                        title={card.title}
                        value={
                            (card.isMoney ? (currency === "NGN" ? "₦" : currency === "USD" ? "$" : "KSh") : "") +
                            formatNumber(getCardValue(card.key))
                        }
                        icon={card.icon}
                        gradient={card.gradient}
                        isLoading={loadingCards}
                    />
                ))}
            </div>
        </div>
    );
};

// Main Homepage Component
export default function Homepage() {
    const { authState } = useAuth();
    const router = useRouter();
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(60, 'days').toDate(),
        endDate: moment().toDate()
    });

    const queryParams = useMemo(() => ({
        start_date: dateRange.startDate.toISOString().split('T')[0],
        end_date: dateRange.endDate.toISOString().split('T')[0],
    }), [dateRange]);

    const [data, setData] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const [modalData, setModalData] = useState<TableData | null>(null);
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<Response>("/finance/transactions", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000
            });
            setData(response.data?.data);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    const handleDateChange = useCallback(({ startDate, endDate }: { startDate: Date, endDate: Date }) => {
        setDateRange({ startDate, endDate });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header headerTitle="Overview" />

            <div className="p-6">
                <PaymentCards />

                {/* Recent Transactions Section */}
                {data && data.table && data.table.length > 0 && (
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Latest payment activities</p>
                            </div>
                        </div>

                        <Table
                            columns={COLUMNS}
                            data={data.table}
                            pagination={pagination}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            loading={loading}
                            onRowClick={(row) => setModalData(row)}
                        />
                    </div>
                )}
            </div>

            {/* Enhanced Transaction Details Modal */}
            <Modal
                isOpen={!!modalData}
                onClose={() => {
                    setModalData(null);
                    setShowGatewayResponse(false);
                }}
                header={
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Transaction Details
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Reference: {modalData?.reference}
                                </p>
                            </div>
                            <Chip variant={modalData?.status || 'pending'}>
                                {modalData?.status}
                            </Chip>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <FiExternalLink className="w-4 h-4" />
                                View Business
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <FiSend className="w-4 h-4" />
                                Resend Webhook
                            </button>
                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                {modalData ? (
                    <div className="space-y-6">
                        {/* Transaction Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <FiDollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {modalData.currency === "NGN" ? "₦" : "$"}{Number(modalData.amount).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                                <FiActivity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fee</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {modalData.currency === "NGN" ? "₦" : "$"}{Number(modalData.fee).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modalData.currency === "NGN" ? "₦" : "$"}{Number(modalData.total).toLocaleString()}
            </p>
        </div>
</div>

{/* Transaction Information */}
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5" />
            Transaction Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction ID</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {modalData.id}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business ID</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business_id}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Currency</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.currency}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction Reference</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {modalData.trx}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Channel</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {StringUtils.capitalizeWords(modalData.channel)}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Type</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.channel === "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(modalData.type)}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gateway</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {StringUtils.capitalizeWords(modalData.gateway)}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP Address</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {modalData.ip_address || "N/A"}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Paid At</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {moment(modalData.paid_at).format('MMM DD, YYYY • h:mm A')}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {moment(modalData.created_at).format('MMM DD, YYYY • h:mm A')}
                </p>
            </div>
            {modalData.settled_at && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Settled At</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {moment(modalData.settled_at).format('MMM DD, YYYY • h:mm A')}
                    </p>
                </div>
            )}
        </div>
    </div>

{/* Business Details */}
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business Name</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.name}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trade Name</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.trade_name || "N/A"}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.biz_email}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.biz_phone}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Country</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.biz_country}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business Type</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {StringUtils.capitalizeWords(modalData.business.business_type)}
                </p>
            </div>
            <div className="space-y-1 md:col-span-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Business Address</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.business.biz_address}
                </p>
            </div>
        </div>
    </div>

{/* Webhook Information */}
{(modalData.webhook_status || modalData.webhook_count > 0) && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiSend className="w-5 h-5" />
                Webhook Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
                    <Chip variant={modalData.webhook_status || 'pending'}>
                        {modalData.webhook_status || 'Pending'}
                    </Chip>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Attempt Count</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {modalData.webhook_count} attempt(s)
                    </p>
                </div>
            </div>
        </div>
    )}

{/* Gateway Response - Collapsible */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
            onClick={() => setShowGatewayResponse(!showGatewayResponse)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    {showGatewayResponse ? <FiEyeOff className="w-5 h-5 text-white" /> : <FiEye className="w-5 h-5 text-white" />}
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Gateway Response
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {showGatewayResponse ? 'Click to hide' : 'Click to view'} detailed response
                    </p>
                </div>
            </div>
            {showGatewayResponse ? (
                <FiChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
                <FiChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
        </button>

        {showGatewayResponse && modalData.gateway_response && (
            <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                                            {typeof modalData.gateway_response === 'string'
                                                ? modalData.gateway_response
                                                : JSON.stringify(modalData.gateway_response, null, 2)}
                                        </pre>
                </div>
            </div>
        )}
    </div>

{/* Settlement Information */}
{modalData.settlement_batchid && (
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Settlement Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Batch ID</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                        {modalData.settlement_batchid}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Settlement Type</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {StringUtils.capitalizeWords(modalData.business.instant_settlement || "Standard")}
                    </p>
                </div>
            </div>
        </div>
    )}

{/* Additional Transaction Metadata */}
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">System Fee</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.currency === "NGN" ? "₦" : "$"}{Number(modalData.sys_fee).toLocaleString()}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stamp Duty</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.currency === "NGN" ? "₦" : "$"}{Number(modalData.stamp_duty).toLocaleString()}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Domain</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.domain || "N/A"}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Card Attempts</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {modalData.card_attempt || 0}
                </p>
            </div>
            {modalData.split_code && (
                <div className="space-y-1 md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Split Code</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                        {modalData.split_code}
                    </p>
                </div>
            )}
        </div>
    </div>
</div>
) : (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading transaction details...</p>
        </div>
    )}
</Modal>
</div>
);
}
