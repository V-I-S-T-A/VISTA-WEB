import test from "node:test";
import assert from "node:assert/strict";
import { fetchAllPages } from "../src/utils/fetchAllPages.js";

test("explicit export loads every API page with the same filters", async () => {
  const records = Array.from({ length: 205 }, (_, org_id) => ({ org_id }));
  const calls = [];
  const controller = new AbortController();
  const client = {
    async get(endpoint, { params, signal }) {
      calls.push({ endpoint, ...params });
      assert.equal(signal, controller.signal);
      const start = (params.page - 1) * params.page_size;
      return { data: {
        results: records.slice(start, start + params.page_size),
        next: start + params.page_size < records.length ? "https://api.example/organizations/?page=2" : null,
      } };
    },
  };
  const result = await fetchAllPages(client, "/organizations/", {
    signal: controller.signal, params: { search: "ESS", is_active: false },
  });
  assert.deepEqual(result, records);
  assert.deepEqual(calls.map(({ page }) => page), [1, 2, 3]);
  assert.ok(calls.every(({ endpoint }) => endpoint === "/organizations/"));
  assert.ok(calls.every(({ search, is_active, page_size }) => search === "ESS" && is_active === false && page_size === 100));
  assert.equal(Math.ceil(result.length / 8), 26);
  assert.equal(result.slice(25 * 8).length, 5);
});

test("also accepts an unpaginated list", async () => {
  const records = [{ org_id: 1 }];
  assert.deepEqual(await fetchAllPages({ get: async () => ({ data: records }) }, "/organizations/"), records);
});

test("a later-page failure rejects instead of returning an incomplete list", async () => {
  const client = {
    async get(endpoint, { params }) {
      if (params.page === 2) throw new Error("Connection lost");
      return { data: { results: [{ org_id: 1 }], next: "?page=2" } };
    },
  };
  await assert.rejects(fetchAllPages(client, "/organizations/"), /Connection lost/);
});
