"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import Modal from '@/components/modal';
import moment from 'moment';
import { StringUtils } from '@/helpers/extras';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  FileText,
  DollarSign,
  Loader2,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpDown, X
} from 'lucide-react';

// Define the Business interface
interface Business {
  id: number;
  user_id: number;
  name: string;
  trade_name: string;
  acc_prefix: string;
  industry_id: number;
  category_id: number;
  business_type: string;
  description: string | null;
  class: string | null;
  rcNumber: string | null;
  tin: string | null;
  logo: string | null;
  international_payment: number;
  local_settlement_day: number;
  foreign_settlement_day: number;
  rolling_reserve: string;
  rolling_duration: number;
  rs: number;
  trans_limit: string;
  biz_email: string;
  biz_bvn: string | null;
  bvn_verify: number;
  biz_phone: string;
  biz_url: string | null;
  biz_country: string;
  biz_country_isoName: string;
  biz_state: string | null;
  biz_city: string | null;
  biz_address: string;
  support_email: string;
  support_phone: string;
  chargeback_email: string;
  bc_notify: number;
  cc_notify: number;
  bp_notify: number;
  authMode: string;
  acc_prefix_mode: string;
  paymentMethod: string | null;
  defautPaymentMethod: string;
  momo_options: string;
  autoRefund: number;
  instant_settlement: string;
  kyc_status: string;
  kyc_reason_for_rejection: string | null;
  kyc_rejection_comment: string | null;
  phone_otp: string;
  phone_verified: number;
  id_verified: number;
  referral: string | null;
  ref_code: string;
  feeBearer: string;
  collection_status: number;
  payout_status: number;
  payout_limit_per_trans: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Define the main interface that includes the Business
interface TableData {
  id: string;
  business_id: number;
  wallet_id: number;
  source: string;
  type: string;
  currency: string;
  domain: string;
  amount: string;
  note: string;
  bal_before: string;
  bal_after: string;
  status: string;
  reference: string;
  created_at: string;
  updated_at: string;
  business: Business; // Nested business object
  actions:any;
}

type FilterStatus = 'all' | 'credit' | 'debit' | 'pending' | 'failed' | 'successful';

// Transaction type badge component
const TransactionTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = () => {
    switch (type.toLowerCase()) {
      case 'credit':
        return {
          icon: <ArrowDownLeft className="w-3 h-3" />,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
        };
      case 'debit':
        return {
          icon: <ArrowUpRight className="w-3 h-3" />,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
        };
      default:
        return {
          icon: <ArrowUpDown className="w-3 h-3" />,
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        };
    }
  };

  const config = getTypeConfig();

  return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
        {StringUtils.capitalizeWords(type)}
    </span>
  );
};

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

// Amount display component
const AmountDisplay = ({ amount, currency, type }: { amount: string; currency: string; type: string }) => {
  const isCredit = type.toLowerCase() === 'credit';

  return (
      <div className="flex items-center gap-2">
      <span className={`font-medium ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'}`}>
        {isCredit ? '+' : '-'} {currency} {StringUtils.formatWithCommas(amount)}
      </span>
        {isCredit ? (
            <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
        )}
      </div>
  );
};

// Transaction summary card component
const TransactionSummaryCard = ({ data }: { data: TableData[] | undefined }) => {
  if (!data || data.length === 0) return null;

  const totalTransactions = data.length;
  const creditTransactions = data.filter(t => t.type.toLowerCase() === 'credit').length;
  const debitTransactions = data.filter(t => t.type.toLowerCase() === 'debit').length;

  const totalAmount = data.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  const creditAmount = data
      .filter(t => t.type.toLowerCase() === 'credit')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  const debitAmount = data
      .filter(t => t.type.toLowerCase() === 'debit')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  // Get the most common currency
  const currencyCount: Record<string, number> = {};
  data.forEach(t => {
    currencyCount[t.currency] = (currencyCount[t.currency] || 0) + 1;
  });
  const mostCommonCurrency = Object.entries(currencyCount)
      .sort((a, b) => b[1] - a[1])[0][0];

  return (
      <div className="bg-gradient-to-br from-green-600 to-indigo-700 dark:from-green-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Wallet Transaction Summary</h2>
            <p className="text-green-100 text-sm">Overview of wallet activity</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-green-100 text-sm mb-1">Total Transactions</p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-green-300 text-xs">
                <ArrowDownLeft className="w-3 h-3" />
                <span>{creditTransactions} credits</span>
              </div>
              <div className="flex items-center gap-1 text-green-300 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                <span>{debitTransactions} debits</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm mb-1">Total Credits</p>
            <p className="text-xl font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" />
              {mostCommonCurrency} {StringUtils.formatWithCommas(creditAmount.toFixed(2))}
            </p>
          </div>
          <div>
            <p className="text-green-100 text-sm mb-1">Total Debits</p>
            <p className="text-xl font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {mostCommonCurrency} {StringUtils.formatWithCommas(debitAmount.toFixed(2))}
            </p>
          </div>
        </div>
      </div>
  );
};

