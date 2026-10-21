import test from "node:test";
import assert from "node:assert/strict";
import { formatPhoneNumber } from "../src/utils/phoneNumber.js";

test("formats national, local, and international mobile numbers", () => {
  for (const value of ["9123456789", "09123456789", "+639123456789", "+63 912-345-6789"]) {
    assert.equal(formatPhoneNumber(value), "912-345-6789");
  }
});

test("supports partial input and clearing without dropping extra digits", () => {
  for (const [value, expected] of [["", ""], ["9", "9"], ["9123", "912-3"], ["9123456", "912-345-6"], ["91234567890", "912-345-67890"]]) {
    assert.equal(formatPhoneNumber(value), expected);
  }
});
