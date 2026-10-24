export const ORGANIZATION_OPTION_PAGE_SIZE = 20;

export async function fetchOrganizationOptions(client, { page = 1, search = "", signal } = {}) {
  const { data } = await client.get("/organizations/", {
    params: { page, page_size: ORGANIZATION_OPTION_PAGE_SIZE, search: search.trim() },
    signal,
  });
  return Array.isArray(data) ? { results: data, count: data.length, next: null, current_page: 1 } : data;
}

export function nextOrganizationPage(lastPage) {
  return lastPage.next ? lastPage.current_page + 1 : undefined;
}

export function organizationOptions(pages = []) {
  const unique = new Map();
  for (const page of pages) {
    for (const organization of page.results) unique.set(organization.org_id, organization);
  }
  return [...unique.values()];
}
