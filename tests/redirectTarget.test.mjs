import test from "node:test";
import assert from "node:assert/strict";
import { getLoginRedirectPath, getSafeStudentSubmissionTarget } from "../src/utils/redirectTarget.js";

const submissionId = "194f7b2a-ec37-4d7b-8a84-c99e8ac14f2a";

test("accepts only the student submission detail route", () => {
  assert.equal(
    getSafeStudentSubmissionTarget(`/student/review-tracker/${submissionId}`),
    `/student/review-tracker/${submissionId}`,
  );
  assert.equal(getSafeStudentSubmissionTarget("https://attacker.example/"), "");
  assert.equal(getSafeStudentSubmissionTarget("//attacker.example/"), "");
  assert.equal(getSafeStudentSubmissionTarget("/admin/dashboard"), "");
  assert.equal(getSafeStudentSubmissionTarget("/student/review-tracker/not-a-uuid"), "");
});

test("login redirect encodes only a validated internal destination", () => {
  assert.equal(
    getLoginRedirectPath(`/student/review-tracker/${submissionId}`),
    `/login?next=${encodeURIComponent(`/student/review-tracker/${submissionId}`)}`,
  );
  assert.equal(getLoginRedirectPath("https://attacker.example/"), "/login");
});
