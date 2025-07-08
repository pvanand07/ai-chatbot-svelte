# API Documentation

## Overview

The application uses SvelteKit's server-side API routes located in `src/routes/(chat)/api/`. All API endpoints follow RESTful conventions and return JSON responses.

## Base URL
- **Development**: `http://localhost:5173/api`
- **Production**: `https://your-domain.com/api`

## Authentication

### Session-based Authentication
- Uses HTTP-only cookies for session management
- Session token is validated on each request
- Anonymous access is configurable via `PUBLIC_ALLOW_ANONYMOUS_CHATS`

### Headers
```typescript
// Required for authenticated endpoints
Cookie: session=<session-token>

// Content-Type for POST requests
Content-Type: application/json
```

## API Endpoints

### Chat API

#### POST `/api/chat`
**Purpose**: Send a message to AI and receive streaming response

**Location**: `src/routes/(chat)/api/chat/+server.ts`

**Request Body**:
```typescript
{
    id: string;          // Chat ID (UUID)
    messages: UIMessage[] // Array of chat messages
}
```

**UIMessage Structure**:
```typescript
interface UIMessage {
    id: string;
    role: 'user' | 'assistant';
    parts: MessagePart[];
    experimental_attachments?: Attachment[];
}
```

**Response**: Server-Sent Events (SSE) stream
```typescript
// Streaming chunks of AI response
data: {"type": "text", "content": "Hello"}
data: {"type": "finish", "finishReason": "stop"}
```

**Authentication**: Required (unless anonymous chats enabled)

**Error Responses**:
- `401`: Unauthorized (no session)
- `400`: Invalid request (no user message, no model selected)
- `403`: Forbidden (not chat owner)
- `500`: Server error

#### DELETE `/api/chat`
**Purpose**: Delete a chat conversation

**Request Body**:
```typescript
{
    id: string; // Chat ID to delete
}
```

**Response**: 
```typescript
// Success
200 OK
"Chat deleted"

// Error
500 Internal Server Error
```

**Authentication**: Required

#### POST `/api/chat/visibility`
**Purpose**: Update chat visibility (public/private)

**Request Body**:
```typescript
{
    chatId: string;
    visibility: 'public' | 'private';
}
```

**Response**:
```typescript
// Success
200 OK
{ success: true }
```

### History API

#### GET `/api/history`
**Purpose**: Get user's chat history

**Location**: `src/routes/(chat)/api/history/+server.ts`

**Query Parameters**:
```typescript
?limit=20      // Optional: Number of chats to return
?offset=0      // Optional: Pagination offset
```

**Response**:
```typescript
{
    chats: Array<{
        id: string;
        title: string;
        createdAt: string;
        visibility: 'public' | 'private';
    }>
}
```

**Authentication**: Required

### Vote API

#### POST `/api/vote`
**Purpose**: Vote on AI messages (upvote/downvote)

**Location**: `src/routes/(chat)/api/vote/+server.ts`

**Request Body**:
```typescript
{
    chatId: string;
    messageId: string;
    isUpvoted: boolean; // true for upvote, false for downvote
}
```

**Response**:
```typescript
// Success
200 OK
{ success: true }

// Error
400 Bad Request
{ error: "Message not found" }
```

**Authentication**: Required

### Files API

#### POST `/api/files`
**Purpose**: Upload file attachments

**Location**: `src/routes/(chat)/api/files/+server.ts`

**Request**: Multipart form data
```typescript
FormData {
    file: File; // File to upload
}
```

**Response**:
```typescript
{
    url: string;      // Vercel Blob URL
    fileName: string; // Original filename
    fileSize: number; // File size in bytes
    fileType: string; // MIME type
}
```

**Authentication**: Required

**File Limitations**:
- Max size: 10MB
- Supported types: Images, documents, text files

### Suggestions API

#### POST `/api/suggestions`
**Purpose**: Generate AI suggestions for text

**Request Body**:
```typescript
{
    documentId: string;
    text: string;     // Text to get suggestions for
    context?: string; // Optional context
}
```

**Response**:
```typescript
{
    suggestions: Array<{
        id: string;
        originalText: string;
        suggestedText: string;
        description: string;
        confidence: number;
    }>
}
```

**Authentication**: Required

#### PATCH `/api/suggestions/[id]`
**Purpose**: Accept or reject a suggestion

**Request Body**:
```typescript
{
    action: 'accept' | 'reject';
}
```

**Response**:
```typescript
{ success: true }
```

### Cookie Synchronization

#### POST `/api/synchronized-cookie`
**Purpose**: Synchronize client-side preferences with server

**Request Body**:
```typescript
{
    key: string;   // Cookie name
    value: string; // Cookie value
}
```

**Response**:
```typescript
{ success: true }
```

**Use Cases**:
- Model selection preferences
- Theme preferences
- UI state synchronization

## Error Handling

### Standard Error Response
```typescript
{
    error: string;    // Error message
    code?: string;    // Error code
    details?: any;    // Additional error details
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `422`: Unprocessable Entity (invalid data)
- `500`: Internal Server Error

## Rate Limiting

### Current Implementation
- No explicit rate limiting implemented
- Relies on Vercel's platform limits
- Consider implementing for production use

### Recommended Limits
```typescript
// Suggested rate limits
{
    chat: "10 requests/minute per user",
    files: "5 uploads/minute per user",
    auth: "5 attempts/minute per IP"
}
```

## Streaming Responses

### Chat Streaming
The chat API uses Server-Sent Events (SSE) for real-time response streaming:

```typescript
// Client-side handling
const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ id, messages })
});

const reader = response.body?.getReader();
// Process streaming chunks
```

### Stream Events
```typescript
// Text chunk
{ type: 'text', content: string }

// Tool call
{ type: 'tool-call', toolName: string, args: object }

// Tool result
{ type: 'tool-result', result: any }

// Reasoning (for reasoning models)
{ type: 'reasoning', content: string }

// Finish
{ type: 'finish', finishReason: 'stop' | 'length' | 'tool_calls' }
```

## AI Model Integration

### Model Selection
```typescript
// Cookie-based model selection
Cookie: selected-model=chat-model

// Available models
{
    'chat-model': 'grok-2-1212',           // xAI primary
    'chat-model-reasoning': 'deepseek-r1'  // Groq reasoning
}
```

### AI SDK Configuration
```typescript
// Server-side AI provider setup
const result = streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: systemPrompt({ selectedChatModel }),
    messages,
    maxSteps: 5,
    experimental_transform: smoothStream({ chunking: 'word' })
});
```

## Database Integration

### Message Persistence
```typescript
// Auto-save messages after AI response
await saveMessages({
    messages: [{
        id: assistantId,
        chatId: id,
        role: assistantMessage.role,
        parts: assistantMessage.parts,
        attachments: assistantMessage.experimental_attachments ?? [],
        createdAt: new Date()
    }]
});
```

### Chat Creation
```typescript
// Auto-create chat with AI-generated title
const title = await generateTitleFromUserMessage({ message: userMessage });
const chat = await saveChat({ id, userId: user.id, title });
```

## Security Considerations

### Input Validation
- Validate all request bodies
- Sanitize user inputs
- Check file types and sizes

### Authorization
- Verify user ownership of resources
- Check session validity
- Implement proper access controls

### Data Protection
- Don't log sensitive data
- Sanitize error messages
- Use HTTPS in production 