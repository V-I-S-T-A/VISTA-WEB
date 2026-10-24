import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";

/**
 * Hook to fetch users with pagination, search, and filters
 * Uses React Query for caching and state management
 */
export const useUsers = ({
  page = 1,
  pageSize = 50,
  search = "",
  role = "",
  isActive = null,
  excludeAdmin = false,
} = {}) => {
  return useQuery({
    queryKey: ["users", { page, pageSize, search, role, isActive, excludeAdmin }],
    queryFn: ({ signal }) =>
      userService.getUsers({
        page,
        pageSize,
        search,
        role,
        isActive,
        excludeAdmin,
        signal,
      }),
    staleTime: 30_000,
    gcTime: 120_000,
    retry: 1,
  });
};

export const useUserSummary = () => useQuery({
  queryKey: ["users", "summary", { excludeAdmin: true }],
  queryFn: ({ signal }) => userService.getSummary({ signal }),
  staleTime: 30_000,
  gcTime: 120_000,
  retry: 1,
});

/**
 * Hook to fetch a single user
 */
export const useUser = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
