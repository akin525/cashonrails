"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import Header from "./Header";
import { StringUtils } from "@/helpers/extras";
import axiosInstance from "@/helpers/axiosInstance";
import Modal from "@/components/modal";
import Buttons from "@/components/buttons";
import moment from "moment/moment";

// Types
 interface VirtualWalletData {
  id: string;
  business_id: string;
  customer_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  domain: string;
  reference: string;
  keyReference: string;
  assignment: string;
  used: string;
  provider: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Constants
 const TABLE_COLUMNS: Column<VirtualWalletData>[] = [
  { id: "business_id", label: "BUSINESS ID" },
  { id: "account_name", label: "ACCOUNT NAME" },
  { id: "account_number", label: "ACCOUNT NUMBER" },
  { id: "bank_name", label: "BANK NAME" },
  { id: "used", label: "USED" },
  { id: "provider", label: "PROVIDER" },
  {
    id: "status",
    label: "STATUS",
    type: "custom",
    renderCustom: (value) => (
      <Chip variant={value.status}>
        {StringUtils.capitalizeWords(value.status)}
      </Chip>
    ),
  },
  { id: "created_at", label: "DATE", type: "dateTime" },
];

const Page = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const { setShowSearchQuery, filterState } = useUI();
  const typedFilterState = filterState as FilterState;

  // State for data and pagination
  const [data, setData] = useState<VirtualWalletData[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setShowSearchQuery(true);
    return () => setShowSearchQuery(false);
  }, [setShowSearchQuery]);

  // Memoized query params
  const queryParams = useMemo(
    () => ({
      status: typedFilterState.status,
      start_date: typedFilterState.dateRange.startDate,
      end_date: typedFilterState.dateRange.endDate,
    }),
    [typedFilterState]
  );

  // Fetch data with pagination
  const fetchData = useCallback(
    async (page: number) => {
      if (!authState.token) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get<VirtualWalletData[]>("/operations/virtual-account", {
          params: { ...queryParams, page, limit: pagination.limit },
          headers: { Authorization: `Bearer ${authState.token}` },
            timeout:60000,
        });

        setData(response.data.data || []);
        console.log("response", response);
        setPagination(response.data.pagination || { totalItems: 0, totalPages: 1, limit: 10 }); // Add default value
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [authState.token, queryParams, pagination.limit]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchData(page);
    },
    [fetchData]
  );
  // Fetch data when the page mounts or queryParams change
  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);
    const [modalData, setModalData] = useState<VirtualWalletData | null>(null)

  return (
    <div>
        <Modal
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            header={
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">VirtualAccount Details</h2>
                    <div className="flex gap-4">
                        <Buttons
                            onClick={() => router.push(`/dashboard/operations/merchant/${modalData?.business_id}/business` as RouteLiteral)}
                            label="Go to business"
                            type="smOutlineButton"
                        />
                        {/*<Buttons label="Resend Notification" fullWidth type="smOutlineButton" />*/}
                    </div>
                </div>
            }
            scrollableContent={true}
        >
            {modalData ? (
                <div className="space-y-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(modalData).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <p className="text-sm text-gray-600 font-semibold">{key.replace(/_/g, " ").toUpperCase()}:</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {key.includes("created_at") || key.includes("updated_at")
                                        ? `${moment(value).format("MMMM Do YYYY, h:mm:ss a")}`
                                        : value ?? "N/A"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600 py-4">Loading...</p>
            )}
        </Modal>
      <Header headerTitle="Virtual Wallets" />
      <div className="p-4 mt-4">
        <Table<VirtualWalletData>
          headers={TABLE_COLUMNS}
          data={data}
          pagination={{
            limit: pagination.limit,
            totalItems: pagination.totalItems,
            totalPages: pagination.totalPages
          }}
          limit={pagination.limit}
          onRowClick={(row) => setModalData(row)}
          onPaginate={handlePageChange}
          loading={loading}
          showPagination
        />
      </div>
    </div>
  );
};

export default Page;
