"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import { MetricCardSkeleton } from "@/components/loaders";
import Header from "./Header";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard, MetricCardProps } from "@/components/MatricCard";
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";
import moment from "moment";
import {
    FileSpreadsheet,
    PackageSearch,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Search,
    RefreshCw,
    Download,
    Calendar,
    DollarSign,
    CreditCard,
    Building2,
    Hash,
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
    BarChart3,
    Receipt,
    Sparkles,
    X,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

interface StatsData {
    total: number;
    amount_pending: number;
    amount_processed: number;
    amount_success: number;
    amount_fail: number;
}

interface Customer {
    id: number;
    business_id: number;
    account_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bvn: string;
    nin: string;
    address: string;
    dob: string;
    customer_code: string;
    metadata: string;
    domain: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface CheckoutData {
    id: string;
    business_id: number;
    customer_id: number;
    currency: string;
    amount: string;
    fee: string;
    total: string;
    feeBearer: string;
    paidAmount: string | null;
    paidDifference: string | null;
    paidNote: string | null;
    name: string;
    email: string;
    phone: string;
    transactionRef: string;
    reference: string;
    initiationTranRef: string;
    access_code: string;
    paymentMethod: string;
    provider: string;
    gateway: string;
    account_number: string;
    account_name: string;
    bank_name: string;
    accountExpiry: string;
    domain: string;
    ip: string | null;
    trans_id: string | null;
    redirectUrl: string;
    title: string | null;
    description: string | null;
    logoUrl: string | null;
    status_desc: string | null;
    status: string;
    extra: string | null;
    created_at: string;
    updated_at: string;
    customer: Customer;
}

interface CombinedResponse {
    stats: StatsData;
    table: CheckoutData[];
}

// Constants
const TABLE_COLUMNS: Column<CheckoutData>[] = [
    { id: "business_id", label: "BUSINESS ID" },
    { id: "transactionRef", label: "TRANSACTION REFERENCE" },
    { id: "reference", label: "REFERENCE" },
    { id: "paymentMethod", label: "PAYMENT METHOD" },
    { id: "gateway", label: "GATEWAY" },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        type: "custom",
        renderCustom: (row: CheckoutData) => (
            <p>
                {row.currency === "NGN" ? "₦" : row.currency === "USD" ? "$" : ""}
                {Number(row.amount).toLocaleString()}
            </p>
        ),
    },
    {
        id: "currency",
        label: "CURRENCY",
    },
    {
        id: "fee",
        label: "FEE",
    },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
    },
    { id: "created_at", label: "DATE", type: "dateTime" },
];

const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M";
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + "K";
    }
    return num.toFixed(2);
};

