import test from "node:test";
import assert from "node:assert/strict";
import { isSubmissionDeleteReady } from "../src/utils/submissionDeleteValidation.js";

test("requires the exact DELETE confirmation", () => {
  for (const confirmation of ["", "delete", "Delete", " DELETE", "DELETE "]) {
    assert.equal(
      isSubmissionDeleteReady({ reasonType: "duplicate", reasonDetails: "", confirmation }),
      false,
    );
  }
  assert.equal(
    isSubmissionDeleteReady({ reasonType: "duplicate", reasonDetails: "", confirmation: "DELETE" }),
    true,
  );
});

test("requires a selected reason and an explanation for Other reason", () => {
  assert.equal(
    isSubmissionDeleteReady({ reasonType: "", reasonDetails: "", confirmation: "DELETE" }),
    false,
  );
  assert.equal(
    isSubmissionDeleteReady({ reasonType: "unknown", reasonDetails: "", confirmation: "DELETE" }),
    false,
  );
  assert.equal(
    isSubmissionDeleteReady({ reasonType: "other", reasonDetails: "   ", confirmation: "DELETE" }),
    false,
  );
  assert.equal(
    isSubmissionDeleteReady({ reasonType: "other", reasonDetails: "duplicate entry", confirmation: "DELETE" }),
    true,
  );
});
