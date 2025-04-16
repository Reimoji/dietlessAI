#!/bin/bash

# Replace with your OpenAI API key
API_KEY="your-api-key-here"

# Test both models
for MODEL in "gpt-4o-mini" "gpt-4.1-nano-2025-04-14"; do
  echo "Testing model: $MODEL"
  
  curl -X POST \
    "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "{
      \"model\": \"$MODEL\",
      \"messages\": [
        {
          \"role\": \"user\",
          \"content\": \"Hello, are you working?\"
        }
      ],
      \"temperature\": 0.7,
      \"max_tokens\": 1000
    }"
  
  echo -e "\n\n"
done