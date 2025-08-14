"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/Analytics/system-statistics/Header";
import { useAuth } from "@/contexts/authContext";
import { MetricCard } from "@/components/MatricCard";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CSVLink } from "react-csv";

export default function PayoutReport() {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("NGN");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { authState } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStats(null);

        try {
            const response = await axiosInstance.get(`/report/payout/${selectedCurrency}/${selectedDate}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data.success) {
                setStats(response.data.data);
                toast.success("Statistics loaded successfully!");
            } else {
                toast.error("Failed to fetch statistics.");
            }
        } catch {
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

    const getCurrencySymbol = (currency: string) => {
        switch (currency) {
            case "USD": return "$";
            case "GBP": return "£";
            default: return "₦";
        }
    };

    const downloadPDF = () => {
        window.print();
    };

    const chartData = stats
        ? [
            { name: "Amount", value: stats.totalAmount },
            { name: "Fee", value: stats.totalFee },
            { name: "System Fee", value: stats.totalSysFee },
        ]
        : [];

    return (
        <div className="p-6 bg-white dark:bg-[#0c151d] min-h-screen">
            <Header headerTitle="Payout Report" />

            <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#182630] p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-green-500">Report</h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="month"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white"
                            required
                        />

                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="NGN">NGN (₦)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>

                        <button
                            type="submit"
                            className="w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Submit"}
                        </button>
                    </div>
                </form>

                <p className="text-sm text-center text-gray-500 mt-2">
                    * Might take about 30 seconds - 2 minutes
                </p>

                {stats && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                                Payout Monthly for {selectedDate} ({selectedCurrency})
                            </h3>
                            <div className="space-x-2">
                                <button onClick={downloadPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                    Export PDF
                                </button>
                                <CSVLink
                                    filename={`payout_report_${selectedDate}_${selectedCurrency}.csv`}
                                    data={[
                                        ["Metric", "Value"],
                                        ["Total Count", stats.totalCount],
                                        ["Total Amount", stats.totalAmount],
                                        ["Total Fee", stats.totalFee],
                                        ["System Fee", stats.totalSysFee],
                                    ]}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Export CSV
                                </CSVLink>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { title: "Total Count", value: stats.totalCount, isMoney: false },
                                { title: "Total Amount", value: stats.totalAmount, isMoney: true },
                                { title: "Total Fee", value: stats.totalFee, isMoney: true },
                                { title: "System Fee", value: stats.totalSysFee, isMoney: true },
                            ].map((card, idx) => (
                                <MetricCard
                                    key={idx}
                                    count={(card.isMoney ? getCurrencySymbol(selectedCurrency) : "") + formatNumber(card.value || 0)}
                                    title={card.title}
                                    isLoading={loading}
                                    variant="success"
                                />
                            ))}
                        </div>

                        <div className="mt-8 bg-white dark:bg-[#1f2a37] p-4 rounded-lg shadow-md">
                            <h4 className="text-lg font-medium mb-4 text-center text-gray-800 dark:text-white">Payout Overview</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any) => `${getCurrencySymbol(selectedCurrency)}${formatNumber(value)}`}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
