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
import { StringUtils } from '@/helpers/extras';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import moment from 'moment';
import Buttons from '@/components/buttons';
import Modal from '@/components/modal';
import {FileSpreadsheet, PackageSearch} from "lucide-react";
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
    currency: string;
    amount: string;
    fee: string;
    stamp_duty: string;
    settled_amount: string;
    account_number: string;
    sender_account_name: string;
    sender_account_number: string;
    sender_bank_code: string;
    sender_narration: string;
    sessionId: string;
    trx: string;
    reference: string;
    domain: string;
    gateway: string;
    status: string;
    created_at: string;
    updated_at: string;
    gateway_response: string;
}
interface CombinedResponse {
    stats: StatsData;
    transfers: TableData[];
}
// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
    { id: "trx", label: "TRX" },
    { id: "amount", label: "AMOUNT" },
    { id: "fee", label: "FEE" },
    { id: "settled_amount", label: "SETTLED AMOUNT", minWidth: 200 },
    { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 200 },
    { id: "sender_account_name", label: "ACCOUNT NAME" },
    { id: "sender_account_number", label: "SENDER ACCOUNT", minWidth: 200 },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
    },
    { id: "created_at", label: "DATE", type: "dateTime" },

];
const TABLE_COLUMNS1: Column<TableData>[] = [
    { id: "trx", label: "TRX" },
    { id: "amount", label: "AMOUNT" },
    { id: "fee", label: "FEE" },
    { id: "currency", label: "CURRENCY" },
    { id: "stamp_duty", label: "STAMP DUTY" },
    { id: "settled_amount", label: "SETTLED AMOUNT" },
    { id: "account_number", label: "ACCOUNT NUMBER" },
    { id: "sender_account_name", label: "ACCOUNT NAME" },
    { id: "sender_account_number", label: "SENDER ACCOUNT" },
    { id: "sender_narration", label: "NARRATION" },
    { id: "sessionId", label: "SESSION ID" },
    { id: "reference", label: "REFERENCE" },
    { id: "gateway", label: "GATEWAY" },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
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

// Apply formatting to numbers
    const cardConfigs: MetricCardProps[] = [
        {
            title: "Total",
            count: formatCurrency(stats.total),
        },
        {
            title: "Processed Amount",
            count: formatCurrency(stats.amount_processed),
        },
        {
            title: "Pending Amount",
            count: formatCurrency(stats.amount_pending),
        },
        {
            title: "Successful Amount",
            count: formatCurrency(stats.amount_success),
        },
        {
            title: "Failed Amount",
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
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [pagination1, setPagination1] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
// Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data?.transfers) return [];
        return data.transfers.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);
    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
    };

    const downloadCSV = () => {
        if (!data1?.transfers.length) return;

        const headers = TABLE_COLUMNS1.map(col => col.label).join(","); // Column headers
        const rows = data1.transfers.map(item =>
            TABLE_COLUMNS1.map(col => item[col.id as keyof TableData] || "").join(",")
        ).join("\n"); // Data rows

        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Incoming-transfer.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [typedFilterState.status, filterState.dateRange.startDate, filterState.dateRange.endDate]);



    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/incoming-transfer", {
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
    useEffect(() => {
        setShowSearchQuery(true);

        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);


    const exportToMail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post('/export-incoming',
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

    const [modalData, setModalData] = useState<TableData | null>(null)

    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Transaction Details</h2>
                        <div className="flex gap-4">
                            {/*<Buttons onClick={() => router.push(`/dashboard/operations/transaction/${modalData?.id}` as RouteLiteral)} label="View Full Details" fullWidth type="smOutlineButton" />*/}
                            {/*<Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />*/}
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
                                <p className="text-sm text-gray-600"><strong>Session ID:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.sessionId}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Gateway:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.gateway}</p>
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
                                <p className="text-sm text-gray-600"><strong>Settled Amount:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.settled_amount}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Account Number:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.account_number}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Sender Account Name:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.sender_account_name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Sender Account Number:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.sender_account_number}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                                <p className="text-sm font-medium text-gray-800">{modalData.status}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><strong>Created At:</strong></p>
                                <p className="text-sm font-medium text-gray-800">
                                    {moment(modalData.created_at).format('MMMM Do YYYY')}
                                    <br />
                                    {moment(modalData.created_at).format('h:mm:ss a')}
                                </p>
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
                                                {modalData.gateway_response}
                                            </p>
                                        </div>
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Gateway Response Message:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.responseMessage}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Provider:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.provider}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Provider Channel:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.providerChannel}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Transaction Status:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.status}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}
                                        {/*<div className="space-y-2">*/}
                                        {/*    <p className="text-sm text-gray-600"><strong>Transaction Reference:</strong></p>*/}
                                        {/*    <p className="text-sm font-medium text-gray-800">*/}
                                        {/*        {JSON.parse(modalData.gateway_response).data.paymentReference}*/}
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
            <Header headerTitle={'Inbound Tranfers'} />
            <MetricCards isLoading={loading} stats={data?.stats ?? { total: 0, amount_pending: 0, amount_processed: 0, amount_success: 0, amount_fail: 0 }} />
            <div className="p-4 mt-4">
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search incoming Transfer..."
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

                        <button
                            onClick={() => router.push(`/dashboard/finance/search-incoming` as RouteLiteral)}
                            className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                        >
                            <PackageSearch className="w-5 h-5"/>
                            <span>Search General Incoming</span>
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
                    onRowClick={(row) => setModalData(row)} // Handle row click


                />
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Export Incoming Transfer</h2>

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
    );
};

export default Page;