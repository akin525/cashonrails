import { useState, useEffect } from "react";
import axiosInstance, { handleAxiosError } from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";

// Define the Response type
interface GetBusinessesResponse {
    id: number;
    user_id: number;
    name: string;
    trade_name: string;
    industry_id: number;
    category_id: number;
    business_type: string;
    description: string | null;
    class: string | null;
    rcNumber: string | null;
    tin: string | null;
    logo: string | null;
    international_payment: number;
    local_settlement_day: number;
    foreign_settlement_day: number;
    rolling_reserve: string;
    rolling_duration: number;
    rs: number;
    trans_limit: string;
    biz_email: string;
    biz_bvn: string | null;
    bvn_verify: number;
    biz_phone: string | null;
    biz_url: string | null;
    biz_country: string;
    biz_country_isoName: string;
    biz_state: string | null;
    biz_city: string | null;
    biz_address: string | null;
    support_email: string | null;
    support_phone: string | null;
    chargeback_email: string | null;
    bc_notify: number;
    cc_notify: number;
    bp_notify: number;
    authMode: string;
    acc_prefix_mode: string;
    paymentMethod: string | null;
    defautPaymentMethod: string;
    momo_options: string;
    autoRefund: number;
    kyc_status: string;
    phone_otp: string | null;
    phone_verified: number;
    id_verified: number;
    referral: string | null;
    ref_code: string;
    collection_status: number;
    payout_status: number;
    status: string;
    created_at: string;
    updated_at: string;
}

type Response = {
    BusinessType: { id: number; name: string }[];
    Industry: { id: number; name: string }[];
    Category: { id: number; industry_id: number; name: string }[];
};

type CountriesResponse = {
    name: string;
    isoName: string;
    currencyCode: string;
    currencyName: string;
    callingCodes: string;
}[];

type StatesResponse = {
    id: string;
    name: string;
}[]

type BankResponse = {
    banks: {
        name: string;
        code: string;
    }[]
}

// Define the option type
type Option = {
    value: string;
    label: string;
};

type CountriesOption = {
    name: string;
    isoName: string;
    currencyCode: string;
    currencyName: string;
    callingCodes: string;
};

// Custom hook to fetch and manage data for dropdowns
// Endpoint that are null will not be fetched
export const useExtrasData = (endpoint: {
    extras: string | null;
    countries: string | null;
    states: string | null;
    banks: string | null;
}) => {
    const { authState } = useAuth();

    const [data, setData] = useState<{
        businessTypesData: Option[];
        industriesData: Option[];
        categoriesData: Option[];
        countriesData: CountriesOption[],
        statesData: Option[],
        banksData: Option[]
    }>({
        businessTypesData: [],
        industriesData: [],
        categoriesData: [],
        countriesData: [],
        statesData: [],
        banksData: []
    });

    const fetchData = async () => {
        try {
            // Fetch Extras
            if (endpoint.extras) {
                const response = await axiosInstance.get<Response>(endpoint.extras);

                if (!response.data.success) {
                    console.error(response.data.message || "Failed to fetch data.");
                    return;
                }

                const responseData = response.data.data;
                if (!responseData) {
                    console.error("No data found for extras.");
                    return;
                }

                const { BusinessType, Industry, Category } = responseData;

                setData((prev) => ({
                    ...prev,
                    businessTypesData: (BusinessType || []).map((type) => ({
                        value: type.id.toString(),
                        label: type.name,
                    })),
                    industriesData: (Industry || []).map((industry) => ({
                        value: industry.id.toString(),
                        label: industry.name,
                    })),
                    categoriesData: (Category || []).map((category) => ({
                        value: category.id.toString(),
                        label: category.name,
                    })),
                }));
            }


            // Fetch Countries
            if (endpoint.countries) {
                const countriesResponse = await axiosInstance.get<CountriesResponse>(endpoint.countries);
                if (!countriesResponse.data.success) {
                    console.error(countriesResponse.data.message || "Failed to fetch countries.");
                    return;
                }

                const countriesData = countriesResponse.data.data;
                if (!countriesData) {
                    console.error("No data found for countries.");
                    return;
                }

                setData((prev) => ({
                    ...prev,
                    countriesData: (countriesData || []).map((country) => ({
                        name: country.name || "",
                        isoName: country.isoName || "",
                        currencyCode: country.currencyCode || "",
                        currencyName: country.currencyName || "",
                        callingCodes: country.callingCodes || ""
                    }))
                }));
            }


            // Fetch States
            if (endpoint.states) {
                const statesResponse = await axiosInstance.get<StatesResponse>(endpoint.states);
                if (!statesResponse.data.success) {
                    console.error(statesResponse.data.message || "Failed to fetch states.");
                    return;
                }

                const statesData = statesResponse.data.data;
                if (!statesData) {
                    console.error("No data found for states.");
                    return;
                }

                setData((prev) => ({
                    ...prev,
                    statesData: (statesData || []).map((state) => ({
                        value: state.id || "",
                        label: state.name || ""
                    }))
                }));
            }


            // Fetch Banks
            if (endpoint.banks) {
                if (!authState?.token) return;

                const banksResponse = await axiosInstance.get<BankResponse>(endpoint.banks, {
                    headers: { Authorization: `Bearer ${authState?.token}` }
                });
                if (!banksResponse.data.success) {
                    console.error(banksResponse.data.message || "Failed to fetch banks.");
                    return;
                }

                const banksData = banksResponse.data.data;
                if (!banksData) {
                    console.error("No data found for banks.");
                    return;
                }

                console.log("banksData", banksData);

                setData((prev) => ({
                    ...prev,
                    banksData: (banksData?.banks || []).map((bank) => ({
                        value: bank.code || "",
                        label: bank.name || ""
                    }))
                }));
            }

        } catch (error) {
            handleAxiosError(error, (data: any) => {
                toast.error(data?.message || "An error occurred while fetching data.");
            });
        }
    };

    useEffect(() => {
        fetchData();

        return () => {
            setData({
                businessTypesData: [],
                industriesData: [],
                categoriesData: [],
                countriesData: [],
                statesData: [],
                banksData: []
            });
        };
    }, [endpoint.countries, endpoint.extras, endpoint.states, endpoint.banks, authState?.token]);

    return data;
};