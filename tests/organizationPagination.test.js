import test from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { fetchOrganizationPage, organizationFilters } from "../src/utils/organizationPagination.js";

test("fetches only eight rows in one request even with 10,000 organizations", async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const payload = { count: 10_000, current_page: 26, results: Array.from({ length: 8 }, (_, org_id) => ({ org_id })), next: "?page=27" };
  const client = { get: async (...args) => { calls.push(args); return { data: payload }; } };
  assert.equal(await fetchOrganizationPage(client, { page: 26, search: " ESS ", status: "Inactive", signal }), payload);
  assert.deepEqual(calls, [["/organizations/", {
    params: { page: 26, page_size: 8, query: "ESS", is_active: false }, signal,
  }]]);
});

test("all-status requests omit the active filter", () => {
  assert.deepEqual(organizationFilters("", "All"), { query: "" });
});

test("returning to a fresh cached page avoids another request", async () => {
  const cache = new QueryClient();
  let requests = 0;
  const client = { get: async () => { requests++; return { data: { count: 80, results: [] } }; } };
  const options = page => ({
    queryKey: ["registration-organizations", page, "", "All", 0, 0],
    queryFn: ({ signal }) => fetchOrganizationPage(client, { page, signal }),
    staleTime: 30_000,
  });
  try {
    await cache.fetchQuery(options(1));
    await cache.fetchQuery(options(2));
    await cache.fetchQuery(options(1));
    assert.equal(requests, 2);
  } finally { cache.clear(); }
});

test("a removed last page falls back to the first page", async () => {
  const pages = [];
  const client = { get: async (endpoint, { params }) => {
    pages.push(params.page);
    if (params.page === 3) throw { response: { status: 404 } };
    return { data: { count: 16, current_page: 1, results: [] } };
  } };
  assert.equal((await fetchOrganizationPage(client, { page: 3 })).current_page, 1);
  assert.deepEqual(pages, [3, 1]);
});

test("cancellation does not trigger a fallback request", async () => {
  const controller = new AbortController();
  controller.abort();
  let requests = 0;
  const client = { get: async () => { requests++; throw { response: { status: 404 } }; } };
  await assert.rejects(fetchOrganizationPage(client, { page: 3, signal: controller.signal }));
  assert.equal(requests, 1);
});
