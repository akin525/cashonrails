"use client";

import React, { useState, useRef } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import {
  Upload,
  FileText,
  CheckCircle,
  X,
  Eye,
  Download,
  AlertCircle,
  Shield,
  Building,
  FileCheck,
  Loader2,
  Info,
  Camera,
  Paperclip,
  Send,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface UploadedDoc {
  id: string;
  url: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}

interface DocumentType {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
  acceptedFormats: string[];
  maxSize: string;
}

const documentTypes: DocumentType[] = [
  {
    key: "proof_of_address",
    label: "Proof of Address",
    description: "Utility bill, bank statement, or official document showing business address",
    icon: Building,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "5MB"
  },
  {
    key: "idcard",
    label: "Means of Identification",
    description: "Valid government-issued ID (National ID, Driver's License, Passport)",
    icon: Shield,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "5MB"
  },
  {
    key: "cac",
    label: "Certificate of Incorporation",
    description: "Official CAC certificate of incorporation",
    icon: FileCheck,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "10MB"
  },
  {
    key: "memart",
    label: "Memorandum & Articles of Association",
    description: "Company's memorandum and articles of association",
    icon: FileText,
    required: false,
    acceptedFormats: ["PDF"],
    maxSize: "10MB"
  },
  {
    key: "status_report",
    label: "Status Report",
    description: "Current company status report from CAC",
    icon: FileCheck,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "5MB"
  },
  {
    key: "schuml",
    label: "Schuml Certificate",
    description: "Special Control Unit on Money Laundering certificate",
    icon: Shield,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "5MB"
  },
  {
    key: "glea",
    label: "Gazette/Law Establishing Agency",
    description: "Official gazette or law establishing the agency",
    icon: FileText,
    required: false,
    acceptedFormats: ["PDF"],
    maxSize: "10MB"
  },
  {
    key: "aga",
    label: "Accountant General Approval",
    description: "Approval letter from the Accountant General",
    icon: FileCheck,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSize: "5MB"
  },
  {
    key: "aml/clt",
    label: "AML/CFT Compliance",
    description: "Completed AML/CFT Questionnaire",
    icon: FileCheck,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG", "DOCX"],
    maxSize: "5MB"
  },
  {
    key: "tin",
    label: "TIN Compliance",
    description: "TIN Certificate",
    icon: FileCheck,
    required: false,
    acceptedFormats: ["PDF", "JPG", "PNG", "DOCX"],
    maxSize: "5MB"
  },
];

const DocumentCard = ({
                        doc,
                        uploadedDoc,
                        isLoading,
                        onFileUpload,
                        onRemove,
                        proofAddressName,
                        setProofAddressName
                      }: {
  doc: DocumentType;
  uploadedDoc?: UploadedDoc;
  isLoading: boolean;
  onFileUpload: (file: File, typeKey: string) => void;
  onRemove: (typeKey: string) => void;
  proofAddressName?: string;
  setProofAddressName?: (value: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0], doc.key);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, doc.key);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${uploadedDoc ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
              <doc.icon className={`w-6 h-6 ${uploadedDoc ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {doc.label}
                </h3>
                {doc.required && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  Required
                </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {doc.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {doc.acceptedFormats.join(', ')}
              </span>
                <span>Max: {doc.maxSize}</span>
              </div>
            </div>
            {uploadedDoc && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Uploaded</span>
                </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Special input for proof of address */}
          {doc.key === "proof_of_address" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Description (Optional)
                </label>
                <input
                    type="text"
                    placeholder="e.g., Utility bill for Lagos office"
                    value={proofAddressName || ""}
                    onChange={(e) => setProofAddressName?.(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
          )}

          {/* Upload Area */}
          {!uploadedDoc && (
              <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragOver
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                />

                {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Drop your file here or{" "}
                          <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.acceptedFormats.join(', ')} up to {doc.maxSize}
                        </p>
                      </div>
                    </div>
                )}
              </div>
          )}

          {/* Uploaded File Display */}
          {uploadedDoc && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Document uploaded successfully
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        ID: {uploadedDoc.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(uploadedDoc.url, '_blank')}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Preview document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => window.open(uploadedDoc.url, '_blank')}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onRemove(doc.key)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remove document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

const ProgressIndicator = ({
                             totalDocs,
                             uploadedCount,
                             requiredCount
                           }: {
  totalDocs: number;
  uploadedCount: number;
  requiredCount: number;
}) => {
  const progress = (uploadedCount / totalDocs) * 100;
  const requiredProgress = (requiredCount / documentTypes.filter(d => d.required).length) * 100;

  return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upload Progress
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
          {uploadedCount} of {totalDocs} documents
        </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Required Documents</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{Math.round(requiredProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${requiredProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
  );
};

const Page = ({ params }: { params: { id: string } }) => {
  const businessId = params.id;
  const { authState } = useAuth();
  const { theme } = useTheme();

  const [uploadedDocs, setUploadedDocs] = useState<{
    [key: string]: UploadedDoc;
  }>({});
  const [loadingDocs, setLoadingDocs] = useState<{ [key: string]: boolean }>({});
  const [finalizing, setFinalizing] = useState(false);
  const [proofAddressName, setProofAddressName] = useState("");

  const handleFileUpload = async (file: File, typeKey: string) => {
    // Validate file size (example: 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

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
        timeout:600000,
      });

      if (res.data.success) {
        setUploadedDocs((prev) => ({
          ...prev,
          [typeKey]: {
            id: String(res.data.data.id),
            url: res.data.data.file,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          },
        }));
        toast.success(`${documentTypes.find(d => d.key === typeKey)?.label} uploaded successfully`);
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Upload error");
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
    toast.success("Document removed");
  };

  const handleSubmit = async () => {
    const requiredDocs = documentTypes.filter(d => d.required);
    const uploadedRequiredDocs = requiredDocs.filter(d => uploadedDocs[d.key]);

    if (uploadedRequiredDocs.length < requiredDocs.length) {
      toast.error("Please upload all required documents before submitting");
      return;
    }

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
        timeout:600000,

      });

      if (res.data.status) {
        toast.success("KYC documents submitted successfully!");
        setUploadedDocs({});
        setProofAddressName("");
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Error submitting KYC documents");
    } finally {
      setFinalizing(false);
    }
  };

  const uploadedCount = Object.keys(uploadedDocs).length;
  const requiredCount = documentTypes.filter(d => d.required && uploadedDocs[d.key]).length;
  const canSubmit = requiredCount === documentTypes.filter(d => d.required).length;

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Upload KYC Documents
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Upload required business documents for verification and compliance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <ProgressIndicator
              totalDocs={documentTypes.length}
              uploadedCount={uploadedCount}
              requiredCount={requiredCount}
          />

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Important Information
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• All documents must be clear and legible</li>
                  <li>• Accepted formats: PDF, JPG, PNG</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Required documents must be uploaded before submission</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Document Cards */}
          <div className="space-y-6 mb-8">
            {documentTypes.map((doc) => (
                <DocumentCard
                    key={doc.key}
                    doc={doc}
                    uploadedDoc={uploadedDocs[doc.key]}
                    isLoading={loadingDocs[doc.key] || false}
                    onFileUpload={handleFileUpload}
                    onRemove={handleRemove}
                    proofAddressName={doc.key === "proof_of_address" ? proofAddressName : undefined}
                    setProofAddressName={doc.key === "proof_of_address" ? setProofAddressName : undefined}
                />
            ))}
          </div>

          {/* Submit Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Ready to Submit?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {canSubmit
                      ? "All required documents have been uploaded. You can now submit for review."
                      : `Please upload ${documentTypes.filter(d => d.required).length - requiredCount} more required document(s).`
                  }
                </p>
              </div>

              <button
                  onClick={handleSubmit}
                  disabled={finalizing || !canSubmit}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
                      finalizing || !canSubmit
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                  }`}
              >
                {finalizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit KYC Documents
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Page;
