import test from "node:test";
import assert from "node:assert/strict";
import { InfiniteQueryObserver, QueryClient } from "@tanstack/react-query";
import { fetchOrganizationOptions, nextOrganizationPage, organizationOptions } from "../src/utils/organizationPicker.js";

const records = Array.from({ length: 65 }, (_, i) => ({ org_id: `org-${i}`, acronym: `ORG${i}`, name: `Organization ${i}`, is_active: i % 2 === 0 }));
function mockClient(calls) {
  return { get: async (endpoint, config) => {
    calls.push({ endpoint, ...config });
    const { page, page_size, search } = config.params;
    const matches = records.filter(org => `${org.name} ${org.acronym}`.toLowerCase().includes(search.toLowerCase()));
    return { data: {
      current_page: page, count: matches.length,
      results: matches.slice((page - 1) * page_size, page * page_size),
      next: page * page_size < matches.length ? `https://api.example/organizations/?page=${page + 1}` : null,
    } };
  } };
}

test("the closed picker makes no request and opening it fetches only the first 20", async () => {
  const calls = [];
  const client = mockClient(calls);
  const cache = new QueryClient();
  const options = {
    queryKey: ["organizations", "picker", ""], enabled: false,
    queryFn: ({ pageParam, signal }) => fetchOrganizationOptions(client, { page: pageParam, signal }),
    initialPageParam: 1, getNextPageParam: nextOrganizationPage, staleTime: 60_000,
  };
  const observer = new InfiniteQueryObserver(cache, options);
  const unsubscribe = observer.subscribe(() => {});
  try {
    assert.equal(calls.length, 0);
    await observer.refetch();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].params.page_size, 20);
    assert.equal(observer.getCurrentResult().data.pages[0].count, 65);
    await observer.fetchNextPage();
    assert.equal(calls.length, 2);
    assert.equal(calls[1].params.page, 2);
    assert.equal(organizationOptions(observer.getCurrentResult().data.pages).length, 40);
  } finally { unsubscribe(); cache.clear(); }
});

test("search finds an organization beyond the first page in one bounded request", async () => {
  const calls = [];
  const page = await fetchOrganizationOptions(mockClient(calls), { search: " ORG64 " });
  assert.deepEqual(page.results, [records[64]]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].params.search, "ORG64");
  assert.equal(nextOrganizationPage(page), undefined);
});

test("explicit browsing reaches every organization including inactive choices", async () => {
  const calls = [];
  const client = mockClient(calls);
  const pages = [];
  let page = 1;
  while (page) {
    const result = await fetchOrganizationOptions(client, { page });
    pages.push(result);
    page = nextOrganizationPage(result);
  }
  assert.equal(calls.length, 4);
  assert.deepEqual(organizationOptions(pages), records);
  assert.ok(organizationOptions(pages).some(org => !org.is_active));
});

test("recently opened pickers reuse the cached page without another request", async () => {
  const calls = [];
  const client = mockClient(calls);
  const cache = new QueryClient();
  const options = { queryKey: ["organizations", "picker", "ORG64"], staleTime: 60_000,
    initialPageParam: 1, getNextPageParam: nextOrganizationPage,
    queryFn: ({ pageParam, signal }) => fetchOrganizationOptions(client, { page: pageParam, search: "ORG64", signal }),
  };
  try {
    await cache.fetchInfiniteQuery(options);
    await cache.fetchInfiniteQuery(options);
    assert.equal(calls.length, 1);
  } finally { cache.clear(); }
});

test("overlapping pages do not render duplicate organizations", () => {
  assert.equal(organizationOptions([{ results: records.slice(0, 20) }, { results: records.slice(19, 40) }]).length, 40);
});

test("failed requests reject for visible retry and forward cancellation", async () => {
  const signal = new AbortController().signal;
  await assert.rejects(fetchOrganizationOptions({ get: async (endpoint, config) => {
    assert.equal(config.signal, signal);
    throw new Error("Network unavailable");
  } }, { signal }), /Network unavailable/);
});
