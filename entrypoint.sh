#!/bin/sh
if [ -z "$ACTUAL_SERVER_URL" ]; then
  echo "Container failed to start, ACTUAL_SERVER_URL environment variable is mandatory"
  exit 1
fi
if [ -z "$ACTUAL_SERVER_PASSWORD" ]; then
  echo "Container failed to start, ACTUAL_SERVER_PASSWORD environment variable is mandatory"
  exit 1
fi
if [ -z "$API_KEY" ]; then
  echo "Container failed to start, API_KEY environment variable is mandatory"
  exit 1
fi
exec node server.js