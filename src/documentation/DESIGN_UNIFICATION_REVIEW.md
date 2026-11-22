# VISTA Web design unification review

20 November 2026. Local, uncommitted implementation. This report describes the
current pass against the actual starting working tree, including extensive earlier
UI changes. Earlier work was preserved, not replaced or attributed to this pass.
Only `vista-web` was edited. Mobile and Backend were read-only references.

## Follow-up: four student cards and blue table title bars

The latest request supersedes the neutral table title bars and dark summary text
described below. `SubmissionSummaryCards.jsx` now shows Total Submissions, Pending,
Approved and Returned, using the same four organization-scoped canonical count
queries as Mobile (`rejected` supplies Returned). Existing counts remain intact;
the fourth query participates in loading, unavailable-count feedback and Retry.
The desktop grid has four cards and small screens use a balanced two-by-two grid.

`workspace.css` gives summary labels/values white text across all roles. Admin's
two pale supporting tiles use existing navy/amber tokens so their white labels
remain visible. `TableContainer.jsx`, shared styles and the mobile heading rule
in `responsive.css` make all table title bars blue with white titles, including
Priority Submissions and the custom System Submissions toolbar. Rows, columns,
status colors, pagination, search and action handlers are preserved. Buttons keep
their blue/white treatment with a visible border against the blue header.

Validation: production build passed with the existing large-chunk warning; eight
focused tests passed, including distinct/zero/unavailable student count coverage.
All 60 checks across ten affected role pages and six widths passed, asserting four
student cards, white card text and blue/white table headers; there was no viewport
overflow, runtime exception or API write. Screenshots were inspected at 360 and
1366px. No new lint diagnostics or whitespace errors. These checks used fictional
local data; live production/API persistence and external delivery were not tested.
No Mobile/Backend edits, commits, pushes or deployments were performed.

## Follow-up: blue actions and registration preview

The owner's follow-up supersedes the earlier outlined viewing-action treatment.
`ActionButton`, `FilterButton`, `ExportButton`, the custom staff exports/Review
Panel controls, and admin table Edit actions now use navbar blue with white text
and icons. `TableSearchBar` has a visible resting border; both custom staff
submission searches now reuse it. Profile panels and avatar borders are white.

`SubmissionPass.jsx` / `.css` extract the existing purple card for reuse in saved
review details and registration's final review. `OCRResults.jsx` replaces the
Pending Structured Data form with a labeled draft preview, preserving organization,
submitter, academic year, category, title, document type, date and attachment.
`DocumentEntry.jsx` additionally supplies the selected submitter's existing avatar.
Redo, Approve, pending guards, optional attachments and save handlers are preserved.
The preview neither creates a record nor invents a saved reference/status.
`AttachmentImagePreview.jsx` restores focus to the original attachment opener after
its autofocus dialog closes; this was caught by the preview's keyboard checks.

Follow-up validation: production build passed with the existing large-chunk
warning; 30 targeted tests passed (registration validation/OCR, upload retries,
attachment rendering, draft preview, filters, archive presentation and focus);
132 route/viewport checks had zero overflow, runtime exceptions or API writes.
The new preview was inspected at 360, 768 and 1366px. Comparison against the
preserved follow-up working tree found no added lint diagnostics; earlier lint
findings remain. Test fixtures use fictional local data. Live persistence,
notification delivery and production behavior were not exercised. No commits,
pushes, deployments, Mobile changes or Backend changes were made.

The remaining sections document the preceding complete unification pass.

## Reference comparison and direction

The Mobile screenshots and theme establish DM Sans, VISTA blue/white actions,
yellow navigation emphasis, neutral surfaces, rounded fields, compact labels,
document illustrations and the purple submission identity. The Pinterest image
informs mixed panel proportions, alignment and whitespace. The Web references
establish the sidebar/header, tables, form steps, review columns and legal contents
navigation that must remain recognizable.

The starting Web implementation already contained shared controls and portals but
still had separate public palettes, disconnected blue panel headers, small outline
summary icons, duplicate status display mappings and the redundant attachment
empty panel. The rendered review also found mobile header contrast and native
invitation focus defects. Those findings drove the changes, rather than a global
rounding pass.

## Design system and shared components

The full component rules and acceptance contract are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

| Mobile source | Shared Web counterpart |
| --- | --- |
| Blue `#1A59A5`, navy `#142B52` | `--ui-blue`, `--ui-navy`; public aliases resolve to them |
| Yellow `#FFC342`, green `#52B764` | `--ui-yellow`, `--ui-green`; meaningful emphasis and summaries |
| Canvas `#F3F3F3`, surface `#FFFFFF` | Shared role/public canvas and white panels |
| Field `#F7F9FC`, selected `#E8EFF8` | Fields, selected controls, quiet supporting panels |
| Text `#1E3A68`, muted `#64748B` | Shared type and readable secondary text/placeholders |
| Danger `#B91C1C`, success `#15803D`, warning `#875100` | Semantic feedback and status tokens |
| Card 20, field 16, sheet 28, regular button 24 | Same CSS radius roles; compact actions retain radius 10 |
| Spacing 4/8/12/16/20/24/32 | Existing CSS spacing scale |
| DM Sans 400/500/600/700 | Bundled local font; Web also retains its existing 800 weight |
| Folder, clock, checked/returned paper artwork | Shared decorative SVG based on Mobile's project-owned native shapes |

