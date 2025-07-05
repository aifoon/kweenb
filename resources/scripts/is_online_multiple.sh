#!/bin/bash

# Debug mode (set to false by default)
DEBUG=false

# Timeout in seconds for each ping (increased for better reliability)
TIMEOUT=4

# Number of ping attempts per retry
PING_COUNT=2

# Maximum number of retry attempts for failed hosts
MAX_RETRIES=2

# Initial delay in seconds before first retry (exponential backoff)
INITIAL_RETRY_DELAY=1

# Enable TCP fallback check (tries common ports if ping fails)
ENABLE_TCP_FALLBACK=true

# TCP ports to test as fallback (space-separated)
TCP_FALLBACK_PORTS="80 443 22"

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

# Function to check TCP port connectivity
check_tcp_port() {
    local ip=$1
    local port=$2
    local timeout=${3:-3}

    debug "Testing TCP connection to $ip:$port"
    timeout $timeout bash -c "</dev/tcp/$ip/$port" 2>/dev/null
    return $?
}

# Function to perform TCP fallback checks
tcp_fallback_check() {
    local ip=$1

    if [ "$ENABLE_TCP_FALLBACK" = true ]; then
        debug "Performing TCP fallback check for $ip"
        for port in $TCP_FALLBACK_PORTS; do
            if check_tcp_port "$ip" "$port"; then
                debug "$ip responds on TCP port $port"
                return 0
            fi
        done
        debug "$ip failed all TCP fallback tests"
    fi
    return 1
}

# Function to check if a host is online with retries
check_online() {
    local ip=$1
    local result_file="$TEMP_DIR/$ip.result"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")  # ISO 8601 format
    local retry_count=0
    local ping_success=1
    local ping_output=""
    local is_online=false

    debug "Starting connectivity check for $ip"

    # Try multiple times with exponential backoff
    while [ $retry_count -lt $MAX_RETRIES ] && [ $is_online = false ]; do
        if [ $retry_count -gt 0 ]; then
            local delay=$((INITIAL_RETRY_DELAY * (2 ** (retry_count - 1))))
            debug "Retry $retry_count for $ip after ${delay}s delay"
            sleep $delay
        fi

        debug "Ping attempt $((retry_count + 1)) for $ip"

        # Ping with OS-specific options
        if [[ "$OS" == "Darwin" ]]; then
            # macOS
            ping_output=$(ping -c $PING_COUNT -t $TIMEOUT $ip 2>/dev/null)
        else
            # Linux and others
            ping_output=$(ping -c $PING_COUNT -W $TIMEOUT $ip 2>/dev/null)
        fi
        ping_success=$?

        debug "Ping attempt $((retry_count + 1)) for $ip - Exit code: $ping_success"
        if [ "$DEBUG" = true ]; then
            echo "PING OUTPUT: $ping_output" >&2
        fi

        # Check if the ping was successful
        if [ $ping_success -eq 0 ] && echo "$ping_output" | grep -q "time="; then
            debug "$ip is online via ping (attempt $((retry_count + 1)))"
            is_online=true
            break
        fi

        retry_count=$((retry_count + 1))
    done

    # If ping failed completely, try TCP fallback
    if [ $is_online = false ]; then
        debug "All ping attempts failed for $ip, trying TCP fallback"
        if tcp_fallback_check "$ip"; then
            debug "$ip is online via TCP fallback"
            is_online=true
        fi
    fi

    # Write result to file
    if [ $is_online = true ]; then
        debug "Final result: $ip is ONLINE"
        echo "{\"ipAddress\":\"$ip\",\"responseTime\":\"$timestamp\",\"isOnline\":true}" > "$result_file"
    else
        debug "Final result: $ip is OFFLINE"
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

# Display configuration in debug mode
if [ "$DEBUG" = true ]; then
    echo "DEBUG: Configuration:" >&2
    echo "DEBUG:   Timeout: ${TIMEOUT}s" >&2
    echo "DEBUG:   Ping count: $PING_COUNT" >&2
    echo "DEBUG:   Max retries: $MAX_RETRIES" >&2
    echo "DEBUG:   Initial retry delay: ${INITIAL_RETRY_DELAY}s" >&2
    echo "DEBUG:   TCP fallback: $ENABLE_TCP_FALLBACK" >&2
    if [ "$ENABLE_TCP_FALLBACK" = true ]; then
        echo "DEBUG:   TCP fallback ports: $TCP_FALLBACK_PORTS" >&2
    fi
    echo "DEBUG:   OS: $OS" >&2
    echo "DEBUG:   Temp dir: $TEMP_DIR" >&2
    echo "DEBUG: Starting checks for: $*" >&2
fi

# Start checking each host in parallel
for ip in "$@"; do
    # Skip empty arguments (could happen when removing --debug)
    if [ -z "$ip" ]; then
        continue
    fi
    debug "Starting background check for $ip"
    check_online "$ip" &
done

# Wait for all background processes to complete
debug "Waiting for all background processes to complete"
wait
debug "All checks completed"

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
    else
        debug "WARNING: No result file found for $ip"
    fi
done
echo "]"

debug "Script completed"