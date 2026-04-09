#include <Arduino.h>
#include <HX711.h>
#include <limits.h>
#include <WebServer.h>
#include <WiFi.h>

#include "generated/web_bundle.h"

namespace {
constexpr char kApSsid[] = "StudioIII-Test";
constexpr char kApPassword[] = "studio1234";
constexpr int kHx711DataPin = 25;
constexpr int kHx711ClockPin = 26;
const IPAddress kApIp(192, 168, 4, 1);
const IPAddress kApGateway(192, 168, 4, 1);
const IPAddress kApSubnet(255, 255, 255, 0);

WebServer server(80);
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

void handleRoot() {
  server.send_P(200, "text/html", EspWebBundle::kWebUiHtml);
}

void handleTextRoot() {
  server.send(
      200,
      "text/plain",
      "ESP32 web test is running. Open /ui for the browser UI, /debug for the debug UI, and /api/loadcell/state for live sensor data.");
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
  message += "Try /, /ui, /debug, /api/status, or /api/loadcell/state\n";
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
  server.on("/debug", HTTP_GET, handleRoot);
  server.on("/text", HTTP_GET, handleTextRoot);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/loadcell/state", HTTP_GET, handleStatus);
  server.on("/api/loadcell/raw", HTTP_GET, handleRaw);
  server.on("/api/loadcell/weight", HTTP_GET, handleWeight);
  server.on("/api/loadcell/tare", HTTP_GET, handleTare);
  server.on("/api/loadcell/calibration", HTTP_GET, handleSetCalibration);
  server.on("/api/loadcell/calibrate", HTTP_GET, handleCalibrate);
  server.on("/api/debug", HTTP_GET, handleDebug);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println();
  Serial.println("ESP32 web test ready");
  Serial.print("AP SSID: ");
  Serial.println(kApSsid);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());
  Serial.print("HTTP server: http://");
  Serial.print(WiFi.softAPIP());
  Serial.println("/");
  Serial.println("Status endpoint: http://192.168.4.1/api/status");
  Serial.println("Load cell endpoint: http://192.168.4.1/api/loadcell/state");
  Serial.println("Debug UI: http://192.168.4.1/debug");
  Serial.println("JSON debug: http://192.168.4.1/api/debug");
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
