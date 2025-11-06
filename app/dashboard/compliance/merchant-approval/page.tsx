"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    Fragment,
} from "react";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import { useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import Header from "./Header";
import axiosInstance from "@/helpers/axiosInstance";
import { MetricCard } from "@/components/MatricCard";
import { Chip } from "@/components/chip";
import { StringUtils } from "@/helpers/extras";

/* ──────────── Types ──────────── */
export interface StatsData {
    total_merchant: number;
    approved_merchant: number;
    new_merchant: number;
    rejected_merchant: number;
    pending_merchant: number;
}

export interface TableData {
    id: string;
    merchant_id: string;
    merchant_name: string;
    status: string;
    total_revenue: string;
    date_created: string;
    business_type: string;
    risk_score: string;
}

export interface MerchantData {
    stats: StatsData;
    table: TableData[];
}

export interface PaginationRes {
    totalPage: number;
    currentPage: number;
    totalItems: number;
    limit: number;
}
export interface MerchantApiPayload {
    data?: MerchantData;
    pagination?: PaginationRes;
}
/* ──────────── Page ──────────── */
const MerchantsPage: React.FC = () => {
    const router = useRouter();
    const { setShowHeader, setShowSearchQuery, filterState } = useUI();
    const { authState } = useAuth();

    const [stats, setStats] = useState<StatsData | null>(null);
    const [merchants, setMerchants] = useState<TableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const limit = 10;

    const queryParams = useMemo(
        () => ({
            status: filterState.status,
            start_date: filterState.dateRange.startDate,
            end_date: filterState.dateRange.endDate,
            page: currentPage,
            limit,
        }),
        [filterState, currentPage]
    );

    const fetchData = useCallback(async () => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get<MerchantApiPayload>("/operations/merchants", {
                params: queryParams,
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            const merchantData = res.data.data  as MerchantData;
            const pagination = res.data?.pagination;

            setStats(merchantData.stats);
            setMerchants(merchantData.table);
            setTotalPages(pagination?.totalPage || 1);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setShowHeader(false);
        setShowSearchQuery(true);
        return () => setShowHeader(false);
    }, [setShowHeader, setShowSearchQuery]); // Added missing dependencies

    const MetricCards = () =>
        stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-4">
                {([
                    ["Total Merchants", stats.total_merchant],
                    ["Approved", stats.approved_merchant],
                    ["Pending", stats.pending_merchant],
                    ["New", stats.new_merchant],
                    ["Rejected", stats.rejected_merchant],
                ] satisfies [string, number][]).map(([title, count]) => (
                    <MetricCard
                        key={title}
                        title={title}
                        count={count.toString()}
                        variant="success"
                        isLoading={loading}
                    />
                ))}
            </div>
        );

    const MerchantCard = ({ merchant }: { merchant: TableData }) => (
        <div
            onClick={() =>
                router.push(
                    `/dashboard/compliance/merchant-approval/${merchant.merchant_id}/business` as RouteLiteral
                )
            }
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-5 cursor-pointer group"
        >
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg group-hover:text-primary">
                    {merchant.merchant_name}
                </h2>
                <Chip variant={merchant.status.toLowerCase()}>
                    {StringUtils.capitalizeWords(merchant.status)}
                </Chip>
            </div>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <p>
                    <strong>Merchant ID:</strong> {merchant.merchant_id}
                </p>
                <p>
                    <strong>Business Type:</strong> {merchant.business_type}
                </p>
                <p>
                    <strong>Date Created:</strong> {merchant.date_created}
                </p>
                <p>
                    <strong>Risk Score:</strong> {merchant.risk_score}
                </p>
            </div>
        </div>
    );

    const Pagination = () => {
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <div className="flex justify-center mt-10 space-x-1 text-sm">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-30"
                >
                    Prev
                </button>
                {pages.map((p) => (
                    <Fragment key={p}>
                        {Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages ? (
                            <button
                                onClick={() => setCurrentPage(p)}
                                className={`px-3 py-1 border rounded ${
                                    p === currentPage
                                        ? "bg-primary text-white font-semibold"
                                        : ""
                                }`}
                            >
                                {p}
                            </button>
                        ) : (
                            (p === currentPage - 3 || p === currentPage + 3) && (
                                <span className="px-2">…</span>
                            )
                        )}
                    </Fragment>
                ))}
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-30"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <>
            <Header headerTitle="Merchant Approval" />
            <div className="p-4">
                <MetricCards />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                    {loading
                        ? Array.from({ length: limit }).map((_, i) => (
                            <div
                                key={i}
                                className="h-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"
                            />
                        ))
                        : merchants.map((merchant) => (
                            <MerchantCard key={merchant.merchant_id} merchant={merchant} />
                        ))}
                </div>

                {!loading && <Pagination />}
            </div>
        </>
    );
};

export default MerchantsPage;
