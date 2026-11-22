import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useAuth";
import { notificationService } from "../services/notificationService";
import { useToast } from "./toastContext";
import { tokenClaims } from "../services/realtimeService";

export default function StaffNotificationToasts() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const seen = useRef(new Set());
  const initialized = useRef(false);
  const sessionStarted = useRef(0);
  const enabled = Boolean(user?.user_id);
  const queryKey = ["notifications", user?.user_id];
  const { data } = useQuery({
    queryKey,
    queryFn: notificationService.getNotifications,
    enabled,
    staleTime: 15_000,
    refetchInterval: () => document.hidden ? 60_000 : 20_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    seen.current = new Set();
    initialized.current = false;
    sessionStarted.current = Date.now();
  }, [user?.user_id]);

  useEffect(() => {
    if (!enabled || !data?.results) return;
    if (!initialized.current) {
      data.results.forEach(item => seen.current.add(item.notification_id));
      initialized.current = true;
      sessionStarted.current = Date.now();
      return;
    }
    const item = data.results.find(notification => {
      const unseen = !seen.current.has(notification.notification_id);
      seen.current.add(notification.notification_id);
      return user?.role === "staff" && unseen && notification.type === "review_reply_created" && !notification.is_read &&
        new Date(notification.created_at).getTime() >= sessionStarted.current && !document.hidden;
    });
    if (!item) return;
    const accountId = user.user_id;
    const open = async () => {
      const isCurrent = () => String(tokenClaims(localStorage.getItem("access_token") || "").user_id) === String(accountId);
      let submission;
      try {
        submission = await notificationService.getStaffReviewSubmission(item.submission_id);
      } catch {
        if (isCurrent()) showToast("This submission is unavailable or you no longer have access.", "error");
        return;
      }
      if (!isCurrent()) return;
      try {
        await notificationService.markAsRead(item.notification_id);
        queryClient.invalidateQueries({ queryKey: ["notifications", accountId] });
      } catch { /* Keep navigation available if the read request temporarily fails. */ }
      if (user.role === "staff") {
        if (!isCurrent()) return;
        navigate("/staff/review-panel", { state: { submission, notificationId: item.notification_id } });
      } else {
        navigate("/admin/dashboard");
      }
    };

    showToast(item.message || "A student replied to your review.", "success", 8000, {
      scope: `notifications:${user.user_id}`,
      variant: "reply",
      actorName: item.actor_name,
      actorImageUrl: item.actor_image_url,
      submissionTitle: item.submission_title,
      headline: "replied to your review",
      detail: item.message,
      actionLabel: "View conversation",
      onClick: open,
    });
  }, [data, enabled, user?.role, user?.user_id, queryClient, navigate, showToast]);

  return null;
}
