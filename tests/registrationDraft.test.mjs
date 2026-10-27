import test from "node:test";
import assert from "node:assert/strict";
import { getRegistrationValidationError, mergeRegistrationSuggestions } from "../src/utils/registrationDraft.js";

const form = { org_id: "org-a", submitted_by: "user-a", academic_year_id: "year", doc_type_id: "type", category_id: "category", title: "Annual proposal" };
const options = { organizations: [{ org_id: "org-a", is_active: true }], users: [{ user_id: "user-a", org_id: "org-a", is_active: true }] };

test("conflicting OCR preserves a chosen organization, submitter and manually edited title", () => {
  const result = mergeRegistrationSuggestions(form, { suggested_org_id: "org-b", display_name: "Wrong OCR title" }, new Set(["org_id", "submitted_by", "title"]));
  assert.deepEqual(result, form);
  assert.equal(getRegistrationValidationError(result, options), "");
});

test("a submitter selected while scanning pins the organization even without a manual org edit", () => {
  assert.equal(mergeRegistrationSuggestions(form, { suggested_org_id: "org-b" }, new Set()).org_id, "org-a");
});

test("OCR fills untouched fields but respects edits made before the response arrives", () => {
  const current = { ...form, submitted_by: "", org_id: "", title: "My corrected title" };
  const result = mergeRegistrationSuggestions(current, { suggested_org_id: "org-b", suggested_academic_year_id: "next-year", display_name: "OCR title" }, new Set(["title"]));
  assert.equal(result.org_id, "org-b");
  assert.equal(result.academic_year_id, "next-year");
  assert.equal(result.title, "My corrected title");
});

test("review rejects a mismatched or inactive submitter before any create request", () => {
  assert.match(getRegistrationValidationError(form, { ...options, users: [{ ...options.users[0], org_id: "org-b" }] }), /does not belong/);
  assert.match(getRegistrationValidationError(form, { ...options, users: [{ ...options.users[0], is_active: false }] }), /active user/);
  assert.match(getRegistrationValidationError(form, { ...options, users: [] }), /active user/);
});

test("review rejects missing fields and unavailable organizations with useful errors", () => {
  assert.match(getRegistrationValidationError({ ...form, submitted_by: "", title: "  " }, options), /submitter, document title/);
  assert.match(getRegistrationValidationError(form, { ...options, organizations: [] }), /active organization/);
});
