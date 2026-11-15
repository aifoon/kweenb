// Prints how loud every channel of a sound device is, about 15 times a
// second, as one JSON list of peaks (0 - 1) per line:
//   level-meter <uid of the device>
//   [0.000,0.412,0.007,...]
// It only listens: nothing is recorded or changed. It stops when its input
// closes (KweenB went away) or when it is told to stop.
// Built by sound-device/build.sh into resources/sound-device/level-meter.
#include <CoreAudio/CoreAudio.h>
#include <CoreFoundation/CoreFoundation.h>
#include <math.h>
#include <poll.h>
#include <stdatomic.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_CHANNELS 256
#define INTERVAL_MS 66

// the loudest sample per channel since the last line, as the bits of a float
static _Atomic uint32_t peaks[MAX_CHANNELS];
static UInt32 channelCount = 0;

static void notePeak(UInt32 channel, float value) {
  if (channel >= MAX_CHANNELS) return;
  float magnitude = fabsf(value);
  uint32_t bits;
  memcpy(&bits, &magnitude, sizeof(bits));
  uint32_t current = atomic_load_explicit(&peaks[channel], memory_order_relaxed);
  // positive floats compare like their bits
  while (bits > current &&
         !atomic_compare_exchange_weak_explicit(&peaks[channel], &current, bits, memory_order_relaxed, memory_order_relaxed)) {
  }
}

static OSStatus listen(AudioObjectID device, const AudioTimeStamp *now, const AudioBufferList *input,
                       const AudioTimeStamp *inputTime, AudioBufferList *output, const AudioTimeStamp *outputTime,
                       void *context) {
  if (!input) return noErr;
  UInt32 channel = 0;
  for (UInt32 b = 0; b < input->mNumberBuffers; b++) {
    const AudioBuffer *buffer = &input->mBuffers[b];
    UInt32 channels = buffer->mNumberChannels;
    if (!buffer->mData || channels == 0) continue;
    const float *samples = (const float *)buffer->mData;
    UInt32 frames = buffer->mDataByteSize / (sizeof(float) * channels);
    for (UInt32 f = 0; f < frames; f++)
      for (UInt32 c = 0; c < channels; c++) notePeak(channel + c, samples[f * channels + c]);
    channel += channels;
  }
  return noErr;
}

static UInt32 inputChannelsOf(AudioObjectID device) {
  AudioObjectPropertyAddress address = {kAudioDevicePropertyStreamConfiguration, kAudioObjectPropertyScopeInput,
                                        kAudioObjectPropertyElementMain};
  UInt32 size = 0;
  if (AudioObjectGetPropertyDataSize(device, &address, 0, NULL, &size) != noErr || size == 0) return 0;
  AudioBufferList *buffers = (AudioBufferList *)malloc(size);
  UInt32 channels = 0;
  if (AudioObjectGetPropertyData(device, &address, 0, NULL, &size, buffers) == noErr)
    for (UInt32 i = 0; i < buffers->mNumberBuffers; i++) channels += buffers->mBuffers[i].mNumberChannels;
  free(buffers);
  return channels;
}

int main(int argc, char **argv) {
  if (argc != 2) {
    fprintf(stderr, "usage: level-meter <uid of the device>\n");
    return 2;
  }
  CFStringRef uid = CFStringCreateWithCString(NULL, argv[1], kCFStringEncodingUTF8);
  AudioObjectPropertyAddress translate = {kAudioHardwarePropertyTranslateUIDToDevice, kAudioObjectPropertyScopeGlobal,
                                          kAudioObjectPropertyElementMain};
  AudioObjectID device = kAudioObjectUnknown;
  UInt32 size = sizeof(device);
  if (!uid || AudioObjectGetPropertyData(kAudioObjectSystemObject, &translate, sizeof(uid), &uid, &size, &device) != noErr ||
      device == kAudioObjectUnknown) {
    fprintf(stderr, "there is no sound device %s\n", argv[1]);
    return 3;
  }
  channelCount = inputChannelsOf(device);
  if (channelCount == 0) {
    fprintf(stderr, "that sound device has nothing to listen to\n");
    return 4;
  }
  if (channelCount > MAX_CHANNELS) channelCount = MAX_CHANNELS;

  AudioDeviceIOProcID proc = NULL;
  if (AudioDeviceCreateIOProcID(device, listen, NULL, &proc) != noErr || AudioDeviceStart(device, proc) != noErr) {
    fprintf(stderr, "the sound device can not be listened to\n");
    return 5;
  }

  struct pollfd input = {STDIN_FILENO, POLLIN, 0};
  for (;;) {
    // wait for the next line; an input that closed means KweenB is gone
    if (poll(&input, 1, INTERVAL_MS) > 0) {
      char discard[64];
      if (read(STDIN_FILENO, discard, sizeof(discard)) <= 0) break;
    }
    putchar('[');
    for (UInt32 c = 0; c < channelCount; c++) {
      uint32_t bits = atomic_exchange_explicit(&peaks[c], 0, memory_order_relaxed);
      float peak;
      memcpy(&peak, &bits, sizeof(peak));
      if (!(peak >= 0)) peak = 0;
      if (peak > 1) peak = 1;
      printf(c == 0 ? "%.3f" : ",%.3f", peak);
    }
    puts("]");
    if (fflush(stdout) != 0) break;
  }

  AudioDeviceStop(device, proc);
  AudioDeviceDestroyIOProcID(device, proc);
  return 0;
}