const TransactionDetailModal = ({
                                  transaction,
                                  onClose
                                }: {
  transaction: TableData | null;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'transaction' | 'business'>('transaction');

  if (!transaction) return null;

  return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                {transaction.type.toLowerCase() === 'credit' ? (
                    <ArrowDownLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                    <ArrowUpRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {transaction.type} Transaction
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {moment(transaction.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                </p>
              </div>
            </div>

            {/* Add close button here */}
            <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rest of the modal content... */}
          {/* Tabs */}
          <div className="flex mt-6 border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('transaction')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'transaction'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Transaction Details
            </button>
            <button
                onClick={() => setActiveTab('business')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'business'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Business Information
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'transaction' ? (
              <div className="space-y-8">
                {/* Amount Section */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Transaction Amount</p>
                  <p className={`text-3xl font-bold ${
                      transaction.type.toLowerCase() === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {transaction.type.toLowerCase() === 'credit' ? '+' : '-'} {transaction.currency} {StringUtils.formatWithCommas(transaction.amount)}
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.reference}</p>
                      <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => {
                            navigator.clipboard.writeText(transaction.reference);
                            toast.success("Reference copied to clipboard");
                          }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.id}</p>
                      <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => {
                            navigator.clipboard.writeText(transaction.id);
                            toast.success("Transaction ID copied to clipboard");
                          }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      <TransactionTypeBadge type={transaction.type} />
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.source}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Domain</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.domain}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Wallet ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.wallet_id}</p>
                  </div>
                </div>

                {/* Balance Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Balance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Balance Before</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.currency} {StringUtils.formatWithCommas(transaction.bal_before)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Balance After</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.currency} {StringUtils.formatWithCommas(transaction.bal_after)}
                      </p>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Note</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.note || 'No note provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {moment(transaction.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated At</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {moment(transaction.updated_at).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <div className="space-y-8">
                {/* Business Overview */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {transaction.business.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {transaction.business.trade_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.business.name}
                    </p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Business ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.id}</p>
                      <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => {
                            navigator.clipboard.writeText(transaction.business.id.toString());
                            toast.success("Business ID copied to clipboard");
                          }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Business Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.business_type}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.biz_email}</p>
                      <a href={`mailto:${transaction.business.biz_email}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.biz_phone}</p>
                      <a href={`tel:${transaction.business.biz_phone}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.business.biz_address},
                      {transaction.business.biz_city ? ` ${transaction.business.biz_city},` : ''}
                      {transaction.business.biz_state ? ` ${transaction.business.biz_state},` : ''}
                      {transaction.business.biz_country}
                    </p>
                  </div>

                  {transaction.business.biz_url && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{transaction.business.biz_url}</p>
                          <a href={transaction.business.biz_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">KYC Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.business.kyc_status}
                    </p>
                  </div>
                </div>

                {/* Support Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Support Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Support Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.support_email}</p>
                        <a href={`mailto:${transaction.business.support_email}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Support Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.support_phone}</p>
                        <a href={`tel:${transaction.business.support_phone}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Chargeback Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.business.chargeback_email}</p>
                        <a href={`mailto:${transaction.business.chargeback_email}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Footer with Close Button */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalData, setModalData] = useState<TableData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // Table columns configuration
  const TABLE_COLUMNS: Column<TableData>[] = [
    {
      id: "reference",
      label: "REFERENCE",
      renderCustom: (row: TableData) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">{row.reference}</span>
            <button
                className="text-gray-400 hover:text-gray-600 dark:
            hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(row.reference);
                  toast.success("Reference copied to clipboard");
                }}
                title="Copy reference"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
      )
    },
    {
      id: "amount",
      label: "AMOUNT",
      renderCustom: (row: TableData) => (
          <AmountDisplay
              amount={row.amount}
              currency={row.currency}
              type={row.type}
          />
      )
    },
    {
      id: "bal_before",
      label: "BALANCE BEFORE",
      renderCustom: (row: TableData) => (
          <span className="font-medium text-gray-700 dark:text-gray-300">
          {row.currency} {StringUtils.formatWithCommas(row.bal_before)}
        </span>
      )
    },
    {
      id: "bal_after",
      label: "BALANCE AFTER",
      renderCustom: (row: TableData) => (
          <span className="font-medium text-gray-700 dark:text-gray-300">
          {row.currency} {StringUtils.formatWithCommas(row.bal_after)}
        </span>
      )
    },
    {
      id: "type",
      label: "TYPE",
      renderCustom: (row:TableData) => <TransactionTypeBadge type={row.type} />
    },
    {
      id: "source",
      label: "SOURCE",
      renderCustom: (row:TableData) => (
          <span className="text-gray-700 dark:text-gray-300">{row.source}</span>
      )
    },
    {
      id: "status",
      label: "STATUS",
      renderCustom: (row:TableData) => <StatusBadge status={row.status} />
    },
    {
      id: "created_at",
      label: "DATE",
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
      renderCustom: (row:TableData) => (
          <button
              onClick={(e) => {
                e.stopPropagation();
                setModalData(row);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
      )
    }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(currentPage, searchQuery);
    setLoading(false);
  };

  const queryParams = useMemo(() => ({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    type: filterType !== 'all' ? filterType : undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    search: searchQuery || undefined,
  }), [filterStatus, filterType, startDate, endDate, searchQuery]);

  const fetchData = useCallback(async (page: number, search: string) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/merchant/wallet-transaction/${params.id}`, {
        params: {
          page,
          limit: pagination.limit,
          ...queryParams
        },
        headers: { Authorization: `Bearer ${authState.token}` },
        timeout: 60000
      });

      if (response.data.status && response.data.data) {
        setData(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        toast.error(response.data.message || 'Failed to fetch transactions');
        setData([]);
      }

      setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load wallet transactions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [authState.token, queryParams, pagination.limit, params.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(currentPage, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, fetchData, filterStatus, filterType, startDate, endDate]);

  const handleExport = () => {
    // Implement export functionality
    toast.success("Export feature will be implemented soon");
    setIsExportModalOpen(false);
  };

  const handleDateFilter = () => {
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    setIsDateFilterOpen(false);
    fetchData(1, searchQuery);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterType("all");
    setStartDate("");
    setEndDate("");
    fetchData(1, "");
  };

  const EmptyState = () => (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No transactions found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {searchQuery || filterStatus !== 'all' || filterType !== 'all' || startDate || endDate
              ? "Try adjusting your filters or search terms to find what you're looking for."
              : "This wallet doesn't have any transactions yet."}
        </p>
        {(searchQuery || filterStatus !== 'all' || filterType !== 'all' || startDate || endDate) && (
            <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
                  Wallet Transactions
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage wallet transaction history
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

            {/* Transaction Summary */}
            <TransactionSummaryCard data={data} />

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search by reference or note..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                        className="appearance-none pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Statuses</option>
                      <option value="successful">Successful</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Type Filter */}
                  <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as "all" | "credit" | "debit")}
                        className="appearance-none pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                    fetchData(1, searchQuery);
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
                  {(searchQuery || filterStatus !== 'all' || filterType !== 'all' || startDate || endDate) && (
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

          {/* Transaction Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
                  </div>
                </div>
            ) : data.length > 0 ? (
                <Table<TableData>
                    headers={TABLE_COLUMNS as any}
                    data={data}
                    limit={pagination.limit}
                    onRowClick={(row) => setModalData(row)}
                    loading={loading}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                    rowClassName="group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                />
            ) : (
                <EmptyState />
            )}
          </div>

          {/* Export Modal */}
          {isExportModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Export Transactions
                        </h3>
                      </div>
                      <button
                          onClick={() => setIsExportModalOpen(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Export Format
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input type="radio" name="format" value="csv" defaultChecked className="text-green-600" />
                          <span className="text-gray-900 dark:text-gray-100">CSV</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input type="radio" name="format" value="excel" className="text-green-600" />
                          <span className="text-gray-900 dark:text-gray-100">Excel</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <input type="radio" name="format" value="pdf" className="text-green-600" />
                          <span className="text-gray-900 dark:text-gray-100">PDF</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                            Start Date
                          </label>
                          <input
                              type="date"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                            End Date
                          </label>
                          <input
                              type="date"
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={() => setIsExportModalOpen(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-greenr-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Transaction Detail Modal */}
          {modalData && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <TransactionDetailModal
                    transaction={modalData}
                    onClose={() => setModalData(null)}
                />
              </div>
          )}
        </div>
      </div>
  );
};

export default Page;
