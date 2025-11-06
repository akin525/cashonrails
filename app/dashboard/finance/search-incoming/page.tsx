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
    CreditCard,
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
    ChevronDown,
    ChevronUp,
    Activity,
    Building,
    User,
    MapPin,
    Phone,
    Mail,
    Link as LinkIcon,
    Zap,
    Shield,
    TrendingUp,
    Database,
    Banknote,
    Globe,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Receipt,
    FileText,
    Star,
    Award,
    Target,
    ArrowRightLeft,
    UserCheck,
    Building2,
    Coins,
    Timer,
    Network,
    History,
    Layers,
    Info,
    CheckCircle2,
    AlertTriangle,
    XOctagon,
    Loader2,
    TrendingDown,
    PiggyBank,
    CreditCard as Card,
    Smartphone,
    Monitor,
    Server,
    CloudDownload,
    FileJson,
    Printer,
    BookOpen,
    BarChart3,
    PieChart,
    LineChart
} from "lucide-react";

interface TransferDetails {
    id: string;
    domain: string;
    amount: number;
    sender_account_name: string;
    account_number: string;
    sender_account_number: string;
    sender_bank_code: string;
    stamp_duty: number;
    status: string;
    currency: string;
    reference: string;
    fee: number;
    gateway: string;
    business_id: string;
    business: any;
    webhook_event: any;
    gateway_response: any;
    created_at: string;
    updated_at: string;
}

interface SearchHistory {
    id: string;
    query: string;
    timestamp: Date;
    found: boolean;
    type: 'transfer_id' | 'session_id' | 'account_number';
}

// Enhanced Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = (status: string) => {
        const configs = {
            successful: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                icon: CheckCircle2,
                pulse: false
            },
            completed: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                icon: CheckCircle2,
                pulse: false
            },
            failed: {
                color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                icon: XOctagon,
                pulse: false
            },
            pending: {
                color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                icon: Timer,
                pulse: true
            },
            processing: {
                color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                icon: Loader2,
                pulse: true
            },
            reversed: {
                color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
                icon: ArrowRightLeft,
                pulse: false
            }
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const config = getStatusConfig(status);
    const StatusIcon = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
            <StatusIcon className={`w-4 h-4 ${config.pulse ? 'animate-spin' : ''}`} />
            {status}
        </span>
    );
}

// Enhanced Info Card Component
function EnhancedInfoCard({
                              label,
                              value,
                              icon: Icon,
                              copyable = false,
                              copyToClipboard,
                              highlight = false,
                              prefix = "",
                              suffix = ""
                          }: {
    label: string;
    value: any;
    icon: any;
    copyable?: boolean;
    copyToClipboard?: (text: string, label?: string) => void;
    highlight?: boolean;
    prefix?: string;
    suffix?: string;
}) {
    const displayValue = `${prefix}${value || "N/A"}${suffix}`;

    return (
        <div className={`group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border transition-all hover:shadow-lg ${
            highlight
                ? 'border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-800'
        }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Icon className={`w-4 h-4 ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {label}
                    </span>
                </div>
                {copyable && value && copyToClipboard && (
                    <button
                        onClick={() => copyToClipboard(value, label)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div className="text-gray-900 dark:text-white font-semibold text-lg break-all">
                {displayValue}
            </div>
        </div>
    );
}

// Enhanced JSON Viewer Component
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
            return data || "No data available";
        }
    }, [data]);

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {label}
                </h5>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => copyToClipboard(formatted, label)}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors flex items-center gap-1 border border-gray-200 dark:border-gray-500"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1"
                    >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? "Collapse" : "Expand"}
                    </button>
                </div>
            </div>
            <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-64'} overflow-hidden`}>
                <pre className="p-4 text-sm text-gray-100 dark:text-gray-200 bg-gray-900 dark:bg-gray-800 overflow-auto whitespace-pre-wrap font-mono">
                    {formatted}
                </pre>
            </div>
        </div>
    );
}

