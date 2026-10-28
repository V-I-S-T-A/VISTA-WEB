import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, CheckCircle2, Clock3, Loader2, RotateCcw, X } from "lucide-react";
import ErrorNotice from "./ErrorNotice";
import { notificationService } from "../services/notificationService";

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function getStatusStyle(message = "") {
  const normalized = message.toLowerCase();
  if (normalized.includes("approved")) return { label: "Approved", className: "bg-green-50 text-green-700", Icon: CheckCircle2 };
  if (normalized.includes("reject") || normalized.includes("return")) return { label: "Returned", className: "bg-amber-50 text-amber-700", Icon: RotateCcw };
  return { label: "Status update", className: "bg-blue-50 text-[#1f5cae]", Icon: Clock3 };
}

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
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={isOpen} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1f5cae] transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200">
        <Bell size={19} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 font-inter text-[10px] font-bold leading-none text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {isOpen && <section
        className="absolute right-0 top-full z-40 mt-2 overflow-hidden border border-[#b8cbe0] bg-white shadow-[0_12px_30px_rgba(15,42,74,0.18)]"
        style={{ width: "min(360px, calc(100vw - 24px))", borderRadius: "12px" }}
        aria-label="Student notifications"
      >
        <header className="flex items-center justify-between gap-3 bg-[#1f5cae] px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"><Bell size={18} aria-hidden="true" /></span>
            <div className="min-w-0">
              <h2 className="m-0 font-inter text-sm font-bold text-white">Notifications</h2>
              <p className="m-0 mt-0.5 font-inter text-[11px] text-blue-100">{isError ? "Unread count unavailable" : `${unreadCount} unread`}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isError && <span className="rounded-full bg-[#ffc700] px-2.5 py-1 font-inter text-[10px] font-bold text-gray-900">{unreadCount} NEW</span>}
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications" className="flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition hover:bg-white/15 hover:text-white"><X size={17} aria-hidden="true" /></button>
          </div>
        </header>
        <div className="max-h-[min(65vh,440px)] overflow-y-auto bg-[#f7f9fc] p-2.5">
          {isPending ? <div className="flex items-center justify-center gap-2 rounded-lg bg-white p-7 font-inter text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />Loading notifications…</div>
            : isError ? <div className="rounded-lg border border-[#e2e6ee] bg-white px-3 py-1"><ErrorNotice message="Notifications could not be loaded. Check the connection and try again." onRetry={() => refetch()} retrying={isFetching} /></div>
              : notifications.length === 0 ? <div className="rounded-lg border border-[#e2e6ee] bg-white p-7 text-center"><Bell size={24} className="mx-auto mb-2 text-gray-300" /><p className="m-0 font-inter text-sm font-semibold text-gray-700">You're all caught up</p><p className="mb-0 mt-1 font-inter text-xs text-gray-500">Submission updates will appear here.</p></div>
                : <ul className="m-0 list-none space-y-2 p-0">{notifications.map((item) => {
                  const status = getStatusStyle(item.message);
                  const StatusIcon = status.Icon;
                  return <li key={item.notification_id}>
                    <button type="button" onClick={() => openNotification(item)} className={`group flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1f5cae] ${item.is_read ? "border-[#e2e6ee] bg-white hover:border-[#b8cbe0] hover:bg-blue-50/40" : "border-[#c8d8ee] bg-[#f1f6fd] hover:border-[#9db8dc] hover:bg-[#eaf2fc]"}`}>
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${status.className}`}><StatusIcon size={17} aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-inter text-[13px] font-bold leading-5 text-[#142d55]">{item.submission_title || `Submission ${item.submission_id.slice(0, 8)}`}</span>
                          {!item.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#1f5cae]" aria-label="Unread" />}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 font-inter text-[10px] font-bold ${status.className}`}>{status.label}</span>
                          <span className="font-inter text-[11px] text-gray-600">{formatTime(item.created_at)}</span>
                        </span>
                        <span className="mt-1.5 block font-inter text-xs leading-5 text-gray-700">{item.message}</span>
                      </span>
                    </button>
                  </li>;
                })}</ul>}
        </div>
        <footer className="flex items-center gap-2 border-t border-[#e2e6ee] bg-white px-4 py-2.5 font-inter text-[11px] text-gray-500">
          <CheckCheck size={14} className="text-[#1f5cae]" aria-hidden="true" />Select an update to open its submission.
        </footer>
      </section>}
    </div>
  );
}
