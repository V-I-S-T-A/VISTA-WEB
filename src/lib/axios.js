import axios from "axios";
import { API_CONFIG } from "../config/api";
import { getApiErrorMessage } from "../utils/apiErrorMessage";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    error.message = getApiErrorMessage(error);
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken },
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshError.message = "Your session has expired. Please sign in again.";
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        const publicPaths = ["/", "/login", "/get-app", "/privacy-policy", "/terms-of-service"];
        const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
        if (!publicPaths.includes(currentPath)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
