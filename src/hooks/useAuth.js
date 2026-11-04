import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { reconcileAccessScope } from "../utils/accessScope";

export const useCurrentUser = ({ poll = false } = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["current_user"],
    queryFn: async ({ signal }) => reconcileAccessScope(queryClient, await authService.me({ signal })),
    staleTime: 30 * 1000,
    refetchInterval: poll ? 30 * 1000 : false,
    retry: false,
    enabled: !!localStorage.getItem("access_token") || !!localStorage.getItem("refresh_token"),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => authService.login({ email, password }),
    onSuccess: (data) => {
      queryClient.clear();
      // expected data: { user: {..}, tokens: { access, refresh } }
      if (data?.tokens?.access)
        localStorage.setItem("access_token", data.tokens.access);
      if (data?.tokens?.refresh)
        localStorage.setItem("refresh_token", data.tokens.refresh);
      window.dispatchEvent(new Event("vista:session-changed"));
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
      window.dispatchEvent(new Event("vista:session-changed"));
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
