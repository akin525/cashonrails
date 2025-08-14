"use client";

import React, { useState, useEffect, FormEvent } from "react";
import axiosInstance from '@/helpers/axiosInstance';
import Header from "@/app/dashboard/cashier/payout-cashier/Header";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

interface Bank {
    code: string;
    name: string;
}

interface Business {
    id: string;
    merchant_name: string;
    merchant_id: string;
}

export default function ManualDeposit() {
    const [bankList, setBankList] = useState<Bank[]>([]);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [amount, setAmount] = useState("");
    const [narration, setNarration] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [sysFee, setSysFee] = useState("");
    const [gateway, setGateway] = useState("");
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null); // Fixed type for error state
    const [businesses, setBusinesses] = useState<Business[]>([]); // Explicitly define businesses type
    const [selectedBizId, setSelectedBizId] = useState("");
    const [currency, setCurrency] = useState("NGN"); // Default currency is NGN
    const [senderName, setSenderName] = useState("");
    const [senderAccount, setSenderAccount] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        if (currency) {
            axiosInstance
                .get(`/finance/bank_list/${currency}`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                })
                .then(response => setBankList(response.data.data.banks as Bank[] || []))
                .catch(err => console.error("Error fetching banks", err));
        }
    }, [currency]);

    // Automatically verify account when account number reaches 10 digits
    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            verifyAccount();
        }
    }, [accountNumber, bankCode]);

    const verifyAccount = async () => {
        if (!accountNumber || !bankCode) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "/finance/account_name",
                {
                    account_number: accountNumber,
                    bank_code: bankCode,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );
            setAccountName(response.data.data || "");
        } catch (err) {
            console.error("Error verifying account", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTime = 500;

        const fetchBusinesses = async () => {
            if (search.trim()) {
                setLoading(true);
                setError(null);

                try {
                    const response = await axiosInstance.get(`/operations/merchants`, {
                        params: { name: search },
                        headers: { Authorization: `Bearer ${authState.token}` },
                    });

                    if (!response.data.status) {
                        throw new Error(response.data.message || "Failed to find business");
                    }
                    const merchants = response.data.data?.table || [];

                    setBusinesses(merchants);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("An unexpected error occurred");
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                setBusinesses([]);
            }
        };

        const timeoutId = setTimeout(fetchBusinesses, debounceTime);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleBusinessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        console.log("Selected Business ID:", id); // Debug log
        setSelectedBizId(id);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                `/finance/create-cashier-deposit/${selectedBizId}`,
                {
                    sender_name: senderName,
                    sender_account: senderAccount,
                    amount,
                    narration,
                    password,
                },{
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );

            if (String(response.data?.success) === "true") {
                toast.success(String(response.data?.message));
            } else {
                toast.error(response.data?.message || "Failed to process payout.");
            }


        } catch (err) {
            toast.error("System Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header headerTitle={'Cashier-Deposit'} />

            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Manual Deposit</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col mb-4">
                        <label className="mb-1 font-medium text-gray-700 dark:text-neutral-200">
                            Search Business
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            className="h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            placeholder="Type to search business"
                        />
                        {loading && <p>Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {businesses.length > 0 && (
                            <select
                                onChange={handleBusinessSelect}
                                value={selectedBizId}
                                className="mt-2 h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            >
                                <option value="">Select a business</option>
                                {businesses.map((biz) => (
                                    <option key={biz.id} value={biz.merchant_id}>
                                        {biz.merchant_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Sender Name</label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Sender Account</label>
                        <input
                            type="text"
                            value={senderAccount}
                            onChange={(e) => setSenderAccount(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Narration</label>
                        <input
                            type="text"
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                        >
                            {loading ? "Processing..." : "Submit Deposit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
