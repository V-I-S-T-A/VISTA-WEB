# VISTA Web design parity review — 20 November 2026

Latest follow-through: [DESIGN_UNIFICATION_REVIEW.md](DESIGN_UNIFICATION_REVIEW.md)
records the subsequent public/role unification, archive presentation correction,
native-dialog fixes and current verification. The historical results below belong
to earlier passes and should not be substituted for that report's evidence.

## Scope and evidence

Implemented locally on `feat/web-ui-polish-2026-11-20`, based on `1b413f3`.
The latest parity pass started with existing uncommitted UI work. That working
tree was preserved as the baseline, including a source snapshot under the
workspace's `.vista-preservation/parity-20261120/`. This report covers the combined
local UI changes; it is not a production deployment report.

The current Mobile implementation was read as the primary reference, especially
`src/theme/tokens.js`, `src/theme/layout.js`, `AppButton`, `AppInput`, dialogs and
common components. Mobile and Backend were not edited. The Pinterest reference
informed grouping and mixed panel proportions, not a new marketing palette.

Skills consulted: `expo-design-system` and `expo-native-ui` for understanding
Mobile, `ui-ux-pro-max` for density/accessibility review, and
`reverse-engineer-anything` for public runtime reference research. No native
mobile components or new UI framework were introduced into Web.

