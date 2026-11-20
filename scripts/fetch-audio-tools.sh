#!/bin/bash
#
# Puts Jack and JackTrip in resources/, ready to be packed inside KweenB.
#
# KweenB ships these two itself, so it needs no internet and no separate
# Jack installation on the computer it runs on. This script fetches the
# official releases once (on the computer that builds KweenB) and makes
# them work from inside the app:
#
#   resources/jack/jackd, jack_lsp, ...   the Jack programs
#   resources/jack/lib/                   Jack's libraries
#   resources/jack/lib/jack/              Jack's drivers (CoreAudio, ...)
#   resources/jacktrip/jacktrip
#
# The official Jack expects its libraries in /usr/local/lib. Here every
# program is pointed to the lib folder next to it instead.
#
# Usage: scripts/fetch-audio-tools.sh [--force]

set -euo pipefail

JACK_VERSION="1.9.22"
JACK_URL="https://github.com/jackaudio/jack2-releases/releases/download/v${JACK_VERSION}/jack2-macOS-universal-v${JACK_VERSION}.tar.gz"
JACK_SHA256="ff6d344de7650a92b70c08a8df2411c71fc30cc1a8c286e82b93220c4b0d04c8"

JACKTRIP_VERSION="3.0.1"
JACKTRIP_URL="https://github.com/jacktrip/jacktrip/releases/download/v${JACKTRIP_VERSION}/JackTrip-v${JACKTRIP_VERSION}-macOS-x64-nogui-binary.zip"
JACKTRIP_SHA256="bc7c9eea653b6901ce968d54dfbe1023ba30ebdc5586af4449d5a94e0cd1fbfb"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JACK_DIR="$ROOT/resources/jack"
JACKTRIP_DIR="$ROOT/resources/jacktrip"
MARK="jack ${JACK_VERSION}, jacktrip ${JACKTRIP_VERSION}, self-contained 1"

if [ "$(uname)" != "Darwin" ]; then
  echo "This script prepares the macOS version and must run on a Mac." >&2
  exit 1
fi

if [ "${1:-}" != "--force" ] && [ "$(cat "$JACK_DIR/bundled.txt" 2>/dev/null)" = "$MARK" ] \
  && [ -x "$JACK_DIR/jackd" ] && [ -x "$JACKTRIP_DIR/jacktrip" ]; then
  echo "Jack and JackTrip are already in resources/ ($MARK)."
  exit 0
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

fetch() { # url, sha256, target
  echo "== Downloading $(basename "$1")"
  curl -fL --progress-bar -o "$3" "$1"
  local sum
  sum="$(shasum -a 256 "$3" | cut -d' ' -f1)"
  if [ "$sum" != "$2" ]; then
    echo "The download of $1 is not the expected file (checksum $sum)." >&2
    exit 1
  fi
}

fetch "$JACK_URL" "$JACK_SHA256" "$WORK/jack.tar.gz"
fetch "$JACKTRIP_URL" "$JACKTRIP_SHA256" "$WORK/jacktrip.zip"

echo "== Unpacking"
mkdir "$WORK/jack" "$WORK/jacktrip"
tar -xzf "$WORK/jack.tar.gz" -C "$WORK/jack"
pkgutil --expand-full "$WORK/jack/jack2-osx-${JACK_VERSION}.pkg" "$WORK/pkg"
PAYLOAD="$WORK/pkg/jack2-osx-root.pkg/Payload"
unzip -q "$WORK/jacktrip.zip" -d "$WORK/jacktrip"

echo "== Putting Jack and JackTrip in resources/"
rm -rf "$JACK_DIR" "$JACKTRIP_DIR"
mkdir -p "$JACK_DIR/lib/jack" "$JACKTRIP_DIR"

cp "$PAYLOAD"/bin/* "$JACK_DIR/"
for lib in libjack libjackserver libjacknet; do
  cp "$PAYLOAD/lib/$lib.0.dylib" "$JACK_DIR/lib/"
  # JackTrip looks for "libjack.dylib", the programs for the full name
  ln -s "$lib.0.dylib" "$JACK_DIR/lib/$lib.dylib"
  ln -s "$lib.0.dylib" "$JACK_DIR/lib/$lib.0.1.0.dylib"
done
cp "$PAYLOAD"/lib/jack/* "$JACK_DIR/lib/jack/"
cp "$WORK/jacktrip/jacktrip" "$JACKTRIP_DIR/jacktrip"
chmod 755 "$JACKTRIP_DIR/jacktrip"
# the licences travel with the programs
cp "$WORK/pkg/Resources/COPYING" "$JACK_DIR/LICENSE-Jack"
cp "$WORK/jacktrip/LICENSE.md" "$JACKTRIP_DIR/LICENSE-JackTrip.md"
cp -R "$WORK/jacktrip/LICENSES" "$JACKTRIP_DIR/LICENSES"

# Point one file to the libraries at "where" instead of /usr/local/lib
relocate() { # file, where
  local file="$1" where="$2" lib
  for lib in libjack libjackserver libjacknet; do
    install_name_tool -change "/usr/local/lib/$lib.0.1.0.dylib" \
      "$where/$lib.0.dylib" "$file" 2>/dev/null
  done
}

echo "== Pointing everything to the libraries inside the app"
for file in "$JACK_DIR"/jack*; do
  relocate "$file" "@executable_path/lib"
done
for lib in libjack libjackserver libjacknet; do
  install_name_tool -id "@executable_path/lib/$lib.0.dylib" \
    "$JACK_DIR/lib/$lib.0.dylib" 2>/dev/null
  relocate "$JACK_DIR/lib/$lib.0.dylib" "@executable_path/lib"
done
# the drivers are loaded by jackd, so "the program" is jackd for them too
for file in "$JACK_DIR"/lib/jack/*; do
  relocate "$file" "@executable_path/lib"
done

# Changing a file breaks its signature; macOS refuses to start it then.
# A plain local signature is enough here: building the app signs for real.
echo "== Signing"
for file in "$JACK_DIR"/jack* "$JACK_DIR"/lib/*.0.dylib "$JACK_DIR"/lib/jack/* \
  "$JACKTRIP_DIR/jacktrip"; do
  codesign --force --sign - "$file" 2>/dev/null
done

# Nothing may still look in /usr/local/lib
LEFT="$(for file in "$JACK_DIR"/jack* "$JACK_DIR"/lib/*.0.dylib "$JACK_DIR"/lib/jack/*; do
  otool -L "$file" | grep -q "^[[:space:]]*/usr/local/lib" && echo "$file"
done || true)"
if [ -n "$LEFT" ]; then
  echo "These files still look for Jack in /usr/local/lib:" >&2
  echo "$LEFT" >&2
  exit 1
fi

echo "$JACK_VERSION" > "$JACK_DIR/version.txt"
echo "$JACKTRIP_VERSION" > "$JACKTRIP_DIR/version.txt"
echo "$MARK" > "$JACK_DIR/bundled.txt"

echo
echo "Done: Jack $JACK_VERSION and JackTrip $JACKTRIP_VERSION are in resources/."
