# studio-III-installation

## Structure

- `esp32-firmware/`: PlatformIO firmware project for ESP32
- `studio-III-installation-ipadclient/`: SwiftUI iPad client

## Quick Start

ESP32 firmware:

```bash
cd esp32-firmware
pio run -e esp32_app -t upload
pio device monitor -b 115200
```

iPad app:

1. Open `studio-III-installation-ipadclient/studio-III-installation-ipadclient.xcodeproj`
2. Build for iPad target
3. Connect to accessory with protocol string `com.studio3.scaleaudio`
