// Display-only activity status. Never write this result to is_active: an invited
// account must remain enabled so that its owner can complete the first sign-in.
export const isUserActivityInactive = user => !user.is_active || !user.last_login;

export function userActivityPage(users, { activityStatus, page = 1, pageSize = 50 }) {
  const filtered = users.filter(user => isUserActivityInactive(user) === (activityStatus === 'inactive'));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  return {
    results: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    count: filtered.length, current_page: currentPage, total_pages: totalPages,
  };
}
