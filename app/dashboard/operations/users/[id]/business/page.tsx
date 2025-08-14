"use client"
import { DocumentIcon } from "@/public/assets/icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import moment from "moment";
import { TableDetailSkeleton } from "@/components/loaders";

interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div>
    <p className="text-[#00000066] text-sm">{label}</p>
    <div className="font-medium">{value}</div>
  </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="py-6 bg-white">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
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
        <Section title="Personal Information">
          <InfoItem label="First Name" value={merchantData.personal_information.first_name} />
          <InfoItem label="Last Name" value={merchantData.personal_information.last_name} />
          <InfoItem label="Email Address" value={merchantData.personal_information.email_address} />
        </Section>
        <hr style={{ borderTop: '1px solid #E4E7EC' }} />

        {/* Business Information */}
        <Section title="Business Information">
          <InfoItem label="Business Name" value={merchantData.business_information.business_name} />
          <InfoItem label="Industry" value={merchantData.business_information.industry} />
          <InfoItem label="Support Email" value={merchantData.business_information.support_email} />
          <InfoItem label="Support Phone" value={merchantData.business_information.support_phone} />
          <InfoItem label="Website" value={merchantData.business_information.website || "N/A"} />
          <InfoItem
            label="Address"
            value={
              <div className="space-y-2">
                <p>{merchantData.business_information.address}</p>
                <button className="flex items-center gap-1 bg-[#FDFDFD] border-[#DBE0EA] border rounded-lg px-2.5 py-1">
                  <span className="bg-[#F1FDF6] p-3 rounded-3xl">
                    <DocumentIcon />
                  </span>
                  Utility Bill.pdf
                </button>
              </div>
            }
          />
        </Section>
        <hr style={{ borderTop: '1px solid #E4E7EC' }} />

        {/* Bank Account */}
        <Section title="Bank Account">
          {merchantData.bank_account.map((account, index) => (
            <React.Fragment key={index}>
              <InfoItem label="Bank" value={account.bank_name} />
              <InfoItem label="Account Number" value={account.account_number} />
              <InfoItem label="Account Name" value={account.account_name} />
            </React.Fragment>
          ))}
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
                    <p>{director.valid_id}</p>
                    <button className="flex items-center gap-1 bg-[#FDFDFD] border-[#DBE0EA] border rounded-lg px-2.5 py-1">
                      <span className="bg-[#F1FDF6] p-3 rounded-3xl">
                        <DocumentIcon />
                      </span>
                      {director.valid_id}.pdf
                    </button>
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