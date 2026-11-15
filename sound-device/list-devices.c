// Lists the sound devices of this Mac as JSON, with the name Jack opens them
// by (uid) and how many channels can be recorded from them:
//   [{"name":"KweenB Swarm","uid":"KweenBSwarm_UID","inputChannels":32,"outputChannels":32}, ...]
// Built by sound-device/build.sh into resources/sound-device/list-devices.
#include <CoreAudio/CoreAudio.h>
#include <CoreFoundation/CoreFoundation.h>
#include <stdio.h>
#include <stdlib.h>

static void printJsonString(CFStringRef string) {
  char buffer[1024] = "";
  if (string) CFStringGetCString(string, buffer, sizeof(buffer), kCFStringEncodingUTF8);
  putchar('"');
  for (unsigned char *c = (unsigned char *)buffer; *c; c++) {
    if (*c == '"' || *c == '\\') printf("\\%c", *c);
    else if (*c < 0x20) printf("\\u%04x", *c);
    else putchar(*c);
  }
  putchar('"');
}

static CFStringRef stringOf(AudioObjectID device, AudioObjectPropertySelector selector) {
  AudioObjectPropertyAddress address = {selector, kAudioObjectPropertyScopeGlobal, kAudioObjectPropertyElementMain};
  CFStringRef value = NULL;
  UInt32 size = sizeof(value);
  if (AudioObjectGetPropertyData(device, &address, 0, NULL, &size, &value) != noErr) return NULL;
  return value;
}

static UInt32 channelsOf(AudioObjectID device, AudioObjectPropertyScope scope) {
  AudioObjectPropertyAddress address = {kAudioDevicePropertyStreamConfiguration, scope, kAudioObjectPropertyElementMain};
  UInt32 size = 0;
  if (AudioObjectGetPropertyDataSize(device, &address, 0, NULL, &size) != noErr || size == 0) return 0;
  AudioBufferList *buffers = (AudioBufferList *)malloc(size);
  UInt32 channels = 0;
  if (AudioObjectGetPropertyData(device, &address, 0, NULL, &size, buffers) == noErr)
    for (UInt32 i = 0; i < buffers->mNumberBuffers; i++) channels += buffers->mBuffers[i].mNumberChannels;
  free(buffers);
  return channels;
}

int main(void) {
  AudioObjectPropertyAddress address = {kAudioHardwarePropertyDevices, kAudioObjectPropertyScopeGlobal, kAudioObjectPropertyElementMain};
  UInt32 size = 0;
  if (AudioObjectGetPropertyDataSize(kAudioObjectSystemObject, &address, 0, NULL, &size) != noErr) return 1;
  UInt32 count = size / sizeof(AudioObjectID);
  AudioObjectID *devices = (AudioObjectID *)malloc(size);
  if (AudioObjectGetPropertyData(kAudioObjectSystemObject, &address, 0, NULL, &size, devices) != noErr) return 1;

  printf("[");
  for (UInt32 i = 0; i < count; i++) {
    CFStringRef name = stringOf(devices[i], kAudioObjectPropertyName);
    CFStringRef uid = stringOf(devices[i], kAudioDevicePropertyDeviceUID);
    if (i > 0) printf(",");
    printf("{\"name\":");
    printJsonString(name);
    printf(",\"uid\":");
    printJsonString(uid);
    printf(",\"inputChannels\":%u,\"outputChannels\":%u}",
           (unsigned)channelsOf(devices[i], kAudioObjectPropertyScopeInput),
           (unsigned)channelsOf(devices[i], kAudioObjectPropertyScopeOutput));
    if (name) CFRelease(name);
    if (uid) CFRelease(uid);
  }
  printf("]\n");
  free(devices);
  return 0;
}
