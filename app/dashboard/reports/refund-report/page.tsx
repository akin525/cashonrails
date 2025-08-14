"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/Analytics/system-statistics/Header";
import { useAuth } from "@/contexts/authContext";
import { MetricCard } from "@/components/MatricCard";

export default function RefundReport() {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("NGN");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { authState } = useAuth();

    const getCurrencySymbol = (currency: string): string => {
        switch (currency) {
            case "USD": return "$";
            case "GBP": return "£";
            default: return "₦";
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
        return num.toFixed(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStats(null);

        try {
            const response = await axiosInstance.get(`/report/refund/${selectedCurrency}/${selectedDate}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data.success) {
                setStats(response.data.data);
                toast.success("Refund stats loaded!");
            } else {
                toast.error("Failed to fetch refund data.");
            }
        } catch {
            toast.error("Failed to fetch refund data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-[#0c151d] min-h-screen p-6">
            <Header headerTitle="Refund Report" />

            <div className="max-w-3xl mx-auto bg-white dark:bg-[#182630] p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-center text-green-500 dark:text-green-400">
                    Refund Monthly Overview
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="month"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                        className="w-full md:w-auto p-3 border rounded-md focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:text-white"
                    />

                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full md:w-auto p-3 border rounded-md focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition"
                    >
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                    * Please wait a few seconds for the report to load
                </p>

                {stats && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-center text-green-600 dark:text-green-300 mb-4">
                            Summary for {selectedDate} ({selectedCurrency})
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <MetricCard
                                title="Total Refund Count"
                                count={formatNumber(stats.totalCount)}
                                isLoading={loading}
                                variant="success"
                            />
                            <MetricCard
                                title="Total Refund Amount"
                                count={`${getCurrencySymbol(selectedCurrency)}${formatNumber(stats.totalAmount)}`}
                                isLoading={loading}
                                variant="success"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
