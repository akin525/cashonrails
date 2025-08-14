"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { toast } from "react-hot-toast";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import Header from "./Header";

const formatCurrency = (amount: number, currency: string) =>
    currency === "NGN"
        ? `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const StatCard = ({
                      title,
                      value,
                      percentage,
                      currency,
                      isCount = false,
                  }: {
    title: string;
    value: number;
    percentage: number;
    currency: string;
    isCount?: boolean;
}) => {
    const isPositive = percentage >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="rounded-2xl p-5 shadow bg-white dark:bg-[#1e2a35] text-gray-800 dark:text-gray-100 transition">
            <h4 className="text-sm font-medium mb-2">{title}</h4>
            <p className="text-2xl font-bold">
                {isCount
                    ? value.toLocaleString()
                    : formatCurrency(value, currency)}
            </p>
            <div
                className={`flex items-center text-sm mt-1 ${
                    isPositive ? "text-green-500" : "text-red-500"
                }`}
            >
                <Icon className="w-4 h-4 mr-1" />
                {percentage.toFixed(2)}%
            </div>
        </div>
    );
};

const end = new Date();
const start = new Date();
start.setMonth(end.getMonth() - 1);

export default function OverviewDashboard() {
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState("NGN");
    const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
    const { authState } = useAuth();

    const currencies = ["USD", "NGN"];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, chartRes] = await Promise.all([
                axiosInstance.get(
                    `overviewnew2/?start_date=${startDate}&end_date=${endDate}&currency=${currency}`,
                    {
                        headers: { Authorization: `Bearer ${authState.token}` },
                        timeout: 90000,
                    }
                ),
                axiosInstance.get(
                    `chart?start_date=${startDate}&end_date=${endDate}`,
                    {
                        headers: { Authorization: `Bearer ${authState.token}` },
                        timeout: 90000,
                    }
                ),
            ]);

            if (overviewRes.data.status) {
                setData(overviewRes.data.data);
            } else {
                toast.error("Failed to load overview.");
            }

            if (chartRes.data.status) {
                setChartData(chartRes.data.data); // ✅ directly using correct format
            } else {
                toast.error("Failed to load chart.");
            }
        } catch (error) {
            toast.error("Error loading data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currency, startDate, endDate]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0c151d] text-gray-900 dark:text-white p-6">
            <Header headerTitle="Overview Dashboard" />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">Overview Dashboard</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <label className="text-sm block mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-white dark:bg-[#1e2a35] border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm block mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-white dark:bg-[#1e2a35] border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm block mb-1">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-white dark:bg-[#1e2a35] border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        >
                            {currencies.map((cur) => (
                                <option key={cur} value={cur}>
                                    {cur}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                </div>
            ) : (
                <>
                    {data && (
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10">
                            <StatCard title="Pay-In Count" value={data.transactionCounts.payIn.value} percentage={data.transactionCounts.payIn.percentageChange} isCount currency={currency} />
                            <StatCard title="Pay-Out Count" value={data.transactionCounts.payOut.value} percentage={data.transactionCounts.payOut.percentageChange} isCount currency={currency} />
                            <StatCard title="Total Txn Count" value={data.transactionCounts.total.value} percentage={data.transactionCounts.total.percentageChange} isCount currency={currency} />

                            <StatCard title="Pay-In Value" value={data.transactionValue.payIn.value} percentage={data.transactionValue.payIn.percentageChange} currency={currency} />
                            <StatCard title="Pay-Out Value" value={data.transactionValue.payOut.value} percentage={data.transactionValue.payOut.percentageChange} currency={currency} />
                            <StatCard title="Total Txn Value" value={data.transactionValue.total.value} percentage={data.transactionValue.total.percentageChange} currency={currency} />
                            <StatCard title="Revenue" value={data.revenue.value} percentage={data.revenue.percentageChange} currency={currency} />
                            <StatCard title="Merchants" value={data.merchants.value} percentage={data.merchants.percentageChange} isCount currency={currency} />
                        </div>
                    )}

                    {chartData.length > 0 && (
                        <div className="bg-white dark:bg-[#1e2a35] p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Channel Transaction Chart</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="date" stroke="#888" />
                                    <YAxis stroke="#888" allowDecimals={false} />
                                    <Tooltip formatter={(value: any) => `${value} Txns`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={true} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
