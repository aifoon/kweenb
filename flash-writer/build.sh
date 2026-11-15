#!/bin/bash
# Builds the tool that writes an image to the storage of a speaker
# (resources/usbboot/flash-writer). It needs the compiler of the Xcode
# command line tools. To sign it for other computers set SIGN_IDENTITY to a
# "Developer ID Application" identity.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/../resources/usbboot/flash-writer"
clang -Os -Wall -arch arm64 -arch x86_64 -mmacosx-version-min=11.0 -o "$OUT" "$HERE/flash-writer.c"
if [ -n "${SIGN_IDENTITY:-}" ]; then
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$OUT"
else
  codesign --force --sign - "$OUT"
fi
echo "Built $OUT"
