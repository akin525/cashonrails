"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from "react";
import axiosInstance from '@/helpers/axiosInstance';
import Header from "@/app/dashboard/cashier/payout-cashier/Header";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

interface Bank {
    code: string;
    name: string;
}

interface Business {
    merchant_id: string;
    merchant_name: string;
}

export default function ManualPayout() {
    const [bankList, setBankList] = useState<Bank[]>([]);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [amount, setAmount] = useState("");
    const [narration, setNarration] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [sysFee, setSysFee] = useState("");
    const [gateway, setGateway] = useState("Cashonrails");
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBizId, setSelectedBizId] = useState("");
    const [currency, setCurrency] = useState("NGN");

    // Move verifyAccount to useCallback to make it stable
    const verifyAccount = useCallback(async () => {
        if (!accountNumber || !bankCode || !authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "/finance/account_name",
                { account_number: accountNumber, bank_code: bankCode, currency: currency },
                { headers: { Authorization: `Bearer ${authState.token}` } }
            );
            setAccountName(response.data.data || "");
        } catch (err) {
            console.error("Error verifying account", err);
        } finally {
            setLoading(false);
        }
    }, [accountNumber, bankCode, currency, authState.token]);

    // Move fetchBusinesses to useCallback to make it stable
    const fetchBusinesses = useCallback(async () => {
        if (search.trim() && authState.token) {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`/operations/merchants`, {
                    params: { name: search },
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                setBusinesses(response.data.data?.table || []);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        } else {
            setBusinesses([]);
        }
    }, [search, authState.token]);

    useEffect(() => {
        if (currency && authState.token) {
            axiosInstance.get(`/finance/bank_list/${currency}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            })
                .then(response => setBankList(response.data.data.banks || []))
                .catch(err => console.error("Error fetching banks", err));
        }
    }, [currency, authState.token]); // Added authState.token

    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            verifyAccount();
        }
    }, [accountNumber, bankCode, verifyAccount]); // Added verifyAccount

    useEffect(() => {
        const debounceTime = 500;
        const timeoutId = setTimeout(fetchBusinesses, debounceTime);
        return () => clearTimeout(timeoutId);
    }, [fetchBusinesses]); // Added fetchBusinesses

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setter(e.target.value);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                `/finance/create-manual-payout/${selectedBizId}`,
                {
                    currency,
                    account_number: accountNumber,
                    account_name: accountName,
                    bank_code: bankCode,
                    amount,
                    narration,
                    session_id: sessionId,
                    sys_fee: sysFee,
                    gateway,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 3000000, // 30 seconds
                }
            );

            if (response.data?.success) {
                toast.success(response.data?.message || "Payout successful");
            } else {
                toast.success(response.data?.message || "Failed to process payout.");
            }

        } catch (err) {
            alert("Error processing payout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header headerTitle="Cashier-Payout" />
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Manual Payout</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col mb-4">
                        <label className="mb-1 font-medium text-gray-700 dark:text-neutral-200">Search Business</label>
                        <input type="text"
                               className="h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                               value={search} onChange={handleChange(setSearch)}
                               placeholder="Type to search"/>
                        {loading && <p>Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {businesses.length > 0 && (
                            <select
                                className="mt-2 h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                onChange={handleChange(setSelectedBizId)} value={selectedBizId}>
                                <option value="">Select a business</option>
                                {businesses.map((biz) => (
                                    <option key={biz.merchant_id} value={biz.merchant_id}>{biz.merchant_name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Currency</label>
                        <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Session Id</label>
                        <input type="text" value={sessionId} onChange={(e) => setSessionId(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Bank</label>
                        <select value={bankCode} onChange={(e) => setBankCode(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required>
                            <option value="">Select Bank</option>
                            {bankList.map((bank: Bank) => (
                                <option key={bank.code} value={bank.code}>{bank.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Account Number</label>
                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>

                    <div>
                        <button type="button" onClick={verifyAccount}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                            Verify Account
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Account Name</label>
                        <input type="text" value={accountName} readOnly
                               className="w-full p-2 border rounded-md bg-gray-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">System Fee</label>
                        <input type="number" value={sysFee} onChange={(e) => setSysFee(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Narration</label>
                        <input type="text" value={narration} onChange={(e) => setNarration(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit"
                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-2">
                            {loading && <span
                                className="animate-spin w-4 h-4 border-t-2 border-white border-solid rounded-full"></span>}
                            {loading ? "Processing..." : "Submit Payout"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
