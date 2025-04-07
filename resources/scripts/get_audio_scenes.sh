#!/bin/bash

# Default configurations
PRIVATE_KEY_PATH="${HOME}/.ssh/kweenb"
REMOTE_JSON_PATH="/home/pi/pd-bee/audioscenes_index.json"
CONNECTION_TIMEOUT=3

# Usage function
usage() {
    echo "Usage: $0 -k <private_key_path> -t <timeout> <ip1> <ip2> ..."
    exit 1
}

# Parse options
while getopts "k:t:" opt; do
    case $opt in
        k) PRIVATE_KEY_PATH=$OPTARG ;;
        t) CONNECTION_TIMEOUT=$OPTARG ;;
        *) usage ;;
    esac
done
shift $((OPTIND -1))

# Validate remaining arguments
if [ $# -lt 1 ]; then
    usage
fi

# Remaining arguments are IPs
IPS=("$@")
TEMP_DIR=$(mktemp -d)

# Fetch JSON data from each device
for IP in "${IPS[@]}"; do
    {
        scp -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=$CONNECTION_TIMEOUT -i "$PRIVATE_KEY_PATH" "pi@$IP:$REMOTE_JSON_PATH" "$TEMP_DIR/audioscenes_index_$IP.json" 2>/dev/null
    } &
done

# Wait for all background processes to finish
wait

# Combine results into a single JSON array
FINAL_JSON="["
FIRST=true
for FILE in "$TEMP_DIR"/*.json; do
    if [ -f "$FILE" ]; then
        CONTENT=$(<"$FILE")
        if [ "$FIRST" = true ]; then
            FINAL_JSON+="$CONTENT"
            FIRST=false
        else
            FINAL_JSON+=",$CONTENT"
        fi
    fi
done
FINAL_JSON+="]"

# Output final JSON to the terminal
echo "$FINAL_JSON"

# Cleanup
rm -rf "$TEMP_DIR"
