import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";

function notificationStatus(status = "") {
  switch (status.toLowerCase()) {
    case "approved":
      return { label: "Approved", tone: "approved", Icon: CheckCircle2 };
    case "rejected":
    case "resubmission_required":
      return { label: "Returned", tone: "returned", Icon: RotateCcw };
    case "under_review":
      return { label: "In review", tone: "review", Icon: Clock3 };
    default:
      return { label: "Pending", tone: "pending", Icon: Clock3 };
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
  const { label, tone, Icon } = notificationStatus(notification.submission_status);
  const title = notification.submission_title || `Submission ${notification.submission_id.slice(0, 8)}`;

  return (
    <li className="student-notification-item-wrap">
      <button
        type="button"
        onClick={() => onClick(notification)}
        className={`student-notification-item ${notification.is_read ? "is-read" : "is-unread"}`}
      >
        <span className={`student-notification-icon ${tone}`} aria-hidden="true"><Icon size={17} /></span>
        <span className="student-notification-copy">
          <span className="student-notification-title-row">
            <span className="student-notification-title">{title}</span>
            {!notification.is_read && <span className="student-notification-unread-dot" aria-label="Unread" />}
          </span>
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
