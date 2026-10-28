import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronRight, Loader2, X } from "lucide-react";
import ErrorNotice from "./ErrorNotice";
import NotificationListItem from "./NotificationListItem";
import "./StudentNotifications.css";
import { notificationService } from "../services/notificationService";

const PREVIEW_LIMIT = 9;

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: notificationService.getNotifications,
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: false,
  });
  const markRead = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-notifications"] }),
  });
  const notifications = data?.results ?? [];
  const unreadCount = data?.unread_count ?? 0;

  useEffect(() => {
    const closeOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const openNotification = async (item) => {
    if (!item.is_read) {
      try {
        await markRead.mutateAsync(item.notification_id);
      } catch {
        // Navigation remains available if a temporary read-state request fails.
      }
    }
    setIsOpen(false);
    navigate(`/student/review-tracker/${item.submission_id}`);
  };

  return (
    <div ref={rootRef} className="student-notification-root">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={isOpen} className="student-notification-trigger">
        <Bell size={19} aria-hidden="true" />
        {unreadCount > 0 && <span className="student-notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {isOpen && <section
        className="student-notification-popover"
        aria-label="Student notifications"
      >
        <header className="student-notification-popover-header">
          <div className="student-notification-popover-title">
            <span className="student-notification-popover-title-icon"><Bell size={18} aria-hidden="true" /></span>
            <div className="min-w-0">
              <h2>Notifications</h2>
              <p>{isError ? "Unread count unavailable" : "Recent submission updates"}</p>
            </div>
          </div>
          <div className="student-notification-popover-actions">
            {!isError && unreadCount > 0 && <span className="student-notification-unread-pill">{unreadCount} unread</span>}
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications" className="student-notification-close"><X size={17} aria-hidden="true" /></button>
          </div>
        </header>
        <div className="student-notification-popover-body">
          {isPending ? <div className="student-notification-loading"><Loader2 size={16} className="mr-2 inline animate-spin" />Loading notifications…</div>
            : isError ? <div className="rounded-lg border border-[#e2e6ee] bg-white px-3 py-1"><ErrorNotice message="Notifications could not be loaded. Check the connection and try again." onRetry={() => refetch()} retrying={isFetching} /></div>
              : notifications.length === 0 ? <div className="student-notification-empty"><Bell size={22} /><strong>You're all caught up</strong><p>Submission updates will appear here.</p></div>
                : <ul className="student-notification-list">{notifications.slice(0, PREVIEW_LIMIT).map((item) => <NotificationListItem key={item.notification_id} notification={item} onClick={openNotification} />)}</ul>}
        </div>
        <footer className="student-notification-popover-footer">
          {notifications.length > PREVIEW_LIMIT
            ? <button type="button" className="student-notification-all-link" onClick={() => { setIsOpen(false); navigate("/student/profile"); }}>
                View all notifications for the past 30 days <ChevronRight size={15} aria-hidden="true" />
              </button>
            : <><CheckCheck size={14} color="#1f5cae" aria-hidden="true" />Select an update to open its submission.</>}
        </footer>
      </section>}
    </div>
  );
}
