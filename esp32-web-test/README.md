# ESP32 Web Test

This folder is a minimal end-to-end test for an ESP32 serving its own UI and API.

It is intentionally separate from the production firmware and the main iPad app.

## Layout

- `esp32-firmware/`: tiny PlatformIO firmware that serves the web UI and JSON endpoint
- `react-app/`: the React app source that gets bundled into the ESP32 firmware

## What this test proves

- The ESP32 can host its own web UI
- The UI and API can live on the same local origin
- The iPad can open the app in Safari without any wrapper

## Important GitHub Pages note

This specific test is local-only and does not depend on GitHub Pages.

## ESP32 firmware

```bash
cd esp32-web-test/esp32-firmware
pio run -t upload
pio device monitor
```

The firmware creates a Wi-Fi access point:

- SSID: `StudioIII-Test`
- Password: `studio1234`
- Safari page: `http://192.168.4.1/`
- UI page: `http://192.168.4.1/ui`
- Debug UI: `http://192.168.4.1/debug`
- Text check: `http://192.168.4.1/text`
- Status URL: `http://192.168.4.1/api/status`
- JSON debug: `http://192.168.4.1/api/debug`

Serial output should show:

- the AP IP address
- the HTTP server URL
- a repeating loop log every 5 seconds

## React app

```bash
cd esp32-web-test/react-app
npm install
npm run dev
```

To bundle the React app into the ESP32 firmware:

```bash
cd esp32-web-test/react-app
npm run build
cd ../esp32-firmware
node scripts/generate_web_bundle.mjs
```

## Minimal test flow

1. Flash the ESP32 firmware.
2. Connect the iPad to the `StudioIII-Test` Wi-Fi network.
3. Open Safari and go to `http://192.168.4.1/text`.
4. If that loads, open `http://192.168.4.1/ui`.
5. If the page does not load, open the serial monitor and check whether the ESP reports `HTTP server: http://192.168.4.1/` and repeating loop logs.
