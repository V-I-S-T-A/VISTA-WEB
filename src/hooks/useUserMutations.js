import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }) =>
      userService.updateUser(userId, userData),
    onSuccess: (data) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: ["user", data.user_id] });
      // Invalidate users list query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
