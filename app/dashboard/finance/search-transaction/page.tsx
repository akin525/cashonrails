"use client";

import React, { useState, useCallback, useMemo } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import {
    Search,
    RefreshCw,
    Copy,
    ExternalLink,
    Calendar,
    DollarSign,
    Globe,
    Hash,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    Send,
    Download,
    Filter,
    Bookmark,
    Share2,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    Activity,
    CreditCard,
    Building,
    User,
    MapPin,
    Phone,
    Mail,
    Link as LinkIcon,
    Zap,
    Shield,
    TrendingUp,
    Database
} from "lucide-react";

interface TransactionDetails {
    id: string;
    domain: string;
    amount: number;
    status: string;
    currency: string;
    reference: string;
    sessionid: string;
    created_at: string;
    fee: number;
    sys_fee: number;
    business_id: string;
    business: any;
    webhook_event: any;
    gateway_response: any;
}

interface SearchHistory {
    id: string;
    query: string;
    timestamp: Date;
    found: boolean;
}

export default function SearchTransaction() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const router = useRouter();

    // Memoized search suggestions
    const searchSuggestions = useMemo(() => [
        "TXN_",
        "REF_",
        "SES_",
        "PAY_"
    ], []);

    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionID.trim()) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setLoading(true);
        setTransactionDetails(null);

        try {
            const res = await axiosInstance.get(`/finance/search-transactions`, {
                params: { search: transactionID.trim() },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:90000,
            });

            if (res.data.status && res.data.data?.length > 0) {
                const transaction = res.data.data[0];
                setTransactionDetails(transaction);

                // Add to search history
                const historyItem: SearchHistory = {
                    id: transaction.id,
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: true
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);

                toast.success("Transaction found successfully!");
            } else {
                // Add failed search to history
                const historyItem: SearchHistory = {
                    id: Date.now().toString(),
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: false
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);
                toast.error("Transaction not found");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Error fetching transaction details");
        } finally {
            setLoading(false);
        }
    }, [transactionID, authState.token]);

    const resendWebhook = useCallback(async () => {
        if (!transactionDetails?.business_id || !transactionDetails?.id) return;

        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `/resend_transaction_webhook/${transactionDetails.business_id}/live/${transactionDetails.id}`,
                { headers: { Authorization: `Bearer ${authState.token}` } }
            );
            toast[res.data.success ? "success" : "error"](res.data.message);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Webhook resend failed");
        } finally {
            setLoading(false);
        }
    }, [transactionDetails, authState.token]);

    const copyToClipboard = useCallback((text: string, label?: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label || 'Text'} copied to clipboard!`);
    }, []);

    const exportTransaction = useCallback(() => {
        if (!transactionDetails) return;

        const data = {
            transaction: transactionDetails,
            exported_at: new Date().toISOString(),
            exported_by: authState.userDetails?.name
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction_${transactionDetails.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Transaction exported successfully!');
    }, [transactionDetails, authState.userDetails]);

    const shareTransaction = useCallback(() => {
        if (!transactionDetails) return;

        const shareData = {
            title: `Transaction ${transactionDetails.id}`,
            text: `Transaction Details - Amount: ${transactionDetails.currency} ${transactionDetails.amount}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            copyToClipboard(window.location.href, 'Transaction URL');
        }
    }, [transactionDetails, copyToClipboard]);

    const getStatusConfig = useCallback((status: string) => {
        const configs = {
            successful: {
                color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                icon: CheckCircle,
                pulse: false
            },
            success: {
                color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                icon: CheckCircle,
                pulse: false
            },
            failed: {
                color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                icon: XCircle,
                pulse: false
            },
            error: {
                color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                icon: XCircle,
                pulse: false
            },
            pending: {
                color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                icon: Clock,
                pulse: true
            },
            processing: {
                color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                icon: RefreshCw,
                pulse: true
            }
        };

        return configs[status?.toLowerCase() as keyof typeof configs] || {
            color: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
            icon: AlertCircle,
            pulse: false
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Header headerTitle="Transaction Intelligence" />

                {/* Enhanced Search Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Search & Analyze Transactions</h2>
                                <p className="text-emerald-100">Enter transaction ID, reference, or session ID to get detailed insights</p>
                            </div>
                            <div className="hidden lg:flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{searchHistory.filter(h => h.found).length}</div>
                                    <div className="text-xs text-emerald-100">Found</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{searchHistory.length}</div>
                                    <div className="text-xs text-emerald-100">Searches</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            value={transactionID}
                                            onChange={(e) => setTransactionID(e.target.value)}
                                            placeholder="Enter Transaction ID, Reference, or Session ID..."
                                            className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                                        />
                                        {searchHistory.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowHistory(!showHistory)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <Clock className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 text-white font-semibold rounded-xl transition-all flex items-center gap-3 min-w-[140px] justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                Search
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Search History Dropdown */}
                                {showHistory && searchHistory.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Recent Searches</h4>
                                        </div>
                                        {searchHistory.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setTransactionID(item.query);
                                                    setShowHistory(false);
                                                }}
                                                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{item.query}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.timestamp.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${item.found ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Search Suggestions */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Quick search:</span>
                                {searchSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setTransactionID(suggestion)}
                                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900 dark:hover:text-emerald-300 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced Results Section */}
                {transactionDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Transaction Header with Actions */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Transaction Analysis
                                        </h3>
                                        <StatusBadge
                                            status={transactionDetails.status}
                                            getStatusConfig={getStatusConfig}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            <span className="font-mono">{transactionDetails.id}</span>
                                            <button
                                                onClick={() => copyToClipboard(transactionDetails.id, 'Transaction ID')}
                                                className="text-emerald-600 hover:text-emerald-700 p-1 rounded"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(transactionDetails.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {transactionDetails.currency} {transactionDetails.amount?.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Net: {transactionDetails.currency} {(transactionDetails.amount - transactionDetails.fee)?.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setBookmarked(!bookmarked)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                bookmarked
                                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <Bookmark className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={shareTransaction}
                                            className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={exportTransaction}
                                            className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>

                                        <div className="relative">
                                            <button className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Tabs */}
                        <EnhancedTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "overview" && (
                                <EnhancedOverviewTab
                                    details={transactionDetails}
                                    copyToClipboard={copyToClipboard}
                                    getStatusConfig={getStatusConfig}
                                />
                            )}
                            {activeTab === "webhook" && (
                                <EnhancedWebhookTab
                                    webhook={transactionDetails.webhook_event}
                                    onResend={resendWebhook}
                                    loading={loading}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}
                            {activeTab === "gateway" && (
                                <EnhancedGatewayTab
                                    data={transactionDetails.gateway_response}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}
                            {activeTab === "business" && (
                                <EnhancedBusinessTab
                                    business={transactionDetails.business}
                                    businessId={transactionDetails.business_id}
                                    router={router}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}
                            {activeTab === "timeline" && (
                                <TimelineTab details={transactionDetails} />
                            )}
                            {activeTab === "analytics" && (
                                <AnalyticsTab details={transactionDetails} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Enhanced Components
function StatusBadge({ status, getStatusConfig }: { status: string; getStatusConfig: (status: string) => any }) {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
      <Icon className="w-4 h-4" />
            {status}
    </span>
    );
}

function EnhancedTabNavigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const tabs = [
        { id: "overview", label: "Overview", icon: Eye, description: "Transaction details" },
        { id: "webhook", label: "Webhook", icon: Send, description: "Event notifications" },
        { id: "gateway", label: "Gateway", icon: Globe, description: "Payment gateway data" },
        { id: "business", label: "Business", icon: Building, description: "Merchant information" },
        { id: "timeline", label: "Timeline", icon: Activity, description: "Transaction flow" },
        { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Performance metrics" },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <div className="text-left">
                                <div>{tab.label}</div>
                                <div className="text-xs opacity-75">{tab.description}</div>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

// First, let's define the proper interface for fields
interface FieldConfig {
    label: string;
    value: string;
    icon: any;
    copyable?: boolean;
    isStatus?: boolean;
}

interface SectionConfig {
    title: string;
    icon: any;
    fields: FieldConfig[];
}

function EnhancedOverviewTab({ details, copyToClipboard, getStatusConfig }: {
    details: TransactionDetails;
    copyToClipboard: (text: string, label?: string) => void;
    getStatusConfig: (status: string) => any;
}) {
    const sections: SectionConfig[] = [
        {
            title: "Transaction Information",
            icon: CreditCard,
            fields: [
                { label: "Transaction ID", value: details.id, icon: Hash, copyable: true },
                { label: "Reference", value: details.reference, icon: Hash, copyable: true },
                { label: "Session ID", value: details.sessionid, icon: Hash, copyable: true },
                { label: "Status", value: details.status, icon: Shield, isStatus: true, copyable: false },
            ]
        },
        {
            title: "Financial Details",
            icon: DollarSign,
            fields: [
                { label: "Amount", value: `${details.currency} ${details.amount?.toLocaleString()}`, icon: DollarSign, copyable: true },
                { label: "Fee", value: `${details.currency} ${details.fee?.toLocaleString()}`, icon: DollarSign, copyable: true },
                { label: "System Fee", value: `${details.currency} ${details.sys_fee?.toLocaleString()}`, icon: DollarSign, copyable: true },
                { label: "Net Amount", value: `${details.currency} ${(details.amount - details.fee)?.toLocaleString()}`, icon: DollarSign, copyable: true },
            ]
        },
        {
            title: "Technical Details",
            icon: Database,
            fields: [
                { label: "Domain", value: details.domain, icon: Globe, copyable: true },
                { label: "Currency", value: details.currency, icon: DollarSign, copyable: true },
                { label: "Created At", value: new Date(details.created_at).toLocaleString(), icon: Calendar, copyable: false },
            ]
        }
    ];

    return (
        <div className="space-y-8">
            {sections.map((section) => {
                const SectionIcon = section.icon;
                return (
                    <div key={section.title} className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                <SectionIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.fields.map((field) => {
                                const Icon = field.icon;
                                return (
                                    <div key={field.label} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {field.label}
                                                </span>
                                            </div>
                                            {field.copyable && (
                                                <button
                                                    onClick={() => copyToClipboard(field.value, field.label)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-600 transition-all"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                            {field.isStatus ? (
                                                <StatusBadge status={field.value} getStatusConfig={getStatusConfig} />
                                            ) : (
                                                <div className="text-gray-900 dark:text-white font-mono text-sm break-all">
                                                    {field.value || "N/A"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function EnhancedWebhookTab({ webhook, onResend, loading, copyToClipboard }: {
    webhook: any;
    onResend: () => void;
    loading: boolean;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Events</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage webhook notifications and responses</p>
                    </div>
                </div>
                <button
                    onClick={onResend}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    {loading ? "Sending..." : "Resend Webhook"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EnhancedInfoCard
                    label="Event Type"
                    value={webhook?.event}
                    icon={Zap}
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Transaction ID"
                    value={webhook?.trx}
                    icon={Hash}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Response Code"
                    value={webhook?.responseCode}
                    icon={Shield}
                    copyToClipboard={copyToClipboard}
                />
            </div>

            <EnhancedJSONViewer
                label="Webhook Request Payload"
                data={webhook?.request}
                copyToClipboard={copyToClipboard}
            />
        </div>
    );
}

function EnhancedGatewayTab({ data, copyToClipboard }: {
    data: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Gateway Response</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment gateway communication details</p>
                </div>
            </div>

            <EnhancedJSONViewer
                label="Gateway Response Data"
                data={data}
                copyToClipboard={copyToClipboard}
            />
        </div>
    );
}

function EnhancedBusinessTab({ business, businessId, router, copyToClipboard }: {
    business: any;
    businessId: string;
    router: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    const businessFields: FieldConfig[] = [
        { label: "Business Name", value: business?.name, icon: Building, copyable: true },
        { label: "Trade Name", value: business?.trade_name, icon: Building, copyable: true },
        { label: "Email", value: business?.biz_email, icon: Mail, copyable: true },
        { label: "Phone", value: business?.biz_phone, icon: Phone, copyable: true },
        { label: "Website", value: business?.biz_url, icon: LinkIcon, copyable: true },
        { label: "Address", value: business?.biz_address, icon: MapPin, copyable: false },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Merchant account details and contact information</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/operations/merchant/${businessId}/business` as RouteLiteral)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Full Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessFields.map((field) => (
                    <EnhancedInfoCard
                        key={field.label}
                        label={field.label}
                        value={field.value}
                        icon={field.icon}
                        copyable={field.copyable}
                        copyToClipboard={copyToClipboard}
                    />
                ))}
            </div>

            {/* Business Stats */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">Live</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Environment</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">API</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Integration</div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function TimelineTab({ details }: { details: TransactionDetails }) {
    const timelineEvents = [
        {
            id: 1,
            title: "Transaction Initiated",
            description: "Customer started the payment process",
            timestamp: details.created_at,
            status: "completed",
            icon: CreditCard
        },
        {
            id: 2,
            title: "Payment Processing",
            description: "Transaction sent to payment gateway",
            timestamp: details.created_at,
            status: "completed",
            icon: RefreshCw
        },
        {
            id: 3,
            title: "Gateway Response",
            description: "Payment gateway processed the transaction",
            timestamp: details.created_at,
            status: details.status === 'successful' ? 'completed' : 'failed',
            icon: Globe
        },
        {
            id: 4,
            title: "Webhook Sent",
            description: "Notification sent to merchant endpoint",
            timestamp: details.created_at,
            status: "completed",
            icon: Send
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Timeline</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step transaction flow</p>
                </div>
            </div>

            <div className="relative">
                {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    const isLast = index === timelineEvents.length - 1;

                    return (
                        <div key={event.id} className="relative flex items-start gap-4 pb-8">
                            {!isLast && (
                                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-600" />
                            )}

                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                event.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : event.status === 'failed'
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-gray-900 dark:text-white">{event.title}</h5>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            event.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                : event.status === 'failed'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                      {event.status}
                    </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AnalyticsTab({ details }: { details: TransactionDetails }) {
    const metrics = [
        {
            label: "Processing Time",
            value: "2.3s",
            change: "-12%",
            trend: "down",
            icon: Clock,
            colorClasses: {
                bg: "bg-emerald-100 dark:bg-emerald-900/20",
                text: "text-emerald-600 dark:text-emerald-400"
            }
        },
        {
            label: "Success Rate",
            value: "98.5%",
            change: "+2.1%",
            trend: "up",
            icon: TrendingUp,
            colorClasses: {
                bg: "bg-blue-100 dark:bg-blue-900/20",
                text: "text-blue-600 dark:text-blue-400"
            }
        },
        {
            label: "Fee Percentage",
            value: `${((details.fee / details.amount) * 100).toFixed(2)}%`,
            change: "0%",
            trend: "neutral",
            icon: DollarSign,
            colorClasses: {
                bg: "bg-purple-100 dark:bg-purple-900/20",
                text: "text-purple-600 dark:text-purple-400"
            }
        },
        {
            label: "Gateway Score",
            value: "A+",
            change: "Excellent",
            trend: "up",
            icon: Shield,
            colorClasses: {
                bg: "bg-green-100 dark:bg-green-900/20",
                text: "text-green-600 dark:text-green-400"
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Performance metrics and insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${metric.colorClasses.bg}`}>
                                    <Icon className={`w-5 h-5 ${metric.colorClasses.text}`} />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    metric.trend === 'up'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : metric.trend === 'down'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                    {metric.change}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {metric.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {metric.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction Performance</h5>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Performance chart would be displayed here</p>
                        <p className="text-sm">Integration with charting library required</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


function EnhancedInfoCard({
                              label,
                              value,
                              icon: Icon,
                              copyable = false,
                              copyToClipboard
                          }: {
    label: string;
    value: any;
    icon: any;
    copyable?: boolean;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {label}
          </span>
                </div>
                {copyable && value && (
                    <button
                        onClick={() => copyToClipboard(value, label)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-600 transition-all rounded"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div className="text-gray-900 dark:text-white font-medium break-all">
                {value || "N/A"}
            </div>
        </div>
    );
}

function EnhancedJSONViewer({
                                label,
                                data,
                                copyToClipboard
                            }: {
    label: string;
    data: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatted = useMemo(() => {
        try {
            const parsed = typeof data === "string" ? JSON.parse(data) : data;
            return JSON.stringify(parsed, null, 2);
        } catch {
            return "Invalid or empty JSON";
        }
    }, [data]);

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {label}
                </h5>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => copyToClipboard(formatted, label)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-1"
                    >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? "Collapse" : "Expand"}
                    </button>
                </div>
            </div>
            <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-64'} overflow-hidden`}>
                <pre className="p-4 text-sm text-gray-100 dark:text-gray-200 bg-gray-800 dark:bg-gray-900 overflow-auto whitespace-pre-wrap font-mono border-t border-gray-300 dark:border-gray-600">
                    {formatted}
                </pre>
            </div>
        </div>
    );
}


