"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { toast } from "react-hot-toast";
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ArrowDownUp,
    Users,
    Calendar,
    RefreshCcw,
    Download,
    Filter,
    Activity,
    CreditCard,
    Wallet,
    BarChart3,
    Loader2,
    ChevronRight,
} from "lucide-react";
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
    AreaChart,
    Area,
} from "recharts";
import Header from "./Header";

const formatCurrency = (amount: number, currency: string) =>
    currency === "NGN"
        ? `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : currency === "KES"
            ? `KSh${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

interface StatCardProps {
    title: string;
    value: number;
    percentage: number;
    currency: string;
    isCount?: boolean;
    icon: React.ReactNode;
    gradient: string;
    accentColor: string;
}

const StatCard = ({
                      title,
                      value,
                      percentage,
                      currency,
                      isCount = false,
                      icon,
                      gradient,
                      accentColor,
                  }: StatCardProps) => {
    const isPositive = percentage >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isPositive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                        <Icon className="w-3.5 h-3.5" />
                        {Math.abs(percentage).toFixed(2)}%
                    </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {title}
                </h4>

                {/* Value */}
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCount
                        ? value.toLocaleString()
                        : formatCurrency(value, currency)}
                </p>

                {/* Trend Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isPositive ? "↑" : "↓"} vs previous period
                    </span>
                </div>
            </div>
        </div>
    );
};

const end = new Date();
const start = new Date();
start.setDate(end.getDate() - 1);

export default function OverviewDashboard() {
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState("NGN");
    const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
    const [showFilters, setShowFilters] = useState(false);
    const { authState } = useAuth();

    const currencies = [
        { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
        { code: "USD", symbol: "$", name: "US Dollar" },
        { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    ];

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
                setChartData(chartRes.data.data);
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

    const statCards = data ? [
        {
            title: "Pay-In Transactions",
            value: data.transactionCounts.payIn.value,
            percentage: data.transactionCounts.payIn.percentageChange,
            isCount: true,
            icon: <ArrowDownRight className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
            accentColor: "blue",
        },
        {
            title: "Pay-Out Transactions",
            value: data.transactionCounts.payOut.value,
            percentage: data.transactionCounts.payOut.percentageChange,
            isCount: true,
            icon: <ArrowUpRight className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
            accentColor: "purple",
        },
        {
            title: "Total Transactions",
            value: data.transactionCounts.total.value,
            percentage: data.transactionCounts.total.percentageChange,
            isCount: true,
            icon: <Activity className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
            accentColor: "indigo",
        },
        {
            title: "Pay-In Volume",
            value: data.transactionValue.payIn.value,
            percentage: data.transactionValue.payIn.percentageChange,
            isCount: false,
            icon: <Wallet className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            accentColor: "emerald",
        },
        {
            title: "Pay-Out Volume",
            value: data.transactionValue.payOut.value,
            percentage: data.transactionValue.payOut.percentageChange,
            isCount: false,
            icon: <CreditCard className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
            accentColor: "orange",
        },
        {
            title: "Total Volume",
            value: data.transactionValue.total.value,
            percentage: data.transactionValue.total.percentageChange,
            isCount: false,
            icon: <DollarSign className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
            accentColor: "teal",
        },
        {
            title: "Total Revenue",
            value: data.revenue.value,
            percentage: data.revenue.percentageChange,
            isCount: false,
            icon: <TrendingUp className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-green-500 to-green-600",
            accentColor: "green",
        },
        {
            title: "Active Merchants",
            value: data.merchants.value,
            percentage: data.merchants.percentageChange,
            isCount: true,
            icon: <Users className="w-6 h-6 text-white" />,
            gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
            accentColor: "pink",
        },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header headerTitle="Overview Dashboard" />

            <div className="p-6 space-y-6">
                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Title Section */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Overview Dashboard
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Monitor your transaction metrics and business performance
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors text-sm"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
                            >
                                <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Start Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        End Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Currency
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                        >
                                            {currencies.map((cur) => (
                                                <option key={cur.code} value={cur.code}>
                                                    {cur.symbol} {cur.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading dashboard data...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        {data && (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {statCards.map((card, index) => (
                                    <StatCard
                                        key={index}
                                        title={card.title}
                                        value={card.value}
                                        percentage={card.percentage}
                                        currency={currency}
                                        isCount={card.isCount}
                                        icon={card.icon}
                                        gradient={card.gradient}
                                        accentColor={card.accentColor}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Chart Section */}
                        {chartData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                            <BarChart3 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Transaction Trends
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Daily transaction volume over time
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            style={{ fontSize: "12px" }}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            allowDecimals={false}
                                            style={{ fontSize: "12px" }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "12px",
                                                padding: "12px",
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            }}
                                            formatter={(value: any) => [`${value} Transactions`, "Count"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#colorCount)"
                                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
