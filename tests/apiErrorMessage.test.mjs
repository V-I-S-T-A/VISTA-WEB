import assert from "node:assert/strict";
import test from "node:test";
import { getApiErrorMessage } from "../src/utils/apiErrorMessage.js";

const httpError = (status, data) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  response: { status, data },
});

test("explains duplicate emails and all field validation errors", () => {
  assert.equal(
    getApiErrorMessage(httpError(400, {
      email: ["A user with this email already exists."],
      org_id: ["Select a valid organization."],
    })),
    "Email address: A user with this email already exists. Organization: Select a valid organization.",
  );
});

test("formats nested and non-field errors as text", () => {
  assert.equal(
    getApiErrorMessage(httpError(400, {
      non_field_errors: ["The selected dates overlap."],
      documents: [{ title: ["This field is required."] }],
    })),
    "The selected dates overlap. Documents / Title: This field is required.",
  );
});

test("uses an actionable fallback for an empty or technical validation response", () => {
  for (const body of [null, {}, "Request failed with status code 400", "<html>Bad Request</html>"]) {
    const message = getApiErrorMessage(httpError(400, body), "Could not create the account.");
    assert.equal(message, "Could not create the account. Check the entered details and required fields.");
  }
});

test("preserves useful backend detail without showing machine codes", () => {
  assert.equal(
    getApiErrorMessage(httpError(400, { detail: "The verification code has expired.", code: "expired" })),
    "The verification code has expired.",
  );
});

test("does not expose internal server errors", () => {
  assert.equal(
    getApiErrorMessage(httpError(500, { detail: "Internal database connection details" })),
    "The service is temporarily unavailable. Please try again later.",
  );
});

test("explains session, permission, missing record, file size, and throttling failures", () => {
  for (const [status, pattern] of [[401, /sign in/], [403, /permission/], [404, /record/], [413, /file is too large/], [429, /wait/]]) {
    const message = getApiErrorMessage(httpError(status, {}));
    assert.match(message, pattern);
    assert.doesNotMatch(message, /Request failed|status code/);
  }
});

test("distinguishes a network failure from an uncertain timeout", () => {
  assert.match(getApiErrorMessage({ isAxiosError: true, message: "Network Error" }), /connection/);
  assert.match(getApiErrorMessage({ isAxiosError: true, code: "ECONNABORTED" }), /Check whether your action completed/);
});

test("retains useful local errors and rejects raw HTTP error text", () => {
  assert.equal(getApiErrorMessage(new Error("Choose at least one image.")), "Choose at least one image.");
  assert.equal(getApiErrorMessage(new Error("Request failed with status code 400"), "Could not save."), "Could not save.");
});
