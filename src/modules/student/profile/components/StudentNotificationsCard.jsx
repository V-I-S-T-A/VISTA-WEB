import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import ErrorNotice from "../../../../components/ErrorNotice";
import NotificationListItem from "../../../../components/NotificationListItem";
import { notificationService } from "../../../../services/notificationService";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function StudentNotificationsCard() {
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
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const notifications = (data?.results ?? []).filter((item) => new Date(item.created_at).getTime() >= cutoff);

  const openNotification = async (item) => {
    if (!item.is_read) {
      try { await markRead.mutateAsync(item.notification_id); } catch { /* Keep navigation available on a read-state network error. */ }
    }
    navigate(`/student/review-tracker/${item.submission_id}`);
  };

  return (
    <section className="student-profile-notification-card" aria-labelledby="student-profile-notifications-title">
      <header className="student-profile-notification-header">
        <div>
          <h2 id="student-profile-notifications-title">Notifications</h2>
          <p>Submission updates from the past 30 days</p>
        </div>
        {!isError && <span className="student-profile-notification-count">{notifications.length} updates</span>}
      </header>
      <div className="student-profile-notification-body">
        {isPending ? <div className="student-notification-loading"><Loader2 size={16} className="mr-2 inline animate-spin" />Loading your updates…</div>
          : isError ? <ErrorNotice message="Notifications could not be loaded. Check the connection and try again." onRetry={() => refetch()} retrying={isFetching} />
            : notifications.length === 0 ? <div className="student-notification-empty"><Bell size={22} /><strong>No recent notifications</strong><p>New submission updates will appear here.</p></div>
              : <ul className="student-notification-list">{notifications.map((item) => <NotificationListItem key={item.notification_id} notification={item} onClick={openNotification} />)}</ul>}
      </div>
      <footer className="student-profile-notification-footer">Select an update to open its submission.</footer>
    </section>
  );
}
