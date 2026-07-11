import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

/**
 * Talks to GET /api/audit-logs/ (audit_logs.AuditLogViewSet).
 * Param names map 1:1 to audit_logs/filters.py's AuditLogFilter fields.
 */
export const auditLogService = {
  async getAuditLogs({
    page = 1,
    pageSize = 10,
    search = "",
    action = "",
    tableName = "",
    performedAfter = "",
    performedBefore = "",
  } = {}) {
    const params = new URLSearchParams();

    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);
    if (search) params.append("search", search);
    if (action) params.append("action", action);
    if (tableName) params.append("table_name", tableName);
    if (performedAfter) params.append("performed_after", performedAfter);
    if (performedBefore) params.append("performed_before", performedBefore);

    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.LIST, {
      params,
    });
    return response.data;
  },
};
