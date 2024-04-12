#!/bin/bash

# Host to ping, e.g., google.com
host=$1

# Number of ping attempts
count=3

# Ping the host and extract time values
ping_times=$(ping -c $count $host 2>/dev/null | grep time= | awk -F'time=' '{print $2}' | awk '{print $1}')

# Initialize total time to 0
total_time=0

# Add up all the times
for time in $ping_times; do
    total_time=$(echo $total_time + $time | bc)
done

# Calculate average
average_time=$(echo "scale=2; $total_time / $count" | bc)

# Return the average time
echo $average_time
