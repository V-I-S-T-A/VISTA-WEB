import { useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../config/api";
import { useCurrentUser } from "./useAuth";
import { createRealtimeSocket } from "../services/realtimeService";

export default function useVistaRealtime() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = user?.user_id;

  useEffect(() => {
    if (!userId) return undefined;

    let stopped = false;
    let socket;
    let retryTimer;
    let retryCount = 0;
    let refreshedAfterAuthFailure = false;

    const refreshRelevantQueries = (event) => {
      if (event.type !== "notification.changed" && event.type !== "review_log.changed" && event.type !== "review_reply.created") return;
      for (const queryKey of [["student-notifications"], ["submissions"], ["priority-submissions"], ["submission-statistics"], ["review-logs"], ["submission"]]) {
        queryClient.invalidateQueries({ queryKey });
      }
      window.dispatchEvent(new CustomEvent("vista:realtime-notification", { detail: event }));
    };

    const reconnect = () => {
      if (stopped) return;
      const delay = Math.min(1000 * 2 ** retryCount, 30000);
      retryCount = Math.min(retryCount + 1, 5);
      retryTimer = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (stopped) return;
      socket = createRealtimeSocket({
        onEvent: refreshRelevantQueries,
        onReady: () => {
          retryCount = 0;
          refreshedAfterAuthFailure = false;
          queryClient.invalidateQueries();
        },
        onDisconnected: async (event) => {
          if (stopped) return;
          if (event.code === 4401) {
            if (refreshedAfterAuthFailure) return;
            refreshedAfterAuthFailure = true;
            try {
              const refresh = localStorage.getItem("refresh_token");
              if (!refresh) throw new Error("Missing refresh token");
              const { data: tokens } = await axios.post(
                `${API_CONFIG.BASE_URL}/auth/token/refresh/`,
                { refresh },
              );
              if (stopped) return;
              if (tokens.access) localStorage.setItem("access_token", tokens.access);
              if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
              retryCount = 0;
            } catch {
              // Stop socket retries; an authenticated HTTP request handles session recovery.
              return;
            }
          }
          reconnect();
        },
      });
      if (!socket) reconnect();
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      socket?.close(1000, "Component cleanup");
    };
  }, [userId, queryClient]);
}
