"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import { StringUtils } from '@/helpers/extras';
import axiosInstance from '@/helpers/axiosInstance';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import moment from 'moment';
import { RouteLiteral } from 'nextjs-routes';
import toast from "react-hot-toast";
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Building2, // Replace Bank with Building2
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Info,
  ArrowUpDown,
  Send,
  X,
  ArrowRight,
  ArrowDown,
  Wallet,
  ChevronsUpDown,
  Banknote,
  Receipt,
  FileJson,
  Code,
  Loader2,
  ArrowUp,
  User,
  FileText,
  Hash,
  Globe,
  Server,
  MessageSquare,
  RotateCcw,
  UserCheck
} from 'lucide-react';

// Define the main interface for the transaction
interface TableData {
  id: string;
  business_id: number;
  trx: string;
  reference: string;
  transactionRef: string | null;
  sessionid: string | null;
  batch_id: string | null;
  currency: string;
  amount: string; // Consider: number if you're doing calculations
  fee: string; // Consider: number if you're doing calculations
  fee_source: string;
  sys_fee: string; // Consider: number if you're doing calculations
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  narration: string;
  sender_name: string | null; // You check for null in your code with || "N/A"
  paymentMode: string; // Consider: union type like 'instant' | 'batch' | 'manual'
  request_ip: string;
  initiator: string | null;
  domain: string;
  source: string;
  gateway: string;
  gateway_response: string | null;
  message: string;
  status: string; // Consider: union type like 'success' | 'pending' | 'failed'
  reversed: string; // Consider: boolean or '0' | '1'
  reversed_by: string | null;
  note: string;
  actions:any;
  created_at: string; // This is correct for ISO date strings
  updated_at: string;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'success':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
        };
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3" />,
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-3 h-3" />,
          color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        };
      default:
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
        {StringUtils.capitalizeWords(status)}
    </span>
  );
};

// Payment mode badge component
const PaymentModeBadge = ({ mode }: { mode: string }) => {
  const getModeConfig = () => {
    switch (mode.toLowerCase()) {
      case 'bank_transfer':
      case 'banktransfer':
        return {
          icon: <Building2 className="w-3 h-3" />, // Changed from Bank to Building2
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        };
      case 'wallet':
        return {
          icon: <Wallet className="w-3 h-3" />,
          color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          icon: <CreditCard className="w-3 h-3" />,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        };
    }
  };

  const config = getModeConfig();
  const displayText = StringUtils.snakeToCapitalized(mode);

  return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
        {displayText}
    </span>
  );
};

// Amount display component
const AmountDisplay = ({ amount, currency }: { amount: string; currency: string }) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'NGN': return '₦';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  return (
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {getCurrencySymbol(currency)} {StringUtils.formatWithCommas(amount)}
      </div>
  );
};

