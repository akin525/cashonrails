"use client";

import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";

const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-3 border-b border-border text-sm text-muted-foreground">
        <span className="font-medium">{label}</span>
        <span>{value}</span>
    </div>
);

interface CompanyData {
    country_of_incorporation: string | null;
    duration_of_incorporation: string;
    operational_in_multiple_countries: string;
    industry: string;
    local_collections: string;
    international_collections: string;
    local_payout: string;
    international_payout: string;
}

interface RiskProfile {
    risk_score: number;
    risk_level: string;
    description: string;
}

const Page = ({ params }: { params: { id: string } }) => {
    const { authState } = useAuth();
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get(`/growth/merchants/${params.id}/profile`, {
                    headers: { Authorization: `Bearer ${authState?.token}` },
                });

                if (response.data && response.data.data) {
                    setCompanyData(response.data.data);
                    setRiskProfile(response.data.risk_profile);
                } else {
                    setError("No data found");
                }
            } catch (err) {
                setError("Failed to fetch company data");
                toast.error("Failed to fetch company data");
            } finally {
                setIsLoading(false);
            }
        };

        if (authState?.token) {
            fetchCompanyData();
        }
    }, [params.id, authState?.token]);

    if (isLoading) return <TableDetailSkeleton />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!companyData) return <div className="p-4">No company data found</div>;

    const labels = {
        country_of_incorporation: "Country of Incorporation",
        duration_of_incorporation: "Duration of Incorporation",
        operational_in_multiple_countries: "Operational in Multiple Countries",
        industry: "Industry",
        local_collections: "Local Collections",
        international_collections: "International Collections",
        local_payout: "Local Payout",
        international_payout: "International Payout",
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 border-t border-border p-6 bg-background text-foreground">
            {/* Company Info */}
            <div className="flex-1 border border-border rounded-xl p-6 shadow-md bg-card transition-colors">
                <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                {Object.entries(companyData).map(([key, value]) => (
                    <InfoRow
                        key={key}
                        label={(labels as Record<string, string>)[key] || key}
                        value={value || "N/A"}
                    />
                ))}
            </div>

            {/* Risk Profile Card */}
            <div className="w-full max-w-md border border-border rounded-xl p-6 shadow-md bg-card transition-colors">
                <h2 className="text-lg font-semibold mb-2">Risk Profile</h2>
                <div className="mb-4 text-sm text-muted-foreground space-y-1">
                    <p><strong>Risk Level:</strong> {riskProfile?.risk_level}</p>
                    <p>{riskProfile?.description}</p>
                </div>

                <div className="w-full mt-4">
                    <GaugeComponent
                        type="semicircle"
                        arc={{
                            width: 0.2,
                            padding: 0.005,
                            cornerRadius: 1,
                            subArcs: [
                                {
                                    limit: 30,
                                    color: '#16a34a', // green-600
                                    showTick: true,
                                    tooltip: { text: 'Low Risk' },
                                },
                                {
                                    limit: 70,
                                    color: '#facc15', // yellow-400
                                    showTick: true,
                                    tooltip: { text: 'Medium Risk' },
                                },
                                {
                                    limit: 100,
                                    color: '#ef4444', // red-500
                                    showTick: true,
                                    tooltip: { text: 'High Risk' },
                                },
                            ],
                        }}
                        pointer={{
                            color: 'var(--foreground)', // adapt to light/dark
                            length: 0.8,
                            width: 3,
                        }}
                        labels={{
                            valueLabel: { formatTextValue: value => `${value}` },
                            tickLabels: {
                                type: 'outer',
                                defaultTickValueConfig: {
                                    style: { fontSize: 10 },
                                    formatTextValue: value => `${value}`,
                                },
                                ticks: Array.from({ length: 11 }, (_, i) => ({ value: i * 10 })),
                            },
                        }}
                        value={riskProfile?.risk_score || 0}
                        minValue={0}
                        maxValue={100}
                    />
                </div>
            </div>
        </div>
    );
};

export default Page;
