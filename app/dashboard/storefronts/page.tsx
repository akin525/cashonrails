"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {RouteLiteral} from "nextjs-routes";

interface Store {
    id: number;
    name: string;
    domain: string;
    status: number | string;
    created_at: string;
}

interface Pagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    nextPage: number | null;
}

const StorefrontPage = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const limit = 10;

    const getStatusLabel = (status: number | string) => {
        if (status === 1 || status === "1") return "active";
        if (status === 0 || status === "0") return "inactive";
        return String(status).toLowerCase();
    };

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/all-store?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });

            if (response.data.status) {
                let data: Store[] = response.data.data.map((store: Store) => ({
                    ...store,
                    status: getStatusLabel(store.status),
                }));

                if (statusFilter !== "all") {
                    data = data.filter((store) => getStatusLabel(store.status) === statusFilter);
                }

                data.sort((a, b) => {
                    const valA = a[sortBy];
                    const valB = b[sortBy];
                    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                    return 0;
                });

                setStores(data);
                setPagination(response.data.pagination as any);
            } else {
                toast.error(response.data.message || "Failed to fetch stores.");
            }
        } catch {
            toast.error("Something went wrong while loading stores.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Name", "Domain", "Status", "Created"];
        const rows = stores.map((s) => [s.id, s.name, s.domain, s.status, s.created_at]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `stores_page_${page}.csv`;
        link.click();
    };

    useEffect(() => {
        if (authState?.token) fetchStores();
    }, [page, authState?.token, statusFilter, sortBy, sortOrder]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Stores</h2>
                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 text-sm border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>

                    <button
                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        className="text-sm text-blue-600 dark:text-blue-400 underline"
                    >
                        {sortOrder === "asc" ? "Asc ↑" : "Desc ↓"}
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Store Cards */}
            {isLoading ? (
                <TableDetailSkeleton />
            ) : stores.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No stores found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                        <div
                            key={store.id}
                            // The push method will now correctly accept the dynamic path
                            onClick={() => router.push(`/dashboard/storefronts/${store.id}/details` as RouteLiteral)}
                            className="group p-5 rounded-xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow hover:shadow-lg transition cursor-pointer"
                        >
                            <div
                                className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">{store.name}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400 truncate mb-2">{store.domain}</div>
                            <div className="text-sm mb-2">
                <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        store.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : store.status === "inactive"
                                ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                >
                  {store.status}
                </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Created on {new Date(store.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default StorefrontPage;
