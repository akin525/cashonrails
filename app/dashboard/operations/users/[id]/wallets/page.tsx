"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import CountryFlag from "@/components/countryFlag";
import { FormSelect } from "@/components/formInputs/formInputs";
import DateRangeSelector from "@/components/filter/DateRangePicker";
import axiosInstance from "@/helpers/axiosInstance";
import { RouteLiteral } from "nextjs-routes";
import { MerchantWallets } from "@/contexts/merchantContext";
import { useAuth } from "@/contexts/authContext";
import { MetricCardSkeleton } from "@/components/loaders";
import toast from "react-hot-toast";
import { StringUtils } from "@/helpers/extras";

// Types
interface WalletCardProps {
  currency: string;
  balance: string;
  filterType?: string;
  isActive?: boolean;
  symbol: string;
}

interface BaseTransactionData {
  id: string;
  currency: string;
  amount: string;
  created_at: string;
  status: "Success" | "Failed" | "Pending";
  paid_at: string;
  gateway: string;

}

interface PayinTransactionData extends BaseTransactionData {
  trx: string;
  role: string;
  type: "topup" | string;
  channel: string;
  ip_address: string;
}

interface PayoutTransactionData extends BaseTransactionData {
  reference: string;
  merchant_id: string;
  fee: string;
  paymentMode: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  ip_address: string;
}

interface IncomingTransferData extends BaseTransactionData {
  transfer_id: string;
  sender: string;
  receiver: string;
  transfer_type: string;
}

interface SettlementData extends BaseTransactionData {
  settlement_id: string;
  merchant_id: string;
  settlement_type: string;
  settlement_date: string;
}

interface VirtualAccountData extends BaseTransactionData {
  virtual_account_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
}

interface WalletTransactionData extends BaseTransactionData {
  requested_amount: string;
  fee: string;
  stamp_duty: string;
  total: string;
  sys_fee: string;
  reference: string;
  trx: string;
  channel: string;
  type: string;
  domain: string;


}


const PAYIN_COLUMNS: Column<PayinTransactionData>[] = [
  { id: "trx", label: "TRANSACTION ID" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120 },
  {
    id: "type",
    label: "TYPE",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.type)}</p>,
  },
  {
    id: "gateway",
    label: "GATEWAY",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.gateway)}</p>,
  },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
  {
    id: "channel",
    label: "CHANNEL",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.channel)}</p>,
  },
  { id: "ip_address", label: "IP ADDRESS", minWidth: 120 },


  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
  { id: "created_at", label: "PAYED AT", minWidth: 120, type: "dateTime" },
];

const PAYOUT_COLUMNS: Column<PayoutTransactionData>[] = [
  { id: "reference", label: "REFERENCE" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120 },
  { id: "fee", label: "FEE", minWidth: 120 },
  { id: "bank_name", label: "BANK NAME", minWidth: 120 },
  { id: "account_name", label: "ACC NAME", minWidth: 120 },
  { id: "account_number", label: "ACC NUMBER", minWidth: 120 },
  {
    id: "paymentMode",
    label: "PAYOUT MODE",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.paymentMode)}</p>,
  },
  {
    id: "gateway",
    label: "GATEWAY",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.gateway)}</p>,
  },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },

  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
  { id: "created_at", label: "PAYED AT", minWidth: 120, type: "dateTime" },
];

const INCOMING_TRANSFER_COLUMNS: Column<IncomingTransferData>[] = [
  { id: "transfer_id", label: "TRANSFER ID" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120 },
  { id: "sender", label: "SENDER", minWidth: 120 },
  { id: "receiver", label: "RECEIVER", minWidth: 120 },
  { id: "transfer_type", label: "TRANSFER TYPE", minWidth: 120 },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
];

const SETTLEMENT_COLUMNS: Column<SettlementData>[] = [
  { id: "settlement_id", label: "SETTLEMENT ID" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120 },
  { id: "merchant_id", label: "MERCHANT ID", minWidth: 120 },
  { id: "settlement_type", label: "SETTLEMENT TYPE", minWidth: 120 },
  { id: "settlement_date", label: "SETTLEMENT DATE", minWidth: 120, type: "dateTime" },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
];

