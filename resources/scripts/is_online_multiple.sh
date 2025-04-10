#!/bin/bash

# Debug mode (set to false by default)
DEBUG=false

# Timeout in seconds for each ping (2 seconds)
TIMEOUT=2

# Number of ping attempts
PING_COUNT=1

# OS detection
OS=$(uname)

# Create a temporary directory to store results
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Debug function - only prints if DEBUG is true
debug() {
    if [ "$DEBUG" = true ]; then
        echo "DEBUG: $1" >&2
    fi
}

# Function to check if a host is online
check_online() {
    local ip=$1
    local result_file="$TEMP_DIR/$ip.result"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")  # ISO 8601 format

    # Ping with OS-specific options
    if [[ "$OS" == "Darwin" ]]; then
        # macOS
        ping_output=$(ping -c $PING_COUNT -t $TIMEOUT $ip 2>/dev/null)
    else
        # Linux and others
        ping_output=$(ping -c $PING_COUNT -W $TIMEOUT $ip 2>/dev/null)
    fi
    ping_success=$?

    debug "Checking $ip - Result: $ping_success"
    if [ "$DEBUG" = true ]; then
        echo "$ping_output" >&2
    fi

    # Check if the ping was successful
    if [ $ping_success -eq 0 ] && echo "$ping_output" | grep -q "time="; then
        debug "$ip is online"
        echo "{\"ipAddress\":\"$ip\",\"responseTime\":\"$timestamp\",\"isOnline\":true}" > "$result_file"
    else
        debug "$ip is offline"
        echo "{\"ipAddress\":\"$ip\",\"responseTime\":\"$timestamp\",\"isOnline\":false}" > "$result_file"
    fi
}

# Parse for debug flag option
for arg in "$@"; do
    if [ "$arg" = "--debug" ]; then
        DEBUG=true
        # Remove --debug from arguments
        set -- "${@/--debug/}"
        break
    fi
done

# Validate arguments
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 [--debug] <host1> <host2> ..."
    echo "[]"
    exit 1
fi

# Start checking each host in parallel
for ip in "$@"; do
    # Skip empty arguments (could happen when removing --debug)
    if [ -z "$ip" ]; then
        continue
    fi
    check_online "$ip" &
done

# Wait for all background processes to complete
wait

# Collect all results into a JSON array
echo -n "["
first=true
for ip in "$@"; do
    # Skip empty arguments
    if [ -z "$ip" ]; then
        continue
    fi
    if [ -f "$TEMP_DIR/$ip.result" ]; then
        if ! $first; then
            echo -n ","
        fi
        cat "$TEMP_DIR/$ip.result"
        first=false
    fi
done
echo "]"