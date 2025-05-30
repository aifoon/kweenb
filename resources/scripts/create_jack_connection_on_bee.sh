#!/bin/bash

# Default path to the private key
PRIVATE_KEY_PATH="${HOME}/.ssh/kweenb"

# Function to display usage information
usage() {
    echo "Usage: $0 [-k PRIVATE_KEY_PATH] <IP1> <IP2> ..."
    exit 1
}

# Parse options
while getopts "k:" opt; do
    case $opt in
        k)
            PRIVATE_KEY_PATH=$OPTARG
            ;;
        *)
            usage
            ;;
    esac
done

# Remove parsed options from the arguments
shift $((OPTIND - 1))

# Check if IP addresses are provided as arguments
if [ "$#" -eq 0 ]; then
    usage
fi

# Array of IP addresses from command-line arguments
IP_ADDRESSES=("$@")

# SSH user and base command
USER="pi"
BASE_COMMAND="jack_connect"

# Suppress all output
exec >/dev/null 2>&1

# Function to perform the SSH connection, get the BEE_ID, and run the command
connect_and_execute() {
    local IP=$1

    # Create a single SSH connection that:
    # 1. Reads the BEE_ID from the file
    # 2. Makes sure it has the proper format (bee followed by 2 digits)
    # 3. Uses that BEE_ID to run the jack_connect command
    ssh -i "$PRIVATE_KEY_PATH" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ControlMaster=auto \
        -o ControlPath="/tmp/%r@%h:%p" \
        -o ControlPersist=5m \
        "$USER@$IP" "if [ -f /home/pi/.beeid ]; then
                        RAW_ID=\$(cat /home/pi/.beeid | tr -cd '0-9');
                        # Format to ensure it has leading zeros if needed (bee01, bee02, etc.)
                        BEE_ID=\"bee\$(printf '%02d' \$RAW_ID)\";
                     else
                        LAST_OCTET=\$(hostname -I | awk -F '.' '{print \$4}' | tr -cd '0-9');
                        # Format to ensure it has leading zeros if needed
                        BEE_ID=\"bee\$(printf '%02d' \$LAST_OCTET)\";
                     fi &&
                     $BASE_COMMAND \$BEE_ID:receive_1 pure_data:input_1" >/dev/null 2>&1
}

# Run the connect_and_execute function in parallel for each IP
for IP in "${IP_ADDRESSES[@]}"; do
    connect_and_execute "$IP" &
done

# Wait for all background jobs to complete
wait