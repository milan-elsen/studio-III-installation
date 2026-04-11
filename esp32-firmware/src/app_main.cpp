#include <Arduino.h>
#include <limits.h>

#include "LoadCell.h"
#include "Protocol.h"
#include "Speaker.h"
#include "pin_config.h"

namespace {
Protocol::Parser parser;
LoadCellSensor loadCell;
Speaker speaker;

unsigned long toneStopAtMs = 0;
unsigned long nextWeightPushAtMs = 0;

void sendLine(const String& line) { Serial.println(line); }

void handleCommand(const Protocol::Message& msg) {
  switch (msg.command) {
    case Protocol::Command::Ping:
      sendLine(Protocol::encodePong());
      return;
    case Protocol::Command::ReadWeight: {
      const float grams = loadCell.readGrams(5);
      if (isnan(grams)) {
        sendLine(Protocol::encodeError("load_cell_not_ready"));
      } else {
        sendLine(Protocol::encodeWeight(grams));
      }
      return;
    }
    case Protocol::Command::ReadRaw: {
      const long raw = loadCell.readRaw(10);
      if (raw == LONG_MIN) {
        sendLine(Protocol::encodeError("load_cell_not_ready"));
      } else {
        sendLine(Protocol::encodeRaw(raw));
      }
      return;
    }
    case Protocol::Command::Tare:
      loadCell.tare();
      sendLine(Protocol::encodeStatus("tared"));
      return;
    case Protocol::Command::GetCalibration:
      sendLine(Protocol::encodeCalibration(loadCell.scaleFactor()));
      return;
    case Protocol::Command::SetCalibration:
      if (msg.arg1 <= 0.0f) {
        sendLine(Protocol::encodeError("invalid_calibration_factor"));
        return;
      }
      loadCell.setScaleFactor(msg.arg1);
      sendLine(Protocol::encodeCalibration(loadCell.scaleFactor()));
      return;
    case Protocol::Command::Calibrate: {
      if (msg.arg1 <= 0.0f) {
        sendLine(Protocol::encodeError("invalid_known_weight"));
        return;
      }

      float factor = 0.0f;
      long raw = 0;
      if (!loadCell.calibrateWithKnownWeight(msg.arg1, 10, &factor, &raw)) {
        sendLine(Protocol::encodeError("calibration_failed"));
        return;
      }

      sendLine(Protocol::encodeCalibrationApplied(factor, msg.arg1, raw));
      return;
    }
    case Protocol::Command::PlayTone: {
      const int frequency = msg.arg1 > 0 ? static_cast<int>(msg.arg1) : 880;
      const int durationMs = msg.arg2 > 0 ? static_cast<int>(msg.arg2) : 0;
      speaker.playTone(frequency, 128);
      toneStopAtMs = durationMs > 0 ? millis() + durationMs : 0;
      sendLine(Protocol::encodeStatus("tone_started"));
      return;
    }
    case Protocol::Command::StopTone:
      speaker.stop();
      toneStopAtMs = 0;
      sendLine(Protocol::encodeStatus("tone_stopped"));
      return;
    case Protocol::Command::Unknown:
      sendLine(Protocol::encodeError("unknown_command"));
      return;
  }
}

void handleSerial() {
  while (Serial.available() > 0) {
    Protocol::Message message;
    const char c = static_cast<char>(Serial.read());
    if (parser.push(c, &message)) {
      handleCommand(message);
    }
  }
}

void pushPeriodicWeight() {
  const unsigned long now = millis();
  if (now < nextWeightPushAtMs) return;
  nextWeightPushAtMs = now + 500;

  const float grams = loadCell.readGrams(3);
  if (!isnan(grams)) sendLine(Protocol::encodeWeight(grams));
}

void updateToneTimer() {
  if (toneStopAtMs == 0) return;
  if (millis() < toneStopAtMs) return;
  speaker.stop();
  toneStopAtMs = 0;
  sendLine(Protocol::encodeStatus("tone_stopped_timeout"));
}
}  // namespace

void setup() {
  Serial.begin(115200);
  delay(400);

  speaker.begin(PinConfig::kSpeakerPwm, PinConfig::kSpeakerChannel);

  loadCell.begin(PinConfig::kHx711Data, PinConfig::kHx711Clock);
  loadCell.setScaleFactor(1.0f);
  loadCell.tare(20);

  sendLine(Protocol::encodeStatus("booted"));
}

void loop() {
  handleSerial();
  pushPeriodicWeight();
  updateToneTimer();
  delay(5);
}
