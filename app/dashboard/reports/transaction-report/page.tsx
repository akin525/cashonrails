"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/authContext";
import { MetricCard } from "@/components/MatricCard";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import { Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { FiDownloadCloud } from "react-icons/fi";

export default function TransactionReport() {
    const [selectedDate, setSelectedDate] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { authState } = useAuth();

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case "USD":
                return "$";
            case "GBP":
                return "£";
            case "NGN":
                return "₦";
            default:
                return "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStats(null);

        try {
            const response = await axiosInstance.get(`/report/transaction/${currency}/${selectedDate}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data.success) {
                setStats(response.data.data);
                toast.success("Transaction Report loaded successfully!");
            } else {
                toast.error("Failed to fetch statistics.");
            }
        } catch (error) {
            toast.error("Failed to fetch statistics.");
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
        return num.toFixed(2);
    };

    const chartData = stats
        ? [
            { name: "Amount", value: stats.totalAmount },
            { name: "Fee", value: stats.totalFee },
            { name: "System Fee", value: stats.totalSysFee },
            { name: "Stamp Duty", value: stats.stampDuty },
        ]
        : [];

    const handleExport = () => {
        const data = chartData.map((item) => ({
            Metric: item.name,
            Amount: item.value,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction Report");
        XLSX.writeFile(workbook, `Transaction_Report_${selectedDate}.xlsx`);
    };

    const exportPDF = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] py-10 px-4 text-gray-900 dark:text-gray-100">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Transaction Report</h1>
                        <p className="text-sm opacity-90">Generate detailed monthly statistics</p>
                    </div>
                    <BarChart3 className="h-10 w-10 opacity-80" />
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow space-y-4"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-1/3">
                            <Calendar className="text-gray-500 dark:text-gray-400" />
                            <input
                                type="month"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                        </div>

                        {/* Currency Selector */}
                        <div className="flex items-center gap-2 w-full md:w-1/3">
                            <label htmlFor="currency" className="text-sm text-gray-700 dark:text-gray-300">Currency:</label>
                            <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                <option value="NGN">NGN - Naira</option>
                                <option value="USD">USD - Dollar</option>
                                <option value="GBP">GBP - Pound</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 transition text-white font-medium px-6 py-2 rounded-md w-full md:w-auto"
                        >
                            {loading ? "Loading..." : "Generate Report"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        * Processing may take 30 seconds to 2 minutes
                    </p>
                </form>

                {/* Statistics */}
                {stats ? (
                    <>
                        <div className="flex justify-end gap-2 mb-4">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                <FiDownloadCloud /> Export CSV
                            </button>
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                <FiDownloadCloud /> Print / PDF
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                            {[
                                { title: "Total Count", value: stats.totalCount, isMoney: false },
                                { title: "Total Amount", value: stats.totalAmount, isMoney: true },
                                { title: "Total Fee", value: stats.totalFee, isMoney: true },
                                { title: "System Fee", value: stats.totalSysFee, isMoney: true },
                                { title: "Stamp Duty", value: stats.stampDuty, isMoney: true },
                            ].map((card, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <MetricCard
                                        title={card.title}
                                        count={(card.isMoney ? getCurrencySymbol(currency) : "") + formatNumber(card.value || 0)}
                                        isLoading={loading}
                                        variant="success"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mt-10"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-center">Transaction Breakdown</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `${getCurrencySymbol(currency)}${formatNumber(value)}`} />
                                        <Tooltip formatter={(value: any) => `${getCurrencySymbol(currency)}${formatNumber(value)}`} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#22c55e"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </>
                ) : loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 animate-pulse">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
