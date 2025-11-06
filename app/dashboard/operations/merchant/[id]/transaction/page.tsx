"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import {
  ActiveShopIcon,
  DisabledShopIcon,
  NormalShopIcon,
} from '@/public/assets/icons';

import Table, { Column } from '@/components/table';
import { Chip, ChipVariant } from '@/components/chip';
import Tooltip from '@/components/tooltip';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import { useAuth } from '@/contexts/authContext';
import { StringUtils } from '@/helpers/extras';
import moment from 'moment';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import {FileSpreadsheet, PackageSearch} from "lucide-react";
import toast from "react-hot-toast";
import {string} from "postcss-selector-parser";



interface StatsData {
  total: number,
  amount_processed: number,
  amount_success: number,
  amount_fail: number,
  amount_pending: number
}


interface GatewayResponseData {
  amount: number;
  description: string;
  paymentMethodId: number;
  sessionId: string | null;
  merchantName: string | null;
  settlementId: string;
  customer: {
    id: string;
    transactionId: string;
    createdAt: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    metadata: string;
  };
  isEPosTransaction: boolean;
  userId: string | null;
  ePosTransactionReference: string | null;
  cardScheme: string;
  ePosTransactionStan: string | null;
  eposTransactionRrn: string | null;
  terminalId: string | null;
  cardPan: string | null;
  cardExpiryDate: string | null;
  cardHolderName: string | null;
  applicationPanSequenceNumber: string | null;
  id: string;
  merchantId: string;
  businessId: string;
  channel: string;
  callbackUrl: string;
  feeAmount: number;
  businessName: string;
  currency: string;
  status: string;
  statusReason: string | null;
  settlementType: string;
  createdAt: string;
  updatedAt: string;
  settledAt: string;
  orderId: string;
  ngnVirtualBankAccountNumber: string;
  ngnVirtualBankCode: string | null;
  usdVirtualAccountNumber: string;
  usdVirtualBankCode: string | null;
}

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
  chargeback_email: string | null;
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

interface TableData {
  id: string;
  business_id: number;
  currency: string;
  amount: string;
  requested_amount: string;
  fee: string;
  stamp_duty: string;
  total: string;
  sys_fee: string;
  trx: string;
  reference: string;
  channel: string;
  type: string;
  domain: string;
  customer_id: number;
  plan: string | null;
  card_attempt: number;
  settlement_batchid: string;
  settled_at: string | null;
  split_code: string | null;
  ip_address: string;
  gateway: string;
  gateway_response: string; // JSON string
  webhook_status: string | null;
  webhook_response: string | null;
  webhook_count: number;
  paid_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  business: Business;
};

const COLUMNS: Column<TableData>[] = [
  {
    id: "reference", label: "TRANSACTION ID",
  },
  // { id: "merchant", label: "MERCHANT NAME" },
  {
    id: "business", label: "BUSINESS NAME",
    type: "custom",
    renderCustom: (value) => <p>{value.business.name}</p>,
  },
  {
    id: "amount",
    label: "AMOUNT",
    type: "custom",
    renderCustom: (row: TableData) => (
        <p>
          {row.currency === 'NGN' ? '₦' : row.currency === 'USD' ? '$' : ''}
          {Number(row.amount).toLocaleString()}
        </p>
    )
  },
  {
    id: "currency",
    label: "CURRENCY"
  },
  {
    id: "fee",
    label: "FEE"
  },
  {
    id: "sys_fee",
    label: "SYSTEM FEE"
  },

  {
    id: "type", label: "PAYMENT TYPE",
    type: "custom",
    renderCustom: (value) => <p>{value.channel == "banktransfer" ? "Bank Transfer" : StringUtils.capitalizeWords(value.type)}</p>,
  },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => (
        <Chip variant={value.status}>
          {value.status}
        </Chip>
    ),
  },

  {
    id: "created_at", label: "DATE CREATED", minWidth: 120,
    type: "dateTime",
  },
];


