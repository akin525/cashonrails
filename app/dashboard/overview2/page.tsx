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

// Interfaces for API responses
interface OverviewStatsData {
    sumTransaction: number,
    totalTransactions: number,
    totalMerchants: number,
    totalActiveBusiness:number,
    transationSystemFee:number,
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
    totalMerchant:number,
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

interface ChartData {
    date: string;
    count: number;
}

interface Response {
    table: TableData[];
};
interface GatewayResponseData {
    amount: number;
    description: string;
    paymentMethodId: number;
    sessionId: string | null;
    merchantName: string | null;
    settlementId: string;
    customer: {
        id: string;
        transactionId: string;
        createdAt: string;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        metadata: string;
    };
    isEPosTransaction: boolean;
    userId: string | null;
    ePosTransactionReference: string | null;
    cardScheme: string;
    ePosTransactionStan: string | null;
    eposTransactionRrn: string | null;
    terminalId: string | null;
    cardPan: string | null;
    cardExpiryDate: string | null;
    cardHolderName: string | null;
    applicationPanSequenceNumber: string | null;
    id: string;
    merchantId: string;
    businessId: string;
    channel: string;
    callbackUrl: string;
    feeAmount: number;
    businessName: string;
    currency: string;
    status: string;
    statusReason: string | null;
    settlementType: string;
    createdAt: string;
    updatedAt: string;
    settledAt: string;
    orderId: string;
    ngnVirtualBankAccountNumber: string;
    ngnVirtualBankCode: string | null;
    usdVirtualAccountNumber: string;
    usdVirtualBankCode: string | null;
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
        format: (value: number | string) => `₦${Number(value).toLocaleString()}`
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


// Main component to render all cards

const PaymentCards: React.FC = () => {
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const [loadingCards, setLoadingCards] = useState(true);
    const [statsData, setStatsData] = useState<any>();
    const [selectedCategory, setSelectedCategory] = useState<CategoryKeys | "all">("all");
    const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

    // Local state for date selection
    const [startDate, setStartDate] = useState<string>(() =>
        filterState.dateRange?.startDate ||
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );

    const [endDate, setEndDate] = useState<string>(() =>
        filterState.dateRange?.endDate || new Date().toISOString().slice(0, 10)
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
        } catch (error) {
            console.error("Error fetching data:", error);
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
            { title: "Total Card Transaction Value", key: "totalCardTransactionValue", isMoney: true },
            { title: "Total PWB Transfer Value", key: "totalPwbTransferValue", isMoney: true },
            { title: "Total Pay with Phone", key: "totalPayWithPhone", isMoney: true },
            { title: "Total Pay with Mobile Money", key: "totalPayWithMobileMoney", isMoney: true },
        ],
        Revenue: [
            { title: "Card Revenue", key: "cardRevenue", isMoney: true },
            { title: "PWB Transfer Revenue", key: "pwbTransferRevenue", isMoney: true },
            { title: "Pay with Phone Revenue", key: "payWithPhoneRevenue", isMoney: true },
            { title: "Mobile Money Revenue", key: "mobileMoneyRevenue", isMoney: true },
        ],
        Merchants: [
            { title: "Total Merchants", key: "totalMerchants", isMoney: false },
            { title: "Total Active Merchants", key: "totalActiveMerchants", isMoney: false },
            { title: "Total Pending Merchants", key: "totalPendingMerchants", isMoney: false },
            { title: "Total Rejected Merchants", key: "totalRejectedMerchants", isMoney: false },
            { title: "Total Blacklisted Merchants", key: "totalBlacklistedMerchants", isMoney: false },
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

    return (
        <div className="p-4">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as "NGN" | "USD")}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm"
                    >
                        <option value="NGN">Naira (₦)</option>
                        <option value="USD">Dollar ($)</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as CategoryKeys | "all")}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm"
                    >
                        <option value="all">All Categories</option>
                        <option value="Transactions">Transactions</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Merchants">Merchants</option>
                    </select>
                </div>

                {/* Date & Refresh Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm text-gray-600">Start:</label>
                    <input
                        type="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label className="text-sm text-gray-600">End:</label>
                    <input
                        type="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <button
                        onClick={fetchStats}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                        <FiRefreshCcw className="mr-1" /> Refresh
                    </button>
                </div>
            </div>

            {/* Selected Range Display */}
            <p className="text-sm text-gray-600 mb-4">
                Showing stats from <strong>{new Date(startDate).toLocaleDateString()}</strong> to{" "}
                <strong>{new Date(endDate).toLocaleDateString()}</strong>
            </p>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCards.map((card, index) => (
                    <MetricCard
                        key={index}
                        count={
                            (card.isMoney ? (currency === "NGN" ? "₦" : "$") : "") +
                            formatNumber(getCardValue(card.key))
                        }
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

    const queryParams = useMemo(() => ({
        start_date: dateRange.startDate.toISOString().split('T')[0],
        end_date: dateRange.endDate.toISOString().split('T')[0],
    }), [dateRange]);

    const [data, setData] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });

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
    const handleDateChange = useCallback(({ startDate, endDate }: { startDate: Date, endDate: Date }) => {
        console.log("startDate from overview", startDate)
        setDateRange({ startDate, endDate });
    }, []);

    const [modalData, setModalData] = useState<TableData | null>(null)
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);



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
                            <Buttons label="Resend Notification" fullWidth type="smOutlineButton" />
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
                                <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.fee}</p>
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
                                <p className="text-sm text-gray-600"><strong>Channel:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.channel}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.status}</p>
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
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600"><strong>Gateway Response Code:</strong></p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {modalData.gateway_response ?? "N/A"}
                                            </p>
                                        </div>
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Gateway Response Message:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.responseMessage ?? "N/A"}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Provider:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.provider ?? "N/A"}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Transaction Status:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.status ?? "N/A"}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading transaction details...</p>
                )}
            </Modal>
            {/*<div className="space-y-4 mt-5 p-2">*/}
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

                {/*<div className="col-span-2 p-4">*/}
                {/*    <Table<TableData>*/}
                {/*        headers={COLUMNS}*/}
                {/*        data={data?.table || []}*/}
                {/*        limit={pagination.limit}*/}
                {/*        loading={loading}*/}
                {/*        // onRowClick={(row) => router.push(`/dashboard/finance/transactions/${row.id}` as RouteLiteral)}*/}
                {/*        onRowClick={(row) => setModalData(row)} // Handle row click*/}
                {/*        pagination={pagination}*/}
                {/*        onPaginate={setCurrentPage}*/}
                {/*    />*/}

                {/*</div>*/}
            {/*</div>*/}
        </div>
    );
}