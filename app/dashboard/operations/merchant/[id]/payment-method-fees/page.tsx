"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/contexts/uiContext";
import { useFees } from "@/hooks/useFees";
import Modal from "@/components/modal";
import { FeeForm } from "@/components/fees/FeeForm";
import { FeeSection } from "@/components/fees/FeeSection";
import { INITIAL_FEE_FORM } from "@/constants/fee.constants";
import type { FeeFormData, FeeType, MerchantFeeData } from "@/types/fee.types";

interface PageProps {
    params: { id: string };
}

const FeesPage: React.FC<PageProps> = ({ params }) => {
    const { setShowHeader } = useUI();
    const businessId = params.id;

    const {
        collectionFees,
        payoutFees,
        loading,
        submitLoading,
        fetchFees,
        createFee,
        updateFee,
    } = useFees(businessId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<FeeType>("collection");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<FeeFormData>(INITIAL_FEE_FORM);

    useEffect(() => {
        setShowHeader(false);
        fetchFees();
    }, []);

    const handleCreateClick = (type: FeeType) => {
        setFormData(INITIAL_FEE_FORM);
        setModalType(type);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditClick = (fee: MerchantFeeData, type: FeeType) => {
        setFormData({
            id: fee.id,
            currency: fee.currency,
            fee_type: fee.fee_type,
            fee: fee.fee,
            fee_cap: (fee as any).fee_cap || "",
            range_set: (fee as any).range_set || "",
            min_fee: (fee as any).min_fee || "",
            max_fee: (fee as any).max_fee || "",
        });
        setModalType(type);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const success = isEditing
            ? await updateFee(formData, modalType)
            : await createFee(formData, modalType);

        if (success) {
            setIsModalOpen(false);
            setFormData(INITIAL_FEE_FORM);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Fee Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Configure collection and payout fees for merchant: {businessId}
                    </p>
                </div>

                {/* Collection Fees */}
                <FeeSection
                    title="Collection Fees"
                    type="collection"
                    data={collectionFees}
                    loading={loading}
                    onCreateClick={() => handleCreateClick("collection")}
                    onEditClick={(fee) => handleEditClick(fee, "collection")}
                />

                {/* Payout Fees */}
                <FeeSection
                    title="Payout Fees"
                    type="payout"
                    data={payoutFees}
                    loading={loading}
                    onCreateClick={() => handleCreateClick("payout")}
                    onEditClick={(fee) => handleEditClick(fee, "payout")}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal isOpen onClose={() => setIsModalOpen(false)}>
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            {isEditing ? "Edit" : "Create"} {modalType === "collection" ? "Collection" : "Payout"} Fee
                        </h2>
                        <FeeForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            loading={submitLoading}
                            isEditing={isEditing}
                            type={modalType}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FeesPage;
