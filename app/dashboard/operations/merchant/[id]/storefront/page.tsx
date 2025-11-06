"use client";
import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import Image from "next/image";
import {
    Download,
    Plus,
    Search,
    Filter,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Store,
    Globe,
    Calendar,
    Edit2,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    DollarSign,
    Info,
    RefreshCw,
    FileText,
    // Image as ImageIcon,
    Save,
    Clock,
    Building2, ImageIcon,
} from "lucide-react";

// Add this helper function at the top of your component
const getImageUrl = (imageValue: string | number) => {
    if (!imageValue) return null;

    const strValue = String(imageValue);

    // If it's already a valid URL, return it
    if (strValue.startsWith('http://') || strValue.startsWith('https://') || strValue.startsWith('/')) {
        return strValue;
    }

    // If it's a numeric ID, construct the URL (adjust this to match your API)
    if (/^\d+$/.test(strValue)) {
        return `$${process.env.NEXT_PUBLIC_API_URL}/uploads/$$ {strValue}`; // Adjust path as needed
    }

    return null;
};



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

// Added a proper form state type including media fields
type FormState = {
    name: string;
    currency: string;
    number: string;
    email: string;
    domain: string;
    privacy_policy: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    logo: string; // URL if provided manually
    banner: string; // URL if provided manually
    favicon: string; // URL if provided manually
};

