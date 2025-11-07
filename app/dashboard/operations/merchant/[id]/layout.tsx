"use client";

import React, { useEffect, useState, useCallback } from "react";
import NavLinkLayout from "@/components/dashboard/SettingsTab";
import Header from "./Header";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import { StringUtils } from "@/helpers/extras";
import moment from "moment";
import { TableDetailSkeleton } from "@/components/loaders";
import toast from "react-hot-toast";
import axiosInstance from "@/helpers/axiosInstance";
import {
    Building2,
    Calendar,
    Tag,
    Hash,
    Briefcase,
    TrendingUp,
    ArrowLeft,
    RefreshCw,
    MoreVertical,
    Edit3,
    Eye,
    Settings,
    Users,
    CreditCard,
    Wallet,
    Store,
    BarChart3,
    Shield,
    DollarSign,
    Activity,
    CheckCircle,
    AlertCircle,
    Clock,
    XCircle,
    Sparkles,
    Download,
    Mail,
    Phone,
    Globe,
    MapPin,
    ExternalLink,
    Copy,
    ChevronDown,
    TrendingDown,
    Zap
} from "lucide-react";

interface MerchantData {
    id: number;
    trade_name: string;
    name: string;
    status: string;
    created_at: string;
    btype?: { name: string };
    industry?: { name: string };
    category?: { name: string };
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
}

