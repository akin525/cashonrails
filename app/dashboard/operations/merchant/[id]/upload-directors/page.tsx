"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { FiPlus, FiUpload, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/contexts/authContext";

const idTypeOptions = [
  "National ID",
  "Driver's License",
  "International Passport",
  "Voter's Card",
];

const Page = ({ params }: { params: { id: string } }) => {
  const businessId = params.id;
  const { authState } = useAuth();

  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addDirector = () => {
    setDirectors((prev) => [
      ...prev,
      {
        firstname: "",
        lastname: "",
        id_type: "",
        bvn: "",
        dob: "",
        id_file: "",
        id_file_url: "",
        fileUploading: false,
      },
    ]);
  };

  const removeDirector = (index: number) => {
    setDirectors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    setDirectors((prev) =>
        prev.map((dir, i) => (i === index ? { ...dir, [field]: value } : dir))
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleChange(index, "fileUploading", true);

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
        handleChange(index, "id_file", String(res.data.data.id));
        handleChange(index, "id_file_url", res.data.data.file);
        toast.success("ID uploaded successfully");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload error");
    } finally {
      handleChange(index, "fileUploading", false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        directors: directors.map((dir) => ({
          firstname: dir.firstname,
          lastname: dir.lastname,
          id_type: dir.id_type,
          id_file: dir.id_file,
          bvn: dir.bvn,
          dob: dir.dob,
        })),
      };

      const res = await axiosInstance.post(`/create-directors/${businessId}`, payload, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (res.data.status) {
        toast.success("Directors submitted successfully!");
        setDirectors([]);
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Error submitting directors");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Add Directors</h1>

        <div className="space-y-6">
          {directors.map((dir, index) => (
              <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow transition duration-300 hover:shadow-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                      type="text"
                      placeholder="First Name"
                      value={dir.firstname}
                      onChange={(e) => handleChange(index, "firstname", e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="text"
                      placeholder="Last Name"
                      value={dir.lastname}
                      onChange={(e) => handleChange(index, "lastname", e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="text"
                      placeholder="BVN (11 digits)"
                      value={dir.bvn}
                      onChange={(e) => handleChange(index, "bvn", e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="date"
                      placeholder="Date of Birth"
                      value={dir.dob}
                      onChange={(e) => handleChange(index, "dob", e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                      value={dir.id_type}
                      onChange={(e) => handleChange(index, "id_type", e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select ID Type</option>
                    {idTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, index)}
                    className="mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />

                {dir.fileUploading ? (
                    <p className="text-blue-500 dark:text-blue-400 animate-pulse text-sm">Uploading ID...</p>
                ) : dir.id_file_url ? (
                    <a
                        href={dir.id_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 dark:text-green-400 underline text-sm"
                    >
                      Preview Uploaded ID
                    </a>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No ID uploaded</p>
                )}

                <button
                    onClick={() => removeDirector(index)}
                    className="mt-3 flex items-center text-red-500 dark:text-red-400 text-sm hover:text-red-600 dark:hover:text-red-500 transition"
                >
                  <FiTrash2 className="mr-1" /> Remove Director
                </button>
              </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
              onClick={addDirector}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            <FiPlus /> Add Director
          </button>
          <button
              onClick={handleSubmit}
              disabled={loading || directors.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                  loading || directors.length === 0
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              }`}
          >
            {loading ? "Submitting..." : <FiUpload />}
            Submit Directors
          </button>
        </div>
      </div>
  );
};

export default Page;
