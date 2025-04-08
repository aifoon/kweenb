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

# Function to perform action on remote device
perform_action() {
    local device=$1
    local action_command=""

    if [[ "$ACTION_TYPE" == "0" ]]; then
        action_command="sudo shutdown -h now"
        echo "Shutting down device: $device"
    elif [[ "$ACTION_TYPE" == "1" ]]; then
        action_command="sudo reboot"
        echo "Restarting device: $device"
    fi

    ssh -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ConnectTimeout=$SSH_TIMEOUT \
        -i "$PRIVATE_KEY_PATH" \
        "pi@$device" "$action_command" </dev/null &>/dev/null &
}

# Iterate over devices and process in parallel
for device in "$@"; do
    perform_action "$device"
done

# Wait for all background processes to complete
wait

echo "All actions have been initiated."