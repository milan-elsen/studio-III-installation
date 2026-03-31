#include "LoadCell.h"
#include <limits.h>

void LoadCellSensor::begin(int dataPin, int clockPin) { hx711_.begin(dataPin, clockPin); }

void LoadCellSensor::setScaleFactor(float factor) {
  scaleFactor_ = factor;
  hx711_.set_scale(scaleFactor_);
}

float LoadCellSensor::scaleFactor() const { return scaleFactor_; }

void LoadCellSensor::tare(uint8_t times) {
  if (!hx711_.is_ready()) return;
  hx711_.set_scale(scaleFactor_);
  hx711_.tare(times);
}

bool LoadCellSensor::isReady() const { return hx711_.is_ready(); }

float LoadCellSensor::readGrams(uint8_t samples) {
  if (!hx711_.is_ready()) return NAN;
  hx711_.set_scale(scaleFactor_);
  return hx711_.get_units(samples);
}

long LoadCellSensor::readRaw(uint8_t samples) {
  if (!hx711_.is_ready()) return LONG_MIN;
  return hx711_.get_value(samples);
}

bool LoadCellSensor::calibrateWithKnownWeight(float knownGrams, uint8_t samples, float* outFactor, long* outRaw) {
  if (!hx711_.is_ready() || knownGrams <= 0.0f) return false;

  const long raw = hx711_.get_value(samples);
  const float factor = static_cast<float>(raw) / knownGrams;
  if (factor == 0.0f) return false;

  setScaleFactor(factor);

  if (outFactor != nullptr) *outFactor = factor;
  if (outRaw != nullptr) *outRaw = raw;
  return true;
}
