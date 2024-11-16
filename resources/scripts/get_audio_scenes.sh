#!/bin/bash

# Default configurations
PRIVATE_KEY_PATH="~/.ssh/kweenb"
REMOTE_BASE_PATH="/home/pi/pd-bee/files"
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

# Function to process a single IP
process_ip() {
    local IP=$1
    local LAST_OCTET
    LAST_OCTET=$(echo "$IP" | awk -F '.' '{print $4}')
    local BEE_ID="${LAST_OCTET: -2}"  # Use last two digits of last octet as a string
    local AUDIO_SCENES="[]"

    # Fetch folder list into a variable
    FOLDER_LIST=$(ssh -o ConnectTimeout=$CONNECTION_TIMEOUT -i "$PRIVATE_KEY_PATH" "pi@$IP" "find $REMOTE_BASE_PATH -mindepth 1 -maxdepth 1 -type d" 2>/dev/null)

    # Process each folder in the list
    for FOLDER in $FOLDER_LIST; do
        FOLDER_NAME=$(basename "$FOLDER")
        DATA_JSON="$FOLDER/data.json"

        # Fetch data.json contents
        JSON_CONTENT=$(ssh -o ConnectTimeout=$CONNECTION_TIMEOUT -i "$PRIVATE_KEY_PATH" "pi@$IP" "cat $DATA_JSON" 2>/dev/null)

        # Skip if empty or invalid
        if [ -z "$JSON_CONTENT" ] || ! echo "$JSON_CONTENT" | jq empty 2>/dev/null; then
            continue
        fi

        # Parse JSON
        NAME=$(echo "$JSON_CONTENT" | jq -r '.name')
        OSC_ADDRESS=$(echo "$JSON_CONTENT" | jq -r '.oscAddress')
        LOCAL_FOLDER_PATH="$REMOTE_BASE_PATH/$FOLDER_NAME"

        # Append to AUDIO_SCENES array
        AUDIO_SCENES=$(echo "$AUDIO_SCENES" | jq --arg name "$NAME" --arg oscAddress "$OSC_ADDRESS" --arg localFolderPath "$LOCAL_FOLDER_PATH" \
            '. + [{"name": $name, "oscAddress": $oscAddress, "localFolderPath": $localFolderPath}]')
    done

    # Validate AUDIO_SCENES
    if ! echo "$AUDIO_SCENES" | jq empty 2>/dev/null; then
        AUDIO_SCENES="[]"
    fi

    # Output JSON for the current IP
    echo "{\"id\": $BEE_ID, \"audioScenes\": $AUDIO_SCENES}"
}

# Parallel processing: process each IP in the background
RESULTS=()
TEMP_DIR=$(mktemp -d)

for IP in "${IPS[@]}"; do
    {
        RESULT=$(process_ip "$IP")
        if echo "$RESULT" | jq empty 2>/dev/null; then
            echo "$RESULT" > "$TEMP_DIR/result_$IP.json"
        fi
    } &
done

# Wait for all background processes to finish
wait

# Combine results into a JSON array
for FILE in "$TEMP_DIR"/*.json; do
    [ -e "$FILE" ] && RESULTS+=("$(cat "$FILE")")
done

FINAL_JSON=$(printf '%s\n' "${RESULTS[@]}" | jq -s '.')
rm -rf "$TEMP_DIR"  # Clean up temporary directory

# Output final JSON
echo "$FINAL_JSON"
