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
Restart Vite after editing it. Railway's frontend service should continue to
set `VITE_API_URL` to the full public backend URL ending in `/api` for production
builds. Email links and Google Drive OAuth returns still use the deployed
backend's configured frontend URL and may open the deployed website.

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

The public header’s “Get the app” link opens `/get-app`, a mobile onboarding
page with six anonymized feature previews, installation steps, and an explicit
Android download. The page reuses the shared header and footer; its styles are
scoped to the onboarding page. Preview screens are recreated in HTML/CSS using
fictional sample identities, so the original Figma screenshots and personal
photos are not published.

The download buttons link to the latest VISTA Mobile GitHub Release asset at
`https://github.com/V-I-S-T-A/VISTA-MOBILE/releases/latest/download/vista-mobile.apk`.
To publish a new app download, make sure the
`V-I-S-T-A/VISTA-MOBILE` repository is publicly readable, then create a release
and attach the standalone APK with the exact filename `vista-mobile.apk`. Mark
the intended stable release as the latest release. The website QR code encodes
this same HTTPS URL. If the source repository must remain private, host the APK
as a release asset in a public downloads repository and update the URL in
`src/config/appDownload.js`.

Keep the APK as a release asset instead of committing it to this Vite site:
the current artifact is about 107.5 MB, above GitHub's 100 MB per-file limit
for ordinary Git files. The GitHub Releases URL stays stable as the APK is
updated, while the binary is downloaded directly without extracting an archive.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
