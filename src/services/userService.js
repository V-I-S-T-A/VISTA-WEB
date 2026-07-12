import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";
import { toRequestConfig } from "../utils/multipartFormData";

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
  } = {}) {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (role && role !== "All Roles") params.append("role", role);
    if (isActive !== null) params.append("is_active", isActive);

    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params });

    // Backend returns paginated data, handle accordingly
    // If backend supports page param, add it here
    return response.data;
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
   * Update a user.
   * Pass `image` as a File in userData to replace the avatar — the request
   * automatically switches to multipart/form-data when a file is present.
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
};
