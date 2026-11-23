# Admin interface consistency review

Local review on 2026-11-23, branch `feat/admin-ui-consistency`, based on updated
`origin/main`. Implementation and validation preceded the owner's authorization
to commit and push grouped changes. No PR, merge, deployment, dependency, CI,
Railway settings, Backend or Mobile changes are part of this work.

### Approved follow-ups

- Admin header notifications are hidden. Edit actions use VISTA yellow; summary
  artwork and white labels/counts are preserved.
- Audit Back navigation uses the shared yellow button beneath the heading.
  Affected accounts use the recorded photo, with the static default image for
  missing or broken URLs; CRUD actors never substitute for the affected account.
- User table activity is Inactive when an account is disabled or has never signed
  in. Active/Inactive filtering reads every matching API page before paginating
  locally, retaining search and request cancellation. Account permissions and
  invitation eligibility remain unchanged.
- At the owner's final request, the Inactive summary retains the original API
  access-status count (currently two), independently of table activity. PDF export
  retains the existing Backend access-status filter. No value is hardcoded.

## Inventory and implementation

| Area inspected | Inconsistency | Admin-only refinement |
| --- | --- | --- |
| User Management | Faded generic outline icons; navy/brown summary cards; different count sizes | Four decorative, project-owned SVG illustrations follow the Staff/Student paper, blue, gold and soft-shadow artwork. Blue/gold/green/red surfaces use existing tokens; labels, values, order, grid proportions and calculations are preserved. Artwork shrinks before multi-digit values wrap. |
| User actions | Browser-native delete confirmation differed from every other confirmation | Reuse `StatusModal`, identify the account by its existing email, retain the same DELETE mutation and success/error handling, guard repeated confirms, and keep pending Cancel/Close/Escape disabled. No request is made on Cancel. |
| Organization Management | Inconsistent back-button treatment, fields, confirmation and error presentation | Existing shared secondary button and `ErrorNotice`; token-based modal surfaces, borders, field sizes, focus styling, and accessible close names. CRUD callbacks, request payloads and routes stay in their existing owners. |
| Registration Configuration | Uppercase tab treatments and small gray modal fields differed from the workspace | Token-based tab selection with `aria-pressed`; the existing four tabs, add/edit forms, image upload, status controls and deletion confirmations remain. Modal close controls have names and save errors are announced. |
| Audit list | Actions were technical labels without readable event context | Admin supplies an optional presentation mapper to the shared table. Staff and Student omit it and receive the existing rendering. Requests, filters, pagination, detail loading and CSV export are unchanged. |
| Audit details | Square cards, repetitive headers, guessed references, blank change panels and a fabricated prior event | Compact activity/account summary; conditional readable comparisons or create/delete snapshots; nested labeled values; collapsed Technical details retains IDs and recorded payload. No duplicated single-event timeline or empty changes card. |
| Profile | Already uses the approved account panel and shared fields/password controls | Inspected at desktop/tablet/mobile and preserved. No form payload, avatar, password, session or profile-save changes. |
| Cross-cutting states | Mixed inline borders, font sizes, muted colors and switches | `.admin-workspace` and explicitly opted-in `.admin-dialog` styles use the existing root tokens and shared controls. Existing responsive tables, filters, popovers, pagination, badges, loading skeletons, feedback and keyboard-focus machinery are reused. Inline border shorthand conflicts in Admin fields were corrected. |

All five Admin routes were inspected:

- `/admin/dashboard`
- `/admin/dashboard/registeredorg`
- `/admin/registration-config` (Organizations, Academic Years, Document Types, Categories)
- `/admin/audit-logs` (list and details)
- `/admin/profile`

The references were the actual `/staff/dashboard` and `/student/dashboard`
components, `DashboardIllustration.jsx`, the shared controls/modal/table components,
`index.css` tokens, and `workspace.css`. No competing global theme was introduced.
New artwork is SVG source, not AI-generated raster imagery.

## Audit data trace and “Unknown Record” root cause

Read-only source inspection established:

1. Backend `audit_logs/utility.py` records login/logout against `tbl_Users` with
   empty `changes`. These events represent account activity, not a record edit.
2. `AuditLogSerializer` supplies the acting account's name, email, organization,
   image and `user_id`; the list summary deliberately omits the change payload.
3. The frontend receives those fields through `auditLogService` without an identity
   mapping step. The old Admin details code looked only for record `title`/`name`
   in changes, so legitimate login events fell through to “Unknown Record.” It
   also substituted the audit ID for the affected record ID.
4. Delete payloads use `changes.deleted`; the old details parser did not handle
   that key. Nested change values were skipped, and malformed JSON could throw.
