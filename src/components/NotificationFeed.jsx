import { useState } from 'react';
import NotificationListItem from './NotificationListItem';
import { groupNotifications } from '../utils/notificationFilters';

export default function NotificationFeed({ notifications, onClick }) {
  const [limit, setLimit] = useState(5);
  const groups = groupNotifications(notifications.slice(0, limit));
  return <>
    {groups.map(group => <section className="student-notification-group" key={group.label} aria-label={group.label}>
      <h3>{group.label}</h3>
      <ul className="student-notification-list">{group.items.map(item =>
        <NotificationListItem key={item.notification_id} notification={item} onClick={onClick} />
      )}</ul>
    </section>)}
    {notifications.length > limit && <button type="button" className="student-notification-all-link student-notification-previous" onClick={() => setLimit(count => count + 5)}>
      See previous notifications
    </button>}
  </>;
}
