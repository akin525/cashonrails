"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import Header from "./Header";
import moment from "moment";
import { StringUtils } from "@/helpers/extras";
import Modal from "@/components/modal";
import axiosInstance from "@/helpers/axiosInstance";
import Buttons from "@/components/buttons";
import SettlementModal from "./SettlementModal"; // Import the SettlementModal component
import toast from "react-hot-toast";

// Types
export interface TransactionData {
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
    webhook_status: string | null;
    webhook_response: string | null;
    webhook_count: number;
    paid_at: string;
    status: string;
    created_at: string;
    updated_at: string;
}
// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [showSettleConfirmation, setShowSettleConfirmation] = useState<null | TransactionData>(null);
    const [activeFilter, setActiveFilter] = useState<string>('Total');

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<TransactionData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);


    const TABLE_COLUMNS: Column<TransactionData>[] = [
        { id: "business_id", label: "BUSINESS ID" },
        {
            id: "amount", label: "AMOUNT", sortable: true,
            sortType: 'currency',
        },
        { id: "requested_amount", label: "REQUESTED AMOUNT" },
        { id: "fee", label: "FEE" },
        { id: "stamp_duty", label: "STAMP DUTY" },
        { id: "total", label: "TOTAL" },
        { id: "type", label: "TYPE" },
        { id: "channel", label: "CHANNEL" },
        {
            id: "status",
            label: "STATUS",
            type: "custom",
            sortable: true,
            renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
        },
        { id: "created_at", label: "CREATED DATE", type: "dateTime", sortable: true, minWidth: 150 },
        { id: "paid_at", label: "PAID DATE", type: "dateTime" },
        { id: "settled_at", label: "SETTLED DATE", type: "dateTime" },
        {
            id: "id",
            label: "Actions",
            type: "custom",
            fixed: "right", // This column will be fixed to the right
            renderCustom: (row) => (
                <Buttons label="Settle" type="mdOutlineButton" onClick={() => { setShowSettleConfirmation(row); }}>
                    Settle
                </Buttons>
            ),
        },
    ];

    useEffect(() => {
        setShowSearchQuery(true);
        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);

    const queryParams = useMemo(() => ({
        status: activeFilter !== 'Total' ? activeFilter : undefined,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [activeFilter, filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<TransactionData[]>("/finance/unsettle-transaction", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });
            setData(response.data?.data ?? []);
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

    const handleConfirmSettlement = async () => {
        if (!authState.token) return;
        if (showSettleConfirmation) {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/finance/settle-transaction/${showSettleConfirmation.id}` , {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                console.log("response", response.data)
                // if(response.data.status){}
                setShowSettleConfirmation(null); // Close the modal after successful settlement
                fetchData(currentPage); // Refetch data to update the UI
            } catch (error) {
                console.error("Error settling transaction:", error);
            } finally {
                setLoading(false);
            }
        }
    }

    console.log("data", data);
    return (
        <div>
            <SettlementModal isOpen={!!showSettleConfirmation} onClose={() => setShowSettleConfirmation(null)} transaction={showSettleConfirmation as TransactionData} onConfirm={handleConfirmSettlement} />
            <Header headerTitle={"Unsettle Transactions"} />
            <div className="p-4 mt-4">
                <Table<TransactionData>
                    headers={TABLE_COLUMNS}
                    data={data ? data : []}
                    limit={pagination.limit}
                    loading={loading}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                    showPagination
                />
            </div>
        </div>
    );
};

export default Page;
