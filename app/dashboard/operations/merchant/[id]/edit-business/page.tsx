"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import {
  Building2,
  Settings,
  Phone,
  Save,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  Shield,
  Calendar,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Info,
  Briefcase,
  Users,
  DollarSign
} from "lucide-react";

interface BusinessInfo {
  name: string;
  trade_name: string;
  acc_prefix: string;
  industry_id: number;
  category_id: number;
  business_type: string;
  description: string;
  rcNumber: string;
  incorporationDate: string;
  biz_bvn: string;
  biz_bvn_dob: string;
  biz_email: string;
  biz_phone: string;
  biz_url: string;
  biz_country: string;
  biz_state: string;
  biz_city: string;
  biz_address: string;
  support_email: string;
  support_phone: string;
  chargeback_email: string;
  bc_notify: number;
  cc_notify: number;
  bp_notify: number;
  acc_prefix_mode: string;
  paymentMethod: string[];
  defautPaymentMethod: string;
  feeBearer: string;
  payout_limit_per_trans: string;
  status: string;
  test_webhook_url?: string;
  live_webhook_url?: string;
  live_callback_url?: string;
  test_callback_url?: string;
}

const InputField = ({
                      label,
                      name,
                      value,
                      onChange,
                      type = "text",
                      placeholder = "",
                      required = false,
                      icon: Icon,
                      description = "",
                      error = ""
                    }: any) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
        />
        {type === "url" && value && (
            <button
                type="button"
                onClick={() => window.open(value, '_blank')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
        )}
      </div>
      {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {description}
          </p>
      )}
      {error && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
      )}
    </div>
);

const TextAreaField = ({
                         label,
                         name,
                         value,
                         onChange,
                         placeholder = "",
                         rows = 3,
                         icon: Icon,
                         description = ""
                       }: any) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
      </label>
      <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 resize-none"
      />
      {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {description}
          </p>
      )}
    </div>
);

const SelectField = ({
                       label,
                       name,
                       value,
                       onChange,
                       options,
                       icon: Icon,
                       description = ""
                     }: any) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
      </label>
      <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500"
      >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
        ))}
      </select>
      {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {description}
          </p>
      )}
    </div>
);

const Section = ({
                   icon: Icon,
                   title,
                   description = "",
                   children,
                   className = ""
                 }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{children}</div>
      </div>
    </div>
);

const PaymentMethodCard = ({
                             method,
                             isSelected,
                             onToggle,
                             icon: Icon
                           }: {
  method: string;
  isSelected: boolean;
  onToggle: () => void;
  icon: React.ComponentType<any>;
}) => (
    <div
        onClick={onToggle}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
            isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
        <span className={`font-medium capitalize ${
            isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
        }`}>
        {method}
      </span>
      </div>
      {isSelected && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
      )}
    </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading business information...</p>
      </div>
    </div>
);

