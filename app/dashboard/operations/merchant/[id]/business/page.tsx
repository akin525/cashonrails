"use client";
import { DocumentIcon } from "@/public/assets/icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";

interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-black font-medium">{value}</div>
    </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <section className="bg-white border rounded-md mb-6 p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
);

const FileLink = ({ href, label }: { href: string; label: string }) =>
    href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 px-3 py-1 rounded-md text-blue-600 hover:underline"
        >
          <DocumentIcon />
          {label}
        </a>
    ) : (
        <span className="text-gray-400">Not available</span>
    );

interface MerchantData {
  personal_information: {
    first_name: string;
    last_name: string;
    email_address: string;
    date_created: string;
  };
  business_information: {
    business_id: number;
    status: string;
    business_name: string;
    industry: string;
    support_email: string;
    support_phone: string;
    website: string | null;
    address: string;
    rc_umber?: string;
    incorporation_date?: string;
    business_bvn?: string;
    business_type: string;
    business_logo?: string | null;
    proof_of_address: string;
  };
  bank_account: {
    bank_name: string;
    account_number: string;
    account_name: string;
  }[];
  directors_information: {
    first_name: string;
    last_name: string;
    valid_id: string;
    bvn: string;
    document?: string;
  }[];
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
        const response = await axiosInstance.get(`/merchants/${params.id}`, {
          headers: { Authorization: `Bearer ${authState?.token}` },
          timeout: 60000
        });

        if (!response.data.status || !response.data.data) {
          toast.error(response.data.message);
        } else {
          setMerchantData(response.data.data);
        }
      } catch (err) {
        toast.error("Failed to fetch merchant data");
        setError("Failed to fetch merchant data");
      } finally {
        setIsLoading(false);
      }
    };

    if (authState?.token) {
      fetchMerchantData();
    }
  }, [params.id, authState?.token]);

  if (isLoading) return <TableDetailSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!merchantData) return <div className="text-gray-600">No merchant data found</div>;

  const { personal_information, business_information, bank_account, directors_information } = merchantData;

  return (
      <div className="pb-8 flex flex-wrap items-start justify-between gap-6 text-black bg-gray-50">
        <div className="flex-1 min-w-96 sm:border-r border-gray-200 px-4">
          <Section title="Personal Information">
            <InfoItem label="First Name" value={personal_information.first_name} />
            <InfoItem label="Last Name" value={personal_information.last_name} />
            <InfoItem label="Email" value={personal_information.email_address} />
          </Section>

          <Section title="Business Information">
            <InfoItem label="Name" value={business_information.business_name} />
            <InfoItem label="Industry" value={business_information.industry} />
            <InfoItem label="RC Number" value={business_information.rc_umber ?? "N/A"} />
            <InfoItem label="Business BVN" value={business_information.business_bvn ?? "N/A"} />
            <InfoItem label="Incorporation Date" value={business_information.incorporation_date ?? "N/A"} />
            <InfoItem label="Support Email" value={business_information.support_email} />
            <InfoItem label="Support Phone" value={business_information.support_phone} />
            <InfoItem
                label="Website"
                value={
                  business_information.website ? (
                      <a href={business_information.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {business_information.website}
                      </a>
                  ) : "N/A"
                }
            />
            <InfoItem label="Address" value={business_information.address} />
            <InfoItem label="Proof of Address" value={<FileLink href={business_information.proof_of_address} label="Utility Bill.pdf" />} />
          </Section>

          {bank_account.length > 0 && (
              <Section title="Bank Account">
                {bank_account.map((acc, index) => (
                    <React.Fragment key={index}>
                      <InfoItem label="Bank Name" value={acc.bank_name} />
                      <InfoItem label="Account Number" value={acc.account_number} />
                      <InfoItem label="Account Name" value={acc.account_name} />
                    </React.Fragment>
                ))}
              </Section>
          )}
        </div>

        <div className="w-full sm:w-[500px] sm:px-5">
          <Section title="Directors">
            {directors_information.map((dir, index) => (
                <div key={index} className="mb-6">
                  <h4 className="font-semibold text-sm mb-2 text-gray-600">Director {index + 1}</h4>
                  <InfoItem label="First Name" value={dir.first_name} />
                  <InfoItem label="Last Name" value={dir.last_name} />
                  <InfoItem label="Valid ID" value={dir.valid_id} />
                  <InfoItem label="ID Document" value={<FileLink href={dir.document ?? ""} label={`${dir.valid_id}.pdf`} />} />
                  <InfoItem label="BVN" value={dir.bvn} />
                </div>
            ))}
          </Section>
        </div>
      </div>
  );
};

export default Page;