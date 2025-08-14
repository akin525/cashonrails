"use client";
import React, { useCallback, useEffect, useState } from "react";
import CountryFlag from "@/components/countryFlag";
import axiosInstance from "@/helpers/axiosInstance";
import { MerchantWallets } from "@/contexts/merchantContext";
import { useAuth } from "@/contexts/authContext";
import { MetricCardSkeleton } from "@/components/loaders";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

interface WalletCardProps {
  currency: string;
  balance: string;
  pending: string;
  symbol: string;
}

const WalletCard: React.FC<WalletCardProps> = ({pending, balance, currency, symbol }) => (
    <div
        role="button"
        tabIndex={0}
        className="rounded-lg border-bar flex flex-col justify-between h-full cursor-pointer"
    >
      <div className="border-[#E4E7EC] border rounded-xl p-3 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-1">
          <CountryFlag currencyCode={currency} />
          <p className="text-sm">{currency} Balance</p>
        </div>
        <p className="text-xl font-medium">
          {symbol} {balance}
        </p>
      </div>
      <div className="border-[#E4E7EC] border rounded-xl p-3 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-1">
          <CountryFlag currencyCode={currency} />
          <p className="text-sm">{currency} Pending</p>
        </div>
        <p className="text-xl font-medium">
          {symbol} {pending}
        </p>
      </div>
    </div>
);

const MerchantWalletPage = ({ params }: { params: { id: string } }) => {
  const [walletData, setWalletData] = useState<MerchantWallets[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [customCurrency, setCustomCurrency] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { authState } = useAuth();
  const currencyOptions = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR", "Other"];

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
    if (isNaN(num)) return "0";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    return num.toFixed(2);
  }

  const handleCreateWallet = async () => {
    const currency = selectedCurrency === "Other" ? customCurrency : selectedCurrency;
    if (!currency) {
      toast.error("Please select or enter a currency");
      return;
    }
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
        setSelectedCurrency("");
        setCustomCurrency("");
        fetchWalletData();
      } else {
        toast.error(response.data.message || "Failed to create wallet");
      }
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      toast.error(error.message || "Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  const WalletCards: React.FC = () => {
    if (isLoadingWallet) return <MetricCardSkeleton />;

    const configs = walletData.map((wallet) => ({
      currency: wallet.currency,
      balance: formatBalance(wallet.balance),
      pending: formatBalance(wallet.pending),
      symbol: wallet.currency,
    }));

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5">
          {configs.map((card, index) => (
              <WalletCard key={index} {...card} />
          ))}
        </div>
    );
  };

  return (
      <div>
        {/* Create Wallet Button */}
        <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-300 text-white px-5 py-2.5 rounded-full font-medium shadow hover:shadow-lg hover:from-green-700 hover:to-green-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Wallet
        </button>

        <WalletCards />

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
              <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Wallet</h2>

                <label className="block text-sm font-medium mb-1">Select Currency</label>
                <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select currency --</option>
                  {currencyOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                  ))}
                </select>

                {selectedCurrency === "Other" && (
                    <input
                        type="text"
                        placeholder="Enter currency code (e.g., AED)"
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                        className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedCurrency("");
                        setCustomCurrency("");
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                      disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleCreateWallet}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isCreating}
                  >
                    {isCreating ? (
                        <>
                          <FiLoader className="animate-spin" />
                          Creating...
                        </>
                    ) : (
                        "Create Wallet"
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Extra animations */}
        <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      </div>
  );
};

export default MerchantWalletPage;
