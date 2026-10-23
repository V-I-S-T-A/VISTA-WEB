import test from "node:test";
import assert from "node:assert/strict";
import { assertPhoneNumberSaved, formatPhoneNumber } from "../src/utils/phoneNumber.js";

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

test("accepts saved numbers after normalization and intentional clears", () => {
  for (const value of ["912-345-6789", "09123456789", "+639123456789"]) {
    assert.doesNotThrow(() => assertPhoneNumberSaved(value, { phone_number: "+639123456789" }));
  }
  assert.doesNotThrow(() => assertPhoneNumberSaved("", { phone_number: "" }));
});

test("rejects success responses from servers that omit the phone field", () => {
  for (const profile of [undefined, null, {}, { first_name: "Alex" }]) {
    assert.throws(() => assertPhoneNumberSaved("912-345-6789", profile), /could not confirm/);
  }
});

test("rejects unchanged, empty, or invalid saved numbers and failed clears", () => {
  for (const phone_number of ["", "+639998887777", null]) {
    assert.throws(() => assertPhoneNumberSaved("912-345-6789", { phone_number }), /not saved correctly/);
  }
  assert.throws(() => assertPhoneNumberSaved("", { phone_number: "+639123456789" }), /not saved correctly/);
});
