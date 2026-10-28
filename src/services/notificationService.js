import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

export const notificationService = {
  async getNotifications() {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  },
  async markAsRead(notificationId) {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
    return response.data;
  },
};