REA inspected the public [Geist button reference](https://vercel.com/geist/button)
(Evidence `ev_1406787067b371429c96413027ef2b85031d432281635d998ee076fc1ea196e0`).
Its accessible control inventory supported checking named icon controls and
separate disabled/loading variants. Public
[Radix popover documentation](https://www.radix-ui.com/primitives/docs/components/popover)
informed portal, focus and collision checks. These are references to public
component patterns, not claims about private dashboard functionality. Local Web
verification used an isolated Chrome preview with fictional API data.

## 1. Exact Mobile-to-Web token mapping

| Concern | Current Mobile | Web |
| --- | --- | --- |
| Canvas / surface | `#F3F3F3` / `#FFFFFF` | `--ui-canvas` / `--ui-surface`, identical |
| Brand / navy | `#1A59A5` / `#142B52` | `--ui-blue` / `--ui-navy`, identical |
| Text / muted | `#1E3A68` / `#64748B` | `--ui-text` / `--ui-muted`, identical |
| Field / selected | `#F7F9FC` / `#E8EFF8` | `--ui-field` / `--ui-selected`, identical |
| Border | `#E1E8F0` | `--ui-border`, identical; control outlines use stronger `#899BB1` |
| Yellow / on yellow | `#FFC342` / `#513600` | Identical branding and summary emphasis |
| Green / on green | `#52B764` / `#103F20` | Identical summary fill and readable foreground |
| Danger / success / warning | `#B91C1C` / `#15803D` / `#875100` | Identical semantic tokens |
| Disabled surface | `#EEF2F6` | `--ui-disabled`, identical |
| Ticket / ticket text / muted | `#393A70` / `#E8E7FA` / `#D6D5EE` | Available as shared ticket tokens; illustrated review card retains requested purple art |
| Spacing | 4 / 8 / 12 / 16 / 20 / 24 / 32 | Same CSS spacing scale |
| Card / field / sheet / chip radii | 20 / 16 / 28 / 12 | Card 20, field 16, desktop dialog 28, chip 12 |
| Regular button | Radius 24; minimum target 48 | Radius 24; desktop height 42, phone actions 44 |
| Dense controls | Review radius 10, action height 42 | Table action radius 10, height 36; preserves desktop density |
| Type family / weights | DM Sans 400 / 500 / 600 / 700 | Same local font files, plus existing Web 800 usage |
| Page title | 20/26 | Desktop 24/28.8, same hierarchy and family |
| Section / body / label / metadata | 16/22, 14/21, 13/18, 12/16 | Same semantic sizes; dense table metadata remains 12–13 |
| Buttons | 14/20, weight 600 | Regular 14/20; compact table actions 12/18 |
| Motion | 150 / 200 / 220 ms | Same timing range, reduced-motion overrides |

DM Sans is bundled from Mobile's installed font package, including the SIL Open
Font License. Local font rendering was checked while external HTTPS resources
were blocked. The existing public branding artwork and categorical chart colors
remain intentional presentation exceptions.

## 2. Shared design system

`src/index.css` remains the token source. `workspace.css` applies shared surfaces,
typography, focus, overlays and responsive treatments. `components/Controls.css`
defines primary, secondary, destructive, tertiary and icon treatments through
explicit semantic attributes on shared and legacy controls. `ActionButton` exposes
variants; its default view action is secondary.

Existing primitives are reused: `FormField`, native inputs/checkboxes, `VistaSelect`,
`TableContainer`, summary cards, `StatusBadge`/`SubmissionStatusLabel`,
`AuditActionLabel`, `DialogLayer`, `StatusModal`, `AnchoredPopover`,
`CalendarPopover`, `ToastProvider`, `ErrorNotice` and skeletons. No dependencies,
routes, services or competing styling framework were added.

## 3. Button audit

[UI_BUTTON_AUDIT.csv](UI_BUTTON_AUDIT.csv) records all **225 button sites** across
144 JSX files, including inline legacy controls. None remains unclassified.

- Primary mutations/confirmations use solid `#1A59A5` and white text.
- Supporting view/edit/export/filter/cancel actions use neutral outlined styling.
- Destructive actions and deletion confirmations use semantic red.
- Navigation, pagination, notification rows, calendar cells, options, switches and
  segmented controls retain their selected-state semantics.
- Sidebar/navbar branding and selection remain navigation-specific. Chart series
  controls preserve their data-color relationship.
- Native browser confirmation for permanent user deletion remains deliberately
  browser-managed, preserving its existing destructive confirmation flow. Native
  file choosers and browser permission prompts also keep platform presentation.

Default, hover, pressed, focus and disabled states are shared; loading labels and
existing guards are retained, with busy semantics on applicable controls. Removed
legacy mouse handlers that could leave a yellow or unrelated inline color behind.
Browser assertions cover palette, keyboard activation, pending double-activation
prevention, destructive confirmation color and hover recovery.

## 4. Student coverage

Rendered dashboard, tracker, submission details, audit history and profile at all
six required widths. Retained summary meaning, submission links, organization
visibility, read-only restrictions, history and reply ownership. Profile now uses
a flat original-blue account panel, visible field labels, inset personal details, a matching
avatar group and the existing adjacent notifications panel. Submission notice,
details and history remain distinct readable panels. Shared reply composers,
notification menus, date picker and feedback use the common system.

## 5. Staff coverage

Rendered dashboard, registration, analysis results, review list, Drive sync, audit
history and profile at all six widths. Analytics/export menus retain existing
filters and download behavior. Registration retains organization-dependent fields,
OCR, upload and final review steps. Its upload area supports keyboard activation.

The illustrated review card uses a copied Mobile cosmic image, saved latest
status, exact submitter lookup with avatar fallback, reference/contact/type/date
and existing attachment access. Draft status selections do not replace the saved
status. Card/history remain left; decision/Drive hierarchy remain right on wide
screens, stacking in reading order on narrow screens. Separate mock checks cover
390px as well as the other required widths and the grid breakpoint edges.

Drive image reordering now accepts arrow keys on the existing drag handles for
both report and final-document groups. Existing drag behavior, file groups,
conversion requirement and final submission guard remain intact.

## 6. Administrator coverage

Rendered user management/dashboard, registered organizations, registration
configuration, audit history and profile at all six widths. Reviewed shared
add/edit user and organization dialogs, configuration entry, deletion and resend
invitation dialogs. Kept permissions, validation, account-status switches,
temporary-password messaging, search, filtering, pagination and exports.
Removed the forced desktop minimum that caused unnecessary user-table scrolling.
Existing summary/export surfaces were refined; no new analytics/reporting routes
or features were invented.

## 7. Bento composition

| Existing region | Treatment and purpose |
| --- | --- |
| Student/staff/admin summaries | Mixed-width leading total plus supporting tiles; same order and meaning |
| Dashboard data | Wide table/analytics panels; Institutional Pulse and the audit widget removed at the owner's request |
| Review details | Illustrated identity panel plus history, paired with decision and Drive panels |
| Student profile | Wider account panel and narrower notification panel |
| All profiles | Original flat blue surface, circular avatar without a decorative inset, personal-details grouping |
| Registration / Drive | Task panel plus existing illustration column; stack when narrow |
| Audit / configuration / management | Full-width data panels and scoped controls; preserve table efficiency |
| Conversations | Readable threads and composers, not decorative tile collections |

Existing blueprint, routes, main placement and reading order were preserved.

## 8. Overlay audit

Rendered the shared status, add/edit user, add/edit organization, configuration,
delete, Drive, invitation and attachment-processing families. Checked focus entry,
Tab trapping, Escape, pending dismissal guards, return focus and scroll locking.
Image preview, review decision and deletion were also exercised from actual review
components with fictional attachments.

Selects, filters, calendars, organization picker and export menus reuse portals
with constrained viewport placement. Nested select options render above filters
and calendars. Real pointer tests assert that the option receives the click;
child selection/Escape must not dismiss its parent. Date typing, bounds, leap-day
validation, month/year selection and ISO callbacks remain covered.

Dialog title/surface/font/footer treatments now agree. Large bodies scroll inside
their viewport bounds. Native `dialog` behavior remains for resend invitation;
native browser/system controls retain the exceptions described above.

## 9. Error and interaction-state coverage

Shared feedback preserves the difference between pending, failed and successful
operations. No API result or success condition was replaced with cosmetic success.
Validation and controlled values remain connected; profile errors/success use
readable semantic text; profile save feedback uses light semantic insets on the restored blue surface.

Rendered fictional API failures, unavailable detail/history, empty lists, loading,
forbidden submission access, unavailable attachments and invitation failures.
Export failures and empty exports now use `StatusModal` instead of unstyled alert
boxes. Actual student empty export and staff analytics/recent PDF failure paths
were exercised at 360 and 1366px with mocked export failures; zero writes and zero
runtime exceptions were recorded.

Network/auth/session/notification/OCR/Drive state handling continues through the
existing services and hooks. Their source paths are inventoried; this is not proof
of every external outage, expired live session or delivery-provider response.
No raw internal exception was newly exposed or error suppressed by this pass.

## 10. Responsive and accessibility verification

Two rendered review passes were followed by correction captures. The saved
role/page matrix contains **102 valid role-route/viewport combinations**: 17 role
routes at **360, 390, 768, 1024, 1366 and 1920px**. No horizontal page overflow,
missing local font or primary-palette outlier was found in that matrix. An early
blank capture was excluded and recaptured; it was not counted as verification.

Inspected representative full screenshots and a contact sheet of all 17 desktop
role pages. Additional checks cover review-card content and breakpoint edges,
long titles/filenames, empty/error states, nested overlays, reduced motion and
200% page scaling. Table overflow remains intentional where data requires it.

Keyboard/focus checks include modal stacks, nested menus, date navigation, visible
field labels, password visibility controls, upload activation and image ordering.
Status labels retain text alongside color. The standard blue/white action pair
and muted text pair meet normal-text contrast requirements on their surfaces.
Screen-reader sessions, Safari/Firefox and physical touch devices were not tested.

## 11. Regression results

- `npm run build`: passed; existing large dashboard-chunk warning remains.
- Full Node suite: 106 tests, 105 passed, one pre-existing failure in
  `devServerIsolation.test.mjs` because port 5173 is occupied by the developer's
  server. That server was not stopped. The test was not weakened.
- Focused browser/focus/field suite: 9 passed. Includes semantic actions, hover
  recovery, keyboard image order in both groups, conversion guard, nested filters,
  dates, pending activation and focus restoration.
- Full lint: same baseline 25 errors and 5 warnings; comparison against the starting
  source snapshot found no new diagnostics. Existing hook/unused-variable findings
  are not claimed fixed.
- Review-card mock checks: 13 checks, in-viewport select, zero mutations and zero
  runtime exceptions, including saved-vs-draft status and exact submitter matching.
- API/mutation/save expression comparison: unchanged across the changed JSX files.
- `git diff --check`: passed after whitespace corrections.

Automated UI fixtures use fictional endpoints or seeded in-memory query data.
They do not upload to Drive, change shared Railway data or notify real recipients.
Build/mocks do not establish PostgreSQL persistence, email receipt, push delivery,
OCR provider health or production behavior. Those integrations were left unchanged
and were not exercised with live writes.

## 12. Remaining limitations and intentional exceptions

No known app-owned primary-button palette outlier remains in the inventoried
source or rendered matrix. This is bounded evidence, not a claim that every
possible hidden state, record length or external-service response was rendered.
Camera permission/capture, real Google OAuth/Drive transfer, actual OCR processing,
email/push delivery, deployed WebSockets, real mutation persistence and physical
device checks remain unverified.

Browser-managed deletion confirmation, native file/permission dialogs, semantic
status colors, categorical charts, purple submission art and existing public
marketing artwork are deliberate exceptions. Existing lint failures, the occupied
port test and bundle-size warning remain recorded above. No backend defect was
silently changed to make visual QA pass.

## 13. Files and final checklist

- [Complete changed-file list](UI_CHANGED_FILES.csv): tracked modifications and
  untracked additions, distinguishing preserved earlier work from this parity pass.
- [All component/source state paths](UI_COMPONENT_INVENTORY.csv): 145 JSX files;
  source inventory is explicitly distinguished from rendered-state sampling.
- [Button classification and locations](UI_BUTTON_AUDIT.csv): 225 sites.
- Local screenshots/results: workspace `.vista-preservation/parity-20261120/` and
  review-card evidence under `.vista-preservation/ui-browser/`.

- [x] Current Mobile tokens/components inspected; Mobile and Backend read-only
- [x] Tokens, local font assets, shared action variants and neutral form surfaces
- [x] Student dashboard/tracker/details/profile/notifications/history families
- [x] Staff dashboard/registration/OCR review/review/Drive/audit/profile families
- [x] Admin users/organizations/configuration/audit/profile and management dialogs
- [x] Tables, summaries, fields, selects, checkboxes, status labels and replies
- [x] Dialogs, filters, calendars, export menus, notification and preview families
- [x] Applicable default/focus/hover/pressed/selected/disabled/loading/error paths
- [x] Two visual passes, correction captures and six-width rendered matrix
- [x] Regression tests, baseline lint comparison, build and diff review
- [ ] Live-provider, production, real-database and physical-device verification

Everything remains local and uncommitted. No commit, push, merge, PR, deployment,
production migration/settings change, credential change or destructive Git action
was performed for this work. Existing teammate changes and the developer server
were preserved.

## 14. Owner-requested visual corrections — November 20, 2026

These corrections supersede the earlier neutral profile treatment and dashboard
widget arrangement. The current source inventories include this revision; earlier
render counts above describe the original parity pass.

- Removed decorative icon backgrounds/borders from modal headings, status/error
  feedback, file rows, summaries, export menus and reply controls. Functional
  buttons, focus rings, avatars and timeline markers retain their purpose.
- Added `GoogleDriveLogo.jsx` and copied Mobile's unmodified local
  `google-drive.png`. Drive dialogs, root-folder/archive cards, connection cards
  and the sidebar now use the real provider mark. Google sign-in has an unboxed
  Google mark on an outlined white button; its authentication handler is unchanged.
- Matched sidebar branding to the supplied logo/wordmark/subtitle reference.
- Restored the original `#1f5cae` profile panel for all three roles, retaining field
  order and the current layout. Avatars have explicit equal dimensions and circular
  cropping. Remove Profile is a simple text control; labels, save feedback and the
  password section remain readable against the blue panel.
- Flattened gradient container backgrounds in the workspace, public supporting
  panels, error page and submission card. Existing image artwork, hero readability
  overlays, chart meanings and loading shimmer remain intact.
- Removed Institutional Pulse and the audit widget from the staff dashboard.
  Separate Audit Logs pages, routes, permissions and history remain available.
- Improved the phone Drive dialog's upload actions, footer and root-folder layout
  so labels remain readable without narrow multi-line buttons.

Verification: 13 targeted tests passed, covering dialog focus/stacking/Escape,
nested filters/calendars, Drive image ordering and conversion guards, attachment
previews, replies and deletion validation. The interaction suite passed again after
the final phone spacing change. A six-width mock browser pass recorded 68 checks;
12 focused follow-up checks passed after the final adjustments. Neither pass
recorded runtime exceptions, page overflow or API writes. These are sampled local
UI checks, not proof of live-provider or production behavior.

The final production build passed with the existing large-chunk warning. Lint
retains its previous 25 errors and 5 warnings, with no added diagnostics. An AST
comparison against the preserved starting source found no changes to JSX event
handlers or API/mutation/save call expressions. Only the requested dashboard
widgets were unmounted; no API contracts, saved data or business logic changed.
Screenshots, source snapshot and diff review are under workspace
`.vista-preservation/visual-corrections-20261120/`. Changes remain local and
uncommitted; no deployment or live-data operation was performed.
