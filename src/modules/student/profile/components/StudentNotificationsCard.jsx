import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import ErrorNotice from "../../../../components/ErrorNotice";
import NotificationFeed from "../../../../components/NotificationFeed";
import NotificationTabs from "../../../../components/NotificationTabs";
import { filterNotifications, notificationEmptyState } from "../../../../utils/notificationFilters";
import { notificationService } from "../../../../services/notificationService";
import { useCurrentUser } from "../../../../hooks/useAuth";


export default function StudentNotificationsCard() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["notifications", currentUser?.user_id],
    queryFn: notificationService.getNotifications,
    enabled: Boolean(currentUser?.user_id),
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: false,
  });
  const markRead = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", currentUser?.user_id] }),
  });
  const notifications = data?.results ?? [];
  const filteredNotifications = filterNotifications(notifications, filter);
  const [emptyTitle, emptyDescription] = notificationEmptyState(filter);

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
      <NotificationTabs value={filter} onChange={setFilter} id="notification-profile" />
      <div className="student-profile-notification-body" id="notification-profile-panel" role="tabpanel" aria-labelledby={`notification-profile-${filter}`} tabIndex={0}>
        {isPending ? <div className="student-notification-loading"><Loader2 size={16} className="mr-2 inline animate-spin" />Loading your updates…</div>
          : isError ? <ErrorNotice message="Notifications could not be loaded. Check the connection and try again." onRetry={() => refetch()} retrying={isFetching} />
            : filteredNotifications.length === 0 ? <div className="student-notification-empty"><Bell size={22} /><strong>{emptyTitle}</strong><p>{emptyDescription}</p></div>
              : <NotificationFeed key={filter} notifications={filteredNotifications} onClick={openNotification} />}
      </div>
      <footer className="student-profile-notification-footer">Select an update to open its submission.</footer>
    </section>
  );
}
