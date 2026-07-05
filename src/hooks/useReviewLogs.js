import { useQuery } from "@tanstack/react-query";
import { reviewLogService } from "../services/reviewLogService";

export const useReviewLogs = ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  changedAfter = "",
} = {}) => {
  return useQuery({
    queryKey: ["review-logs", { page, pageSize, search, status, changedAfter }],
    queryFn: () =>
      reviewLogService.getReviewLogs({
        page,
        pageSize,
        search,
        status,
        changedAfter,
      }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};
