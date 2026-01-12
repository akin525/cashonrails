"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import toast from "react-hot-toast";
import Header from "@/app/dashboard/Analytics/system-statistics/Header";
import { useAuth } from "@/contexts/authContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ["#10B981", "#6366F1", "#F472B6", "#F59E0B", "#3B82F6", "#A855F7"];

export default function Monthlytatistics() {
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const { authState } = useAuth();
    const [currency, setCurrency] = useState("NGN");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStats(null);

        try {
            const response = await axiosInstance.get(`/statistics/${currency}/${selectedDate}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 300000,
            });

            if (response.data.success) {
                setStats(response.data.data);
                toast.success("Statistics loaded successfully!");
            } else {
                toast.error("Failed to fetch statistics.");
            }
        } catch (error) {
            toast.error("Failed to fetch statistics.");
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = (code: string) => {
        switch (code) {
            // Major & North Africa
            case "NGN": return "₦"; // Nigeria
            case "ZAR": return "R"; // South Africa
            case "EGP": return "£"; // Egypt
            case "MAD": return "د.م."; // Morocco
            case "DZD": return "دج"; // Algeria
            case "TND": return "د.ت"; // Tunisia
            case "LYD": return "ل.د"; // Libya

            // West Africa
            case "GHS": return "₵"; // Ghana
            case "XOF": return "CFA"; // West African CFA
            case "SLL": return "Le"; // Sierra Leone
            case "GMD": return "D"; // Gambia
            case "LRD": return "$"; // Liberia
            case "CVE": return "$"; // Cape Verde
            case "GNF": return "FG"; // Guinea

            // Central Africa
            case "XAF": return "FCFA"; // Central African CFA
            case "CDF": return "FC"; // DR Congo
            case "STD": return "Db"; // São Tomé (old but still seen)

            // East Africa
            case "KES": return "KSh"; // Kenya
            case "UGX": return "USh"; // Uganda
            case "TZS": return "TSh"; // Tanzania
            case "RWF": return "RF"; // Rwanda
            case "BIF": return "FBu"; // Burundi
            case "ETB": return "Br"; // Ethiopia
            case "SOS": return "Sh"; // Somalia
            case "DJF": return "Fdj"; // Djibouti
            case "ERN": return "Nfk"; // Eritrea
            case "SSP": return "£"; // South Sudan

            // Southern Africa
            case "BWP": return "P"; // Botswana
            case "NAD": return "$"; // Namibia
            case "SZL": return "E"; // Eswatini
            case "LSL": return "L"; // Lesotho
            case "MWK": return "MK"; // Malawi
            case "ZMW": return "ZK"; // Zambia
            case "ZWL": return "Z$"; // Zimbabwe
            case "MZN": return "MT"; // Mozambique

            // Indian Ocean / Islands
            case "MUR": return "₨"; // Mauritius
            case "SCR": return "₨"; // Seychelles
            case "KMF": return "CF"; // Comoros

            // Defaults
            case "USD": return "$";
            case "EUR": return "€";
            case "GBP": return "£";

            default: return code; // fallback for safety
        }

    };
    const barChartData = [
        { name: "Collection", [currency]: stats?.[`collection_sum_${currency}`] || 0 },
        { name: "Payout", [currency]: stats?.[`payout_sum_${currency}`] || 0 },
        { name: "System Balance", [currency]: stats?.[`system_balance_${currency}`] || 0 },
        { name: "Wallet Balance", [currency]: stats?.[`available_wallet_balance_${currency}`] || 0 },
    ];

    const donutData = [
        { name: "Card", value: stats?.alatpay_card || 0 },
        { name: "Mobile Money", value: stats?.alatpay_phone || 0 },
        { name: "USSD", value: stats?.safehaven_ussd || 0 },
        { name: "Transfer Revenue", value: stats?.payout_fee || 0 },
        { name: "Bank Transfer", value: stats?.payout_sum || 0 },
    ];

    return (
        <div className="dark:bg-gray-950 min-h-screen py-10 px-4">
            <Header headerTitle="System Statistics" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 rounded-xl py-10 px-4">
                <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-center text-green-600">System Statistics</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
                        <input
                            type="month"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="p-3 border rounded-md w-full md:w-1/2 focus:ring-2 focus:ring-green-400"
                            required
                        />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="p-3 border rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        >
                            <option value="USD">USD – US Dollar</option>
                            <option value="EUR">EUR – Euro</option>
                            <option value="GBP">GBP – British Pound</option>

                            <option value="NGN">NGN – Nigerian Naira</option>
                            <option value="GHS">GHS – Ghanaian Cedi</option>
                            <option value="XOF">XOF – West African CFA Franc</option>
                            <option value="SLL">SLL – Sierra Leonean Leone</option>
                            <option value="GMD">GMD – Gambian Dalasi</option>
                            <option value="LRD">LRD – Liberian Dollar</option>
                            <option value="CVE">CVE – Cape Verdean Escudo</option>
                            <option value="GNF">GNF – Guinean Franc</option>

                            <option value="EGP">EGP – Egyptian Pound</option>
                            <option value="MAD">MAD – Moroccan Dirham</option>
                            <option value="DZD">DZD – Algerian Dinar</option>
                            <option value="TND">TND – Tunisian Dinar</option>
                            <option value="LYD">LYD – Libyan Dinar</option>

                            <option value="XAF">XAF – Central African CFA Franc</option>
                            <option value="CDF">CDF – Congolese Franc</option>
                            <option value="STD">STD – São Tomé and Príncipe Dobra</option>

                            <option value="KES">KES – Kenyan Shilling</option>
                            <option value="UGX">UGX – Ugandan Shilling</option>
                            <option value="TZS">TZS – Tanzanian Shilling</option>
                            <option value="RWF">RWF – Rwandan Franc</option>
                            <option value="BIF">BIF – Burundian Franc</option>
                            <option value="ETB">ETB – Ethiopian Birr</option>
                            <option value="SOS">SOS – Somali Shilling</option>
                            <option value="DJF">DJF – Djiboutian Franc</option>
                            <option value="ERN">ERN – Eritrean Nakfa</option>
                            <option value="SSP">SSP – South Sudanese Pound</option>

                            <option value="ZAR">ZAR – South African Rand</option>
                            <option value="BWP">BWP – Botswana Pula</option>
                            <option value="NAD">NAD – Namibian Dollar</option>
                            <option value="SZL">SZL – Eswatini Lilangeni</option>
                            <option value="LSL">LSL – Lesotho Loti</option>
                            <option value="MWK">MWK – Malawian Kwacha</option>
                            <option value="ZMW">ZMW – Zambian Kwacha</option>
                            <option value="ZWL">ZWL – Zimbabwean Dollar</option>
                            <option value="MZN">MZN – Mozambican Metical</option>

                            <option value="MUR">MUR – Mauritian Rupee</option>
                            <option value="SCR">SCR – Seychellois Rupee</option>
                            <option value="KMF">KMF – Comorian Franc</option>

                        </select>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-600 transition text-white px-6 py-3 rounded-md w-full md:w-auto"
                        >
                            {loading ? "Loading..." : "Fetch Statistics"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 italic">
                        * May take up to 2 minutes to load data
                    </p>

                    {loading && (
                        <div className="flex justify-center items-center py-10">
                            <div
                                className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {stats && (
                        <div className="space-y-10">
                            <h3 className="text-lg text-center font-semibold text-gray-700">
                                Showing stats for <span className="text-green-600">{selectedDate}</span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Bar Chart */}
                                <div
                                    className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                                    <h4 className="font-semibold text-center mb-4">Total Revenue</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                            <XAxis dataKey="name" stroke="#8884d8"/>
                                            <YAxis
                                                tickFormatter={(val) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                                stroke="#8884d8"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    color: "#fff"
                                                }}
                                                formatter={(val: number) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                            />
                                            <Legend/>
                                            <Bar dataKey={currency} fill="#3B82F6"/>
                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>

                                {/* Donut Chart */}
                                <div
                                    className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 flex flex-col justify-center items-center">
                                    <h4 className="font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">Revenue Breakdown</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {donutData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    color: "#fff"
                                                }}
                                                formatter={(val: number) => `${getCurrencySymbol(currency)}${val.toLocaleString()}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                        {donutData.map((entry, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{backgroundColor: COLORS[index % COLORS.length]}}
                        />
                                                <span>{entry.name} - ₦{Number(entry.value).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                {[
                                    {label: "Collection Count", value: stats.collection_count},
                                    {label: "Collection Sum", value: stats.collection_sum},
                                    {label: "Collection Fee", value: stats.collection_fee},
                                    {label: "Collection System Fee", value: stats.collection_sys_fee},
                                    {label: "Payout Count", value: stats.payout_count},
                                    {label: "Payout Sum", value: stats.payout_sum},
                                    {label: "Payout Fee", value: stats.payout_fee},
                                    {label: "Payout System Fee", value: stats.payout_sys_fee},
                                    {label: "Available Wallet Balance", value: stats.available_wallet_balance},
                                    {label: "Pending Wallet Balance", value: stats.pending_wallet_balance},
                                    {label: "System Balance", value: stats.system_balance},
                                    {label: "Bank78", value: stats.bank78},
                                    {label: "Bank78 Count", value: stats.c_bank78},
                                    {label: "VFD", value: stats.vfd},
                                    {label: "VFD Count", value: stats.c_vfd},
                                    {label: "WEMA", value: stats.wema},
                                    {label: "WEMA Count", value: stats.c_wema},
                                    {label: "SafeHaven", value: stats.safehaven},
                                    {label: "SafeHaven Count", value: stats.c_safehaven},
                                    {label: "NetBank", value: stats.netbank},
                                    {label: "NetBank Count", value: stats.c_netbank},
                                    {label: "AlatPay Card", value: stats.alatpay_card},
                                    {label: "AlatPay Phone", value: stats.alatpay_phone},
                                    {label: "SafeHaven USSD", value: stats.safehaven_ussd},
                                ].map((item, idx) => {
                                    const isCount = item.label.toLowerCase().includes("count");
                                    const value = item.value ?? 0;
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-green-50 dark:bg-gray-900 border border-green-100 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                                        >
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                                            <p className="text-green-700 dark:text-green-400 font-bold mt-1">
                                                {isCount
                                                    ? Number(value).toLocaleString()
                                                    : `${getCurrencySymbol(currency)}${Number(value).toLocaleString()}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
