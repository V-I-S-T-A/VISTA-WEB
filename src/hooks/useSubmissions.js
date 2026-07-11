import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionService } from "../services/submissionService";

export const useSubmissions = ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  dateFrom = "",
  dateTo = "",
} = {}) => {
  return useQuery({
    queryKey: [
      "submissions",
      { page, pageSize, search, status, dateFrom, dateTo },
    ],
    queryFn: () =>
      submissionService.getSubmissions({
        page,
        pageSize,
        search,
        status,
        dateFrom,
        dateTo,
      }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, status, remarksText = "" }) =>
      submissionService.updateStatus(submissionId, status, remarksText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["review-logs"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};
