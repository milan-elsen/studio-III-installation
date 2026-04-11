#pragma once

#include <Arduino.h>

class Speaker {
 public:
  void begin(int pwmPin, int channel = 0);
  void playTone(int frequencyHz, int duty = 128);
  void stop();
  bool isPlaying() const;

 private:
  int pwmPin_ = -1;
  int channel_ = 0;
  bool isPlaying_ = false;
};