const VIRTUAL_ACCOUNT_COLUMNS: Column<VirtualAccountData>[] = [
  { id: "virtual_account_id", label: "VIRTUAL ACCOUNT ID" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120 },
  { id: "account_name", label: "ACCOUNT NAME", minWidth: 120 },
  { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 120 },
  { id: "bank_name", label: "BANK NAME", minWidth: 120 },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
];

const WALLET_TRANSACTION_COLUMNS: Column<WalletTransactionData>[] = [
  { id: "trx", label: "TRX" },
  { id: "reference", label: "REFERENCE ID" },
  { id: "currency", label: "CURRENCY", minWidth: 120 },
  { id: "amount", label: "AMOUNT", minWidth: 120,
    format: (value: number | string) => `₦${Number(value).toLocaleString()}`

  },
  { id: "total", label: "TOTAL", minWidth: 120 },
  { id: "sys_fee", label: "SYS FEE", minWidth: 120 },
  { id: "channel", label: "CHANNEL", minWidth: 120 },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
  { id: "created_at", label: "CREATED AT", minWidth: 120, type: "dateTime" },
];

const WalletCard: React.FC<WalletCardProps> = ({
  isActive,
  balance,
  currency,
  symbol,
}) => (
  <div
    role="button"
    tabIndex={0}
    className={`rounded-lg border-bar flex flex-col justify-between h-full cursor-pointer`}
  >
    <div className="border-[#E4E7EC] border rounded-xl p-3 flex flex-col justify-between gap-4">
      <div className="flex items-center gap-1">
        <CountryFlag currencyCode={currency} />
        <p className="text-sm">{currency} Balance</p>
      </div>
      <p className="text-xl font-medium">
        {symbol}
        {' '}
        {balance}
      </p>
    </div>
  </div>
);

type TransactionType = "payin" | "payout" | "incoming-transfer" | "settlement" | "virtual-account" | "wallet-transaction";

