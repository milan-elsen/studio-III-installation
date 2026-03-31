#include "Speaker.h"

void Speaker::begin(int pwmPin, int channel) {
  pwmPin_ = pwmPin;
  channel_ = channel;
  ledcSetup(channel_, 2000, 8);
  ledcAttachPin(pwmPin_, channel_);
  stop();
}

void Speaker::playTone(int frequencyHz, int duty) {
  if (frequencyHz <= 0) return;
  ledcWrite(channel_, duty);
  ledcWriteTone(channel_, frequencyHz);
  isPlaying_ = true;
}

void Speaker::stop() {
  ledcWriteTone(channel_, 0);
  ledcWrite(channel_, 0);
  isPlaying_ = false;
}

bool Speaker::isPlaying() const { return isPlaying_; }

