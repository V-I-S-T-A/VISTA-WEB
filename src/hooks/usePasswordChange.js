import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const useRequestPasswordChangeCode = () => {
  return useMutation({
    mutationFn: () => authService.requestPasswordChangeCode(),
  });
};

export const useConfirmPasswordChange = () => {
  return useMutation({
    mutationFn: (payload) => authService.confirmPasswordChange(payload),
  });
};