/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  ENDPOINTS: {
    USERS: "/users",
    AUTH: "/auth",
    ORGANIZATIONS: "/organizations",
  },
};

export const API_ENDPOINTS = {
  USERS: {
    LIST: `${API_CONFIG.ENDPOINTS.USERS}/`,
    CREATE: `${API_CONFIG.ENDPOINTS.USERS}/`,
    DETAIL: (userId) => `${API_CONFIG.ENDPOINTS.USERS}/${userId}/`,
    UPDATE: (userId) => `${API_CONFIG.ENDPOINTS.USERS}/${userId}/`,
    DELETE: (userId) => `${API_CONFIG.ENDPOINTS.USERS}/${userId}/`,
  },
  AUTH: {
    LOGIN: `${API_CONFIG.ENDPOINTS.AUTH}/login/`,
    LOGOUT: `${API_CONFIG.ENDPOINTS.AUTH}/logout/`,
    ME: `${API_CONFIG.ENDPOINTS.AUTH}/me/`,
    REFRESH: `${API_CONFIG.ENDPOINTS.AUTH}/token/refresh/`,
    CHANGE_PASSWORD: `${API_CONFIG.ENDPOINTS.AUTH}/change-password/`,
  },
  ORGANIZATIONS: {
    LIST: `${API_CONFIG.ENDPOINTS.ORGANIZATIONS}/`,
    CREATE: `${API_CONFIG.ENDPOINTS.ORGANIZATIONS}/`,
    DETAIL: (orgId) => `${API_CONFIG.ENDPOINTS.ORGANIZATIONS}/${orgId}/`,
    UPDATE: (orgId) => `${API_CONFIG.ENDPOINTS.ORGANIZATIONS}/${orgId}/`,
    DELETE: (orgId) => `${API_CONFIG.ENDPOINTS.ORGANIZATIONS}/${orgId}/`,
  },
};
