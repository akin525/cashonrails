"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { FiUpload, FiCheckCircle, FiX } from "react-icons/fi";
import { useAuth } from "@/contexts/authContext";

const documentTypes = [
  { key: "proof_of_address", label: "Proof of Address" },
  { key: "idcard", label: "Means of ID" },
  { key: "cac", label: "Certificate of Incorporation" },
  { key: "memart", label: "Memorandum & Articles of Association" },
  { key: "status_report", label: "Status Report" },
  { key: "schuml", label: "Schuml Certificate" },
  { key: "glea", label: "Gazette/Law establishing Agency" },
  { key: "aga", label: "Accountant General Approval" },
];

const Page = ({ params }: { params: { id: string } }) => {
  const businessId = params.id;
  const { authState } = useAuth();

  const [uploadedDocs, setUploadedDocs] = useState<{
    [key: string]: { id: string; url: string };
  }>({});
  const [loadingDocs, setLoadingDocs] = useState<{ [key: string]: boolean }>({});
  const [finalizing, setFinalizing] = useState(false);
  const [proofAddressName, setProofAddressName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, typeKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingDocs((prev) => ({ ...prev, [typeKey]: true }));

    const formData = new FormData();
    formData.append("type", "kyc");
    formData.append("file", file);

    try {
      const res = await axiosInstance.post(`/file-upload/${businessId}`, formData, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUploadedDocs((prev) => ({
          ...prev,
          [typeKey]: { id: String(res.data.data.id), url: res.data.data.file },
        }));
        toast.success(`${typeKey} uploaded successfully`);
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload error");
    } finally {
      setLoadingDocs((prev) => ({ ...prev, [typeKey]: false }));
    }
  };

  const handleRemove = (typeKey: string) => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[typeKey];
      return copy;
    });
  };

  const handleSubmit = async () => {
    setFinalizing(true);
    try {
      const payload: any = {};
      for (const key of Object.keys(uploadedDocs)) {
        payload[key] = uploadedDocs[key].id;
      }
      if (proofAddressName && payload["proof_of_address"]) {
        payload["proof_of_address_name"] = proofAddressName;
      }

      const res = await axiosInstance.post(`/upload-merchant-kyc/${businessId}`, payload, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (res.data.status) {
        toast.success("Documents submitted successfully!");
        setUploadedDocs({});
        setProofAddressName("");
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Error finalizing KYC");
    } finally {
      setFinalizing(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Upload KYC Documents</h1>

        <div className="space-y-6">
          {documentTypes.map((doc) => (
              <div
                  key={doc.key}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow transition duration-300 hover:shadow-lg"
              >
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">{doc.label}</label>

                {doc.key === "proof_of_address" && (
                    <input
                        type="text"
                        placeholder="Enter address description (optional)"
                        value={proofAddressName}
                        onChange={(e) => setProofAddressName(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}

                <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, doc.key)}
                    className="mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />

                <div className="flex items-center gap-3 text-sm">
                  {uploadedDocs[doc.key] ? (
                      <>
                        <a
                            href={uploadedDocs[doc.key].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 underline"
                        >
                          Preview
                        </a>
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                    <FiCheckCircle className="mr-1" /> Uploaded (ID: {uploadedDocs[doc.key].id})
                  </span>
                        <button
                            onClick={() => handleRemove(doc.key)}
                            className="text-red-500 dark:text-red-400 flex items-center gap-1 hover:text-red-600 dark:hover:text-red-500 transition"
                        >
                          <FiX /> Remove
                        </button>
                      </>
                  ) : loadingDocs[doc.key] ? (
                      <span className="text-blue-500 dark:text-blue-400 animate-pulse">Uploading...</span>
                  ) : (
                      <span className="text-gray-500 dark:text-gray-400">Not uploaded</span>
                  )}
                </div>
              </div>
          ))}
        </div>

        <button
            onClick={handleSubmit}
            disabled={finalizing || Object.keys(uploadedDocs).length === 0}
            className={`w-full mt-8 py-3 rounded-lg font-semibold flex justify-center items-center gap-2 transition ${
                finalizing || Object.keys(uploadedDocs).length === 0
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            }`}
        >
          {finalizing ? "Submitting..." : <FiUpload />}
          Submit KYC Documents
        </button>
      </div>
  );
};

export default Page;
