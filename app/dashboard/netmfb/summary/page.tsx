"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import axiosInstance from "@/helpers/axiosInstance";
import { useUI } from "@/contexts/uiContext";
import Header from "./Header";

const NetmfbSummary: React.FC = () => {
    const { authState } = useAuth();
    const { setShowSearchQuery } = useUI();
    const [cards, setCards] = useState<{ count: string; title: string }[]>([]);
    const [loadingCards, setLoadingCards] = useState<boolean>(false);

    const defaultBanks = [
        { title: "Account Number", key: "accountNumber" },
        { title: "Ledger Balance", key: "ledgerBalance" },
        { title: "Available Balance", key: "availableBalance" },
        { title: "Withdrawable Balance", key: "withdrawableBalance" },
        { title: "Lien Amount", key: "lienAmount" },
    ];

    const fetchStats = useCallback(async () => {
        if (!authState.token) return;

        setLoadingCards(true);
        try {
            const response = await axiosInstance.get("/net/get_account_balance", {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data?.data) {
                const formattedStats = defaultBanks.map((bank) => ({
                    title: bank.title,
                    count: bank.key === "accountNumber"
                        ? response.data.data[bank.key] || "N/A"
                        : ((response.data.data[bank.key] || 0) / 100).toLocaleString(),
                }));
                setCards(formattedStats);
            } else {
                setCards(defaultBanks.map(bank => ({ title: bank.title, count: "N/A" })));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setCards(defaultBanks.map(bank => ({ title: bank.title, count: "N/A" })));
        } finally {
            setLoadingCards(false);
        }
    }, [authState.token]);

    useEffect(() => {
        const delayFetch = setTimeout(() => {
            fetchStats();
        }, 1000);
        return () => clearTimeout(delayFetch);
    }, [fetchStats]);

    useEffect(() => {
        setShowSearchQuery(false);
        return () => setShowSearchQuery(false);
    }, [setShowSearchQuery]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300">
            <Header headerTitle="NETMFB SUMMARY" />
            <div className="p-6">
                {loadingCards && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="w-12 h-12 border-4 border-white border-t-green-500 rounded-full animate-spin" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center transition-all"
                        >
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                {card.title}
                            </h3>
                            <p className={`mt-2 text-3xl font-bold ${loadingCards ? "text-gray-400 animate-pulse" : "text-green-500"}`}>
                                {loadingCards ? "..." : card.count}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NetmfbSummary;