Standard primary buttons and action links use blue/white, secondary actions use
neutral outlines, and destructive actions retain red. Shared icon controls have
consistent hit areas, geometry and hover/disabled states. Navigation, charts and
the submission ticket retain meaningful visual exceptions. Native/system file and
permission dialogs remain browser-managed.

Table, analytics and history headings now use quiet white surfaces. Staff/student
summary artwork and mixed-width tiles provide the stronger bento emphasis. Admin
summaries use the same palette, with readable foregrounds on pale supporting tiles.
Tables keep their data structure and existing phone reading layout.

`submissionPresentation.js` centralizes row/timeline labels and normal-surface
colors. On Process remains `under_review`, Approved remains `approved`, and the
existing Returned mapping remains `rejected`. Filter values, grouped summary
definitions, API status mappings and export data contracts were preserved.

## Route and component coverage

The normal rendered matrix covers these 22 routes at 360, 390, 768, 1024, 1366 and
1920px. These are fictional-data renders of the actual React pages, not live
account sessions. Source inventory and rendered sampling are different evidence.

| Area | Routes rendered |
| --- | --- |
| Staff | `/staff/dashboard`, `/staff/registration`, `/staff/registration/analysis-results`, `/staff/review-panel`, `/staff/gdrive-sync`, `/staff/audit-logs`, `/staff/profile` |
| Student | `/student/dashboard`, `/student/review-tracker`, `/student/review-tracker/qa-submission`, `/student/audit-logs`, `/student/profile` |
| Administrator | `/admin/dashboard`, `/admin/dashboard/registeredorg`, `/admin/registration-config`, `/admin/audit-logs`, `/admin/profile` |
| Public | `/`, `/login`, `/get-app`, `/privacy-policy`, `/terms-of-service` |

Shared coverage includes tables, searches, filters, exports, summaries, status
labels, forms, field errors, notifications, reply threads, skeletons and existing
overlays. Role-specific functions were not substituted for one another. Existing
sidebar hierarchy, registration/OCR stages, profile field order, attachment access,
review controls and administrative modules remain in place.

The public shell shares the product tokens and local type. Login has matching
fields/feedback and a keyboard-accessible password toggle. Public pages have a
skip link. Get the App uses a leading feature card, supporting cards and grouped
installation steps. Its release/download configuration and Android guidance remain
unchanged. Legal copy and anchors were not rewritten; white reading panels and
larger text replace the previous all-blue tint.