// Enhanced Tab Navigation Component
function EnhancedTabNavigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const tabs = [
        { id: "overview", label: "Overview", icon: Eye, description: "Transfer summary" },
        { id: "transfer", label: "Transfer Details", icon: ArrowRightLeft, description: "Transaction info" },
        { id: "accounts", label: "Accounts", icon: Banknote, description: "Account details" },
        { id: "webhook", label: "Webhook", icon: Send, description: "Event notifications" },
        { id: "gateway", label: "Gateway", icon: Globe, description: "Gateway response" },
        { id: "business", label: "Business", icon: Building, description: "Merchant info" },
        { id: "timeline", label: "Timeline", icon: Activity, description: "Transfer flow" },
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
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
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

// Overview Tab Component
function OverviewTab({ details, copyToClipboard }: {
    details: TransferDetails;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    const netAmount = details.amount - details.fee - details.stamp_duty;

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Transfer Amount</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {details.currency} {details.amount?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Net Amount</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {details.currency} {netAmount?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Charges</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {details.currency} {(details.fee + details.stamp_duty)?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Status</p>
                            <div className="mt-1">
                                <StatusBadge status={details.status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfer Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Summary</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <EnhancedInfoCard
                        label="Transfer ID"
                        value={details.id}
                        icon={Hash}
                        copyable
                        copyToClipboard={copyToClipboard}
                        highlight
                    />
                    <EnhancedInfoCard
                        label="Reference"
                        value={details.reference}
                        icon={Hash}
                        copyable
                        copyToClipboard={copyToClipboard}
                    />
                    <EnhancedInfoCard
                        label="Domain"
                        value={details.domain}
                        icon={Globe}
                        copyable
                        copyToClipboard={copyToClipboard}
                    />
                    <EnhancedInfoCard
                        label="Gateway"
                        value={details.gateway}
                        icon={Network}
                    />
                    <EnhancedInfoCard
                        label="Currency"
                        value={details.currency}
                        icon={Coins}
                    />
                    <EnhancedInfoCard
                        label="Webhook Attempts"
                        value={details.webhook_event?.round || 0}
                        icon={Send}
                    />
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <PieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Breakdown</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <EnhancedInfoCard
                        label="Transfer Fee"
                        value={details.fee?.toLocaleString()}
                        prefix={`${details.currency} `}
                        icon={DollarSign}
                    />
                    <EnhancedInfoCard
                        label="Stamp Duty"
                        value={details.stamp_duty?.toLocaleString()}
                        prefix={`${details.currency} `}
                        icon={Receipt}
                    />
                    <EnhancedInfoCard
                        label="Fee Percentage"
                        value={`${((details.fee / details.amount) * 100).toFixed(2)}%`}
                        icon={TrendingUp}
                    />
                    <EnhancedInfoCard
                        label="Net Percentage"
                        value={`${((netAmount / details.amount) * 100).toFixed(2)}%`}
                        icon={Target}
                    />
                </div>
            </div>
        </div>
    );
}

// Transfer Details Tab Component
function TransferDetailsTab({ details, copyToClipboard }: {
    details: TransferDetails;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete transaction details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInfoCard
                    label="Transfer ID"
                    value={details.id}
                    icon={Hash}
                    copyable
                    copyToClipboard={copyToClipboard}
                    highlight
                />
                <EnhancedInfoCard
                    label="Reference Number"
                    value={details.reference}
                    icon={Hash}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Amount"
                    value={details.amount?.toLocaleString()}
                    prefix={`${details.currency} `}
                    icon={DollarSign}
                    highlight
                />
                <EnhancedInfoCard
                    label="Status"
                    value={<StatusBadge status={details.status} />}
                    icon={Shield}
                />
                <EnhancedInfoCard
                    label="Gateway"
                    value={details.gateway}
                    icon={Network}
                />
                <EnhancedInfoCard
                    label="Domain"
                    value={details.domain}
                    icon={Globe}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
            </div>
        </div>
    );
}

// Accounts Tab Component
function AccountsTab({ details, copyToClipboard }: {
    details: TransferDetails;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-8">
            {/* Sender Account */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Sender Account</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Source of the transfer</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EnhancedInfoCard
                        label="Account Name"
                        value={details.sender_account_name}
                        icon={UserCheck}
                        copyable
                        copyToClipboard={copyToClipboard}
                        highlight
                    />
                    <EnhancedInfoCard
                        label="Account Number"
                        value={details.sender_account_number}
                        icon={Hash}
                        copyable
                        copyToClipboard={copyToClipboard}
                        highlight
                    />
                    <EnhancedInfoCard
                        label="Bank Code"
                        value={details.sender_bank_code}
                        icon={Building2}
                        copyable
                        copyToClipboard={copyToClipboard}
                    />
                </div>
            </div>

            {/* Recipient Account */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recipient Account</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Destination of the transfer</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EnhancedInfoCard
                        label="Account Number"
                        value={details.account_number}
                        icon={Hash}
                        copyable
                        copyToClipboard={copyToClipboard}
                        highlight
                    />
                    <EnhancedInfoCard
                        label="Business Domain"
                        value={details.domain}
                        icon={Globe}
                        copyable
                        copyToClipboard={copyToClipboard}
                    />
                </div>
            </div>

            {/* Transfer Flow Visualization */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Flow</h4>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">{details.sender_account_name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{details.sender_account_number}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Bank: {details.sender_bank_code}</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-blue-300"></div>
                            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                            <div className="w-8 h-0.5 bg-blue-300"></div>
                        </div>
                        <div className="text-center mx-4">
                            <p className="text-2xl font-bold text-blue-600">{details.currency} {details.amount?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transfer Amount</p>
                        </div>
                    </div>

                    <div className="flex-1 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">{details.domain}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{details.account_number}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Recipient Account</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Webhook Tab Component
function WebhookTab({ webhook, onResend, loading, copyToClipboard }: {
    webhook: any;
    onResend: () => void;
    loading: boolean;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Events</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notification delivery details</p>
                    </div>
                </div>

                <button
                    onClick={onResend}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Resend Webhook
                        </>
                    )}
                </button>
            </div>

            {webhook ? (
                <div className="space-y-6">
                    {/* Webhook Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <EnhancedInfoCard
                            label="Event Type"
                            value={webhook.event}
                            icon={Zap}
                            highlight
                        />
                        <EnhancedInfoCard
                            label="Transaction ID"
                            value={webhook.trx}
                            icon={Hash}
                            copyable
                            copyToClipboard={copyToClipboard}
                        />
                        <EnhancedInfoCard
                            label="Response Code"
                            value={webhook.responseCode}
                            icon={Shield}
                        />
                        <EnhancedInfoCard
                            label="Delivery Attempts"
                            value={webhook.round}
                            icon={RefreshCw}
                        />
                    </div>

                    {/* Webhook Response Status */}
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">Response Status</h5>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                {webhook.responseCode >= 200 && webhook.responseCode < 300 ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        HTTP {webhook.responseCode}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {webhook.response || "No response message"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Request Data */}
                    <EnhancedJSONViewer
                        label="Webhook Request Payload"
                        data={webhook.request}
                        copyToClipboard={copyToClipboard}
                    />
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Webhook Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No webhook events have been recorded for this transfer.
                    </p>
                </div>
            )}
        </div>
    );
}

// Gateway Tab Component
function GatewayTab({ data, copyToClipboard }: {
    data: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Gateway Response</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment gateway communication details</p>
                </div>
            </div>

            {data ? (
                <div className="space-y-6">
                    {/* Gateway Status */}
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">Gateway Status</h5>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Response Received
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Gateway communication successful
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gateway Response Data */}
                    <EnhancedJSONViewer
                        label="Gateway Response Data"
                        data={data}
                        copyToClipboard={copyToClipboard}
                    />
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Gateway Response
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No gateway response data is available for this transfer.
                    </p>
                </div>
            )}
        </div>
    );
}

// Business Tab Component
function BusinessTab({ business, businessId, router, copyToClipboard }: {
    business: any;
    businessId: string;
    router: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                        <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Merchant account details</p>
                    </div>
                </div>

                <button
                    onClick={() => router.push(`/dashboard/operations/merchant/${businessId}/business` as RouteLiteral)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Business
                </button>
            </div>

            {business ? (
                <div className="space-y-6">
                    {/* Business Overview */}
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <Building className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {business.name || "Business Name Not Available"}
                                </h5>
                                <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                                    {business.trade_name || "Trade name not specified"}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Hash className="w-4 h-4" />
                                        ID: {businessId}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(businessId, "Business ID")}
                                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EnhancedInfoCard
                            label="Business Email"
                            value={business.biz_email}
                            icon={Mail}
                            copyable
                            copyToClipboard={copyToClipboard}
                        />
                        <EnhancedInfoCard
                            label="Business Phone"
                            value={business.biz_phone}
                            icon={Phone}
                            copyable
                            copyToClipboard={copyToClipboard}
                        />
                        <EnhancedInfoCard
                            label="Business Address"
                            value={business.biz_address}
                            icon={MapPin}
                        />
                        <EnhancedInfoCard
                            label="Website"
                            value={business.biz_url ? (
                                <a
                                    href={business.biz_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    {business.biz_url}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : "N/A"}
                            icon={LinkIcon}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Business Information
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Business details are not available for this transfer.
                    </p>
                </div>
            )}
        </div>
    );
}

// Timeline Tab Component
function TimelineTab({ details }: { details: TransferDetails }) {
    const timelineEvents = [
        {
            id: 1,
            title: "Transfer Initiated",
            description: `Transfer of ${details.currency} ${details.amount?.toLocaleString()} initiated from ${details.sender_account_name}`,
            timestamp: details.created_at,
            status: "completed",
            icon: ArrowUpRight
        },
        {
            id: 2,
            title: "Gateway Processing",
            description: `Transaction processed through ${details.gateway} gateway`,
            timestamp: details.created_at,
            status: details.status === "successful" ? "completed" : "processing",
            icon: Globe
        },
        {
            id: 3,
            title: "Webhook Notification",
            description: `Webhook event sent to merchant endpoint (${details.webhook_event?.round || 0} attempts)`,
            timestamp: details.created_at,
            status: details.webhook_event?.responseCode >= 200 && details.webhook_event?.responseCode < 300 ? "completed" : "failed",
            icon: Send
        },
        {
            id: 4,
            title: "Transfer Completed",
            description: "Funds successfully transferred to recipient account",
            timestamp: details.updated_at || details.created_at,
            status: details.status === "successful" ? "completed" : details.status === "failed" ? "failed" : "pending",
            icon: CheckCircle
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Timeline</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track the progress of this transfer</p>
                </div>
            </div>

            <div className="relative">
                {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    const isLast = index === timelineEvents.length - 1;

                    return (
                        <div key={event.id} className="relative flex items-start gap-4 pb-8">
                            {!isLast && (
                                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-600"></div>
                            )}

                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                event.status === "completed"
                                    ? "bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                    : event.status === "processing"
                                        ? "bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                        : event.status === "failed"
                                            ? "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                            : "bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                            }`}>
                                <Icon className={`w-5 h-5 ${
                                    event.status === "completed"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : event.status === "processing"
                                            ? "text-blue-600 dark:text-blue-400 animate-pulse"
                                            : event.status === "failed"
                                                ? "text-red-600 dark:text-red-400"
                                                : "text-gray-400"
                                }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                        {event.title}
                                    </h5>
                                    <StatusBadge status={event.status} />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {event.description}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {new Date(event.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Main Component
export default function SearchIncoming() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<TransferDetails | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const router = useRouter();

    // Copy to clipboard functionality
    const copyToClipboard = useCallback(async (text: string, label?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label || 'Text'} copied to clipboard!`);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    }, []);

    // Handle search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionID.trim()) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setLoading(true);
        setTransactionDetails(null);

        try {
            const response = await axiosInstance.get(`/finance/search-transfer`, {
                params: { search: transactionID.trim() },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 60000
            });

            if (response.data.status && response.data.data?.length > 0) {
                const details = response.data.data[0];
                setTransactionDetails(details);

                // Add to search history
                const historyItem: SearchHistory = {
                    id: Date.now().toString(),
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: true,
                    type: 'transfer_id'
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);

                toast.success("Incoming transfer details loaded successfully!");
                setActiveTab("overview");
            } else {
                // Add failed search to history
                const historyItem: SearchHistory = {
                    id: Date.now().toString(),
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: false,
                    type: 'transfer_id'
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);

                toast.error("Transfer not found. Please check the transaction ID.");
            }
        } catch (error: any) {
            console.error("Search error:", error);
            toast.error(error.response?.data?.message || "Something went wrong while fetching the transfer details.");
        } finally {
            setLoading(false);
        }
    };

    // Resend webhook
    const resendWebhook = async () => {
        if (!transactionDetails?.business_id || !transactionDetails?.id) {
            toast.error("Missing required information for webhook resend");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/resend_transaction_webhook/${transactionDetails.business_id}/live/${transactionDetails.id}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 60000
                }
            );

            if (response.data.success) {
                toast.success(response.data.message || "Webhook sent successfully!");
            } else {
                toast.error(response.data.message || "Failed to send webhook");
            }
        } catch (error: any) {
            console.error("Webhook error:", error);
            toast.error(error.response?.data?.message || "Webhook resend failed");
        } finally {
            setLoading(false);
        }
    };

    // Quick search from history
    const quickSearch = (query: string) => {
        setTransactionID(query);
        setShowHistory(false);
    };

    // Export functionality
    const exportData = useCallback(() => {
        if (!transactionDetails) return;

        const exportData = {
            transfer_id: transactionDetails.id,
            reference: transactionDetails.reference,
            amount: transactionDetails.amount,
            currency: transactionDetails.currency,
            status: transactionDetails.status,
            sender_account_name: transactionDetails.sender_account_name,
            sender_account_number: transactionDetails.sender_account_number,
            account_number: transactionDetails.account_number,
            sender_bank_code: transactionDetails.sender_bank_code,
            fee: transactionDetails.fee,
            stamp_duty: transactionDetails.stamp_duty,
            gateway: transactionDetails.gateway,
            domain: transactionDetails.domain,
            created_at: transactionDetails.created_at,
            updated_at: transactionDetails.updated_at
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `incoming-transfer-${transactionDetails.id}.json`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Transfer data exported successfully!');
    }, [transactionDetails]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header headerTitle="Search Incoming Transfer" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Search Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <ArrowDownLeft className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Incoming Transfer Search</h2>
                                <p className="text-blue-100">Find detailed information about incoming bank transfers</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            value={transactionID}
                                            onChange={(e) => setTransactionID(e.target.value)}
                                            placeholder="Enter Transfer ID, Session ID, or Account Number"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                                        />
                                        {searchHistory.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowHistory(!showHistory)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <History className="w-5 h-5" />
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
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">Recent Searches</h4>
                                        </div>
                                        {searchHistory.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => quickSearch(item.query)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${item.found ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-gray-900 dark:text-white font-mono text-sm">{item.query}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {item.timestamp.toLocaleTimeString()}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                {transactionDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header with Actions */}
                        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <ArrowDownLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Incoming Transfer Details
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Transfer ID: {transactionDetails.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => copyToClipboard(transactionDetails.id, "Transfer ID")}
                                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="Copy Transfer ID"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={exportData}
                                        className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="Export Data"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => window.print()}
                                        className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="Print Details"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>

                                    <StatusBadge status={transactionDetails.status} />
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Tab Navigation */}
                        <EnhancedTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "overview" && (
                                <OverviewTab
                                    details={transactionDetails}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "transfer" && (
                                <TransferDetailsTab
                                    details={transactionDetails}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "accounts" && (
                                <AccountsTab
                                    details={transactionDetails}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "webhook" && (
                                <WebhookTab
                                    webhook={transactionDetails.webhook_event}
                                    onResend={resendWebhook}
                                    loading={loading}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "gateway" && (
                                <GatewayTab
                                    data={transactionDetails.gateway_response}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "business" && (
                                <BusinessTab
                                    business={transactionDetails.business}
                                    businessId={transactionDetails.business_id}
                                    router={router}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "timeline" && (
                                <TimelineTab details={transactionDetails} />
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!transactionDetails && !loading && (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Search for Incoming Transfers
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            Enter a transfer ID, session ID, or account number to view detailed information about incoming bank transfers.
                        </p>

                        {/* Search Tips */}
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Search Tips
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Transfer ID</p>
                                            <p className="text-gray-600 dark:text-gray-400">Unique transaction identifier</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Session ID</p>
                                            <p className="text-gray-600 dark:text-gray-400">Gateway session reference</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Account Number</p>
                                            <p className="text-gray-600 dark:text-gray-400">Recipient account number</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !transactionDetails && (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
                            <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Searching for Transfer
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait while we fetch the transfer details...
                        </p>

                        {/* Loading Progress */}
                        <div className="max-w-md mx-auto mt-8">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Quick Actions */}
            {transactionDetails && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => copyToClipboard(transactionDetails.reference, "Reference")}
                            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                            title="Copy Reference"
                        >
                            <Copy className="w-5 h-5" />
                        </button>

                        <button
                            onClick={exportData}
                            className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                            title="Export Data"
                        >
                            <Download className="w-5 h-5" />
                        </button>

                        {transactionDetails.webhook_event && (
                            <button
                                onClick={resendWebhook}
                                disabled={loading}
                                className="w-12 h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                                title="Resend Webhook"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Info */}
            <div className="fixed bottom-6 left-6 z-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 text-xs text-gray-600 dark:text-gray-400 max-w-xs">
                    <p className="font-medium mb-1">Keyboard Shortcuts:</p>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Search</span>
                            <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+K</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span>Export</span>
                            <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+E</kbd>
                        </div>
                        <div className="flex justify-between">
                            <span>Print</span>
                            <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Ctrl+P</kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add keyboard shortcuts */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('keydown', function(e) {
                            if (e.ctrlKey || e.metaKey) {
                                switch(e.key) {
                                    case 'k':
                                        e.preventDefault();
                                        document.querySelector('input[placeholder*="Transfer ID"]')?.focus();
                                        break;
                                    case 'e':
                                        e.preventDefault();
                                        // Trigger export if data exists
                                        break;
                                    case 'p':
                                        e.preventDefault();
                                        window.print();
                                        break;
                                }
                            }
                        });
                    `
                }}
            />
        </div>
    );
}

