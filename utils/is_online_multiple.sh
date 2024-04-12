#!/bin/bash

# Check if at least one IP address is provided
if [ $# -eq 0 ]; then
    echo "[]"
    exit 1
fi

# Read all IP addresses from the command line
ip_addresses=("$@")

# List of IP addresses as an array
# ip_addresses=$1
# "192.168.50.102" "192.168.50.103" "192.168.50.104" "192.168.50.105" "192.168.50.106" "192.168.50.107" "192.168.50.108" "192.168.50.109" "192.168.50.110" "192.168.50.111" "192.168.50.112" "192.168.50.113" "192.168.50.114" "192.168.50.115" "192.168.50.116" "192.168.50.101" "192.168.50.117" "192.168.50.118" "192.168.50.119" "192.168.50.120" "192.168.50.121" "192.168.50.122"

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