const EditBusinessPage = ({ params }: { params: { id: string } }) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axiosInstance.get(`/growth/merchants/${params.id}`, {
          headers: { Authorization: `Bearer ${authState?.token}` },
        });

        const data = res.data.data;

        setFormData({
          name: data.name,
          trade_name: data.trade_name,
          acc_prefix: data.acc_prefix,
          industry_id: data.industry_id,
          category_id: data.category_id,
          business_type: data.business_type,
          description: data.description || "",
          rcNumber: data.rcNumber || "",
          incorporationDate: data.incorporationDate || "",
          biz_bvn: data.biz_bvn || "",
          biz_bvn_dob: data.biz_bvn_dob || "",
          biz_email: data.biz_email || "",
          biz_phone: data.biz_phone || "",
          biz_url: data.biz_url || "",
          biz_country: data.biz_country || "Nigeria",
          biz_state: data.biz_state || "",
          biz_city: data.biz_city || "",
          biz_address: data.biz_address || "",
          support_email: data.support_email || "",
          support_phone: data.support_phone || "",
          chargeback_email: data.chargeback_email || "",
          bc_notify: data.bc_notify,
          cc_notify: data.cc_notify,
          bp_notify: data.bp_notify,
          acc_prefix_mode: data.acc_prefix_mode || "on",
          paymentMethod: data.paymentMethod ? data.paymentMethod.split("|") : [],
          defautPaymentMethod: data.defautPaymentMethod || "card",
          feeBearer: data.feeBearer || "merchant",
          payout_limit_per_trans: data.payout_limit_per_trans || "",
          status: data.status || "active",
          test_webhook_url: data.credential?.test_webhook_url || "",
          live_webhook_url: data.credential?.live_webhook_url || "",
          live_callback_url: data.credential?.live_callback_url || "",
          test_callback_url: data.credential?.test_callback_url || "",
        });
      } catch (error) {
        toast.error("Failed to load business information");
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authState?.token) fetchBusiness();
  }, [params.id, authState?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (formData) setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodToggle = (method: string) => {
    if (!formData) return;
    const exists = formData.paymentMethod.includes(method);
    const updated = exists
        ? formData.paymentMethod.filter((m) => m !== method)
        : [...formData.paymentMethod, method];
    setFormData({ ...formData, paymentMethod: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSavingBusiness(true);

    try {
      const payload = {
        ...formData,
        paymentMethod: formData.paymentMethod.join("|"),
      };

      const res = await axiosInstance.post(`/upmerchants/${params.id}`, payload, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      });

      toast.success(res.data.message || "Business information updated successfully");
    } catch (error) {
      toast.error("Failed to update business information");
      console.error("Error updating business:", error);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleCredentialUpdate = async () => {
    if (!formData) return;
    setSavingCredentials(true);

    try {
      const payload = {
        test_webhook_url: formData.test_webhook_url,
        live_webhook_url: formData.live_webhook_url,
        live_callback_url: formData.live_callback_url,
        test_callback_url: formData.test_callback_url,
      };

      const res = await axiosInstance.post(`/updatecredentials/${params.id}`, payload, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      });

      toast.success(res.data.message || "Credentials updated successfully");
    } catch (error) {
      toast.error("Failed to update credentials");
      console.error("Error updating credentials:", error);
    } finally {
      setSavingCredentials(false);
    }
  };

  const paymentMethods = [
    { name: 'card', icon: CreditCard },
    { name: 'transfer', icon: Building2 },
    { name: 'ussd', icon: Phone },
    { name: 'wallet', icon: DollarSign },
    { name: 'phone', icon: Phone }
  ];

  if (loading) return <LoadingSpinner />;

  if (!formData) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Data Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load business information for this merchant.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Business Information
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Update business details, contact information, and payment settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Information */}
            <Section
                icon={Building2}
                title="Business Information"
                description="Basic business details and registration information"
            >
              <InputField
                  name="name"
                  label="Legal Business Name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={Building2}
                  placeholder="Enter legal business name"
                  required
              />
              <InputField
                  name="trade_name"
                  label="Trade Name"
                  value={formData.trade_name}
                  onChange={handleChange}
                  icon={Briefcase}
                  placeholder="Enter trade name"
                  required
              />
              <div className="lg:col-span-2">
                <TextAreaField
                    name="description"
                    label="Business Description"
                    value={formData.description}
                    onChange={handleChange}
                    icon={FileText}
                    placeholder="Describe your business activities..."
                    description="Brief description of your business activities and services"
                />
              </div>
              <InputField
                  name="rcNumber"
                  label="RC Number"
                  value={formData.rcNumber}
                  onChange={handleChange}
                  icon={Hash}
                  placeholder="Enter registration number"
              />
              <InputField
                  name="incorporationDate"
                  label="Incorporation Date"
                  type="date"
                  value={formData.incorporationDate}
                  onChange={handleChange}
                  icon={Calendar}
              />
              <InputField
                  name="biz_url"
                  label="Website URL"
                  type="url"
                  value={formData.biz_url}
                  onChange={handleChange}
                  icon={Globe}
                  placeholder="https://example.com"
              />
              <InputField
                  name="biz_bvn"
                  label="Business BVN"
                  value={formData.biz_bvn}
                  onChange={handleChange}
                  icon={Hash}
                  placeholder="Enter BVN"
              />
            </Section>

            {/* Contact Information */}
            <Section
                icon={Phone}
                title="Contact & Support Information"
                description="Business contact details and support channels"
            >
              <InputField
                  name="biz_email"
                  label="Business Email"
                  type="email"
                  value={formData.biz_email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="business@example.com"
              />
              <InputField
                  name="biz_phone"
                  label="Business Phone"
                  type="tel"
                  value={formData.biz_phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="+234 xxx xxx xxxx"
              />
              <InputField
                  name="support_email"
                  label="Support Email"
                  type="email"
                  value={formData.support_email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="support@example.com"
              />
              <InputField
                  name="support_phone"
                  label="Support Phone"
                  type="tel"
                  value={formData.support_phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="+234 xxx xxx xxxx"
              />
              <InputField
                  name="chargeback_email"
                  label="Chargeback Email"
                  type="email"
                  value={formData.chargeback_email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="chargeback@example.com"
              />
            </Section>

            {/* Address Information */}
            <Section
                icon={MapPin}
                title="Address Information"
                description="Business location and address details"
            >
              <InputField
                  name="biz_city"
                  label="City"
                  value={formData.biz_city}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Enter city"
              />
              <InputField
                  name="biz_state"
                  label="State"
                  value={formData.biz_state}
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Enter state"
              />
              <div className="lg:col-span-2">
                <TextAreaField
                    name="biz_address"
                    label="Business Address"
                    value={formData.biz_address}
                    onChange={handleChange}
                    icon={MapPin}
                    placeholder="Enter complete business address"
                />
              </div>
            </Section>

            {/* Payment Settings */}
            <Section
                icon={CreditCard}
                title="Payment Settings"
                description="Configure payment methods and transaction settings"
            >
              <SelectField
                  name="feeBearer"
                  label="Fee Bearer"
                  value={formData.feeBearer}
                  onChange={handleChange}
                  icon={DollarSign}
                  options={[
                    { value: "merchant", label: "Merchant" },
                    { value: "customer", label: "Customer" }
                  ]}
                  description="Who bears the transaction fees"
              />
              <SelectField
                  name="defautPaymentMethod"
                  label="Default Payment Method"
                  value={formData.defautPaymentMethod}
                  onChange={handleChange}
                  icon={CreditCard}
                  options={paymentMethods.map((p) => ({ value: p.name, label: p.name.charAt(0).toUpperCase() + p.name.slice(1) }))}
              />
              <InputField
                  name="payout_limit_per_trans"
                  label="Payout Limit per Transaction"
                  type="number"
                  value={formData.payout_limit_per_trans}
                  onChange={handleChange}
                  icon={DollarSign}
                  placeholder="Enter amount"
              />

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Allowed Payment Methods
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {paymentMethods.map((method) => (
                      <PaymentMethodCard
                          key={method.name}
                          method={method.name}
                          isSelected={formData.paymentMethod.includes(method.name)}
                          onToggle={() => handlePaymentMethodToggle(method.name)}
                          icon={method.icon}
                      />
                  ))}
                </div>
              </div>
            </Section>

            {/* Webhook & API Settings */}
            <Section
                icon={Shield}
                title="Webhook & API Settings"
                description="Configure webhook URLs and callback endpoints"
            >
              <InputField
                  name="test_webhook_url"
                  label="Test Webhook URL"
                  type="url"
                  value={formData.test_webhook_url || ""}
                  onChange={handleChange}
                  icon={Globe}
                  placeholder="https://test.example.com/webhook"
                  description="Webhook URL for test environment"
              />
              <InputField
                  name="live_webhook_url"
                  label="Live Webhook URL"
                  type="url"
                  value={formData.live_webhook_url || ""}
                  onChange={handleChange}
                  icon={Globe}
                  placeholder="https://example.com/webhook"
                  description="Webhook URL for production environment"
              />
              <InputField
                  name="test_callback_url"
                  label="Test Callback URL"
                  type="url"
                  value={formData.test_callback_url || ""}
                  onChange={handleChange}
                  icon={Globe}
                  placeholder="https://test.example.com/callback"
                  description="Callback URL for test environment"
              />
              <InputField
                  name="live_callback_url"
                  label="Live Callback URL"
                  type="url"
                  value={formData.live_callback_url || ""}
                  onChange={handleChange}
                  icon={Globe}
                  placeholder="https://example.com/callback"
                  description="Callback URL for production environment"
              />
            </Section>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                    type="button"
                    disabled={savingCredentials}
                    onClick={handleCredentialUpdate}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                  {savingCredentials ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <Shield className="w-4 h-4" />
                  )}
                  {savingCredentials ? 'Updating Credentials...' : 'Update Credentials'}
                </button>

                <button
                    type="submit"
                    disabled={savingBusiness}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                  {savingBusiness ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <Save className="w-4 h-4" />
                  )}
                  {savingBusiness ? 'Saving Changes...' : 'Save Business Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default EditBusinessPage;