5. The old Admin timeline unconditionally manufactured “Validation Passed” at
   `performed_at - 133000ms`. The API model supplies no such preceding event.

The Admin presentation mapper now uses actual account data for login/logout, actual
snapshots/references for CRUD and status changes, and honest type/ID fallbacks when
identity is missing. It never treats a CRUD actor as the affected person. IDs remain
complete in technical details. Timestamps explicitly use Asia/Manila/PHT rather
than appending GMT+8 to an arbitrary browser-local time.

All event payload evidence remains accessible as text, including unchanged fields,
nested values and original timestamps; credential-valued fields are redacted.
Boolean account flags such as `must_change_password` remain visible. React renders
the payload as text, not HTML.

Current submission information and file-view links remain available, explicitly
labeled as current data that may differ from the historical event. The async
lookup cannot replace a different selected record's evidence. Historical values
come from the audit payload, not from that later API lookup.

### Audit Log UX correction

The follow-up preserves account resolution and human-readable summaries while
removing the duplicated single-event timeline and empty change sections. Account
identity and event summary use compact adjoining bento cards. CREATE/DELETE
show recorded snapshots in two columns; UPDATE/status changes show before/after
values. Nested values use labeled lists rather than JSON. IDs, machine metadata,
unchanged fields and any additional supplied events remain accessible in the
collapsed-by-default **Technical details** disclosure, with the existing credential
redaction retained. Current submission information is a separate compact disclosure.

Backend source confirms LOGIN, `new`, `old`/`new`, `deleted`, and status-change
payload formats. The supplied screenshot is a real LOGIN example; the multi-event
browser checks use fictional examples of those formats, not live production records.
No additional history is claimed when the API supplies none.

REA controlled replay before: `ev_5cd69f375a2093bc4ca49ed00d8333409c5eaa461d52017c12ccab2e7df84e6c`.
After: `ev_4226eb23e2101bf76f41527215d307bb600b7a11496925d77bde5001eede73c5`.
Both completed and terminated their owned browser processes. The final accessibility
capture includes the account email and collapsed Technical details, without the
former duplicated sections. Local comparison screenshots and visible-text metrics
are in `output/admin-ui-review/audit-before/` and `audit-after/` for six event shapes
at 1440px and 360px. Desktop LOGIN details shrink from 893.64px to 341.19px.
All twelve after captures have no viewport overflow or browser exceptions.

The skill catalog returned no directly applicable progressive-disclosure guidance
after a narrower retry; the owner requirements, existing VISTA components and
general native-disclosure accessibility guidance informed this correction.

The owner's subsequent visual direction restores blue section headers while
retaining that approved content. The event summary and affected account/record
form a 1.35:1 desktop bento row, stacking below 768px. Existing card-radius,
spacing, typography, neutral-surface and blue/white tokens are reused. Recorded
changes retain their full-width readable table; Technical details stays collapsed.
No audit mapper, data-fetching, permission or action behavior changed in this
visual pass. Screenshots of all six examples at 1440px/360px are under
`output/admin-ui-review/audit-bento/`. Admin header notification removal remains
in place; Staff/Student header behavior is unchanged.

### Data limitations

- The summary API excludes record snapshots/target IDs for many list rows. The
  list can name the actor, action and record type, while the existing View Details
  action retrieves the available target evidence. No new per-row requests or
  Backend changes were added.
- Deleted actors can serialize as “System”; their original names/emails cannot
  be reconstructed safely. The affected-account fallback states that the account
  identity was not recorded.
- Missing legacy target names/IDs and unrecorded historical values cannot be
  recreated in the frontend. No extra timeline events are inferred.

## Visual evidence

Generated local artifacts (intentionally ignored by Git):

- `output/admin-ui-review/before/`: all five Admin routes, Add User, login details,
  and Staff/Student reference dashboards before application edits.
- `output/admin-ui-review/after/`: matching after screenshots.
- `output/admin-ui-review/comparison.html`: side-by-side visual comparison.
- Test screenshots: `node_modules/.cache/vista-design-review/admin-consistency/`
  in the isolated validation checkout, including mobile, filters, every modal,
  all configuration forms, error/loading/empty states and audit changes.

REA performed controlled, owned-browser accessibility captures before and after.
The refined capture confirmed all navigation, metric labels/counts and table
actions remain represented. Owned browser cleanup was confirmed by REA. This
evidence concerns fictional local fixtures, not a production session.

## Validation and scope limits

Validation uses the existing isolated dependency checkout and Node **24.22.2**,
without reinstalling or upgrading dependencies. Fixture data uses `example.test`
accounts and an Axios adapter; external WebSockets and production API access are
blocked. No actual account, submission, organization, email or database was mutated.

