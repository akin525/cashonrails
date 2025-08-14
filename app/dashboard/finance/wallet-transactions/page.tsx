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
import toast from 'react-hot-toast';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import moment from 'moment';
import { StringUtils } from '@/helpers/extras';
import {FileSpreadsheet} from "lucide-react";


interface StatsData {
    total: number,
    amount_pending: number,
    amount_processed: number,
    amount_success: number,
    amount_fail: number
}

// Define the Summary interface
interface Summary {
    total_transactions_count: number;
    total_transaction_value: number;
    total_revenue: number;
}

// Define the Business interface
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
    chargeback_email: string;
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
    summary: Summary; // Nested summary object
}

// Define the main interface that includes the Business
interface TableData {
    id: string;
    business_id: number;
    wallet_id: number;
    source: string;
    type: string;
    currency: string;
    domain: string;
    amount: string;
    note: string;
    bal_before: string;
    bal_after: string;
    status: string;
    reference: string;
    created_at: string;
    updated_at: string;
    business: Business; // Nested business object
}

interface CombinedResponse {
    stats: StatsData;
    table: TableData[];
}

type FilterStatus = 'all' | 'active' | 'inactive';


// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
    { id: "reference", label: "REFERENCE" },
    { id: "amount", label: "AMOUNT" },
    { id: "bal_before", label: "BALANCE BEFORE", type:"amount"},
    { id: "bal_after", label: "BALANCE AFTER" , type:"amount"},
    { id: "type", label: "TYPE" },
    { id: "source", label: "SOURCE" },

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
// Helper function to format numbers to K, M, B
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

    const cardConfigs: MetricCardProps[] = [
        {
            title: "Total",
            count: formatCurrency(stats.total),
        },
        {
            title: "Processed",
            count: formatCurrency(stats.amount_processed),
        },
        {
            title: "Pending",
            count: formatCurrency(stats.amount_pending),
        },
        {
            title: "Successful",
            count: formatCurrency(stats.amount_success),
        },
        {
            title: "Failed",
            count: formatCurrency(stats.amount_fail),
        },
    ];
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5 px-2.5">
                {cardConfigs.map((card, index) => (
                    <MetricCard key={index} {...card} isLoading={isLoading} variant='success'  />
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
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
    const [data, setData] = useState<CombinedResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [businesid, setBusinessId] = useState("");

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
        await fetchData(currentPage, searchQuery);
        setLoading(false);
    };
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);

    const fetchData = useCallback(async (page: number, search: string) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/wallet-transaction", {
                params: { ...queryParams, page, limit: pagination.limit, search },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });
            if (response.data.status && response.data.data) {
                setData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch transactions');
            }
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);

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

    const [modalData, setModalData] = useState<TableData | null>(null)

    const exportToMail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post('/export/export-wallet-all',
                {
                    start_date: startDate || null,
                    end_date: endDate || null
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout:60000,
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

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Wallet Transaction Details</h2>
                            <Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />
                    </div>
                }
                scrollableContent={true}
            >

                {modalData ? (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* TableData Fields */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.id}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business_id}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.currency} {StringUtils.formatWithCommas(modalData.amount)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{StringUtils.capitalizeWords(modalData.status)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Date:</strong></p>
                                <p className="text-sm font-normal text-gray-800">
                                    {moment(modalData.created_at).format('MMMM Do YYYY')}
                                    <br />
                                    {moment(modalData.created_at).format('h:mm:ss a')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.reference}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Source:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.source}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Domain:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.domain}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Note:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.note || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Updated At:</strong></p>
                                <p className="text-sm font-normal text-gray-800">
                                    {moment(modalData.updated_at).format('MMMM Do YYYY')}
                                    <br />
                                    {moment(modalData.updated_at).format('h:mm:ss a')}
                                </p>
                            </div>

                            {/* Business Fields */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business Name:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Trade Name:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.trade_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business Email:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_email}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business Phone:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_phone}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business Address:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_address}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business Country:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_country}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business State:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_state || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business City:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.biz_city || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Support Email:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.support_email}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Support Phone:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.support_phone}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Chargeback Email:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.chargeback_email}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>KYC Status:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_status}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>KYC Rejection Reason:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_reason_for_rejection || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>KYC Rejection Comment:</strong></p>
                                <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_rejection_comment || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading payout details...</p>
                )}
            </Modal>
            <Header headerTitle={'Wallet Transactions'} />
            <MetricCards
                stats={data?.stats ?? {
                    amount_fail: 0,
                    amount_pending: 0,
                    amount_processed: 0,
                    amount_success: 0,
                    total: 0
                }}
                isLoading={loading}
            />
            <div className="p-4 mt-4">

                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search wallet transactions..."
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

                    {/* Open Export Modal */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                    >
                        <FileSpreadsheet className="w-5 h-5"/>
                        <span>Export All to CSV</span>
                    </button>
                </div>

                <Table<TableData>
                    headers={TABLE_COLUMNS}
                    data={filteredData}
                    limit={pagination.limit}
                    onRowClick={(row) => setModalData(row)} // Handle row click
                    loading={loading}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                />

                {/* Export Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-4">Export Transactions</h2>

                            {/*<label className="block font-medium">Business Id</label>*/}
                            {/*<input type="text" value={businesid} onChange={(e) => setBusinessId(e.target.value)}*/}
                            {/*       className="border p-2 w-full rounded mb-2"/>*/}

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