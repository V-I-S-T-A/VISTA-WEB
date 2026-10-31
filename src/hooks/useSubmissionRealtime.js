import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../config/api";

/**
 * Shared /ws/notifications/ contract (also used by VISTA-MOBILE).
 * Authentication uses a JWT in the FIRST socket frame, never the URL.
 * Events are invalidation hints; REST APIs remain the source of truth.
 */
export function useSubmissionRealtime(submissionId, onChange) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let stopped = false;
    let socket;
    let timer;
    let attempts = 0;
    const base = new URL(API_CONFIG.BASE_URL, window.location.href);
    const url = new URL(`${base.protocol === "https:" ? "wss:" : "ws:"}//${base.host}/ws/notifications/`);

    const refresh = (payload) => {
      if (payload?.type?.startsWith("notification.") || payload?.type === "notification.changed") {
        queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      }
      const id = payload?.submission_id;
      if (payload?.type === "ready" || payload?.type === "submission.created" ||
          payload?.type === "submission.updated" || payload?.type === "review_log.created" ||
          payload?.type === "review_reply.created") {
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        queryClient.invalidateQueries({ queryKey: ["priority-submissions"] });
      }
      if (id && String(id) === String(submissionId)) {
        queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
        queryClient.invalidateQueries({ queryKey: ["review-logs"] });
        if (payload.type === "review_reply.created" && payload.review_log_id) {
          queryClient.invalidateQueries({ queryKey: ["review-replies", payload.review_log_id] });
        }
        onChange?.();
      } else if (payload?.type === "ready" && submissionId) {
        // Reconcile missed events after a reconnect.
        queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
        queryClient.invalidateQueries({ queryKey: ["review-logs"] });
        queryClient.invalidateQueries({ queryKey: ["review-replies"] });
        onChange?.();
      }
    };

    const connect = () => {
      if (stopped) return;
      const access = localStorage.getItem("access_token");
      if (!access) return;
      socket = new WebSocket(url.toString());
      socket.onopen = () => {
        // Re-read token in case a refresh occurred while reconnecting.
        const token = localStorage.getItem("access_token");
        if (!token) { socket.close(); return; }
        socket.send(JSON.stringify({ token }));
      };
      socket.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data);
          if (payload.type === "ready") attempts = 0;
          refresh(payload);
        } catch { /* Ignore malformed events. */ }
      };
      socket.onclose = () => {
        if (stopped) return;
        const wait = Math.min(30_000, 1000 * 2 ** Math.min(attempts++, 5));
        timer = setTimeout(connect, wait);
      };
      socket.onerror = () => { socket?.close(); };
    };

    connect();
    const resume = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
        if (submissionId) refresh({ type: "ready" });
      }
    };
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
      socket?.close();
    };
  }, [submissionId, queryClient, onChange]);
}
