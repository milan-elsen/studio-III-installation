# ESP32 Firmware

This folder is a PlatformIO project with four isolated firmware targets:

- `esp32_app`: main firmware (load cell + speaker + serial protocol)
- `esp32_speaker_test`: standalone speaker test firmware
- `esp32_loadcell_test`: standalone HX711 test firmware
- `esp32_printer_test`: standalone EM5820 label-printer test firmware

## Build and Flash

```bash
cd esp32-firmware
pio run -e esp32_app -t upload
pio device monitor -b 115200
```

Speaker-only test:

```bash
cd esp32-firmware
pio run -e esp32_speaker_test -t upload
pio device monitor -b 115200
```

Load-cell-only test:

```bash
cd esp32-firmware
pio run -e esp32_loadcell_test -t upload
pio device monitor -b 115200
```

Printer test:

```bash
cd esp32-firmware
pio run -e esp32_printer_test -t upload
pio device monitor -b 115200
```

Printer image:

```text
PRINT_IMAGE
```

## Pin Mapping (Draft)

- HX711 `DT`: GPIO 4
- HX711 `SCK`: GPIO 5
- Speaker PWM out: GPIO 25

Printer TTL pins are defined directly in `src/printer_test_main.cpp` so you can change them without affecting the main firmware.
The image command uses `assets/waste-dithered.png`, which is converted to a 384-dot-wide 1-bit raster at build time.

## Serial/USB Protocol Draft

Host -> ESP32 (line-based UTF-8, newline terminated):

- `PING`
- `READ_WEIGHT`
- `READ_RAW`
- `TARE`
- `GET_CAL`
- `SET_CAL <factor>`
- `CALIBRATE <known_grams>`
- `PLAY_TONE <frequency_hz> <duration_ms>`
- `STOP_TONE`

ESP32 -> Host (single-line JSON):

- `{"type":"pong"}`
- `{"type":"weight","grams":123.4}`
- `{"type":"raw","raw":123456}`
- `{"type":"calibration","factor":1234.567890}`
- `{"type":"calibration_applied","factor":1234.567890,"known_grams":100.0,"raw":123456}`
- `{"type":"status","value":"..."}` 
- `{"type":"error","reason":"..."}`

Examples:

```text
PLAY_TONE 880 200
READ_WEIGHT
```
