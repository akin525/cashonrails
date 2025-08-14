"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import Modal from '@/components/modal';
import moment from 'moment';
import { StringUtils } from '@/helpers/extras';
import {string} from "postcss-selector-parser";


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
}



type FilterStatus = 'all' | 'active' | 'inactive';


// Constants
const TABLE_COLUMNS: Column<TableData>[] = [
  { id: "reference", label: "REFERENCE" },
  { id: "amount", label: "AMOUNT" },
  { id: "bal_before", label: "BALANCE BEFORE", type:"amount"},
  { id: "bal_after", label: "BALANCE AFTER" , type:"amount"},
  { id: "type", label: "TYPE" },
  { id: "source", label: "SOURCE" },

  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{value.status}</Chip>,
  },
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

// Filter data based on search input

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData(currentPage, searchQuery);
    setLoading(false);
  };
  const queryParams = useMemo(() => ({
    status: typedFilterState.status,
    start_date: filterState.dateRange.startDate,
    end_date: filterState.dateRange.endDate,
  }), [filterState]);

  const fetchData = useCallback(async (page: number, search: string) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<TableData>(`/merchant/wallet-transaction/${params.id}`, {
        params: { page, limit: pagination.limit },
        headers: { Authorization: `Bearer ${authState.token}` },
        timeout:60000

      });
      if (response.data.status && response.data.data) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch transactions');
      }
      setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [authState.token, queryParams, pagination.limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(currentPage, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, fetchData]);


  const [modalData, setModalData] = useState<TableData | null>(null)

  return (
      <div>
        <Modal
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            header={
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Wallet Transaction Details</h2>
                {/*<Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />*/}
              </div>
            }
            scrollableContent={true}
        >

          {modalData ? (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TableData Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Transaction ID:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business ID:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Amount:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.currency} {StringUtils.formatWithCommas(modalData.amount)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{StringUtils.capitalizeWords(modalData.status)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Date:</strong></p>
                    <p className="text-sm font-normal text-gray-800">
                      {moment(modalData.created_at).format('MMMM Do YYYY')}
                      <br />
                      {moment(modalData.created_at).format('h:mm:ss a')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Reference:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.reference}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Source:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.source}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Domain:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.domain}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Note:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.note || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Updated At:</strong></p>
                    <p className="text-sm font-normal text-gray-800">
                      {moment(modalData.updated_at).format('MMMM Do YYYY')}
                      <br />
                      {moment(modalData.updated_at).format('h:mm:ss a')}
                    </p>
                  </div>

                  {/* Business Fields */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business Name:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Trade Name:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.trade_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business Email:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business Phone:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_phone}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business Address:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_address}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business Country:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_country}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business State:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_state || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Business City:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.biz_city || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Support Email:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.support_email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Support Phone:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.support_phone}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Chargeback Email:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.chargeback_email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>KYC Status:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_status}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>KYC Rejection Reason:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_reason_for_rejection || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>KYC Rejection Comment:</strong></p>
                    <p className="text-sm font-normal text-gray-800">{modalData.business.kyc_rejection_comment || 'N/A'}</p>
                  </div>
                </div>
              </div>
          ) : (
              <p className="text-center text-gray-600 py-4">Loading payout details...</p>
          )}
        </Modal>

        <div className="p-4 mt-4">

          <div className="p-4">
            <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition flex items-center gap-2 m-2"
            >
              {loading ? (
                  <svg
                      className="w-4 h-4 animate-spin"
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

            {/* Open Export Modal */}

          </div>

          <Table<TableData>
              headers={TABLE_COLUMNS as any}
              data={data as any}
              limit={pagination.limit}
              onRowClick={(row) => setModalData(row)} // Handle row click
              loading={loading}
              pagination={pagination}
              onPaginate={setCurrentPage}
          />

        </div>
      </div>
  );
};

export default Page;