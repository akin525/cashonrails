"use client"
import { DocumentIcon } from "@/public/assets/icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import moment from "moment";
import { TableDetailSkeleton } from "@/components/loaders";
import { DocumentNode } from "@/components/utils";
import { StringUtils } from "@/helpers/extras";
import { useTheme } from "next-themes";

interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps & { theme?: string }> = ({ label, value, theme }) => (
    <div className="space-y-1">
      <p className={`text-xs font-medium uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      <div className={`text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </div>
    </div>
);

const Section: React.FC<SectionProps & { theme?: string }> = ({ title, children, theme, icon }) => (
    <div className={`rounded-lg border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} p-6 shadow-sm`}>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        {icon && <div className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{icon}</div>}
        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status.toLowerCase()] || statusColors.inactive}`}>
      {StringUtils.snakeToCapitalized(status)}
    </span>
  );
};

interface PersonalInformation {
  first_name: string;
  last_name: string;
  email_address: string;
  date_created: string;
}

interface BusinessInformation {
  business_id: number;
  status: string;
  business_name: string;
  industry: string;
  support_email: string;
  support_phone: string;
  website: string | null;
  address: string;
  business_type: string;
  business_logo: string | null;
  business_phone: string;
  proof_of_address: string;
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface DirectorInformation {
  first_name: string;
  last_name: string;
  valid_id: string;
  bvn: string;
  document: string;
}

interface MerchantData {
  personal_information: PersonalInformation;
  business_information: BusinessInformation;
  bank_account: BankAccount[];
  directors_information: DirectorInformation[];
}

const Page = ({ params }: { params: { id: string } }) => {
  const { authState } = useAuth();
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get<MerchantData>(`/merchants/${params.id}`, {
          headers: { Authorization: `Bearer ${authState?.token}` },
        });

        if (!response.data.data || !response.data.status) {
          toast.error(response.data.message);
        } else {
          console.log("response", response.data.data);
          setMerchantData(response.data.data);
        }
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch merchant data");
        setIsLoading(false);
        toast.error("Failed to fetch merchant data");
      }
    };

    if (authState?.token) {
      fetchMerchantData();
    }
  }, [params.id, authState?.token]);

  if (isLoading) {
    return <TableDetailSkeleton />;
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
    );
  }

  if (!merchantData) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Found</h3>
            <p className="text-gray-600 dark:text-gray-400">No merchant data available for this ID</p>
          </div>
        </div>
    );
  }

  return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className={`rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-6 mb-6 shadow-sm`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {merchantData.business_information.business_logo ? (
                    <img
                        src={merchantData.business_information.business_logo}
                        alt="Business Logo"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                ) : (
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                      {merchantData.business_information.business_name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                  <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {merchantData.business_information.business_name}
                  </h1>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mt-1`}>
                    ID: {merchantData.business_information.business_id} • Member since {moment(merchantData.personal_information.date_created).format("MMM YYYY")}
                  </p>
                </div>
              </div>
              <StatusBadge status={merchantData.business_information.status} />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Section
                  title="Personal Information"
                  theme={theme}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
              >
                <InfoItem theme={theme} label="First Name" value={merchantData.personal_information.first_name} />
                <InfoItem theme={theme} label="Last Name" value={merchantData.personal_information.last_name} />
                <InfoItem theme={theme} label="Email Address" value={merchantData.personal_information.email_address} />
                <InfoItem
                    theme={theme}
                    label="Date Joined"
                    value={moment(merchantData.personal_information.date_created).format("MMMM DD, YYYY")}
                />
              </Section>

              {/* Business Information */}
              <Section
                  theme={theme}
                  title="Business Information"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
              >
                <InfoItem theme={theme} label="Business Type" value={StringUtils.snakeToCapitalized(merchantData.business_information.business_type)} />
                <InfoItem theme={theme} label="Industry" value={merchantData.business_information.industry} />
                <InfoItem theme={theme} label="Business Phone" value={merchantData.business_information.business_phone} />
                <InfoItem theme={theme} label="Support Email" value={merchantData.business_information.support_email} />
                <InfoItem theme={theme} label="Support Phone" value={merchantData.business_information.support_phone} />
                <InfoItem
                    theme={theme}
                    label="Website"
                    value={
                      merchantData.business_information.website ? (
                          <a
                              href={merchantData.business_information.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {merchantData.business_information.website}
                          </a>
                      ) : "N/A"
                    }
                />
                <div className="col-span-2">
                  <InfoItem
                      theme={theme}
                      label="Business Address"
                      value={
                        <div className="space-y-3 mt-2">
                          <p className="leading-relaxed">{merchantData.business_information.address}</p>
                          <DocumentNode
                              label={""}
                              merchantId={params.id ?? "id"}
                              file={{
                                name: "Proof of Address",
                                url: merchantData.business_information.proof_of_address,
                                id: merchantData.business_information.proof_of_address,
                              }}
                          />
                        </div>
                      }
                  />
                </div>
              </Section>

              {/* Bank Account */}
              <Section
                  title="Bank Account Information"
                  theme={theme}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
              >
                {merchantData.bank_account.length > 0 ? (
                    merchantData.bank_account.map((account, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 my-2"></div>}
                          <InfoItem theme={theme} label="Bank Name" value={account.bank_name} />
                          <InfoItem theme={theme} label="Account Number" value={account.account_number} />
                          <div className="col-span-2">
                            <InfoItem theme={theme} label="Account Name" value={account.account_name} />
                          </div>
                        </React.Fragment>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                      No bank account information available
                    </div>
                )}
              </Section>
            </div>

            {/* Right Column - Directors Information */}
            <div className="lg:col-span-1 space-y-6">
              <Section
                  title="Directors Information"
                  theme={theme}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
              >
                {merchantData.directors_information.length > 0 ? (
                    merchantData.directors_information.map((director, index) => (
                        <React.Fragment key={index}>
                          <div className="col-span-2">
                            <div className={`rounded-lg p-4 mb-4 ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"}`}>
                              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                            {index + 1}
                          </span>
                                Director {index + 1}
                              </h4>
                              <div className="space-y-4">
                                <InfoItem theme={theme} label="First Name" value={director.first_name} />
                                <InfoItem theme={theme} label="Last Name" value={director.last_name} />
                                <InfoItem theme={theme} label="BVN" value={director.bvn} />
                                <InfoItem
                                    theme={theme}
                                    label="Valid ID"
                                    value={
                                      <div className="space-y-2 mt-2">
                                        <p className="font-medium">{StringUtils.snakeToCapitalized(director.valid_id)}</p>
                                        <DocumentNode
                                            label={""}
                                            file={{
                                              name: `${StringUtils.snakeToCapitalized(director.valid_id)}`,
                                              url: director.document,
                                              id: director.document,
                                            }}
                                            merchantId={params.id}
                                        />
                                      </div>
                                    }
                                />
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                      No director information available
                    </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Page;
