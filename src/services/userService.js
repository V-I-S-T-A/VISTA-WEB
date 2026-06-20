import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

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
   * Create a new user
   */
  async createUser(userData) {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, userData);
    return response.data;
  },

  /**
   * Update a user
   */
  async updateUser(userId, userData) {
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.UPDATE(userId),
      userData,
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
