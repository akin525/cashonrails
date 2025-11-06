"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/authContext";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard } from "@/components/MatricCard";
import { useUI } from "@/contexts/uiContext";
import Header from "./Header";

const VirtualAccountStats: React.FC = () => {
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const [cards, setCards] = useState<{ count: string; title: string }[]>([]);
    const [loadingCards, setLoadingCards] = useState<boolean>(false);

    const queryParams = useMemo(() => ({
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState.dateRange]);

    // Move defaultBanks to useMemo to make it stable across renders
    const defaultBanks = useMemo(() => [
        { title: "VFD", key: "vfd", count: "0" },
        { title: "GTB", key: "gtb", count: "0" },
        { title: "PROVIDUS", key: "providus", count: "0" },
        { title: "SAFEHAVEN", key: "safeheaven", count: "0" },
        { title: "NETBANK", key: "netbank", count: "0" },
        { title: "WEMA", key: "wema", count: "0" },
        { title: "BANK78", key: "bank78", count: "0" }
    ], []);

    const fetchStats = useCallback(async () => {
        if (!authState.token) return;

        setLoadingCards(true);
        try {
            const response = await axiosInstance.get("/virtual-acc", {
                headers: { Authorization: `Bearer ${authState.token}` },
                params: queryParams,
            });

            if (response.data?.data) {
                const formattedStats = defaultBanks.map((bank) => ({
                    title: bank.title,
                    count: response.data.data[bank.key]?.toLocaleString() || "0"
                }));
                setCards(formattedStats);
            } else {
                setCards(defaultBanks);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setCards(defaultBanks);
        } finally {
            setLoadingCards(false);
        }
    }, [authState.token, queryParams, defaultBanks]); // Added defaultBanks to dependency array

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        setShowSearchQuery(false);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    return (
        <div className="dark:bg-gray-950 dark:text-gray-100 min-h-screen">
            <Header headerTitle="Virtual Accounts Details" />
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-8">
                <h1 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-6">
                    {/* Virtual Account Stats */}
                </h1>

                {loadingCards ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5 p-2">
                        {cards.map((card, index) => (
                            <MetricCard
                                key={index}
                                count={card.count}
                                title={card.title}
                                isLoading={loadingCards}
                                variant="success"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VirtualAccountStats;
