"use client";
import { FormSelect } from '@/components/formInputs/formInputs';
import Table, { Column } from '@/components/table';
import { useUI } from '@/contexts/uiContext';
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/helpers/axiosInstance';
import { useAuth } from '@/contexts/authContext';
import toast from 'react-hot-toast';
import { StringUtils } from '@/helpers/extras';

interface FeeData {
    id: string;
    business_id: number;
    currency: string;
    fee: string;
    fee_cap?: string; // Only for collection_fee
    fee_type: "percent" | "flat";
    status: string;
    created_at: string;
    updated_at: string;
    isEditing: boolean;
}

interface PayoutFee extends FeeData {
    range_set: string;
    min_fee: string;
    max_fee: string;
}

interface ApiResponse {
    collection_fee: FeeData[];
    payout_fee: PayoutFee[];
}

interface FeeSectionProps<T extends FeeData | PayoutFee> {
    title: string;
    data: T[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string, field: keyof T) => void;
    onSelectChange: (id: string, field: keyof T, value: string) => void;
    onEdit: (id: string) => void;
    onSave: (id: string) => void;
    onCancel: (id: string) => void;
    columns: Column<T>[];
    currencyOptions: { label: string; value: string }[];
    defaultCurrency: string;
}

const FeeSection = <T extends FeeData | PayoutFee>({
    title,
    data,
    onChange,
    onSelectChange,
    onEdit,
    onSave,
    onCancel,
    columns,
    currencyOptions,
    defaultCurrency,
}: FeeSectionProps<T>) => {
    return (
        <div>
            <div className="flex items-center justify-between gap-2 mt-10 mb-5">
                <p className="font-medium text-xl">{title}</p>
                <div className="flex items-center gap-2">
                    <FormSelect
                        name={''}
                        defaultValue={defaultCurrency}
                        placeholder={{
                            label: defaultCurrency,
                            value: defaultCurrency.toLowerCase(),
                        }}
                        options={currencyOptions}
                    />
                </div>
            </div>
            <Table<T>
                headers={columns}
                data={data}
                limit={20}
                showPagination={false}
            />
        </div>
    );
};

