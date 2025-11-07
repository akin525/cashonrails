"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";
import {
    Calculator,
    TrendingUp,
    Wallet,
    FileText,
    Building2,
    DollarSign,
    Calendar,
    Filter,
    Sparkles,
    BarChart3,
    ArrowRightLeft,
    PieChart,
    Activity,
    Search,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info,
    RefreshCcw,
} from "lucide-react";

interface CalculationResult {
    [key: string]: number | string;
}

export default function SystemCalculator() {
    const { authState } = useAuth();
    const [calculationType, setCalculationType] = useState("System Transaction Calculator");
    const [businessID, setBusinessID] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [transactionType, setTransactionType] = useState("settlement");
    const [dateType, setDateType] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CalculationResult | null>(null);

    const calculationOptions = [
        {
            name: "System Transaction Calculator",
            value: "transaction-calculator",
            icon: <ArrowRightLeft className="w-5 h-5" />,
            gradient: "from-blue-500 to-blue-600",
            description: "Calculate transaction metrics and fees"
        },
        {
            name: "System Payout Calculator",
            value: "payout-calculator",
            icon: <TrendingUp className="w-5 h-5" />,
            gradient: "from-emerald-500 to-emerald-600",
            description: "Analyze payout transactions and costs"
        },
        {
            name: "System Settlement Calculator",
            value: "settlement-calculator",
            icon: <FileText className="w-5 h-5" />,
            gradient: "from-purple-500 to-purple-600",
            description: "Review settlement summaries"
        },
        {
            name: "System Wallet Transaction Calculator",
            value: "wallet-transaction-calculator",
            icon: <Wallet className="w-5 h-5" />,
            gradient: "from-orange-500 to-orange-600",
            description: "Track wallet transaction activity"
        },
    ];

    const transactionOptions = [
        { name: "Settlement", value: "settlement", icon: <FileText className="w-4 h-4" /> },
        { name: "Payout", value: "payout", icon: <TrendingUp className="w-4 h-4" /> },
        { name: "BVN", value: "bvn", icon: <CheckCircle2 className="w-4 h-4" /> },
        { name: "Bills", value: "bills", icon: <Activity className="w-4 h-4" /> },
        { name: "Payout Reversal", value: "payout_reversal", icon: <RefreshCcw className="w-4 h-4" /> },
        { name: "Refund", value: "refund", icon: <ArrowRightLeft className="w-4 h-4" /> },
        { name: "Funding", value: "funding", icon: <Wallet className="w-4 h-4" /> }
    ];

    const currencyOptions = [
        { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", symbol: "₦" },
        { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
        { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
        { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", symbol: "GH₵" },
        { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", symbol: "KSh" },
        { code: "ZAR", name: "South African Rand", flag: "🇿🇦", symbol: "R" },
        { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", symbol: "E£" },
        { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿", symbol: "TSh" },
        { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬", symbol: "USh" },
        { code: "XOF", name: "West African CFA Franc", flag: "🌍", symbol: "CFA" },
        { code: "XAF", name: "Central African CFA Franc", flag: "🌍", symbol: "FCFA" },
    ];

    const endpointMap: Record<string, string> = {
        "System Transaction Calculator": "/transactions-cal",
        "System Payout Calculator": "/payout-cal",
        "System Wallet Transaction Calculator": "/wallettransaction-cal",
        "System Settlement Calculator": "/settlement-cal",
    };

    const endpoint = endpointMap[calculationType] || "/transactions-cal";
    const selectedOption = calculationOptions.find(opt => opt.name === calculationType);
    const selectedCurrency = currencyOptions.find(cur => cur.code === currency);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!businessID) {
            toast.error("Business ID is required");
            return;
        }

        if (dateType === "Range" && (!startDate || !endDate)) {
            toast.error("Please select both start and end dates");
            return;
        }

        setLoading(true);
        setResults(null);

        const requestData: any = {
            business_id: businessID,
            currency,
            type: dateType,
        };

        if (dateType === "Range") {
            requestData.from_date = startDate;
            requestData.to_date = endDate;
        }

        if (calculationType === "System Wallet Transaction Calculator") {
            requestData.source = transactionType;
        }

        try {
            const response = await axiosInstance.post(endpoint, requestData, {
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 30000,
            });

            setResults(response.data.data);
            toast.success("Calculation completed successfully!");
        } catch (error: any) {
            console.error("Error fetching calculator:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch calculator data");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setBusinessID("");
        setCurrency("NGN");
        setTransactionType("settlement");
        setDateType("all");
        setStartDate("");
        setEndDate("");
        setResults(null);
        toast.success("Form reset successfully");
    };

    const formatValue = (key: string, value: number | string): string => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes("count") || keyLower.includes("number")) {
            return typeof value === "number" ? value.toLocaleString() : String(value);
        }
        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        return `${selectedCurrency?.symbol || currency} ${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getCategoryIcon = (key: string) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes("fee")) return <DollarSign className="w-4 h-4 text-amber-600" />;
        if (keyLower.includes("count")) return <BarChart3 className="w-4 h-4 text-blue-600" />;
        if (keyLower.includes("total") || keyLower.includes("sum")) return <PieChart className="w-4 h-4 text-emerald-600" />;
        if (keyLower.includes("revenue")) return <TrendingUp className="w-4 h-4 text-purple-600" />;
        return <Activity className="w-4 h-4 text-gray-600" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header headerTitle="System Calculator" />

            <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-8 lg:p-12 shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                                <Calculator className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                    System Calculator
                                </h1>
                                <p className="text-emerald-50 text-lg">
                                    Powerful financial analytics and calculation tools
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculator Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {calculationOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setCalculationType(option.name)}
                            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                                calculationType === option.name
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg scale-105"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 hover:shadow-md"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                {option.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {option.name.replace("System ", "")}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {option.description}
                            </p>
                            {calculationType === option.name && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${selectedOption?.gradient} p-6`}>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                                {selectedOption?.icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{calculationType}</h2>
                                <p className="text-white/80 text-sm">{selectedOption?.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Business ID */}
                            <div className="lg:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    Business ID
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={businessID}
                                        onChange={(e) => setBusinessID(e.target.value)}
                                        placeholder="Enter business ID"
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Currency Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    {currencyOptions.map((cur) => (
                                        <option key={cur.code} value={cur.code}>
                                            {cur.flag} {cur.name} ({cur.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Type */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <Filter className="w-4 h-4 text-emerald-600" />
                                    Date Filter
                                </label>
                                <select
                                    value={dateType}
                                    onChange={(e) => setDateType(e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">All Time</option>
                                    <option value="Range">Date Range</option>
                                </select>
                            </div>

                            {/* Transaction Type (Wallet Calculator Only) */}
                            {calculationType === "System Wallet Transaction Calculator" && (
                                <div className="lg:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        <Activity className="w-4 h-4 text-emerald-600" />
                                        Transaction Source
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {transactionOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setTransactionType(option.value)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                    transactionType === option.value
                                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300"
                                                }`}
                                            >
                                                {option.icon}
                                                <span className="text-sm font-medium">{option.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date Range Inputs */}
                            {dateType === "Range" && (
                                <>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            max={endDate || undefined}
                                            className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate || undefined}
                                            className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Calculate Results
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                {results && Object.keys(results).length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
                        {/* Results Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Calculation Results</h3>
                                        <p className="text-emerald-50 text-sm">
                                            {Object.keys(results).length} metrics calculated
                                        </p>
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white rounded-xl transition-all">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {Object.entries(results).slice(0, 6).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(key)}
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                    {key.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatValue(key, value)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Table */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 overflow-hidden">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    Detailed Breakdown
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Metric
                                            </th>
                                            <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Value
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {Object.entries(results).map(([key, value], index) => (
                                            <tr
                                                key={key}
                                                className="hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {getCategoryIcon(key)}
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                                {key.replace(/_/g, " ")}
                                                            </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold text-sm">
                                                            {formatValue(key, value)}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : !loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Info className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No Results Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fill in the form above and click "Calculate Results" to see your financial metrics and analytics.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
