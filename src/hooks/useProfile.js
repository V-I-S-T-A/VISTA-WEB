import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { reconcileAccessScope } from "../utils/accessScope";

/**
 * Hook to fetch the current logged-in user's own profile (GET /auth/me/).
 * Separate from useUser(userId), which is for admins looking up other users.
 */
export const useProfile = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["me"],
    queryFn: async ({ signal }) => {
      const user = await authService.me({ signal });
      await reconcileAccessScope(queryClient, user, { preserveProfileRequest: true });
      queryClient.setQueryData(["current_user"], user);
      return user;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to update the current logged-in user's own profile
 * (PATCH /auth/me/), including an optional avatar image upload.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) => authService.updateMe(profileData),
    onSuccess: async (data) => {
      await reconcileAccessScope(queryClient, data);
      queryClient.setQueryData(["current_user"], data);
      // Seed the cache with the fresh profile instead of just invalidating,
      // so the UI updates immediately without a refetch round-trip.
      queryClient.setQueryData(["me"], data);
    },
  });
};
