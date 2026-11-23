# Submission details UI refinement

Local work on `feat/admin-ui-consistency`, 2026-11-23. Implementation and validation
preceded the owner's authorization to commit and push grouped changes. No merge,
deployment, dependency, CI, environment, Backend or Mobile changes.
The pre-existing Admin refinements and other working-tree changes are preserved.

## Presentation and protected behavior

- Student Review Tracker: read-only document fields lead the left column, with
  status history at that same width. The purple summary occupies the right column.
  The physical-submission notice, organization-viewer notice, history and replies
  remain. Student rendering never reads the supplied documents/Drive arrays.
- Staff Review Panel: read-only fields and the existing attachment controls occupy
  the left column, followed by history. The right column contains the compact card,
  Decision Panel, then existing Drive/archive controls in their original order.
  Status/remarks/priority handlers, confirmation dialogs, conversation handlers,
  attachment URLs, queries, refresh effects, permissions and navigation are unchanged.
- Staff Final Review: the existing mapped summary and selected attachment appear
  in read-only field surfaces. Redo, Approve, pending guards and image preview use
  their existing callbacks. Rendering never creates a submission.
- The compact variant retains the existing banner asset, purple face and wave SVG.
  It uses actual component proportions, not transforms. Full metadata and files are
  in the primary panel, so they are not duplicated in the secondary summary.
- Fields are labeled groups containing text, not inputs, selects, editable content,
  disabled controls, a conventional table, or a new form. Existing VISTA typography,
  colors, spacing, field surfaces and corner tokens are reused. Loading layouts
  follow the new primary/secondary arrangement without enabling premature actions.

Owner follow-ups place the compact card first on stacked Student/Staff detail
layouts while preserving desktop columns. Final Review keeps its primary panel
first; Redo and Approve sit above that panel at its right edge, opposite the
Review Extracted Details heading. The decorative side banner remains only on
the entry form. Reviewer/reply/archive profile images are circular and use the
static default image when a recorded URL is absent or fails to load.

## Data inspection

Read-only inspection of the submission serializer confirms organization, submitter,
academic year, category, document type, title, description, status and timestamps.
The existing Staff `displaySubmission` and registration `getSummaryData()` mappings
remain authoritative. The registration state currently maps document metadata;
it does not expose a separate arbitrary document-specific OCR payload to the preview.
No extracted values, additional fields or identities were invented. Saved descriptions
are included when present, and absent values display as unavailable.

Git history for the former read-only extracted-details layout was inspected at
`aafd615`; no historical commit or entire file was reverted. The supplied Document
Entry screenshot informed appearance only, not editable form behavior.

## Validation

Checks used Node **24.22.2** and the existing isolated checkout with the locked
dependency tree. File hashes confirm the validated application/test sources match
the working tree. No dependencies were reinstalled or upgraded.

| Check | Result |
| --- | --- |
| Full ESLint | Passed |
| Unit suite | 119 passed, 0 failed |
| Five affected browser suites | 50 passed, 0 failed in the final serial run |
| Static checks | 115 JavaScript modules; JSX checked by ESLint/Vite |
| Production Vite build | Passed; existing large-chunk warning remains (Staff dashboard approximately 746 kB) |
| Whitespace and scope review | Passed; no staged files |

Browser coverage includes three screens at 320/360/390/768/1024/1440px, genuinely
non-editable fields, primary/secondary ordering, desktop history alignment, no
horizontal overflow, attachment preview and focus restoration, absent attachments,
pending approval/redo, saved archive states, failed/staged detail loads, identity
fallbacks, Student owner/organization viewers, denied/wrong-role access, real route
reload/back/forward, and history replies retrieved after a fresh fixture read/reload.

The first run identified a narrow-card ownership label hidden by an inherited
container rule and an oversized compact loading placeholder. Both were corrected;
the existing loading-size threshold was retained. Older tests requiring files
inside the large purple card were updated to require the authorized controls in
the primary panel. Permission, callback, focus, persistence-fixture and no-write
assertions were retained.

REA controlled replay `ev_d6439a301349e3a31437b16d08b224ff5c5d7d57fc221563dcf7f353140ac9ad`
completed and terminated its owned browser. Its accessibility capture identifies
the read-only labeled groups, attachment preview, compact draft summary and
unchanged confirmation controls. The UI/UX skill's contrast guidance supported
dark readable text on neutral surfaces; input-label behavior was not copied.

## Visual comparison and limitations

Ignored local artifacts:

- `output/admin-ui-review/submission-comparison.html`: select Student, Staff or
  Final Review and desktop/tablet/phone to compare matching fictional records.
- `output/admin-ui-review/submission-before/`: pre-task application screenshots.
- `output/admin-ui-review/submission-after/`: final screenshots, including 1440,
  1024 and 360px views; the final capture reported no runtime exceptions.
- Browser regression screenshots are in the isolated checkout under
  `node_modules/.cache/vista-design-review/submission-details/`.

All visual/API fixtures use fictional local records. Student fixtures deliberately
include private file/archive URLs to verify that the renderer never exposes them.
No real submission was created, reviewed, deleted or archived. Actual Railway
operation, external Drive delivery, notification delivery and physical devices
were not exercised. Existing interaction logic was preserved and checked using
mocked browser flows; this is not a claim of production end-to-end verification.

## Exact files changed in this task

```text
src/components/SubmissionDetailsPanel.jsx
src/components/SubmissionDetailsPanel.css
src/components/SubmissionPass.jsx
src/components/SubmissionPass.css
src/components/loading/PageSkeleton.jsx
src/modules/student/reviewtracker/ReviewTrackerDetails.jsx
src/modules/student/reviewtracker/components/DetailsSubmissionInfo.jsx
src/modules/staff/review-panel/components/SubmissionReviewDetails.jsx
src/modules/staff/review-panel/components/SubmissionReviewDetails.css
src/modules/staff/registration/components/OCRResults.jsx
tests/archivePresentation.test.mjs
tests/registrationPreview.test.mjs
tests/studentDetailIdentity.test.mjs
tests/submissionLoadingRouting.test.mjs
tests/submissionPassResponsive.test.mjs
src/documentation/SUBMISSION_DETAILS_UI_REFINEMENT.md
```

Only the two review-detail branches in the already-modified PageSkeleton changed
for this task. Its approved Student dashboard banner removal is preserved.
No original card assets were deleted. Screenshots and temporary investigation
scripts remain ignored local outputs.
