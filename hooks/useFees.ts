"use client";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import type {
    CollectionFeeData,
    PayoutFeeData,
    FeeFormData,
    FeeType,
    FeeApiResponse,
} from "@/types/fee.types";

interface UseFeesReturn {
    collectionFees: CollectionFeeData[];
    payoutFees: PayoutFeeData[];
    loading: boolean;
    submitLoading: boolean;
    fetchFees: () => Promise<void>;
    createFee: (data: FeeFormData, type: FeeType) => Promise<boolean>;
    updateFee: (data: FeeFormData, type: FeeType) => Promise<boolean>;
}

export const useFees = (businessId: string): UseFeesReturn => {
    const { authState } = useAuth();
    const [collectionFees, setCollectionFees] = useState<CollectionFeeData[]>([]);
    const [payoutFees, setPayoutFees] = useState<PayoutFeeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchFees = useCallback(async () => {
        if (!authState.token) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get<FeeApiResponse>(
                `/operations/merchant-fee/${businessId}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );

            if (res.data.status) {
                setCollectionFees(res.data.data.collection_fee || []);
                setPayoutFees(res.data.data.payout_fee || []);
            }
        } catch (error) {
            console.error("Failed to fetch fees:", error);
            toast.error("Failed to fetch fee data");
        } finally {
            setLoading(false);
        }
    }, [businessId, authState.token]);

    const validateFeeForm = (data: FeeFormData, type: FeeType): string | null => {
        if (!data.currency) return "Please select a currency";
        if (!data.fee_type) return "Please select a fee type";
        if (!data.fee || parseFloat(data.fee) < 0) return "Please enter a valid fee value";

        if (type === "collection") {
            if (!data.fee_cap || parseFloat(data.fee_cap) < 0) {
                return "Please enter a valid cap value";
            }
        } else {
            if (!data.range_set || parseFloat(data.range_set) < 0) {
                return "Please enter a valid range set";
            }
            if (!data.min_fee || parseFloat(data.min_fee) < 0) {
                return "Please enter a valid minimum fee";
            }
            if (!data.max_fee || parseFloat(data.max_fee) < 0) {
                return "Please enter a valid maximum fee";
            }
            if (parseFloat(data.min_fee) > parseFloat(data.max_fee)) {
                return "Minimum fee cannot be greater than maximum fee";
            }
        }

        return null;
    };

    const buildFeePayload = (data: FeeFormData, type: FeeType) => {
        const baseFee: any = {
            currency: data.currency,
            fee_type: data.fee_type,
            fee: parseFloat(data.fee),
            status: 1,
        };

        if (type === "collection") {
            baseFee.fee_cap = parseFloat(data.fee_cap || "0");
        } else {
            baseFee.range_set = parseFloat(data.range_set || "0");
            baseFee.min_fee = parseFloat(data.min_fee || "0");
            baseFee.max_fee = parseFloat(data.max_fee || "0");
        }

        return {
            business_id: businessId,
            fees: [baseFee],
        };
    };

    const createFee = async (data: FeeFormData, type: FeeType): Promise<boolean> => {
        const validationError = validateFeeForm(data, type);
        if (validationError) {
            toast.error(validationError);
            return false;
        }

        setSubmitLoading(true);
        try {
            const endpoint =
                type === "collection"
                    ? `/operations/merchants/${businessId}/updatefee`
                    : `/operations/merchants-payout/${businessId}/updatefee`;

            const payload = buildFeePayload(data, type);

            const res = await axiosInstance.post(endpoint, payload, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (res.data.status) {
                toast.success(res.data.message || "Fee created successfully");
                await fetchFees();
                return true;
            } else {
                toast.error(res.data.message || "Failed to create fee");
                return false;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "An error occurred");
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    const updateFee = async (data: FeeFormData, type: FeeType): Promise<boolean> => {
        return createFee(data, type); // Same endpoint handles both create and update
    };

    return {
        collectionFees,
        payoutFees,
        loading,
        submitLoading,
        fetchFees,
        createFee,
        updateFee,
    };
};
