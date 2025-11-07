"use client";
import React from "react";
import { Save, Loader2 } from "lucide-react";
import { FeeFormData, FeeType } from "@/types/fee.types";
import {
    CURRENCY_OPTIONS,
    FEE_TYPE_OPTIONS,
} from "@/constants/fee.constants";

interface FeeFormProps {
    formData: FeeFormData;
    setFormData: (data: FeeFormData) => void;
    onSubmit: () => void;
    loading: boolean;
    isEditing?: boolean;
    type: FeeType;
}

export const FeeForm: React.FC<FeeFormProps> = ({
                                                    formData,
                                                    setFormData,
                                                    onSubmit,
                                                    loading,
                                                    isEditing = false,
                                                    type,
                                                }) => {
    const updateField = (field: keyof FeeFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            {/* Currency and Fee Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Currency" required>
                    <select
                        value={formData.currency}
                        onChange={(e) => updateField("currency", e.target.value)}
                        className="form-select"
                        required
                    >
                        {CURRENCY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Fee Type" required>
                    <select
                        value={formData.fee_type}
                        onChange={(e) => updateField("fee_type", e.target.value)}
                        className="form-select"
                        required
                    >
                        {FEE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            {/* Fee Value */}
            <FormField
                label={`Fee Value ${formData.fee_type === "percent" ? "(%)" : "(Amount)"}`}
                required
            >
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fee}
                    onChange={(e) => updateField("fee", e.target.value)}
                    className="form-input"
                    placeholder="Enter fee value"
                    required
                />
            </FormField>

            {/* Type-specific fields */}
            {type === "collection" ? (
                <FormField label="Cap Value" required>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.fee_cap || ""}
                        onChange={(e) => updateField("fee_cap", e.target.value)}
                        className="form-input"
                        placeholder="Enter maximum fee cap"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Maximum fee amount that can be charged
                    </p>
                </FormField>
            ) : (
                <div className="space-y-4">
                    <FormField label="Range Set" required>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.range_set || ""}
                            onChange={(e) => updateField("range_set", e.target.value)}
                            className="form-input"
                            placeholder="Enter range set value"
                            required
                        />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Minimum Fee" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.min_fee || ""}
                                onChange={(e) => updateField("min_fee", e.target.value)}
                                className="form-input"
                                placeholder="Min fee"
                                required
                            />
                        </FormField>

                        <FormField label="Maximum Fee" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.max_fee || ""}
                                onChange={(e) => updateField("max_fee", e.target.value)}
                                className="form-input"
                                placeholder="Max fee"
                                required
                            />
                        </FormField>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-300/90 text-white font-medium rounded-lg
                         flex items-center justify-center gap-2 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin"/>
                        Processing...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5"/>
                        {isEditing ? "Update Fee" : "Create Fee"}
                    </>
                )}
            </button>
        </form>
    );
};

interface FormFieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({label, required, children}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
    </div>
);
