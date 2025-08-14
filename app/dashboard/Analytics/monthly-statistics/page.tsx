"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/Analytics/system-statistics/Header";
import { useAuth } from "@/contexts/authContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ["#10B981", "#6366F1", "#F472B6", "#F59E0B", "#3B82F6", "#A855F7"];

export default function Monthlytatistics() {
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { authState } = useAuth();
    const [currency, setCurrency] = useState("NGN");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStats(null);

        try {
            const response = await axiosInstance.get(`/statistics/${currency}/${selectedDate}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 300000,
            });

            if (response.data.success) {
                setStats(response.data.data);
                toast.success("Statistics loaded successfully!");
            } else {
                toast.error("Failed to fetch statistics.");
            }
        } catch (error) {
            toast.error("Failed to fetch statistics.");
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            case "USD": return "$";
            case "EUR": return "€";
            case "GBP": return "£";
            case "NGN": return "₦";
            default: return "";
        }
    };
    const barChartData = [
        { name: "Collection", [currency]: stats?.[`collection_sum_${currency}`] || 0 },
        { name: "Payout", [currency]: stats?.[`payout_sum_${currency}`] || 0 },
        { name: "System Balance", [currency]: stats?.[`system_balance_${currency}`] || 0 },
        { name: "Wallet Balance", [currency]: stats?.[`available_wallet_balance_${currency}`] || 0 },
    ];

    const donutData = [
        { name: "Card", value: stats?.alatpay_card || 0 },
        { name: "Mobile Money", value: stats?.alatpay_phone || 0 },
        { name: "USSD", value: stats?.safehaven_ussd || 0 },
        { name: "Transfer Revenue", value: stats?.payout_fee || 0 },
        { name: "Bank Transfer", value: stats?.payout_sum || 0 },
    ];

    return (
        <div className="dark:bg-gray-950 min-h-screen py-10 px-4">
            <Header headerTitle="System Statistics" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 rounded-xl py-10 px-4">
                <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-center text-green-600">System Statistics</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
                        <input
                            type="month"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="p-3 border rounded-md w-full md:w-1/2 focus:ring-2 focus:ring-green-400"
                            required
                        />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="p-3 border rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        >
                            <option value="NGN">NGN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-600 transition text-white px-6 py-3 rounded-md w-full md:w-auto"
                        >
                            {loading ? "Loading..." : "Fetch Statistics"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 italic">
                        * May take up to 2 minutes to load data
                    </p>

                    {loading && (
                        <div className="flex justify-center items-center py-10">
                            <div
                                className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {stats && (
                        <div className="space-y-10">
                            <h3 className="text-lg text-center font-semibold text-gray-700">
                                Showing stats for <span className="text-green-600">{selectedDate}</span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Bar Chart */}
                                <div
                                    className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                                    <h4 className="font-semibold text-center mb-4">Total Revenue</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                            <XAxis dataKey="name" stroke="#8884d8"/>
                                            <YAxis
                                                tickFormatter={(val) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                                stroke="#8884d8"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    color: "#fff"
                                                }}
                                                formatter={(val: number) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                            />
                                            <Legend/>
                                            <Bar dataKey={currency} fill="#3B82F6"/>
                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>

                                {/* Donut Chart */}
                                <div
                                    className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 flex flex-col justify-center items-center">
                                    <h4 className="font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">Revenue Breakdown</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {donutData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    color: "#fff"
                                                }}
                                                formatter={(val: number) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                        {donutData.map((entry, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{backgroundColor: COLORS[index % COLORS.length]}}
                        />
                                                <span>{entry.name} - ₦{Number(entry.value).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                {[
                                    {label: "Collection Count", value: stats.collection_count},
                                    {label: "Collection Sum", value: stats.collection_sum},
                                    {label: "Collection Fee", value: stats.collection_fee},
                                    {label: "Collection System Fee", value: stats.collection_sys_fee},
                                    {label: "Payout Count", value: stats.payout_count},
                                    {label: "Payout Sum", value: stats.payout_sum},
                                    {label: "Payout Fee", value: stats.payout_fee},
                                    {label: "Payout System Fee", value: stats.payout_sys_fee},
                                    {label: "Available Wallet Balance", value: stats.available_wallet_balance},
                                    {label: "Pending Wallet Balance", value: stats.pending_wallet_balance},
                                    {label: "System Balance", value: stats.system_balance},
                                    {label: "Bank78", value: stats.bank78},
                                    {label: "Bank78 Count", value: stats.c_bank78},
                                    {label: "VFD", value: stats.vfd},
                                    {label: "VFD Count", value: stats.c_vfd},
                                    {label: "WEMA", value: stats.wema},
                                    {label: "WEMA Count", value: stats.c_wema},
                                    {label: "SafeHaven", value: stats.safehaven},
                                    {label: "SafeHaven Count", value: stats.c_safehaven},
                                    {label: "NetBank", value: stats.netbank},
                                    {label: "NetBank Count", value: stats.c_netbank},
                                    {label: "AlatPay Card", value: stats.alatpay_card},
                                    {label: "AlatPay Phone", value: stats.alatpay_phone},
                                    {label: "SafeHaven USSD", value: stats.safehaven_ussd},
                                ].map((item, idx) => {
                                    const isCount = item.label.toLowerCase().includes("count");
                                    const value = item.value ?? 0;
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-green-50 dark:bg-gray-900 border border-green-100 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                                        >
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                                            <p className="text-green-700 dark:text-green-400 font-bold mt-1">
                                                {isCount
                                                    ? Number(value).toLocaleString()
                                                    : `${getCurrencySymbol(currency)}${Number(value).toLocaleString()}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
