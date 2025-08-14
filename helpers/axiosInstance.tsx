import axios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

export const ApiEndpoints = {
  SEND_OTP: '/email',
  VERIFY_OTP: '/email-verify',
  REGISTER: "/register",
  LOGIN: "/login"
} as const;

export interface ApiResponse<T> {
    switch: any;
  risk_profile:any;
  transactions: any;
  payoutFees: any[];
  collectionFees: any[];
    transactionReference: string;
  status: string;
  message: string;
  success: boolean;
  data?: T;
  code: string;
  token?: string;
  pagination?: {
    totalItems: number;
    limit: number;
    totalPages: number;
    totalPage: number;
    currentPage: number
  };
}

const preAxiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? process.env.NEXT_PUBLIC_BASE_URL_PROD
    : process.env.NEXT_PUBLIC_BASE_URL_DEV,
  timeout: 10000, // Add timeout of 10 seconds
});

// Request interceptor to check network status before making requests
preAxiosInstance.interceptors.request.use(
  (config) => {
    if (!navigator.onLine) {
      toast.error("No internet connection. Please check your network.");
      return Promise.reject(new Error('No internet connection'));
    }
    return config;
  },
  (error) => {
    console.log("request error", error)
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
preAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // If the response is successful, return it
    return response;
  },
  (error) => {
    console.error("Error from Axios:", error);

    if (!error.response) {
      // Handle network errors
      if (!navigator.onLine) {
        toast.error("No internet connection. Please check your network.");
      } else if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
      return Promise.reject(error);
    }

    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      if (status === 500) {
        // Handle internal server error
        toast.error("Internal server error. Please try again later.");
        console.error("Server error details:", data);
        return Promise.reject(error);
      }

      if (status === axios.HttpStatusCode.Unauthorized || status === axios.HttpStatusCode.Forbidden) {
        toast.error("Unauthorized request. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return Promise.reject(error);
      }
    }

    // For other status codes, reject the promise with the error
    return Promise.reject(error);
  }
);


// Add network status monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    toast.success("Back online!");
  });

  window.addEventListener('offline', () => {
    toast.error("You are offline. Please check your internet connection.");
  });
}

/**
 * Enhanced error handler that includes network error handling
 * 
 * @param {unknown} error - The error object received from Axios
 * @param {(data: unknown) => void} callback - A function to be called with the error data
 * 
 * @example
 * handleAxiosError(error, (data) => {
 *   console.error(data);
 * });
 */
export const handleAxiosError = (error: unknown, callback: (message: string) => void) => {
  if (!navigator.onLine) {
    callback("No internet connection. Please check your network.");
    return;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      callback("Request timed out. Please try again.");
    } else if (error.response) {
      // Handle specific HTTP status codes if needed
      callback(error.response.data?.message || "An error occurred while processing your request.");
    } else if (error.request) {
      callback("No response received from server. Please try again.");
    } else {
      callback("An unexpected error occurred.");
    }
  } else {
    console.error("Non-Axios error:", error);
    callback("An unexpected error occurred.");
  }
};

// Rest of the code remains the same...
type ApiEndpointValues = typeof ApiEndpoints[keyof typeof ApiEndpoints];
type UrlType = keyof typeof ApiEndpoints | ApiEndpointValues | string;

interface AxiosInstanceWithTypedURLs {
  post<T = any>(url: keyof typeof ApiEndpoints, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  get<T = any>(url: keyof typeof ApiEndpoints, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  put<T = any>(url: keyof typeof ApiEndpoints, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  patch<T = any>(url: keyof typeof ApiEndpoints, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  delete<T = any>(url: keyof typeof ApiEndpoints, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>>;
}

const resolveUrl = (url: UrlType): string => {
  if (typeof url === "string") {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url; // Allow direct full URLs
    }
    if (url in ApiEndpoints) {
      return ApiEndpoints[url as keyof typeof ApiEndpoints]; // Resolve from ApiEndpoints
    }
  }
  return url;
};

const axiosInstance: AxiosInstanceWithTypedURLs = {
  ...preAxiosInstance,
  post: <T = any>(url: UrlType, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return preAxiosInstance.post(resolveUrl(url), data, config);
  },
  get: <T = any>(url: UrlType, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return preAxiosInstance.get(resolveUrl(url), config);
  },
  put: <T = any>(url: UrlType, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return preAxiosInstance.put(resolveUrl(url), data, config);
  },
  patch: <T = any>(url: UrlType, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return preAxiosInstance.patch(resolveUrl(url), data, config);
  },
  delete: <T = any>(url: UrlType, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return preAxiosInstance.delete(resolveUrl(url), config);
  },
};

export default axiosInstance;