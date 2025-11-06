"use client";
import { DocumentIcon } from "@/public/assets/icons";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Briefcase,
  Hash,
  Eye,
  Download
} from "lucide-react";

interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon, className = "" }) => (
    <div className={`group ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{icon}</span>}
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <div className="text-gray-900 dark:text-gray-100 font-medium pl-6">{value}</div>
    </div>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, icon, className = "" }) => (
    <section className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-t-xl">
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-600 dark:text-gray-300">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">{children}</div>
      </div>
    </section>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
          icon: <Clock className="w-3 h-3" />
        };
      case 'suspended':
        return {
          color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
          icon: <AlertCircle className="w-3 h-3" />
        };
      default:
        return {
          color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
        {status}
    </span>
  );
};

const FileLink = ({ href, label }: { href: string; label: string }) =>
    href ? (
        <div className="flex items-center gap-2">
          <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm font-medium group"
          >
            <FileText className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{label}</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </a>
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
    ) : (
        <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
      <FileText className="w-4 h-4" />
      Not available
    </span>
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
  const { theme } = useTheme();
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/merchants/${params.id}`, {
          headers: { Authorization: `Bearer ${authState?.token}` },
          timeout: 600000
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

  if (error) return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
  );

  if (!merchantData) return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">No merchant data found</span>
          </div>
        </div>
      </div>
  );

  const { personal_information, business_information, bank_account, directors_information } = merchantData;

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {business_information.business_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{business_information.business_name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{business_information.industry}</p>
                    <div className="mt-2">
                      <StatusBadge status={business_information.status} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Business ID</p>
                  <p className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">#{business_information.business_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <Section title="Personal Information" icon={<User className="w-5 h-5" />}>
                <InfoItem
                    label="First Name"
                    value={personal_information.first_name}
                    icon={<User className="w-4 h-4" />}
                />
                <InfoItem
                    label="Last Name"
                    value={personal_information.last_name}
                    icon={<User className="w-4 h-4" />}
                />
                <InfoItem
                    label="Email Address"
                    value={
                      <a href={`mailto:${personal_information.email_address}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                        {personal_information.email_address}
                      </a>
                    }
                    icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem
                    label="Date Created"
                    value={new Date(personal_information.date_created).toLocaleDateString()}
                    icon={<Calendar className="w-4 h-4" />}
                />
              </Section>

              {/* Business Information */}
              <Section title="Business Information" icon={<Building2 className="w-5 h-5" />}>
                <InfoItem
                    label="Business Type"
                    value={business_information.business_type}
                    icon={<Briefcase className="w-4 h-4" />}
                />
                <InfoItem
                    label="RC Number"
                    value={business_information.rc_umber ?? "N/A"}
                    icon={<Hash className="w-4 h-4" />}
                />
                <InfoItem
                    label="Business BVN"
                    value={business_information.business_bvn ?? "N/A"}
                    icon={<Hash className="w-4 h-4" />}
                />
                <InfoItem
                    label="Incorporation Date"
                    value={business_information.incorporation_date ? new Date(business_information.incorporation_date).toLocaleDateString() : "N/A"}
                    icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem
                    label="Support Email"
                    value={
                      <a href={`mailto:${business_information.support_email}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                        {business_information.support_email}
                      </a>
                    }
                    icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem
                    label="Support Phone"
                    value={
                      <a href={`tel:${business_information.support_phone}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                        {business_information.support_phone}
                      </a>
                    }
                    icon={<Phone className="w-4 h-4" />}
                />
                <InfoItem
                    label="Website"
                    value={
                      business_information.website ? (
                          <a href={business_information.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1">
                            {business_information.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                      ) : "N/A"
                    }
                    icon={<Globe className="w-4 h-4" />}
                />
                <InfoItem
                    label="Address"
                    value={business_information.address}
                    icon={<MapPin className="w-4 h-4" />}
                    className="sm:col-span-2"
                />
                <InfoItem
                    label="Proof of Address"
                    value={<FileLink href={business_information.proof_of_address} label="Utility Bill.pdf" />}
                    icon={<FileText className="w-4 h-4" />}
                    className="sm:col-span-2"
                />
              </Section>

              {/* Bank Account */}
              {bank_account.length > 0 && (
                  <Section title="Bank Account Information" icon={<CreditCard className="w-5 h-5" />}>
                    {bank_account.map((acc, index) => (
                        <React.Fragment key={index}>
                          <InfoItem
                              label="Bank Name"
                              value={acc.bank_name}
                              icon={<Building2 className="w-4 h-4" />}
                          />
                          <InfoItem
                              label="Account Number"
                              value={
                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                          {acc.account_number}
                        </span>
                              }
                              icon={<Hash className="w-4 h-4" />}
                          />
                          <InfoItem
                              label="Account Name"
                              value={acc.account_name}
                              icon={<User className="w-4 h-4" />}
                              className="sm:col-span-2"
                          />
                        </React.Fragment>
                    ))}
                  </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Directors Information */}
              <Section title="Directors Information" icon={<Users className="w-5 h-5" />}>
                <div className="sm:col-span-2 space-y-6">
                  {directors_information.map((dir, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">Director {index + 1}</h4>
                        </div>

                        <div className="space-y-3">
                          <InfoItem
                              label="Full Name"
                              value={`${dir.first_name} ${dir.last_name}`}
                              icon={<User className="w-4 h-4" />}
                          />
                          <InfoItem
                              label="Valid ID"
                              value={dir.valid_id}
                              icon={<FileText className="w-4 h-4" />}
                          />
                          <InfoItem
                              label="BVN"
                              value={
                                <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600">
                            {dir.bvn}
                          </span>
                              }
                              icon={<Hash className="w-4 h-4" />}
                          />
                          <InfoItem
                              label="ID Document"
                              value={<FileLink href={dir.document ?? ""} label={`${dir.valid_id}.pdf`} />}
                              icon={<FileText className="w-4 h-4" />}
                          />
                        </div>
                      </div>
                  ))}
                </div>
              </Section>

              {/* Quick Actions */}
              <Section title="Quick Actions" icon={<Eye className="w-5 h-5" />}>
                <div className="sm:col-span-2 space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 transition-colors">
                    <Eye className="w-4 h-4" />
                    View Transactions
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Approve Business
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-300 transition-colors">
                    <Clock className="w-4 h-4" />
                    Set Pending
                  </button>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Page;