The deployed [Get the App page](https://vista-ustp.up.railway.app/get-app) was also
inspected read-only. Its download resolved to the existing v1.0.3 release APK.
No download, authentication action or deployed data mutation was triggered.

## Staff review and archive correction

Backend inspection established that `drive_archives` serializes persisted
`DriveArchive` rows after Drive supplies a file identity; students receive an empty
archive list. The attachment panel is omitted only after successful details loading
when there are no current documents and a saved archive has `archive_id`,
`drive_file_id` and `archived_at`. Approval alone, an arbitrary URL, a pending upload
or a failed details request cannot hide the empty/error/loading panel.

Current documents remain visible even with an archive. The hierarchy remains
visible without a usable external link. No files, historical records or backend
data were deleted or changed. Existing fresh details reads and archive refresh
events remain intact.

The Drive file row gives filenames their own width and places the action below;
long names wrap without losing information. One redundant card layer was removed.
History headings, event markers, connectors and remarks use shared tokens. Dates,
author metadata, ordering, reply controls and participation capability remain
connected to the existing backend state. The illustrated purple ticket is retained.

## Interaction and accessibility findings

- Native invitation dialog: reproduced missing return focus and Tab escape from
  controls. Reused the existing focus registration for scroll locking/restoration,
  made registered native dialogs cycle Tab, and retained native `onCancel` ownership
  of Escape and the existing pending guard. No invitation was sent during tests.
- Mobile table headings: reproduced white text on a newly neutral header, then a
  remaining legacy blue header with a dark title. Corrected the responsive rule and
  enrolled the legacy table in the shared panel treatment. Rendered contrast checks
  now cover table/panel headings alongside viewport checks.
- Shared searches have accessible names. Muted text/placeholders use the shared
  readable token. The password visibility control is keyboard reachable and exposes
  its pressed state. Review segmented controls expose their selected state.
- Existing portals, native selects, field labels, modal guards, focus rings,
  reduced-motion rules and dropdown collision behavior are retained. Public QR
  dismissal restores focus. Legal anchors retain their targets and content.

The state review exercises ten overlay families at 360 and 1366px: status/error,
add/edit user, add/edit organization, configuration, deletion, Drive confirmation,
invitation and attachment processing. It checks viewport fit, focus entry, Tab,
Escape and return focus. Additional checks cover the QR dialog, password keyboard
activation, legal anchors, all-role empty/error dashboards, 200% legal-page zoom,
and the Get the App feature/install sections. Nested filters/calendars, image
ordering, disabled controls and pending duplicate activation have automated coverage.

## Research and skills actually consulted

- Installed workspace `ui-ux-pro-max`: read its SKILL.md and ran the local design
  search. Its generic Fira/slate recommendation was not adopted; Mobile determines
  VISTA's font and palette. Upstream source: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
- [RC's frontend SKILL.md](https://github.com/RitvikChunamari/rcs-frontend-skill/blob/main/SKILL.md):
  consulted its supplied-direction, design-contract, behavior-test and rendered
  critique guidance, plus accessible supporting references. Some optional reference
  URLs were unavailable. No remote scripts or redundant packages were installed.
- [Vercel web-design-guidelines SKILL.md](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md)
  and its current Web Interface Guidelines informed keyboard, focus, semantics,
  contrast, typography and content-overflow checks.
- The requested Claude Code frontend-design path returned 404. Consulted the
  official [Anthropic frontend-design SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
  for coherent brand direction and the separate visual critique pass.
- Installed `reverse-engineer-anything`: REA passively inspected the public
  [Geist button reference](https://vercel.com/geist/button). Evidence
  `ev_b40bda9d3713394191c1967a0cbaba4eb9eec4bd9ccec3e9b32181381e4b095d`
  includes named controls and loading/disabled reference sections. This informed
  state/semantic checks; it is not evidence of private SaaS behavior or exercised
  interactions. The observation was attach-limited and policy-filtered. The evidence
  bundle was saved locally and the REA investigation closed.

## Verification results and limits

- Production build passed. The existing dashboard bundle-size warning remains.
- Final full Node run: **108 tests, 107 passed, one failed**. The unchanged
  `devServerIsolation.test.mjs` cannot establish its first server because port 5173
  is occupied. The developer's server was preserved and the test was not weakened.
- Archive regression reproduced the original failure before implementation and
  passes nine cases: saved/linkless archive, archive plus current file, current
  file, empty, approved without archive, arbitrary pending URL, failed read, loading.
  It also renders long archive filenames at all six widths.
- Native-dialog focus/scroll/pending regression passes at 360 and 1366px, alongside
  the existing nested filter/calendar/action tests. Unit coverage also checks native
  Tab cycling while leaving Escape to the native cancel handler.
- Normal route matrix: **132 viewport checks**; no horizontal page overflow,
  primary blue/white palette outlier, uncaught runtime exception or API write.
  A focused six-width review-toolbar recapture also passes.
- Final state review: **43 checks**; no uncaught runtime exception or API write.
- Full lint retains **25 errors and five warnings**. Comparison with the preserved
  starting files found no added diagnostics; embedded warning line numbers were
  normalized for comparison. Existing hook/unused-code findings were not fixed.
- Diff review found no changed JSX event-handler or service/API/mutation call
  expressions, no deleted source files and no modifications to release configuration
  or legal copy. This static comparison supports scope review, not live behavior.

Live authenticated mutation/reload persistence, physical Android operation, camera
capture, actual OCR, Google OAuth/Drive upload, WebSockets in production, email or
push receipt, Safari/Firefox, screen-reader sessions, every possible hidden record
state and every provider failure remain **unverified**. The OAuth callback is not
included in the normal route matrix. Existing source-level handling was preserved;
those journeys are not claimed fully validated. No new feature/routes/dependencies
were added to compensate for unavailable live integrations.

## Evidence, exact files and local status

[UI_CHANGED_FILES.csv](UI_CHANGED_FILES.csv) lists every current local modified or
untracked file, distinguishing preserved earlier work from this pass.
[UI_BUTTON_AUDIT.csv](UI_BUTTON_AUDIT.csv) records button sites and semantic
treatments; [UI_COMPONENT_INVENTORY.csv](UI_COMPONENT_INVENTORY.csv) records source
families/states without claiming each was rendered in every possible state.
The refreshed inventory contains 146 JSX source files and 225 button/action sites,
with no unclassified button sites. Git whitespace checks passed with Windows CRLF
handling; existing line-ending conversion warnings were preserved.

Cached screenshots, measurements, test/build/lint output, the starting source
snapshot, source comparison and REA evidence are under
`node_modules/.cache/vista-design-review/`. They are local QA artifacts, not
production assets. Representative images:

- [Staff dashboard, desktop](../../node_modules/.cache/vista-design-review/accepted/-staff-dashboard-1366.png)
- [Staff dashboard, phone](../../node_modules/.cache/vista-design-review/accepted/-staff-dashboard-360.png)
- [Admin dashboard](../../node_modules/.cache/vista-design-review/accepted/-admin-dashboard-1366.png)
- [Public legal page](../../node_modules/.cache/vista-design-review/accepted/-privacy-policy-1366.png)
- [Staff archive and history](../../node_modules/.cache/vista-design-review/archive/1366.png)
- [App features](../../node_modules/.cache/vista-design-review/states/ga-highlights-1366.png)

Everything remains local and uncommitted. No branch switch, reset, merge, commit,
push, PR, deployment, migration, production settings/credential change or live data
write was performed. Existing working-tree changes and developer servers remain.
