# Web App

This folder contains the React source for the ESP32-hosted packaging app.

## Run locally

```bash
cd web-app
npm install
npm run dev
```

## Build for the ESP32 bundle

```bash
cd web-app
npm run build
cd ..
node scripts/generate_web_bundle.mjs
```

## Notes

- The app bundle is embedded into `src/generated/web_bundle.h`.
- The current map asset lives in `src/assets/map-background.svg`.
