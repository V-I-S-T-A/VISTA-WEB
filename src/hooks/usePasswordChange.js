import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const useRequestPasswordChangeCode = () => {
  return useMutation({
    mutationFn: () => authService.requestPasswordChangeCode(),
  });
};

export const useConfirmPasswordChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => authService.confirmPasswordChange(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["current_user"] });
    },
  });
};
