# CI hardening review — 2026-11-22

Historical report of the initial CI hardening phase. At that stage the security
job correctly failed on one high-severity SheetJS finding. The later remediation
installed the official, integrity-pinned SheetJS 0.20.3 archive and resolved that
finding without changing the security threshold. The recorded Node 24.22.2 checks
now pass locally, including 113 unit tests, 90 browser checks and zero audit
findings. See [current readiness](CI_PRODUCTION_READINESS.md) for the current
configuration, subsequent reviews and hosted-CI/deployment verification gaps.

The findings and tables below preserve the original phase's evidence, including
its Node 24.22.3 run and temporarily unresolved SheetJS finding. They are not the
current readiness verdict. No commits, pushes, merges or deployments were made
as part of these reviews. The six-job pipeline was reviewed, not recreated.

## ESLint: all 26 errors and 5 warnings fixed

[Exact findings, original file/line, classification and resolution](CI_LINT_REMEDIATION.csv)
records every diagnostic. No rules were disabled and no exclusions were added.

| Original finding | Count | Cause and minimal correction |
| --- | --- | --- |
| `react-hooks/set-state-in-effect` | 11 errors | State initialized/reset synchronously in effects; use initial state and guarded prop-change adjustments before commit. Toast display now happens in the notification event effect without intermediate render state. Image URLs use a callback-ref lifecycle with revocation. Camera resource cleanup remains an effect. |
| `react-hooks/exhaustive-deps` | 5 warnings | Unstable toast action and empty-array fallbacks, missing derived-object dependency, and external status synchronization. Stabilize inputs and include reactive dependencies; retain filter reset behavior. |
| `no-unused-vars` | 12 errors | Unused icons, catch binding, helper and destructured props. Remove unused bindings only. |
| `no-constant-binary-expression` | 1 error | An object-spread expression is always truthy; remove its unreachable `|| {}`. |
| `no-useless-assignment` | 1 error | Pagination initializer overwritten before reading; retain loop and pagination, omit only the initializer. |
| `react-refresh/only-export-components` | 1 error | Test fixture component lacked an export; export it without changing its fixture rendering. |

There were no Rules-of-Hooks call-order diagnostics or accessibility diagnostics
in this lint report. This is not a complete accessibility audit: the configured
ESLint rules do not include a comprehensive accessibility plugin. The effect-state
findings are primarily synchronization/performance debt, not evidence that every
affected component had a broken user workflow. External object-URL synchronization
was legitimate; the callback ref preserves that resource's lifetime without an
extra state render. See the [React rule explanation](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect).

Remembered-login initialization, asynchronous forced password opening, Admin
open/record/tab resets, callback query semantics and local image cleanup are
preserved. Focus timers now clean up if their dialog closes before the timer.
No layouts, CSS, labels, role permissions, endpoints or backend status rules were
changed to satisfy lint.

## Browser failures: obsolete assertion, not an application defect

All three original failures were the same assertion in
`tests/studentDetailIdentity.test.mjs` at 360, 768 and 1366 pixels; their parent
reported the fourth failure. It expected `Sample Student (student@example.test)`
as one contiguous string. The approved ticket renders separate name and email
elements, with the email below the name.

The test now asserts both exact field values and their vertical order. Existing
checks for ticket content, staff-only attachment privacy, overflow, history colors,
reply authorization, fresh reads, single writes, navigation and identity remain.
No test was deleted, skipped or relaxed to accept missing content. Subsequent
assertions all passed; no API, timing or browser limitation caused these failures.

New browser regressions exercise Add/Edit organization draft/reset behavior,
configuration record/mode reset, failed deletion and reopen, forced password
opening, remembered-login initialization, backend and legacy Drive callbacks,
consumed-code protection, missing authorization, toast deduplication and account
switch isolation. A new unit test writes and rereads the actual analytics workbook
and checks all five sheets, consolidated counts, identity and mapped status.
Fixtures use fictional data and mocked services; unmocked API calls fail locally.

## Dependency investigation and remediation

