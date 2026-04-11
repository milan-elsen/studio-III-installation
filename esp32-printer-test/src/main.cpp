#include <Arduino.h>
#include <math.h>

#include "generated/receipt_image.h"

namespace {
constexpr unsigned long kUsbBaudRate = 115200;
constexpr unsigned long kPrinterBaudRate = 9600;
constexpr int kPrinterTxPin = 17;
constexpr int kPrinterRxPin = 16;

HardwareSerial printerSerial(2);
String inputBuffer;

void printerPrintLine(const String& line) {
  printerSerial.println(line);
}

void printerPrintLineDark(const String& line, bool darkMode) {
  printerPrintLine(line);
  if (!darkMode) {
    return;
  }
  delay(80);
  printerPrintLine(line);
}

void printerFeedLines(uint8_t count = 3) {
  for (uint8_t i = 0; i < count; ++i) {
    printerSerial.println();
  }
}

void printerSetBold(bool enabled) {
  printerSerial.write(0x1B);
  printerSerial.write('E');
  printerSerial.write(enabled ? 1 : 0);
}

void printerSetCenterAligned(bool enabled) {
  printerSerial.write(0x1B);
  printerSerial.write('a');
  printerSerial.write(enabled ? 1 : 0);
}

void printerSetTextSize(uint8_t multiplier) {
  printerSerial.write(0x1D);
  printerSerial.write('!');
  printerSerial.write(multiplier);
}

void printerSetPrintDensity(uint8_t density) {
  printerSerial.write(0x1D);
  printerSerial.write('(');
  printerSerial.write('K');
  printerSerial.write(0x02);
  printerSerial.write(0x00);
  printerSerial.write(0x31);
  printerSerial.write(density);
}

String trimCopy(String value) {
  value.trim();
  return value;
}

bool isDigitOrSign(char c) {
  return (c >= '0' && c <= '9') || c == '-' || c == '+';
}

float argOrDefaultFloat(const String& line, const char* key, float fallback) {
  const String needle = String(key) + "=";
  const int start = line.indexOf(needle);
  if (start < 0) {
    return fallback;
  }

  int valueStart = start + needle.length();
  while (valueStart < static_cast<int>(line.length()) && line[valueStart] == ' ') {
    ++valueStart;
  }

  int valueEnd = valueStart;
  while (valueEnd < static_cast<int>(line.length())) {
    const char c = line[valueEnd];
    if (!(isDigitOrSign(c) || c == '.')) {
      break;
    }
    ++valueEnd;
  }

  return line.substring(valueStart, valueEnd).toFloat();
}

int argOrDefaultInt(const String& line, const char* key, int fallback) {
  return static_cast<int>(lroundf(argOrDefaultFloat(line, key, static_cast<float>(fallback))));
}

struct ReceiptPreset {
  float wasteGrams;
  float totalWeightGrams;
  int recyclableCount;
  int nonRecyclableCount;
  int reusableCount;
  int othersCount;
};

const ReceiptPreset kReceiptPresets[] = {
    {5.0f, 38.0f, 0, 0, 0, 0},
    {12.0f, 44.0f, 5, 0, 0, 0},
    {17.0f, 51.0f, 0, 4, 0, 0},
    {8.0f, 29.0f, 0, 0, 3, 0},
    {22.0f, 67.0f, 0, 0, 0, 6},
    {26.0f, 73.0f, 3, 2, 1, 1},
};

ReceiptPreset randomReceiptPreset() {
  const int presetCount = static_cast<int>(sizeof(kReceiptPresets) / sizeof(kReceiptPresets[0]));
  return kReceiptPresets[random(presetCount)];
}

bool parsePbmHeader(const uint8_t* data, size_t size, size_t& payloadOffset, int& width, int& height) {
  auto skipWhitespace = [&](size_t& index) {
    while (index < size) {
      const char c = static_cast<char>(data[index]);
      if (c != ' ' && c != '\n' && c != '\r' && c != '\t') {
        break;
      }
      ++index;
    }
  };

  auto readToken = [&](size_t& index, String& token) -> bool {
    skipWhitespace(index);
    if (index >= size) {
      return false;
    }

    token = "";
    while (index < size) {
      const char c = static_cast<char>(data[index]);
      if (c == ' ' || c == '\n' || c == '\r' || c == '\t') {
        break;
      }
      token += c;
      ++index;
    }

    return token.length() > 0;
  };

  size_t index = 0;
  String token;
  if (!readToken(index, token) || token != "P4") {
    return false;
  }
  if (!readToken(index, token)) {
    return false;
  }
  width = token.toInt();
  if (!readToken(index, token)) {
    return false;
  }
  height = token.toInt();
  skipWhitespace(index);
  payloadOffset = index;
  return width > 0 && height > 0 && payloadOffset < size;
}

void printerWriteRasterImage(const uint8_t* data, size_t size) {
  size_t payloadOffset = 0;
  int width = 0;
  int height = 0;
  if (!parsePbmHeader(data, size, payloadOffset, width, height)) {
    Serial.println("Unable to parse receipt image.");
    return;
  }

  const int bytesPerRow = (width + 7) / 8;
  printerSerial.write(0x1D);
  printerSerial.write('v');
  printerSerial.write('0');
  printerSerial.write(0x00);
  printerSerial.write(static_cast<uint8_t>(bytesPerRow & 0xFF));
  printerSerial.write(static_cast<uint8_t>((bytesPerRow >> 8) & 0xFF));
  printerSerial.write(static_cast<uint8_t>(height & 0xFF));
  printerSerial.write(static_cast<uint8_t>((height >> 8) & 0xFF));
  printerSerial.write(data + payloadOffset, size - payloadOffset);
}

void printReceiptImage(bool darkMode) {
  (void)darkMode;
  printerSetCenterAligned(true);
  printerWriteRasterImage(kReceiptImagePbm, kReceiptImagePbm_len);
  printerSetCenterAligned(false);
}

String materialSummarySentence(int recyclableCount, int nonRecyclableCount, int reusableCount, int othersCount) {
  const bool recyclableOnly = recyclableCount > 0 && nonRecyclableCount == 0 && reusableCount == 0 && othersCount == 0;
  const bool nonRecyclableOnly = nonRecyclableCount > 0 && recyclableCount == 0 && reusableCount == 0 && othersCount == 0;
  const bool reusableOnly = reusableCount > 0 && recyclableCount == 0 && nonRecyclableCount == 0 && othersCount == 0;
  const bool othersOnly = othersCount > 0 && recyclableCount == 0 && nonRecyclableCount == 0 && reusableCount == 0;

  if (recyclableOnly) {
    return "All materials fully recyclable\n:)";
  }
  if (nonRecyclableOnly) {
    return "None of the materials are recyclable\n:(";
  }
  if (reusableOnly) {
    return "All materials are reusable\n:)";
  }

  return "";
}

void printMaterialSummary(int recyclableCount, int nonRecyclableCount, int reusableCount, int othersCount, bool darkMode) {
  const int total = recyclableCount + nonRecyclableCount + reusableCount + othersCount;
  if (total <= 0) {
    return;
  }

  printerSetCenterAligned(true);
  const String sentence = materialSummarySentence(recyclableCount, nonRecyclableCount, reusableCount, othersCount);
  if (sentence.length() > 0) {
    printerPrintLineDark(sentence, darkMode);
    printerSetCenterAligned(false);
    return;
  }

  printerPrintLineDark("Material Summary", darkMode);
  printerPrintLineDark("Recyclable: " + String(recyclableCount), darkMode);
  printerPrintLineDark("Non-recyclable: " + String(nonRecyclableCount), darkMode);
  printerPrintLineDark("Reusable: " + String(reusableCount), darkMode);
  printerPrintLineDark("Others: " + String(othersCount), darkMode);
  printerSetCenterAligned(false);
}

void printReceiptTemplate(
    float wasteGrams,
    float totalWeightGrams,
    int recyclableCount,
    int nonRecyclableCount,
    int reusableCount,
    int othersCount,
    bool darkMode) {
  printerFeedLines(2);
  printerSetCenterAligned(true);
  printerSetBold(true);
  printerPrintLineDark("UNPACK THE EXCESS", darkMode);
  printerSetCenterAligned(false);
  printerPrintLineDark("----------------------------", darkMode);
  printerSetCenterAligned(true);
  printerSetTextSize(0x11);
  printerPrintLineDark(String(lroundf(wasteGrams)) + " g", darkMode);
  printerSetTextSize(0x00);
  printerPrintLineDark("Waste", darkMode);
  printerPrintLineDark("Total weight: " + String(lroundf(totalWeightGrams)) + " g", darkMode);
  printerSetCenterAligned(false);
  printerFeedLines(1);
  printReceiptImage(darkMode);
  printerFeedLines(1);
  printMaterialSummary(recyclableCount, nonRecyclableCount, reusableCount, othersCount, darkMode);
  printerFeedLines(1);
  printerPrintLineDark("Thank you for making", darkMode);
  printerPrintLineDark("excessive waste visible", darkMode);
  printerPrintLineDark("and recycling as much as", darkMode);
  printerPrintLineDark("possible!", darkMode);
  printerSetBold(false);
  printerFeedLines(3);
}

void printHelp() {
  Serial.println("Commands:");
  Serial.println("  HELP");
  Serial.println("  STATUS");
  Serial.println("  FEED [n]");
  Serial.println("  TEXT <line>");
  Serial.println("  IMAGE");
  Serial.println("  LAYOUT");
  Serial.println("  RECEIPT");
  Serial.println("  RECEIPT waste=123 total=456 recyclable=4 non_recyclable=0 reusable=0 others=0");
  Serial.println("  RECEIPT random");
  Serial.println("  RECEIPT dark");
}

void printStatus() {
  Serial.println("Status:");
  Serial.print("  printer_baud: ");
  Serial.println(kPrinterBaudRate);
  Serial.print("  printer_tx_pin: ");
  Serial.println(kPrinterTxPin);
  Serial.print("  printer_rx_pin: ");
  Serial.println(kPrinterRxPin);
  Serial.print("  heap_free: ");
  Serial.println(ESP.getFreeHeap());
}

void handleCommand(String line) {
  line = trimCopy(line);
  if (line.isEmpty()) {
    return;
  }

  if (line.equalsIgnoreCase("HELP")) {
    printHelp();
    return;
  }

  if (line.equalsIgnoreCase("STATUS")) {
    printStatus();
    return;
  }

  if (line.startsWith("LAYOUT") || line.startsWith("RECEIPT")) {
    const int spaceIndex = line.indexOf(' ');
    const bool wantsRandomPreset = line.indexOf("random") >= 0;
    const bool wantsDarkMode = line.indexOf("dark") >= 0 || line.indexOf("slow") >= 0;
    if (spaceIndex < 0 || wantsRandomPreset) {
      const ReceiptPreset preset = randomReceiptPreset();
      printReceiptTemplate(
          preset.wasteGrams,
          preset.totalWeightGrams,
          preset.recyclableCount,
          preset.nonRecyclableCount,
          preset.reusableCount,
          preset.othersCount,
          wantsDarkMode);
    } else {
      const float wasteGrams = argOrDefaultFloat(line, "waste", 0.0f);
      const float totalWeightGrams = argOrDefaultFloat(line, "total", wasteGrams);
      const int recyclableCount = argOrDefaultInt(line, "recyclable", 0);
      const int nonRecyclableCount = argOrDefaultInt(line, "non_recyclable", 0);
      const int reusableCount = argOrDefaultInt(line, "reusable", 0);
      const int othersCount = argOrDefaultInt(line, "others", 0);
      printReceiptTemplate(wasteGrams, totalWeightGrams, recyclableCount, nonRecyclableCount, reusableCount, othersCount, wantsDarkMode);
    }
    Serial.println("Printed receipt template.");
    return;
  }

  if (line.equalsIgnoreCase("IMAGE")) {
    printReceiptImage(false);
    Serial.println("Printed receipt image.");
    return;
  }

  if (line.startsWith("FEED")) {
    int count = 3;
    const int spaceIndex = line.indexOf(' ');
    if (spaceIndex >= 0) {
      const String countText = trimCopy(line.substring(spaceIndex + 1));
      if (countText.length() > 0) {
        count = countText.toInt();
      }
    }
    if (count < 1) count = 1;
    if (count > 20) count = 20;
    printerFeedLines(static_cast<uint8_t>(count));
    Serial.print("Fed ");
    Serial.print(count);
    Serial.println(" lines.");
    return;
  }

  if (line.startsWith("TEXT ")) {
    const String text = line.substring(5);
    printerPrintLine(text);
    Serial.println("Printed text line.");
    return;
  }

  Serial.println("Unknown command. Type HELP.");
}
}  // namespace

void setup() {
  Serial.begin(kUsbBaudRate);
  delay(300);

  printerSerial.begin(kPrinterBaudRate, SERIAL_8N1, kPrinterRxPin, kPrinterTxPin);
  printerSerial.write(0x1B);
  printerSerial.write('@');
  delay(50);
  randomSeed(esp_random());

  Serial.println("ESP32 printer test ready.");
  Serial.println("Type HELP for commands.");
}

void loop() {
  while (Serial.available() > 0) {
    const char c = static_cast<char>(Serial.read());
    if (c == '\r') {
      continue;
    }
    if (c == '\n') {
      handleCommand(inputBuffer);
      inputBuffer = "";
      continue;
    }
    inputBuffer += c;
    if (inputBuffer.length() > 256) {
      inputBuffer.remove(0, inputBuffer.length() - 256);
    }
  }
}
