import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";
import { toRequestConfig } from "../utils/multipartFormData";
import { fetchTablePage } from "../utils/tablePagination";

/**
 * User Service
 * Handles all user-related API calls
 */

export const userService = {
  /**
   * Get list of users with pagination, search, and filters
   */
  async getUsers({
    page = 1,
    pageSize = 50,
    search = "",
    role = "",
    isActive = null,
    excludeAdmin = false,
    signal,
  } = {}) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);

    if (search) params.append("search", search);
    if (role && role !== "All Roles") params.append("role", role);
    if (isActive !== null) params.append("is_active", isActive);
    if (excludeAdmin) params.append("exclude_admin", "true");

    return fetchTablePage(apiClient, API_ENDPOINTS.USERS.LIST, {
      params: Object.fromEntries(params), signal,
    });
  },

  async getSummary({ signal } = {}) {
    const { data } = await apiClient.get(`${API_ENDPOINTS.USERS.LIST}summary/`, {
      params: { exclude_admin: true }, signal,
    });
    return data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(userId) {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(userId));
    return response.data;
  },

  /**
   * Create a new user.
   * Pass `image` as a File in userData to upload an avatar — the request
   * automatically switches to multipart/form-data when a file is present.
   */
  async createUser(userData) {
    const { data, config } = toRequestConfig(userData);
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.CREATE,
      data,
      config,
    );
    return response.data;
  },

  /**
   * Send a new invitation for an account that has not signed in yet.
   */
  async resendInvitation(userId) {
    const response = await apiClient.post(
      `${API_ENDPOINTS.USERS.DETAIL(userId)}resend-invitation/`,
    );
    return response.data;
  },

  /**
   * Update a user, optionally uploading an avatar through multipart/form-data.
   */
  async updateUser(userId, userData) {
    const { data, config } = toRequestConfig(userData);
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.UPDATE(userId),
      data,
      config,
    );
    return response.data;
  },

  /**
   * Delete a user (marks as inactive)
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
    return response.data;
  },

  /**
   * Streams the server-generated users PDF report as a blob.
   * All filtering (search, role, is_active) happens server-side via
   * UserViewSet.export_list (same filterset as the standard list endpoint)
   * — this just triggers the request and hands back the raw response so
   * the caller can turn it into a download.
   */
  async exportUsers({ search = "", role = "", isActive = null, excludeAdmin = false } = {}) {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (role && role !== "All Roles") params.append("role", role);
    if (isActive !== null) params.append("is_active", isActive);
    if (excludeAdmin) params.append("exclude_admin", "true");

    return apiClient.get(`${API_ENDPOINTS.USERS.LIST}export/list/`, {
      params,
      responseType: "blob",
    });
  },
};
