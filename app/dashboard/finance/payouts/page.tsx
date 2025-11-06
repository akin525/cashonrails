"use client"
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
import { FileSpreadsheet, PackageSearch, Download } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from 'html2canvas';

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
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [selectedPayout, setSelectedPayout] = useState<TableData | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    // Add ref for screenshot
    const payoutReceiptRef = useRef<HTMLDivElement>(null);

    // Screenshot function
    const handleScreenshot = async () => {
        if (!payoutReceiptRef.current || !selectedPayout) return;

        try {
            const canvas = await html2canvas(payoutReceiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                logging: false,
                useCORS: true,
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `payout-$${selectedPayout.trx}-$$ {Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Payout proof downloaded successfully!');
                }
            });
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            toast.error('Failed to capture screenshot');
        }
    };

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

        const headers = TABLE_COLUMNS1.map(col => col.label).join(",");
        const rows = data1.payouts.map(item =>
            TABLE_COLUMNS1.map(col => item[col.id as keyof TableData] || "").join(",")
        ).join("\n");

        const csvContent = `data:text/csv;charset=utf-8,$${headers}\n$$ {rows}`;
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
        setLoading(false);
    };

    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState.dateRange.endDate, filterState.dateRange.startDate, typedFilterState.status]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<CombinedResponse>("/finance/payouts", {
                params: { ...queryParams, page, limit: pagination.limit },
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

    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            console.error("Missing businessId or transactionId");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_payout_webhook/$${businessId}/live/$$ {transactionId}`,
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
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
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
                    timeout: 60000
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
                        <h2 className="text-xl font-semibold text-gray-500">Payout Details</h2>
                        <div className="flex gap-4 flex-wrap">
                            <Buttons
                                onClick={() => router.push(`/dashboard/operations/merchant/${selectedPayout?.business_id}/business` as RouteLiteral)}
                                label="Go to business"
                                type="smOutlineButton"
                            />
                            <Buttons
                                onClick={() => resendwebhook(selectedPayout?.business_id as any, selectedPayout?.id)}
                                label={loading ? "Sending..." : "Resend Notification"}
                                type="smOutlineButton"
                                disabled={loading}
                            />
                            {/* New Screenshot Button */}
                            <button
                                onClick={handleScreenshot}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Download Proof
                            </button>
                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                {/* Wrap content in ref for screenshot */}
                <div ref={payoutReceiptRef} className="bg-white">
                    {selectedPayout ? (
                        <div className="space-y-4 p-6">
                            {/* Header for Receipt */}
                            <div className="text-center border-b pb-4">
                                <h1 className="text-2xl font-bold text-gray-800">Payout Receipt</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Generated on {new Date().toLocaleString()}
                                </p>
                            </div>

                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg text-center ${
                                selectedPayout.status === 'success' ? 'bg-green-100 border border-green-300' :
                                    selectedPayout.status === 'pending' ? 'bg-yellow-100 border border-yellow-300' :
                                        'bg-red-100 border border-red-300'
                            }`}>
                                <p className="text-lg font-semibold capitalize">
                                    Status: {selectedPayout.status}
                                </p>
                            </div>

                            {/* Main Payout Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Transaction ID */}
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPayout.trx}</p>
                                </div>

                                {/* Reference */}
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Reference</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPayout.reference}</p>
                                </div>

                                {/* Business ID */}
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Business ID</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPayout.business_id}</p>
                                </div>

                                {/* Amount - Highlighted */}
                                <div className="space-y-2 p-3 bg-green-50 rounded border border-green-200">
                                    <p className="text-xs text-gray-500 uppercase">Amount</p>
                                    <p className="text-lg font-bold text-green-700">
                                        {selectedPayout.currency} {Number(selectedPayout.amount).toLocaleString()}
                                    </p>
                                </div>

                                {/* Fee */}
                                {/*<div className="space-y-2 p-3 bg-gray-50 rounded">*/}
                                {/*    <p className="text-xs text-gray-500 uppercase">Fee</p>*/}
                                {/*    <p className="text-sm font-semibold text-gray-800">{selectedPayout.fee}</p>*/}
                                {/*</div>*/}

                                {/* System Fee */}
                                {/*<div className="space-y-2 p-3 bg-gray-50 rounded">*/}
                                {/*    <p className="text-xs text-gray-500 uppercase">System Fee</p>*/}
                                {/*    <p className="text-sm font-semibold text-gray-800">{selectedPayout.sys_fee}</p>*/}
                                {/*</div>*/}

                                {/* Gateway */}
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Gateway</p>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">{selectedPayout.gateway}</p>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Payment Mode</p>
                                    <p className="text-sm font-semibold text-gray-800">{StringUtils.snakeToCapitalized(selectedPayout.paymentMode)}</p>
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-xs text-gray-500 uppercase">Account Number</p>
                                        <p className="text-sm font-bold text-blue-800">{selectedPayout.account_number}</p>
                                    </div>
                                    <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-xs text-gray-500 uppercase">Account Name</p>
                                        <p className="text-sm font-bold text-blue-800">{selectedPayout.account_name}</p>
                                    </div>
                                    <div className="space-y-2 p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500 uppercase">Bank Name</p>
                                        <p className="text-sm font-semibold text-gray-800">{selectedPayout.bank_name}</p>
                                    </div>
                                    <div className="space-y-2 p-3 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500 uppercase">Bank Code</p>
                                        <p className="text-sm font-semibold text-gray-800">{selectedPayout.bank_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sender & Narration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Sender Name</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPayout.sender_name}</p>
                                </div>
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Narration</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPayout.narration}</p>
                                </div>
                            </div>

                            {/* Date Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Created Date</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {moment(selectedPayout.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                                    </p>
                                </div>
                                <div className="space-y-2 p-3 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500 uppercase">Last Updated</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {moment(selectedPayout.updated_at).format('MMMM Do YYYY, h:mm:ss a')}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Details - Collapsible */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <details className="cursor-pointer">
                                    <summary className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                                        View Additional Details
                                    </summary>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedPayout.transactionRef && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">Transaction Ref:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.transactionRef}</p>
                                            </div>
                                        )}
                                        {selectedPayout.sessionid && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">Session ID:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.sessionid}</p>
                                            </div>
                                        )}
                                        {selectedPayout.batch_id && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">Batch ID:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.batch_id}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Fee Source:</p>
                                            <p className="text-sm text-gray-800">{selectedPayout.fee_source}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Source:</p>
                                            <p className="text-sm text-gray-800 capitalize">{selectedPayout.source}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Domain:</p>
                                            <p className="text-sm text-gray-800">{selectedPayout.domain}</p>
                                        </div>
                                        {selectedPayout.initiator && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">Initiator:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.initiator}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Request IP:</p>
                                            <p className="text-sm text-gray-800">{selectedPayout.request_ip}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Reversed:</p>
                                            <p className="text-sm text-gray-800">{selectedPayout.reversed}</p>
                                        </div>
                                        {selectedPayout.reversed_by && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">Reversed By:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.reversed_by}</p>
                                            </div>
                                        )}
                                        {selectedPayout.note && (
                                            <div className="space-y-1 col-span-2">
                                                <p className="text-xs text-gray-500">Note:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.note}</p>
                                            </div>
                                        )}
                                        {selectedPayout.message && (
                                            <div className="space-y-1 col-span-2">
                                                <p className="text-xs text-gray-500">Message:</p>
                                                <p className="text-sm text-gray-800">{selectedPayout.message}</p>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t">
                                <p>This is a computer-generated receipt and requires no signature.</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 py-4">Loading payout details...</p>
                    )}
                </div>

                {/* Gateway Response - Outside screenshot area */}
                {selectedPayout && selectedPayout.gateway_response && (
                    <div className="mt-6 px-6 pb-6">
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
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showGatewayResponse && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <pre className="text-sm text-gray-800 overflow-auto">
                                    {JSON.stringify(JSON.parse(selectedPayout.gateway_response), null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
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
                            className="
bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md"
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
                    onRowClick={(row) => setSelectedPayout(row)}
                />

                {/* Export Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-4">Export Payouts</h2>

                            <label className="block font-medium">Start Date:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border p-2 w-full rounded mb-2"
                            />

                            <label className="block font-medium">End Date:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border p-2 w-full rounded mb-2"
                            />

                            <div className="flex justify-end mt-4">
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                                    onClick={exportToMail}
                                    disabled={loading}
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
                                        "Export"
                                    )}
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
