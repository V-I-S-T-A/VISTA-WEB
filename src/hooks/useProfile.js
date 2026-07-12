import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

/**
 * Hook to fetch the current logged-in user's own profile (GET /auth/me/).
 * Separate from useUser(userId), which is for admins looking up other users.
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
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
    onSuccess: (data) => {
      // Seed the cache with the fresh profile instead of just invalidating,
      // so the UI updates immediately without a refetch round-trip.
      queryClient.setQueryData(["me"], data);
    },
  });
};
