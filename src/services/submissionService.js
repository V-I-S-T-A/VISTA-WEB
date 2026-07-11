import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

const STATUS_API_MAP = {
  "All Status": "",
  Pending: "pending",
  "Under Review": "under_review",
  Approved: "approved",
  Returned: "rejected",
  Rejected: "rejected",
  "Resubmission Required": "resubmission_required",
};

export const submissionService = {
  async getSubmissions({
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
    dateFrom = "",
    dateTo = "",
  } = {}) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);
    if (search) params.append("search", search);
    if (status && status !== "All Status") {
      params.append("status", STATUS_API_MAP[status] || status);
    }
    // Maps to SubmissionFilter's submitted_after/submitted_before
    // (DateTimeFilter, gte/lte) — filtering happens in the DB, not the client.
    if (dateFrom) params.append("submitted_after", dateFrom);
    if (dateTo) params.append("submitted_before", dateTo);

    const response = await apiClient.get(API_ENDPOINTS.SUBMISSIONS.LIST, {
      params,
    });
    return response.data;
  },

  async updateStatus(submissionId, status, remarksText = "") {
    const payload = {
      status: STATUS_API_MAP[status] || status,
    };

    if (remarksText) {
      payload.remarks_text = remarksText;
    }

    const response = await apiClient.patch(
      API_ENDPOINTS.SUBMISSIONS.STATUS(submissionId),
      payload,
    );
    return response.data;
  },

  /**
   * Streams the server-generated PDF as a blob. All filtering (status,
   * search, date range) happens server-side via query params handled by
   * SubmissionViewSet.export_list — this only triggers the request and
   * hands back the raw response so the caller can turn it into a download.
   */
  async exportList({
    search = "",
    status = "",
    dateFrom = "",
    dateTo = "",
  } = {}) {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (status && status !== "All Status") {
      params.append("status", STATUS_API_MAP[status] || status);
    }
    // Export endpoint uses its own plain YYYY-MM-DD params (date_from/date_to),
    // separate from the ISO datetime submitted_after/submitted_before used
    // by the standard list filter.
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    return apiClient.get(API_ENDPOINTS.SUBMISSIONS.EXPORT_LIST, {
      params,
      responseType: "blob",
    });
  },
};
