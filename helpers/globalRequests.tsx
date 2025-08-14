import { AuthMode, BusinessDetailsType } from '@/contexts/reducerTypes';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance'
import { GetBusinessesResponse } from '@/types';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';
// hooks/useApiData.ts
import { useUI } from '@/contexts/uiContext';
import { useState, useCallback, useEffect, useMemo } from "react";


// Get Industries, fetches industries from the backend
/**
 * @deprecated
 * @param token 
 * @returns 
 */
export const getIndustries = async (token: string): Promise<string[] | null> => {
    return null
    try {
        const response = await axiosInstance.get('/common/get-industries');

        if (!response.data.status || !response.data?.data) { return null }

        return response.data.data as string[];
    } catch (error) {
        console.error('Error getting industries:', error);
        return null;
    }
}

// Get Countries, fetches countries from the backend
/**
 * @deprecated
 * @param token 
 * @returns 
 */
export const getCountries = async (token: string): Promise<{
    capital: string,
    continentName: string,
    countryCode: string,
    countryName: string,
    currencyCode: string,
    population: number,
}[] | null> => {
    try {
        return null
        if (!token) { return null };
        const response = await axiosInstance.get('/common/get-countries', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.status || !response.data?.data || !Array.isArray(response.data?.data)) { return null }

        return response.data.data;
    } catch (error) {
        console.error('Error getting countries:', error);
        return null;
    }
}


// Get Banks, fetches banks from the backend
/**
 * @deprecated
 * @param token 
 * @returns 
 */
export const getBanks = async (token: string): Promise<{ name: string, bank_code: string }[] | null> => {
    try {
        return null
        if (!token) { return null };
        const response = await axiosInstance.get('/common/get-banks', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.status || !response.data?.data) { return null }

        // let returnedData = response.data.data.map((item: any) => ({
        //     name: item?.name,
        //     bank_code: item?.nipCode
        // }))
        // return returnedData;
    } catch (error) {
        console.error('Error getting banks:', error);
        return null;
    }
}

// Get Banks, fetches banks from the backend
/**
 * @param token 
 * @returns 
 */
export const getBusinesses = async (token: string): Promise<BusinessDetailsType[] | null> => {
    if (!token) {
        toast.error("Authorization Error")
        return null
    };
    try {
        const response = await axiosInstance.get<GetBusinessesResponse[]>('/businesses', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.success || !response.data?.data) { return null }

        const returnedData: BusinessDetailsType[] = response.data.data.map((item) => ({
            businessName: item?.name || '',
            tradeName: item?.trade_name || item?.name || '',
            authMode: item?.authMode || 'pin',
            businessCountry: item?.biz_country || '',
            businessCountryIsoName: item?.biz_country_isoName || '',
            businessId: (item?.id || '').toString(),
            businessRCNumber: item?.rcNumber || '',
            businessType: item?.business_type || '',
            description: item?.description || '',
            industry: (item?.industry_id || '').toString(),
            brandName: item?.trade_name || '',
            supportEmail: item?.support_email || '',
            supportPhone: item?.support_phone || '',
            website: item?.biz_url || '',
            kycStatus: (item?.kyc_status || 'unsubmitted') as 'submitted' | 'unsubmitted' | 'approved' | 'rejected',
            status: (item.status || 'pending') as 'active' | 'inactive' | 'pending'
        }))
        return returnedData;
    } catch (error) {
        handleAxiosError(error, (message) => toast.error(message || 'An error occurred while fetching businesse'));
        console.error('Error getting businesses:', error);
        return null;
    }
}


/**
 * Represents the structure of an API response.
 * 
 * @property {boolean} status - Indicates if the request was successful.
 * @property {T} data - The data returned by the API.
 * @property {string} [message] - An optional message returned by the API.
 */
interface ApiResponse<T> {
    status: boolean;
    data: T;
    message?: string;
}

/**
 * Represents a date filter for API requests.
 * 
 * @property {string} startDate - The start date of the filter.
 * @property {string} endDate - The end date of the filter.
 */
interface DateFilter {
    startDate: string;
    endDate: string;
}

/**
 * Represents query parameters for API requests.
 * 
 * @property {[key: string]: string | number | boolean | undefined} - The query parameters.
 */
interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Configuration for the useApiData hook.
 * 
 * @property {string} endpoint - The API endpoint to fetch data from.
 * @property {string} [token] - The authentication token for the request.
 * @property {(data: T) => T} [transformResponse] - An optional function to transform the response data.
 * @property {boolean} [includeDateFilter] - Indicates if a date filter should be included in the request.
 * @property {QueryParams} [additionalParams] - Additional query parameters to include in the request.
 * @property {any[]} [dependencies] - Dependencies for the useEffect hook.
 */
interface UseApiDataConfig<T> {
    endpoint: string;
    token?: string;
    transformResponse?: (data: T) => T;
    includeDateFilter?: boolean;
    additionalParams?: QueryParams;
    dependencies?: any[];
}

/**
 * A hook to fetch data from an API endpoint.
 * 
 * @param {UseApiDataConfig<T>} config - The configuration for the hook.
 * @returns {{ data: T | null; isLoading: boolean; error: string | null; refetch: () => void }} - An object containing the fetched data, loading state, error message, and a refetch function.
 */
export function useFetchHook<T>({
    endpoint,
    token,
    transformResponse,
    includeDateFilter = false,
    additionalParams = {},
    dependencies = []
}: UseApiDataConfig<T>) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { dateFilter, filterState } = useUI();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Combine date filter with additional params if needed
                const params: QueryParams = {
                    ...additionalParams,
                    ...(includeDateFilter && dateFilter ? {
                        start_date: dateFilter.startDate,
                        end_date: dateFilter.endDate
                    } : {})
                };

                // Remove null values from additionalParams
                Object.keys(params).forEach(key => {

                    if (params[key] === undefined || params[key] === '' || params[key] === null) {
                        console.log(`Deleted key: ${key}`);
                        delete params[key];
                    }
                });

                const response = await axiosInstance.get<ApiResponse<T>>(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });
                if (response.data.status && response.data.data) {
                    const transformedData = transformResponse
                        ? transformResponse(response.data.data as T)
                        : response.data.data as T;
                    setData(transformedData);
                } else {
                    console.log("something went wrong fetching data")
                    throw new Error(response.data.message || 'Failed to fetch data');
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An error occurred';
                console.log("message", message)
                setError(message);
                handleAxiosError(error, (data) => {
                    toast.error(data);
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, dateFilter, ...dependencies]);

    return { data, isLoading, error, refetch: () => { } };
}


interface Pagination {
  totalItems: number;
  totalPages: number;
  limit: number;
}

export const useFetchTable = <T,>(
  endpoint: string,
  authToken: string | null,
  queryParams: any
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    totalPages: 1,
    limit: 20,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(
    async (page: number) => {
      if (!authToken) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get<T>(
          endpoint,
          {
            params: { ...queryParams, page, limit: pagination.limit },
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        setData(response.data.data ? response.data.data : null);
        setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
      } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, queryParams, pagination.limit, endpoint]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchData(page);
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  return { data, loading, pagination, currentPage, handlePageChange };
};


export const useQueryParams = <T,>(
  filterState: T,
  queryMapper: (state: T) => Record<string, any>
) => {
  return useMemo(() => queryMapper(filterState), [filterState, queryMapper]);
};
