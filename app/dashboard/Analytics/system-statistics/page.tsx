"use client";

import React, { useState, useMemo } from "react";
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
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Smartphone,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    RefreshCw,
    Download
} from "lucide-react";

// Types
interface Currency {
    code: string;
    symbol: string;
    name: string;
}

interface StatisticsData {
    collection_count: number;
    collection_sum: number;
    collection_fee: number;
    collection_sys_fee: number;
    payout_count: number;
    payout_sum: number;
    payout_fee: number;
    payout_sys_fee: number;
    available_wallet_balance: number;
    pending_wallet_balance: number;
    system_balance: number;
    bank78: number;
    c_bank78: number;
    vfd: number;
    c_vfd: number;
    wema: number;
    c_wema: number;
    safehaven: number;
    c_safehaven: number;
    netbank: number;
    c_netbank: number;
    alatpay_card: number;
    alatpay_phone: number;
    safehaven_ussd: number;
    [key: string]: number;
}

interface MetricCardProps {
    label: string;
    value: number;
    currency: string;
    isCount?: boolean;
    icon?: React.ReactNode;
    trend?: number;
    color?: string;
}

// Constants
const CURRENCIES: Currency[] = [
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
];

const CHART_COLORS = {
    primary: "#10B981",
    secondary: "#6366F1",
    tertiary: "#F472B6",
    quaternary: "#F59E0B",
    quinary: "#3B82F6",
    senary: "#A855F7",
};

const PIE_COLORS = ["#10B981", "#6366F1", "#F472B6", "#F59E0B", "#3B82F6", "#A855F7"];

// Utility Functions
const getCurrencySymbol = (code: string): string => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "";
};

const formatCurrency = (value: number, currencyCode: string): string => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (value: number): string => {
    return value.toLocaleString();
};

// Components
const MetricCard: React.FC<MetricCardProps> = ({
                                                   label,
                                                   value,
                                                   currency,
                                                   isCount = false,
                                                   icon,
                                                   trend,
                                                   color = "green"
                                               }) => {
    const displayValue = isCount ? formatNumber(value) : formatCurrency(value, currency);
    const hasTrend = trend !== undefined;
    const isPositive = trend && trend > 0;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform`}>
                    {icon || <DollarSign className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />}
                </div>
                {hasTrend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-400`}>
                {displayValue}
            </p>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center py-20">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading statistics...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">This may take up to 2 minutes</p>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 dark:bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-gray-700">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value, currency)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Main Component
