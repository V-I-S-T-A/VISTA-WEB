import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";
import { submissionService } from "./submissionService";

export const notificationService = {
  async getStaffReviewSubmission(id) {
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error("Invalid submission target");
    }
    const entry = await submissionService.getSubmissionById(id);
    if (entry.submission_id?.toLowerCase() !== id.toLowerCase()) throw new Error("Submission target mismatch");
    // Same review-page state shape used by the Staff dashboard's Review action.
    return {
      id: entry.submission_id,
      title: entry.title || "Untitled Document",
      site: entry.org_name || "Unknown Organization",
      contactEmail: entry.submitted_by_email
        ? `${entry.submitted_by_name || ""} (${entry.submitted_by_email})`.trim()
        : entry.submitted_by_name || "N/A",
      documentType: entry.doc_type_name || "N/A",
      submittedDate: new Date(entry.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: entry.status,
    };
  },
  async getNotifications() {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  },
  async markAsRead(notificationId) {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId));
    return response.data;
  },
};
