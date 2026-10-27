import test from "node:test";
import assert from "node:assert/strict";
import { isPageLoadError, recoverPageLoad } from "../src/utils/pageLoadRecovery.js";

test("identifies browser module and stylesheet load failures, not ordinary rendering bugs", () => {
  for (const message of ["Failed to fetch dynamically imported module: /assets/page.js", "error loading dynamically imported module", "Importing a module script failed.", "Unable to preload CSS for /assets/page.css"]) assert.equal(isPageLoadError(new Error(message)), true);
  assert.equal(isPageLoadError(new TypeError("Cannot read properties of undefined")), false);
});

test("recovers failed navigation automatically once and prevents a reload loop", () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  let reloads = 0;
  const context = { storage, reload: () => reloads++, pathname: "/get-app", now: 1000 };
  const error = new TypeError("Failed to fetch dynamically imported module: /assets/get-app.js");
  assert.equal(recoverPageLoad(error, context), true);
  assert.equal(recoverPageLoad(error, { ...context, now: 2000 }), false);
  assert.equal(reloads, 1);
  assert.equal(recoverPageLoad(error, { ...context, now: 62000 }), true);
  assert.equal(reloads, 2);
});

test("blocked storage and ordinary exceptions never cause automatic reloads", () => {
  let reloads = 0;
  const context = { storage: { getItem() { throw new Error("blocked"); } }, reload: () => reloads++, pathname: "/login" };
  assert.equal(recoverPageLoad(new Error("Failed to fetch dynamically imported module"), context), false);
  assert.equal(recoverPageLoad(new Error("Render bug"), context), false);
  assert.equal(reloads, 0);
});
