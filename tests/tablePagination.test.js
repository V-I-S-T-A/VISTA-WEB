import test from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { auditLogParams, fetchTablePage, pageNumbers, TABLE_PAGE_SIZE } from "../src/utils/tablePagination.js";
import { fetchAllPages } from "../src/utils/fetchAllPages.js";

test("users and audit logs each load eight records in one request regardless of total count", async () => {
  for (const endpoint of ["/users/", "/audit-logs/"]) {
    const calls = [];
    const signal = new AbortController().signal;
    const params = { page: 30, page_size: TABLE_PAGE_SIZE, is_active: false };
    const payload = { count: 10_000, current_page: 30, next: "?page=31", results: Array(8).fill({}) };
    const client = { get: async (...args) => { calls.push(args); return { data: payload }; } };
    assert.equal(await fetchTablePage(client, endpoint, { params, signal }), payload);
    assert.deepEqual(calls, [[endpoint, { params, signal }]]);
  }
});

test("audit filters preserve full-phrase search and browser-local calendar dates", () => {
  const params = auditLogParams({ search: " Alex Rivera ", action: "create", date: "2026-10-24" });
  assert.equal(params.query, "Alex Rivera");
  assert.equal(params.action, "create");
  assert.equal(params.compact, true);
  const start = new Date(params.performed_after);
  const end = new Date(params.performed_until);
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 9);
  assert.equal(start.getDate(), 24);
  assert.equal(start.getHours(), 0);
  assert.equal(end.getDate(), 25);
  assert.equal(end.getHours(), 0);
  assert.deepEqual(auditLogParams(), { query: "", compact: true });
});

test("all audit pages are fetched only for explicit filtered export", async () => {
  const calls = [];
  const params = auditLogParams({ search: "Alex", action: "update" });
  const client = { get: async (endpoint, { params }) => {
    calls.push(params);
    return { data: { results: [{ audit_id: params.page }], next: params.page === 1 ? "?page=2" : null } };
  } };
  assert.equal((await fetchAllPages(client, "/audit-logs/", { params })).length, 2);
  assert.ok(calls.every(call => call.query === "Alex" && call.action === "update" && call.compact && call.page_size === 100));
});

test("cached page navigation avoids refetching, while user mutations can invalidate summaries and pages together", async () => {
  const cache = new QueryClient();
  let calls = 0;
  const options = key => ({ queryKey: key, queryFn: async () => ++calls, staleTime: 30_000 });
  try {
    await cache.fetchQuery(options(["users", { page: 1 }]));
    await cache.fetchQuery(options(["users", { page: 2 }]));
    await cache.fetchQuery(options(["users", { page: 1 }]));
    await cache.fetchQuery(options(["users", "summary"]));
    assert.equal(calls, 3);
    await cache.invalidateQueries({ queryKey: ["users"] });
    assert.ok(cache.getQueryState(["users", { page: 1 }]).isInvalidated);
    assert.ok(cache.getQueryState(["users", "summary"]).isInvalidated);
  } finally { cache.clear(); }
});

test("removed final pages recover without losing filters", async () => {
  const calls = [];
  const params = { page: 9, page_size: 8, role: "staff", exclude_admin: "true" };
  const client = { get: async (endpoint, { params }) => {
    calls.push(params);
    if (params.page === 9) throw { response: { status: 404 } };
    return { data: { current_page: 1, count: 64, results: [] } };
  } };
  assert.equal((await fetchTablePage(client, "/users/", { params })).current_page, 1);
  assert.deepEqual(calls, [params, { ...params, page: 1 }]);
});

test("failed or cancelled requests never scan additional pages", async () => {
  for (const status of [403, 500]) {
    let calls = 0;
    await assert.rejects(fetchTablePage({ get: async () => { calls++; throw { response: { status } }; } }, "/users/", { params: { page: 2 } }));
    assert.equal(calls, 1);
  }
  const controller = new AbortController(); controller.abort();
  let calls = 0;
  await assert.rejects(fetchTablePage({ get: async () => { calls++; throw { response: { status: 404 } }; } }, "/users/", { params: { page: 2 }, signal: controller.signal }));
  assert.equal(calls, 1);
});

test("pagination reaches the last page without rendering unbounded page buttons", () => {
  assert.deepEqual(pageNumbers(1, 1), [1]);
  assert.deepEqual(pageNumbers(6, 6), [2, 3, 4, 5, 6]);
  assert.deepEqual(pageNumbers(1250, 1250), [1246, 1247, 1248, 1249, 1250]);
});
