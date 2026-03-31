# iPad Serial/USB Draft

This app uses a transport abstraction:

- `DeviceTransport` protocol (`Services/Transport/DeviceTransport.swift`)
- `USBSerialAccessoryTransport` draft implementation (`Services/Transport/USBSerialAccessoryTransport.swift`)

`USBSerialAccessoryTransport` is built on `ExternalAccessory` and expects an accessory protocol string:

- `com.studio3.scaleaudio`

## Important Notes

- On iOS, direct generic USB serial is restricted.
- Practical wired serial requires an MFi-compatible accessory that exposes an iAP2 protocol string.
- Add the protocol string to app Info.plist key `UISupportedExternalAccessoryProtocols`.

## Line Protocol

Outbound commands are plain text lines:

- `PING`
- `READ_WEIGHT`
- `READ_RAW`
- `TARE`
- `GET_CAL`
- `SET_CAL <factor>`
- `CALIBRATE <known_grams>`
- `PLAY_TONE <frequency_hz> <duration_ms>`
- `STOP_TONE`

Inbound lines are single-line JSON objects:

- `{"type":"weight","grams":...}`
- `{"type":"raw","raw":...}`
- `{"type":"calibration","factor":...}`
- `{"type":"calibration_applied","factor":...,"known_grams":...,"raw":...}`
- `{"type":"status","value":"..."}`
- `{"type":"error","reason":"..."}`
- `{"type":"pong"}`
