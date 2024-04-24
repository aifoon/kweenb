#!/bin/bash

# Ping the Google DNS server with a timeout of 1 second
if ping -c 1 -W 1 8.8.8.8 &> /dev/null; then
  echo "true"
else
  echo "false"
fi