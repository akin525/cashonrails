"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
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
    Printer,
    X
} from "lucide-react";

interface PayoutDetails {
    id: string;
    domain: string;
    amount: number;
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
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

// Replace the ProofOfPaymentModal component with this corrected version:

// Proof of Payment Modal Component
function ProofOfPaymentModal({ payout, onClose }: {
    payout: PayoutDetails;
    onClose: () => void;
}) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Helper function to get status class
    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'successful':
            case 'success':
                return 'status-successful';
            case 'pending':
                return 'status-pending';
            case 'failed':
                return 'status-failed';
            default:
                return 'status-pending';
        }
    };

    const handlePrint = () => {
        if (!payout) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const netAmount = (payout.amount || 0) - (payout.fee || 0) - (payout.sys_fee || 0);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Proof of Payment - ${payout.reference || 'N/A'}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #059669;
                            padding-bottom: 20px;
                        }
                        .logo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #059669;
                            margin-bottom: 10px;
                        }
                        .title {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1f2937;
                            margin: 10px 0;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin: 20px 0;
                        }
                        .info-item {
                            padding: 15px;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            background: #f9fafb;
                        }
                        .info-label {
                            font-size: 12px;
                            color: #6b7280;
                            margin-bottom: 5px;
                            font-weight: 600;
                        }
                        .info-value {
                            font-size: 16px;
                            color: #1f2937;
                            font-weight: 600;
                        }
                        .status-badge {
                            display: inline-block;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-weight: 600;
                            text-transform: uppercase;
                            font-size: 14px;
                        }
                        .status-successful {
                            background: #d1fae5;
                            color: #065f46;
                        }
                        .status-pending {
                            background: #fef3c7;
                            color: #92400e;
                        }
                        .status-failed {
                            background: #fee2e2;
                            color: #991b1b;
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        @media print {
                            body {
                                print-color-adjust: exact;
                                -webkit-print-color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">NinjaTech AI</div>
                        <div class="title">Proof of Payment</div>
                        <div style="color: #6b7280; margin-top: 10px;">Generated on ${new Date().toLocaleString()}</div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Transaction Reference</div>
                            <div class="info-value">${payout.reference || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Transaction ID</div>
                            <div class="info-value">${payout.id || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Amount</div>
                            <div class="info-value" style="color: #059669;">${payout.currency || 'NGN'}${(payout.amount || 0).toLocaleString()}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value">
                                <span class="status-badge ${getStatusClass(payout.status)}">${payout.status || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Recipient Name</div>
                            <div class="info-value">${payout.account_name || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Account Number</div>
                            <div class="info-value">${payout.account_number || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Bank Name</div>
                            <div class="info-value">${payout.bank_name || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Bank Code</div>
                            <div class="info-value">${payout.bank_code || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Transaction Date</div>
                            <div class="info-value">${payout.created_at ? new Date(payout.created_at).toLocaleString() : 'N/A'}</div>
                        </div>
                      
                        <div class="info-item">
                            <div class="info-label">Net Amount</div>
                            <div class="info-value" style="color: #059669; font-size: 18px;">${payout.currency || 'NGN'}${netAmount.toLocaleString()}</div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>This is an automatically generated proof of payment.</p>
                        <p>For any inquiries, please contact support with reference: ${payout.reference || 'N/A'}</p>
                        <p style="margin-top: 10px;">© ${new Date().getFullYear()} NinjaTech AI. All rights reserved.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownloadPDF = () => {
        toast.info("PDF download functionality would be implemented here");
        // This would typically use a library like jsPDF or html2pdf
    };

    if (!payout) {
        return null;
    }

    const netAmount = (payout.amount || 0) - (payout.fee || 0) - (payout.sys_fee || 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Proof of Payment</h3>
                                <p className="text-emerald-100">Transaction {payout.reference || 'N/A'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6" ref={modalRef}>
                    <div className="space-y-6">
                        {/* Company Header */}
                        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                NinjaTech AI
                            </div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                Proof of Payment
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Generated on {new Date().toLocaleString()}
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Transaction Reference
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {payout.reference || 'N/A'}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Transaction ID
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                                    {payout.id || 'N/A'}
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                                    Amount
                                </div>
                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {payout.currency || 'NGN'} {(payout.amount || 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    Status
                                </div>
                                <div className="mt-2">
                                    <StatusBadge status={payout.status || 'pending'} />
                                </div>
                            </div>
                        </div>

                        {/* Recipient Information */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recipient Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Account Name
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.account_name || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Account Number
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.account_number || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Bank Name
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.bank_name || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Bank Code
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.bank_code || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fee Breakdown */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Fee Breakdown
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction Amount</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {payout.currency || 'NGN'} {(payout.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {payout.currency || 'NGN'} {(payout.fee || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">System Fee</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {payout.currency || 'NGN'} {(payout.sys_fee || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900 dark:text-white">Net Amount</span>
                                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {payout.currency || 'NGN'} {netAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Additional Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Transaction Date
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.created_at ? new Date(payout.created_at).toLocaleString() : 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Domain
                                    </div>
                                    <div className="text-base font-medium text-gray-900 dark:text-white">
                                        {payout.domain || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            <p>This is an automatically generated proof of payment.</p>
                            <p className="mt-1">For any inquiries, please contact support with reference: <strong>{payout.reference || 'N/A'}</strong></p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



// Enhanced Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = (status: string) => {
        const configs = {
            successful: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                icon: CheckCircle,
                pulse: false
            },
            completed: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                icon: CheckCircle,
                pulse: false
            },
            failed: {
                color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                icon: XCircle,
                pulse: false
            },
            pending: {
                color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                icon: Clock,
                pulse: true
            },
            processing: {
                color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                icon: RefreshCw,
                pulse: true
            }
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const config = getStatusConfig(status);
    const StatusIcon = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border $${config.color}$$ {config.pulse ? 'animate-pulse' : ''}`}>
            <StatusIcon className="w-4 h-4" />
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
                              highlight = false
                          }: {
    label: string;
    value: any;
    icon: any;
    copyable?: boolean;
    copyToClipboard?: (text: string, label?: string) => void;
    highlight?: boolean;
}) {
    return (
        <div className={`group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border transition-all hover:shadow-lg ${
            highlight
                ? 'border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-800'
        }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {label}
                    </span>
                </div>
                {copyable && value && copyToClipboard && (
                    <button
                        onClick={() => copyToClipboard(value, label)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-emerald-600 transition-all rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div className="text-gray-900 dark:text-white font-semibold text-lg break-all">
                {value || "N/A"}
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
            return "Invalid or empty JSON";
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
                        className="px-3 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-1"
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
        { id: "overview", label: "Overview", icon: Eye, description: "Payout summary" },
        { id: "banking", label: "Banking", icon: Banknote, description: "Account details" },
        { id: "webhook", label: "Webhook", icon: Send, description: "Event notifications" },
        { id: "gateway", label: "Gateway", icon: Globe, description: "Gateway response" },
        { id: "business", label: "Business", icon: Building, description: "Merchant info" },
        { id: "timeline", label: "Timeline", icon: Activity, description: "Payout flow" },
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

// Overview Tab Component
function OverviewTab({ details, copyToClipboard }: {
    details: PayoutDetails;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    const netAmount = details.amount - details.fee - details.sys_fee;

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Amount</p>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {details.currency} {details.amount?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Net Amount</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
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
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Fees</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {details.currency} {(details.fee + details.sys_fee)?.toLocaleString()}
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

            {/* Transaction Details */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <EnhancedInfoCard
                        label="Transaction ID"
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
                        label="Session ID"
                        value={details.sessionid}
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
                        label="Currency"
                        value={details.currency}
                        icon={DollarSign}
                    />
                    <EnhancedInfoCard
                        label="Created At"
                        value={new Date(details.created_at).toLocaleString()}
                        icon={Calendar}
                    />
                </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Breakdown</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols 2 lg:grid-cols-4 gap-6">
                    <EnhancedInfoCard
                        label="Payout Fee"
                        value={`${details.currency}${details.fee?.toLocaleString()}`}
                        icon={DollarSign}
                    />
                    <EnhancedInfoCard
                        label="System Fee"
                        value={`${details.currency}${details.sys_fee?.toLocaleString()}`}
                        icon={DollarSign}
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

// Banking Tab Component
function BankingTab({ details, copyToClipboard }: {
    details: PayoutDetails;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Banking Information</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recipient account details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInfoCard
                    label="Account Name"
                    value={details.account_name}
                    icon={User}
                    copyable
                    copyToClipboard={copyToClipboard}
                    highlight
                />
                <EnhancedInfoCard
                    label="Account Number"
                    value={details.account_number}
                    icon={Hash}
                    copyable
                    copyToClipboard={copyToClipboard}
                    highlight
                />
                <EnhancedInfoCard
                    label="Bank Name"
                    value={details.bank_name}
                    icon={Building}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Bank Code"
                    value={details.bank_code}
                    icon={Hash}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
            </div>

            {/* Bank Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {details.bank_name}
                        </h5>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {details.account_name} • {details.account_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bank Code: {details.bank_code}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {details.currency} {details.amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payout Amount</p>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage webhook notifications and responses</p>
                    </div>
                </div>
                <button
                    onClick={onResend}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-400 disabled:to-indigo-400 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
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

// Gateway Tab Component
function GatewayTab({ data, copyToClipboard }: {
    data: any;
    copyToClipboard: (text: string, label?: string) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Building className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Merchant account details and contact information</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/operations/merchant/${businessId}/business` as RouteLiteral)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Full Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInfoCard
                    label="Business Name"
                    value={business?.name}
                    icon={Building}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Trade Name"
                    value={business?.trade_name}
                    icon={Building}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Email"
                    value={business?.biz_email}
                    icon={Mail}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Phone"
                    value={business?.biz_phone}
                    icon={Phone}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Website"
                    value={business?.biz_url}
                    icon={LinkIcon}
                    copyable
                    copyToClipboard={copyToClipboard}
                />
                <EnhancedInfoCard
                    label="Address"
                    value={business?.biz_address}
                    icon={MapPin}
                />
            </div>
        </div>
    );
}

// Timeline Tab Component
function TimelineTab({ details }: { details: PayoutDetails }) {
    const timelineEvents = [
        {
            id: 1,
            title: "Payout Initiated",
            description: "Payout request was created and queued for processing",
            timestamp: details.created_at,
            status: "completed",
            icon: ArrowUpRight
        },
        {
            id: 2,
            title: "Bank Verification",
            description: "Recipient bank account details verified",
            timestamp: details.created_at,
            status: "completed",
            icon: Shield
        },
        {
            id: 3,
            title: "Processing",
            description: "Payout sent to banking partner for processing",
            timestamp: details.created_at,
            status: details.status === "successful" ? "completed" : "processing",
            icon: RefreshCw
        },
        {
            id: 4,
            title: "Bank Transfer",
            description: "Funds transferred to recipient account",
            timestamp: details.created_at,
            status: details.status === "successful" ? "completed" : details.status === "failed" ? "failed" : "pending",
            icon: ArrowDownLeft
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payout Timeline</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track the progress of this payout</p>
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
                                            ? "text-blue-600 dark:text-blue-400 animate-spin"
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
export default function SearchPayout() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<PayoutDetails | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
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
            const res = await axiosInstance.get(`/finance/searchPayouts`, {
                params: { search: transactionID.trim() },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:600000,
            });

            if (res.data.status && res.data.data?.length > 0) {
                const details = res.data.data[0];
                setTransactionDetails(details);

                // Add to search history
                const historyItem: SearchHistory = {
                    id: Date.now().toString(),
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: true
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);

                toast.success("Payout details loaded successfully!");
                setActiveTab("overview");
            } else {
                // Add failed search to history
                const historyItem: SearchHistory = {
                    id: Date.now().toString(),
                    query: transactionID.trim(),
                    timestamp: new Date(),
                    found: false
                };
                setSearchHistory(prev => [historyItem, ...prev.slice(0, 4)]);

                toast.error("Payout not found. Please check the transaction ID.");
            }
        } catch (err: any) {
            console.error("Search error:", err);
            toast.error(err.response?.data?.message || "Error fetching payout details");
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
            const res = await axiosInstance.get(
                `/resend_payout_webhook/${transactionDetails.business_id}/live/${transactionDetails.id}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout: 600000,
                }
            );

            if (res.data.success) {
                toast.success(res.data.message || "Webhook sent successfully!");
            } else {
                toast.error(res.data.message || "Failed to send webhook");
            }
        } catch (err: any) {
            console.error("Webhook error:", err);
            toast.error(err.response?.data?.message || "Webhook resend failed");
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
            transaction_id: transactionDetails.id,
            reference: transactionDetails.reference,
            amount: transactionDetails.amount,
            currency: transactionDetails.currency,
            status: transactionDetails.status,
            account_name: transactionDetails.account_name,
            account_number: transactionDetails.account_number,
            bank_name: transactionDetails.bank_name,
            bank_code: transactionDetails.bank_code,
            fee: transactionDetails.fee,
            sys_fee: transactionDetails.sys_fee,
            created_at: transactionDetails.created_at,
            domain: transactionDetails.domain
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payout-${transactionDetails.id}.json`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Payout data exported successfully!');
    }, [transactionDetails]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Header headerTitle="Search Payout" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Search Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <Search className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Payout Search</h2>
                                <p className="text-emerald-100">Find detailed information about any payout transaction</p>
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
                                            placeholder="Enter Transaction ID, Reference, or Session ID"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                                        />
                                        {searchHistory.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowHistory(!showHistory)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
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
                                                    <div className={`w-2 h-2 rounded-full ${item.found ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header with Actions */}
                        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                        <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Payout Details
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Transaction ID: {transactionDetails.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowProofModal(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                                        title="Generate Proof of Payment"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Proof of Payment
                                    </button>

                                    <button
                                        onClick={() => copyToClipboard(transactionDetails.id, "Transaction ID")}
                                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                        title="Copy Transaction ID"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={exportData}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Export Data"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => window.print()}
                                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                        title="Print"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <EnhancedTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "overview" && (
                                <OverviewTab
                                    details={transactionDetails}
                                    copyToClipboard={copyToClipboard}
                                />
                            )}

                            {activeTab === "banking" && (
                                <BankingTab
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
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <Search className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                No Payout Selected
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                Enter a transaction ID, reference, or session ID in the search box above to view payout details
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                                    Transaction ID
                                </span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                    Reference Number
                                </span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                    Session ID
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !transactionDetails && (
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="w-16 h-16 text-emerald-500 animate-spin" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Searching for Payout...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Please wait while we fetch the transaction details
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Proof of Payment Modal */}
            {showProofModal && transactionDetails && (
                <ProofOfPaymentModal
                    payout={transactionDetails}
                    onClose={() => setShowProofModal(false)}
                />
            )}
        </div>
    );
}



