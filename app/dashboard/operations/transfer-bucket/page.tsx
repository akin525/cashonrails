"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/cashier/payout-cashier/Header";

interface Bucket {
    id: number;
    name: string;
}

interface SwitchData {
    transfer: number;
    transfer_more: number;
    transfer_x_more: number;
}

export default function TransferBucket() {
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [switchData, setSwitchData] = useState<SwitchData | null>(null);
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
            setSwitchData(response.data.switch[0] || { transfer: "", transfer_more: "", transfer_x_more: "" });
        } catch (error) {
            console.error("Error fetching buckets", error);
            toast.error("Failed to fetch buckets");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>, field: keyof SwitchData) => {
        setSwitchData((prev) => prev ? { ...prev, [field]: Number(event.target.value) } : prev);
    };

    const updateSwitch = async () => {
        setUpdating(true);
        try {
            await axiosInstance.post(
                "/update-switch",
                { transfer: switchData?.transfer, transfer_more: switchData?.transfer_more, transfer_x_more: switchData?.transfer_x_more },
                { headers: { Authorization: `Bearer ${authState.token}` } }
            );
            toast.success("Transfer bucket updated successfully");
        } catch (error) {
            console.error("Error updating transfer bucket", error);
            toast.error("Failed to update transfer bucket");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <Header headerTitle="Transfer Config" />

            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 border-2 border-green-500">
                <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Select Transfer Bucket</h2>

                {loading ? (
                    <div className="text-center text-green-700 font-semibold">Loading buckets...</div>
                ) : (
                    <>
                        {/* First Dropdown: 1 to 1M */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-green-700 mb-2">
                                Select Transfer Bucket (1 to 1M)
                            </label>
                            <select
                                value={switchData?.transfer || ""}
                                onChange={(e) => handleSelectChange(e, "transfer")}
                                className="w-full p-3 border border-green-400 rounded-md text-green-900 bg-white"
                            >
                                {buckets.map((bucket) => (
                                    <option key={bucket.id} value={bucket.id}>
                                        {bucket.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Second Dropdown: Above 1M */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-green-700 mb-2">
                                Select Transfer Bucket (Above 1M)
                            </label>
                            <select
                                value={switchData?.transfer_more || ""}
                                onChange={(e) => handleSelectChange(e, "transfer_more")}
                                className="w-full p-3 border border-green-400 rounded-md text-green-900 bg-white"
                            >
                                {buckets.map((bucket) => (
                                    <option key={bucket.id} value={bucket.id}>
                                        {bucket.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-600 mt-1">
                                Note: This bucket will be used for transfers above 1M.
                            </p>
                        </div>

                        {/* Second Dropdown: Above 10M */}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-green-700 mb-2">
                                Select Transfer Bucket (Above 10M)
                            </label>
                            <select
                                value={switchData?.transfer_x_more || ""}
                                onChange={(e) => handleSelectChange(e, "transfer_x_more")}
                                className="w-full p-3 border border-green-400 rounded-md text-green-900 bg-white"
                            >
                                {buckets.map((bucket) => (
                                    <option key={bucket.id} value={bucket.id}>
                                        {bucket.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-600 mt-1">
                                Note: This bucket will be used for transfers above 10M.
                            </p>
                        </div>

                        {/* Display Selected Values */}
                        <div className="mt-4 p-4 bg-green-50 border border-green-400 rounded-md">
                            <p className="text-green-700 font-semibold">Selected Transfer Bucket (1 to 1M): {switchData?.transfer || "None"}</p>
                            <p className="text-green-700 font-semibold">Selected Transfer Bucket (Above 1M): {switchData?.transfer_more || "None"}</p>
                            <p className="text-green-700 font-semibold">Selected Transfer Bucket (Above 10M): {switchData?.transfer_x_more || "None"}</p>
                        </div>

                        {/* Update Button */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={updateSwitch}
                                disabled={updating}
                                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {updating && (
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                )}
                                {updating ? "Updating..." : "Update Transfer Bucket"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
