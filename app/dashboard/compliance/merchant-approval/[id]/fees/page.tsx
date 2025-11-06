"use client"

import { useState, useEffect } from "react";
import { FormSelect } from "@/components/formInputs/formInputs";
// import Modal from "@/components/Modal";
import axiosInstance from "@/helpers/axiosInstance";
import {useAuth} from "@/contexts/authContext";

const Page = ({ params }: { params: { id: string } }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const { authState } = useAuth();

    // Fetch merchant's existing fees
    useEffect(() => {
        const fetchFees = async () => {
            // Add guard clause to prevent API call when token is not available
            if (!authState.token) return;

            setLoading(true);
            try {
                const response = await axiosInstance.get(`/operations/merchant-fee/${params.id}`, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                const data = response.data;
                setFees(response.data.data || []);
            } catch (error) {
                console.error("Error fetching fees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFees();
    }, [authState.token, params.id]); // Added missing dependencies

    // Open modal for creating or editing fees
    const openModal = (fee = null) => {
        setModalData(fee);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    // Handle form submission (create or edit fee)
    // const handleSubmit = async (formData) => {
    //     try {
    //         const method = modalData ? "PUT" : "POST";
    //         const url = modalData ? `/api/merchant/fees/${modalData.id}` : "/api/merchant/fees";
    //
    //         const response = await fetch(url, {
    //             method,
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(formData),
    //         });
    //
    //         const updatedFee = await response.json();
    //
    //         if (modalData) {
    //             // Update the edited fee in state
    //             setFees((prevFees) =>
    //                 prevFees.map((fee) => (fee.id === updatedFee.id ? updatedFee : fee))
    //             );
    //         } else {
    //             // Add new fee to state
    //             setFees([...fees, updatedFee]);
    //         }
    //     } catch (error) {
    //         console.error("Error saving fee:", error);
    //     } finally {
    //         closeModal();
    //     }
    // };

    return (
        <div>
            {/*{loading ? (*/}
            {/*    <p>Loading...</p>*/}
            {/*) : (*/}
            {/*    <>*/}
            {/*        /!* Create Fee Button *!/*/}
            {/*        <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded mb-4">*/}
            {/*            Create Collection Fee*/}
            {/*        </button>*/}

            {/*        {fees.length > 0 ? (*/}
            {/*            <table className="w-full border-collapse border border-gray-300">*/}
            {/*                <thead>*/}
            {/*                <tr className="bg-gray-200">*/}
            {/*                    <th className="border p-2">Payment Method</th>*/}
            {/*                    <th className="border p-2">Fee Type</th>*/}
            {/*                    <th className="border p-2">Value</th>*/}
            {/*                    <th className="border p-2">Cap Value</th>*/}
            {/*                    <th className="border p-2">Actions</th>*/}
            {/*                </tr>*/}
            {/*                </thead>*/}
            {/*                <tbody>*/}
            {/*                {fees.map((fee) => (*/}
            {/*                    <tr key={fee.id}>*/}
            {/*                        <td className="border p-2">{fee.paymentMethod}</td>*/}
            {/*                        <td className="border p-2">{fee.feeType}</td>*/}
            {/*                        <td className="border p-2">{fee.value}</td>*/}
            {/*                        <td className="border p-2">{fee.capValue}</td>*/}
            {/*                        <td className="border p-2">*/}
            {/*                            <button*/}
            {/*                                onClick={() => openModal(fee)}*/}
            {/*                                className="bg-yellow-500 text-white p-2 rounded"*/}
            {/*                            >*/}
            {/*                                Edit*/}
            {/*                            </button>*/}
            {/*                        </td>*/}
            {/*                    </tr>*/}
            {/*                ))}*/}
            {/*                </tbody>*/}
            {/*            </table>*/}
            {/*        ) : (*/}
            {/*            <p>No fees available.</p>*/}
            {/*        )}*/}
            {/*    </>*/}
            {/*)}*/}

        </div>
    );
};

export default Page;
