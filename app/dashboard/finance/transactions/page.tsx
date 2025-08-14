"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import {
    ActiveShopIcon,
    DisabledShopIcon,
    NormalShopIcon,
} from '@/public/assets/icons';

import Table, { Column } from '@/components/table';
import { Chip, ChipVariant } from '@/components/chip';
import Tooltip from '@/components/tooltip';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import { useAuth } from '@/contexts/authContext';
import { MetricCardSkeleton } from '@/components/loaders';
import Header from './Header';
import { StringUtils } from '@/helpers/extras';
import moment from 'moment';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import {FileSpreadsheet, PackageSearch} from "lucide-react";
import toast from "react-hot-toast";
import {string} from "postcss-selector-parser";
import {debounce} from "next/dist/server/utils";



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

// Page Component
const Page: React.FC = () => {
    const router = useRouter()
    const { setShowHeader, setShowSearchQuery, setHeaderTitle, filterState } = useUI();
    const [data, setData] = useState<Response | undefined>(undefined);
    const [data1, setData1] = useState<Response | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
    const [pagination1, setPagination1] = useState({ totalItems: 0, totalPages: 1, limit: 100 });
    const { authState } = useAuth()
    const typedFilterState = filterState as FilterState;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);

// Filter data based on search input



    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
        search: searchQuery, // Add search parameter
    }), [filterState, searchQuery]);
    const handleSearch = useCallback(() => {
        // Reset to first page when searching
        setCurrentPage(1);
        fetchData(1);
    }, []);

    // Debounce the search handler
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
                    reference: searchQuery // Include search in API call
                },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000
            });
            setData(response.data?.data);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit, searchQuery]); // Add searchQuery to dependencies

    // Update search input handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        debouncedSearch();
    };

    // Clean up debounce on unmount
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
            setShowModal(false); // Close modal

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
                    title: "Total Transactions",
                    count:  formatCurrency(stats.total),

                },
                {
                    title: "Total Amount Processed",
                    count:  formatCurrency(stats.amount_processed),

                },
                {
                    title: "Successful Transactions",
                    count:  formatCurrency(stats.amount_success),

                },
                {
                    title: "Pending Transactions",
                    count:  formatCurrency(stats.amount_pending), //pending needed

                },
                {
                    title: "Failed Transactions",
                    count: formatCurrency(stats.amount_fail),

                },
            ];


            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5 p-2">
                    {CARD_CONFIGS.map((card, index) => (
                        <MetricCard
                            key={index}
                            count={card.count}
                            title={card.title}
                            isLoading={isLoading}
                            variant="success"
                        />
                    ))}
                </div>
            );
        };

    const [modalData, setModalData] = useState<TableData | null>(null)
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-500">Transaction Details</h2>
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
                                <p className="text-sm text-gray-600"><strong>Gateway:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.gateway}</p>
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
            <Header headerTitle={'Transactions'} />

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
            <div className="p-4 mt-4">
                {/* Search Input */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search Transactions"
                        value={searchQuery}
                        onChange={handleSearchChange} // Use the new handler
                        className="border-2 border-green-400 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold m-2"
                    />

                    {/* Flex container for buttons */}
                    <div className="flex items-center gap-2 m-2">
                        <button onClick={handleRefresh} disabled={loading}
                                className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md">
                            {loading ? <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                            </svg> : "Refresh"}
                        </button>

                        {/* Open Export Modal */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            <FileSpreadsheet className="w-5 h-5"/>
                            <span>Export All to CSV</span>
                        </button>

                        <button
                            onClick={() => router.push(`/dashboard/finance/search-transaction` as RouteLiteral)}
                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            <PackageSearch className="w-5 h-5"/>
                            <span>Search General Transaction</span>
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                <Table
                    headers={COLUMNS}
                    data={data?.table || []}
                    limit={pagination.limit}
                    loading={loading}
                    onRowClick={(row) => setModalData(row)}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                />

                {/* Export Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-4">Export Transactions</h2>

                            <label className="block font-medium">Start Date:</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                   className="border p-2 w-full rounded mb-2"/>

                            <label className="block font-medium">End Date:</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                   className="border p-2 w-full rounded mb-2"/>

                            <div className="flex justify-end mt-4">
                                <button className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
                                        onClick={() => setShowModal(false)}>Cancel
                                </button>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-md" onClick={exportToMail}>
                                    {loading ? <svg
                                        className="w-5 h-5 animate-spin"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                                    </svg> : "Export"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Page;
