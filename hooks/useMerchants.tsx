"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import { useUI } from "@/contexts/uiContext";
import axiosInstance from "@/helpers/axiosInstance";
import type { StatsData, TableData, MerchantApiPayload } from "@/types/merchant.types";

interface UseMerchantsParams {
    limit?: number;
}

interface UseMerchantsReturn {
    stats: StatsData | null;
    merchants: TableData[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    refetch: () => Promise<void>;
}

export const useMerchants = ({ limit = 10 }: UseMerchantsParams = {}): UseMerchantsReturn => {
    const { filterState } = useUI();
    const { authState } = useAuth();

    const [stats, setStats] = useState<StatsData | null>(null);
    const [merchants, setMerchants] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        if (!authState.token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {
                start_date: filterState.dateRange?.startDate,
                end_date: filterState.dateRange?.endDate,
                page: currentPage,
                limit,
            };

            const res = await axiosInstance.get<MerchantApiPayload>(
                "/operations/merchants",
                {
                    params,
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000,
                }
            );

            const merchantData = res.data?.data;
            const pagination = res.data?.pagination;

            if (merchantData) {
                setStats(merchantData.stats);
                setMerchants(merchantData.table);
                setTotalPages(pagination?.totalPage ?? 1);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch merchants");
        } finally {
            setLoading(false);
        }
    }, [authState.token, filterState.dateRange, currentPage, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        stats,
        merchants,
        loading,
        error,
        currentPage,
        totalPages,
        setCurrentPage,
        refetch: fetchData,
    };
};
