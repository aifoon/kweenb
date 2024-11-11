#!/bin/bash

# Check if IP addresses are provided as arguments
if [ "$#" -eq 0 ]; then
    echo "No IP addresses provided. Usage: ./script.sh <IP1> <IP2> ..."
    exit 1
fi

# Array of IP addresses from command-line arguments
IP_ADDRESSES=("$@")

# SSH user and path to private key
USER="pi"
PRIVATE_KEY_PATH="~/.ssh/kweenb"

# Base command
BASE_COMMAND="jack_connect"

# Suppress all output
exec >/dev/null 2>&1

# Function to perform the SSH connection and run the command
connect_and_execute() {
    local IP=$1
    local LAST_OCTET=$(echo $IP | awk -F '.' '{print $4}')
    local BEE_ID="bee${LAST_OCTET: -2}"  # Use last two digits of last octet as a string
    local FULL_COMMAND="$BASE_COMMAND $BEE_ID:receive_1 pure_data:input_1"

    # Perform SSH and run the command
    ssh -i "$PRIVATE_KEY_PATH" -o StrictHostKeyChecking=no -o ControlMaster=auto \
        -o ControlPath="/tmp/%r@%h:%p" -o ControlPersist=5m "$USER@$IP" "$FULL_COMMAND" >/dev/null 2>&1
}

# Run the connect_and_execute function in parallel for each IP
for IP in "${IP_ADDRESSES[@]}"; do
    connect_and_execute "$IP" &
done

# Wait for all background jobs to complete
wait
