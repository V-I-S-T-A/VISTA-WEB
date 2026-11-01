import axios from "axios";
import { API_CONFIG } from "../config/api";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import { getLoginRedirectPath } from "../utils/redirectTarget";
import { tokenClaims } from "../services/realtimeService";

let refreshRequest;
let refreshingSession;

function endSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.dispatchEvent(new Event("vista:session-changed"));
  const publicPaths = ["/", "/login", "/get-app", "/privacy-policy", "/terms-of-service"];
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  if (!publicPaths.includes(currentPath)) {
    window.location.href = getLoginRedirectPath(`${window.location.pathname}${window.location.search}`);
  }
}

// REST and WebSocket reconnects share one refresh, including rotated refresh tokens.
export function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    endSession();
    return Promise.reject(new Error("Your session has expired. Please sign in again."));
  }
  if (refreshRequest && refreshingSession === refresh) return refreshRequest;
  refreshingSession = refresh;
  const request = axios.post(`${API_CONFIG.BASE_URL}/auth/token/refresh/`, { refresh })
    .then(({ data }) => {
      if (localStorage.getItem("refresh_token") !== refresh) throw new Error("Session changed");
      localStorage.setItem("access_token", data.access);
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
      return data.access;
    }).catch(error => {
      if (localStorage.getItem("refresh_token") === refresh && [400, 401].includes(error.response?.status)) endSession();
      throw error;
    }).finally(() => {
      if (refreshRequest === request) refreshRequest = undefined;
    });
  refreshRequest = request;
  return request;
}

export function getAccessToken() {
  const token = localStorage.getItem("access_token");
  const expiry = tokenClaims(token || '').exp;
  return !token || (expiry && expiry * 1000 <= Date.now() + 30_000)
    ? refreshAccessToken() : Promise.resolve(token);
}

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
    config._sessionUser = tokenClaims(accessToken || '').user_id;
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

      if (originalRequest._sessionUser !== tokenClaims(localStorage.getItem("access_token") || '').user_id) return Promise.reject(error);
      const currentAccess = localStorage.getItem("access_token");
      const access = currentAccess && originalRequest.headers.Authorization !== `Bearer ${currentAccess}`
        ? await getAccessToken() : await refreshAccessToken();
      if (originalRequest._sessionUser !== tokenClaims(localStorage.getItem("access_token") || '').user_id) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
