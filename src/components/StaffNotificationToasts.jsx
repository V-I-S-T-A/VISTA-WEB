import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useAuth";
import { notificationService } from "../services/notificationService";
import defaultAvatar from "../assets/shared/default_user.webp";

export default function StaffNotificationToasts() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
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
    if (item) setToast({ ...item, _accountId: user.user_id });
  }, [data, enabled, user?.role, user?.user_id]);

  if (!enabled || toast?._accountId !== user?.user_id) return null;

  const open = async () => {
    const item = toast;
    setToast(null);
    try {
      await notificationService.markAsRead(item.notification_id);
      queryClient.invalidateQueries({ queryKey });
    } catch { /* Keep navigation available if the read request temporarily fails. */ }
    if (user.role === "staff") {
      navigate("/staff/review-panel", { state: { submission: { id: item.submission_id }, notificationId: item.notification_id } });
    } else {
      navigate("/admin/dashboard");
    }
  };

  return <aside className="fixed bottom-5 right-5 z-[100] w-[min(380px,calc(100vw-2rem))] motion-safe:animate-[vista-toast-in_.22s_ease-out]" aria-live="polite" aria-label="New notifications">
    <div className="flex gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_40px_rgba(20,45,85,.2)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff6cc] text-[#1f5cae]"><Bell size={19} aria-hidden="true" /></span>
      {toast.actor_image_url && <img src={toast.actor_image_url} onError={event => { event.currentTarget.src = defaultAvatar; }} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />}
      <button type="button" onClick={open} className="min-w-0 flex-1 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1f5cae]">
        <strong className="block text-sm font-bold text-[#142d55]">New Student Reply</strong>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-gray-600">{toast.message}</span>
        <span className="mt-2 block text-xs font-bold text-[#1f5cae]">View conversation →</span>
      </button>
      <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification" className="h-7 rounded p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1f5cae]"><X size={16} /></button>
    </div>
    <style>{`@keyframes vista-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[vista-toast-in_\\.22s_ease-out\\] { animation: none !important; } }`}</style>
  </aside>;
}
