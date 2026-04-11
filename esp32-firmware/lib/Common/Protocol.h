#pragma once

#include <Arduino.h>

namespace Protocol {

enum class Command {
  Ping,
  ReadWeight,
  ReadRaw,
  Tare,
  GetCalibration,
  SetCalibration,
  Calibrate,
  PlayTone,
  StopTone,
  Unknown,
};

struct Message {
  Command command = Command::Unknown;
  float arg1 = 0.0f;
  float arg2 = 0.0f;
};

class Parser {
 public:
  bool push(char c, Message* message);

 private:
  String buffer_;
};

String encodeStatus(const String& value);
String encodeWeight(float grams);
String encodeRaw(long raw);
String encodeCalibration(float factor);
String encodeCalibrationApplied(float factor, float knownGrams, long raw);
String encodeError(const String& reason);
String encodePong();

}  // namespace Protocol