| Original dependency path/version | Exposure and advisory | Result |
| --- | --- | --- |
| Production `serve@14.2.6 -> compression@1.8.1` | Public static server; premature response closure could leak compression resources, so the server-facing path matters. [GHSA-vc2v-76pw-4v95](https://github.com/advisories/GHSA-vc2v-76pw-4v95), compression `<1.8.2`. This produced two high package findings. | Upgrade serve to 14.2.8, which requires compression 1.8.2. Both findings resolved; static serving, SPA refresh and PORT checks pass. |
| Development `eslint@10.5.0 -> minimatch@10.2.5`, also `@eslint/config-array@0.23.5 -> minimatch` | Glob amplification on attacker-controlled patterns; normally local/CI lint configuration, not the shipped browser app. [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), minimatch `>=7 <11.0.1`. Three moderate package findings. | Upgrade ESLint within major 10 to 10.15.0, resolving config-array 0.23.6 and minimatch 11.0.9. All three findings resolved; full lint passes. |
| Production `xlsx@0.18.5` | [Prototype pollution](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), `<0.19.3`, and [ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9), `<0.20.2`. One high package finding with two advisories. | Retained and blocking; see below. |

No forced audit fix or manual transitive override was used. Direct upgrades stay
within their current major versions. ESLint's upstream minor update changes some
internal cache/glob dependency majors; those are tooling internals, and clean
installation/lint/tests passed. Serve's patch changes its clipboard helper; the
production start command and HTTP behavior were tested. React and Vite versions
were not upgraded by this task. The lockfile records the associated dependency
changes, not a wholesale dependency refresh.

Current frontend SheetJS use is export-only: `src/utils/xlsxExport.js` and Staff
`RecentSubmissionsTable.jsx` build/write workbooks. No production `XLSX.read` or
`readFile` call was found. Upload pickers accepting `.xlsx` do not parse those
files using this frontend library. The prototype-pollution advisory explicitly
excludes export-only workflows; no malicious-file parser entry point was found
for these advisories in current frontend usage. This reachability assessment does
not remove the vulnerable shipped dependency or justify bypassing the gate.

The [official SheetJS distribution instructions](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/)
identify 0.20.3 on their CDN; the npm registry remains at 0.18.5. The official
tarball request returned HTTP 403 in this environment. No unverified mirror,
package rename or broad exception was substituted. Remediation: obtain the
official patched tarball through an accessible trusted source, record its integrity
in the lockfile, repeat clean install, audit, export round-trip, browser download
and production build checks. Do not simply remove exports or suppress the advisory.

## Production and GitHub Actions review

- `.env.production` still contains only the public HTTPS backend URL ending in
  `/api`. Tests and an actual compiled override build confirm external build-time
  `VITE_API_URL` precedence and trailing-slash normalization.
- All build modes still reject relative, HTTP, credential-bearing, loopback,
  IP-literal/private-network and malformed API bases. Eight actual CLI builds fail
  before compilation for unsafe/missing-base settings. DNS resolution to private
  hosts is outside this syntactic validation; retain team control of configuration.
- Existing WebSocket construction uses the same API host and
  `wss://vista-backend-production-10d7.up.railway.app/ws/notifications/`. Development
  `/api` and `/ws` proxies and `strictPort` remain unchanged and are tested.
- The production bundle endpoint scan now also covers RFC1918 172.16/12,
  link-local IPv4, unique-local/link-local IPv6. Source and built JS scans found no
  configured private-key, GitHub-token, AWS-key or Google-key patterns, and no
  fictional test password was bundled. This is a pattern scan, not proof that every
  possible secret format is absent. Only the API URL is read from frontend env.
- No Railway-specific manifest, Dockerfile, Procfile or Nixpacks configuration was
  found. Existing `npm start` remains `serve -s dist -l $PORT`. The standard smoke
  checks the Windows serve equivalent; an additional test executed the actual npm
  script using Git Bash on Windows with an assigned PORT and verified `/get-app`
  refresh. Ubuntu CI must still verify the native Linux execution path.
- Built entry assets and eight SPA hard-refresh paths pass. This proves static
  fallback; it does not prove authenticated destination screens or OAuth with
  Google. Read-only live checks returned frontend `/get-app` 200, backend unauthenticated
  `/api/auth/me/` 401 as expected, and login preflight 200 with the deployed frontend
  CORS origin. These checks concern the existing deployment, not these local edits.
- The six existing stable job names, PR-to-main/push-main/manual triggers,
  contents-read permission, pinned actions, credential-free checkout, lockfile npm
  caching, timeouts, failure exit propagation and diagnostic artifacts were reviewed.
  Security and syntax jobs need no installed application dependencies. Audit errors
  fail closed; high findings still fail. No deployment/release actions or secrets.
- Ubuntu 24.04's [published runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
  includes Chrome. The workflow explicitly requires it; missing Chrome fails rather
  than skipping regressions. Hosted image availability, executable paths, action
  downloads, artifact upload and Linux execution still require a real hosted run.

## Final local results

Node 24.22.3, fresh source snapshot without local env files, clean `npm ci`:

| Check | Result |
| --- | --- |
| Clean installation | Passed; 301 packages |
| ESLint | Passed; 0 errors, 0 warnings |
| Static validation | Passed; 110 JavaScript modules, JSX checked by lint/build |
| Full unit suite | 113 passed; 0 failed/skipped |
| Full browser suite | 89 passed; 0 failed/skipped |
| Production API/WebSocket regressions | Passed in full unit suite |
| Production Vite build | Passed; existing large Dashboard chunk warning remains |
| Production static/browser smoke | Passed; API/WS, assigned port, 8 refresh routes, assets, rendered Get App |
| Actual npm start under a local POSIX shell | Passed; assigned PORT and Get App refresh |
| Actual negative/override builds | 8 unsafe settings rejected; valid override compiled correctly |
| Source/bundle configured secret-pattern scans | No findings |
| Dependency security | **Failed**; 1 high, 0 moderate, 0 critical (`xlsx`) |
| Workflow syntax | Passed; checksum-verified actionlint 1.7.12 |

Evidence is under ignored `output/ci-hardening-2026-11-22/`, including the isolated
snapshot's `artifacts/`. Working `node_modules` and the developer's running Vite
server were not replaced or stopped. Use `npm ci` when ready to refresh the working
installation; the validation above used the new lockfile's isolated installation.

## Workflow coverage and outstanding risks

Mocked tests cover authentication/session helpers, role/attachment isolation,
Student monitoring and reply reloads, Staff registration/OCR previews and callbacks,
status payloads, notifications/realtime handling, archive state, audit presentation,
Admin dialogs, exports, Get App/manual/download controls and responsive layout.
Build/SPA smoke also checks public and legal paths. The new tests protect the
modified hook paths; existing tests were retained.

This is not end-to-end production certification. Real login/session persistence,
database writes/retrieval, OCR execution, all permitted status transitions, Drive
authorization/upload, Admin persistence, actual email/Android push receipt and
authenticated WebSocket delivery remain separate designated-QA checks. No backend
or production-data changes were made. At the time of this initial phase, actual
Railway settings/Node selection and deployed bundle values had not been verified
through a linked local service. The subsequent production-alignment review
verified Railway Node 24.22.2; current declarations match that runtime. A new
deployment remains unverified.
Branch protection and Railway's wait-for-CI policy need repository/service owners
to confirm; YAML alone cannot enforce either policy.

An additional pre-existing security risk was found: Remember Me stores reversible
Base64-encoded passwords in localStorage. This is not encryption. Initialization
was made lint-compliant without silently removing the approved feature. A separate
authentication change should replace password persistence with an approved secure
session/password-manager design; review existing stored credentials as part of
that change. No real credential values were read or logged by this review.

The original next step was to resolve SheetJS and repeat exports and all six
checks. That local remediation and validation have since passed; see the current
readiness report. Review grouped-commit completeness and obtain explicit Git
authorization before publishing for GitHub-hosted verification. No Linux/GitHub
or new Railway deployment result is claimed here.

## Exact files changed in this hardening pass

Created:

- `docs/CI_HARDENING_REVIEW.md`
- `docs/CI_LINT_REMEDIATION.csv`
- `tests/ciHardening.test.mjs`
- `tests/fixtures/ci-hardening.html`
- `tests/fixtures/ci-hardening.jsx`
- `tests/xlsxExport.test.mjs`

Updated:

- `README.md`
- `docs/CI_PRODUCTION_READINESS.md`
- `package.json`
- `package-lock.json`
- `scripts/verify-production.mjs`
- `tests/studentDetailIdentity.test.mjs`
- `tests/fixtures/registration-preview.jsx`
- `src/components/ChangePasswordSection.jsx`
- `src/components/Sidebar.jsx`
- `src/components/StaffNotificationToasts.jsx`
- `src/modules/LoginPage.jsx`
- `src/modules/admin/auditlogs/components/LogDetailsTimeline.jsx`
- `src/modules/admin/dashboard/modals/AddOrgModal.jsx`
- `src/modules/admin/dashboard/modals/EditOrgModal.jsx`
- `src/modules/admin/registrationconfig/modals/ConfigEntryModal.jsx`
- `src/modules/admin/registrationconfig/modals/DeleteConfirmModal.jsx`
- `src/modules/staff/auditlogs/components/AuditLogDetails.jsx`
- `src/modules/staff/dashboard/components/AnalyticsVisualGraphs.jsx`
- `src/modules/staff/dashboard/components/RecentSubmissionsTable.jsx`
- `src/modules/staff/gdrive/GdriveCallback.jsx`
- `src/modules/staff/gdrive/components/GdriveHeader.jsx`
- `src/modules/staff/review-panel/components/SystemSubmissionsPanel.jsx`
- `src/modules/staff/review-panel/components/modals/ConfirmDriveSyncModal.jsx`
- `src/modules/student/reviewtracker/components/DetailsHeader.jsx`
- `src/services/submissionService.js`

All other baseline files/assets are preserved. No CSS or other repositories were
modified. Staging remains untouched on `feat/web-ui-polish-2026-11-20`.
