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
import {string} from "postcss-selector-parser";
import {FiRefreshCcw} from "react-icons/fi";
import {Tooltip} from "@/components/utils";

// Interfaces for API responses

interface Response {
    table: TableData[];
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
    gateway_response: string; // JSON string
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
    // { id: "merchant", label: "MERCHANT NAME" },
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
                {row.currency === 'NGN' ? '₦' : row.currency === 'USD' ? '$' : row.currency === 'KES' ? 'KSh': row.currency === "USDT" ? 'USDT' : ''}
                {Number(row.amount).toLocaleString()}
            </p>
        )

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
}

// Constants
const CURRENCIES: Array<{ code: Currency; symbol: string; label: string }> = [
    { code: 'NGN', symbol: '₦', label: 'NGN' },
    { code: 'USD', symbol: '$', label: 'USD' },
    { code: 'KES', symbol: 'KSh', label: 'KES' },
    { code: 'USDT', symbol: 'USDT', label: 'USDT' },
    { code: 'ZAR', symbol: 'R', label: 'ZAR' },
    { code: 'XOF', symbol: 'CFA', label: 'XOF' },
    { code: 'XAF', symbol: 'FCFA', label: 'XAF' },
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
            } finally {
                setLoadingCards(false);
            }
        },
        [authToken]
    );

    return { statsData, loadingCards, error, fetchStats };
};
// Main component to render all cards
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

    const { statsData, loadingCards, error, fetchStats } = usePaymentStats(authState.token);

    // Fetch stats on mount and when dates change
    useEffect(() => {
        fetchStats(startDate, endDate);
    }, [fetchStats, startDate, endDate]);

    // Hide search query on mount/unmount
    useEffect(() => {
        setShowSearchQuery(false);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    // Prepare card data
    const cards: MetricCardData[] = useMemo(() => {
        const currentCurrencyData = statsData?.[currency] || {};
        const generalData = statsData?.general || {};
        const symbol = getCurrencySymbol(currency);

        return [
            { title: 'Sum Transactions', count: `${symbol}${formatNumber(currentCurrencyData.sumTransaction || 0)}` },
            { title: 'Total Transactions', count: formatNumber(currentCurrencyData.totalTransactions || 0) },
            { title: 'Total Active Business', count: formatNumber(currentCurrencyData.totalActiveBusiness || 0) },
            { title: 'Transaction Fee', count: `${symbol}${formatNumber(currentCurrencyData.transactionFee || 0)}` },
            { title: 'Transaction System Fee', count: `${symbol}${formatNumber(currentCurrencyData.transactionSystemFee || 0)}` },
            { title: 'Payout Fee', count: `${symbol}${formatNumber(currentCurrencyData.payoutFee || 0)}` },
            { title: 'Payout System Fee', count: `${symbol}${formatNumber(currentCurrencyData.payoutSystemFee || 0)}` },
            { title: 'Total Merchants', count: formatNumber(generalData.totalMerchant || 0) },
            { title: 'Total Business', count: formatNumber(generalData.totalBusiness || 0) },
            { title: 'Total Payout', count: `${symbol}${formatNumber(currentCurrencyData.totalPayout || 0)}` },
            { title: 'Total Payout (Count)', count: formatNumber(currentCurrencyData.totalPayoutCount || 0) },
            { title: 'Transaction Revenue', count: `${symbol}${formatNumber(currentCurrencyData.transactionRevenue || 0)}` },
            { title: 'Payout Revenue', count: `${symbol}${formatNumber(currentCurrencyData.payoutRevenue || 0)}` },
        ];
    }, [statsData, currency]);

    const handleApplyDateRange = () => {
        fetchStats(startDate, endDate);
    };

    return (
        <div className="p-4 space-y-4">
            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Refresh & Currency Selector */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => fetchStats(startDate, endDate)}
                        disabled={loadingCards}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Refresh statistics"
                    >
                        <FiRefreshCcw className={`mr-2 ${loadingCards ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    {CURRENCIES.map(({ code, symbol, label }) => (
                        <button
                            key={code}
                            onClick={() => setCurrency(code)}
                            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                currency === code
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            aria-label={`Select ${label} currency`}
                        >
                            {symbol} {label}
                        </button>
                    ))}
                </div>

                {/* Date Range Picker */}
                <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                        Start:
                    </label>
                    <input
                        id="start-date"
                        type="date"
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate}
                    />

                    <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
                        End:
                    </label>
                    <input
                        id="end-date"
                        type="date"
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={new Date().toISOString().slice(0, 10)}
                    />

                    <button
                        onClick={handleApplyDateRange}
                        disabled={loadingCards}
                        className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Date Range Display */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing stats from <strong>{new Date(startDate).toLocaleDateString()}</strong> to{' '}
                    <strong>{new Date(endDate).toLocaleDateString()}</strong>
                </p>
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded" role="alert">
                        {error}
                    </p>
                )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <MetricCard
                        key={`${card.title}-${index}`}
                        count={card.count}
                        title={card.title}
                        isLoading={loadingCards}
                        variant="success"
                    />
                ))}
            </div>
        </div>
    );
};
export default function Homepage() {
    const { authState } = useAuth();
    const router = useRouter()
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(60, 'days').toDate(),
        endDate: moment().toDate()
    });
    const userRole = authState.userDetails?.role || "admin"; // Default to "admin" if undefined

    const queryParams = useMemo(() => ({
        start_date: dateRange.startDate.toISOString().split('T')[0],
        end_date: dateRange.endDate.toISOString().split('T')[0],
    }), [dateRange]);

    const [data, setData] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<Response>("/finance/transactions", {
                params: { ...queryParams, page, limit: pagination.limit },
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
    // const handleDateChange = useCallback(({ startDate, endDate }: { startDate: Date, endDate: Date }) => {
    //     console.log("startDate from overview", startDate)
    //     setDateRange({ startDate, endDate });
    // }, []);

    const [modalData, setModalData] = useState<TableData | null>(null)
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);


    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            console.error("Missing businessId or transactionId");
            return;
        }


        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_transaction_webhook/${businessId}/live/${transactionId}`,
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
    }; // Fix dependency array

    // if (userRole !== "superadmin") {
    //     return (
    //         <div className="flex flex-col items-center justify-center h-screen text-center p-6">
    //             <h1 className="text-3xl font-bold text-gray-800 mb-4">Permission Not Assigned</h1>
    //             <p className="text-gray-600 mb-6">You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.</p>
    //             <button
    //                 // onClick={() => router.push("/dashboard")}
    //                 className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
    //             >
    //                 Go Back to Dashboard
    //             </button>
    //         </div>
    //     );
    // }
    return (
        <div className="h-full min-h-screen">
            <Header headerTitle="Overview" />
            <PaymentCards />
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Transaction Details</h2>
                        <div className="flex gap-4">
                            <Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />
                            <Buttons
                                onClick={() => resendwebhook(modalData?.business_id as any, modalData?.id)}
                                label={loading ? "Sending..." : "Resend Notification"}
                                fullWidth
                                type="smOutlineButton"
                                disabled={loading}
                            />
                            </div>
                    </div>
                }
                scrollableContent={true}
            >
                {modalData ? (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Transaction Fields */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.id}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.business_id}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Currency:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.currency}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.amount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Request Amount:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.requested_amount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.fee}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>System Fee:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.sys_fee}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Stamp Duty:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.stamp_duty}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Card Attempt:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.card_attempt}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Total:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.total}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Transaction Reference:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.trx}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.reference}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Type:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.type}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Channel:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.channel}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.status}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>webhook Status:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.webhook_status}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>webhook Count:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.webhook_count}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Paid At:</strong></p>
                                <p className="text-sm font-medium text-gray-800">
                                    {moment(modalData.paid_at).format('MMMM Do YYYY, h:mm:ss a')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Created At:</strong></p>
                                <p className="text-sm font-medium text-gray-800">
                                    {moment(modalData.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                                </p>
                            </div>
                        </div>

                        {/* Business Details */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800">Business Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Business Name:</strong></p>
                                    <p className="text-sm font-medium text-gray-800">{modalData.business.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Business Email:</strong></p>
                                    <p className="text-sm font-medium text-gray-800">{modalData.business.biz_email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Business Phone:</strong></p>
                                    <p className="text-sm font-medium text-gray-800">{modalData.business.biz_phone}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600"><strong>Business Address:</strong></p>
                                    <p className="text-sm font-medium text-gray-800">{modalData.business.biz_address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Gateway Response Section */}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showGatewayResponse && modalData.gateway_response && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <pre className="text-sm text-gray-800">{JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading transaction details...</p>
                )}
            </Modal>
            <div className="space-y-4 mt-5 p-2">
                {/*<div className="flex justify-between items-center flex-wrap gap-2">*/}
                {/*    <h2 className="text-2xl font-normal">Recent Transaction</h2>*/}
                {/*    <DateRangeSelector*/}
                {/*        defaultRelativeRangeValue="7d"*/}
                {/*        onRelativeRangeChange={handleDateChange}*/}
                {/*        startDate={dateRange.startDate}*/}
                {/*        endDate={dateRange.endDate}*/}
                {/*        onDateChange={handleDateChange}*/}
                {/*    />*/}
                {/*</div>*/}

                <div className="col-span-2 p-4">
                    <Table<TableData>
                        headers={COLUMNS}
                        data={data?.table || []}
                        limit={pagination.limit}
                        loading={loading}
                        // onRowClick={(row) => router.push(`/dashboard/finance/transactions/${row.id}` as RouteLiteral)}
                        onRowClick={(row) => setModalData(row)} // Handle row click
                        pagination={pagination}
                        onPaginate={setCurrentPage}
                    />

                </div>
            </div>
        </div>
    );
}