// Keep requests on the configured API origin, even when `next` is absolute.
export async function fetchAllPages(client, endpoint, { signal, params = {} } = {}) {
  const items = [];
  let page = 1;
  let hasNext;
  do {
    const { data } = await client.get(endpoint, {
      params: { ...params, page, page_size: 100 },
      signal,
    });
    items.push(...(Array.isArray(data) ? data : data.results));
    hasNext = !Array.isArray(data) && Boolean(data.next);
    page += 1;
  } while (hasNext);
  return items;
}
