#include <Arduino.h>
#include <HX711.h>

#define HX_DT 26
#define HX_SCK 25

HX711 scale;

// Set after calibration
float calibration_factor = 1.0f;

void setup() {
  Serial.begin(115200);
  delay(500);

  scale.begin(HX_DT, HX_SCK);

  if (!scale.is_ready()) {
    Serial.println("HX711 not found. Check wiring.");
    while (1) delay(10);
  }

  Serial.println("Remove all weight. Taring...");
  scale.tare(20);
  Serial.println("Tare done.");
}

void loop() {
  // Average 10 readings for stability
  long raw = scale.read_average(10);
  float units = scale.get_units(10) / calibration_factor;

  Serial.print("Raw: ");
  Serial.print(raw);
  Serial.print("  Weight (uncalibrated): ");
  Serial.println(units, 3);

  delay(200);
}