#!/bin/bash

# Default configurations
PRIVATE_KEY_PATH="${HOME}/.ssh/kweenb"
SSH_USER="pi"
CONNECTION_TIMEOUT=5

# Usage function
usage() {
    echo "Usage: $0 [-k <private_key_path>] [-u <ssh_user>] [-t <timeout>] <ip1> <ip2> ..."
    echo "Example: $0 -u pi -t 3 192.168.1.100 192.168.1.101"
    exit 1
}

# Parse options
while getopts "k:u:t:" opt; do
    case $opt in
        k) PRIVATE_KEY_PATH=$OPTARG ;;
        u) SSH_USER=$OPTARG ;;
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

# Check disk space on each host
for IP in "${IPS[@]}"; do
    {
        DISK_SPACE=$(ssh -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=$CONNECTION_TIMEOUT -i "$PRIVATE_KEY_PATH" "$SSH_USER@$IP" "df -BM / | awk 'NR==2 {gsub(/M/, \"\", \$4); print \$4}'" 2>/dev/null)
        if [ -n "$DISK_SPACE" ]; then
            echo "{\"ipAddress\":\"$IP\",\"remainingDiskSpace\":\"$DISK_SPACE\"}" > "$TEMP_DIR/result_$IP.json"
        fi
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