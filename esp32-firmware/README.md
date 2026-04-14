# ESP32 Firmware

This is the canonical ESP32 firmware to flash.

It serves the packaging UI over the ESP32 Wi-Fi access point and includes the current receipt layout, map view, and printer output.

The active source lives in:

- [`src/main.cpp`](/Users/milanelsen/Documents/KISD%20Studium/PolyU/Studio%20III/studio-III-installation/esp32-firmware/src/main.cpp)
- [`web-app/src/App.tsx`](/Users/milanelsen/Documents/KISD%20Studium/PolyU/Studio%20III/studio-III-installation/esp32-firmware/web-app/src/App.tsx)

## Build and Flash

```bash
cd esp32-firmware
cd web-app
npm install
npm run build
cd ..
node scripts/generate_web_bundle.mjs
pio run -t upload
pio device monitor -b 115200
```

## Runtime behavior

- Starts a local Wi-Fi access point
- Serves the UI from the ESP32
- Exposes status, tare, calibration, and print endpoints
- Controls the printer directly from the ESP32
- Keeps the React app source in `web-app/` and bundles it into `src/generated/web_bundle.h`

## Notes

- Everything needed for the current build now lives in this folder.
