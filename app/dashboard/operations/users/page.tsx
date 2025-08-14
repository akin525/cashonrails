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
import {FileSpreadsheet} from "lucide-react";
import Buttons from "@/components/buttons";
import {RouteLiteral} from "nextjs-routes";
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

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
    const [pagination1, setPagination1] = useState({ totalItems: 0, totalPages: 1, limit: 100 });
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<MerchantData[]>([]);
    const [data1, setData1] = useState<MerchantData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);


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
    const TABLE_COLUMNS1: Column<MerchantData>[] = [
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

    const [searchQuery, setSearchQuery] = useState<string>("");

// Filter data based on search input
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);

    const downloadCSV = () => {
        if (!data1.length) return;

        const headers = TABLE_COLUMNS1.map(col => col.label).join(","); // Column headers
        const rows = data1.map(item =>
            TABLE_COLUMNS1.map(col => item[col.id as keyof MerchantData] || "").join(",")
        ).join("\n"); // Data rows

        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pending-payout.csv");
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

    const requery = useCallback(async (id: string | undefined) => {
        if (!authState.token || !id) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/operations/users/${id}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            toast.success(response.data.message);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to requery payout");
        } finally {
            setLoading(false);
        }
    }, [authState.token]);


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
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);
    const fetchData1 = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<MerchantData[]>("/finance/pendingpayout", {
                params: { ...queryParams, page, limit: pagination1.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setData1(response.data?.data ?? []);
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

    const [modalData, setModalData] = useState<MerchantData | null>(null)

    return (
        <div>
            <Modal
                isOpen={!!modalData}
                onClose={() => setModalData(null)}
                header={
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Settlement Details</h2>
                        <div className="flex gap-4">
                            {/*<Buttons*/}
                            {/*    label="Go to business"*/}
                            {/*    type="smOutlineButton"*/}
                            {/*/>*/}
                            {/*<Buttons*/}
                            {/*    onClick={() => requery(modalData?.id)}*/}
                            {/*    label={loading ? "Requerying..." : "Requery Payout"}*/}
                            {/*    fullWidth*/}
                            {/*    type="smOutlineButton"*/}
                            {/*    disabled={loading}  // Disable button when loading*/}
                            {/*/>*/}


                        </div>
                    </div>
                }
                scrollableContent={true}
            >
                {modalData ? (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(modalData).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <p className="text-sm text-gray-600 font-semibold">{key.replace(/_/g, " ").toUpperCase()}:</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {key.includes("created_at") || key.includes("updated_at")
                                            ? `${moment(value).format("MMMM Do YYYY, h:mm:ss a")}`
                                            : value ?? "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">Loading...</p>
                )}
            </Modal>
            <Header headerTitle={"All Merchants"} />
            <div className="p-4 mt-4">
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search Users..."
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
                    </div>
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
    );
};

export default Page;
