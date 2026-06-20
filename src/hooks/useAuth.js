import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => authService.login({ email, password }),
    onSuccess: (data) => {
      // expected data: { user: {..}, tokens: { access, refresh } }
      if (data?.tokens?.access)
        localStorage.setItem("access_token", data.tokens.access);
      if (data?.tokens?.refresh)
        localStorage.setItem("refresh_token", data.tokens.refresh);
      // prime current user
      queryClient.setQueryData(["current_user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ refresh }) => authService.logout({ refresh }),
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
