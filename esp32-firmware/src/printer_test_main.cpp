#include <Arduino.h>

#include "generated/waste_dithered_image.h"

namespace {
HardwareSerial printerSerial(2);

constexpr unsigned long kPrinterBaudRate = 9600;
constexpr int kPrinterTxPin = 17;
constexpr int kPrinterRxPin = 16;
constexpr uint8_t kEscPosRasterImage = 0x1D;

void sendStatus(const char* message) {
  Serial.print("{\"type\":\"status\",\"value\":\"");
  Serial.print(message);
  Serial.println("\"}");
}

void sendError(const char* message) {
  Serial.print("{\"type\":\"error\",\"reason\":\"");
  Serial.print(message);
  Serial.println("\"}");
}

void printDemoLabel() {
  printerSerial.print("EM5820 TEST LABEL\n");
  printerSerial.print("Hello from ESP32\n");
  printerSerial.print("Serial bridge OK\n\n\n");
}

void printWasteImage() {
  const uint16_t widthBytes = (GeneratedPrinterImage::kWasteImageWidth + 7) / 8;

  printerSerial.write(kEscPosRasterImage);
  printerSerial.write(static_cast<uint8_t>('v'));
  printerSerial.write(static_cast<uint8_t>('0'));
  printerSerial.write(static_cast<uint8_t>(0));
  printerSerial.write(static_cast<uint8_t>(widthBytes & 0xFF));
  printerSerial.write(static_cast<uint8_t>((widthBytes >> 8) & 0xFF));
  printerSerial.write(static_cast<uint8_t>(GeneratedPrinterImage::kWasteImageHeight & 0xFF));
  printerSerial.write(static_cast<uint8_t>((GeneratedPrinterImage::kWasteImageHeight >> 8) & 0xFF));
  printerSerial.write(GeneratedPrinterImage::kWasteImageData, GeneratedPrinterImage::kWasteImageDataSize);
  printerSerial.print("\n\n");
}

void printRawText(const String& text) {
  printerSerial.print(text);
  printerSerial.print('\n');
}

void handleLine(const String& line) {
  if (line.length() == 0) return;

  if (line == "PING") {
    Serial.println("{\"type\":\"pong\"}");
    return;
  }

  if (line == "PRINT_TEST" || line == "DEMO") {
    printDemoLabel();
    sendStatus("printed_test_label");
    return;
  }

  if (line == "PRINT_IMAGE") {
    printWasteImage();
    sendStatus("printed_image");
    return;
  }

  if (line.startsWith("RAW ")) {
    printRawText(line.substring(4));
    sendStatus("printed_raw_text");
    return;
  }

  if (line.startsWith("FEED ")) {
    const int count = line.substring(5).toInt();
    if (count <= 0) {
      sendError("invalid_feed_count");
      return;
    }
    for (int i = 0; i < count; ++i) {
      printerSerial.print('\n');
    }
    sendStatus("fed_paper");
    return;
  }

  sendError("unknown_command");
}

void handleUsbSerial() {
  static String buffer;

  while (Serial.available() > 0) {
    const char c = static_cast<char>(Serial.read());
    if (c == '\r') continue;
    if (c == '\n') {
      handleLine(buffer);
      buffer = "";
      continue;
    }
    buffer += c;
  }
}
}  // namespace

void setup() {
  Serial.begin(115200);
  delay(400);

  printerSerial.begin(kPrinterBaudRate, SERIAL_8N1, kPrinterRxPin, kPrinterTxPin);

  Serial.println("{\"type\":\"status\",\"value\":\"booted\"}");
  Serial.println("{\"type\":\"status\",\"value\":\"commands: PING, PRINT_TEST, DEMO, PRINT_IMAGE, RAW <text>, FEED <count>\"}");
  printDemoLabel();
}

void loop() {
  handleUsbSerial();
  delay(5);
}
