import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "@/types";

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  transformRequest: [
    (data, headers) => {
      // Don't transform FormData - let axios/browser handle it
      if (data instanceof FormData) {
        return data;
      }
      // For other data, transform to JSON
      return JSON.stringify(data);
    },
  ],
});

/**
 * Request Interceptor - Add auth headers if needed
 */
apiClient.interceptors.request.use(
  (config) => {
    // For FormData requests, delete Content-Type
    // Let axios handle it automatically with proper boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data) {
      // For JSON requests, set proper Content-Type
      config.headers["Content-Type"] = "application/json";
    }
    // Add any auth tokens here if needed
    // const token = localStorage.getItem("authToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle responses and errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: "An error occurred",
      status: error.status || 500,
    };

    if (error.response) {
      apiError.status = error.response.status;
      const responseData = error.response.data as Record<string, unknown> | undefined;
      apiError.message =
        (typeof responseData?.message === "string" ? responseData.message : null) ||
        error.message ||
        "Server error occurred";
      apiError.details = responseData;
    } else if (error.request) {
      apiError.message = "No response from server";
    } else {
      apiError.message = error.message || "Request failed";
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