const MerchantWalletPage = ({ params }: { params: { id: string } }) => {
  const [transactionData, setTransactionData] = useState<
    PayinTransactionData[] | PayoutTransactionData[] | IncomingTransferData[] | SettlementData[] | VirtualAccountData[] | WalletTransactionData[]
  >([]);
  const [walletData, setWalletData] = useState<MerchantWallets[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("Total");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
  const [transactionType, setTransactionType] = useState<TransactionType>("payin");
  const [startDate, setStartDate] = useState<string | null>();
  const [endDate, setEndDate] = useState<string | null>();
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  const router = useRouter();
  const { authState } = useAuth();

  const fetchWalletData = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      const response = await axiosInstance.get<MerchantWallets[]>(
        `/operations/merchants/${params.id}/wallet`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );
      if (response.data.data && response.data.status) {
        setWalletData(response.data.data);
      } else {
        setWalletData([]);
        toast.error(response.data.message || "Something went wrong fetching wallet data");
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      toast.error(error.message || "Something went wrong fetching wallet data");
    } finally {
      setIsLoadingWallet(false);
    }
  }, [authState.token, params.id]);

  const queryParams = useMemo(() => ({
    start_date: startDate,
    end_date: endDate,
  }), [endDate, startDate]);

  const fetchTransactions = useCallback(async (page: number) => {
    if (!authState.token) return;
    setIsLoadingTable(true);

    let endpoint = "";
    switch (transactionType) {
      case "payin":
        endpoint = `operations/merchants/${params.id}/transaction`;
        break;
      case "payout":
        endpoint = `finance/payouts/${params.id}/merchant`;
        break;
      case "incoming-transfer":
        endpoint = `merchant/incoming-transfer/${params.id}r`;
        break;
      case "settlement":
        endpoint = `merchant/settlement/${params.id}`;
        break;
      case "virtual-account":
        endpoint = `merchant/virtual-account/${params.id}`;
        break;
      case "wallet-transaction":
        endpoint = `merchant/wallet-transaction/${params.id}`;
        break;
      default:
        endpoint = `operations/merchants/${params.id}/transaction`;
    }

    try {
      const response = await axiosInstance.get(endpoint, {
        params: { ...queryParams, page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${authState.token}` },
      });

      if (response.data.data) {
        setTransactionData(response.data.data);
      }
      setPagination(response.data.pagination || { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoadingTable(false);
    }
  }, [authState.token, activeFilter, params.id, transactionType, queryParams, pagination.limit]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage, transactionType]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDateChange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setStartDate(moment(startDate).format("YYYY-MM-DD"));
    setEndDate(moment(endDate).format("YYYY-MM-DD"));
  };

  const handleTransactionTypeChange = (value: TransactionType) => {
    setTransactionType(value);
    setCurrentPage(1);
    setActiveFilter("Total");
  };

  const WalletCards: React.FC = () => {
    if (isLoadingWallet) {
      return <MetricCardSkeleton />;
    }

    const WALLET_CARD_CONFIGS: WalletCardProps[] = walletData.map((wallet) => ({
      currency: wallet.currency,
      balance: wallet.balance.toLocaleString(),
      filterType: wallet.currency,
      isActive: activeFilter === wallet.currency,
      symbol: wallet.currency,
    }));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5">
        {WALLET_CARD_CONFIGS.map((card, index) => (
          <WalletCard key={index} {...card} />
        ))}
      </div>
    );
  };

  const handleRowClick = (row: PayinTransactionData | PayoutTransactionData | IncomingTransferData | SettlementData | VirtualAccountData | WalletTransactionData) => {
    if ("trx" in row) {
      router.push(`/dashboard/operations/merchant/${row.trx}/business` as RouteLiteral);
    } else if ("reference" in row) {
      router.push(`/dashboard/finance/payouts/${row.reference}` as RouteLiteral);
    } else if ("transfer_id" in row) {
      router.push(`/dashboard/operations/merchant/${row.transfer_id}/incoming-transfer` as RouteLiteral);
    } else if ("settlement_id" in row) {
      router.push(`/dashboard/operations/merchant/${row.settlement_id}/settlement` as RouteLiteral);
    } else if ("virtual_account_id" in row) {
      router.push(`/dashboard/operations/merchant/${row.virtual_account_id}/virtual-account` as RouteLiteral);
    } else if ("wallet_transaction_id" in row) {
      router.push(`/dashboard/operations/merchant/${row}/wallet-transaction` as RouteLiteral);
    }
  };

  return (
    <div>
      <WalletCards />
      <div className="p-4 mt-4">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex gap-2 items-center">
            <p>Recent Transactions</p>
            <FormSelect
              name="transaction-type"
              defaultValue="payin"
              placeholder={{
                label: "PAY-IN",
                value: "payin",
              }}
              getValueOnChange={({ value }) => handleTransactionTypeChange(value as TransactionType)}
              options={[
                { label: "PAY-IN", value: "payin" },
                { label: "PAYOUT", value: "payout" },
                // { label: "INCOMING TRANSFER", value: "incoming-transfer" },
                { label: "SETTLEMENT", value: "settlement" },
                { label: "VIRTUAL ACCOUNT", value: "virtual-account" },
                { label: "WALLET TRANSACTION", value: "wallet-transaction" },
              ]}
            />
          </div>
          <DateRangeSelector
            startDate={new Date()}
            endDate={new Date()}
            onDateChange={handleDateChange}
            defaultRelativeRangeValue="7d"
            onRelativeRangeChange={handleDateChange}
          />
        </div>
        {transactionType === "payin" ? (
          <Table<PayinTransactionData>
            headers={PAYIN_COLUMNS}
            data={transactionData as PayinTransactionData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        ) : transactionType === "payout" ? (
          <Table<PayoutTransactionData>
            headers={PAYOUT_COLUMNS}
            data={transactionData as PayoutTransactionData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        ) : transactionType === "incoming-transfer" ? (
          <Table<IncomingTransferData>
            headers={INCOMING_TRANSFER_COLUMNS}
            data={transactionData as IncomingTransferData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        ) : transactionType === "settlement" ? (
          <Table<SettlementData>
            headers={SETTLEMENT_COLUMNS}
            data={transactionData as SettlementData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        ) : transactionType === "virtual-account" ? (
          <Table<VirtualAccountData>
            headers={VIRTUAL_ACCOUNT_COLUMNS}
            data={transactionData as VirtualAccountData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        ) : (
          <Table<WalletTransactionData>
            headers={WALLET_TRANSACTION_COLUMNS}
            data={transactionData as WalletTransactionData[]}
            limit={pagination.limit}
            loading={isLoadingTable}
            // onRowClick={(row) => handleRowClick(row)}
            pagination={pagination}
            onPaginate={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default MerchantWalletPage;