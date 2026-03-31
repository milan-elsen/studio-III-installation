#include "Protocol.h"

namespace {
Protocol::Command parseCommand(const String& token) {
  if (token == "PING") return Protocol::Command::Ping;
  if (token == "READ_WEIGHT") return Protocol::Command::ReadWeight;
  if (token == "READ_RAW") return Protocol::Command::ReadRaw;
  if (token == "TARE") return Protocol::Command::Tare;
  if (token == "GET_CAL") return Protocol::Command::GetCalibration;
  if (token == "SET_CAL") return Protocol::Command::SetCalibration;
  if (token == "CALIBRATE") return Protocol::Command::Calibrate;
  if (token == "PLAY_TONE") return Protocol::Command::PlayTone;
  if (token == "STOP_TONE") return Protocol::Command::StopTone;
  return Protocol::Command::Unknown;
}

float parseArg(const String& token, float fallback) {
  if (token.length() == 0) return fallback;
  return token.toFloat();
}
}  // namespace

namespace Protocol {

bool Parser::push(char c, Message* message) {
  if (c == '\r') return false;

  if (c != '\n') {
    buffer_ += c;
    return false;
  }

  const String line = buffer_;
  buffer_ = "";

  if (line.length() == 0) return false;

  const int first = line.indexOf(' ');
  const String cmdToken = first < 0 ? line : line.substring(0, first);
  const String rest = first < 0 ? "" : line.substring(first + 1);

  const int second = rest.indexOf(' ');
  const String arg1Token = second < 0 ? rest : rest.substring(0, second);
  const String arg2Token = second < 0 ? "" : rest.substring(second + 1);

  message->command = parseCommand(cmdToken);
  message->arg1 = parseArg(arg1Token, 0);
  message->arg2 = parseArg(arg2Token, 0);

  return true;
}

String encodeStatus(const String& value) {
  return "{\"type\":\"status\",\"value\":\"" + value + "\"}";
}

String encodeWeight(float grams) {
  return "{\"type\":\"weight\",\"grams\":" + String(grams, 1) + "}";
}

String encodeRaw(long raw) {
  return "{\"type\":\"raw\",\"raw\":" + String(raw) + "}";
}

String encodeCalibration(float factor) {
  return "{\"type\":\"calibration\",\"factor\":" + String(factor, 6) + "}";
}

String encodeCalibrationApplied(float factor, float knownGrams, long raw) {
  return "{\"type\":\"calibration_applied\",\"factor\":" + String(factor, 6) +
         ",\"known_grams\":" + String(knownGrams, 3) + ",\"raw\":" + String(raw) + "}";
}

String encodeError(const String& reason) {
  return "{\"type\":\"error\",\"reason\":\"" + reason + "\"}";
}

String encodePong() {
  return "{\"type\":\"pong\"}";
}

}  // namespace Protocol
