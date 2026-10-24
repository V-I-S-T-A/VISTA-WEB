export function organizationFilters(search = "", status = "All") {
  return {
    query: search.trim(),
    ...(status === "All" ? {} : { is_active: status === "Active" }),
  };
}

export async function fetchOrganizationPage(client, { page = 1, search, status, signal } = {}) {
  const params = { ...organizationFilters(search, status), page, page_size: 8 };
  try {
    const { data } = await client.get("/organizations/", { params, signal });
    return data;
  } catch (error) {
    // A deletion can remove the last page between requests.
    if (error.response?.status !== 404 || page === 1 || signal?.aborted) throw error;
    const { data } = await client.get("/organizations/", {
      params: { ...params, page: 1 }, signal,
    });
    return data;
  }
}
