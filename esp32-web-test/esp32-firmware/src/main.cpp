#include <Arduino.h>
#include <WebServer.h>
#include <WiFi.h>

#include "generated/web_bundle.h"

namespace {
constexpr char kApSsid[] = "StudioIII-Test";
constexpr char kApPassword[] = "studio1234";
const IPAddress kApIp(192, 168, 4, 1);
const IPAddress kApGateway(192, 168, 4, 1);
const IPAddress kApSubnet(255, 255, 255, 0);

WebServer server(80);
unsigned long bootMillis = 0;
unsigned long sampleCounter = 0;
unsigned long nextDebugLogAtMs = 0;

String statusJson() {
  const unsigned long uptimeMs = millis() - bootMillis;
  const float simulatedValue = 12.5f + static_cast<float>((sampleCounter % 40)) * 0.25f;

  String json = "{";
  json += "\"device\":\"esp32-web-test\",";
  json += "\"wifi_mode\":\"ap\",";
  json += "\"ssid\":\"";
  json += kApSsid;
  json += "\",";
  json += "\"ip\":\"";
  json += WiFi.softAPIP().toString();
  json += "\",";
  json += "\"uptime_ms\":";
  json += String(uptimeMs);
  json += ",";
  json += "\"sample_counter\":";
  json += String(sampleCounter);
  json += ",";
  json += "\"temperature_c\":";
  json += String(simulatedValue, 2);
  json += "}";
  return json;
}

void handleStatus() {
  server.send(200, "application/json", statusJson());
}

void handleRoot() {
  server.send_P(200, "text/html", EspWebBundle::kWebUiHtml);
}

void handleTextRoot() {
  server.send(200, "text/plain", "ESP32 web test is running. Open /ui for the browser UI and /debug for JSON.");
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
  message += "Try /, /api/status, or /debug\n";
  server.send(404, "text/plain", message);
}

void logStatus(const char* label) {
  Serial.printf(
      "[%s] uptime=%lu heap=%u clients=%u ip=%s\n",
      label,
      static_cast<unsigned long>(millis() - bootMillis),
      static_cast<unsigned int>(ESP.getFreeHeap()),
      static_cast<unsigned int>(WiFi.softAPgetStationNum()),
      WiFi.softAPIP().toString().c_str());
}
}  // namespace

void setup() {
  Serial.begin(115200);
  delay(300);

  bootMillis = millis();

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(kApIp, kApGateway, kApSubnet);
  WiFi.softAP(kApSsid, kApPassword);
  WiFi.setSleep(false);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/ui", HTTP_GET, handleRoot);
  server.on("/text", HTTP_GET, handleTextRoot);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/debug", HTTP_GET, handleDebug);
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
  logStatus("boot");
  nextDebugLogAtMs = millis() + 5000;
}

void loop() {
  server.handleClient();
  sampleCounter++;

  const unsigned long now = millis();
  if (now >= nextDebugLogAtMs) {
    logStatus("loop");
    nextDebugLogAtMs = now + 5000;
  }

  delay(10);
}
