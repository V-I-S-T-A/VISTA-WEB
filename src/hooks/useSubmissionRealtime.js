import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/axios";
import { API_CONFIG } from "../config/api";

/**
 * Read-only events; all data comes from existing authenticated REST endpoints.
 * Short-lived tickets keep long-lived JWTs out of WebSocket URLs.
 */
export function useSubmissionRealtime(submissionId, onChange) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!submissionId) return undefined;
    let closed = false;
    let socket;
    let retryTimer;
    let attempt = 0;

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
      queryClient.invalidateQueries({ queryKey: ["review-logs"] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["priority-submissions"] });
      onChange?.();
    };

    const connect = async () => {
      if (closed) return;
      try {
        const response = await apiClient.post(
          `/realtime/submissions/${encodeURIComponent(submissionId)}/ticket/`
        );
        if (closed) return;
        const base = new URL(API_CONFIG.BASE_URL, window.location.href);
        const scheme = base.protocol === "https:" ? "wss:" : "ws:";
        const url = new URL(`${scheme}//${base.host}/ws/submissions/${encodeURIComponent(submissionId)}/`);
        url.searchParams.set("ticket", response.data.ticket);
        socket = new WebSocket(url.toString());
        socket.onopen = () => {
          attempt = 0;
          refresh(); // Recover events missed while disconnected.
        };
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "submission.changed" &&
                String(payload.submission_id) === String(submissionId)) refresh();
          } catch { /* Ignore malformed events. */ }
        };
        socket.onclose = () => {
          if (closed) return;
          const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt++, 5));
          retryTimer = setTimeout(connect, delay);
        };
      } catch {
        if (!closed) {
          const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt++, 5));
          retryTimer = setTimeout(connect, delay);
        }
      }
    };
    connect();
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      closed = true;
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisible);
      socket?.close();
    };
  }, [submissionId, queryClient, onChange]);
}
