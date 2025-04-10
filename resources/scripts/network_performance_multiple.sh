#!/bin/bash

# Debug mode (set to true to enable debug output, false to disable)
DEBUG=false

# Number of ping attempts per host
PING_COUNT=5

# Timeout in seconds per ping
PING_TIMEOUT=2

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

# Function to measure network performance for a single host
measure_performance() {
    local host=$1
    local result_file="$TEMP_DIR/$host.result"
    local max_retries=3
    local retry_count=0
    local success=false

    while [ $retry_count -lt $max_retries ] && [ "$success" = false ]; do
        # Ping the host with OS-specific options
        if [[ "$OS" == "Darwin" ]]; then
            # macOS
            ping_output=$(ping -c $PING_COUNT -t $PING_TIMEOUT $host 2>/dev/null)
        else
            # Linux and others
            ping_output=$(ping -c $PING_COUNT -W $PING_TIMEOUT $host 2>/dev/null)
        fi
        ping_success=$?

        # Debug - save full ping output only on the first try
        if [ $retry_count -eq 0 ]; then
            debug "Full ping output for $host:"
            if [ "$DEBUG" = true ]; then
                echo "$ping_output" >&2
            fi
        fi

        # Check if ping was successful
        if [ $ping_success -ne 0 ]; then
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                debug "Retry $retry_count for $host due to ping failure"
                sleep 0.5  # Short delay between retries
                continue
            else
                debug "All $max_retries retries failed for $host"
                echo "{\"ipAddress\":\"$host\",\"latency\":999.99}" > "$result_file"
                return
            fi
        fi

        # Extract times and calculate average - handle different OS output formats
        # This will work with both macOS and Linux ping output formats
        ping_times=$(echo "$ping_output" | grep -o "time=[0-9.]\+" | cut -d= -f2)

        # Debug output
        if [ $retry_count -eq 0 ]; then
            debug "Host $host ping times: $ping_times"
        fi

        # Count successful pings
        successful_pings=$(echo "$ping_times" | wc -w | tr -d ' ')

        if [ $successful_pings -eq 0 ]; then
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                debug "Retry $retry_count for $host due to no successful pings"
                sleep 0.5  # Short delay between retries
                continue
            else
                debug "All $max_retries retries failed to get ping times for $host"
                echo "{\"ipAddress\":\"$host\",\"latency\":999.99}" > "$result_file"
                return
            fi
        fi

        # Sum up times
        total_time=0
        for time in $ping_times; do
            # Verify we have a valid number
            if [[ $time =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
                total_time=$(echo "$total_time + $time" | bc -l)
            else
                debug "Invalid time format: $time"
            fi
        done

        # Calculate average (with 2 decimal precision)
        if [ "$successful_pings" -gt 0 ] && [ $(echo "$total_time > 0" | bc -l) -eq 1 ]; then
            average_time=$(echo "scale=2; $total_time / $successful_pings" | bc -l)
            success=true
        else
            # If we somehow got zero or empty results but ping succeeded
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                debug "Retry $retry_count for $host due to zero latency"
                sleep 0.5  # Short delay between retries
                continue
            else
                # After all retries, set a minimum value
                average_time="0.01"
                debug "Using minimum latency for $host after $max_retries retries"
                success=true
            fi
        fi

        # Output the result as JSON
        echo "{\"ipAddress\":\"$host\",\"latency\":$average_time}" > "$result_file"
    done
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
    exit 1
fi

# Start network performance check for each host in parallel
for host in "$@"; do
    # Skip empty arguments (could happen when removing --debug)
    if [ -z "$host" ]; then
        continue
    fi
    measure_performance "$host" &
done

# Wait for all background processes to complete
wait

# Only output the array if not in debug mode, always output to stdout
if [ "$DEBUG" = true ]; then
    debug "Results collected but not printing JSON in debug mode"
else
    # Collect all results into a JSON array
    echo -n "["
    first=true
    for host in "$@"; do
        # Skip empty arguments
        if [ -z "$host" ]; then
            continue
        fi
        if [ -f "$TEMP_DIR/$host.result" ]; then
            if ! $first; then
                echo -n ","
            fi
            cat "$TEMP_DIR/$host.result"
            first=false
        fi
    done
    echo "]"
fi