// ===== STATUS BADGE COMPONENT =====
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return {
                    gradient: 'from-green-500 to-emerald-500',
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    text: 'text-green-700 dark:text-green-300',
                    border: 'border-green-200 dark:border-green-800',
                    icon: <CheckCircle className="w-3.5 h-3.5" />,
                    pulse: 'bg-green-500'
                };
            case 'pending':
                return {
                    gradient: 'from-yellow-500 to-orange-500',
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    text: 'text-yellow-700 dark:text-yellow-300',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    icon: <Clock className="w-3.5 h-3.5" />,
                    pulse: 'bg-yellow-500'
                };
            case 'suspended':
                return {
                    gradient: 'from-red-500 to-rose-500',
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    text: 'text-red-700 dark:text-red-300',
                    border: 'border-red-200 dark:border-red-800',
                    icon: <XCircle className="w-3.5 h-3.5" />,
                    pulse: 'bg-red-500'
                };
            case 'inactive':
                return {
                    gradient: 'from-gray-500 to-slate-500',
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                    border: 'border-gray-200 dark:border-gray-700',
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    pulse: 'bg-gray-500'
                };
            default:
                return {
                    gradient: 'from-gray-500 to-slate-500',
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                    border: 'border-gray-200 dark:border-gray-700',
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    pulse: 'bg-gray-500'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div className="inline-flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${config.pulse} animate-pulse`}></div>
                <div className={`absolute w-4 h-4 rounded-full ${config.pulse} opacity-20 animate-ping`}></div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border $${config.bg}$$ {config.text} ${config.border} shadow-sm`}>
                {config.icon}
                {StringUtils.capitalizeWords(status || "No Status")}
            </span>
        </div>
    );
};

// ===== INFO CARD COMPONENT =====
const InfoCard = ({
                      icon,
                      label,
                      value,
                      trend,
                      className = ""
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    trend?: { value: string; direction: 'up' | 'down' };
    className?: string;
}) => (
    <div className={`group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg ${className}`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform inline-block">
                            {icon}
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        {label}
                    </p>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="text-gray-900 dark:text-gray-100 font-semibold text-base">
                {value}
            </div>
        </div>
    </div>
);

// ===== QUICK ACTION BUTTON =====
const QuickActionButton = ({
                               icon,
                               label,
                               onClick,
                               variant = "default",
                               disabled = false
                           }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "primary" | "secondary" | "success" | "danger";
    disabled?: boolean;
}) => {
    const variants = {
        default: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
        primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-transparent shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
        secondary: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-transparent shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40",
        success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-transparent shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-transparent shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 text-sm font-semibold transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variants[variant]}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

// ===== STAT CARD COMPONENT =====
const StatCard = ({
                      icon,
                      label,
                      value,
                      change,
                      color
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    color: string;
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
                {change && (
                    <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        {change}
                    </div>
                )}
            </div>
            <div className={`p-3 ${color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    </div>
);
type NavigationLink = {
    label: string;
    href: string;
    icon: React.ReactNode;
    allowedRoles: string[];
};

// ===== MAIN COMPONENT =====
export default function SettingsLayout({
                                           children,
                                           params,
                                       }: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const { authState } = useAuth();
    const { theme } = useTheme();
    const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);
    const userRole = authState.userDetails?.role || "admin";

    const fetchMerchantData = useCallback(async () => {
        setIsLoading(true);
        setError(false);
        try {
            const response = await axiosInstance.get<MerchantData>(`/growth/merchants/${params.id}`, {
                headers: { Authorization: `Bearer ${authState?.token}` },
                timeout:600000,
            });
            if (response.data.status && response.data.data) {
                setMerchantData(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            setError(true);
            toast.error("Error loading merchant data. Please try again.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [params.id, authState?.token]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchMerchantData();
        toast.success("Data refreshed successfully!");
    };

    const handleCopyId = () => {
        if (merchantData?.id) {
            navigator.clipboard.writeText(merchantData.id.toString());
            toast.success("Business ID copied to clipboard!");
        }
    };

    useEffect(() => {
        if (authState.token) {
            fetchMerchantData();
        }
    }, [authState.token, fetchMerchantData]);
    const hasAccess = (userRole: string, allowedRoles: string[]) => {
        return allowedRoles.includes(userRole);
    };
    const navigationLinks = [
        {
            label: "Business",
            href: `/dashboard/operations/merchant/${params.id}/business`,
            icon: <Building2 className="w-4 h-4" />
        },
        {
            label: "Edit Business",
            href: `/dashboard/operations/merchant/${params.id}/edit-business`,
            icon: <Edit3 className="w-4 h-4" />,
            // allowedRoles: ["superadmin"]

        },
        {
            label: "Upload KYC",
            href: `/dashboard/operations/merchant/${params.id}/upload-kyc`,
            icon: <Shield className="w-4 h-4" />,
            // allowedRoles: ["superadmin"]

        },
        {
            label: "Upload Directors",
            href: `/dashboard/operations/merchant/${params.id}/upload-directors`,
            icon: <Users className="w-4 h-4" />,
            // allowedRoles: ["superadmin"]
        },
        {
            label: "Transactions",
            href: `/dashboard/operations/merchant/${params.id}/transaction`,
            icon: <Activity className="w-4 h-4" />
        },
        {
            label: "Payout",
            href: `/dashboard/operations/merchant/${params.id}/payout`,
            icon: <DollarSign className="w-4 h-4" />
        },
        // {
        //     label: "Storefronts",
        //     href: `/dashboard/operations/merchant/${params.id}/storefront`,
        //     icon: <Store className="w-4 h-4" />
        // },
        {
            label: "Settlement",
            href: `/dashboard/operations/merchant/${params.id}/settlement`,
            icon: <BarChart3 className="w-4 h-4" />
        },
        {
            label: "Wallets",
            href: `/dashboard/operations/merchant/${params.id}/wallets`,
            icon: <Wallet className="w-4 h-4" />
        },
        {
            label: "Wallet Transactions",
            href: `/dashboard/operations/merchant/${params.id}/wallet-transaction`,
            icon: <CreditCard className="w-4 h-4" />
        },
        {
            label: "Payment Methods & Fees",
            href: `/dashboard/operations/merchant/${params.id}/payment-method-fees`,
            icon: <Settings className="w-4 h-4" />,
            // allowedRoles: ["superadmin"]

        },
        {
            label: "Teams",
            href: `/dashboard/operations/merchant/${params.id}/teams`,
            icon: <Users className="w-4 h-4" />
        },
    ];

    // const filteredNavigationLinks = navigationLinks.filter(link =>
    //     link.allowedRoles.includes(userRole)
    // )
    const formatDate = (date: string) => {
        return moment(date).format("MMM DD, YYYY • h:mm A");
    };

    // ===== ERROR STATE =====
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-10 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Oops! Something Went Wrong
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We couldn't load the merchant data. Please check your connection and try again.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <QuickActionButton
                                icon={<ArrowLeft className="w-4 h-4" />}
                                label="Go Back"
                                onClick={() => window.history.back()}
                                variant="default"
                            />
                            <QuickActionButton
                                icon={<RefreshCw className="w-4 h-4" />}
                                label="Retry"
                                onClick={handleRefresh}
                                variant="primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ===== NOT FOUND STATE =====
    if (!isLoading && !merchantData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <Header title={"Merchant Not Found"} />
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Merchant Not Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            No merchant data found for ID:
                        </p>
                        <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 mb-8">
                            #{params.id}
                        </p>
                        <QuickActionButton
                            icon={<ArrowLeft className="w-4 h-4" />}
                            label="Go Back"
                            onClick={() => window.history.back()}
                            variant="primary"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ===== MAIN LAYOUT =====
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            <Header title={merchantData?.trade_name || "Loading..."} />

            <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                {isLoading ? (
                    <TableDetailSkeleton />
                ) : (
                    <>
                        {/* ===== HERO MERCHANT CARD ===== */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Background Decoration */}
                            <div className="relative h-32 bg-gradient-to-r from-green-500 via-gray-500 to-green-500 overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative px-8 pb-8">
                                {/* Profile Section */}
                                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 gap-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-32 h-32 bg-gradient-to-br from-green-500 via-green-950  rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-4 border-white dark:border-gray-800 transform hover:scale-105 transition-transform duration-300">
                                                {merchantData?.name?.[0]?.toUpperCase() || "M"}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700">
                                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                            </div>
                                        </div>

                                        {/* Business Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                    {merchantData?.trade_name || "N/A"}
                                                </h1>
                                                <button
                                                    onClick={handleCopyId}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Copy Business ID"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                                                {merchantData?.name || "N/A"}
                                            </p>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <StatusBadge status={merchantData?.status || "inactive"} />
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Joined {merchantData?.created_at ? moment(merchantData.created_at).fromNow() : "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <QuickActionButton
                                            icon={<Eye className="w-4 h-4" />}
                                            label="View Details"
                                            onClick={() => {}}
                                            variant="default"
                                        />
                                        <QuickActionButton
                                            icon={isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            label="Refresh"
                                            onClick={handleRefresh}
                                            variant="default"
                                            disabled={isRefreshing}
                                        />
                                        <QuickActionButton
                                            icon={<Download className="w-4 h-4" />}
                                            label="Export"
                                            onClick={() => toast.success("Export feature coming soon!")}
                                            variant="secondary"
                                        />
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowMoreActions(!showMoreActions)}
                                                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            {showMoreActions && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                        Edit Business
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                        Send Email
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                        Suspend Account
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                {/*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">*/}
                                {/*    <StatCard*/}
                                {/*        icon={<Activity className="w-6 h-6 text-white" />}*/}
                                {/*        label="Total Transactions"*/}
                                {/*        value="12,543"*/}
                                {/*        change="+12.5%"*/}
                                {/*        color="bg-gradient-to-br from-blue-500 to-blue-600"*/}
                                {/*    />*/}
                                {/*    <StatCard*/}
                                {/*        icon={<DollarSign className="w-6 h-6 text-white" />}*/}
                                {/*        label="Total Revenue"*/}
                                {/*        value="₦2.4M"*/}
                                {/*        change="+8.2%"*/}
                                {/*        color="bg-gradient-to-br from-green-500 to-green-600"*/}
                                {/*    />*/}
                                {/*    <StatCard*/}
                                {/*        icon={<Users className="w-6 h-6 text-white" />}*/}
                                {/*        label="Active Users"*/}
                                {/*        value="1,234"*/}
                                {/*        change="+5.7%"*/}
                                {/*        color="bg-gradient-to-br from-purple-500 to-purple-600"*/}
                                {/*    />*/}
                                {/*    <StatCard*/}
                                {/*        icon={<Zap className="w-6 h-6 text-white" />}*/}
                                {/*        label="Success Rate"*/}
                                {/*        value="98.5%"*/}
                                {/*        change="+2.1%"*/}
                                {/*        color="bg-gradient-to-br from-orange-500 to-orange-600"*/}
                                {/*    />*/}
                                {/*</div>*/}

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                                    <InfoCard
                                        icon={<Calendar className="w-4 h-4" />}
                                        label="Date Created"
                                        value={merchantData?.created_at ? formatDate(merchantData.created_at) : "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Briefcase className="w-4 h-4" />}
                                        label="Business Type"
                                        value={merchantData?.btype?.name || "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Hash className="w-4 h-4" />}
                                        label="Business ID"
                                        value={
                                            <span className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-bold">
                                                #{merchantData?.id || "N/A"}
                                            </span>
                                        }
                                    />
                                    <InfoCard
                                        icon={<TrendingUp className="w-4 h-4" />}
                                        label="Industry"
                                        value={merchantData?.industry?.name || "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Tag className="w-4 h-4" />}
                                        label="Category"
                                        value={merchantData?.category?.name || "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Mail className="w-4 h-4" />}
                                        label="Email"
                                        value={merchantData?.email || "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Phone className="w-4 h-4" />}
                                        label="Phone"
                                        value={merchantData?.phone || "N/A"}
                                    />
                                    <InfoCard
                                        icon={<Globe className="w-4 h-4" />}
                                        label="Website"
                                        value={merchantData?.website ? (
                                            <a
                                                href={merchantData.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Visit <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) :
                                            "N/A"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ===== NAVIGATION TABS ===== */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850">
                                <nav className="flex overflow-x-auto scrollbar-hide px-2" aria-label="Tabs">
                                    <NavLinkLayout links={navigationLinks} />
                                </nav>
                            </div>
                        </div>

                        {/* ===== CONTENT AREA ===== */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6">
                                {children}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
