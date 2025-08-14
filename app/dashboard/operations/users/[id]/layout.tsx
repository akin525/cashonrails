"use client";

import React, { useEffect, useState } from "react";
import NavLinkLayout from "@/components/dashboard/SettingsTab";
import Header from "./Header";
import { CalendarIcon, StatusIcon } from "@/public/assets/icons";
import { Chip } from "@/components/chip";
import { useAuth } from "@/contexts/authContext";
import { StringUtils } from "@/helpers/extras";
import moment from "moment";
import { TableDetailSkeleton } from "@/components/loaders";
import Alert, { AlertDescription } from "@/components/alert";
import toast from "react-hot-toast";
import axiosInstance from "@/helpers/axiosInstance"; // Assuming axiosInstance is configured

interface MerchantData {
    id: number;
    trade_name: string;
    name: string;
    status: string;
    created_at: string;
    btype?: { name: string };
    industry?: { name: string };
    category?: { name: string };
}

export default function SettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const { authState } = useAuth();
    const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchMerchantData = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const response = await axiosInstance.get<MerchantData>(`/growth/merchants/${params.id}`, {
                    headers: { Authorization: `Bearer ${authState?.token}` },
                });
                if (response.data.status && response.data.data) {
                    setMerchantData(response.data.data);
                } else {
                    toast.error(response.data.message)
                }
            } catch (err) {
                setError(true);
                toast.error("Error loading merchant data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        if (authState.token) {
            fetchMerchantData();
        }
    }, [params.id, authState?.token]);

    const navigationLinks = [
        { label: "Business", href: `/dashboard/operations/merchant/${params.id}/business` },
        { label: "Wallets", href: `/dashboard/operations/merchant/${params.id}/wallets` },
        { label: "Payment Method & Fees", href: `/dashboard/operations/merchant/${params.id}/payment-method-fees` },
        { label: "Teams", href: `/dashboard/operations/merchant/${params.id}/teams` },
    ];

    const formatDate = (date: string) => {
        return moment(date).format("MMM DD, YYYY, h:mma");
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert variant="destructive">
                    <AlertDescription>Error loading merchant data. Please try again.</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!isLoading && !merchantData) {
        return (
            <>
                <Header title={"N/A"} />
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    <Alert>
                        <AlertDescription>No merchant data found for ID: {params.id}</AlertDescription>
                    </Alert>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title={merchantData?.trade_name || "N/A"} />
            <div className="w-full p-4 min-h-screen">
                {isLoading ? (
                    <TableDetailSkeleton />
                ) : (
                    <>
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-200 rounded-xl flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-xl">
                                        {merchantData?.name?.[0]?.toUpperCase() || "N/A"}
                                    </span>
                                </div>
                                <h2 className="font-medium text-3xl">{merchantData?.trade_name || "N/A"}</h2>
                            </div>
                            <div className="flex gap-10 mt-10">
                                <ul className="text-sm text-[#00000080] font-medium space-y-2">
                                    <li className="flex items-center gap-1">
                                        <StatusIcon />
                                        Status
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CalendarIcon height={18} width={18} strokeColor="#00000080" />
                                        Date Created
                                    </li>
                                    <li>Business Type</li>
                                    <li>Business ID</li>
                                    <li>Industry</li>
                                    <li>Category</li>
                                </ul>
                                <ul className="text-sm space-y-2">
                                    <li>
                                        <Chip withDot variant={merchantData?.status || "inactive"}>
                                            {StringUtils.capitalizeWords(merchantData?.status || "No Status")}
                                        </Chip>
                                    </li>
                                    <li>{merchantData?.created_at ? formatDate(merchantData.created_at) : "N/A"}</li>
                                    <li>{merchantData?.btype?.name || "N/A"}</li>
                                    <li>{merchantData?.id || "N/A"}</li>
                                    <li>{merchantData?.industry?.name || "N/A"}</li>
                                    <li>{merchantData?.category?.name || "N/A"}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="max-w-3xl mt-10">
                            <NavLinkLayout links={navigationLinks} />
                        </div>
                        {children}
                    </>
                )}
            </div>
        </>
    );
}
