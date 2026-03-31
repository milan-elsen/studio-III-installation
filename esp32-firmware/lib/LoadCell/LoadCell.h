#pragma once

#include <Arduino.h>
#include <HX711.h>

class LoadCellSensor {
 public:
  void begin(int dataPin, int clockPin);
  void setScaleFactor(float factor);
  float scaleFactor() const;
  void tare(uint8_t times = 10);
  bool isReady() const;
  float readGrams(uint8_t samples = 5);
  long readRaw(uint8_t samples = 10);
  bool calibrateWithKnownWeight(float knownGrams, uint8_t samples = 10, float* outFactor = nullptr,
                                long* outRaw = nullptr);

 private:
  HX711 hx711_;
  float scaleFactor_ = 420.0f;
};
