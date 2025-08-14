"use client";
import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { toast } from "react-hot-toast";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import Header from "./Header";

interface MerchantSummary {
    count: number;
    change: number;
}

interface MerchantBarChartItem {
    month: string;
    total: number;
    summary: {
        total_transactions_count: number;
        total_transaction_value: number;
        total_revenue: number;
    };
}

interface TopMerchant {
    merchant: string;
    txn_volume: string;
}

export default function MerchantDashboard() {
    const { authState } = useAuth();
    const token = authState?.token;

    const [summary, setSummary] = useState<{
        total_merchants: MerchantSummary;
        active_merchants: MerchantSummary;
        inactive_merchants: MerchantSummary;
        new_merchants: MerchantSummary;
    } | null>(null);

    const [chartData, setChartData] = useState<MerchantBarChartItem[]>([]);
    const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [topMerchantLoading, setTopMerchantLoading] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(sevenDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setSummaryLoading(true);
        try {
            const res = await axiosInstance.get("overview-merchant", {
                params: { start_date: startDate, end_date: endDate },
                headers: { Authorization: `Bearer ${token}` },
                timeout: 90000,
            });
            const { data } = res.data;
            setSummary(data.summary);
            setChartData(data.charts.merchant_bar_chart);
        } catch (error) {
            toast.error("Failed to fetch merchant dashboard");
        } finally {
            setSummaryLoading(false);
        }
    }, [token, startDate, endDate]);

    const fetchTopMerchants = useCallback(async () => {
        setTopMerchantLoading(true);
        try {
            const res = await axiosInstance.get(
                `top-merchant?start_date=${startDate}&end_date=${endDate}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 90000,
                }
            );

            const result = await res.data;
            setTopMerchants(result.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch top merchants");
        } finally {
            setTopMerchantLoading(false);
        }
    }, [token, startDate, endDate]);

    useEffect(() => {
        fetchData();
        fetchTopMerchants();
    }, [fetchData, fetchTopMerchants]);

    const StatCard = ({
                          label,
                          count,
                          change,
                          isLoading,
                      }: {
        label: string;
        count: number;
        change: number;
        isLoading: boolean;
    }) => {
        if (isLoading) {
            return (
                <div className="rounded-2xl p-6 bg-white dark:bg-[#1e2a35] shadow animate-pulse h-32" />
            );
        }

        const isPositive = change >= 0;
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

        return (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#1e2a35] shadow hover:shadow-lg transition-all duration-300 text-gray-800 dark:text-white">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">{label}</h4>
                <p className="text-3xl font-bold">{count.toLocaleString()}</p>
                <div className={`flex items-center mt-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    <Icon className="w-4 h-4 mr-1" />
                    {change.toFixed(2)}%
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-[#0c151d] min-h-screen">
            <Header headerTitle="Overview" />
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">📊 Business Overview</h2>

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <label className="text-sm text-gray-700 dark:text-gray-300">Start:</label>
                <input
                    type="date"
                    className="border rounded px-3 py-1 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <label className="text-sm text-gray-700 dark:text-gray-300">End:</label>
                <input
                    type="date"
                    className="border rounded px-3 py-1 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <button
                    onClick={() => {
                        fetchData();
                        fetchTopMerchants();
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                >
                    Refresh
                </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Showing data from <strong>{new Date(startDate).toLocaleDateString()}</strong> to{" "}
                <strong>{new Date(endDate).toLocaleDateString()}</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Total Merchants"
                    count={summary?.total_merchants.count || 0}
                    change={summary?.total_merchants.change || 0}
                    isLoading={summaryLoading}
                />
                <StatCard
                    label="Active Merchants"
                    count={summary?.active_merchants.count || 0}
                    change={summary?.active_merchants.change || 0}
                    isLoading={summaryLoading}
                />
                <StatCard
                    label="Inactive Merchants"
                    count={summary?.inactive_merchants.count || 0}
                    change={summary?.inactive_merchants.change || 0}
                    isLoading={summaryLoading}
                />
                <StatCard
                    label="New Merchants"
                    count={summary?.new_merchants.count || 0}
                    change={summary?.new_merchants.change || 0}
                    isLoading={summaryLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-white dark:bg-[#1e2a35] p-6 rounded-2xl shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        📈 Monthly New Merchants
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis allowDecimals={false} stroke="#888" />
                            <Tooltip formatter={(value: any) => [value, "New Merchants"]} />
                            <Line type="monotone" dataKey="total" stroke="#264d3c" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-[#1e2a35] p-6 rounded-2xl shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        🏆 Top Merchants by Volume
                    </h3>

                    {topMerchantLoading ? (
                        <ul className="space-y-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <li
                                    key={index}
                                    className="h-16 bg-gray-200 dark:bg-[#2f3f4c] animate-pulse rounded-lg"
                                />
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-4">
                            {topMerchants.map((merchant, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 dark:bg-[#264d3c] p-4 rounded-lg shadow-sm hover:shadow transition"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                                            {merchant.merchant
                                                .split(" ")
                                                .map((word) => word[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{merchant.merchant}</p>
                                            <p className="text-xs text-gray-300 dark:text-gray-200">Volume</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-green-500 dark:text-green-300">
                                        ₦{merchant.txn_volume}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
