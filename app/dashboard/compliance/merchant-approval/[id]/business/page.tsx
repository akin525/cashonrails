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
}

const InfoItem: React.FC<InfoItemProps & { theme?: string }> = ({ label, value, theme }) => (
  <div>
      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <div className={`font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>{value}</div>
  </div>
);
const Section: React.FC<SectionProps & { theme?: string }> = ({ title, children, theme }) => (
  <div className="py-6">
      <h3 className={`text-lg font-medium mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>{title}</h3>
      <div className="grid sm:grid-cols-2 gap-6">{children}</div>
  </div>
);
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
  document: string //url
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
  const {theme} = useTheme()

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get<MerchantData>(`/merchants/${params.id}`, {
          headers: { Authorization: `Bearer ${authState?.token}` },
        });

        if (!response.data.data || !response.data.status) {
          toast.error(response.data.message)
        } else {
          console.log("response", response.data.data)
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
    return <div>{error}</div>;
  }

  if (!merchantData) {
    return <div>No merchant data found</div>;
  }


  return (
    <div className="pb-8 flex flex-wrap items-start justify-between gap-2 border-t border-b">
      <div className="flex-1 min-w-96 sm:border-r">
        {/* Personal Information */}
        <Section title="Personal Information" theme={theme}>
          <InfoItem theme={theme} label="First Name" value={merchantData.personal_information.first_name} />
          <InfoItem theme={theme} label="Last Name" value={merchantData.personal_information.last_name} />
          <InfoItem theme={theme} label="Email Address" value={merchantData.personal_information.email_address} />
        </Section>
        <hr style={{ borderTop: '1px solid #E4E7EC' }} />

        {/* Business Information */}
        <Section theme={theme} title="Business Information">
          <InfoItem theme={theme} label="Business Name" value={merchantData.business_information.business_name} />
          <InfoItem theme={theme} label="Industry" value={merchantData.business_information.industry} />
          <InfoItem theme={theme} label="Support Email" value={merchantData.business_information.support_email} />
          <InfoItem theme={theme} label="Support Phone" value={merchantData.business_information.support_phone} />
          <InfoItem theme={theme} label="Website" value={merchantData.business_information.website || "N/A"} />
          <InfoItem theme={theme}
            label="Address"
            value={
              <div className="space-y-2 max-w-md">
                <p>{merchantData.business_information.address}</p>
                <DocumentNode
                  label={""}
                  merchantId={params.id ?? "id"}
                  file={{ name: "Business Proof of Address", url: merchantData.business_information.proof_of_address, id: merchantData.business_information.proof_of_address }}
                />
              </div>
            }
          />
        </Section>
        <hr style={{ borderTop: '1px solid #E4E7EC' }} />

        {/* Bank Account */}
        <Section title="Bank Account">
          {merchantData.bank_account.length > 0 ? (
            merchantData.bank_account.map((account, index) => (
              <React.Fragment key={index}>
                <InfoItem label="Bank" value={account.bank_name} />
                <InfoItem label="Account Number" value={account.account_number} />
                <InfoItem label="Account Name" value={account.account_name} />
              </React.Fragment>
            ))
          ) : (
            "No Bank data"
          )}
        </Section>
      </div>
      <div className="sm:w-[500px] w-full sm:px-5">
        {/* Directors Information */}
        <Section title="Directors Information">
          {merchantData.directors_information.map((director, index) => (
            <React.Fragment key={index}>
              <div className="col-span-2 mb-4">
                <h4 className="font-semibold text-gray-700 bg-[#F5F6F8] p-2 rounded">
                  Director {index + 1}
                </h4>
              </div>
              <InfoItem label="First Name" value={director.first_name} />
              <InfoItem label="Last Name" value={director.last_name} />
              <InfoItem
                label="Valid ID"
                value={
                  <div className="space-y-2">
                    <p>{StringUtils.snakeToCapitalized(director.valid_id)}</p>
                    <DocumentNode
                      label={""}
                      file={{ name: `Director ${index + 1} ${StringUtils.snakeToCapitalized(director.valid_id)} `, url: director.document, id: merchantData.business_information.proof_of_address }}
                      merchantId={params.id}
                    />
                  </div>
                }
              />
              <InfoItem label="BVN" value={director.bvn} />
            </React.Fragment>
          ))}
        </Section>
      </div>
    </div>
  );
};

export default Page;