import apiClient from "../lib/axios";

export const reviewLogService = {
  async getReviewLogs({
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
    changedAfter = "",
    submissionId = "", // ADDED: Specific submission tracking
  } = {}) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);
    if (search) params.append("search", search);

    // FIXED: These now match your Django ReviewLogFilter exactly
    if (status) params.append("new_status", status);
    if (changedAfter) params.append("changed_after", changedAfter);
    if (submissionId) params.append("submission_id", submissionId);

    // FIXED: Changed from AUDIT_LOGS to standard review-logs endpoint
    const response = await apiClient.get("/review-logs/", {
      params,
    });
    return response.data;
  },
};
