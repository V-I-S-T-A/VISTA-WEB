# React + Vite

## Android app download

The public header links to the latest VISTA Mobile GitHub Release asset at
`https://github.com/V-I-S-T-A/VISTA-MOBILE/releases/latest/download/vista-mobile.apk`.
To publish a new app download, make sure the
`V-I-S-T-A/VISTA-MOBILE` repository is publicly readable, then create a release
and attach the standalone APK with the exact filename `vista-mobile.apk`. Mark
the intended stable release as the latest release. The website QR code encodes
this same HTTPS URL. If the source repository must remain private, host the APK
as a release asset in a public downloads repository and update the URL in
`src/components/Header.jsx`.

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
