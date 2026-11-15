#!/bin/bash
# Builds KweenB's own sound device: a build of BlackHole (GPL-3.0,
# https://github.com/ExistentialAudio/BlackHole) under KweenB's name.
# A DAW plays to the device "KweenB Swarm"; KweenB picks the channels up
# and sends them to the bees.
#
#   sound-device/build.sh
#
# The result is resources/sound-device/KweenBSwarm.driver. It needs the
# compiler of the Xcode command line tools, nothing else. To sign it for
# other computers set SIGN_IDENTITY to a "Developer ID Application" identity;
# without it the driver is signed for this computer only.
set -euo pipefail

BLACKHOLE_VERSION="v0.7.1"
BLACKHOLE_REPO="https://github.com/ExistentialAudio/BlackHole.git"

DRIVER_NAME="KweenBSwarm"
DEVICE_NAME="KweenB Swarm"
BUNDLE_ID="be.aifoon.kweenb.sounddevice"
MANUFACTURER="aifoon"
CHANNELS=64
SAMPLE_RATES="44100,48000"
# Tells this driver apart from every other build of BlackHole on a computer
FACTORY_UUID="10ba7018-c39f-4630-9aed-7d3272e12ab2"
MIN_MACOS="11.0"

HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/../resources/sound-device"
WORK="${WORK_DIR:-$HERE/.work}"

rm -rf "$WORK"
mkdir -p "$WORK"
git -c advice.detachedHead=false clone --quiet --depth 1 --branch "$BLACKHOLE_VERSION" "$BLACKHOLE_REPO" "$WORK/BlackHole"

DRIVER="$WORK/$DRIVER_NAME.driver"
mkdir -p "$DRIVER/Contents/MacOS" "$DRIVER/Contents/Resources"

# BlackHole is one C file; its names are set with these definitions
clang -bundle -Os -Wno-format-extra-args \
  -arch arm64 -arch x86_64 -mmacosx-version-min="$MIN_MACOS" \
  -DkDriver_Name="\"$DRIVER_NAME\"" \
  -DkPlugIn_BundleID="\"$BUNDLE_ID\"" \
  -DkPlugIn_Icon="\"$DRIVER_NAME.icns\"" \
  -DkHas_Driver_Name_Format=false \
  -DkDevice_Name="\"$DEVICE_NAME\"" \
  -DkDevice2_Name="\"$DEVICE_NAME Mirror\"" \
  -DkManufacturer_Name="\"$MANUFACTURER\"" \
  -DkNumber_Of_Channels="$CHANNELS" \
  -DkSampleRates="$SAMPLE_RATES" \
  -framework CoreAudio -framework CoreFoundation -framework Accelerate \
  -o "$DRIVER/Contents/MacOS/$DRIVER_NAME" \
  "$WORK/BlackHole/BlackHole/BlackHole.c"

cp "$HERE/../buildAssets/mac/icon.icns" "$DRIVER/Contents/Resources/$DRIVER_NAME.icns"
cp "$WORK/BlackHole/LICENSE" "$DRIVER/Contents/Resources/LICENSE"

cat > "$DRIVER/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>English</string>
	<key>CFBundleExecutable</key>
	<string>$DRIVER_NAME</string>
	<key>CFBundleIdentifier</key>
	<string>$BUNDLE_ID</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$DEVICE_NAME</string>
	<key>CFBundlePackageType</key>
	<string>BNDL</string>
	<key>CFBundleShortVersionString</key>
	<string>${BLACKHOLE_VERSION#v}</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleSupportedPlatforms</key>
	<array>
		<string>MacOSX</string>
	</array>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSMinimumSystemVersion</key>
	<string>$MIN_MACOS</string>
	<key>CFPlugInFactories</key>
	<dict>
		<key>$FACTORY_UUID</key>
		<string>BlackHole_Create</string>
	</dict>
	<key>CFPlugInTypes</key>
	<dict>
		<key>443ABAB8-E7B3-491A-B985-BEB9187030DB</key>
		<array>
			<string>$FACTORY_UUID</string>
		</array>
	</dict>
</dict>
</plist>
PLIST
plutil -lint "$DRIVER/Contents/Info.plist" > /dev/null

if [ -n "${SIGN_IDENTITY:-}" ]; then
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$DRIVER"
else
  codesign --force --sign - "$DRIVER"
fi
codesign --verify --strict "$DRIVER"

# the small tools KweenB lists the sound devices of the Mac with and shows
# how loud their channels are
for TOOL in list-devices level-meter; do
  clang -Os -arch arm64 -arch x86_64 -mmacosx-version-min="$MIN_MACOS" \
    -framework CoreAudio -framework CoreFoundation \
    -o "$WORK/$TOOL" "$HERE/$TOOL.c"
  if [ -n "${SIGN_IDENTITY:-}" ]; then
    codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$WORK/$TOOL"
  else
    codesign --force --sign - "$WORK/$TOOL"
  fi
done

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$DRIVER" "$OUT/"
cp "$WORK/list-devices" "$WORK/level-meter" "$OUT/"
cp "$WORK/BlackHole/LICENSE" "$OUT/LICENSE-BlackHole"
echo "$BLACKHOLE_VERSION" > "$OUT/BLACKHOLE_VERSION"
echo "Built $OUT/$DRIVER_NAME.driver ($CHANNELS channels, BlackHole $BLACKHOLE_VERSION)"
