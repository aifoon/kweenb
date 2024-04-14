#!/bin/bash

# Check if at least one IP address is provided
if [ $# -eq 0 ]; then
    echo "[]"
    exit 1
fi

# Read all IP addresses from the command line
ip_addresses=("$@")

# Timeout in seconds for each ping
timeout=2000  # Each ping will wait up to 2 seconds for a response

# Temporary file for storing output
output_file=$(mktemp)

# Function to ping an IP address and return a JSON object
ping_ip() {
    local ip=$1
    # Ping the IP address with a timeout, counting only one packet
    local result=$(ping -c 1 -W $timeout $ip 2>&1)
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    # Check if the ping was successful
    if echo "$result" | grep -q "time="; then
        echo "{\"ipAddress\": \"$ip\", \"responseTime\": \"$timestamp\", \"isOnline\": true}," >> "$output_file"
    else
        echo "{\"ipAddress\": \"$ip\", \"responseTime\": \"$timestamp\", \"isOnline\": false}," >> "$output_file"
    fi
}

echo "["  # Start of JSON array

# Loop through IP addresses and ping each one in the background by calling the function
for ip in "${ip_addresses[@]}"; do
    ping_ip $ip &  # Background the function call, not the definition
done

# Wait for all background pinging processes to complete
wait

# Remove the last comma from the output to maintain valid JSON format
# Read from the temporary file, and use 'head' to avoid the final comma
sed '$ s/,$//' "$output_file"

echo "]"  # Start of JSON array

# Remove the temporary file
rm "$output_file"