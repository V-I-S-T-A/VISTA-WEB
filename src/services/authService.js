import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";
import { toRequestConfig } from "../utils/multipartFormData";

export const authService = {
  async login({ email, password }) {
    const resp = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return resp.data;
  },

  async logout({ refresh }) {
    const resp = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh });
    return resp.data;
  },

  async refreshToken(refresh) {
    const resp = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refresh });
    return resp.data;
  },

  async me() {
    const resp = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return resp.data;
  },

  async updateMe(profileData) {
    const { data, config } = toRequestConfig(profileData);
    const resp = await apiClient.patch(API_ENDPOINTS.AUTH.ME, data, config);
    return resp.data;
  },
};
