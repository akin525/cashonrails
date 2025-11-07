"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import Header from "./Header";
import moment from "moment";
import { StringUtils } from "@/helpers/extras";
import Modal from "@/components/modal";
import axiosInstance from "@/helpers/axiosInstance";
import { FileSpreadsheet, RefreshCw, Search, Users, Filter, Download } from "lucide-react";
import Buttons from "@/components/buttons";
import toast from "react-hot-toast";

// Types
interface MerchantData {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    nationality: string;
    country: string;
    id_document: string;
    id_number: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [showSettleConfirmation, setShowSettleConfirmation] = useState<null | MerchantData>(null);
    const [activeFilter, setActiveFilter] = useState<string>('Total');

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<MerchantData[]>([]);
    const [data1, setData1] = useState<MerchantData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [modalData, setModalData] = useState<MerchantData | null>(null);

    const TABLE_COLUMNS: Column<MerchantData>[] = [
        { id: "id", label: "ID" },
        { id: "firstname", label: "FIRST NAME" },
        { id: "lastname", label: "LAST NAME" },
        { id: "phone", label: "PHONE NUMBER" },
        { id: "email", label: "EMAIL" },
        {
            id: "status",
            label: "STATUS",
            type: "custom",
            renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
        },
        { id: "created_at", label: "DATE", type: "dateTime" },
    ];

    // Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: data.length,
            active: data.filter(m => m.status === 'active').length,
            pending: data.filter(m => m.status === 'pending').length,
            inactive: data.filter(m => m.status === 'inactive').length,
        };
    }, [data]);

    const downloadCSV = () => {
        if (!filteredData.length) {
            toast.error("No data to export");
            return;
        }

        const headers = TABLE_COLUMNS.map(col => col.label).join(",");
        const rows = filteredData.map(item =>
            TABLE_COLUMNS.map(col => {
                const value = item[col.id as keyof MerchantData] || "";
                return `"${value}"`;
            }).join(",")
        ).join("\n");

        const csvContent = `data:text/csv;charset=utf-8,$${headers}\n$$ {rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `merchants-${moment().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exported successfully");
    };

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData(currentPage);
        setLoading(false);
        toast.success("Data refreshed successfully");
    };

    useEffect(() => {
        setShowSearchQuery(true);
        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);

    const queryParams = useMemo(() => ({
        status: activeFilter !== 'Total' ? activeFilter : undefined,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [activeFilter, filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<MerchantData[]>("/operations/users", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setData(response.data?.data ?? []);
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch merchant data");
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Modal */}
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Merchant Details</h2>
                                <p className="text-sm text-gray-500">Complete merchant information</p>
                            </div>
                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                {modalData ? (
                    <div className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(modalData).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                                        {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {key.includes("created_at") || key.includes("updated_at")
                                            ? moment(value).format("MMM DD, YYYY • h:mm A")
                                            : value ?? "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                )}
            </Modal>

            {/* Header */}
            <Header headerTitle="All Merchants" />

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Merchants</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <div className="w-8 h-8 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <div className="w-8 h-8 rounded-full bg-yellow-500"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
                                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm font-medium placeholder-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            <button
                                onClick={downloadCSV}
                                disabled={loading || filteredData.length === 0}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Download className="w-5 h-5" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Search Results Info */}
                    {searchQuery && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Found <span className="font-semibold text-green-600">{filteredData.length}</span> result{filteredData.length !== 1 ? 's' : ''}
                                {filteredData.length !== data.length && <span> out of {data.length} total merchants</span>}
                            </p>
                        </div>
                    )}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Merchant List</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage and view all merchant accounts</p>
                    </div>

                    <Table<MerchantData>
                        headers={TABLE_COLUMNS}
                        data={filteredData}
                        limit={pagination.limit}
                        loading={loading}
                        pagination={pagination}
                        onPaginate={setCurrentPage}
                        onRowClick={(row) => setModalData(row)}
                        showPagination
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
