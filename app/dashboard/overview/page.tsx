"use client";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { FilterState, useUI } from '@/contexts/uiContext';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import { ChevronIcon } from '@/assets/icons';
import moment from 'moment';
import Header from './Header';
import { CardSkeleton } from '@/components/loaders';
import axiosInstance from '@/helpers/axiosInstance';
import { useFetchHook } from '@/helpers/globalRequests';
import React from 'react';
import AreaChart from '@/components/charts/AreaChart';
import LineChart from '@/components/charts/AreaChart';
import ZoomableLineChart from '@/components/charts/LineChart';
import toast from 'react-hot-toast';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import { Chip } from '@/components/chip';
import Table, { Column } from '@/components/table';
import { StringUtils } from '@/helpers/extras';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import router from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import { string } from "postcss-selector-parser";
import { FiRefreshCcw, FiCalendar, FiTrendingUp, FiDollarSign, FiActivity } from "react-icons/fi";
import { Tooltip } from "@/components/utils";
import {
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download,
    Search,
    Eye,
    Send,
    Building2,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react';

// Interfaces for API responses
interface Response {
    table: TableData[];
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
    {
        id: "reference", label: "TRANSACTION ID",
    },
    {
        id: "business", label: "BUSINESS NAME",
        type: "custom",
        renderCustom: (value) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {value.business.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <span className="font-medium">{value.business.name}</span>
            </div>
        ),
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        type: "custom",
        renderCustom: (row: TableData) => (
            <div className="font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                    {row.currency === 'NGN' ? '₦' : row.currency === 'USD' ? '$' : row.currency === 'KES' ? 'KSh' : row.currency === "USDT" ? 'USDT' : ''}
                </span>
                {Number(row.amount).toLocaleString()}
            </div>
        )
    },
    {
        id: "type", label: "PAYMENT TYPE",
        type: "custom",
        renderCustom: (value) => (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {value.channel == "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(value.type)}
            </span>
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
        id: "created_at", label: "DATE CREATED", minWidth: 120,
        type: "dateTime",
    },
];

type Currency = 'NGN' | 'USD' | 'KES' | 'USDT' | 'ZAR' | 'XOF' | 'XAF';

interface CurrencyData {
    sumTransaction?: number;
    totalTransactions?: number;
    totalActiveBusiness?: number;
    transactionFee?: number;
    transactionSystemFee?: number;
    payoutFee?: number;
    payoutSystemFee?: number;
    totalPayout?: number;
    totalPayoutCount?: number;
    transactionRevenue?: number;
    payoutRevenue?: number;
}

interface GeneralData {
    totalMerchant?: number;
    totalBusiness?: number;
}

interface StatsData {
    NGN?: CurrencyData;
    USD?: CurrencyData;
    KES?: CurrencyData;
    USDT?: CurrencyData;
    ZAR?: CurrencyData;
    XOF?: CurrencyData;
    XAF?: CurrencyData;
    general?: GeneralData;
}

interface MetricCardData {
    title: string;
    count: string;
    icon?: React.ReactNode;
    trend?: number;
}

// Constants
const CURRENCIES: Array<{ code: Currency; symbol: string; label: string; color: string }> = [
    { code: 'NGN', symbol: '₦', label: 'NGN', color: 'emerald' },
    { code: 'USD', symbol: '$', label: 'USD', color: 'blue' },
    { code: 'KES', symbol: 'KSh', label: 'KES', color: 'purple' },
    { code: 'USDT', symbol: 'USDT', label: 'USDT', color: 'teal' },
    { code: 'ZAR', symbol: 'R', label: 'ZAR', color: 'orange' },
    { code: 'XOF', symbol: 'CFA', label: 'XOF', color: 'pink' },
    { code: 'XAF', symbol: 'FCFA', label: 'XAF', color: 'indigo' },
];

const DEFAULT_DAYS_BACK = 7;
const API_TIMEOUT = 900000;

// Utility Functions
const getDefaultDateRange = () => {
    const endDate = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().slice(0, 10);
    return { startDate, endDate };
};

const formatNumber = (amount: number): string => {
    if (amount >= 1_000_000_000_000) return `${(amount / 1_000_000_000_000).toFixed(2)}T`;
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
    return amount.toLocaleString();
};

const getCurrencySymbol = (currency: Currency): string => {
    return CURRENCIES.find((c) => c.code === currency)?.symbol || '';
};

// Custom Hook for Stats
const usePaymentStats = (authToken: string | null) => {
    const [statsData, setStatsData] = useState<StatsData>({});
    const [loadingCards, setLoadingCards] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(
        async (startDate: string, endDate: string) => {
            if (!authToken) return;

            setLoadingCards(true);
            setError(null);

            try {
                const response = await axiosInstance.get('/overview', {
                    params: { start_date: startDate, end_date: endDate },
                    headers: { Authorization: `Bearer ${authToken}` },
                    timeout: API_TIMEOUT,
                });
                setStatsData(response.data?.data || {});
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError('Failed to fetch statistics. Please try again.');
                toast.error('Failed to fetch statistics');
            } finally {
                setLoadingCards(false);
            }
        },
        [authToken]
    );

    return { statsData, loadingCards, error, fetchStats };
};

// Enhanced Metric Card Component
const EnhancedMetricCard: React.FC<{
    title: string;
    count: string;
    icon?: React.ReactNode;
    trend?: number;
    isLoading?: boolean;
}> = ({ title, count, icon, trend, isLoading }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
                        </div>
                    )}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                )}
            </div>
        </div>
    );
};