export default function SystemStatistics() {
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<StatisticsData | null>(null);
    const { authState } = useAuth();
    const [currency, setCurrency] = useState("NGN");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            toast.error("Please select a date");
            return;
        }

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
                toast.error(response.data.message || "Failed to fetch statistics.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to fetch statistics. Please try again.";
            toast.error(errorMessage);
            console.error("Statistics fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!stats) return;

        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistics-${selectedDate}-${currency}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully!");
    };

    // Chart Data
    const revenueChartData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "Collection", value: stats[`collection_sum_${currency}`] || stats.collection_sum || 0 },
            { name: "Payout", value: stats[`payout_sum_${currency}`] || stats.payout_sum || 0 },
            { name: "System Balance", value: stats[`system_balance_${currency}`] || stats.system_balance || 0 },
            { name: "Wallet Balance", value: stats[`available_wallet_balance_${currency}`] || stats.available_wallet_balance || 0 },
        ];
    }, [stats, currency]);

    const paymentMethodsData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "Card Payments", value: stats.alatpay_card || 0 },
            { name: "Mobile Money", value: stats.alatpay_phone || 0 },
            { name: "USSD", value: stats.safehaven_ussd || 0 },
            { name: "Bank Transfer", value: stats.payout_sum || 0 },
        ].filter(item => item.value > 0);
    }, [stats]);

    const bankDistributionData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "Bank78", value: stats.bank78 || 0, count: stats.c_bank78 || 0 },
            { name: "VFD", value: stats.vfd || 0, count: stats.c_vfd || 0 },
            { name: "WEMA", value: stats.wema || 0, count: stats.c_wema || 0 },
            { name: "SafeHaven", value: stats.safehaven || 0, count: stats.c_safehaven || 0 },
            { name: "NetBank", value: stats.netbank || 0, count: stats.c_netbank || 0 },
        ].filter(item => item.value > 0);
    }, [stats]);

    const summaryMetrics = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: "Total Collection",
                value: stats.collection_sum || 0,
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                color: "green",
                trend: 12.5
            },
            {
                label: "Total Payout",
                value: stats.payout_sum || 0,
                icon: <TrendingDown className="w-5 h-5 text-blue-600" />,
                color: "blue",
                trend: -5.2
            },
            {
                label: "Available Balance",
                value: stats.available_wallet_balance || 0,
                icon: <DollarSign className="w-5 h-5 text-purple-600" />,
                color: "purple"
            },
            {
                label: "System Balance",
                value: stats.system_balance || 0,
                icon: <Building2 className="w-5 h-5 text-indigo-600" />,
                color: "indigo"
            },
        ];
    }, [stats]);

    const detailedMetrics = useMemo(() => {
        if (!stats) return [];
        return [
            { label: "Collection Count", value: stats.collection_count, isCount: true, icon: <CreditCard className="w-5 h-5 text-green-600" /> },
            { label: "Collection Fee", value: stats.collection_fee, icon: <DollarSign className="w-5 h-5 text-green-600" /> },
            { label: "Collection System Fee", value: stats.collection_sys_fee, icon: <DollarSign className="w-5 h-5 text-green-600" /> },
            { label: "Payout Count", value: stats.payout_count, isCount: true, icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
            { label: "Payout Fee", value: stats.payout_fee, icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
            { label: "Payout System Fee", value: stats.payout_sys_fee, icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
            { label: "Pending Wallet Balance", value: stats.pending_wallet_balance, icon: <DollarSign className="w-5 h-5 text-yellow-600" /> },
            { label: "Card Payments", value: stats.alatpay_card, icon: <CreditCard className="w-5 h-5 text-purple-600" /> },
            { label: "Mobile Money", value: stats.alatpay_phone, icon: <Smartphone className="w-5 h-5 text-purple-600" /> },
            { label: "USSD Payments", value: stats.safehaven_ussd, icon: <Smartphone className="w-5 h-5 text-purple-600" /> },
            { label: "Bank78", value: stats.bank78, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "Bank78 Count", value: stats.c_bank78, isCount: true, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "VFD", value: stats.vfd, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "VFD Count", value: stats.c_vfd, isCount: true, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "WEMA", value: stats.wema, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "WEMA Count", value: stats.c_wema, isCount: true, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "SafeHaven", value: stats.safehaven, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "SafeHaven Count", value: stats.c_safehaven, isCount: true, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "NetBank", value: stats.netbank, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
            { label: "NetBank Count", value: stats.c_netbank, isCount: true, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
        ];
    }, [stats]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <Header headerTitle="System Statistics" />

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Title Section */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <TrendingUp className="w-8 h-8" />
                            System Statistics Dashboard
                        </h2>
                        <p className="text-green-50 mt-2">Comprehensive financial analytics and insights</p>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-end gap-4">
                            {/* Date Picker */}
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                                    required
                                />
                            </div>

                            {/* Currency Selector */}
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                                >
                                    {CURRENCIES.map((curr) => (
                                        <option key={curr.code} value={curr.code}>
                                            {curr.symbol} {curr.code} - {curr.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 w-full lg:w-auto">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 lg:flex-initial bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="w-5 h-5" />
                                            Fetch Statistics
                                        </>
                                    )}
                                </button>

                                {stats && (
                                    <button
                                        type="button"
                                        onClick={handleExport}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                                        title="Export data"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                        {loading && <LoadingSpinner />}

                        {stats && !loading && (
                            <div className="space-y-8">
                                {/* Date Display */}
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Showing statistics for
                                        </span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Currency: {currency}
                                    </span>
                                </div>

                                {/* Summary Cards */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                        Key Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {summaryMetrics.map((metric, idx) => (
                                            <MetricCard
                                                key={idx}
                                                label={metric.label}
                                                value={metric.value}
                                                currency={currency}
                                                icon={metric.icon}
                                                color={metric.color}
                                                trend={metric.trend}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Revenue Bar Chart */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <BarChart className="w-5 h-5 text-green-600" />
                                            Revenue Overview
                                        </h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={revenueChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#6B7280"
                                                    style={{ fontSize: '12px' }}
                                                />
                                                <YAxis
                                                    stroke="#6B7280"
                                                    style={{ fontSize: '12px' }}
                                                    tickFormatter={(val) => `${getCurrencySymbol(currency)}${(val / 1000).toFixed(0)}K`}
                                                />
                                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                                <Bar
                                                    dataKey="value"
                                                    fill="url(#colorGradient)"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                                <defs>
                                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                                                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                                    </linearGradient>
                                                </defs>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Payment Methods Pie Chart */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            Payment Methods
                                        </h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={paymentMethodsData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {paymentMethodsData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {paymentMethodsData.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <span
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300 truncate">
                                                        {entry.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bank Distribution */}
                                    {bankDistributionData.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
                                            <h4 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-indigo-600" />
                                                Bank Distribution
                                            </h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={bankDistributionData}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                                    <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                                                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#6366F1"
                                                        fillOpacity={1}
                                                        fill="url(#colorValue)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Metrics */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-6 h-6 text-purple-600" />
                                        Detailed Breakdown
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {detailedMetrics.map((metric, idx) => (
                                            <MetricCard
                                                key={idx}
                                                label={metric.label}
                                                value={metric.value || 0}
                                                currency={currency}
                                                isCount={metric.isCount}
                                                icon={metric.icon}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !stats && (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                    <TrendingUp className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    No Data Available
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Select a date and currency to view statistics
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

