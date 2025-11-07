"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/cashier/payout-cashier/Header";
import {
    Settings,
    Loader2,
    Check,
    AlertCircle,
    Wallet,
    TrendingUp,
    Shield,
    Info,
    RefreshCcw,
    Save,
    ArrowRight,
    DollarSign,
    Zap,
} from "lucide-react";

interface Bucket {
    id: number;
    name: string;
}

interface SwitchData {
    transfer: number;
    transfer_more: number;
    transfer_x_more: number;
}

interface BucketTier {
    key: keyof SwitchData;
    label: string;
    range: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const BUCKET_TIERS: BucketTier[] = [
    {
        key: "transfer",
        label: "Standard Tier",
        range: "₦1 - ₦1,000,000",
        description: "For regular transactions up to 1 million naira",
        icon: <Wallet className="w-5 h-5" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
        key: "transfer_more",
        label: "Premium Tier",
        range: "Above ₦1,000,000",
        description: "For high-value transactions between 1M and 10M naira",
        icon: <TrendingUp className="w-5 h-5" />,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
        key: "transfer_x_more",
        label: "Enterprise Tier",
        range: "Above ₦10,000,000",
        description: "For enterprise-level transactions exceeding 10M naira",
        icon: <Shield className="w-5 h-5" />,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
    },
];

export default function TransferBucket() {
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [switchData, setSwitchData] = useState<SwitchData | null>(null);
    const [originalData, setOriginalData] = useState<SwitchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { authState } = useAuth();

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/transfer-bucket", {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setBuckets(response.data.data || []);
            const initialData = response.data.switch[0] || { transfer: 0, transfer_more: 0, transfer_x_more: 0 };
            setSwitchData(initialData);
            setOriginalData(initialData);
        } catch (error) {
            console.error("Error fetching buckets", error);
            toast.error("Failed to fetch transfer buckets");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, field: keyof SwitchData) => {
        setSwitchData((prev) => prev ? { ...prev, [field]: Number(event.target.value) } : prev);
    };

    const updateSwitch = async () => {
        if (!switchData) return;

        setUpdating(true);
        try {
            await axiosInstance.post(
                "/update-switch",
                {
                    transfer: switchData.transfer,
                    transfer_more: switchData.transfer_more,
                    transfer_x_more: switchData.transfer_x_more
                },
                { headers: { Authorization: `Bearer ${authState.token}` } }
            );
            toast.success("Transfer configuration updated successfully!");
            setOriginalData(switchData);
        } catch (error) {
            console.error("Error updating transfer bucket", error);
            toast.error("Failed to update transfer configuration");
        } finally {
            setUpdating(false);
        }
    };

    const hasChanges = () => {
        if (!switchData || !originalData) return false;
        return (
            switchData.transfer !== originalData.transfer ||
            switchData.transfer_more !== originalData.transfer_more ||
            switchData.transfer_x_more !== originalData.transfer_x_more
        );
    };

    const resetChanges = () => {
        setSwitchData(originalData);
        toast.success("Changes reset to saved values");
    };

    const getSelectedBucketName = (bucketId: number) => {
        const bucket = buckets.find((b) => b.id === bucketId);
        return bucket ? bucket.name : "Not Selected";
    };

    if (loading) {
        return (
            <>
                <Header headerTitle="Transfer Configuration" />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading transfer buckets...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header headerTitle="Transfer Configuration" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Page Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Transfer Bucket Configuration
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Configure transfer routing based on transaction amounts. Each tier can use a different payment processor.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={fetchBuckets}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Info Banner */}
                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-1">
                                    How it works
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Transactions are automatically routed to the appropriate bucket based on their amount.
                                    This allows you to optimize fees and processing times for different transaction sizes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bucket Configuration Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {BUCKET_TIERS.map((tier, index) => (
                            <div
                                key={tier.key}
                                className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${tier.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300`}
                            >
                                {/* Card Header */}
                                <div className={`$${tier.bgColor} p-4 border-b-2$$ {tier.borderColor}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-lg $${tier.bgColor} border$$ {tier.borderColor} flex items-center justify-center ${tier.color}`}>
                                            {tier.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${tier.color}`}>{tier.label}</h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{tier.range}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Select Payment Bucket
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={switchData?.[tier.key] || ""}
                                            onChange={(e) => handleSelectChange(e, tier.key)}
                                            className={`w-full p-3 pr-10 border-2 ${tier.borderColor} rounded-lg text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
                                        >
                                            <option value="">Choose a bucket...</option>
                                            {buckets.map((bucket) => (
                                                <option key={bucket.id} value={bucket.id}>
                                                    {bucket.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ArrowRight className={`w-5 h-5 -rotate-90 ${tier.color}`} />
                                        </div>
                                    </div>

                                    {/* Selected Status */}
                                    {switchData?.[tier.key] ? (
                                        <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                                {getSelectedBucketName(switchData[tier.key])}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                                No bucket selected
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Current Configuration Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            Current Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {BUCKET_TIERS.map((tier) => (
                                <div
                                    key={tier.key}
                                    className={`p-4 rounded-lg border $${tier.borderColor}$$ {tier.bgColor}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={tier.color}>{tier.icon}</span>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {tier.label}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {getSelectedBucketName(switchData?.[tier.key] || 0)}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {tier.range}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {hasChanges() && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                            You have unsaved changes
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {hasChanges() && (
                                    <button
                                        onClick={resetChanges}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        Reset Changes
                                    </button>
                                )}
                                <button
                                    onClick={updateSwitch}
                                    disabled={updating || !hasChanges()}
                                    className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all ${
                                        updating || !hasChanges()
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl"
                                    }`}
                                >
                                    {updating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Updating Configuration...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Configuration
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