// Main Stats Component
const PaymentCards: React.FC = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();

    const defaultDates = getDefaultDateRange();
    const [currency, setCurrency] = useState<Currency>('NGN');
    const [startDate, setStartDate] = useState<string>(
        filterState.dateRange?.startDate || defaultDates.startDate
    );
    const [endDate, setEndDate] = useState<string>(
        filterState.dateRange?.endDate || defaultDates.endDate
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { statsData, loadingCards, error, fetchStats } = usePaymentStats(authState.token);

    useEffect(() => {
        fetchStats(startDate, endDate);
    }, [fetchStats, startDate, endDate]);

    useEffect(() => {
        setShowSearchQuery(false);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    const cards: MetricCardData[] = useMemo(() => {
        const currentCurrencyData = statsData?.[currency] || {};
        const generalData = statsData?.general || {};
        const symbol = getCurrencySymbol(currency);

        return [
            {
                title: 'Total Transaction Value',
                count: `${symbol}${formatNumber(currentCurrencyData.sumTransaction || 0)}`,
                icon: <FiDollarSign className="w-5 h-5" />,
            },
            {
                title: 'Total Transactions',
                count: formatNumber(currentCurrencyData.totalTransactions || 0),
                icon: <FiActivity className="w-5 h-5" />,
            },
            {
                title: 'Active Businesses',
                count: formatNumber(currentCurrencyData.totalActiveBusiness || 0),
                icon: <Building2 className="w-5 h-5" />,
            },
            {
                title: 'Transaction Fee',
                count: `${symbol}${formatNumber(currentCurrencyData.transactionFee || 0)}`,
                icon: <FiTrendingUp className="w-5 h-5" />,
            },
            {
                title: 'Transaction System Fee',
                count: `${symbol}${formatNumber(currentCurrencyData.transactionSystemFee || 0)}`,
                icon: <FiDollarSign className="w-5 h-5" />,
            },
            {
                title: 'Payout Fee',
                count: `${symbol}${formatNumber(currentCurrencyData.payoutFee || 0)}`,
                icon: <FiDollarSign className="w-5 h-5" />,
            },
            {
                title: 'Payout System Fee',
                count: `${symbol}${formatNumber(currentCurrencyData.payoutSystemFee || 0)}`,
                icon: <FiDollarSign className="w-5 h-5" />,
            },
            {
                title: 'Total Merchants',
                count: formatNumber(generalData.totalMerchant || 0),
                icon: <Building2 className="w-5 h-5" />,
            },
            {
                title: 'Total Businesses',
                count: formatNumber(generalData.totalBusiness || 0),
                icon: <Building2 className="w-5 h-5" />,
            },
            {
                title: 'Total Payout',
                count: `${symbol}${formatNumber(currentCurrencyData.totalPayout || 0)}`,
                icon: <FiDollarSign className="w-5 h-5" />,
            },
            {
                title: 'Payout Count',
                count: formatNumber(currentCurrencyData.totalPayoutCount || 0),
                icon: <FiActivity className="w-5 h-5" />,
            },
            {
                title: 'Transaction Revenue',
                count: `${symbol}${formatNumber(currentCurrencyData.transactionRevenue || 0)}`,
                icon: <FiTrendingUp className="w-5 h-5" />,
            },
            {
                title: 'Payout Revenue',
                count: `${symbol}${formatNumber(currentCurrencyData.payoutRevenue || 0)}`,
                icon: <FiTrendingUp className="w-5 h-5" />,
            },
        ];
    }, [statsData, currency]);

    const handleApplyDateRange = () => {
        fetchStats(startDate, endDate);
        setShowDatePicker(false);
        toast.success('Date range updated');
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header Section with Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Left Side - Title & Date Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {' '}-{' '}
                                {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchStats(startDate, endDate)}
                            disabled={loadingCards}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiRefreshCcw className={`w-4 h-4 ${loadingCards ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        {/* Date Range Button */}
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                            <FiCalendar className="w-4 h-4" />
                            Date Range
                            {showDatePicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Collapsible Date Picker */}
                {showDatePicker && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    max={endDate}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    max={new Date().toISOString().slice(0, 10)}
                                />
                            </div>

                            <button
                                onClick={handleApplyDateRange}
                                disabled={loadingCards}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Currency Selector */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {CURRENCIES.map(({ code, symbol, label }) => (
                        <button
                            key={code}
                            onClick={() => setCurrency(code)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                currency === code
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {symbol} {label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <EnhancedMetricCard
                        key={`$${card.title}-$$ {index}`}
                        title={card.title}
                        count={card.count}
                        icon={card.icon}
                        isLoading={loadingCards}
                    />
                ))}
            </div>
        </div>
    );
};

export default function Homepage() {
    const { authState } = useAuth();
    const router = useRouter();
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(60, 'days').toDate(),
        endDate: moment().toDate()
    });
    const userRole = authState.userDetails?.role || "admin";

    const queryParams = useMemo(() => ({
        start_date: dateRange.startDate.toISOString().split('T')[0],
        end_date: dateRange.endDate.toISOString().split('T')[0],
    }), [dateRange]);

    const [data, setData] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
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

    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            toast.error("Missing business or transaction ID");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_transaction_webhook/$${businessId}/live/$$ {transactionId}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000
                }
            );
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error resending webhook:", error);
            toast.error("Failed to resend webhook");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header headerTitle="Overview" />

            <PaymentCards />

            {/* Recent Transactions Section */}
            <div className="p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Section Header */}
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Latest payment activities across all businesses
                                </p>
                            </div>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <Table<TableData>
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

            {/* Transaction Detail Modal */}
            <Modal
                isOpen={!!modalData}
                onClose={() => {
                    setModalData(null);
                    setShowGatewayResponse(false);
                }}
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">#{modalData?.reference}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover
:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                View Business
                            </button>
                            <button
                                onClick={() => resendwebhook(modalData?.business_id as any, modalData?.id)}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? "Sending..." : "Resend Webhook"}
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
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Amount</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modalData.currency === 'NGN' ? '₦' : modalData.currency === 'USD' ? '$' : modalData.currency === 'KES' ? 'KSh' : modalData.currency === "USDT" ? 'USDT' : ''}
                                    {Number(modalData.amount).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Status</p>
                                <Chip variant={modalData.status}>{modalData.status}</Chip>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Fee</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {modalData.currency === 'NGN' ? '₦' : modalData.currency === 'USD' ? '$' : ''}
                                    {Number(modalData.fee).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Transaction Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <FiActivity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Transaction Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Transaction ID" value={modalData.id} />
                                <InfoItem label="Reference" value={modalData.reference} />
                                <InfoItem label="Transaction Ref" value={modalData.trx} />
                                <InfoItem label="Business ID" value={modalData.business_id.toString()} />
                                <InfoItem label="Currency" value={modalData.currency} />
                                <InfoItem label="Requested Amount" value={`${modalData.currency === 'NGN' ? '₦' : '$'}${Number(modalData.requested_amount).toLocaleString()}`} />
                                <InfoItem label="System Fee" value={`${modalData.currency === 'NGN' ? '₦' : '$'}${Number(modalData.sys_fee).toLocaleString()}`} />
                                <InfoItem label="Stamp Duty" value={`${modalData.currency === 'NGN' ? '₦' : '$'}${Number(modalData.stamp_duty).toLocaleString()}`} />
                                <InfoItem label="Total" value={`${modalData.currency === 'NGN' ? '₦' : '$'}${Number(modalData.total).toLocaleString()}`} />
                                <InfoItem label="Payment Type" value={modalData.channel === "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(modalData.type)} />
                                <InfoItem label="Channel" value={StringUtils.capitalizeWords(modalData.channel)} />
                                <InfoItem label="Gateway" value={modalData.gateway} />
                                <InfoItem label="Card Attempts" value={modalData.card_attempt.toString()} />
                                <InfoItem label="IP Address" value={modalData.ip_address} />
                                <InfoItem
                                    label="Webhook Status"
                                    value={modalData.webhook_status || 'N/A'}
                                    highlight={modalData.webhook_status === 'success' ? 'green' : modalData.webhook_status === 'failed' ? 'red' : undefined}
                                />
                                <InfoItem label="Webhook Count" value={modalData.webhook_count.toString()} />
                                <InfoItem
                                    label="Paid At"
                                    value={moment(modalData.paid_at).format('MMM DD, YYYY • h:mm A')}
                                />
                                <InfoItem
                                    label="Created At"
                                    value={moment(modalData.created_at).format('MMM DD, YYYY • h:mm A')}
                                />
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Business Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Business Name" value={modalData.business.name} />
                                <InfoItem label="Trade Name" value={modalData.business.trade_name} />
                                <InfoItem label="Email" value={modalData.business.biz_email} />
                                <InfoItem label="Phone" value={modalData.business.biz_phone} />
                                <InfoItem label="Business Type" value={StringUtils.capitalizeWords(modalData.business.business_type)} />
                                <InfoItem label="Country" value={modalData.business.biz_country} />
                                <InfoItem label="Address" value={modalData.business.biz_address} colSpan={2} />
                            </div>
                        </div>

                        {/* Gateway Response - Collapsible */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                                className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        Gateway Response
                                    </span>
                                </div>
                                {showGatewayResponse ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {showGatewayResponse && modalData.gateway_response && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                    <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

// Helper Component for Info Items
const InfoItem: React.FC<{
    label: string;
    value: string;
    colSpan?: number;
    highlight?: 'green' | 'red' | 'yellow';
}> = ({ label, value, colSpan = 1, highlight }) => {
    const highlightColors = {
        green: 'text-green-600 dark:text-green-400 font-semibold',
        red: 'text-red-600 dark:text-red-400 font-semibold',
        yellow: 'text-yellow-600 dark:text-yellow-400 font-semibold',
    };

    return (
        <div className={`${colSpan === 2 ? 'md:col-span-2' : ''}`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-sm font-medium ${highlight ? highlightColors[highlight] : 'text-gray-900 dark:text-white'} break-words`}>
                {value}
            </p>
        </div>
    );
};