const StorefrontPage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const { authState } = useAuth();
    const { theme } = useTheme();

    // State Management
    const [stores, setStores] = useState<Store[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [searchQuery, setSearchQuery] = useState("");
    const limit = 10;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"basic" | "details" | "media">("basic");

    // Form State (now includes logo, banner, favicon)
    const [form, setForm] = useState<FormState>({
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
        country: "",
        logo: "",
        banner: "",
        favicon: "",
    });

    // Upload State
    const [uploadedAssets, setUploadedAssets] = useState<{ logo?: string; banner?: string; favicon?: string }>({});
    const [uploading, setUploading] = useState<{ logo: boolean; banner: boolean; favicon: boolean }>({
        logo: false,
        banner: false,
        favicon: false,
    });
    const [previewImages, setPreviewImages] = useState<{ logo?: string; banner?: string; favicon?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Domain Validation State
    const [domainAvailable, setDomainAvailable] = useState<null | boolean>(null);
    const [checkingDomain, setCheckingDomain] = useState(false);

    // Helper Functions
    const getStatusLabel = (status: number | string) => {
        if (status === 1 || status === "1") return "active";
        if (status === 0 || status === "0") return "inactive";
        return String(status).toLowerCase();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            case "inactive":
                return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
            case "pending":
                return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            default:
                return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
        }
    };

    // Domain Availability Check
    useEffect(() => {
        if (!form.domain) {
            setDomainAvailable(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            if (isEditing) {
                setDomainAvailable(true);
                return;
            }

            setCheckingDomain(true);
            try {
                const res = await axiosInstance.get(`/alias/${form.domain}`, {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
                // Adjust according to your API; here we assume status=true means exists
                setDomainAvailable(!res.data.status);
            } catch (err: any) {
                // 404 -> not found -> available
                setDomainAvailable(err?.response?.status === 404);
            } finally {
                setCheckingDomain(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [form.domain, authState.token, isEditing]);

    // File Upload Handler (kept for future file inputs)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, typeKey: "logo" | "banner" | "favicon") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize =
            typeKey === "logo" ? 2 * 1024 * 1024 : typeKey === "banner" ? 5 * 1024 * 1024 : 1 * 1024 * 1024; // favicon 1MB
        if (file.size > maxSize) {
            toast.error(
                `File size should not exceed ${typeKey === "logo" ? "2MB" : typeKey === "banner" ? "5MB" : "1MB"}`
            );
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviewImages((prev) => ({ ...prev, [typeKey]: previewUrl }));
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
                    [typeKey]: res.data.data.id,
                }));
                toast.success(`${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)} uploaded successfully`);
            } else {
                toast.error(res.data.message || `Upload failed`);
                setPreviewImages((prev) => ({ ...prev, [typeKey]: undefined }));
            }
        } catch (error: any) {
            toast.error(error.message || "Upload error");
            setPreviewImages((prev) => ({ ...prev, [typeKey]: undefined }));
        } finally {
            setUploading((prev) => ({ ...prev, [typeKey]: false }));
        }
    };

    // Fetch Stores
    const fetchStores = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                `/all-store-biz/${params.id}?page=${page}&limit=${limit}`,
                {
                    headers: { Authorization: `Bearer ${authState?.token}` },
                }
            );

            if (response.data.status) {
                let data: Store[] = response.data.data.map((store: Store) => ({
                    ...store,
                    status: getStatusLabel(store.status),
                }));

                if (statusFilter !== "all") {
                    data = data.filter((store) => getStatusLabel(store.status) === statusFilter);
                }

                if (searchQuery) {
                    data = data.filter(
                        (store) =>
                            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
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
        } catch (error) {
            console.error("Error fetching stores:", error);
            toast.error("Something went wrong while loading stores.");
        } finally {
            setIsLoading(false);
        }
    }, [params.id, page, statusFilter, searchQuery, sortBy, sortOrder, authState?.token]);

    // Export to CSV
    const handleExport = () => {
        const headers = ["ID", "Name", "Domain", "Email", "Status", "Country", "Created Date"];
        const rows = stores.map((s) => [
            s.id,
            s.name,
            s.domain,
            s.email || "N/A",
            s.status,
            s.country || "N/A",
            new Date(s.created_at).toLocaleDateString(),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `storefronts_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("Stores exported successfully");
    };

    // Submit Form (Create/Update)
    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error("Store name is required");
            return;
        }
        if (!form.domain.trim()) {
            toast.error("Domain is required");
            return;
        }
        if (domainAvailable === false && !isEditing) {
            toast.error("Domain is already taken");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                // Prefer uploaded IDs if available; otherwise, if user typed URLs, send those strings
                logo: uploadedAssets.logo ?? (form.logo || null),
                header_image: uploadedAssets.banner ?? (form.banner || null),
                favicon: uploadedAssets.favicon ?? (form.favicon || null),
            };

            const endpoint = isEditing ? `/update-store-biz/${editingStoreId}` : `/create-store-biz/${params.id}`;

            const response = await axiosInstance.post(endpoint, payload, {
                headers: {
                    Authorization: `Bearer ${authState?.token}`,
                },
            });

            if (response.data.status) {
                toast.success(`Store ${isEditing ? "updated" : "created"} successfully`);
                closeModal();
                fetchStores();
            } else {
                toast.error(response.data.message || `Failed to ${isEditing ? "update" : "create"} store`);
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(", ");
                toast.error("Validation error: " + errorMessages);
            } else {
                toast.error(error.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} store`);
            }
            console.error("Store submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset Form
    const resetForm = () => {
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
            country: "",
            logo: "",
            banner: "",
            favicon: "",
        });
        setUploadedAssets({});
        setPreviewImages({});
        setDomainAvailable(null);
        setActiveTab("basic");
        setIsEditing(false);
        setEditingStoreId(null);
    };

    // Modal Controls
    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (store: Store) => {
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
            country: store.country || "",
            logo: store.logo || "",
            banner: store.header_image || "",
            favicon: "", // if your API returns it, set here
        });
        setUploadedAssets({
            logo: store.logo || "",
            banner: store.header_image || "",
        });
        setPreviewImages({
            logo: store.logo || "",
            banner: store.header_image || "",
        });
        setActiveTab("basic");
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(resetForm, 300);
    };

    // Fetch stores on mount and when dependencies change
    useEffect(() => {
        if (authState?.token) fetchStores();
    }, [fetchStores, authState?.token]);

    // Components
    const StatusBadge = ({ status }: { status: string }) => {
        const getStatusIcon = () => {
            switch (status.toLowerCase()) {
                case "active":
                    return <CheckCircle className="w-3.5 h-3.5" />;
                case "inactive":
                    return <AlertCircle className="w-3.5 h-3.5" />;
                case "pending":
                    return <Clock className="w-3.5 h-3.5" />;
                default:
                    return <Info className="w-3.5 h-3.5" />;
            }
        };

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    status
                )}`}
            >
        {getStatusIcon()}
                {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
        );
    };

    const StoreCard = ({ store }: { store: Store }) => (
        <div
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => router.push(`/dashboard/storefronts/${store.id}/details` as RouteLiteral)}
        >
            {/* Store Header/Banner */}
            <div className="h-36 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-700 relative">
                {store.header_image && (
                    <Image src={store.header_image} alt={`${store.name} banner`} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(store);
                        }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="Edit store"
                    >
                        <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://${store.domain}.yourdomain.com`, "_blank");
                        }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="Visit store"
                    >
                        <ExternalLink className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-3 left-3">
                    <StatusBadge status={store.status as string} />
                </div>
            </div>

            {/* Store Content */}
            <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                    {/* Logo */}
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden relative flex-shrink-0 ring-4 ring-white dark:ring-gray-800 -mt-10 z-10 shadow-lg">
                        {store.logo ? (
                            <Image src={store.logo} alt={`${store.name} logo`} fill className="object-cover" />
                        ) : (
                            <Store className="w-7 h-7 text-gray-400" />
                        )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {store.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{store.domain}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {store.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{store.description}</p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {store.currency && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
              <DollarSign className="w-3 h-3" />
                            {store.currency}
            </span>
                    )}
                    {store.country && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
              <MapPin className="w-3 h-3" />
                            {store.country}
            </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(store.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>

                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Details
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </div>
                </div>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || statusFilter !== "all" ? "No stores found" : "No stores yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters or search terms to find what you're looking for."
                    : "Create your first storefront to start selling online and manage your products effectively."}
            </p>
            {!searchQuery && statusFilter === "all" && (
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg shadow-emerald-500/30"
                >
                    <Plus className="w-5 h-5" />
                    Create Your First Store
                </button>
            )}
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
                >
                    <div className="h-36 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Storefronts</h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 ml-14">
                                Manage your business storefronts and online shops
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => fetchStores()}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300 disabled:opacity-50 shadow-sm hover:shadow"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            <button
                                onClick={handleExport}
                                disabled={stores.length === 0}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300 disabled:opacity-50 shadow-sm hover:shadow"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>

                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Create Store
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Bar */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search stores by name, domain, or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-3">
                                    {/* Status Filter */}
                                    <div className="relative min-w-[140px]">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="appearance-none w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 cursor-pointer"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Sort By */}
                                    <div className="relative min-w-[160px]">
                                        <ArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="appearance-none w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 cursor-pointer"
                                        >
                                            <option value="created_at">Sort by Date</option>
                                            <option value="name">Sort by Name</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Sort Order Toggle */}
                                    <button
                                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                                        className="inline-flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
                                        title={sortOrder === "asc" ? "Ascending" : "Descending"}
                                    >
                                        {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(searchQuery || statusFilter !== "all") && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs">
                      Search: "{searchQuery}"
                      <button
                          onClick={() => setSearchQuery("")}
                          className="hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                                    )}
                                    {statusFilter !== "all" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs">
                      Status: {statusFilter}
                                            <button
                                                onClick={() => setStatusFilter("all")}
                                                className="hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded p-0.5"
                                            >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setStatusFilter("all");
                                        }}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Results Summary */}
                        {!isLoading && stores.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Showing{" "}
                      <span className="font-medium text-gray-900 dark:text-gray-100">{stores.length}</span> of{" "}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pagination?.totalItems || 0}
                    </span>{" "}
                      stores
                  </span>
                                    {pagination && (
                                        <span className="text-gray-600 dark:text-gray-400">
                      Page{" "}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                        {pagination.currentPage}
                      </span>{" "}
                                            of{" "}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                        {pagination.totalPages}
                      </span>
                    </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Store Cards Grid */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : stores.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map((store) => (
                            <StoreCard key={store.id} store={store} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ArrowUp className="w-4 h-4 rotate-[-90deg]" />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum;

                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                                            pageNum === page
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ArrowUp className="w-4 h-4 rotate-90" />
                        </button>
                    </div>
                )}

                {/* Create/Edit Store Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-750 dark:to-gray-750">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                            {isEditing ? (
                                                <Edit2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Store className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {isEditing ? "Edit Store" : "Create New Store"}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                {isEditing
                                                    ? "Update your store information"
                                                    : "Set up a new online storefront for your business"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("basic")}
                                        className={`flex-1 px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
                                            activeTab === "basic"
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        Basic Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`flex-1 px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
                                            activeTab === "details"
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        Store Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("media")}
                                        className={`flex-1 px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
                                            activeTab === "media"
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        Media Assets
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {activeTab === "basic" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Store Name */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Store Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your store name"
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                            </div>

                                            {/* Domain */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Store Domain <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="my-awesome-store"
                                                        value={form.domain}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                                                            })
                                                        }
                                                        className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                                            domainAvailable === false
                                                                ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10"
                                                                : domainAvailable === true
                                                                    ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10"
                                                                    : "border-gray-300 dark:border-gray-600"
                                                        }`}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        {checkingDomain && <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
                                                        {!checkingDomain && domainAvailable === true && (
                                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                        )}
                                                        {!checkingDomain && domainAvailable === false && (
                                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-start gap-2">
                                                    {checkingDomain && (
                                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            Checking availability...
                                                        </p>
                                                    )}
                                                    {!checkingDomain && domainAvailable === true && (
                                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Domain is available
                                                        </p>
                                                    )}
                                                    {!checkingDomain && domainAvailable === false && (
                                                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            Domain is already taken
                                                        </p>
                                                    )}
                                                    {!checkingDomain && !form.domain && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <Info className="w-3.5 h-3.5" />
                                                            Your store will be accessible at:{" "}
                                                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                yourdomain.com/{form.domain || "your-store"}
                              </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Currency */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Currency
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="USD, EUR, NGN, etc."
                                                        value={form.currency}
                                                        onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        placeholder="+1 (555) 000-0000"
                                                        value={form.number}
                                                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        placeholder="store@example.com"
                                                        value={form.email}
                                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Country */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Country
                                                </label>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="United States"
                                                        value={form.country}
                                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Store Description
                                                </label>
                                                <textarea
                                                    placeholder="Tell customers about your store..."
                                                    value={form.description}
                                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    A brief description that will appear on your store page.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "details" && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Address */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Street Address
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                    <textarea
                                                        placeholder="123 Main Street, Building A"
                                                        value={form.address}
                                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                        rows={2}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {/* City */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="New York"
                                                    value={form.city}
                                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                            </div>

                                            {/* State */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    State/Province
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="New York"
                                                    value={form.state}
                                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                            </div>

                                            {/* Privacy Policy */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Privacy Policy
                                                </label>
                                                <div className="relative">
                                                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                    <textarea
                                                        placeholder="Enter your store's privacy policy..."
                                                        value={form.privacy_policy}
                                                        onChange={(e) => setForm({ ...form, privacy_policy: e.target.value })}
                                                        rows={6}
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Describe how you handle customer data and privacy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "media" && (
                                    <div className="space-y-8">
                                        {/* Logo Input (URL or uploaded) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Store Logo
                                            </label>

                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-gray-50 dark:bg-gray-750">
                                                <div className="flex flex-col items-center text-center">
                                                    {form.logo || previewImages.logo ? (
                                                        <div className="relative group">
                                                            <img
                                                                src={previewImages.logo || form.logo}
                                                                alt="Store Logo"
                                                                className="w-32 h-32 object-cover rounded-xl shadow-lg"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    setForm({ ...form, logo: "" });
                                                                    setPreviewImages((p) => ({ ...p, logo: undefined }));
                                                                    setUploadedAssets((a) => ({ ...a, logo: undefined }));
                                                                }}
                                                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                                                <ImageIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                                                                Upload your store logo
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                PNG, JPG or SVG (recommended: 512x512px)
                                                            </p>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter logo URL (optional)"
                                                                value={form.logo}
                                                                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banner Input (URL or uploaded) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Store Banner
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-gray-50 dark:bg-gray-750">
                                                <div className="flex flex-col items-center text-center w-full">
                                                    {form.banner || previewImages.banner ? (
                                                        <div className="relative group w-full">
                                                            <img
                                                                src={previewImages.banner || form.banner}
                                                                alt="Store Banner"
                                                                className="w-full h-48 object-cover rounded-xl shadow-lg"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    setForm({ ...form, banner: "" });
                                                                    setPreviewImages((p) => ({ ...p, banner: undefined }));
                                                                    setUploadedAssets((a) => ({ ...a, banner: undefined }));
                                                                }}
                                                                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                                                <ImageIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                                                                Upload a banner image
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                PNG or JPG (recommended: 1920x400px)
                                                            </p>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter banner URL (optional)"
                                                                value={form.banner}
                                                                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Favicon Input (URL or uploaded) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Favicon
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all bg-gray-50 dark:bg-gray-750">
                                                <div className="flex flex-col items-center text-center">
                                                    {form.favicon || previewImages.favicon ? (
                                                        <div className="relative group">
                                                            <img
                                                                src={previewImages.favicon || form.favicon}
                                                                alt="Favicon"
                                                                className="w-16 h-16 object-cover rounded-lg shadow-lg"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    setForm({ ...form, favicon: "" });
                                                                    setPreviewImages((p) => ({ ...p, favicon: undefined }));
                                                                    setUploadedAssets((a) => ({ ...a, favicon: undefined }));
                                                                }}
                                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center
justify-center mb-3">
                                                                <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                                                                Upload a favicon
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                                ICO, PNG or SVG (recommended: 32x32px)
                                                            </p>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter favicon URL (optional)"
                                                                value={form.favicon}
                                                                onChange={(e) => setForm({ ...form, favicon: e.target.value })}
                                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span>
                          The favicon is the small icon that appears in browser tabs. It helps users identify your store when they have multiple tabs open.
                        </span>
                                            </p>
                                        </div>

                                        {/* Helper Text */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                            <div className="flex gap-3">
                                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                        Media Guidelines
                                                    </h4>
                                                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                                        <li>• Logo: Use a square image (512x512px recommended) for best results</li>
                                                        <li>• Banner: Wide format (1920x400px recommended) for header displays</li>
                                                        <li>• Favicon: Small icon (32x32px) that represents your brand</li>
                                                        <li>• You can enter URLs directly or upload files when that feature is added</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Info className="w-4 h-4" />
                                    <span>
                    {activeTab === "basic" && "Fill in the basic store information"}
                                        {activeTab === "details" && "Add additional store details"}
                                        {activeTab === "media" && "Upload or link your store media assets"}
                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>

                                    {activeTab !== "media" ? (
                                        <button
                                            onClick={() => {
                                                if (activeTab === "basic") setActiveTab("details");
                                                else if (activeTab === "details") setActiveTab("media");
                                            }}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-emerald-500/30"
                                        >
                                            Next
                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={
                                                isSubmitting ||
                                                !form.name.trim() ||
                                                !form.domain.trim() ||
                                                (domainAvailable === false && !isEditing)
                                            }
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {isEditing ? "Updating..." : "Creating..."}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    {isEditing ? "Update Store" : "Create Store"}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorefrontPage;
