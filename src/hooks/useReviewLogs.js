import { useQuery } from "@tanstack/react-query";
import { reviewLogService } from "../services/reviewLogService";

export const useReviewLogs = ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  changedAfter = "",
  submissionId = "", // ADDED
} = {}) => {
  return useQuery({
    // ADDED submissionId to the queryKey so React Query knows when to refetch
    queryKey: [
      "review-logs",
      { page, pageSize, search, status, changedAfter, submissionId },
    ],
    queryFn: () =>
      reviewLogService.getReviewLogs({
        page,
        pageSize,
        search,
        status,
        changedAfter,
        submissionId, // ADDED
      }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};
