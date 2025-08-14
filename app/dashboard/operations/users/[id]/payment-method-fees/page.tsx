"use client"
import { FormSelect } from '@/components/formInputs/formInputs';
import Table, { Column } from '@/components/table';
import { useUI } from '@/contexts/uiContext';
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/helpers/axiosInstance';
import { useAuth } from '@/contexts/authContext';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://your-api-url.com';

interface MerchantData {
    id: string;
    currency: string;
    feeType: string;
    value: string;
    capValue: string;
    isEditing: boolean;
}

interface FeeSectionProps {
    title: string;
    data: MerchantData[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string, field: 'value' | 'capValue') => void;
    onSelectChange: (id: string, field: 'feeType', value: string) => void;
    onEdit: (id: string) => void;
    onSave: (id: string) => void;
    onCancel: (id: string) => void;
    columns: Column<MerchantData>[];
    currencyOptions: { label: string; value: string }[];
    defaultCurrency: string;
}

const FeeSection: React.FC<FeeSectionProps> = ({
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
}) => {
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
            <Table<MerchantData>
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
    const [collectionFeeData, setCollectionFeeData] = useState<MerchantData[]>([]);
    const [payoutFeeData, setPayoutFeeData] = useState<MerchantData[]>([]);
    const { authState } = useAuth();

    const MERCHANT_DATA_COLUMNS: Column<MerchantData>[] = [
        { id: "currency", label: "CURRENCY" },
        {
            id: "feeType", label: "FEE TYPE",
            type: "custom",
            renderCustom: (row: MerchantData) => (
                row.isEditing ? (
                    <FormSelect
                        name={''}
                        placeholder={{
                            label: row.feeType,
                            value: row.feeType,
                        }}
                        getValue={(value) => handleSelectChange(row.id, 'feeType', value.toString(), 'collection')}
                        options={[
                            { label: "Percentage", value: "Percentage" },
                            { label: "Flat Fee", value: "Flat Fee" },
                        ]}
                    />
                ) : (
                    <span>{row.feeType}</span>
                )
            ),
        },
        {
            id: "value",
            label: "VALUE",
            type: "custom",
            renderCustom: (row: MerchantData) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.value}
                        onChange={(e) => handleChange(e, row.id, 'value', 'collection')}
                    />
                ) : (
                    <span>{row.value}</span>
                )
            ),
        },
        {
            id: "capValue",
            label: "CAP VALUE",
            type: "custom",
            renderCustom: (row: MerchantData) => (
                row.isEditing ? (
                    <input
                        type="text"
                        className="border px-2 py-2.5 rounded"
                        value={row.capValue}
                        onChange={(e) => handleChange(e, row.id, 'capValue', 'collection')}
                    />
                ) : (
                    <span>{row.capValue}</span>
                )
            ),
        },
        {
            id: "id",
            label: "ACTIONS",
            type: "custom",
            renderCustom: (row: MerchantData) => (
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: string,
        field: 'value' | 'capValue',
        type: 'collection' | 'payout'
    ) => {
        const updatedValue = e.target.value;
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
        field: 'feeType',
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
            if (type === 'collection') {
                const updatedData = collectionFeeData.map((data) =>
                    data.id === id ? { ...data, isEditing: false } : data
                );
                setCollectionFeeData(updatedData);
                await axiosInstance.post(`/collection-fees`, updatedData, {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
                toast.success('Collection fees updated successfully!');
            } else {
                const updatedData = payoutFeeData.map((data) =>
                    data.id === id ? { ...data, isEditing: false } : data
                );
                setPayoutFeeData(updatedData);
                await axiosInstance.post(`${API_BASE_URL}/api/payout-fees`, updatedData, {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
                toast.success('Payout fees updated successfully!');
            }
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

        // Mock data for Collection Fees
        const initialCollectionFeeData: MerchantData[] = [
            { currency: "Local Cards", feeType: "Percentage", capValue: "1,300", id: "1", value: "5", isEditing: false },
            { currency: "International Cards", feeType: "Percentage", capValue: "2,500", id: "2", value: "3.5", isEditing: false },
            { currency: "Bank Transfer", feeType: "Flat Fee", capValue: "100", id: "3", value: "50", isEditing: false },
            { currency: "USSD", feeType: "Percentage", capValue: "500", id: "4", value: "2", isEditing: false },
            { currency: "Mobile Money", feeType: "Percentage", capValue: "1,000", id: "5", value: "1.5", isEditing: false },
        ];

        // Mock data for Payout Fees
        const initialPayoutFeeData: MerchantData[] = [
            { currency: "Local Bank Accounts", feeType: "Flat Fee", capValue: "100", id: "6", value: "50", isEditing: false },
            { currency: "International Bank Accounts", feeType: "Percentage", capValue: "1,000", id: "7", value: "1.5", isEditing: false },
        ];

        setCollectionFeeData(initialCollectionFeeData);
        setPayoutFeeData(initialPayoutFeeData);

        return () => setShowHeader(false);
    }, [setShowHeader]);

    return (
        <div className="max-w-5xl p-2">
            <FeeSection
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

            <FeeSection
                title="Payout Fees"
                data={payoutFeeData}
                onChange={(e, id, field) => handleChange(e, id, field, 'payout')}
                onSelectChange={(id, field, value) => handleSelectChange(id, field, value, 'payout')}
                onEdit={(id) => handleEdit(id, 'payout')}
                onSave={(id) => handleSave(id, 'payout')}
                onCancel={(id) => handleCancel(id, 'payout')}
                columns={MERCHANT_DATA_COLUMNS}
                currencyOptions={[{ label: "USD", value: "usd" }]}
                defaultCurrency="USD"
            />
        </div>
    );
};

export default Page;