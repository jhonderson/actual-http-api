#!/bin/sh
if [ -z "$ACTUAL_SERVER_URL" ]; then
  echo "Container failed to start, ACTUAL_SERVER_URL environment variable is mandatory"
  exit 1
fi
if [ -z "$ACTUAL_SERVER_PASSWORD" ] && [ -z "$ACTUAL_SERVER_PASSWORD_PATH" ]; then
  echo "Container failed to start, either ACTUAL_SERVER_PASSWORD or ACTUAL_SERVER_PASSWORD_PATH is mandatory"
  exit 1
fi
if [ -z "$API_KEY" ] && [ -z "$API_KEY_PATH" ]; then
  echo "Container failed to start, either API_KEY or API_KEY_PATH is mandatory"
  exit 1
fi
exec node server.js