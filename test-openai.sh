#!/bin/bash

# Your local development URL
BASE_URL="http://localhost:3000"

# Test the chat endpoint
curl -X POST \
  "${BASE_URL}/api/chat/test" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, are you working?"
      }
    ]
  }'