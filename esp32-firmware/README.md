# ESP32 Firmware

This is the canonical ESP32 firmware to flash.

It serves the packaging UI over the ESP32 Wi-Fi access point and includes the current receipt layout, map view, and printer output.

The active source lives in:

- [`src/main.cpp`](/Users/milanelsen/Documents/KISD%20Studium/PolyU/Studio%20III/studio-III-installation/esp32-firmware/src/main.cpp)

## Build and Flash

```bash
cd esp32-firmware
pio run -t upload
pio device monitor -b 115200
```

## Runtime behavior

- Starts a local Wi-Fi access point
- Serves the UI from the ESP32
- Exposes status, tare, calibration, and print endpoints
- Controls the printer directly from the ESP32

## Notes

- `esp32-web-test/` and `esp32-printer-test/` are now legacy development snapshots.
- Flash `esp32-firmware/` if you want the current combined firmware.
