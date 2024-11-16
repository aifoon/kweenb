#!/bin/bash

# Default path to the private key
PRIVATE_KEY_PATH="~/.ssh/kweenb"

# Base path for allowed directories
BASE_PATH="/home/pi/pd-bee/files"

# Maximum connection timeout in seconds
SSH_TIMEOUT=3

# Usage function
usage() {
    echo "Usage: $0 -k <private_key_path> -d <directory_to_remove> <device1> <device2> ..."
    exit 1
}

# Parse options
while getopts "k:d:" opt; do
    case $opt in
        k)
            PRIVATE_KEY_PATH=$OPTARG
            ;;
        d)
            DIRECTORY_TO_REMOVE=$OPTARG
            ;;
        *)
            usage
            ;;
    esac
done

shift $((OPTIND -1))

# Validate arguments
if [[ -z "$DIRECTORY_TO_REMOVE" || "$#" -eq 0 ]]; then
    usage
fi

# Construct the full directory path
FULL_PATH="$BASE_PATH/$DIRECTORY_TO_REMOVE"

# Function to remove directory on a remote device
remove_directory() {
    local device=$1
    ssh -o ConnectTimeout=$SSH_TIMEOUT -i "$PRIVATE_KEY_PATH" "pi@$device" "rm -rf \"$FULL_PATH\"" </dev/null &>/dev/null &
}

# Iterate over devices and process in parallel
for device in "$@"; do
    remove_directory "$device"
done

# Wait for all background processes to complete
wait