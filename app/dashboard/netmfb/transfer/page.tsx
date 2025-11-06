"use client";

import React, { useState, useEffect, FormEvent, useCallback } from "react";
import axiosInstance from '@/helpers/axiosInstance';
import Header from "@/app/dashboard/cashier/payout-cashier/Header";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

interface Bank {
    identifier:string;
    code: string;
    name: string;
}

interface Business {
    id: string;
    merchant_name: string;
}

export default function ManualDeposit() {
    const [bankList, setBankList] = useState<Bank[]>([]);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [amount, setAmount] = useState("");
    const [narration, setNarration] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [pin, setPin] = useState("");
    const [sysFee, setSysFee] = useState("");
    const [gateway, setGateway] = useState("");
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBizId, setSelectedBizId] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [transactionReference, setTransactionReference] = useState("");

    // Fix 1: Add authState.token to dependencies
    useEffect(() => {
        if (currency && authState.token) {
            axiosInstance
                .get(`/net/bank-list`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                })
                .then(response => setBankList(response.data.data as Bank[] || []))
                .catch(err => console.error("Error fetching banks", err));
        }
    }, [currency, authState.token]); // Added authState.token

    // Fix 2: Wrap verifyAccount in useCallback and add it to dependencies
    const verifyAccount = useCallback(async () => {
        if (!accountNumber || !bankCode || !authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/net/name_enquiry/${accountNumber}/${bankCode}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );
            setAccountName(response.data.data || "");
            setTransactionReference(response.data.transactionReference);
        } catch (err) {
            console.error("Error verifying account", err);
        } finally {
            setLoading(false);
        }
    }, [accountNumber, bankCode, authState.token]); // Added dependencies

    // Now verifyAccount can be safely added to useEffect dependencies
    useEffect(() => {
        if (accountNumber.length === 10 && bankCode) {
            verifyAccount();
        }
    }, [accountNumber, bankCode, verifyAccount]); // Added verifyAccount

    // Fix 3: Add authState.token to dependencies
    useEffect(() => {
        const debounceTime = 500;

        const fetchBusinesses = async () => {
            if (search.trim() && authState.token) {
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
    }, [search, authState.token]); // Added authState.token

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleBusinessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBizId(e.target.value);
    };

    const selectedBank = bankList.find((bank) => bank.identifier === bankCode);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "/net/transfer",
                {
                    account_number: accountNumber,
                    account_name: accountName,
                    bank_code: bankCode,
                    bank_name: selectedBank ? selectedBank.name : "",
                    amount: amount,
                    narration: narration,
                    reference: transactionReference,
                    pin: pin,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );

            toast.success(response.data.data.message, {
                position: "top-center",
            });
        } catch (err) {
            toast.error("Error processing payout", {
                position: "top-center",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header headerTitle={'NET Transfer'}/>

            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transfer</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Currency</label>
                        <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Bank</label>
                        <select value={bankCode} onChange={(e) => setBankCode(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required>
                            <option value="">Select Bank</option>
                            {bankList.map((bank: Bank) => (
                                <option key={bank.identifier} value={bank.identifier}>{bank.name}</option>
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
                        <label className="block text-sm font-medium text-gray-600">Narration</label>
                        <input type="text" value={narration} onChange={(e) => setNarration(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Pin</label>
                        <input type="text" value={pin} onChange={(e) => setPin(e.target.value)}
                               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400" required/>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit"
                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-2">
                            {loading && <span
                                className="animate-spin w-4 h-4 border-t-2 border-white border-solid rounded-full"></span>}
                            {loading ? "Processing..." : "Make Transfer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
