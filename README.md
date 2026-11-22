# React + Vite

## Local web QA with the Railway backend

Create `.env.development.local` in this folder:

```dotenv
VITE_API_URL=/api
DEV_API_PROXY_TARGET=https://vista-backend-production-10d7.up.railway.app
```

Then run:

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://127.0.0.1:5173` and sign in with a VISTA test account.
Vite forwards `/api` requests to the Railway backend, avoiding the need to
change production CORS settings. No local backend, Postgres, Redis, or Railway
CLI is needed for this workflow. Changes made through the app affect the shared
production data; use designated QA records.

The environment file is ignored by Git and applies only to development mode.
Restart Vite after editing it. The committed `.env.production` supplies the public
Railway backend URL for production builds; Railway's `VITE_API_URL` can override it.
The production build rejects local, private, relative or non-HTTPS API addresses.
Use a public backend URL ending in `/api`; Vite embeds it at build time, so changing
it requires a new frontend build. Development keeps its existing `/api` proxy.
Run `npm run build` and use `npm start` on Railway: the existing start command
serves `dist` on Railway's `$PORT` and supports React Router deep links. Do not use
the local Vite port as the deployment port. Never put secrets in `VITE_*` variables.
Email links and Google Drive OAuth returns still use the deployed
backend's configured frontend URL and may open the deployed website.

## CI and production readiness

GitHub Actions validates pull requests to `main`, pushes to `main`, and manual
runs without deploying. Use Node **24.22.2** (`.node-version`) and `npm ci`, matching
the verified Railway runtime. The exact pin requires intentional future security
updates: update both Node declarations and lockfile engine metadata together,
validate the new version, and review Railway alignment before release. See
[CI and Railway readiness](docs/CI_PRODUCTION_READINESS.md) for the six checks,
production URL safeguards, local validation results and remaining hosted-CI and
deployment verification. The recorded Node 24.22.2 validation passed 113 unit
tests, 90 browser checks and the unchanged dependency security gate with zero
findings. SheetJS is pinned to the official 0.20.3 archive in `vendor/`; include
that archive with the manifest and lockfile in the eventual commit. The
[hardening review](docs/CI_HARDENING_REVIEW.md) records the earlier remediation
phase and its subsequently resolved findings.

## Automatic update date

The Privacy Policy and Terms pages get their displayed “Last updated” date at
build time. Local builds use the latest Git commit timestamp; deployments that
do not include `.git` use the build timestamp. Railway's next build after a push
therefore updates the label without editing page content. Dates display in
Asia/Manila time and remain fixed until another build, rather than changing on
every page visit. This is the website update date, not a policy revision history.

An optional `VITE_APP_UPDATED_AT` ISO timestamp can pin a release date. Run
`node --test build/updateTimestamp.test.mjs` to check the timestamp handling.

## Android app download

The public header’s “Get the app” link opens `/get-app`, with Staff and Student
guides, screenshot previews, a promo video, installation steps and a QR download
dialog. Page assets are bundled from `src/assets/public/`, including the guide
WebP images, promo video/poster and versioned QR. Preserve those files in the
eventual commit; they are required application assets.

`src/config/appDownload.js` is the download metadata source. Its current version
label is **1.0.8 (29)** and its configured build page is
[Expo build c4ec8f7c](https://expo.dev/accounts/purplehouse/projects/vista-app/builds/c4ec8f7c-c120-448e-991c-2b3790db9e0e).
The download buttons use the direct APK artifact:

`https://expo.dev/artifacts/eas/O5VzuxKVI3epJ8o6yJx1k-muFJJ5EhwjfAARLiMjDNM.apk`

This describes the configured version; it does not assert that it is the latest
Mobile source push or build. For an approved download update, verify the build
version and public artifact availability, then update the metadata and matching
QR asset together and rerun the download/QR regressions. Keep the APK hosted
externally rather than adding it to the Vite bundle. Current artifact availability
and physical Android installation require separate verification.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
