# ESP32 Serial/USB Draft

Transport format is line-based text over USB CDC serial at `115200`.

## RX Commands (Host -> ESP32)

- `PING`
- `READ_WEIGHT`
- `READ_RAW`
- `TARE`
- `GET_CAL`
- `SET_CAL <factor>`
- `CALIBRATE <known_grams>`
- `PLAY_TONE <frequency_hz> <duration_ms>`
- `STOP_TONE`

## TX Events (ESP32 -> Host)

- `{"type":"pong"}`
- `{"type":"weight","grams":123.4}`
- `{"type":"raw","raw":123456}`
- `{"type":"calibration","factor":1234.567890}`
- `{"type":"calibration_applied","factor":1234.567890,"known_grams":100.0,"raw":123456}`
- `{"type":"status","value":"..."}`
- `{"type":"error","reason":"..."}`

## Parser

- Implemented in `lib/Common/Protocol.h/.cpp`
- Newline (`\n`) terminated
- Ignores carriage return (`\r`)
- Unknown commands map to `unknown_command` error

## Firmware Entry Points

- `src/app_main.cpp`: full app firmware
- `src/speaker_test_main.cpp`: speaker test-only firmware
- `src/loadcell_test_main.cpp`: HX711 load-cell test-only firmware
- `src/printer_test_main.cpp`: EM5820 label-printer test-only firmware
