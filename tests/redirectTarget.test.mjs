import test from "node:test";
import assert from "node:assert/strict";
import { getLoginRedirectPath, getSafeStudentSubmissionTarget, getPostLoginTarget } from "../src/utils/redirectTarget.js";

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

test("real login response routing preserves validated next and first-login flags", () => {
  const next = `/student/review-tracker/${submissionId}`;
  for (const role of ['staff', 'student']) {
    assert.equal(getPostLoginTarget({ user: { role }, is_first_login: true }), `/${role}/profile`);
    assert.equal(getPostLoginTarget({ user: { role, must_change_password: true }, is_first_login: false }), `/${role}/dashboard`);
    assert.equal(getPostLoginTarget({ user: { role, must_change_password: true } }), `/${role}/profile`);
  }
  assert.equal(getPostLoginTarget({ user: { role: 'student' }, is_first_login: true }, next), next);
  assert.equal(getPostLoginTarget({ user: { role: 'student' }, is_first_login: false }, '//evil.test'), '/student/dashboard');
  assert.equal(getPostLoginTarget({ user: { role: 'staff' }, is_first_login: false }, next), '/staff/dashboard');
  assert.equal(getPostLoginTarget({ user: { role: 'admin' } }), '/admin/dashboard');
});
