"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
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
  amount: string;
  fee: string;
  fee_source: string;
  sys_fee: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  narration: string;
  sender_name: string;
  paymentMode: string;
  request_ip: string;
  initiator: string | null;
  domain: string;
  source: string;
  gateway: string;
  gateway_response: string | null;
  message: string;
  status: string;
  reversed: string;
  reversed_by: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}



// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
  { id: "trx", label: "TRX" },
  { id: "business_id", label: "BUSINESS ID" },
  { id: "amount", label: "AMOUNT" },
  { id: "fee", label: "FEE" },
  { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 200 },
  { id: "account_name", label: "ACCOUNT NAME", minWidth: 200 },
  { id: "sender_name", label: "SENDER NAME", minWidth: 200 },
  { id: "currency", label: "CURRENCY" },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
  },
  {
    id: "paymentMode",
    label: "PAYMENT MODE",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.snakeToCapitalized(value.paymentMode)}</p>,
  },
  {
    id: "source", label: "SOURCE", type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.source)}</p>,
  },
  {
    id: "gateway", label: "GATEWAY",
    type: "custom",
    renderCustom: (value) => <p>{StringUtils.capitalizeWords(value.gateway)}</p>,
  },
  { id: "reversed", label: "REVERSED" },
  { id: "created_at", label: "DATE", type: "dateTime" },
];

// Page Component
const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { setShowSearchQuery, filterState } = useUI();
  const typedFilterState = filterState as FilterState;
  const [data, setData] = useState<TableData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });
  const [selectedPayout, setSelectedPayout] = useState<TableData | null>(null); // NEW STATE
  const [searchQuery, setSearchQuery] = useState<string>("");
// Filter data based on search input



  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(currentPage);
    setLoading(false);
  };
  const queryParams = useMemo(() => ({
    status: typedFilterState.status,
    start_date: filterState.dateRange.startDate,
    end_date: filterState.dateRange.endDate,
  }), [filterState.dateRange.endDate, filterState.dateRange.startDate, typedFilterState.status]);

  console.log("queryParams", queryParams)
  const fetchData = useCallback(async (page: number) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<TableData>(`/merchant/payouts/${params.id}`, {
        params: { ...queryParams, page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${authState.token}` },
        timeout:60000

      });
      setData(response.data?.data);
      setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [authState.token, queryParams, pagination.limit]);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData,  currentPage]);



  const resendwebhook = async (businessId?: string, transactionId?: string) => {
    if (!businessId || !transactionId) {
      console.error("Missing businessId or transactionId");
      return;
    }


    try {
      setLoading(true);
      const response = await axiosInstance.get<Response>(
          `/resend_payout_webhook/${businessId}/live/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${authState.token}` },
            timeout:30000
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

  return (
      <div>

        {/* Payout Details Modal */}
        <Modal
            isOpen={!!selectedPayout}
            onClose={() => setSelectedPayout(null)}
            header={
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Payout Details</h2>
                <div className="flex gap-4">
                  {/*<Buttons onClick={()=> router.push(`/dashboard/operations/merchant/${selectedPayout?.business_id}/business` as RouteLiteral)} label="Go to business" fullWidth type="smOutlineButton" />*/}
                  <Buttons
                      onClick={() => resendwebhook(selectedPayout?.business_id as any, selectedPayout?.id)}
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
          {selectedPayout ? (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Existing Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.trx}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.business_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.currency} {selectedPayout.amount}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.fee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Account Number:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.account_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Account Name:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.account_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Sender Name:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.sender_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{StringUtils.capitalizeWords(selectedPayout.status)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Date:</strong></p>
                    <p className="text-sm font-medium text-gray-800">
                      {moment(selectedPayout.created_at).format('MMMM Do YYYY')}
                      <br />
                      {moment(selectedPayout.created_at).format('h:mm:ss a')}
                    </p>
                  </div>

                  {/* Additional Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.reference}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Transaction Ref:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.transactionRef || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Session ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.sessionid || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Batch ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.batch_id || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Fee Source:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.fee_source}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>System Fee:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.sys_fee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Bank Code:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.bank_code}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Bank Name:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.bank_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Narration:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.narration}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Payment Mode:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.paymentMode}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Request IP:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.request_ip}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Initiator:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.initiator}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Domain:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.domain}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Source:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.source}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Gateway:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.gateway}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Gateway Response:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.gateway_response || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Message:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.message || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Reversed:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.reversed}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Reversed By:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.reversed_by || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Note:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{selectedPayout.note || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Updated At:</strong></p>
                    <p className="text-sm font-medium text-gray-800">
                      {moment(selectedPayout.updated_at).format('MMMM Do YYYY')}
                      <br />
                      {moment(selectedPayout.updated_at).format('h:mm:ss a')}
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <p className="text-center text-gray-600 py-4">Loading payout details...</p>
          )}
        </Modal>

        {/* Table Component */}
        <div className="p-4 mt-4">

            {/* Flex container for buttons */}
            <div className="flex items-center gap-2 m-2">
              <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2 shadow-md"
              >
                {loading ? (
                    <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v6h6M20 20v-6h-6m1-10a9 9 0 11-6.64 15.36"/>
                    </svg>
                ) : (
                    "Refresh"
                )}
              </button>
          </div>

          <Table<TableData>
              headers={TABLE_COLUMNS as any}
              data={data as any}
              limit={pagination.limit}
              loading={loading}
              onPaginate={setCurrentPage}
              pagination={pagination}
              onRowClick={(row) => setSelectedPayout(row)} // Handle row click
          />

        </div>
      </div>
  );
};

export default Page;
