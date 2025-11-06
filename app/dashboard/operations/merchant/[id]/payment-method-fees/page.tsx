"use client";

import React, { JSX, useEffect, useState } from "react";
import { FiEdit, FiPlus, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

import Table, { Column } from "@/components/table";
import Modal from "@/components/modal";
import axiosInstance from "@/helpers/axiosInstance";
import { useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";

// Define MerchantData type
interface MerchantData {
    id: string;
    currency: string;
    fee_type: string;
    fee: string;
    fee_cap?: string;
    range_set?: string;
    min_fee?: string;
    max_fee?: string;
    isEditing?: boolean;
    actions?: JSX.Element;
}

const columns: {
    collection: Column<MerchantData>[];
    payout: Column<MerchantData>[];
} = {
    collection: [
        { id: "currency", label: "CURRENCY", type: "text" },
        { id: "fee_type", label: "FEE TYPE", type: "text" },
        { id: "fee", label: "FEE", type: "amount" },
        { id: "fee_cap", label: "CAP VALUE", type: "amount" },
        { id: "actions", label: "ACTIONS", type: "custom" },
    ],
    payout: [
        { id: "currency", label: "CURRENCY", type: "text" },
        { id: "fee_type", label: "FEE TYPE", type: "text" },
        { id: "fee", label: "FEE", type: "amount" },
        { id: "range_set", label: "RANGE SET", type: "amount" },
        { id: "min_fee", label: "MIN FEE", type: "amount" },
        { id: "max_fee", label: "MAX FEE", type: "amount" },
        { id: "actions", label: "ACTIONS", type: "custom" },
    ],
};


const currencyOptions = [
    { label: "Select Option", value: "" },
    { label: "Dedicated", value: "dedicated" },
    { label: "BANKTRANSFER", value: "BANKTRANSFER" },
    { label: "USSD", value: "USSD" },
    { label: "USDT - Crypto", value: "USDT"},
    { label: "PAYWITHBANK", value: "PAYWITHBANK" },
    { label: "PAYWITHPHONE", value: "PAYWITHPHONE" },
    { label: "USD", value: "USD" },
    { label: "NGN - Nigerian Naira", value: "NGN" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "DZD - Algerian Dinar", value: "DZD" },
    { label: "AOA - Angolan Kwanza", value: "AOA" },
    { label: "XOF - CFA Franc BCEAO (Benin, Burkina Faso, Côte d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo)", value: "XOF" },
    { label: "BWP - Botswana Pula", value: "BWP" },
    { label: "BIF - Burundian Franc", value: "BIF" },
    { label: "CVE - Cape Verdean Escudo", value: "CVE" },
    { label: "XAF - CFA Franc BEAC (Cameroon, Central African Republic, Chad, Republic of Congo, Equatorial Guinea, Gabon)", value: "XAF" },
    { label: "KMF - Comorian Franc", value: "KMF" },
    { label: "DJF - Djiboutian Franc", value: "DJF" },
    { label: "EGP - Egyptian Pound", value: "EGP" },
    { label: "ERN - Eritrean Nakfa", value: "ERN" },
    { label: "SZL - Eswatini Lilangeni", value: "SZL" },
    { label: "ETB - Ethiopian Birr", value: "ETB" },
    { label: "GMD - Gambian Dalasi", value: "GMD" },
    { label: "GHS - Ghanaian Cedi", value: "GHS" },
    { label: "GNF - Guinean Franc", value: "GNF" },
    { label: "KES - Kenyan Shilling", value: "KES" },
    { label: "LSL - Lesotho Loti", value: "LSL" },
    { label: "LRD - Liberian Dollar", value: "LRD" },
    { label: "LYD - Libyan Dinar", value: "LYD" },
    { label: "MWK - Malawian Kwacha", value: "MWK" },
    { label: "MGA - Malagasy Ariary", value: "MGA" },
    { label: "MRU - Mauritanian Ouguiya", value: "MRU" },
    { label: "MUR - Mauritian Rupee", value: "MUR" },
    { label: "MAD - Moroccan Dirham", value: "MAD" },
    { label: "MZN - Mozambican Metical", value: "MZN" },
    { label: "NAD - Namibian Dollar", value: "NAD" },
    { label: "RWF - Rwandan Franc", value: "RWF" },
    { label: "STD - São Tomé and Príncipe Dobra", value: "STD" },
    { label: "SCR - Seychellois Rupee", value: "SCR" },
    { label: "SLL - Sierra Leonean Leone", value: "SLL" },
    { label: "SOS - Somali Shilling", value: "SOS" },
    { label: "ZAR - South African Rand", value: "ZAR" },
    { label: "SSP - South Sudanese Pound", value: "SSP" },
    { label: "SDG - Sudanese Pound", value: "SDG" },
    { label: "TZS - Tanzanian Shilling", value: "TZS" },
    { label: "TND - Tunisian Dinar", value: "TND" },
    { label: "UGX - Ugandan Shilling", value: "UGX" },
    { label: "ZMW - Zambian Kwacha", value: "ZMW" },
    { label: "ZWL - Zimbabwean Dollar", value: "ZWL" },
];


const feetypeOptions = [
    { label: "Select Option", value: "" },
    { label: "Percentage", value: "percent" },
    { label: "Flat", value: "flat" },
];

const FeeForm = ({
                     formData,
                     setFormData,
                     onSubmit,
                     loading,
                     isEditing = false,
                     type,
                 }: any) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Currency</label>
                <select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    {currencyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Fee Type</label>
                <select
                    name="fee_type"
                    value={formData.fee_type}
                    onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    {feetypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Fee Value</label>
                <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {type === "collection" ? (
                <div>
                    <label className="block mb-1 font-medium text-sm text-gray-700">Cap Value</label>
                    <input
                        type="number"
                        value={formData.fee_cap || ""}
                        onChange={(e) => setFormData({ ...formData, fee_cap: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <label className="block mb-1 font-medium text-sm text-gray-700">Range Set</label>
                        <input
                            type="number"
                            value={formData.range_set || ""}
                            onChange={(e) => setFormData({ ...formData, range_set: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-sm text-gray-700">Min Fee</label>
                        <input
                            type="number"
                            value={formData.min_fee || ""}
                            onChange={(e) => setFormData({ ...formData, min_fee: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-sm text-gray-700">Max Fee</label>
                        <input
                            type="number"
                            value={formData.max_fee || ""}
                            onChange={(e) => setFormData({ ...formData, max_fee: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </>
            )}
        </div>

        <button
            onClick={onSubmit}
            disabled={loading}
            className={`w-full mt-4 py-3 rounded-md font-semibold flex justify-center items-center gap-2 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
            {loading ? "Processing..." : <FiSave />} {isEditing ? "Update" : "Save"} Fee
        </button>
    </div>
);

const Page = ({ params }: { params: { id: string } }) => {
    const { setShowHeader } = useUI();
    const { authState } = useAuth();
    const businessId = params.id;

    const [collectionFeeData, setCollectionFeeData] = useState<MerchantData[]>([]);
    const [payoutFeeData, setPayoutFeeData] = useState<MerchantData[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"collection" | "payout">("collection");

    const [modalFormData, setModalFormData] = useState<MerchantData>({
        id: "",
        currency: "",
        fee_type: "",
        fee: "",
        fee_cap: "",
        range_set: "",
        min_fee: "",
        max_fee: "",
    });

    useEffect(() => {
        setShowHeader(false);
        fetchFees();
    }, []);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/operations/merchant-fee/${businessId}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (res.data.status) {
                const { collection_fee, payout_fee } = res.data.data;

                const normalize = (fee: any): MerchantData => ({
                    id: String(fee.id),
                    currency: fee.currency,
                    fee_type: fee.fee_type,
                    fee: String(fee.fee),
                    fee_cap: fee.fee_cap || "",
                    range_set: fee.range_set || "",
                    min_fee: fee.min_fee || "",
                    max_fee: fee.max_fee || "",
                    actions: renderActions(fee, fee.fee_cap ? "collection" : "payout"),
                });

                setCollectionFeeData(collection_fee.map(normalize));
                setPayoutFeeData(payout_fee.map(normalize));
            }
        } catch {
            toast.error("Failed to fetch fee data");
        } finally {
            setLoading(false);
        }
    };

    const renderActions = (fee: MerchantData, type: "collection" | "payout") => (
        <button
            onClick={() => handleEditFee(fee, type)}
            className="text-blue-600 hover:text-blue-800"
        >
            <FiEdit />
        </button>
    );

    const handleCreateFee = (type: "collection" | "payout") => {
        setModalFormData({
            id: "",
            currency: "",
            fee_type: "",
            fee: "",
            fee_cap: "",
            range_set: "",
            min_fee: "",
            max_fee: "",
        });
        setModalType(type);
        setIsCreateModalOpen(true);
    };

    const handleEditFee = (fee: MerchantData, type: "collection" | "payout") => {
        setModalFormData({ ...fee, isEditing: true });
        setModalType(type);
        setIsEditModalOpen(true);
    };

    const handleSubmitFee = async () => {
        setSubmitLoading(true);

        // ✅ Validate fields before API call
        if (!modalFormData.currency) {
            toast.error("Please select a currency");
            setSubmitLoading(false);
            return;
        }
        if (!modalFormData.fee_type) {
            toast.error("Please select a fee type");
            setSubmitLoading(false);
            return;
        }
        if (!modalFormData.fee) {
            toast.error("Please enter a fee value");
            setSubmitLoading(false);
            return;
        }

        if (modalType === "collection") {
            if (modalFormData.fee_cap === "") {
                toast.error("Please enter a cap value");
                setSubmitLoading(false);
                return;
            }
        } else {
            if (modalFormData.range_set === "") {
                toast.error("Please enter range set");
                setSubmitLoading(false);
                return;
            }
            if (modalFormData.min_fee === "") {
                toast.error("Please enter min fee");
                setSubmitLoading(false);
                return;
            }
            if (modalFormData.max_fee === "") {
                toast.error("Please enter max fee");
                setSubmitLoading(false);
                return;
            }
        }

        try {
            const base: any = {
                currency: modalFormData.currency,
                fee_type: modalFormData.fee_type,
                fee: parseFloat(modalFormData.fee),
                status: 1,
            };

            if (modalType === "collection") {
                Object.assign(base, { fee_cap: parseFloat(modalFormData.fee_cap || "0") });
            } else {
                Object.assign(base, {
                    fee_type: modalFormData.fee_type,
                    range_set: parseFloat(modalFormData.range_set || "0"),
                    min_fee: parseFloat(modalFormData.min_fee || "0"),
                    max_fee: parseFloat(modalFormData.max_fee || "0"),
                });
            }

            const payload = {
                business_id: businessId,
                fees: [base],
            };

            // ✅ Use correct endpoint for each type
            let endpoint = "";
            if (modalType === "collection") {
                endpoint = `/operations/merchants/${businessId}/updatefee`;
            } else {
                endpoint = `/operations/merchants-payout/${businessId}/updatefee`;
            }

            const res = await axiosInstance.post(endpoint, payload, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (res.data.status) {
                toast.success(res.data.message);
                await fetchFees();
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (err: any) {
            toast.error(err.message || "Error occurred");
        } finally {
            setSubmitLoading(false);
        }
    };


    return (
        <div className="max-w-6xl mx-auto p-4">
            {["collection", "payout"].map((type) => (
                <div key={type} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold capitalize">{type} Fees</h2>
                        <button
                            onClick={() => handleCreateFee(type as "collection" | "payout")}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                        >
                            <FiPlus /> Create
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <Table
                            headers={columns[type as "collection" | "payout"]}
                            data={type === "collection" ? collectionFeeData : payoutFeeData}
                            limit={10}
                        />
                    )}
                </div>
            ))}

            {(isCreateModalOpen || isEditModalOpen) && (
                <Modal
                    isOpen
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">{modalFormData.isEditing ? "Edit" : "Create"} {modalType} Fee</h2>
                    <FeeForm
                        formData={modalFormData}
                        setFormData={setModalFormData}
                        onSubmit={handleSubmitFee}
                        loading={submitLoading}
                        isEditing={modalFormData.isEditing}
                        type={modalType}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Page;
