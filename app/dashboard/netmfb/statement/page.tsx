"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import Header from "./Header";
import { FileSpreadsheet } from "lucide-react";

const Table = dynamic(() => import("@/components/table"), { ssr: false });
const Modal = dynamic(() => import("@/components/modal"), { ssr: false });

const TABLE_COLUMNS = [
    { key: "postingReferenceNumber", label: "Posting Ref", id: "postingReferenceNumber", type: "text" },
    { key: "debit", label: "Debit", id: "debit", type: "number" },
    { key: "credit", label: "Credit", id: "credit", type: "number" },
    { key: "balance", label: "Balance", id: "balance", type: "number" },
    { key: "transactionDate", label: "Trans Date", id: "transactionDate", type: "text" },
    { key: "narration", label: "Narration", id: "narration", type: "text" },
];

interface Transaction {
    postingReferenceNumber: string;
    transactionDate: string;
    debit: number;
    credit: number;
    balance: number;
    narration: string;
}

interface AccountDetails {
    accountName: string;
    address: string;
    accountNumber: string;
    product: string;
    openingBalance: number;
    closingBalance: number;
    totalCredit: number;
    totalDebit: number;
    recordCount: number;
}

const Netmfbstatement: React.FC = () => {
    const [data, setData] = useState<Transaction[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
    const { authState } = useAuth();
    const [modalData, setModalData] = useState<Transaction | null>(null);

    const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const response = await axiosInstance.get(
                `/net/account_statement/${getFormattedDate(startDate)}/${getFormattedDate(endDate)}`,
                { headers: { Authorization: `Bearer ${authState.token}` },
                timeout:30000
                }
            );
            const responseData = response.data?.data ?? { data: [] };
            setData(responseData.data || []);
            setAccountDetails(responseData);
        } catch (error: any) {
            console.error("Error fetching data:", error.response?.data || error.message);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    });

    const transformData = (data: Transaction[]) =>
        data
            .map((row) => ({
                postingReferenceNumber: row.postingReferenceNumber,
                transactionDate: new Date(row.transactionDate).toLocaleString(),
                debit: (row.debit / 100).toLocaleString(),
                credit: (row.credit / 100).toLocaleString(),
                balance: (row.balance / 100).toLocaleString(),
                narration: row.narration,
            }))
            .filter((row) =>
                Object.values(row)
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );

    const exportToExcel = () => {
        const transformedData = transformData(data) || [];
        if (transformedData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(transformedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, "NetMFB_Statement.xlsx");
    };

    return (
        <>
            <Header headerTitle="NetMFB Statement" />
            <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-100">
                {/* Filters */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-end">
                    {[
                        { label: "Start Date", value: startDate, setter: setStartDate },
                        { label: "End Date", value: endDate, setter: setEndDate },
                    ].map(({ label, value, setter }) => (
                        <div className="w-full sm:w-1/3" key={label}>
                            <label className="block text-sm font-medium mb-1">{label}:</label>
                            <input
                                type="date"
                                value={getFormattedDate(value)}
                                onChange={(e) => setter(new Date(e.target.value))}
                                className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    ))}

                    <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium mb-1">Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Search transactions..."
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap mt-4">
                        <button
                            onClick={fetchData}
                            disabled={isFetching}
                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded shadow"
                        >
                            {isFetching ? "Fetching..." : "Fetch Statement"}
                        </button>

                        <button
                            onClick={() => {
                                setStartDate(new Date());
                                setEndDate(new Date());
                                setSearchTerm("");
                                fetchData();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded shadow"
                        >
                            Refresh
                        </button>

                        <button
                            onClick={exportToExcel}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded shadow flex items-center gap-2"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Account Info */}
                {accountDetails && (
                    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 w-full max-w-2xl mx-auto mt-6">
                        <h2 className="text-lg font-semibold">{accountDetails.accountName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{accountDetails.address}</p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {[
                                ["Account Number", accountDetails.accountNumber],
                                ["Product", accountDetails.product],
                                ["Opening Balance", `₦${(accountDetails.openingBalance / 100).toLocaleString()}`],
                                ["Closing Balance", `₦${(accountDetails.closingBalance / 100).toLocaleString()}`],
                                ["Total Credit", `₦${(accountDetails.totalCredit / 100).toLocaleString()}`],
                                ["Total Debit", `₦${(accountDetails.totalDebit / 100).toLocaleString()}`],
                                ["Total Count", accountDetails.recordCount.toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-base font-semibold">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <Table
                        headers={TABLE_COLUMNS as any}
                        data={transformData(data) as any}
                        onRowClick={setModalData as any}
                        loading={isFetching}
                        limit={1000000}
                    />
                </div>

                {/* Modal */}
                <Modal isOpen={!!modalData} onClose={() => setModalData(null)} header={<h2 className="text-xl font-semibold">Statement Detail</h2>}>
                    {modalData ? (
                        <p>{modalData.narration}</p>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">Loading details...</p>
                    )}
                </Modal>
            </div>
        </>
    );
};

export default Netmfbstatement;
