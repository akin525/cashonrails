"use client";

import React, { useState, FormEvent } from "react";
import axiosInstance from '@/helpers/axiosInstance';
import Header from "@/app/dashboard/operations/resolve-transaction/Header";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
export default function ResolveTransaction() {
    const [provider, setProvider] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();

    const providers = ["safehaven", "netbank", "providus", "vfd", "wema", "bank78"];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/finance/resolve-transaction",
                {
                    account_number: accountNumber ?? null,
                    account_name: provider,
                    provider: provider,
                    sessionId: sessionId,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 300000,
                }
            );

            if (response.data.data.success == true) {
                toast.success(response.data.data.message);
            } else {
                toast.error(response.data.data.message);
            }

        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "An unexpected error occurred";

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header headerTitle={"Resolve Transaction"} />
            <div className="flex items-start justify-center min-h-screen bg-gray-100 pt-10">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <h2 className="text-center text-lg font-semibold text-gray-600 mb-4">RESOLVE TRANSACTION</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Provider Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Select a provider <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="" disabled>
                                    Select Provider
                                </option>
                                {providers.map((bank, index) => (
                                    <option key={index} value={bank}>
                                        {bank}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Session ID Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Session ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter Session ID"
                                required
                            />
                        </div>

                        {/* Account Number Input (Only for NET MFB) */}
                        {provider === "netbank" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter Account Number"
                                    required
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 bg-green-300 text-white font-semibold rounded-md hover:bg-green-600 transition flex justify-center items-center"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Resolve Transaction"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}