const Page = () => {
    const { setShowHeader } = useUI();
    const [collectionFeeData, setCollectionFeeData] = useState<FeeData[]>([]);
    const [payoutFeeData, setPayoutFeeData] = useState<PayoutFee[]>([]);
    const { authState } = useAuth();
    const [loading, setLoading] = useState(true);

    const MERCHANT_DATA_COLUMNS: Column<FeeData>[] = [
        { id: "currency", label: "CURRENCY" },
        {
            id: "fee_type", label: "FEE TYPE",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <FormSelect
                        name={''}
                        placeholder={{
                            label: StringUtils.capitalizeWords(row.fee_type),
                            value: row.fee_type,
                        }}
                        getValue={(value) => handleSelectChange(row.id, 'fee_type', value.toString(), 'collection')}
                        options={[
                            { label: "Percent", value: "percent" },
                            { label: "Flat", value: "flat" },
                        ]}
                    />
                ) : (
                    <span>{row.fee_type}</span>
                )
            ),
        },
        {
            id: "status", label: "STATUS",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <FormSelect
                        name={''}
                        placeholder={{
                            label: StringUtils.capitalizeWords(row.status.toString() === "1" ? "active" : row.status.toString() === "0" ? "inactive" : row.status.toString()),
                            value: row.status,
                        }}
                        getValueOnChange={({value})=> handleSelectChange(row.id, 'status', value.toString(), 'collection')}
                        // getValue={(value) => handleSelectChange(row.id, 'status', value.toString(), 'collection')}
                        options={[
                            { label: "Active", value: "1" },
                            { label: "Inactive", value: "0" },
                        ]}
                    />
                ) : (
                    <span>{StringUtils.capitalizeWords(row.status.toString() === "1" ? "active" : row.status.toString() === "0" ? "inactive" : row.status.toString())}</span>
                    // <span>{row.status.toString()}</span>
                )
            ),
        },
        {
            id: "fee",
            label: "FEE",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.fee}
                        onChange={(e) => handleChange(e, row.id, 'fee', 'collection')}
                    />
                ) : (
                    <span>{row.fee}</span>
                )
            ),
        },
        {
            id: "fee_cap",
            label: "FEE CAP",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.fee_cap}
                        onChange={(e) => handleChange(e, row.id, 'fee_cap', 'collection')}
                    />
                ) : (
                    <span>{StringUtils.formatWithCommas(row.fee_cap?.toString() ?? '')}</span>
                )
            ),
        },
        {
            id: "id",
            label: "ACTIONS",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSave(row.id, 'collection')}
                            className="px-2 py-1 text-sm text-white bg-green-500 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => handleCancel(row.id, 'collection')}
                            className="px-2 py-1 text-sm text-red-500 bg-red-100 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(row.id, 'collection')}
                        className="px-2 py-1 text-sm text-blue-500 bg-blue-100 rounded"
                    >
                        Edit
                    </button>
                )
            ),
        },
    ];

    const PAYOUT_FEE_COLUMNS: Column<PayoutFee>[] = [
        { id: "currency", label: "CURRENCY" },
        {
            id: "fee_type", label: "FEE TYPE",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <FormSelect
                        name={''}
                        placeholder={{
                            label: StringUtils.capitalizeWords(row.fee_type),
                            value: row.fee_type,
                        }}
                        getValue={(value) => handleSelectChange(row.id, 'fee_type', value.toString(), 'payout')}
                        options={[
                            { label: "Percent", value: "percent" },
                            { label: "Flat", value: "flat" },
                        ]}
                    />
                ) : (
                    <span>{row.fee_type}</span>
                )
            ),
        },
        {
            id: "status", label: "STATUS",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <FormSelect
                        name={''}
                        placeholder={{
                            label: StringUtils.capitalizeWords(row.status.toString() === "1" ? "active" : row.status.toString() === "0" ? "inactive" : row.status.toString()),
                            value: row.status,
                        }}
                        getValue={(value) => handleSelectChange(row.id, 'status', value.toString(), 'payout')}
                        options={[
                            { label: "Active", value: 1 },
                            { label: "Inactive", value: 0 },
                        ]}
                    />
                ) : (
                    <span>{StringUtils.capitalizeWords(row.status.toString() === "1" ? "active" : row.status.toString() === "0" ? "inactive" : row.status.toString())}</span>
                )
            ),
        },
        {
            id: "fee",
            label: "FEE",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.fee}
                        onChange={(e) => handleChange(e, row.id, 'fee', 'payout')}
                    />
                ) : (
                    <span>{row.fee}</span>
                )
            ),
        },
        {
            id: "range_set",
            label: "RANGE SET",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.range_set}
                        onChange={(e) => handleChange(e, row.id, 'range_set', 'payout')}
                    />
                ) : (
                    <span>{row.range_set}</span>
                )
            ),
        },
        {
            id: "min_fee",
            label: "MIN FEE",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.min_fee}
                        onChange={(e) => handleChange(e, row.id, 'min_fee', 'payout')}
                    />
                ) : (
                    <span>{row.min_fee}</span>
                )
            ),
        },
        {
            id: "max_fee",
            label: "MAX FEE",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.max_fee}
                        onChange={(e) => handleChange(e, row.id, 'max_fee', 'payout')}
                    />
                ) : (
                    <span>{row.max_fee}</span>
                )
            ),
        },
        {
            id: "fee_cap",
            label: "FEE CAP",
            type: "custom",
            renderCustom: (row: FeeData) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.fee_cap}
                        onChange={(e) => handleChange(e, row.id, 'fee_cap', 'payout')}
                    />
                ) : (
                    <span>{StringUtils.formatWithCommas(row.fee_cap?.toString() ?? '')}</span>
                )
            ),
        },
        {
            id: "id",
            label: "ACTIONS",
            type: "custom",
            renderCustom: (row: PayoutFee) => (
                row.isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSave(row.id, 'payout')}
                            className="px-2 py-1 text-sm text-white bg-green-500 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => handleCancel(row.id, 'payout')}
                            className="px-2 py-1 text-sm text-red-500 bg-red-100 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(row.id, 'payout')}
                        className="px-2 py-1 text-sm text-blue-500 bg-blue-100 rounded"
                    >
                        Edit
                    </button>
                )
            ),
        },
    ];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: string,
        field: keyof FeeData | keyof PayoutFee,
        type: 'collection' | 'payout'
    ) => {
        const updatedValue = e.target.value; // Always a string

        if (type === 'collection') {
            setCollectionFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, [field]: updatedValue } : data
                )
            );
        } else {
            setPayoutFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, [field]: updatedValue } : data
                )
            );
        }
    };

    const handleSelectChange = (
        id: string,
        field: keyof FeeData | keyof PayoutFee,
        value: string,
        type: 'collection' | 'payout'
    ) => {
        if (type === 'collection') {
            setCollectionFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, [field]: value } : data
                )
            );
        } else {
            setPayoutFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, [field]: value } : data
                )
            );
        }
    };

    const handleEdit = (id: string, type: 'collection' | 'payout') => {
        if (type === 'collection') {
            setCollectionFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, isEditing: true } : { ...data, isEditing: false }
                )
            );
        } else {
            setPayoutFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, isEditing: true } : { ...data, isEditing: false }
                )
            );
        }
    };

    const handleSave = async (id: string, type: 'collection' | 'payout') => {
        try {
            if (!authState.token) return;

            const isCollection = type === 'collection';
            const dataState = isCollection ? collectionFeeData : payoutFeeData;
            const updatedItem = dataState.find((data) => data.id === id);
            console.log("updatedItem", updatedItem)
            if (!updatedItem) return;

            setCollectionFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, isEditing: false } : data
                )
            );

            const feeData = isCollection ? {
                currency: updatedItem.currency,
                fee: Number(updatedItem.fee) ?? 10.5,
                fee_cap: Number(updatedItem.fee_cap) ?? 100,
                fee_type: updatedItem.fee_type ?? "fixed",
                status: updatedItem.status,
            } : {
                currency: updatedItem.currency,
                fee: Number(updatedItem.fee) ?? 10.5,
                range_set: (updatedItem as PayoutFee).range_set,
                min_fee: Number((updatedItem as PayoutFee).min_fee) ?? 0,
                max_fee: Number((updatedItem as PayoutFee).max_fee) ?? 0,
                fee_type: updatedItem.fee_type ?? "fixed",
                status: updatedItem.status,
                fee_cap: Number(updatedItem.fee_cap) ?? 100,
            };

            await axiosInstance.post(
                `/growth/update-singlefee`,
                {
                    id,
                    feetype: isCollection ? 'collection_fee' : 'payout_fee',
                    fees: feeData,
                },
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} fees updated successfully!`);
        } catch (error) {
            toast.error(`Failed to update ${type} fees.`);
            console.error(error);
        }
    };

    const handleCancel = (id: string, type: 'collection' | 'payout') => {
        if (type === 'collection') {
            setCollectionFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, isEditing: false } : data
                )
            );
        } else {
            setPayoutFeeData((prev) =>
                prev.map((data) =>
                    data.id === id ? { ...data, isEditing: false } : data
                )
            );
        }
    };

    useEffect(() => {
        setShowHeader(false);
        return () => setShowHeader(false);
    }, [setShowHeader]);

    useEffect(() => {
        const fetchFees = async () => {
            if (!authState.token) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get<ApiResponse>('/growth/defaultfee',
                    {
                        headers: {
                            Authorization: `Bearer ${authState.token}`
                        }
                    }
                );
                if (response.data.status && response.data.data) {
                    const { collection_fee, payout_fee } = response.data.data;
                    setCollectionFeeData(
                        collection_fee.map((fee: any) => ({
                            ...fee,
                            isEditing: false,
                        }))
                    );
                    setPayoutFeeData(
                        payout_fee.map((fee: any) => ({
                            ...fee,
                            isEditing: false,
                        }))
                    );
                    toast.success('Fees fetched successfully');
                } else {
                    toast.error('Failed to fetch fees');
                }
            } catch (error) {
                console.error('Error fetching fees:', error);
                toast.error('An error occurred while fetching fees');
            } finally {
                setLoading(false);
            }
        };

        fetchFees();
    }, [authState.token]);

    if (loading) return <p>Loading fees</p>;

    return (
        <div className="max-w-5xl p-2">
            <FeeSection<FeeData>
                title="Collection Fees"
                data={collectionFeeData}
                onChange={(e, id, field) => handleChange(e, id, field, 'collection')}
                onSelectChange={(id, field, value) => handleSelectChange(id, field, value, 'collection')}
                onEdit={(id) => handleEdit(id, 'collection')}
                onSave={(id) => handleSave(id, 'collection')}
                onCancel={(id) => handleCancel(id, 'collection')}
                columns={MERCHANT_DATA_COLUMNS}
                currencyOptions={[{ label: "NGN", value: "ngn" }]}
                defaultCurrency="NGN"
            />

            <FeeSection<PayoutFee>
                title="Payout Fees"
                data={payoutFeeData}
                onChange={(e, id, field) => handleChange(e, id, field, 'payout')}
                onSelectChange={(id, field, value) => handleSelectChange(id, field, value, 'payout')}
                onEdit={(id) => handleEdit(id, 'payout')}
                onSave={(id) => handleSave(id, 'payout')}
                onCancel={(id) => handleCancel(id, 'payout')}
                columns={PAYOUT_FEE_COLUMNS}
                currencyOptions={[{ label: "USD", value: "usd" }]}
                defaultCurrency="USD"
            />
        </div>
    );
};

export default Page;