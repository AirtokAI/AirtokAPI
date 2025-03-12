
# Airtok AI API Documentation

## Overview

The AirTok AI API provides access to a modified chat style interface into AirtokBot, it features memory retention and knowledge-based responses. This documentation covers all available endpoints, required parameters, and provides example requests.

***Important: AirtokBot must be installed into the telegram group for groupId to work.***

**Base URL**: `https://app.airtok.ai/api/v1`

## Authentication

All API requests require authentication using an API key. Include the API key in the request headers:

```
x-api-key: YOUR_API_KEY
```

> **Important**: Keep your API key secure. Do not share it in client-side code.

## Endpoints

### 1. Health Check

Check the API service health status.

**Endpoint**: `GET /health`

**Response Example**:
```json
{
  "status": "ok",
  "version": "v1"
}
```

### 2. NPC Chat

Generate a response from the AI assistant based on user input with chat memory.

**Endpoint**: `POST /npc/chat`

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| groupId | string | Yes | The telegram group identifier (e.g., -1002212916980) |
| userPrompt | string | Yes | The user's message or query |
| userId | string | No | Optional unique identifier for the user. If not provided, a unique ID will be generated |

**Example Request**:
```json
{
  "groupId": "-1002212916980",
  "userPrompt": "Tell me about your features",
  "userId": "user123"
}
```

**Example Response**:
```json
{
  "response": "I offer a range of features including conversation memory, knowledge base integration, and customized responses based on your project's needs. I can provide information about your platform, answer user questions, and maintain a professional tone throughout interactions.",
  "userId": "user123"
}
```

### 3. NPC Chat Streaming

Stream a response from the AI assistant, useful for displaying responses character by character.

**Endpoint**: `POST /npc/chat/stream`

**Request Body Parameters**:
Same as the regular chat endpoint.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| groupId | string | Yes | The telegram group identifier (e.g., -1002212916980) |
| userPrompt | string | Yes | The user's message or query |
| userId | string | No | Optional unique identifier for the user. If not provided, a unique ID will be generated |

**Example Request**:
```json
{
  "groupId": "-1002212916980",
  "userPrompt": "What can you tell me about this project?",
  "userId": "user123"
}
```

**Response**:
This endpoint returns a server-sent event (SSE) stream. The response will be delivered in chunks, with each chunk prefixed with `data: `. The first chunk will contain the userId for session continuity.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: Request succeeded
- `400 Bad Request`: Missing required parameters
- `401 Unauthorized`: Invalid API key
- `500 Internal Server Error`: Server-side error

Error responses include an error object with a message:

```json
{
  "error": "Bad Request",
  "message": "Missing required parameters: groupId and userPrompt are required"
}
```

## Maintaining Chat Sessions

To maintain continuity in conversations, store and reuse the `userId` returned from your first request in subsequent requests. This allows the API to access the conversation history and provide contextually relevant responses.

## Examples

### cURL Examples

1. Health Check:
```bash
curl -X GET "https://app.airtok.ai/api/v1/health" \
  -H "x-api-key: YOUR_API_KEY"
```

2. Regular Chat:
```bash
curl -X POST "https://app.airtok.ai/api/v1/npc/chat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "groupId": "-1002212916980",
    "userPrompt": "Hello, how can you help me?",
    "userId": "user123"
  }'
```

3. Streaming Chat:
```bash
curl -X POST "https://app.airtok.ai/api/v1/npc/chat/stream" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "groupId": "-1002212916980",
    "userPrompt": "Tell me about your features",
    "userId": "user123"
  }'
```

### JavaScript Example

```javascript
// Regular chat request
async function sendChatRequest() {
  const response = await fetch('https://app.airtok.ai/api/v1/npc/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      groupId: '-1002212916980',
      userPrompt: 'Hello AI!',
      userId: 'user123'
    })
  });
  
  const data = await response.json();
  console.log(data.response);
  
  // Store userId for future requests
  localStorage.setItem('chatUserId', data.userId);
}

// Streaming chat request
function streamChatRequest() {
  const eventSource = new EventSource('https://app.airtok.ai/api/v1/npc/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      groupId: '-1002212916980',
      userPrompt: 'Tell me about your features',
      userId: 'user123'
    })
  });
  
  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(data); // Process each chunk
  };
  
  eventSource.onerror = function() {
    eventSource.close();
  };
}
```

## Rate Limiting

To ensure service stability, the API implements rate limiting. Please respect these limits:
- 60 requests per minute per API key
- 1000 requests per day per API key

If you need higher limits, please contact our support team.

## Support

For issues or questions about the API, please contact support at admin@airtok.ai
