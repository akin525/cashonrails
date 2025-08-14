"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";

export default function SystemCalculator() {
    const { authState } = useAuth();
    const [calculationType, setCalculationType] = useState("transaction");
    const [businessID, setBusinessID] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const calculationOptions = [
        { name: "Transaction", value: "transaction", endpoint: "/export/export-transactions-business" },
        { name: "Payout", value: "payouts", endpoint: "/export/export-payouts-business" },
        { name: "Wallet Transaction", value: "wallet", endpoint: "/export/export-wallet-transactions" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedOption = calculationOptions.find(option => option.value === calculationType);
        if (!selectedOption) return;

        const requestData = {
            businessId: businessID,
            business_id: businessID || null,
            start_date: startDate || null,
            end_date: endDate || null,
        };

        try {
            const response = await axiosInstance.post(selectedOption.endpoint, requestData, {
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000,
            });

            if (response.data.status) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0c151d] text-gray-900 dark:text-gray-100 p-4">
            <Header headerTitle="Get Business Data" />

            <div className="flex flex-col items-center justify-center py-8">
                <div className="w-full max-w-4xl bg-white dark:bg-[#182630] rounded-xl shadow p-8">
                    <h3 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-6">
                        Business Data Export
                    </h3>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Select Type</label>
                            <select
                                value={calculationType}
                                onChange={(e) => setCalculationType(e.target.value)}
                                className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
                            >
                                {calculationOptions.map(({ name, value }) => (
                                    <option key={value} value={value}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Business ID <span className="text-red-500">(required)</span>
                            </label>
                            <input
                                type="text"
                                value={businessID}
                                onChange={(e) => setBusinessID(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-red-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition disabled:opacity-50"
                            >
                                {loading ? "Fetching..." : "Get Data"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
