# VISTA Web visual contract

Primary reference: the supplied Mobile screenshots and the current read-only
`VISTA-MOBILE/src/theme/tokens.js`. The Pinterest reference supplies composition;
the Web screenshots supply the information architecture to preserve.

## Foundation

One DM Sans family, bundled locally. Blue `#1A59A5`, navy `#142B52`, yellow
`#FFC342`, canvas `#F3F3F3`, white surfaces, fields `#F7F9FC`, border `#E1E8F0`,
text `#1E3A68`, muted text `#64748B`. Semantic success, warning and danger retain
Mobile's palette. Public aliases must resolve to these same tokens.

Use the existing 4/8/12/16/20/24/32 spacing scale. Cards use radius 20, fields 16,
dialogs 28, regular actions 24 and compact table actions 10. Desktop actions are
42px tall; small-screen actions 44px. Tables keep their compact density.
Page/section/body/label/meta type is 24/16/14/13/12px. Public display titles may
scale up; legal paragraphs use a readable measure and 16px body type.

## Component rules

- Primary actions: blue/white; secondary: white with an outline; destructive: red.
  Table viewing/editing actions, Filter and Export use blue with white text/icons.
  Search fields retain a visible control border at rest, plus their focus ring.
  Navigation, selected tabs, status colors and chart legends retain their meanings.
  Both action links and buttons receive the same geometry and interaction states.
- Fields: pale neutral fill, visible labels, shared rounded geometry, visible focus.
- Panels: white with light borders and restrained shadows. Data table title bars
  use navbar blue with white headings, including Priority and System Submissions.
  Their data rows keep the existing neutral surfaces and semantic status colors.
- Summary cards: white labels and values across roles. Student has Total
  Submissions, Pending, Approved and Returned, with a 2-by-2 layout on small screens.
- Icons: existing Lucide family, quiet outline treatment, consistent text gaps.
  Preserve illustrations, provider marks and the distinctive purple submission pass.
  Registration's final review reuses that pass as a clearly labeled draft preview,
  with all summary fields and attachment preview; creation still requires Approve.
  Profile panels and avatars have white borders against their blue surroundings.
- Dialogs/popovers: existing portals, keyboard handling, focus restoration and
  scroll locking. Respect pending-action guards and reduced motion.
- Feedback: existing real pending/success/error state and safe retry handlers.
  Presentation changes must never fabricate success or replace API outcomes.

## Composition and preservation

Mixed-width summary tiles and wide data panels form the authenticated bento.
The existing sidebar, header, routes, tables, registration steps, two-column staff
review, chronological conversations and profile workflows keep their placement.
Get the App uses a leading feature tile, supporting tiles and grouped installation
steps. Public headers and legal contents navigation stay public, without a sidebar.
Legal copy, anchors, active section tracking, release URLs and build metadata stay
unchanged. Current Mobile and Backend are read-only.

## Acceptance checks

Render all 22 normal role/public routes at 360, 390, 768, 1024, 1366 and 1920px;
inspect screenshots, overflow, local font loading and action palette. Check review
details separately, with long filenames and current/archived/missing attachments.
Exercise dialog focus/Escape/return focus, nested selects/calendars, error/loading
states, keyboard controls and 200% zoom using fictional local data only.

Hide the empty attachment panel only after successful details loading when there
are no current documents and a persisted archive identity exists. Keep the Drive
hierarchy, existing attachment/version information and all role restrictions.
Pending/failed uploads, approval alone and arbitrary URLs are not confirmation.

Preserve the starting uncommitted work. Report current checks separately from
earlier documentation. No commits, pushes, deployments or live data writes.
