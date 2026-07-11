import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

export const reviewLogService = {
  async getReviewLogs({
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
    changedAfter = "",
  } = {}) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);
    if (search) params.append("search", search);
    if (status) params.append("action", status);
    if (changedAfter) params.append("performed_after", changedAfter);

    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.LIST, {
      params,
    });
    return response.data;
  },
};