// Payout summary card component
const PayoutSummaryCard = ({ data }: { data: TableData[] | undefined }) => {
  if (!data || data.length === 0) return null;

  const totalPayouts = data.length;
  const successfulPayouts = data.filter(p => p.status.toLowerCase() === 'successful' || p.status.toLowerCase() === 'success').length;
  const pendingPayouts = data.filter(p => p.status.toLowerCase() === 'pending').length;
  const failedPayouts = data.filter(p => p.status.toLowerCase() === 'failed').length;

  const totalAmount = data.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const successfulAmount = data
      .filter(p => p.status.toLowerCase() === 'successful' || p.status.toLowerCase() === 'success')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  // Get the most common currency
  const currencyCount: Record<string, number> = {};
  data.forEach(p => {
    currencyCount[p.currency] = (currencyCount[p.currency] || 0) + 1;
  });
  const mostCommonCurrency = Object.entries(currencyCount)
      .sort((a, b) => b[1] - a[1])[0][0];

  return (
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Payout Summary</h2>
            <p className="text-blue-100 text-sm">Overview of payout activity</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Payouts</p>
            <p className="text-2xl font-bold">{totalPayouts.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-green-300 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>{successfulPayouts} successful</span>
              </div>
              <div className="flex items-center gap-1 text-red-300 text-xs">
                <XCircle className="w-3 h-3" />
                <span>{failedPayouts} failed</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Amount</p>
            <p className="text-xl font-semibold">{mostCommonCurrency} {StringUtils.formatWithCommas(totalAmount.toFixed(2))}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Successful Amount</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold">{mostCommonCurrency} {StringUtils.formatWithCommas(successfulAmount.toFixed(2))}</p>
              <CheckCircle className="w-4 h-4 text-green-300" />
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Pending Payouts</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold">{pendingPayouts}</p>
              <Clock className="w-4 h-4 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>
  );
};

// Page Component
const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { theme } = useTheme();
  const { setShowSearchQuery, filterState } = useUI();
  const typedFilterState = filterState as FilterState;
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
  const [selectedPayout, setSelectedPayout] = useState<TableData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'response'>('details');
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const queryParams = useMemo(() => ({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    payment_mode: filterPaymentMode !== 'all' ? filterPaymentMode : undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    search: searchQuery || undefined,
  }), [filterStatus, filterPaymentMode, startDate, endDate, searchQuery]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(currentPage);
    setLoading(false);
  };

  const fetchData = useCallback(async (page: number) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<TableData>(`/merchant/payouts/${params.id}`, {
        params: { ...queryParams, page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${authState.token}` },
        timeout: 60000
      });

      if (response.data?.data) {
        setData(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setData([]);
      }

      setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payouts");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [authState.token, queryParams, pagination.limit, params.id]);

  const resendWebhook = async (businessId?: string, transactionId?: string) => {
    if (!businessId || !transactionId) {
      toast.error("Missing business ID or transaction ID");
      return;
    }

    setIsResending(true);
    try {
      const response = await axiosInstance.get<Response>(
          `/resend_payout_webhook/${businessId}/live/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
            timeout: 30000
          }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Webhook notification sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send webhook notification");
      }
    } catch (error) {
      console.error("Error resending webhook:", error);
      toast.error("Failed to resend webhook notification");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    // Close date filter dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dateFilterElement = document.getElementById('date-filter-dropdown');
      if (dateFilterElement && !dateFilterElement.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };

    if (isDateFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateFilterOpen]);

  const handleDateFilter = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    setIsDateFilterOpen(false);
    setCurrentPage(1);
    fetchData(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterPaymentMode("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchData(1);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success("Export feature will be implemented soon");
    setIsExportModalOpen(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Table columns configuration
  const TABLE_COLUMNS = useMemo<Column<TableData>[]>(() => [
    {
      id: "trx",
      label: "TRANSACTION ID",
      type: "custom",
      renderCustom: (row: TableData) => (
          <div className="flex items-center gap-2 group">
            <span className="font-medium text-gray-900 dark:text-gray-100">{row.trx}</span>
            <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(row.trx, "Transaction ID");
                }}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
      )
    },
    {
      id: "amount",
      label: "AMOUNT",
      type: "custom",
      renderCustom: (row: TableData) => (
          <AmountDisplay amount={row.amount} currency={row.currency} />
      )
    },
    {
      id: "account_name",
      label: "ACCOUNT DETAILS",
      type: "custom",
      renderCustom: (row: TableData) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{row.account_name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {row.bank_name} - {row.account_number}
            </div>
          </div>
      )
    },
    {
      id: "sender_name",
      label: "SENDER",
      type: "custom",
      renderCustom: (row: TableData) => (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.sender_name || "N/A"}
          </div>
      )
    },
    {
      id: "paymentMode",
      label: "PAYMENT MODE",
      type: "custom",
      renderCustom: (row: TableData) => (
          <PaymentModeBadge mode={row.paymentMode} />
      )
    },
    {
      id: "status",
      label: "STATUS",
      type: "custom",
      renderCustom: (row: TableData) => (
          <StatusBadge status={row.status} />
      )
    },
    {
      id: "created_at",
      label: "DATE",
      type: "custom",
      renderCustom: (row: TableData) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {moment(row.created_at).format('MMM DD, YYYY')}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {moment(row.created_at).format('h:mm A')}
            </div>
          </div>
      )
    },
    {
      id: "actions",
      label: "",
      type: "custom",
      renderCustom: (row: TableData) => (
          <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPayout(row);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
      )
    }
  ], []);

  const EmptyState = () => (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Banknote className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No payouts found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {searchQuery || filterStatus !== 'all' || filterPaymentMode !== 'all' || startDate || endDate
              ? "Try adjusting your filters or search terms to find what you're looking for."
              : "This business doesn't have any payouts yet."}
        </p>
        {(searchQuery || filterStatus !== 'all' || filterPaymentMode !== 'all' || startDate || endDate) && (
            <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Filters
            </button>
        )}
      </div>
  );

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Payouts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage business payouts
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </button>

                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Payout Summary */}
            <PayoutSummaryCard data={data} />

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search by transaction ID, account name or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Statuses</option>
                      <option value="successful">Successful</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Payment Mode Filter */}
                  <div className="relative">
                    <select
                        value={filterPaymentMode}
                        onChange={(e) => setFilterPaymentMode(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Payment Modes</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="wallet">Wallet</option>
                    </select>
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Date Filter */}
                  <div className="relative">
                    <button
                        onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                        className="inline-flex items-center gap-2 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                    <span className="text-gray-700 dark:text-gray-300">
                      {startDate && endDate
                          ? `${moment(startDate).format('MMM DD')} - ${moment(endDate).format('MMM DD')}`
                          : "Date Range"}
                    </span>
                    </button>
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    {/* Date Filter Dropdown */}
                    {isDateFilterOpen && (
                        <div
                            id="date-filter-dropdown"
                            className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 w-72"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date
                              </label>
                              <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Date
                              </label>
                              <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              />
                            </div>
                            <div className="flex justify-between">
                              <button
                                  onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                    setIsDateFilterOpen(false);
                                    setCurrentPage(1);
                                    fetchData(1);
                                  }}
                                  className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                Clear
                              </button>
                              <button
                                  onClick={handleDateFilter}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  {(searchQuery || filterStatus !== 'all' || filterPaymentMode !== 'all' || startDate || endDate) && (
                      <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payout Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">Loading payouts...</span>
                  </div>
                </div>
            ) : data.length === 0 ? (
                <EmptyState />
            ) : (
                <Table<TableData>
                    data={data}
                    headers={TABLE_COLUMNS}  // Changed from 'columns' to 'headers'
                    pagination={pagination}
                    currentPage={currentPage}
                    onPaginate={setCurrentPage}  // Changed from 'onPageChange' to 'onPaginate'
                    limit={pagination.limit}  // Add this
                    onRowClick={(row) => setSelectedPayout(row)}
                    loading={loading}
                />


            )}
          </div>
        </div>

        {/* Payout Details Modal */}
        {selectedPayout && (
            <Modal
                isOpen={!!selectedPayout}
                onClose={() => setSelectedPayout(null)}
                title="Payout Details"
                // size="lg"
            >
              <div className="space-y-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedPayout.trx}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {moment(selectedPayout.created_at).format('MMMM DD, YYYY [at] h:mm A')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedPayout.status} />
                    {selectedPayout.reversed === '1' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                          <RotateCcw className="w-3 h-3" />
                          Reversed
                        </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'details'
                              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Info className="w-4 h-4" />
                      Details
                    </div>
                  </button>
                  <button
                      onClick={() => setActiveTab('response')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'response'
                              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Code className="w-4 h-4" />
                      Gateway Response
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'details' ? (
                      <div className="space-y-6">
                        {/* Transaction Information */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Transaction Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Transaction ID
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                    {selectedPayout.trx}
                                  </span>
                                  <button
                                      onClick={() => copyToClipboard(selectedPayout.trx, "Transaction ID")}
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Reference
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                    {selectedPayout.reference}
                                  </span>
                                  <button
                                      onClick={() => copyToClipboard(selectedPayout.reference, "Reference")}
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {selectedPayout.sessionid && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                      Session ID
                                    </label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {selectedPayout.sessionid}
                                      </span>
                                      <button
                                          onClick={() => copyToClipboard(selectedPayout.sessionid!, "Session ID")}
                                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Amount
                                </label>
                                <div className="mt-1">
                                  <AmountDisplay amount={selectedPayout.amount} currency={selectedPayout.currency} />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Fee
                                </label>
                                <div className="mt-1">
                                  <AmountDisplay amount={selectedPayout.fee} currency={selectedPayout.currency} />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Payment Mode
                                </label>
                                <div className="mt-1">
                                  <PaymentModeBadge mode={selectedPayout.paymentMode} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Account Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Account Name
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.account_name}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Account Number
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                    {selectedPayout.account_number}
                                  </span>
                                  <button
                                      onClick={() => copyToClipboard(selectedPayout.account_number, "Account Number")}
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Bank Name
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.bank_name}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Bank Code
                                </label>
                                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.bank_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Additional Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Sender Name
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.sender_name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Narration
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.narration || "N/A"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Gateway
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {StringUtils.capitalizeWords(selectedPayout.gateway)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Source
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {StringUtils.capitalizeWords(selectedPayout.source)}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Domain
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.domain}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Request IP
                                </label>
                                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
                                  {selectedPayout.request_ip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {selectedPayout.message && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Message
                              </h4>
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                  {selectedPayout.message}
                                </p>
                              </div>
                            </div>
                        )}

                        {/* Note */}
                        {selectedPayout.note && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Note
                              </h4>
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                  {selectedPayout.note}
                                </p>
                              </div>
                            </div>
                        )}
                      </div>
                  ) : (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          Gateway Response
                        </h4>
                        {selectedPayout.gateway_response ? (
                            <div className="relative">
                              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-xs font-mono text-gray-900 dark:text-gray-100 overflow-x-auto">
                                {JSON.stringify(JSON.parse(selectedPayout.gateway_response), null, 2)}
                              </pre>
                              <button
                                  onClick={() => copyToClipboard(selectedPayout.gateway_response!, "Gateway Response")}
                                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                              <FileJson className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No gateway response available
                              </p>
                            </div>
                        )}
                      </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    Last updated: {moment(selectedPayout.updated_at).format('MMM DD, YYYY [at] h:mm A')}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                        onClick={() => resendWebhook(selectedPayout.business_id.toString(), selectedPayout.trx)}
                        disabled={isResending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
                    >
                      {isResending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                          <Send className="w-4 h-4" />
                      )}
                      {isResending ? 'Sending...' : 'Resend Webhook'}
                    </button>
                    <button
                        onClick={() => setSelectedPayout(null)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
        )}

        {/* Export Modal */}
        {isExportModalOpen && (
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Export Payouts"
                // size="md"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Export Payout Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Export your payout data with current filters applied
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <FileText className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <span className="text-sm font-medium">CSV</span>
                      </button>
                      <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <FileJson className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                        <span className="text-sm font-medium">JSON</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Export Summary
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>• Total records: {pagination.totalItems}</p>
                      <p>• Date range: {startDate && endDate ? `${startDate} to ${endDate}` : 'All time'}</p>
                      <p>• Status filter: {filterStatus === 'all' ? 'All statuses' : StringUtils.capitalizeWords(filterStatus)}</p>
                      <p>• Payment mode: {filterPaymentMode === 'all' ? 'All modes' : StringUtils.snakeToCapitalized(filterPaymentMode)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                      onClick={() => setIsExportModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              </div>
            </Modal>
        )}
      </div>
  );
};

export default Page;
