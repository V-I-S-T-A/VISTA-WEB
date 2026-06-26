import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

export const organizationService = {
  async getAll(params) {
    const resp = await apiClient.get(API_ENDPOINTS.ORGANIZATIONS.LIST, { params });
    return resp.data;
  },

  async create(data) {
    const resp = await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, data);
    return resp.data;
  },

  async update(orgId, data) {
    const resp = await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.UPDATE(orgId), data);
    return resp.data;
  },

  async delete(orgId) {
    const resp = await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(orgId));
    return resp.data;
  },
};