const MetricCards: React.FC<{
    stats: StatsData;
    isLoading: boolean;
}> = ({ stats, isLoading }) => {
    const metrics = [
        {
            title: "Total Checkouts",
            value: formatNumber(stats.total),
            icon: <ShoppingCart className="w-6 h-6" />,
            gradient: "from-green-500 to-green-600",
            bgGradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
            iconBg: "bg-green-600",
            borderColor: "border-green-200 dark:border-green-800",
        },
        {
            title: "Processed Amount",
            value: "₦" + formatNumber(stats.amount_processed),
            icon: <CheckCircle2 className="w-6 h-6" />,
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
            iconBg: "bg-emerald-600",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
            title: "Pending Amount",
            value: "₦" + formatNumber(stats.amount_pending),
            icon: <Clock className="w-6 h-6" />,
            gradient: "from-amber-500 to-amber-600",
            bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
            iconBg: "bg-amber-600",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            title: "Successful Amount",
            value: `₦${formatNumber(stats.amount_success)}`,
            icon: <Wallet className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
            iconBg: "bg-blue-600",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            title: "Failed Amount",
            value: `₦${formatNumber(stats.amount_fail)}`,
            icon: <XCircle className="w-6 h-6" />,
            gradient: "from-red-500 to-red-600",
            bgGradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
            iconBg: "bg-red-600",
            borderColor: "border-red-200 dark:border-red-800",
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
                        <div
                            className={`w-12 h-12 rounded-xl ${metric.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                        >
                            {metric.icon}
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{metric.title}</p>
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

// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const receiptRef = useRef<HTMLDivElement>(null);
    const typedFilterState = filterState as FilterState;
    const [data, setData] = useState<CombinedResponse | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<CheckoutData | null>(null);
    const [showExtra, setShowExtra] = useState(false);

    const filteredData = useMemo(() => {
        if (!data?.table) return [];
        return data.table.filter((item) =>
            Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [data, searchQuery]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
        toast.success("Data refreshed successfully!");
    };

    const fetchData = useCallback(
        async (page: number) => {
            if (!authState.token) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get<CombinedResponse>("/finance/checkout", {
                    params: { page, limit: pagination.limit },
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000,
                });
                setData(response.data?.data);
                setPagination(
                    response.data.pagination
                        ? response.data.pagination
                        : { totalItems: 0, totalPages: 1, limit: 20 }
                );
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch checkout data");
            } finally {
                setLoading(false);
            }
        },
        [authState.token, pagination.limit]
    );

    const exportToMail = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/export-checkout",
                {
                    start_date: startDate || null,
                    end_date: endDate || null,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000,
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

    const handleScreenshot = async () => {
        if (!receiptRef.current || !modalData) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: "#ffffff",
                scale: 2,
                logging: false,
                useCORS: true,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `checkout-$${modalData.id}-$$ {Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success("Checkout receipt downloaded successfully!");
                }
            });
        } catch (error) {
            console.error("Error capturing screenshot:", error);
            toast.error("Failed to capture screenshot");
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    useEffect(() => {
        setShowSearchQuery(true);
        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Checkout Details Modal */}
            {modalData && (
                <Modal
                    isOpen={!!modalData}
                    onClose={() => {
                        setModalData(null);
                        setShowExtra(false);
                    }}
                    header={
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <ShoppingCart className="w-7 h-7 text-green-600" />
                                    Checkout Details
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
                                    onClick={handleScreenshot}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md font-medium text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Receipt
                                </button>
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral
                                        )
                                    }
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Business
                                </button>
                            </div>
                        </div>
                    }
                    scrollableContent={true}
                >
                    <div ref={receiptRef} className="bg-white dark:bg-gray-800 p-8 space-y-6">
                        {/* Receipt Header */}
                        <div className="text-center pb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
                                <ShoppingCart className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Checkout Receipt
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Generated on{" "}
                                {new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
                            </p>
                        </div>

                        {/* Status Banner */}
                        <div
                            className={`p-6 rounded-2xl text-center font-semibold text-lg ${
                                modalData.status === "completed" || modalData.status === "success"
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                    : modalData.status === "pending"
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                        : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                            } shadow-lg`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {(modalData.status === "completed" || modalData.status === "success") && (
                                    <CheckCircle2 className="w-6 h-6" />
                                )}
                                {modalData.status === "pending" && <Clock className="w-6 h-6" />}
                                {modalData.status === "failed" && <XCircle className="w-6 h-6" />}
                                <span className="uppercase tracking-wide">Status: {modalData.status}</span>
                            </div>
                        </div>

                        {/* Amount Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 text-center border-2 border-green-200 dark:border-green-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Amount
                                </p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {modalData.currency === "NGN" ? "₦" : modalData.currency === "USD" ? "$" : ""}
                                    {Number(modalData.amount).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 text-center border-2 border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Fee
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {modalData.currency === "NGN" ? "₦" : modalData.currency === "USD" ? "$" : ""}
                                    {Number(modalData.fee).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 text-center border-2 border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                    Total
                                </p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {modalData.currency === "NGN" ? "₦" : modalData.currency === "USD" ? "$" : ""}
                                    {Number(modalData.total).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailCard icon={<Hash />} label="Checkout ID" value={modalData.id} fullWidth />
                            <DetailCard icon={<Building2 />} label="Business ID" value={modalData.business_id} />
                            <DetailCard icon={<User />} label="Customer ID" value={modalData.customer_id} />
                            <DetailCard icon={<Receipt />} label="Transaction Ref" value={modalData.transactionRef} fullWidth />
                            <DetailCard icon={<Hash />} label="Reference" value={modalData.reference} fullWidth />
                            <DetailCard icon={<CreditCard />} label="Payment Method" value={modalData.paymentMethod} />
                            <DetailCard icon={<Wallet />} label="Gateway" value={modalData.gateway} />
                            <DetailCard icon={<DollarSign />} label="Currency" value={modalData.currency} />
                            <DetailCard icon={<User />} label="Fee Bearer" value={modalData.feeBearer} />
                        </div>

                        {/* Customer Information */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                                        Name
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{modalData.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                                        Email
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{modalData.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                                        Phone
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{modalData.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                                        IP Address
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{modalData.ip || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        {modalData.account_number && (
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Bank Account Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailCardInline label="Account Name" value={modalData.account_name} />
                                    <DetailCardInline label="Account Number" value={modalData.account_number} />
                                    <DetailCardInline label="Bank Name" value={modalData.bank_name} />
                                    <DetailCardInline label="Account Expiry" value={modalData.accountExpiry} />
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailCard
                                icon={<Calendar />}
                                label="Created At"
                                value={moment(modalData.created_at).format("MMMM Do YYYY, h:mm A")}
                            />
                            <DetailCard
                                icon={<Calendar />}
                                label="Updated At"
                                value={moment(modalData.updated_at).format("MMMM Do YYYY, h:mm A")}
                            />
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
                    </div>

                    {/* Extra Data (Outside Screenshot) */}
                    {modalData.extra && (
                        <div className="px-8 pb-8">
                            <button
                                onClick={() => setShowExtra(!showExtra)}
                                className="flex items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        {showExtra ? (
                                            <EyeOff className="w-5 h-5 text-white" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white">Extra Data</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {showExtra ? "Click to hide" : "Click to view"} additional information
                                        </p>
                                    </div>
                                </div>
                                {showExtra ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>

                            {showExtra && (
                                <div className="mt-4 bg-gray-900 dark:bg-black rounded-xl p-6 overflow-auto">
                                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                        {typeof modalData.extra === "string"
                                            ? JSON.stringify(JSON.parse(modalData.extra), null, 2)
                                            : JSON.stringify(modalData.extra, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            )}

            {/* Export Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                                    Export Checkouts
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"

                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={exportToMail}
                                disabled={loading}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Export
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Header headerTitle="Checkouts" />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-600 mx-6 mt-6 rounded-3xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-green-lg rounded-2xl flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Checkout Management</h1>
                            <p className="text-green-50">Monitor and manage all checkout transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            {loading && !data ? (
                <MetricCardSkeleton />
            ) : (
                <MetricCards
                    isLoading={loading}
                    stats={
                        data?.stats ?? {
                            total: 0,
                            amount_pending: 0,
                            amount_processed: 0,
                            amount_success: 0,
                            amount_fail: 0,
                        }
                    }
                />
            )}

            {/* Search and Actions */}
            <div className="px-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by transaction ref, reference, email, or amount..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md font-medium"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Export to CSV
                        </button>

                        <button
                            onClick={() =>
                                router.push(`/dashboard/finance/search-checkout` as RouteLiteral)
                            }
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                        >
                            <PackageSearch className="w-5 h-5" />
                            Search Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkouts Table */}
            <div className="px-6 mt-6 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Checkouts</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pagination.totalItems} total records
                                    </p>
                                </div>
                            </div>
                            {searchQuery && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <Filter className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Filtered Results
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Table
                        headers={TABLE_COLUMNS}
                        data={filteredData}
                        limit={pagination.limit}
                        loading={loading}
                        onRowClick={(row) => setModalData(row)}
                        onPaginate={setCurrentPage}
                        pagination={pagination}
                    />
                </div>
            </div>
        </div>
    );
};

// Detail Card Component for Modal
const DetailCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    fullWidth?: boolean;
}> = ({ icon, label, value, fullWidth }) => (
    <div
        className={`p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all ${
            fullWidth ? "md:col-span-2" : ""
        }`}
    >
        <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white break-words">{value || "N/A"}</p>
    </div>
);

// Inline Detail Card for nested sections
const DetailCardInline: React.FC<{
    label: string;
    value: string | number;
}> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
            {label}
        </p>
        <p className="text-sm font-bold text-gray-900 dark:text-white break-words">{value || "N/A"}</p>
    </div>
);

export default Page;
