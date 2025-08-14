"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import Header from './Header';
import { StringUtils } from '@/helpers/extras';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import moment from 'moment';
import { RouteLiteral } from 'nextjs-routes';
import {FileSpreadsheet, PackageSearch} from "lucide-react";
import {string} from "postcss-selector-parser";
import toast from "react-hot-toast";

interface StatsData {
    total: number,
    amount_pending: number,
    amount_processed: number,
    amount_success: number,
    amount_fail: number
}

// Define the main interface for the transaction
interface TableData {
    id: string;
    business_id: number;
    trx: string;
    reference: string;
    transactionRef: string | null;
    sessionid: string | null;
    batch_id: string | null;
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
    request_ip: string;
    initiator: string | null;
    domain: string;
    source: string;
    gateway: string;
    gateway_response: string | null;
    message: string;
    status: string;
    reversed: string;
    reversed_by: string | null;
    note: string;
    created_at: string;
    updated_at: string;
}
interface CombinedResponse {
    stats: StatsData;
    payouts: TableData[];
}


// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
    { id: "trx", label: "TRX" },
    { id: "business_id", label: "BUSINESS ID" },
    { id: "amount", label: "AMOUNT" },
    { id: "fee", label: "FEE" },
    { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 200 },
    { id: "account_name", label: "ACCOUNT NAME", minWidth: 200 },
    { id: "sender_name", label: "SENDER NAME", minWidth: 200 },
    { id: "currency", label: "CURRENCY" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
    },
    {
        id: "paymentMode",
        label: "PAYMENT MODE",
        type: "custom",
        renderCustom: (value) => <p>{StringUtils.snakeToCapitalized(value.paymentMode)}</p>,
    },
    {
        id: "source", label: "SOURCE", type: "custom",
        renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.source)}</p>,
    },
    {
        id: "gateway", label: "GATEWAY",
        type: "custom",
        renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.gateway)}</p>,
    },
    { id: "reversed", label: "REVERSED" },
    { id: "created_at", label: "DATE", type: "dateTime" },
];
const TABLE_COLUMNS1: Column<TableData>[] = [
    { id: "trx", label: "TRX" },
    { id: "business_id", label: "BUSINESS ID" },
    { id: "amount", label: "AMOUNT" },
    { id: "fee", label: "FEE" },
    { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 200 },
    { id: "account_name", label: "ACCOUNT NAME", minWidth: 200 },
    { id: "sender_name", label: "SENDER NAME", minWidth: 200 },
    { id: "currency", label: "CURRENCY" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
    },
    {
        id: "paymentMode",
        label: "PAYMENT MODE",
        type: "custom",
        renderCustom: (value) => <p>{StringUtils.snakeToCapitalized(value.paymentMode)}</p>,
    },
    {
        id: "source", label: "SOURCE", type: "custom",
        renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.source)}</p>,
    },
    {
        id: "gateway", label: "GATEWAY",
        type: "custom",
        renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.gateway)}</p>,
    },
    { id: "reversed", label: "REVERSED" },
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

// Apply formatting to numbers
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

// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [data, setData] = useState<CombinedResponse | undefined>(undefined);
    const [data1, setData1] = useState<CombinedResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
    const [pagination1, setPagination1] = useState({ totalItems: 0, totalPages: 1, limit: 100 });
    const [selectedPayout, setSelectedPayout] = useState<TableData | null>(null); // NEW STATE
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);

// Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data?.payouts) return [];
        return data.payouts.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);

    const downloadCSV = () => {
        if (!data1?.payouts.length) return;

        const headers = TABLE_COLUMNS1.map(col => col.label).join(","); // Column headers
        const rows = data1.payouts.map(item =>
            TABLE_COLUMNS1.map(col => item[col.id as keyof TableData] || "").join(",")
        ).join("\n"); // Data rows

        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payout.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        await fetchData1(currentPage);
        setLoading(false);
    };
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState.dateRange.endDate, filterState.dateRange.startDate, typedFilterState.status]);

    console.log("queryParams", queryParams)
    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/payouts", {
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
    const fetchData1 = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/payouts", {
                params: { ...queryParams, page, limit: pagination1.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000
            });
            setData1(response.data?.data);
            setPagination1(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);

    useEffect(() => {
        fetchData(currentPage);
        fetchData1(currentPage);
    }, [fetchData, fetchData1, currentPage]);

    useEffect(() => {
        setShowSearchQuery(true);
        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);


    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            console.error("Missing businessId or transactionId");
            return;
        }


        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_payout_webhook/${businessId}/live/${transactionId}`,
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
    const exporttomail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.get('/export/export-payouts', {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setLoading(false);

            if (response.data.status) {

                toast.success(response.data.message);
            }else {
                toast.error(response.data.message);

            }
        } catch (error: any) {
            setLoading(false);
            console.error("Error fetching fees:", error);
            toast.error(error.message);

        }
    };
    const exportToMail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post('/export/export-payouts',
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

    return (
        <div>
            <Header headerTitle={'Payout Transfer'} />
            <MetricCards isLoading={loading} stats={data?.stats ?? { total: 0, amount_pending: 0, amount_processed: 0, amount_success: 0, amount_fail: 0 }} />

            {/* Payout Details Modal */}
            <Modal
                isOpen={!!selectedPayout}
                onClose={() => setSelectedPayout(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Payout Details</h2>
                        <div className="flex gap-4">
                            <Buttons onClick={()=> router.push(`/dashboard/operations/merchant/${selectedPayout?.business_id}/business` as RouteLiteral)} label="Go to business" fullWidth type="smOutlineButton" />
                            <Buttons
                                onClick={() => resendwebhook(selectedPayout?.business_id as any, selectedPayout?.id)}
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
                {selectedPayout ? (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Existing Fields */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.trx}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.business_id}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.currency} {selectedPayout.amount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.fee}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Account Number:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.account_number}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Account Name:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.account_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Sender Name:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.sender_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{StringUtils.capitalizeWords(selectedPayout.status)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Date:</strong></p>
                                <p className="text-sm font-medium text-gray-800">
                                    {moment(selectedPayout.created_at).format('MMMM Do YYYY')}
                                    <br />
                                    {moment(selectedPayout.created_at).format('h:mm:ss a')}
                                </p>
                            </div>

                            {/* Additional Fields */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.reference}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Transaction Ref:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.transactionRef || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Session ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.sessionid || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Batch ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.batch_id || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Fee Source:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.fee_source}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>System Fee:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.sys_fee}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Bank Code:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.bank_code}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Bank Name:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.bank_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Narration:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.narration}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Payment Mode:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.paymentMode}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Request IP:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.request_ip}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Initiator:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.initiator}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Domain:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.domain}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Source:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.source}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Gateway:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.gateway}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Gateway Response:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.gateway_response || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Message:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.message || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Reversed:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.reversed}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Reversed By:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.reversed_by || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Note:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{selectedPayout.note || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Updated At:</strong></p>
                                <p className="text-sm font-medium text-gray-800">
                                    {moment(selectedPayout.updated_at).format('MMMM Do YYYY')}
                                    <br />
                                    {moment(selectedPayout.updated_at).format('h:mm:ss a')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading payout details...</p>
                )}
            </Modal>

            {/* Table Component */}
            <div className="p-4 mt-4">
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search Payout Transfer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-2 border-green-400 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold m-2"
                    />

                    {/* Flex container for buttons */}
                    <div className="flex items-center gap-2 m-2">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <svg
                                    className="w-5 h-5 animate-spin"
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

                        <button
                            onClick={downloadCSV}
                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                                </svg>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-5 h-5"/>
                                    <span>Export To CSV</span>
                                </>
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
                        <button
                            onClick={() => router.push(`/dashboard/finance/search-payout` as RouteLiteral)}
                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            <PackageSearch className="w-5 h-5"/>
                            <span>Search General Payouts</span>
                        </button>
                    </div>
                </div>

                <Table<TableData>
                    headers={TABLE_COLUMNS}
                    data={filteredData}
                    limit={pagination.limit}
                    loading={loading}
                    onPaginate={setCurrentPage}
                    pagination={pagination}
                    onRowClick={(row) => setSelectedPayout(row)} // Handle row click
                />

                {/* Export Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-4">Export Payouts</h2>

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
