"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import { Building, Settings, PhoneCall, Save } from "lucide-react";

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

  // Credentials
  test_webhook_url?: string;
  live_webhook_url?: string;
  live_callback_url?: string;
  test_callback_url?: string;
}

const InputField = ({ label, name, value, onChange, type = "text" }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
      >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
        ))}
      </select>
    </div>
);

const Section = ({ icon: Icon, title, children }: any) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-green-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
);

const EditBusinessPage = ({ params }: { params: { id: string } }) => {
  const { authState } = useAuth();
  const [formData, setFormData] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);

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

          // Credentials
          test_webhook_url: data.credential.test_webhook_url || "",
          live_webhook_url: data.credential.live_webhook_url || "",
          live_callback_url: data.credential.live_callback_url || "",
          test_callback_url: data.credential.test_callback_url || "",
        });
      } catch {
        toast.error("Failed to load business info");
      } finally {
        setLoading(false);
      }
    };

    if (authState?.token) fetchBusiness();
  }, [params.id, authState?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) setFormData({ ...formData, [name]: value });
  };

  const handleCheckbox = (method: string) => {
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

      toast.success(res.data.message || "Business updated");
    } catch {
      toast.error("Update failed");
    }finally {
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

      toast.success(res.data.message || "Credentials updated");
    } catch {
      toast.error("Credential update failed");
    } finally {
      setSavingCredentials(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!formData) return <div className="p-8 text-red-500">No data found</div>;

  return (
      <div className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-900 shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Edit Business</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Business Info */}
          <Section icon={Building} title="Business Information">
            <InputField name="name" label="Legal Name" value={formData.name} onChange={handleChange} />
            <InputField name="trade_name" label="Trade Name" value={formData.trade_name} onChange={handleChange} />
            <InputField name="description" label="Description" value={formData.description} onChange={handleChange} />
            <InputField name="rcNumber" label="RC Number" value={formData.rcNumber} onChange={handleChange} />
            <InputField name="incorporationDate" type="date" label="Incorporation Date" value={formData.incorporationDate} onChange={handleChange} />
            <InputField name="biz_url" label="Website" value={formData.biz_url} onChange={handleChange} />
            <InputField name="biz_bvn" label="BVN" value={formData.biz_bvn} onChange={handleChange} />
            <InputField name="biz_bvn_dob" label="BVN DOB" type="date" value={formData.biz_bvn_dob} onChange={handleChange} />
            <InputField name="biz_city" label="City" value={formData.biz_city} onChange={handleChange} />
            <InputField name="biz_address" label="Address" value={formData.biz_address} onChange={handleChange} />
          </Section>

          {/* Contact */}
          <Section icon={PhoneCall} title="Contact & Support">
            <InputField name="biz_email" label="Business Email" value={formData.biz_email} onChange={handleChange} />
            <InputField name="biz_phone" label="Business Phone" value={formData.biz_phone} onChange={handleChange} />
            <InputField name="support_email" label="Support Email" value={formData.support_email} onChange={handleChange} />
            <InputField name="support_phone" label="Support Phone" value={formData.support_phone} onChange={handleChange} />
            <InputField name="chargeback_email" label="Chargeback Email" value={formData.chargeback_email} onChange={handleChange} />
          </Section>

          {/* Payment Settings */}
          <Section icon={Settings} title="Payment Settings">
            <SelectField name="feeBearer" label="Fee Bearer" value={formData.feeBearer} onChange={handleChange}
                         options={[{ value: "merchant", label: "Merchant" }, { value: "customer", label: "Customer" }]} />
            <SelectField name="defautPaymentMethod" label="Default Method" value={formData.defautPaymentMethod} onChange={handleChange}
                         options={["card", "transfer", "ussd", "wallet", "phone"].map((p) => ({ value: p, label: p }))} />
            <InputField name="payout_limit_per_trans" label="Payout Limit per Transaction" value={formData.payout_limit_per_trans} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Allowed Payment Methods</label>
              <div className="flex flex-wrap gap-4">
                {["card", "transfer", "ussd", "wallet", "phone"].map((method) => (
                    <label key={method} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <input
                          type="checkbox"
                          checked={formData.paymentMethod.includes(method)}
                          onChange={() => handleCheckbox(method)}
                          className="form-checkbox"
                      />
                      <span className="capitalize">{method}</span>
                    </label>
                ))}
              </div>
            </div>
          </Section>

          {/* Credential Settings */}
          <Section icon={Settings} title="Credential Settings">
            <InputField name="test_webhook_url" label="Test Webhook URL" value={formData.test_webhook_url || ""} onChange={handleChange} />
            <InputField name="live_webhook_url" label="live Webhook URL" value={formData.live_webhook_url || ""} onChange={handleChange} />
            <InputField name="live_callback_url" label="Live Callback URL" value={formData.live_callback_url || ""} onChange={handleChange} />
            <InputField name="test_callback_url" label="Test Callback URL" value={formData.test_callback_url || ""} onChange={handleChange} />
          </Section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
                type="submit"
                disabled={savingBusiness}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow transition-all ${
                    savingBusiness ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              <Save size={18}/>
              {savingBusiness ? 'Saving...' : 'Save Business Changes'}
            </button>

            <button
                type="button"
                disabled={savingCredentials}
                onClick={handleCredentialUpdate}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow transition-all ${
                    savingCredentials ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              <Save size={18}/>
              {savingCredentials ? 'Updating...' : 'Update Credentials'}
            </button>

          </div>
        </form>
      </div>
  );
};

export default EditBusinessPage;
