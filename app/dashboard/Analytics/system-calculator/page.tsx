"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";

export default function SystemCalculator() {
    const { authState } = useAuth();
    const [calculationType, setCalculationType] = useState("System Transaction Calculator");
    const [businessID, setBusinessID] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [transactionType, setTransactionType] = useState("Settlement");
    const [dateType, setDateType] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const calculationOptions = [
        { name: "System Transaction Calculator", value: "transaction-calculator" },
        { name: "System Payout Calculator", value: "payout-calculator" },
        { name: "System Settlement Calculator", value: "settlement-calculator" },
        { name: "System Wallet Transaction Calculator", value: "wallet-transaction-calculator" },
    ];

    const transactionOptions = [
        { name: "Settlement", value: "settlement" },
        { name: "Payout", value: "payout" },
        { name: "BVN", value: "bvn" },
        { name: "Bills", value: "bills" },
        { name: "Payout Reversal", value: "payout_reversal" },
        { name: "Refund", value: "refund" },
        { name: "Funding", value: "funding" }
    ];
    const dateTypeOptions = ["all", "Range"];
    const currencyOptions = [
        "NGN", // Nigerian Naira
        "USD", // US Dollar
        "EUR", // Euro
        "GHS", // Ghanaian Cedi
        "KES", // Kenyan Shilling
        "ZAR", // South African Rand
        "EGP", // Egyptian Pound
        "TZS", // Tanzanian Shilling
        "UGX", // Ugandan Shilling
        "XOF", // West African CFA Franc (used in 8 countries)
        "XAF", // Central African CFA Franc (used in 6 countries)
        "DZD", // Algerian Dinar
        "MAD", // Moroccan Dirham
        "BWP", // Botswana Pula
        "ZMW", // Zambian Kwacha
        "MZN", // Mozambican Metical
        "SDG", // Sudanese Pound
        "RWF", // Rwandan Franc
        "ETB", // Ethiopian Birr
        "LYD", // Libyan Dinar
        ""
    ];


    const endpointMap: Record<string, string> = {
        "System Transaction Calculator": "/transactions-cal",
        "System Payout Calculator": "/payout-cal",
        "System Wallet Transaction Calculator": "/wallettransaction-cal",
        "System Settlement Calculator": "/settlement-cal",
    };
    const endpoint = endpointMap[calculationType] || "/transactions-cal";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);

        const requestData: any = {
            business_id: businessID || undefined,
            currency,
            source: calculationOptions,
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

            // if (response.data.success) {
                setResults(response.data.data);
                toast.success("Calculator loaded successfully!");
            // } else {
            //     toast.error("Failed to fetch calculator.");
            // }
        } catch (error) {
            console.error("Error fetching calculator:", error);
            toast.error("Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <Header headerTitle="System Calculator" />
            <div className="flex flex-col items-center p-8">
                <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-8 rounded-lg shadow-md w-full max-w-4xl">
                    <h2 className="text-2xl font-bold text-green-600 text-center mb-6">System Calculator</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Select Calculation Type</label>
                            <select value={calculationType} onChange={(e) => setCalculationType(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-purple-300 dark:bg-gray-700">
                                {calculationOptions.map(({ name }) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Business ID <span className="text-red-500">(required)</span></label>
                            <input type="text" value={businessID} onChange={(e) => setBusinessID(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-red-300 dark:bg-gray-700" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Select Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-blue-300 dark:bg-gray-700">
                                {currencyOptions.map((cur) => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Select Type</label>
                            <select value={dateType} onChange={(e) => setDateType(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-green-300 dark:bg-gray-700">
                                {dateTypeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        {dateType === "Range" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium">Start Date</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-purple-300 dark:bg-gray-700" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">End Date</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-purple-300 dark:bg-gray-700" required />
                                </div>
                            </>
                        )}
                        <div className="col-span-2">
                            <button type="submit" className="w-full bg-green-400 text-white py-3 rounded-md hover:bg-green-500 transition" disabled={loading}>{loading ? "Calculating..." : "Calculate"}</button>
                        </div>
                    </form>
                    {results && Object.keys(results).length > 0 ? (
                        <div className="bg-white dark:bg-gray-900 p-8 mt-8 rounded-lg shadow-md w-full max-w-4xl border-2 border-dashed border-green-300">
                            <h3 className="text-lg font-semibold mb-3">
                                {calculationType} Results
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                                    <thead>
                                    <tr className="bg-green-500 text-white">
                                        <th className="border px-4 py-2 text-left">Metric</th>
                                        <th className="border px-4 py-2 text-left">Value</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {Object.entries(results).map(([key, value]) => (
                                        <tr key={key} className="border-b dark:border-gray-600">
                                            <td className="border px-4 py-2 capitalize">
                                                {key.replace(/_/g, " ")}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {key.toLowerCase().includes("count")
                                                    ? (typeof value === "number" ? value : String(value))
                                                    : `${currency} ${typeof value === "number" ? value.toLocaleString() : Number(value).toLocaleString()}`}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 p-6 mt-8 rounded-lg shadow-md w-full max-w-4xl text-center border-2 border-dashed border-gray-300">
                            <p className="text-lg text-gray-600 dark:text-gray-300">No results found. Try a different calculation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
