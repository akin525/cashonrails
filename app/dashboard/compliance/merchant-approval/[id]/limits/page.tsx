"use client";

import React, { useEffect, useState } from "react";
import DetailList, { DetailItem } from "@/components/detailList";
import { FormSelect } from "@/components/formInputs/formInputs";
import { useUI } from "@/contexts/uiContext";
import { CancelIcon, EditIcon } from "@/public/assets/icons";

const Page = () => {
    const { setShowHeader } = useUI();

    useEffect(() => {
        setShowHeader(false);
        return () => setShowHeader(false);
    }, [setShowHeader]);

    const [collectionItems, setCollectionItems] = useState<DetailItem[]>([
        {
            id: "1",
            label: "Transaction Count",
            value: 100000,
            type: "currency",
            editable: true,
        },
        {
            id: "2",
            label: "Minimum Transaction Amount",
            value: 200000,
            type: "currency",
        },
        {
            id: "3",
            label: "Single Transaction Limit",
            value: 100000,
            type: "currency",
        },
        {
            id: "4",
            label: "Daily Cumulative Limit",
            value: 100000,
            type: "currency",
        }
    ]);

    const [payoutItems, setPayoutItems] = useState<DetailItem[]>([
        {
            id: "1",
            label: "Transaction Count",
            value: 100000,
            type: "currency",
            editable: true,
        },
        {
            id: "2",
            label: "Minimum Transaction Amount",
            value: 200000,
            type: "currency",
        },
        {
            id: "3",
            label: "Single Transaction Limit",
            value: 100000,
            type: "currency",
        },
        {
            id: "4",
            label: "Daily Cumulative Limit",
            value: 100000,
            type: "currency",
        }
    ]);

    const [isCollectionEditing, setIsCollectionEditing] = useState(false);
    const [isPayoutEditing, setIsPayoutEditing] = useState(false);


    const handleSaveChanges = async () => {
        // Logic for saving changes
        setIsCollectionEditing(false);
    };

    const toggleCollectionEditing = () => setIsCollectionEditing((prev) => !prev);
    const togglePayoutEditing = () => setIsCollectionEditing((prev) => !prev);


    const handlePayloadUpdate = (index: number, newValue: string | number) => {
        setCollectionItems((prevItems) =>
            prevItems.map((item, i) =>
                i === index ? { ...item, value: newValue } : item
            )
        );
    };

    return (
        <div className="max-w-2xl">
            <header className="flex items-center justify-between gap-2 mt-10 mb-5">
                <h1 className="font-medium text-xl">Collection</h1>
                <div className="flex items-center gap-2">
                    {isCollectionEditing ? (
                        <>
                            <button
                                onClick={handleSaveChanges}
                                className="flex items-center border rounded-md p-2.5 gap-2 text-white bg-[#01AB79]"
                            >
                                <span className="text-sm font-medium">Save Changes</span>
                            </button>
                            <button
                                onClick={toggleCollectionEditing}
                                className="flex items-center border rounded-md p-2.5 gap-2 border-red-500 text-red-500 hover:bg-red-50"
                            >
                                <CancelIcon />
                                <span className="text-sm font-medium">Cancel</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={toggleCollectionEditing}
                                className="flex items-center border rounded-md p-2.5 gap-2 border-[#D0D5DD]"
                            >
                                <EditIcon />
                                <span className="text-sm font-medium">Edit</span>
                            </button>
                            <FormSelect
                                name=""
                                defaultValue="NGN"
                                placeholder={{ label: "NGN", value: "ngn" }}
                                options={[{ label: "NGN", value: "ngn" }]}
                            />
                        </>
                    )}
                </div>
            </header>

            <DetailList
                items={collectionItems}
                className="max-w-3xl mx-auto"
                idEditing={isCollectionEditing}
                setPayloadValues={(index, value) => handlePayloadUpdate(index, value)}
            />

            {/* payout section */}

            <header className="flex items-center justify-between gap-2 mt-10 mb-5">
                <h1 className="font-medium text-xl">Payout</h1>
                <div className="flex items-center gap-2">
                    {isPayoutEditing ? (
                        <>
                            <button
                                onClick={handleSaveChanges}
                                className="flex items-center border rounded-md p-2.5 gap-2 text-white bg-[#01AB79]"
                            >
                                <span className="text-sm font-medium">Save Changes</span>
                            </button>
                            <button
                                onClick={togglePayoutEditing}
                                className="flex items-center border rounded-md p-2.5 gap-2 border-red-500 text-red-500 hover:bg-red-50"
                            >
                                <CancelIcon />
                                <span className="text-sm font-medium">Cancel</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={togglePayoutEditing}
                                className="flex items-center border rounded-md p-2.5 gap-2 border-[#D0D5DD]"
                            >
                                <EditIcon />
                                <span className="text-sm font-medium">Edit</span>
                            </button>
                            <FormSelect
                                name=""
                                defaultValue="NGN"
                                placeholder={{ label: "NGN", value: "ngn" }}
                                options={[{ label: "NGN", value: "ngn" }]}
                            />
                        </>
                    )}
                </div>
            </header>

            <DetailList
                items={collectionItems}
                className="max-w-3xl mx-auto"
                idEditing={isPayoutEditing}
                setPayloadValues={(index, value) => handlePayloadUpdate(index, value)}
            />

        </div>
    );
};

export default Page;
