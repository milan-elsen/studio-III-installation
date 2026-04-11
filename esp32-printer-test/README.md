# ESP32 Printer Test

This firmware is a printer-focused test harness for the Studio III ESP32 setup.

Use it when you want to iterate on the final receipt layout without the packaging flow, load cell logic, or web UI.

## What it provides

- A USB serial command interface
- Printer test commands for custom text, line feeds, and a receipt layout template
- A status command so you can inspect heap and printer configuration

## Hardware assumptions

- ESP32 dev board
- Printer connected over UART
- Default printer serial pins:
  - TX: GPIO 17
  - RX: GPIO 16
  - Baud: 9600

## Build and flash

```bash
cd studio-III-installation/esp32-printer-test
pio run -t upload
pio device monitor
```

## Serial commands

Open the serial monitor at `115200` baud and send one of these commands:

- `HELP`
- `STATUS`
- `FEED 3`
- `TEXT Hello world`
- `IMAGE`
- `LAYOUT`
- `RECEIPT`
- `RECEIPT random`
- `RECEIPT dark`
- `RECEIPT waste=18 total=58 recyclable=4 non_recyclable=0 reusable=0 others=0`

`LAYOUT` and `RECEIPT` print the receipt layout, including the provided image. With no extra arguments, they pick a random preset that exercises a different receipt variation. `IMAGE` prints just the image so you can test it in isolation.
Add `dark` or `slow` to a `LAYOUT` or `RECEIPT` command to print each line and the image twice with a short pause, which is useful for testing heat/density limits.

For `LAYOUT` and `RECEIPT`, you can optionally pass:

- `waste` in grams
- `total` in grams
- `recyclable`
- `non_recyclable`
- `reusable`
- `others`

If all material counts are `0`, the material summary is omitted. If only one category is present, the receipt prints a single sentence instead of a list.
