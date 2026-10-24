export const TABLE_PAGE_SIZE = 8;

export async function fetchTablePage(client, endpoint, { params = {}, signal } = {}) {
  try {
    const { data } = await client.get(endpoint, { params, signal });
    return data;
  } catch (error) {
    // Deleting the last record on the last page can invalidate that page.
    if (error.response?.status !== 404 || !(params.page > 1) || signal?.aborted) throw error;
    const { data } = await client.get(endpoint, { params: { ...params, page: 1 }, signal });
    return data;
  }
}

export function pageNumbers(current, total) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: Math.min(5, total) }, (_, i) => start + i);
}

export function auditLogParams({ search = "", action = "All Actions", date = "" } = {}) {
  const params = { query: search.trim(), compact: true };
  if (action !== "All Actions") params.action = action;
  if (date) {
    const [year, month, day] = date.split("-").map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 1);
    params.performed_after = start.toISOString();
    params.performed_until = end.toISOString();
  }
  return params;
}
