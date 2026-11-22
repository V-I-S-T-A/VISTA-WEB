# Web CI and Railway readiness

The SheetJS remediation below is the current dependency-security result.
The earlier exact-runtime validation records the preceding production alignment.
For earlier remediation details, see [the hardening review](CI_HARDENING_REVIEW.md).
The baseline counts later in this document describe the original CI implementation
before that remediation.

`.github/workflows/ci.yml` validates pull requests targeting `main`, pushes to
`main`, and manual runs. It does not deploy, publish releases, or change Railway.
All jobs use read-only repository permissions, pinned action revisions, timeouts,
and Node 24.22.2 from `.node-version`, matching the verified Railway runtime.
`package.json` and the lockfile root engine metadata pin the same exact version.
All six existing setup-node steps already read that file; no workflow change is
needed. Dependency caches use `package-lock.json`.

An exact Node pin does not automatically adopt future security releases. Updating
Node is an intentional maintenance task: review the release, update both Node
declarations and lockfile engine metadata together, run the full checks on that
exact version, and review Railway runtime selection before an authorized release.
Keep Railway's assigned `$PORT`; never substitute a fixed port.

The optional ESLint 10.15.0 upgrade remains unchanged in this alignment pass.
Its prior transitive dependency and compatibility review is documented in the
hardening review. It is not required to enforce the current high/critical audit
threshold; any decision to retain or revert that tooling tree remains separate.

## Focused pre-commit findings review — 2026-11-22

Only documentation changed in this follow-up. Application behavior, UI,
dependencies, CI workflow and deployment safeguards remain unchanged.

### Dashboard widgets

`src/documentation/UI_MODERNIZATION.md`, section 7, explicitly records
Institutional Pulse and the Audit Log widget as removed at the owner's request.
Its later follow-up also records that the separate Audit Logs pages, routes,
permissions and history remain available. `src/modules/staff/Dashboard.jsx`
already had this removal in the captured pre-CI baseline. This establishes a
documented intentional modernization change, rather than a CI-hardening change.
Recommendation: preserve the current dashboard. No restoration/removal was made;
any new functional change requires explicit owner approval.

### Returned totals: corrected assessment

The earlier frontend-only audit raised a possible mismatch because Student sends
`status=rejected`, while Staff sums `rejected` and `resubmission_required` from
statistics. Tracing the existing Backend resolves that concern:

- `VISTA-BACKEND/vista/submissions/filters.py`,
  `SubmissionFilter.filter_status`, maps `returned`, `rejected`, `flagged` and
  `resubmission_required` to the same two-status `status__in` filter. The same
  implementation is present in the Backend's committed HEAD, with no working-tree
  changes to that filter.
- `SubmissionViewSet` installs that filter on the list endpoint. Its statistics
  method reports the raw statuses separately, which the Staff summary combines.
- Both methods start from the existing authorized queryset. Students retain
  owner/eligible-organization visibility; Staff/Admin retain their broader scope.
  Numeric totals across roles need not match because their visible records differ.
- The Web design-unification review explicitly records the Student four-card
  request using the established `rejected` query for Returned.

Thus both UI implementations use the same Returned status group under the
inspected backend contract. The prior warning is withdrawn. No status identifier,
frontend query, count calculation, permission or backend source was changed.
An isolated check executed the actual extracted filter method for five aliases
(including a case/whitespace variant) against a recording fake queryset; all
selected both statuses. It imported no Django/database code and performed no
data writes. This is source-level verification, not a live deployed-count check.

### ESLint recommendation

Retain the already-tested ESLint 10.15.0 tree. It is development tooling, passed
the existing lint and full regression checks, and removed moderate minimatch
findings. Reverting would restore the older cache/glob tree and require renewed
lockfile, audit and lint validation. It is optional for the high/critical gate;
the recommendation is to preserve the known tested state, not to upgrade further.
No dependency was changed in this review. The owner still decides whether to
approve this optional tooling update in the eventual commit.

### GitHub checkout completeness

The unchanged six-job workflow checks PRs targeting `main`, pushes to `main` and
manual dispatch. A feature-branch push alone does not trigger these jobs. Checkout
includes committed files; untracked working-tree files are not available to CI.
The SheetJS archive, workflow, production defaults, Node pin, new shared code,
test fixtures and build assets must be included in the eventual approved commit.
Keep fonts and their license, all imported manual WebP files, promo video/poster
and QR asset. Keep local env files, `output/`, `artifacts/`, `dist/` and
`node_modules/` out of Git.