| Check | Result |
| --- | --- |
| ESLint | Passed on the final application and fixture source. |
| Complete unit suite | 119 passed, 0 failed under Node 24.22.2 after the Audit Log UX correction. |
| Static validation | 115 JavaScript modules checked; JSX checked by ESLint/Vite. |
| New Admin browser coverage | 50 passing checks, including route widths 1440/1280/768/360 and every major Admin dialog. |
| Existing browser coverage | All existing checks passed across the final serial run and one isolated spreadsheet-download rerun. See the qualification below. |
| Production Vite build | Passed with the existing 746.32 kB Staff dashboard chunk warning. |
| Summary foreground | White labels/counts on all four cards per owner follow-up. Earlier gold/green contrast measurements used dark text and no longer apply; those white combinations do not meet normal-text AA contrast. Backgrounds and artwork are preserved as requested. |
| Git whitespace/scope review | Passed; no staged files and no dependency, CI or environment changes. |

Browser-run qualification: an initial run exposed fixture-readiness/query-type
assertions and a cold-load Staff timeout. The fixture issues were corrected and
the Staff checks passed on the final serial run. That final run passed the Admin
and other existing browser cases, but its last spreadsheet-download test hit its
90-second timeout while local validation was also active. Its stalled cleanup was
interrupted; the unmodified export test then passed in isolation in 2.49 seconds.
This is successful coverage across runs, **not a claim of a single green full-run
exit or GitHub-hosted CI success**. No test timeout, security gate or existing
Staff/Student test was weakened to obtain these results.

The automated UI checks exercise all five routes at multiple viewport widths;
add/edit/delete and invitation dialogs; all configuration tabs; keyboard focus,
Escape and restoration; filters/search/pagination; six audit-event shapes; full IDs,
nested changes, canonical statuses and read-only inspection; and the confirmation's
pending, duplicate-click, failure, Cancel and successful fresh-read behavior.

Live Railway authentication/permissions, real CRUD persistence, physical devices,
actual email delivery and production audit records have not been exercised.
Admin PDF/CSV export delivery and real image-upload/storage operations were not
performed; their request/download handlers were preserved by source review.
The new delete-confirmation tests verify the existing request through a fictional
API and a fresh fixture read; they are not proof of production database persistence.

The production build retains the existing non-fatal large Staff dashboard chunk
warning. No bundle restructuring was included in this Admin-only task.

## Exact changed files

```text
src/components/AuditLogTable.jsx
src/modules/admin/AdminUI.css
src/modules/admin/AuditLogs.jsx
src/modules/admin/Dashboard.jsx
src/modules/admin/Profile.jsx
src/modules/admin/RegistrationConfig.jsx
src/modules/admin/auditlogs/auditPresentation.js
src/modules/admin/auditlogs/components/AuditLogDetails.jsx
src/modules/admin/auditlogs/components/AuditLogHeader.jsx
src/modules/admin/auditlogs/components/LogDetailsEventSummary.jsx
src/modules/admin/auditlogs/components/LogDetailsHeader.jsx
src/modules/admin/dashboard/RegisteredOrg.jsx
src/modules/admin/dashboard/components/AdminSummaryArtwork.jsx
src/modules/admin/dashboard/components/RecentSubmissionsTable.jsx
src/modules/admin/dashboard/components/RegisteredOrgHeader.jsx
src/modules/admin/dashboard/components/RegisteredOrgTable.jsx
src/modules/admin/dashboard/components/UserSummaryCards.jsx
src/modules/admin/dashboard/modals/AddOrgModal.jsx
src/modules/admin/dashboard/modals/AddUserModal.jsx
src/modules/admin/dashboard/modals/EditOrgModal.jsx
src/modules/admin/dashboard/modals/EditUserModal.jsx
src/modules/admin/dashboard/modals/ResendInvitationModal.css
src/modules/admin/registrationconfig/modals/ConfigEntryModal.jsx
src/modules/admin/registrationconfig/modals/DeleteConfirmModal.jsx
src/documentation/ADMIN_UI_REFINEMENT.md
tests/adminAuditPresentation.test.mjs
tests/adminUI.test.mjs
tests/fixtures/admin-audit-data.mjs
tests/fixtures/admin-ui.html
tests/fixtures/admin-ui.jsx
```

The eight pre-existing, untracked UI review tools were preserved and are not part
of this task's file set. Generated screenshots, fixture servers and comparison
outputs remain under ignored local output/cache directories.

For a fair visual comparison, the final before images use an isolated archive of
the original committed source (`ef55c65`) with the same final fictional records and
pagination as the after images. The live working tree was never reset or replaced.
