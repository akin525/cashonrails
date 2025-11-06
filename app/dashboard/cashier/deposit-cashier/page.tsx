"use client";

import React, { useState, useEffect, FormEvent } from "react";
import axiosInstance from '@/helpers/axiosInstance';
import Header from "@/app/dashboard/cashier/payout-cashier/Header";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { CheckCircle, Search, Building2, User, CreditCard, DollarSign, MessageSquare, Lock, Loader2 } from "lucide-react";

interface Bank {
    code: string;
    name: string;
}

interface Business {
    id: string;
    merchant_name: string;
    merchant_id: string;
}

interface FormData {
    selectedBizId: string;
    currency: string;
    senderName: string;
    senderAccount: string;
    amount: string;
    narration: string;
    password: string;
}

export default function ManualDeposit() {
    const [bankList, setBankList] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    
    const [formData, setFormData] = useState<FormData>({
        selectedBizId: "",
        currency: "",
        senderName: "",
        senderAccount: "",
        amount: "",
        narration: "",
        password: ""
    });

    const currencyOptions = [
        { label: "Select Currency", value: "", flag: "🌍" },
        { label: "USD - US Dollar", value: "USD", flag: "🇺🇸" },
        { label: "EUR - Euro", value: "EUR", flag: "🇪🇺" },
        { label: "GBP - British Pound", value: "GBP", flag: "🇬🇧" },
        { label: "NGN - Nigerian Naira", value: "NGN", flag: "🇳🇬" },
        { label: "GHS - Ghanaian Cedi", value: "GHS", flag: "🇬🇭" },
        { label: "KES - Kenyan Shilling", value: "KES", flag: "🇰🇪" },
        { label: "ZAR - South African Rand", value: "ZAR", flag: "🇿🇦" },
        { label: "EGP - Egyptian Pound", value: "EGP", flag: "🇪🇬" },
        { label: "MAD - Moroccan Dirham", value: "MAD", flag: "🇲🇦" },
        { label: "TZS - Tanzanian Shilling", value: "TZS", flag: "🇹🇿" },
        { label: "UGX - Ugandan Shilling", value: "UGX", flag: "🇺🇬" },
        { label: "RWF - Rwandan Franc", value: "RWF", flag: "🇷🇼" },
        { label: "ETB - Ethiopian Birr", value: "ETB", flag: "🇪🇹" },
        { label: "XOF - CFA Franc BCEAO", value: "XOF", flag: "🌍" },
        { label: "XAF - CFA Franc BEAC", value: "XAF", flag: "🌍" },
        { label: "BANKTRANSFER", value: "BANKTRANSFER", flag: "🏦" },
        { label: "USSD", value: "USSD", flag: "📱" },
        { label: "PAYWITHBANK", value: "PAYWITHBANK", flag: "🏦" },
        { label: "PAYWITHPHONE", value: "PAYWITHPHONE", flag: "📱" },
        { label: "Dedicated", value: "dedicated", flag: "⭐" },
    ];

    const filteredCurrencies = currencyOptions.filter(
        currency =>
            currency.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            currency.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch banks when currency changes
    useEffect(() => {
        if (formData.currency) {
            axiosInstance
                .get(`/finance/bank_list/${formData.currency}`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                })
                .then(response => setBankList(response.data.data.banks as Bank[] || []))
                .catch(err => console.error("Error fetching banks", err));
        }
    }, [formData.currency, authState.token]);

    // Fetch businesses based on search
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
    }, [search, authState.token]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCurrencySelect = (currencyValue: string) => {
        handleInputChange('currency', currencyValue);
        setShowCurrencyDropdown(false);
        setSearchTerm("");
    };

    const handleBusinessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleInputChange('selectedBizId', e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validation
        if (!formData.selectedBizId) {
            toast.error("Please select a business");
            return;
        }
        
        if (!formData.currency) {
            toast.error("Please select a currency");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(
                `/finance/create-cashier-deposit/${formData.selectedBizId}`,
                {
                    sender_name: formData.senderName,
                    sender_account: formData.senderAccount,
                    currency: formData.currency,
                    amount: formData.amount,
                    narration: formData.narration,
                    password: formData.password,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout:60000,

                }
            );

            if (String(response.data?.success) === "true") {
                toast.success(String(response.data?.message));
                // Reset form
                setFormData({
                    selectedBizId: "",
                    currency: "",
                    senderName: "",
                    senderAccount: "",
                    amount: "",
                    narration: "",
                    password: ""
                });
                setSearch("");
                setBusinesses([]);
            } else {
                toast.error(response.data?.message || "Failed to process deposit.");
            }
        } catch (err) {
            toast.error("System Error");
        } finally {
            setLoading(false);
        }
    };

    const selectedCurrency = currencyOptions.find(c => c.value === formData.currency);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header headerTitle={'Cashier-Deposit'} />

            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CreditCard className="w-8 h-8" />
                            Create Manual Deposit
                        </h2>
                        <p className="text-green-100 mt-2">Process manual deposits for merchant accounts</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Business Search */}
                            <div className="lg:col-span-2">
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                    Search Business
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Type to search business..."
                                    />
                                    {loading && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 animate-spin" />
                                    )}
                                </div>
                                
                                {error && (
                                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                )}
                                
                                {businesses.length > 0 && (
                                    <select
                                        onChange={handleBusinessSelect}
                                        value={formData.selectedBizId}
                                        className="mt-3 w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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

                            {/* Currency Selection */}
                            <div className="lg:col-span-2">
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Currency / Payment Method
                                </label>
                                
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                                        className="w-full flex items-center justify-between py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedCurrency ? (
                                                <>
                                                    <span className="text-xl">{selectedCurrency.flag}</span>
                                                    <span className="text-gray-900 dark:text-gray-100">{selectedCurrency.label}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">Select Currency</span>
                                            )}
                                        </div>
                                        <CheckCircle className={`w-5 h-5 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showCurrencyDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                                    <input
                                                        type="text"
                                                        placeholder="Search currencies..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredCurrencies.map((currency) => (
                                                    <button
                                                        key={currency.value}
                                                        type="button"
                                                        onClick={() => handleCurrencySelect(currency.value)}
                                                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                            formData.currency === currency.value ? 'bg-green-50 dark:bg-green-900/30 border-r-4 border-green-500' : ''
                                                        }`}
                                                    >
                                                        <span className="text-xl">{currency.flag}</span>
                                                        <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">{currency.label}</span>
                                                        {formData.currency === currency.value && (
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sender Name */}
                            <div>
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <User className="w-5 h-5 text-green-600" />
                                    Sender Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.senderName}
                                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                                    className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter sender's full name"
                                    required
                                />
                            </div>

                            {/* Sender Account */}
                            <div>
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    Sender Account
                                </label>
                                <input
                                    type="text"
                                    value={formData.senderAccount}
                                    onChange={(e) => handleInputChange('senderAccount', e.target.value)}
                                    className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter sender's account number"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter deposit amount"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {/* Narration */}
                            <div>
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    Narration
                                </label>
                                <input
                                    type="text"
                                    value={formData.narration}
                                    onChange={(e) => handleInputChange('narration', e.target.value)}
                                    className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter transaction description"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="lg:col-span-2">
                                <label className="flex items-center gap-2 mb-3 font-semibold text-gray-700 dark:text-gray-200">
                                    <Lock className="w-5 h-5 text-green-600" />
                                    Authorization Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your authorization password"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="lg:col-span-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing Deposit...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Submit Deposit
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