A case-sensitive static check resolved all 829 relative module imports across
271 current JavaScript/JSX/MJS modules. The five CSS font references also match
the repository's exact paths. The local SheetJS tarball's computed SHA-512
matches the lockfile. None of those required inputs is excluded by `.gitignore`.
These checks support Linux checkout completeness once the inputs are committed;
they do not replace a clean Linux installation or a hosted workflow run.

Proceed to GitHub CI verification after owner approval and a complete grouped
commit/PR. No first-two-area functional change is recommended. Remaining owner
decisions are approval to retain ESLint 10.15.0 and subsequent explicit Git
publication authorization. Cold-cache Linux install, all six hosted results,
branch protection/wait-for-CI settings and a later Railway deployment remain
verification steps. No hosted run, merge or deployment is claimed here.

## SheetJS security remediation — 2026-11-22

The sole remaining high-severity package finding involved `xlsx@0.18.5`:

- [CVE-2023-30533 / GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6):
  prototype pollution while reading crafted files; fixed in SheetJS 0.19.3.
  The advisory explicitly excludes export-only workflows from that attack.
- [CVE-2024-22363 / GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9):
  regular-expression denial of service; fixed in SheetJS 0.20.2.

Both advisories apply to the old dependency even though VISTA only uses its
spreadsheet writer. Production imports are confined to `src/utils/xlsxExport.js`
(Staff Analytics) and `RecentSubmissionsTable.jsx` (Recent Submissions). Their
consumers are `AnalyticsVisualGraphs.jsx` and the table's Excel export handler.
There are no application calls to `XLSX.read` or `readFile`. Attachment inputs
accepting `.xlsx` do not parse them with SheetJS. The other references are test
imports and the existing Vite/test-server prebundle lists.

