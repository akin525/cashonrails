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
    number: string;
    currency: string;
    country: string;
    privacy_policy: string;
    description: string;
    logo: string;
    header_image: string;
    domain: string;
    email: string;
    address: string;
    state: string;
    city: string;
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

const StorefrontPage = ({ params }: { params: { id: string } }) => {
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        currency: "",
        number: "",
        email: "",
        domain: "",
        privacy_policy: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: ""
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [domainAvailable, setDomainAvailable] = useState<null | boolean>(null);
    const [checkingDomain, setCheckingDomain] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingStoreId, setEditingStoreId] = useState<number | null>(null);

    useEffect(() => {
        if (!form.domain) {
            setDomainAvailable(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setCheckingDomain(true);
            try {
                const res = await axiosInstance.get(`/alias/${form.domain}`,{
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (!res.data.status) {
                    setDomainAvailable(false);
                } else {
                    setDomainAvailable(true);
                }

            } catch (err: any) {
                if (err.response?.status === false) {
                    setDomainAvailable(true); // if not found, it's available
                } else {
                    setDomainAvailable(null); // something went wrong
                }
            } finally {
                setCheckingDomain(false);
            }
        }, 500); // debounce by 500ms

        return () => clearTimeout(delayDebounce);
    }, [form.domain]);

    const [uploadedAssets, setUploadedAssets] = useState<{ logo?: string; banner?: string }>({});
    const [uploading, setUploading] = useState<{ logo: boolean; banner: boolean }>({ logo: false, banner: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusLabel = (status: number | string) => {
        if (status === 1 || status === "1") return "active";
        if (status === 0 || status === "0") return "inactive";
        return String(status).toLowerCase();
    };
    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        typeKey: "logo" | "banner"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading((prev) => ({ ...prev, [typeKey]: true }));

        const formData = new FormData();
        formData.append("type", "store-media");
        formData.append("file", file);

        try {
            const res = await axiosInstance.post(`/file-upload/${params.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${authState.token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                setUploadedAssets((prev) => ({
                    ...prev,
                    [typeKey]: res.data.data.id, // assuming `file` is the path/url
                }));
                toast.success(`${typeKey} uploaded`);
            } else {
                toast.error(res.data.message || `Upload failed`);
            }
        } catch (error: any) {
            toast.error(error.message || "Upload error");
        } finally {
            setUploading((prev) => ({ ...prev, [typeKey]: false }));
        }
    };

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/all-store-biz/${params.id}?page=${page}&limit=${limit}`, {
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stores</h2>
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
                        className="text-sm text-green-600 dark:text-green-400 underline"
                    >
                        {sortOrder === "asc" ? "Asc ↑" : "Desc ↓"}
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
                    >
                        <Download size={16}/> Export
                    </button>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsEditing(false);
                            setEditingStoreId(null);
                            setForm({
                                name: "",
                                currency: "",
                                number: "",
                                email: "",
                                domain: "",
                                privacy_policy: "",
                                description: "",
                                address: "",
                                city: "",
                                state: "",
                                country: ""
                            });
                            setUploadedAssets({});
                        }}
                        className="text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
                    >
                        + Create Store
                    </button>
                </div>
            </div>

            {/* Store Cards */}
            {isLoading ? (
                <TableDetailSkeleton/>
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
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModalOpen(true);
                                    setIsEditing(true);
                                    setEditingStoreId(store.id);
                                    setForm({
                                        name: store.name,
                                        currency: store.currency || "",
                                        number: store.number || "",
                                        email: store.email || "",
                                        domain: store.domain,
                                        privacy_policy: store.privacy_policy || "",
                                        description: store.description || "",
                                        address: store.address || "",
                                        city: store.city || "",
                                        state: store.state || "",
                                        country: store.country || ""
                                    });
                                    setUploadedAssets({
                                        logo: store.logo || "",
                                        banner: store.header_image || ""
                                    });
                                }}
                                className="text-xs text-green-600 underline mt-2"
                            >
                                Edit
                            </button>

                            <div
                                className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600">{store.name}</div>
                            <div className="text-sm text-green-600 dark:text-green-400 truncate mb-2">{store.domain}</div>
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
                            {/*<h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">*/}
                            {/*    {isEditing ? "Update Store" : "Create New Store"}*/}
                            {/*</h3>*/}

                        </div>

                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6 relative">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create New Store</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {["name", "currency", "number", "email", "domain", "privacy_policy", "description", "address", "city", "state", "country"].map((key) => (
                                key === "domain" ? (
                                    <div key={key}>
                                    <input
                                            type="text"
                                            placeholder="DOMAIN"
                                            value={form.domain}
                                            onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                            className="px-3 py-2 text-sm border rounded-md w-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                        />
                                        <p className="text-xs mt-1">
                                            {checkingDomain && <span className="text-green-500">Checking...</span>}
                                            {!checkingDomain && domainAvailable === true && (
                                                <span className="text-green-600 dark:text-green-400">Domain is available ✔</span>
                                            )}
                                            {!checkingDomain && domainAvailable === false && (
                                                <span className="text-red-600 dark:text-red-400">Domain already exists ✖</span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <input
                                        key={key}
                                        type="text"
                                        placeholder={key.replace("_", " ").toUpperCase()}
                                        value={(form as any)[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        className="px-3 py-2 text-sm border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                )
                            ))}


                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Logo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "logo")}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                                />
                                {uploading.logo && <p className="text-xs text-green-500">Uploading...</p>}
                                {uploadedAssets.logo && <p className="text-xs text-green-500">Uploaded ✔</p>}
                            </div>

                            {/* Banner Upload */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Banner (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "banner")}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                                />
                                {uploading.banner && <p className="text-xs text-green-500">Uploading...</p>}
                                {uploadedAssets.banner && <p className="text-xs text-green-500">Uploaded ✔</p>}
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    // if (domainAvailable === false && !isEditing) {
                                    //     toast.error("Domain is already taken");
                                    //     return;
                                    // }
                                    setIsSubmitting(true);
                                    try {
                                        const payload = {
                                            ...form,
                                            logo: uploadedAssets.logo || null,
                                            header_image: uploadedAssets.banner || null,
                                        };

                                        const endpoint = isEditing
                                            ? `/update-store-biz/${editingStoreId}`
                                            : `/create-store-biz/${params.id}`;

                                        const method = isEditing ? axiosInstance.post : axiosInstance.post;

                                        const response = await method(endpoint, payload, {
                                            headers: {
                                                Authorization: `Bearer ${authState?.token}`,
                                                // timeout:30000,
                                            },
                                        });

                                        if (response.data.status) {
                                            toast.success(`Store ${isEditing ? "updated" : "created"} successfully`);
                                            setIsModalOpen(false);
                                            fetchStores();
                                            setForm({
                                                name: "",
                                                currency: "",
                                                number: "",
                                                email: "",
                                                domain: "",
                                                privacy_policy: "",
                                                description: "",
                                                address: "",
                                                city: "",
                                                state: "",
                                                country: ""
                                            });
                                            setUploadedAssets({});
                                        } else {
                                            toast.error(response.data.message || `Failed to ${isEditing ? "update" : "create"} store`);
                                        }
                                    } catch (error: any) {
                                        if (error.response?.status === 422) {
                                            toast.error("Validation error: " + Object.values(error.response.data.errors).join(", "));
                                        } else {
                                            toast.error(`Failed to ${isEditing ? "update" : "create"} store`);
                                        }
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}

                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-md text-white ${isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
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
