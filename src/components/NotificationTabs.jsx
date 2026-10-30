import { NOTIFICATION_TABS } from '../utils/notificationFilters';

export default function NotificationTabs({ value, onChange, id }) {
  const handleKeyDown = event => {
    const index = NOTIFICATION_TABS.findIndex(tab => tab.value === value);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % NOTIFICATION_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index + NOTIFICATION_TABS.length - 1) % NOTIFICATION_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = NOTIFICATION_TABS.length - 1;
    else return;
    event.preventDefault();
    onChange(NOTIFICATION_TABS[next].value);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  };

  return <div className="student-notification-tabs" role="tablist" aria-label="Filter notifications">
    {NOTIFICATION_TABS.map(tab => <button
      key={tab.value} id={`${id}-${tab.value}`} type="button" role="tab"
      aria-selected={value === tab.value} aria-controls={`${id}-panel`}
      tabIndex={value === tab.value ? 0 : -1}
      onClick={() => onChange(tab.value)} onKeyDown={handleKeyDown}
    >{tab.label}</button>)}
  </div>;
}