// Page Component
const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { setShowHeader, setShowSearchQuery, setHeaderTitle, filterState } = useUI();
  const [data, setData] = useState<TableData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
  const { authState } = useAuth()
  const typedFilterState = filterState as FilterState;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);



  const queryParams = useMemo(() => ({
    status: typedFilterState.status,
    start_date: filterState.dateRange.startDate,
    end_date: filterState.dateRange.endDate,
  }), [typedFilterState.status, filterState.dateRange.startDate, filterState.dateRange.endDate]);


  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(currentPage, queryParams);
    setLoading(false);
  };

  const fetchData = async (page: number, queryParams: any) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<TableData>(`/merchant/transactions/${params.id}`, {
        params: { page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${authState.token}` },
        timeout:30000
      });
      setData(response.data?.data);
      setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resendwebhook = async (businessId?: string, transactionId?: string) => {
    if (!businessId || !transactionId) {
      console.error("Missing businessId or transactionId");
      return;
    }


    try {
      setLoading(true);
      const response = await axiosInstance.get<Response>(
          `/resend_transaction_webhook/${businessId}/live/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
            timeout:60000

          }
      );
      if (response.data.success){
        toast.success(response.data.message);
      }else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }; // Fix dependency array


  useEffect(() => {
    fetchData(currentPage, queryParams);
  }, [currentPage, queryParams, authState.token]);


  const [modalData, setModalData] = useState<TableData | null>(null)
  const [showGatewayResponse, setShowGatewayResponse] = useState(false);

  return (
      <div>
        <Modal
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            header={
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-500">Transaction Details</h2>
                <div className="flex gap-4">
                  {/*<Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />*/}
                  <Buttons
                      onClick={() => resendwebhook(modalData?.business_id as any, modalData?.id)}
                      label={loading ? "Sending..." : "Resend Notification"}
                      fullWidth
                      type="smOutlineButton"
                      disabled={loading}
                  />

                </div>
              </div>
            }
            scrollableContent={true}
        >
          {modalData ? (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transaction Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.business_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Currency:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.currency}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.amount}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Request Amount:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.requested_amount}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.fee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>System Fee:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.sys_fee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Stamp Duty:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.stamp_duty}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Card Attempt:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.card_attempt}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Total:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.total}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Transaction Reference:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.trx}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.reference}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Type:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.type}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Channel:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.channel}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.status}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>webhook Status:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.webhook_status}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>webhook Count:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.webhook_count}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Paid At:</strong></p>
                    <p className="text-sm font-medium text-gray-800">
                      {moment(modalData.paid_at).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Created At:</strong></p>
                    <p className="text-sm font-medium text-gray-800">
                      {moment(modalData.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600"><strong>Business Name:</strong></p>
                      <p className="text-sm font-medium text-gray-800">{modalData.business.name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600"><strong>Business Email:</strong></p>
                      <p className="text-sm font-medium text-gray-800">{modalData.business.biz_email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600"><strong>Business Phone:</strong></p>
                      <p className="text-sm font-medium text-gray-800">{modalData.business.biz_phone}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600"><strong>Business Address:</strong></p>
                      <p className="text-sm font-medium text-gray-800">{modalData.business.biz_address}</p>
                    </div>
                  </div>
                </div>

                {/* Collapsible Gateway Response Section */}
                <div className="mt-6">
                  <button
                      onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                      className="flex items-center justify-between w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                  >
                                <span className="text-sm font-medium text-gray-700">
                                    {showGatewayResponse ? 'Hide Gateway Response' : 'Show Gateway Response'}
                                </span>
                    <svg
                        className={`w-5 h-5 transition-transform ${showGatewayResponse ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showGatewayResponse && modalData.gateway_response && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-800">{JSON.stringify(JSON.parse(modalData.gateway_response), null, 2)}</pre>
                      </div>
                  )}
                </div>
              </div>
          ) : (
              <p className="text-center text-gray-600 py-4">Loading transaction details...</p>
          )}
        </Modal>

        <div className="p-4 mt-4">
          {/* Search Input */}

            {/* Flex container for buttons */}
            <div className="flex items-center gap-2 m-2">
              <button onClick={handleRefresh} disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md">
                {loading ? <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                </svg> : "Refresh"}
              </button>
            </div>

          {/* Transactions Table */}
          <Table
              headers={COLUMNS as any}
              data={data as any}
              limit={pagination.limit}
              loading={loading}
              onRowClick={(row) => setModalData(row as any)}
              pagination={pagination}
              onPaginate={setCurrentPage}
          />
        </div>

      </div>
  );
};

export default Page;