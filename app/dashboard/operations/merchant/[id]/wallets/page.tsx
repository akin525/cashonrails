"use client";
import React, { useCallback, useEffect, useState } from "react";
import CountryFlag from "@/components/countryFlag";
import axiosInstance from "@/helpers/axiosInstance";
import { MerchantWallets } from "@/contexts/merchantContext";
import { useAuth } from "@/contexts/authContext";
import { MetricCardSkeleton } from "@/components/loaders";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  PiggyBank,
  Loader2,
  X,
  Globe,
  Info,
  Copy,
  ExternalLink,
  Download,
  Settings
} from "lucide-react";

interface WalletCardProps {
  currency: string;
  balance: string;
  pending: string;
  symbol: string;
  isBalanceHidden: boolean;
  onToggleBalance: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
                                                 pending,
                                                 balance,
                                                 currency,
                                                 symbol,
                                                 isBalanceHidden,
                                                 onToggleBalance
                                               }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDisplayValue = (value: string) => {
    return isBalanceHidden ? "••••••" : `${symbol} ${value}`;
  };

  const getStatusColor = (pendingAmount: string) => {
    const amount = parseFloat(pendingAmount);
    if (amount > 0) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-500 dark:text-gray-400";
  };

  return (
      <div
          className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-indigo-50 dark:from-green-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CountryFlag currencyCode={currency} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {currency}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Wallet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                  onClick={onToggleBalance}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isBalanceHidden ? "Show balance" : "Hide balance"}
              >
                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Available Balance */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available Balance
            </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatDisplayValue(balance)}
            </p>
          </div>

          {/* Pending Balance */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Balance
            </span>
            </div>
            <p className={`text-lg font-semibold ${getStatusColor(pending)}`}>
              {formatDisplayValue(pending)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className={`flex gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              Send
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium">
              <ArrowDownLeft className="w-4 h-4" />
              Receive
            </button>
          </div>
        </div>
      </div>
  );
};

const WalletSummaryCard = ({
                             walletData,
                             isBalanceHidden
                           }: {
  walletData: MerchantWallets[];
  isBalanceHidden: boolean;
}) => {
  const totalBalance = walletData.reduce((sum, wallet) => sum + parseFloat(wallet.balance || "0"), 0);
  const totalPending = walletData.reduce((sum, wallet) => sum + parseFloat(wallet.pending || "0"), 0);

  const formatValue = (value: number) => {
    if (isBalanceHidden) return "••••••";
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  return (
      <div className="bg-gradient-to-br from-green-600 to-indigo-700 dark:from-green-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Total Portfolio</h2>
            <p className="text-green-100 text-sm">Across all currencies</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-green-100 text-sm mb-1">Available Balance</p>
            <p className="text-2xl font-bold">{formatValue(totalBalance)}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm mb-1">Pending Balance</p>
            <p className="text-xl font-semibold">{formatValue(totalPending)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-green-100 text-sm">
            {walletData.length} active wallet{walletData.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
  );
};

const CreateWalletModal = ({
                             isOpen,
                             onClose,
                             onCreateWallet,
                             isCreating
                           }: {
  isOpen: boolean;
  onClose: () => void;
  onCreateWallet: (currency: string) => void;
  isCreating: boolean;
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [customCurrency, setCustomCurrency] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const currencyOptions = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  ];

  const filteredCurrencies = currencyOptions.filter(
      currency =>
          currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const currency = selectedCurrency === "custom" ? customCurrency : selectedCurrency;
    if (!currency) {
      toast.error("Please select or enter a currency");
      return;
    }
    onCreateWallet(currency);
  };

  const handleClose = () => {
    setSelectedCurrency("");
    setCustomCurrency("");
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Create New Wallet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new currency wallet
                </p>
              </div>
            </div>
            <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {filteredCurrencies.map((currency) => (
                  <button
                      key={currency.code}
                      onClick={() => setSelectedCurrency(currency.code)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedCurrency === currency.code
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                  >
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {currency.code}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </p>
                    </div>
                    {selectedCurrency === currency.code && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />
                    )}
                  </button>
              ))}

              {/* Custom Currency Option */}
              <button
                  onClick={() => setSelectedCurrency("custom")}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedCurrency === "custom"
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Other Currency
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter custom currency code
                  </p>
                </div>
                {selectedCurrency === "custom" && (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />
                )}
              </button>
            </div>

            {/* Custom Currency Input */}
            {selectedCurrency === "custom" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency Code
                  </label>
                  <input
                      type="text"
                      placeholder="e.g., AED, CHF, SEK"
                      value={customCurrency}
                      onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      maxLength={3}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter 3-letter ISO currency code
                  </p>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  New wallets start with zero balance. You can fund them through transfers or payments.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isCreating || (!selectedCurrency || (selectedCurrency === "custom" && !customCurrency))}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
              ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Wallet
                  </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

const MerchantWalletPage = ({ params }: { params: { id: string } }) => {
  const [walletData, setWalletData] = useState<MerchantWallets[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'currency' | 'balance' | 'pending'>('currency');

  const { authState } = useAuth();
  const { theme } = useTheme();

  const fetchWalletData = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      const response = await axiosInstance.get<MerchantWallets[]>(
          `/operations/merchants/${params.id}/wallet`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
            timeout: 30000,
          }
      );
      if (response.data.data && response.data.status) {
        setWalletData(response.data.data);
      } else {
        setWalletData([]);
        toast.error(response.data.message || "Error fetching wallet data");
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      toast.error(error.message || "Error fetching wallet data");
    } finally {
      setIsLoadingWallet(false);
    }
  }, [authState.token, params.id]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  function formatBalance(value: string | number): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0.00";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    return num.toFixed(2);
  }

  const handleCreateWallet = async (currency: string) => {
    setIsCreating(true);
    try {
      const response = await axiosInstance.post(
          `/addwallet/${params.id}`,
          { currency },
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
              "Content-Type": "application/json",
            },
          }
      );

      if (response.data.status) {
        toast.success("Wallet created successfully");
        setShowModal(false);
        fetchWalletData();
      } else {
        toast.error(response.data.message || "Failed to create wallet");
      }
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredAndSortedWallets = walletData
      .filter(wallet =>
          wallet.currency.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'balance':
            return parseFloat(b.balance || "0") - parseFloat(a.balance || "0");
          case 'pending':
            return parseFloat(b.pending || "0") - parseFloat(a.pending || "0");
          default:
            return a.currency.localeCompare(b.currency);
        }
      });

  const WalletCards: React.FC = () => {
    if (isLoadingWallet) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
                </div>
            ))}
          </div>
      );
    }

    if (filteredAndSortedWallets.length === 0) {
      return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No wallets found' : 'No wallets yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first wallet to get started'
              }
            </p>
            {!searchTerm && (
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Wallet
                </button>
            )}
          </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedWallets.map((wallet, index) => (
              <WalletCard
                  key={`${wallet.currency}-${index}`}
                  currency={wallet.currency}
                  balance={formatBalance(wallet.balance)}
                  pending={formatBalance(wallet.pending)}
                  symbol={wallet.currency}
                  isBalanceHidden={isBalanceHidden}
                  onToggleBalance={() => setIsBalanceHidden(!isBalanceHidden)}
              />
          ))}
        </div>
    );
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Wallet Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your multi-currency wallets and track balances
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isBalanceHidden ? 'Show' : 'Hide'} Balances
                </button>

                <button
                    onClick={fetchWalletData}
                    disabled={isLoadingWallet}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingWallet ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {walletData.length > 0 && (
              <div className="mb-8">
                <WalletSummaryCard walletData={walletData} isBalanceHidden={isBalanceHidden} />
              </div>
          )}

          {/* Filters and Search */}
          {walletData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search wallets by currency..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'currency' | 'balance' | 'pending')}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="currency">Sort by Currency</option>
                      <option value="balance">Sort by Balance</option>
                      <option value="pending">Sort by Pending</option>
                    </select>
                  </div>
                </div>
              </div>
          )}

          {/* Wallet Cards */}
          <WalletCards />


          {/* Create Wallet Modal */}
          <CreateWalletModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onCreateWallet={handleCreateWallet}
              isCreating={isCreating}
          />

          {/* Quick Stats */}
          {walletData.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Active Wallets
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {walletData.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Across {new Set(walletData.map(w => w.currency)).size} currencies
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Highest Balance
                    </h3>
                  </div>
                  {(() => {
                    const maxWallet = walletData.reduce((max, wallet) =>
                            parseFloat(wallet.balance || "0") > parseFloat(max.balance || "0") ? wallet : max
                        , walletData[0] || { balance: "0", currency: "N/A" });

                    return (
                        <>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isBalanceHidden ? "••••••" : formatBalance(maxWallet.balance)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {maxWallet.currency}
                          </p>
                        </>
                    );
                  })()}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Total Pending
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {isBalanceHidden ? "••••••" : walletData.filter(w => parseFloat(w.pending || "0") > 0).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Wallets with pending funds
                  </p>
                </div>
              </div>
          )}

          {/* Recent Activity Section */}
          {walletData.length > 0 && (
              <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Wallet Overview
                    </h3>
                    <button className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
                      <ExternalLink className="w-4 h-4" />
                      View All Transactions
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                          Currency
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                          Available Balance
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                          Pending Balance
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredAndSortedWallets.map((wallet, index) => (
                          <tr
                              key={`${wallet.currency}-${index}`}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <CountryFlag currencyCode={wallet.currency} />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {wallet.currency}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Wallet
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {isBalanceHidden ? "••••••" : `${wallet.currency} ${formatBalance(wallet.balance)}`}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                                {isBalanceHidden ? "••••••" : `${wallet.currency} ${formatBalance(wallet.pending)}`}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors"
                                    title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                                    title="Copy wallet ID"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                                    title="Settings"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          )}

          {/* Help Section */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-indigo-50 to-green-50 dark:from-indigo-900/20 dark:to-green-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Need Help with Wallets?
                  </h4>
                  <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-4">
                    Learn how to manage your multi-currency wallets, understand pending balances, and optimize your payment flows.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
                      <ExternalLink className="w-4 h-4" />
                      Documentation
                    </button>
                    <button className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                    <button className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
                      <Settings className="w-4 h-4" />
                      Wallet Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MerchantWalletPage;
