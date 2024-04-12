#!/bin/bash

# Client's IP address or hostname
client_ip=$1

# Timeout in seconds (for example, 1 second)
timeout=1

# Ping the client with a timeout
ping -c 1 -W $timeout $client_ip > /dev/null 2>&1

# Check the exit status of the ping command
if [ $? -eq 0 ]; then
    echo true
else
    echo false
fi
