#!/bin/bash

# Default path to the private key
PRIVATE_KEY_PATH="${HOME}/.ssh/kweenb"

# Maximum connection timeout in seconds
SSH_TIMEOUT=3

# Default action type (none specified)
ACTION_TYPE=-1

# Usage function
usage() {
    echo "Usage: $0 -k <private_key_path> -t <action_type> <device1> <device2> ..."
    echo "  Where action_type:"
    echo "    0: Shutdown all devices"
    echo "    1: Restart all devices"
    exit 1
}

# Parse options
while getopts "k:t:" opt; do
    case $opt in
        k)
            PRIVATE_KEY_PATH=$OPTARG
            ;;
        t)
            ACTION_TYPE=$OPTARG
            ;;
        *)
            usage
            ;;
    esac
done

shift $((OPTIND -1))

# Validate arguments
if [[ "$ACTION_TYPE" != "0" && "$ACTION_TYPE" != "1" || "$#" -eq 0 ]]; then
    usage
fi

# Determine action command
if [[ "$ACTION_TYPE" == "0" ]]; then
    ACTION_COMMAND="sudo shutdown -h now"
    ACTION_NAME="Shutting down"
elif [[ "$ACTION_TYPE" == "1" ]]; then
    ACTION_COMMAND="sudo reboot"
    ACTION_NAME="Restarting"
fi

# Launch all SSH commands in true parallel mode
for device in "$@"; do
    echo "${ACTION_NAME} device: $device"

    # Launch SSH in background with no wait
    (ssh -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ConnectTimeout=$SSH_TIMEOUT \
        -o BatchMode=yes \
        -i "$PRIVATE_KEY_PATH" \
        "pi@$device" "$ACTION_COMMAND" </dev/null &>/dev/null) &

    # Small delay to prevent SSH connection flood
    sleep 0.1
done

# Don't wait for processes to complete - they're truly detached now
echo "All actions have been initiated."