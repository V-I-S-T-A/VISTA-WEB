import defaultAvatar from "../assets/shared/default_user.webp";

function notificationStatus(status = "", type = "") {
  if (type === "submission_priority_changed") {
    return { label: "Priority", tone: "priority" };
  }
  switch (status.toLowerCase()) {
    case "approved":
      return { label: "Approved", tone: "approved" };
    case "rejected":
    case "resubmission_required":
      return { label: "Returned", tone: "returned" };
    case "under_review":
      return { label: "In review", tone: "review" };
    default:
      return { label: "Pending", tone: "pending" };
  }
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function NotificationListItem({ notification, onClick }) {
  const { label, tone } = notificationStatus(notification.submission_status, notification.type);
  const title = notification.submission_title || `Submission ${notification.submission_id.slice(0, 8)}`;

  return (
    <li className="student-notification-item-wrap">
      <button
        type="button"
        onClick={() => onClick(notification)}
        className={`student-notification-item ${notification.is_read ? "is-read" : "is-unread"}`}
      >
        <img
          className="student-notification-avatar"
          src={notification.actor_image_url || defaultAvatar}
          alt={notification.actor_name ? `${notification.actor_name} profile` : "Staff profile"}
          onError={(event) => { event.currentTarget.src = defaultAvatar; }}
        />
        <span className="student-notification-copy">
          <span className="student-notification-title-row">
            <span className="student-notification-title">{title}</span>
            {!notification.is_read && <span className="student-notification-unread-dot" aria-label="Unread" />}
          </span>
          {notification.actor_name && <span className="student-notification-actor">Updated by {notification.actor_name}</span>}
          <span className="student-notification-meta">
            <span className={`student-notification-status ${tone}`}>{label}</span>
            <time dateTime={notification.created_at}>{formatTime(notification.created_at)}</time>
          </span>
          <span className="student-notification-message">{notification.message}</span>
        </span>
      </button>
    </li>
  );
}
