import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../services/organizationService";

export const useOrganizations = (params = {}) => {
  return useQuery({
    queryKey: ["organizations", params],
    queryFn: () => organizationService.getAll(params),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => organizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};
