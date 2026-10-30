# VISTA web instructions

Scope: this React web repository and all its subdirectories.
Before work read `../AGENTS.md` when present for the full permanent VISTA policy
and regression matrix. Codex discovery starts at the project Git root, so this
entry point is needed for repository-local sessions. It supplements the parent
without overriding or weakening it; the safeguards below also stand alone.

## Required safeguards

- Read applicable instructions/specifications, inspect actual implementation and
  dependencies/tests, and audit staged/unstaged/untracked Git state. Use the local
  working tree as baseline, preserve unrelated work, and change only what the
  request requires. No unsolicited refactors, cleanup, redesigns, reorganization,
  validation/permission changes or removal of approved features. Verify consumers
  before contract changes; obtain approval for substantial out-of-scope dependencies.
- Every new submission must persist **On Process** through the existing backend
  canonical status/mapping; do not fake it in frontend state. Creation and its
  initial status are one event, not two sets of notifications.
- Creation and every genuine supported status transition require **system/in-app
  notifications on web/Android, native Android push for eligible registered devices,
  and email/Gmail** to existing eligible recipients. Preserve templates, read state,
  history and submission navigation. No channel replaces another and no private
  submission data is broadcast to every user. Denied/missing devices must not fail
  creation. Do not depend on a frontend route/open app/laptop for deployed delivery.
- Verify mutations through fresh API reads and page reloads, not success toasts
  alone. Persist remarks even with unchanged status; preserve prior history and
  avoid duplicates from identical retries/concurrent requests. Remarks-only updates
  keep approved notification rules; do not add duplicate status alerts for unchanged
  states. Dispatch after persistence, never rollback; protect independent channel
  handling and existing appropriate retries. Queueing is not proof of delivery.
- Preserve student/staff interfaces, authentication/role isolation, validation,
  navigation/responsiveness, loading/errors, staff-only attachments, uploads/previews/
  replacement/deletion, returned/rejected handling, archiving, audit trails,
  background jobs and backend/mobile API compatibility.
- Run risk-based targeted tests and affected regressions, meaningful bug regression
  tests, authorization/persistence/retry/stale-state checks and appropriate builds/
  syntax/lint checks. Protect creation/all valid transitions/same-status notes and
  rollback against regressions. Use isolated data and mocked/captured deliveries;
  do not mutate shared Railway data or contact recipients unintentionally in tests.
  Build success alone cannot prove persistence or delivery.
- Preserve Akane/team environment conventions and production/development separation.
  Do not hardcode private paths, usernames, phone IPs or credentials in shared files.
  Keep keys/tokens/secrets out of Git and logs. Preserve Firebase/Expo identities,
  distributed Android API compatibility and existing integration architecture.
- Without explicit authorization: no commits, pushes, PR creation/merge, deployments,
  production migrations/data deletion, Railway settings/service changes, key rotation,
  destructive infrastructure actions, resets or discarded local work.
- Before completion review specifications, changed files and final diff, verify the
  requested outcome and affected workflows, and report goal, changes/files/reasons,
  preserved/unverified behavior, tests/results, limitations and local/Git/deployment
  status. Distinguish mocked tests, provider acceptance, inbox/device receipt and
  deployed behavior. Do not overstate coverage.

## Web focus

Trace form -> API -> PostgreSQL -> fresh API response -> rendered state when fixing
save/reload problems. Check the actual local API/proxy environment before diagnosis;
never silently switch between local and deployed backends. Respect staff-only file
visibility and existing preview/storage behavior. UI edits must not change business
logic or add mobile-specific behavior to web unless requested. These are required
standards, not evidence that the current runtime already meets them.
