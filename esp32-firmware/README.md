# ESP32 Firmware

This project builds the production ESP32 firmware that hosts the packaging UI over the ESP32 Wi-Fi access point.

The active source lives in:

- [`../esp32-web-test/esp32-firmware/src/main.cpp`](/Users/milanelsen/Documents/KISD%20Studium/PolyU/Studio%20III/studio-III-installation/esp32-web-test/esp32-firmware/src/main.cpp)

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