The [publisher's installation documentation](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/)
identifies the authoritative HTTPS CDN and version 0.20.3. Its legacy npm registry
entry stops at 0.18.5. We downloaded the official 0.20.3 archive successfully,
inspected its identity, license, entry points, dependency metadata and changelog,
and retained it unmodified as `vendor/xlsx-0.20.3.tgz`, following the publisher's
vendoring instructions. `vendor/README.md` records provenance and SHA-256;
the lockfile records SHA-512 integrity. The recorded digest is not a publisher
signature. Clean installs no longer need access to the SheetJS CDN.

Only SheetJS changed version: **0.18.5 → 0.20.3**. Its now-unneeded dependencies
were removed: adler-32 1.3.1, cfb 1.2.2, codepage 1.15.0, crc-32 1.2.2,
frac 1.1.2, ssf 0.11.2, wmf 1.0.2 and word 0.3.0. No other locked package,
integrity value, classification, Node pin or application dependency changed.
No alternative library, audit exception, override or weaker gate was introduced.

Both application export implementations remain byte-for-byte unchanged. A
pre-upgrade Chrome capture supplies the golden export contract. The new browser
regression compares all cells, sheet order, headers, widths, status/fallback
mappings, Unicode text, filenames and completed downloads for both exports,
including rows beyond the table's first page and analytics with no records.
The Node unit test now initializes the official ESM entry's filesystem support;
browser exports retain their existing download behavior.

The unchanged security gate reports zero findings with the patched lockfile.
An isolated audit-only negative control assigning the old vulnerable version to
the local-tarball lock entry still fails with one high finding. Vendoring has not
excluded SheetJS from advisory checking. This validates the two known fixes and
current advisory results; it is not a guarantee against future vulnerabilities.
Future archive updates require deliberate review and regression testing.

Validation used a fresh source snapshot, Node **24.22.2** and npm **11.19.1**;
the working installation and development server were left intact.

| Check | Result after SheetJS remediation |
| --- | --- |
| Clean `npm ci --no-audit --no-fund` | Passed; 293 packages |
| ESLint / static validation | Passed; 0 lint errors/warnings, 111 JS modules |
| Unit suite (including production URL and development proxy tests) | 113 passed; none failed/skipped |
| Browser regressions (including actual Excel downloads) | 90 passed; none failed/skipped |
| Production Vite build and production smoke | Passed; validated HTTPS API, WSS endpoint, assigned port, 8 SPA routes and rendered Get App |
| Dependency security | Passed; 0 findings at every severity; threshold unchanged |
| Workflow syntax | Passed; checksum-verified actionlint 1.7.12 |

The existing large-chunk build warning remains advisory. The Dashboard chunk
increased from 698.72 to 746.32 kB (gzip 211.80 to 225.06 kB) with the patched
writer. No unrelated bundling refactor was introduced. Automated workbook
comparisons passed; manual opening in desktop Excel was not performed. No
remaining known SheetJS compatibility/security blocker was found in this scope.
All six check groups are locally ready for GitHub-hosted verification.

The inspected Railpack 0.43.0
[Node provider](https://github.com/railwayapp/railpack/blob/v0.43.0/core/providers/node/package_manager.go)
detects `file:` dependencies and includes source files during installation.
There is no repository Docker/Railway ignore rule excluding `vendor/`. The
official archive must be included with the manifest and lockfile in the eventual
team commit; otherwise a clean install will fail. This source review and local
install do not prove a new Railway deployment.

Files changed by this remediation, relative to its actual working-tree baseline:

- `package.json`, `package-lock.json`
- `vendor/xlsx-0.20.3.tgz`, `vendor/README.md`
- `tests/xlsxExport.test.mjs`, `tests/xlsxDownloads.test.mjs`
- `tests/fixtures/xlsx-exports.html`, `tests/fixtures/xlsx-exports.jsx`,
  `tests/fixtures/xlsx-export-contract.json`
- `docs/CI_PRODUCTION_READINESS.md`

All other pre-existing working-tree files were compared against the captured
baseline hashes and preserved, including application exports, UI, production
API/WebSocket configuration, Node declarations, workflow YAML and security scripts.

Local evidence is ignored under `output/sheetjs-remediation-2026-11-22/`.
GitHub-hosted checks and a new Railway deployment remain separate verification
steps. No commits, pushes, merges, deployments or Railway changes were performed.

## Prior exact-runtime validation — before SheetJS remediation, 2026-11-22

Project and CI declarations now match the live Railway Node **24.22.2** version
verified in the preceding read-only review. Validation used the official Node
24.22.2 Windows distribution (archive SHA-256 verified), its npm 11.19.1, and a
fresh source snapshot without local environment files or an existing installation.
The working installation and running developer server were preserved.

| Check under Node 24.22.2 | Result |
| --- | --- |
| Clean `npm ci --no-audit --no-fund` | Passed; 301 packages |
| ESLint | Passed; 0 errors, 0 warnings |
| Static validation | Passed; 110 JavaScript modules |
| Full unit suite | 113 passed; 0 failed/skipped |
| Full browser regression suite | 89 passed; 0 failed/skipped |
| Production Vite build and built-page smoke | Passed; assets, assigned port and 8 SPA refresh paths |
| API/WebSocket/development proxy regressions | Passed in the unit suite |
| Actual unsafe/override CLI builds | All 8 unsafe settings rejected; valid external override compiled correctly |
| Actual `npm start` | Passed on an assigned temporary PORT using Git Bash on Windows |
| Workflow syntax | Passed with checksum-verified actionlint 1.7.12 |
| Dependency security | Correctly failed: 1 high SheetJS finding, 0 moderate/critical |

The existing approximately 699 kB Dashboard chunk warning remains. No application
dependency version, integrity value or dependency classification changed: only
the root lockfile Node engine metadata was updated. The tested serve 14.2.8 and
optional ESLint 10.15.0 trees are retained. Application source, UI/assets, tests,
API/WebSocket safeguards, workflow YAML and all check scripts are byte-for-byte
unchanged from this alignment task's baseline. Development configuration and its
`/api` and `/ws` proxy behavior remain unchanged.

The five source/documentation files changed in this alignment pass are
`.node-version`, `package.json`, `package-lock.json`, `README.md` and this document.
Local evidence is ignored under `output/production-alignment-2026-11-22/`.

At that earlier alignment stage, readiness was **BLOCKED** by the unsuppressed
SheetJS finding. The subsequent remediation above resolved it and repeated the
local checks successfully. No security threshold or check was weakened.
GitHub-hosted Linux execution and a new Railway deployment remain unverified;
the POSIX-shell test on Windows is not a Linux runtime test. No commits, pushes,
merges, deployments or Railway settings changes were performed.

## Checks

| Stable job name | Local command | Purpose |
| --- | --- | --- |
| Lint and static validation | `npm run check:static` then `npm run lint` | JavaScript syntax, public production environment-file shape, existing React/ESLint rules |
| Unit tests | `npm run test:unit` | All existing non-browser test files plus production environment regressions |
| Browser regressions | `npm run test:browser` | All existing browser test files; Chrome is mandatory, not silently skipped |
| Production build and smoke | `npm run build` then `npm run check:production` | Validated API/secure socket, built assets, SPA deep links, assigned server port and rendered Get App |
| Dependency security | `npm run check:security` | Lockfile advisory report; high/critical findings fail the job |
| Workflow syntax | `npm run check:workflows` | SHA-256-verified actionlint syntax, expressions and action input validation |

Start with `npm ci --no-audit --no-fund` in a clean checkout using Node 24.22.2.
`npm test` runs both test groups serially. Set `CHROME_PATH` if Chrome is not in a
standard location. Ubuntu CI requires its installed `google-chrome` explicitly.
Browser evidence and audit/production reports are uploaded for seven days,
including when checks fail. Local `output/` and `artifacts/` are ignored by Git.
The workflow checker downloads pinned actionlint 1.7.12 for Windows/Linux x64;
other platforms can run that version directly.

Tests use fictional fixtures and a blocked local API fallback, not production
credentials. Browser fixtures mock their API calls. The production browser smoke
blocks external HTTPS requests; it proves rendering, not live authentication or
delivery. Do not add integration tests that mutate shared Railway data or contact
real email/push recipients.

## Production configuration

The committed `.env.production` contains only the public backend default:

```dotenv
VITE_API_URL=https://vista-backend-production-10d7.up.railway.app/api
```

Railway's build-time `VITE_API_URL` takes precedence over this file. All Vite
build modes validate the resolved value before bundling: an absolute HTTPS public
hostname with an API path ending in `/api` is required. Localhost, IP literals
(including loopback/private IPv4/IPv6), internal hostnames, relative URLs, HTTP,
embedded credentials, queries, fragments and missing API base paths are rejected.
A trailing slash is normalized. URLs resolving to private IPs through DNS are not
detected by this syntactic check; keep Railway configuration under team control.

The existing realtime URL builder maps the API host to
`wss://vista-backend-production-10d7.up.railway.app/ws/notifications/` for the
default. Tests also cover secure WebSockets when the public API is overridden.
There is no separate WebSocket environment variable to drift out of sync.

`VITE_*` values are public client configuration, never secrets. Vite embeds them
at build time; changing Railway variables requires rebuilding. CI checks the
committed default without Railway secrets. It cannot inspect private Railway
settings or prove which override a later deployment receives.

Development serving retains `DEV_API_PROXY_TARGET`, the `/api` and `/ws` Vite
proxies, WebSocket proxy support and `strictPort`. CI does not change these
settings. Production uses the existing `npm start` command,
`serve -s dist -l $PORT`; Vite's development port is not a production port.
On Ubuntu CI, the smoke test executes that actual command with a temporary PORT.
Windows uses the equivalent direct serve invocation because cmd does not expand
`$PORT`. No tracked personal paths or credentials are needed.

The smoke test verifies built configuration, entry assets and hard-refresh SPA
fallbacks for public pages, review detail URLs and the Drive callback. A local
endpoint scan excludes generic library URL-parsing placeholders: the validated,
bundled API configuration is checked separately. This is not a complete network
security scanner or proof that every external service is available.

## Merge and deployment gates

These jobs intentionally fail on existing lint, regression and security issues.
Do not suppress rules, skip regressions, add broad vulnerability exceptions or use
`npm audit fix --force` to make CI appear green. Dependency remediation can affect
Admin exports and the production static server and needs scoped regression work.

Before opening a pull request:

1. Review the full local diff and include required new UI assets/components/tests
   alongside the existing refinements; a partial grouped commit must still build.
2. Resolve the recorded lint, student-detail regression and dependency findings
   in separately reviewed changes. Re-run all checks after remediation.
3. Include the workflow, scripts, Node pin, lockfile metadata, environment guards
   and public `.env.production`. Never stage local `.env`, `.local` files, reports
   or credentials.
4. Open the PR to `main` and inspect the first GitHub-hosted Linux run. A repository
   administrator should require these six checks through the existing branch
   protection/ruleset; adding YAML alone does not prevent merges.
5. Confirm Railway's build command, Node version, public API variable, start
   command and automatic deployment policy. If Railway independently deploys
   pushes before GitHub checks finish, configure the existing service policy to
   wait for required checks where supported; do not add a second deployment job.

After an authorized deployment, separately verify the deployed asset/config,
frontend-origin CORS, authenticated secure WebSockets, role isolation, login,
registration/OCR, reviews/remarks, notification receipt, Google Drive OAuth and
Admin workflows with designated QA records. Local builds and mocked regression
tests do not certify those production integrations.

## Local baseline on 2026-11-22

The initial source tree already had 26 ESLint errors and five warnings. Existing
browser student-detail assertions expect `Sample Student (student@example.test)`
on one line while the current approved UI separates those fields; three viewport
subtests and their parent fail. The dependency report had three high and three
moderate findings: `xlsx`, `compression`/`serve`, and the ESLint/minimatch chain.
The high-severity gate remains blocking. Advisory counts can change over time;
consult the uploaded JSON for each run. No dependency upgrade or UI change is
part of this CI implementation.

## Validation evidence for this change

Local validation used Node **24.22.3** and a fresh source snapshot containing the
current uncommitted UI work, without `node_modules`, Git metadata or local env
files. The existing working dependency installation and running dev server were
preserved. This snapshot verifies installation from the proposed source/lockfile;
the first actual GitHub checkout still needs a hosted run after publication.

| Check | Local result |
| --- | --- |
| Clean `npm ci --no-audit --no-fund` | Passed; 304 packages installed |
| JavaScript/static environment validation | Passed; 108 modules |
| ESLint | Blocked by baseline 26 errors and 5 warnings; no new CI-script errors |
| Unit tests | 112 passed, 0 failed, 0 skipped |
| Browser regressions | 75 passed, 4 failed, 0 skipped; failures are 3 student-detail viewport assertions and their parent |
| Clean production Vite build | Passed; existing approximately 699 kB Dashboard chunk warning |
| Production smoke | Passed; validated API/secure socket, assigned port, 8 SPA hard-refresh routes, built assets and Chrome rendering |
| Actual CLI builds with unsafe API values | All 8 rejected before compilation: HTTP, loopback, private IPv4, IPv6 loopback and missing API path |
| Actual build with external override | Passed; compiled API is the supplied normalized public test URL, overriding `.env.production` |
| Workflow syntax | Passed using checksum-verified actionlint 1.7.12 |
| Dependency gate | Correctly failed: 3 high, 3 moderate, 0 critical |
| Scoped whitespace diff check | Passed |

The isolated smoke screenshot is in
`output/ci-readiness-2026-11-22/clean-checkout/artifacts/production-get-app.png`.
Logs, unsafe-build results and the original lint baseline are under
`output/ci-readiness-2026-11-22/`; the advisory JSON is `artifacts/npm-audit.json`.
These are local ignored evidence, not source to stage.

The known lint findings are in `ChangePasswordSection`, `Sidebar`,
`StaffNotificationToasts`, `LoginPage`, Admin `LogDetailsTimeline`, `AddOrgModal`,
`EditOrgModal`, `ConfigEntryModal`, `DeleteConfirmModal`, Staff `AuditLogDetails`,
`AnalyticsVisualGraphs`, `RecentSubmissionsTable`, `GdriveCallback`, `GdriveHeader`,
`SystemSubmissionsPanel`, `ConfirmDriveSyncModal`, Student `DetailsHeader`,
`submissionService` and the registration-preview fixture. The report identifies
hook state/dependency rules, unused values, a constant expression, an unused
assignment and the fixture's React-refresh export rule. They were not suppressed.

No GitHub-hosted job has run, and no new Railway deployment has been verified.
Windows validated the equivalent serve invocation; Linux CI must confirm actual
shell expansion of `$PORT`. Authenticated API/WebSocket operations, database
persistence, OCR processing, Google Drive authorization, Admin exports and actual
email/push delivery were not exercised against production. Existing mocked
regressions and source preservation do not prove these live integrations.

## Exact file scope

Created for CI:

- `.github/workflows/ci.yml`
- `.node-version`
- `scripts/run-tests.mjs`
- `scripts/check-static.mjs`
- `scripts/check-security.mjs`
- `scripts/check-workflows.mjs`
- `scripts/verify-production.mjs`
- `docs/CI_PRODUCTION_READINESS.md`

Updated for CI/readiness:

- `.gitignore` — ignore local validation evidence.
- `README.md` — document production configuration and link this guide.
- `eslint.config.js` — lint Node build/check scripts, excluding generated evidence.
- `package.json` — checks/test entry points and Node 24 engine.
- `package-lock.json` — root Node engine metadata only; dependency versions unchanged.
- `vite.config.js` — enforce the existing deployment guard for every build mode.
- `build/productionApi.test.mjs` — expand rejection, override, proxy and secure socket regressions.
- `tests/devServerIsolation.test.mjs` — reserve a temporary port instead of colliding with the developer's port 5173; retain the occupied-port assertion.

Also preserved from the interrupted five-file implementation:

- `.env.production` — public deployed API default, inspected and retained.
- `build/productionApi.mjs` — existing validator, inspected and retained.
- `README.md`, `build/productionApi.test.mjs`, `vite.config.js` — preserved and extended as listed above.

All `src/` files and assets matched the pre-CI content hashes after validation.
No application UI/business source, Backend or Mobile files were changed by this
task. No staging, commit, push, merge, deployment or Railway settings changes were
performed.
