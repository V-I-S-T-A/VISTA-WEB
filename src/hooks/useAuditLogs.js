import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLogService";

export const useAuditLogPage = params => useQuery({
  queryKey: ["audit-logs", "page", params],
  queryFn: ({ signal }) => auditLogService.getPage(params, { signal }),
  staleTime: 30_000,
  gcTime: 120_000,
  retry: 1,
});

export const useAuditLogs = ({
  page = 1,
  pageSize = 10,
  search = "",
  action = "",
  tableName = "",
  performedAfter = "",
  performedBefore = "",
} = {}) => {
  return useQuery({
    queryKey: [
      "audit-logs",
      {
        page,
        pageSize,
        search,
        action,
        tableName,
        performedAfter,
        performedBefore,
      },
    ],
    queryFn: () =>
      auditLogService.getAuditLogs({
        page,
        pageSize,
        search,
        action,
        tableName,
        performedAfter,
        performedBefore,
      }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};
