#include <Arduino.h>
#include <HX711.h>
#include <limits.h>
#include <WebServer.h>
#include <WiFi.h>

#include "generated/web_bundle.h"
#include "generated/receipt_image.h"

namespace {
constexpr char kApSsid[] = "StudioIII-Test";
constexpr char kApPassword[] = "studio1234";
constexpr int kHx711DataPin = 25;
constexpr int kHx711ClockPin = 26;
const IPAddress kApIp(192, 168, 4, 1);
const IPAddress kApGateway(192, 168, 4, 1);
const IPAddress kApSubnet(255, 255, 255, 0);
constexpr unsigned long kPrinterBaudRate = 9600;
constexpr int kPrinterTxPin = 17;
constexpr int kPrinterRxPin = 16;

WebServer server(80);
HardwareSerial printerSerial(2);
HX711 scale;
unsigned long bootMillis = 0;
float calibrationFactor = 1.0f;
bool tareApplied = false;
bool calibrated = false;
unsigned long nextDebugLogAtMs = 0;
long lastRaw = LONG_MIN;
float lastWeight = NAN;
long tareOffset = 0;

bool loadCellReady() { return scale.is_ready(); }

bool hasLoadCellSample() { return lastRaw != LONG_MIN || !isnan(lastWeight); }

bool waitForLoadCell(unsigned long timeoutMs = 250) {
  return scale.wait_ready_timeout(timeoutMs, 1);
}

String jsonBool(bool value) { return value ? "true" : "false"; }

String jsonLongOrNull(long value) { return value == LONG_MIN ? "null" : String(value); }

String jsonFloatOrNull(float value, uint8_t decimals = 2) {
  if (isnan(value)) return "null";
  char buffer[24];
  snprintf(buffer, sizeof(buffer), "%.*f", decimals, static_cast<double>(value));
  return String(buffer);
}

void printerPrintLine(const String& line) { printerSerial.println(line); }

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

void printReceiptImage() {
  printerSetCenterAligned(true);
  printerWriteRasterImage(kReceiptImagePbm, kReceiptImagePbm_len);
  printerSetCenterAligned(false);
}

String materialSummarySentence(int recyclableCount, int nonRecyclableCount, int reusableCount, int othersCount) {
  const bool recyclableOnly = recyclableCount > 0 && nonRecyclableCount == 0 && reusableCount == 0 && othersCount == 0;
  const bool nonRecyclableOnly = nonRecyclableCount > 0 && recyclableCount == 0 && reusableCount == 0 && othersCount == 0;
  const bool reusableOnly = reusableCount > 0 && recyclableCount == 0 && nonRecyclableCount == 0 && othersCount == 0;
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

void printMaterialSummary(int recyclableCount, int nonRecyclableCount, int reusableCount, int othersCount) {
  const int total = recyclableCount + nonRecyclableCount + reusableCount + othersCount;
  if (total <= 0) {
    return;
  }

  const bool othersOnly = othersCount > 0 && recyclableCount == 0 && nonRecyclableCount == 0 && reusableCount == 0;
  if (othersOnly) {
    return;
  }

  printerSetCenterAligned(true);
  const String sentence = materialSummarySentence(recyclableCount, nonRecyclableCount, reusableCount, othersCount);
  if (sentence.length() > 0) {
    printerPrintLine(sentence);
    printerSetCenterAligned(false);
    return;
  }

  printerPrintLine("Material Summary");
  printerPrintLine("Recyclable: " + String(recyclableCount));
  printerPrintLine("Non-recyclable: " + String(nonRecyclableCount));
  printerPrintLine("Reusable: " + String(reusableCount));
  printerPrintLine("Others: " + String(othersCount));
  printerSetCenterAligned(false);
}

String argOrEmpty(const char* name) {
  if (!server.hasArg(name)) return "";
  return server.arg(name);
}

float argOrDefaultFloat(const char* name, float fallback) {
  const String value = argOrEmpty(name);
  return value.length() == 0 ? fallback : value.toFloat();
}

long argOrDefaultLong(const char* name, long fallback) {
  const String value = argOrEmpty(name);
  return value.length() == 0 ? fallback : value.toInt();
}

bool captureLoadCellSnapshot(uint8_t rawSamples = 10, uint8_t weightSamples = 5) {
  if (!loadCellReady()) {
    return false;
  }

  lastRaw = scale.read_average(rawSamples);
  const long averagedRaw = scale.read_average(weightSamples);
  const long netRaw = tareApplied ? (averagedRaw - tareOffset) : averagedRaw;
  lastWeight = static_cast<float>(netRaw) / calibrationFactor;
  return true;
}

String stateJson() {
  const bool ready = captureLoadCellSnapshot();
  String json = "{";
  json += "\"device\":\"esp32-web-test\",";
  json += "\"wifi_mode\":\"ap\",";
  json += "\"ssid\":\"";
  json += kApSsid;
  json += "\",";
  json += "\"ip\":\"";
  json += WiFi.softAPIP().toString();
  json += "\",";
  json += "\"ready\":";
  json += jsonBool(ready);
  json += ",";
  json += "\"has_sample\":";
  json += jsonBool(hasLoadCellSample());
  json += ",";
  json += "\"tare_applied\":";
  json += jsonBool(tareApplied);
  json += ",";
  json += "\"calibrated\":";
  json += jsonBool(calibrated);
  json += ",";
  json += "\"calibration_factor\":";
  json += String(calibrationFactor, 6);
  json += ",";
  json += "\"raw\":";
  json += jsonLongOrNull(lastRaw);
  json += ",";
  json += "\"grams\":";
  json += jsonFloatOrNull(lastWeight, 2);
  json += ",";
  json += "\"uptime_ms\":";
  json += String(millis() - bootMillis);
  json += ",";
  json += "\"heap_free\":";
  json += String(ESP.getFreeHeap());
  json += ",";
  json += "\"wifi_clients\":";
  json += String(WiFi.softAPgetStationNum());
  json += "}";
  return json;
}

String actionJson(const char* action) {
  String json = "{";
  json += "\"ok\":true,";
  json += "\"action\":\"";
  json += action;
  json += "\",";
  json += "\"state\":";
  json += stateJson();
  json += "}";
  return json;
}

String errorJson(const char* reason) {
  String json = "{";
  json += "\"ok\":false,";
  json += "\"reason\":\"";
  json += reason;
  json += "\",";
  json += "\"state\":";
  json += stateJson();
  json += "}";
  return json;
}

void handleStatus() {
  server.send(200, "application/json", stateJson());
}

void handleRaw() {
  if (!captureLoadCellSnapshot()) {
    server.send(503, "application/json", errorJson("load_cell_not_ready"));
    return;
  }

  String json = "{";
  json += "\"type\":\"raw\",";
  json += "\"raw\":";
  json += String(lastRaw);
  json += ",";
  json += "\"calibration_factor\":";
  json += String(calibrationFactor, 6);
  json += "}";
  server.send(200, "application/json", json);
}

void handleWeight() {
  if (!captureLoadCellSnapshot()) {
    server.send(503, "application/json", errorJson("load_cell_not_ready"));
    return;
  }

  String json = "{";
  json += "\"type\":\"weight\",";
  json += "\"grams\":";
  json += jsonFloatOrNull(lastWeight, 2);
  json += ",";
  json += "\"calibration_factor\":";
  json += String(calibrationFactor, 6);
  json += "}";
  server.send(200, "application/json", json);
}

void handleTare() {
  Serial.println("[api/loadcell/tare] request");
  if (!waitForLoadCell()) {
    Serial.println("[api/loadcell/tare] load cell not ready");
    server.send(503, "application/json", errorJson("load_cell_not_ready"));
    return;
  }

  tareOffset = scale.read_average(20);
  tareApplied = true;
  captureLoadCellSnapshot();
  Serial.printf("[api/loadcell/tare] applied tare_offset=%ld\n", tareOffset);
  server.send(200, "application/json", actionJson("tared"));
}

void handleSetCalibration() {
  Serial.println("[api/loadcell/calibration] request");
  if (!server.hasArg("factor")) {
    server.send(400, "application/json", errorJson("missing_factor"));
    return;
  }

  const float factor = server.arg("factor").toFloat();
  if (factor <= 0.0f) {
    server.send(400, "application/json", errorJson("invalid_calibration_factor"));
    return;
  }

  calibrationFactor = factor;
  calibrated = true;
  if (loadCellReady()) {
    captureLoadCellSnapshot();
  }
  Serial.printf("[api/loadcell/calibration] factor set to %.6f\n", calibrationFactor);
  server.send(200, "application/json", actionJson("calibration_set"));
}

void handleCalibrate() {
  Serial.println("[api/loadcell/calibrate] request");
  if (!waitForLoadCell()) {
    Serial.println("[api/loadcell/calibrate] load cell not ready");
    server.send(503, "application/json", errorJson("load_cell_not_ready"));
    return;
  }

  if (!server.hasArg("known_grams")) {
    server.send(400, "application/json", errorJson("missing_known_grams"));
    return;
  }

  const float knownGrams = server.arg("known_grams").toFloat();
  if (knownGrams <= 0.0f) {
    server.send(400, "application/json", errorJson("invalid_known_grams"));
    return;
  }

  const long raw = scale.read_average(10);
  const long netRaw = tareApplied ? (raw - tareOffset) : raw;
  const float newFactor = static_cast<float>(netRaw) / knownGrams;
  if (newFactor == 0.0f) {
    server.send(500, "application/json", errorJson("calibration_failed"));
    return;
  }

  calibrationFactor = newFactor;
  tareApplied = true;
  calibrated = true;
  captureLoadCellSnapshot();
  Serial.printf(
      "[api/loadcell/calibrate] known=%.2f raw=%ld net_raw=%ld factor=%.6f tare_offset=%ld\n",
      knownGrams,
      raw,
      netRaw,
      calibrationFactor,
      tareOffset);

  String json = "{";
  json += "\"ok\":true,";
  json += "\"action\":\"calibrated\",";
  json += "\"known_grams\":";
  json += String(knownGrams, 2);
  json += ",";
  json += "\"raw\":";
  json += String(raw);
  json += ",";
  json += "\"net_raw\":";
  json += String(netRaw);
  json += ",";
  json += "\"calibration_factor\":";
  json += String(calibrationFactor, 6);
  json += ",";
  json += "\"state\":";
  json += stateJson();
  json += "}";
  server.send(200, "application/json", json);
}

void printWasteReport(
    float totalWeightGrams,
    float wasteGrams,
    int recyclableCount,
    int nonRecyclableCount,
    int reusableCount,
    int othersCount) {
  printerFeedLines(2);
  printerSetCenterAligned(true);
  printerSetBold(true);
  printerPrintLine("UNPACK THE EXCESS");
  printerSetCenterAligned(false);
  printerPrintLine("----------------------------");
  printerSetCenterAligned(true);
  printerPrintLine(String(static_cast<long>(wasteGrams + 0.5f)) + " g");
  printerPrintLine("Waste");
  printerPrintLine("Total weight: " + String(static_cast<long>(totalWeightGrams + 0.5f)) + " g");
  printerSetCenterAligned(false);
  printerFeedLines(1);
  printReceiptImage();
  printerFeedLines(1);
  printMaterialSummary(recyclableCount, nonRecyclableCount, reusableCount, othersCount);
  printerFeedLines(1);
  printerPrintLine("Thank you for making");
  printerPrintLine("excessive waste visible");
  printerPrintLine("and recycling as much as");
  printerPrintLine("possible!");
  printerSetBold(false);
  printerFeedLines(3);
}

void handlePrintReport() {
  const float packagingGrams = argOrDefaultFloat("before_grams", NAN);
  const float contentGrams = argOrDefaultFloat("after_grams", NAN);
  if (isnan(packagingGrams) || isnan(contentGrams)) {
    server.send(400, "application/json", errorJson("missing_before_or_after_grams"));
    return;
  }

  const float wasteGrams = argOrDefaultFloat("waste_grams", max(0.0f, packagingGrams - contentGrams));
  const int recyclableCount = static_cast<int>(argOrDefaultLong("recyclable", 0));
  const int nonRecyclableCount = static_cast<int>(argOrDefaultLong("non_recyclable", 0));
  const int reusableCount = static_cast<int>(argOrDefaultLong("reusable", 0));
  const int othersCount = static_cast<int>(argOrDefaultLong("others", 0));

  printWasteReport(
      packagingGrams,
      wasteGrams,
      recyclableCount,
      nonRecyclableCount,
      reusableCount,
      othersCount);

  Serial.printf(
      "[api/print/report] packaging=%.2f content=%.2f waste=%.2f recyclable=%d non_recyclable=%d reusable=%d others=%d\n",
      packagingGrams,
      contentGrams,
      wasteGrams,
      recyclableCount,
      nonRecyclableCount,
      reusableCount,
      othersCount);
  server.send(200, "application/json", actionJson("printed_report"));
}

void handleRoot() {
  server.send_P(200, "text/html", EspWebBundle::kWebUiHtml);
}

void handleDebug() {
  String json = "{";
  json += "\"boot_ms\":";
  json += String(bootMillis);
  json += ",";
  json += "\"uptime_ms\":";
  json += String(millis() - bootMillis);
  json += ",";
  json += "\"heap_free\":";
  json += String(ESP.getFreeHeap());
  json += ",";
  json += "\"wifi_clients\":";
  json += String(WiFi.softAPgetStationNum());
  json += ",";
  json += "\"ip\":\"";
  json += WiFi.softAPIP().toString();
  json += "\"";
  json += "}";

  server.send(200, "application/json", json);
}

void handleNotFound() {
  String message = "Not found: ";
  message += server.uri();
  message += "\n";
  message += "Try /, /ui, /calibration, /api/status, /api/loadcell/state, or /api/loadcell/calibration\n";
  server.send(404, "text/plain", message);
}

void logStatus(const char* label) {
  Serial.printf(
      "[%s] uptime=%lu heap=%u clients=%u ready=%s tare=%s cal=%.6f raw=%ld grams=%.2f ip=%s\n",
      label,
      static_cast<unsigned long>(millis() - bootMillis),
      static_cast<unsigned int>(ESP.getFreeHeap()),
      static_cast<unsigned int>(WiFi.softAPgetStationNum()),
      loadCellReady() ? "true" : "false",
      tareApplied ? "true" : "false",
      calibrationFactor,
      lastRaw,
      lastWeight,
      WiFi.softAPIP().toString().c_str());
}
}  // namespace

void setup() {
  Serial.begin(115200);
  delay(300);

  bootMillis = millis();

  printerSerial.begin(kPrinterBaudRate, SERIAL_8N1, kPrinterRxPin, kPrinterTxPin);

  scale.begin(kHx711DataPin, kHx711ClockPin);
  scale.set_scale(calibrationFactor);

  if (scale.is_ready()) {
    Serial.println("Remove all weight. Taring...");
    tareOffset = scale.read_average(20);
    tareApplied = true;
    Serial.println("Tare done.");
    captureLoadCellSnapshot();
  } else {
    Serial.println("HX711 not found. Check wiring.");
  }

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(kApIp, kApGateway, kApSubnet);
  WiFi.softAP(kApSsid, kApPassword);
  WiFi.setSleep(false);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/ui", HTTP_GET, handleRoot);
  server.on("/calibration", HTTP_GET, handleRoot);
  server.on("/debug", HTTP_GET, handleRoot);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/loadcell/state", HTTP_GET, handleStatus);
  server.on("/api/loadcell/raw", HTTP_GET, handleRaw);
  server.on("/api/loadcell/weight", HTTP_GET, handleWeight);
  server.on("/api/loadcell/tare", HTTP_GET, handleTare);
  server.on("/api/loadcell/calibration", HTTP_GET, handleSetCalibration);
  server.on("/api/loadcell/calibrate", HTTP_GET, handleCalibrate);
  server.on("/api/print/report", HTTP_GET, handlePrintReport);
  server.on("/api/debug", HTTP_GET, handleDebug);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println();
  Serial.println("ESP32 firmware ready");
  Serial.print("AP SSID: ");
  Serial.println(kApSsid);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());
  Serial.print("HTTP server: http://");
  Serial.print(WiFi.softAPIP());
  Serial.println("/");
  Serial.println("Status endpoint: http://192.168.4.1/api/status");
  Serial.println("Load cell endpoint: http://192.168.4.1/api/loadcell/state");
  Serial.println("Calibration page: http://192.168.4.1/calibration");
  Serial.println("Calibration endpoint: http://192.168.4.1/api/loadcell/calibration");
  Serial.println("Print report endpoint: http://192.168.4.1/api/print/report");
  Serial.println("Calibration UI: http://192.168.4.1/calibration");
  Serial.println("Debug JSON: http://192.168.4.1/api/debug");
  logStatus("boot");
  nextDebugLogAtMs = millis() + 5000;
}

void loop() {
  server.handleClient();
  captureLoadCellSnapshot();

  const unsigned long now = millis();
  if (now >= nextDebugLogAtMs) {
    logStatus("loop");
    nextDebugLogAtMs = now + 5000;
  }

  delay(10);
}
