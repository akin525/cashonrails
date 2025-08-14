"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import { RouteLiteral } from 'nextjs-routes';
import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import { StringUtils } from '@/helpers/extras';
import axiosInstance from '@/helpers/axiosInstance';
import { MetricCard, MetricCardProps } from '@/components/MatricCard';
import moment from 'moment';
import Buttons from '@/components/buttons';
import Modal from '@/components/modal';
import {FileSpreadsheet, PackageSearch} from "lucide-react";
import {string} from "postcss-selector-parser";

interface StatsData {
  total: number,
  amount_pending: number,
  amount_processed: number,
  amount_success: number,
  amount_fail: number
}

// Define the main interface for the transaction
interface TableData {
  id: string;
  currency: string;
  amount: string;
  fee: string;
  stamp_duty: string;
  settled_amount: string;
  account_number: string;
  sender_account_name: string;
  sender_account_number: string;
  sender_bank_code: string;
  sender_narration: string;
  sessionId: string;
  trx: string;
  reference: string;
  domain: string;
  gateway: string;
  status: string;
  created_at: string;
  updated_at: string;
  gateway_response: string;
}

const TABLE_COLUMNS: Column<TableData>[] = [
  { id: "trx", label: "TRX" },
  { id: "amount", label: "AMOUNT" },
  { id: "fee", label: "FEE" },
  { id: "settled_amount", label: "SETTLED AMOUNT", minWidth: 200 },
  { id: "account_number", label: "ACCOUNT NUMBER", minWidth: 200 },
  { id: "sender_account_name", label: "ACCOUNT NAME" },
  { id: "sender_account_number", label: "SENDER ACCOUNT", minWidth: 200 },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
  },
  { id: "created_at", label: "DATE", type: "dateTime" },

];


const Page = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { setShowSearchQuery, filterState } = useUI();
  const typedFilterState = filterState as FilterState;
  const [data, setData] = useState<TableData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 50 });

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
  }), [filterState]);

  const fetchData = useCallback(async (page: number) => {
    if (!authState.token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<TableData>(`/merchant/incoming-transfer/${params.id}`, {
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
  }, [fetchData, currentPage]);
  useEffect(() => {
    setShowSearchQuery(true);

    return () => {
      setShowSearchQuery(false);
    };
  }, [setShowSearchQuery, typedFilterState]);

  const [modalData, setModalData] = useState<TableData | null>(null)

  const [showGatewayResponse, setShowGatewayResponse] = useState(false);

  return (
      <div>
        <Modal
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            header={
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Transaction Details</h2>
                <div className="flex gap-4">
                  {/*<Buttons onClick={() => router.push(`/dashboard/operations/transaction/${modalData?.id}` as RouteLiteral)} label="View Full Details" fullWidth type="smOutlineButton" />*/}
                  {/*<Buttons onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)} label="Go to business" type="smOutlineButton" />*/}
                  {/*<Buttons label="Resend Notification" fullWidth type="smOutlineButton" />*/}
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
                    <p className="text-sm text-gray-600"><strong>Session ID:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.sessionId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Gateway:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.gateway}</p>
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
                    <p className="text-sm text-gray-600"><strong>Fee:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.fee}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Settled Amount:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.settled_amount}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Account Number:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.account_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Sender Account Name:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.sender_account_name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Sender Account Number:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.sender_account_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Status:</strong></p>
                    <p className="text-sm font-medium text-gray-800">{modalData.status}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><strong>Created At:</strong></p>
                    <p className="text-sm font-medium text-gray-800">
                      {moment(modalData.created_at).format('MMMM Do YYYY')}
                      <br />
                      {moment(modalData.created_at).format('h:mm:ss a')}
                    </p>
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
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600"><strong>Gateway Response Code:</strong></p>
                            <p className="text-sm font-medium text-gray-800">
                              {modalData.gateway_response}
                            </p>
                          </div>

                        </div>
                      </div>
                  )}
                </div>
              </div>
          ) : (
              <p className="text-center text-gray-600 py-4">Loading transaction details...</p>
          )}
        </Modal>
        <div className="p-4 mt-4">

          <Table<TableData>
              headers={TABLE_COLUMNS as any}
              data={data as any}
              limit={pagination.limit}
              loading={loading}
              onPaginate={setCurrentPage}
              pagination={pagination}
              onRowClick={(row) => setModalData(row)}


          />
        </div>
      </div>
  );
};

export default Page;