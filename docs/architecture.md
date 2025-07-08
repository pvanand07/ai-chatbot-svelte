# Architecture Overview

## System Architecture Diagram

```mermaid
graph TB
    %% User Interface Layer
    subgraph "Frontend (SvelteKit)"
        UI["User Interface"]
        Chat["Chat Component"]
        Sidebar["Sidebar Navigation"]
        Auth["Auth Forms"]
        MultiInput["Multimodal Input"]
    end

    %% Application Layer
    subgraph "SvelteKit Routes"
        ChatRoutes["/chat Routes"]
        AuthRoutes["/auth Routes"]
        APIRoutes["/api Routes"]
        Layout["Layout Components"]
    end

    %% API Layer
    subgraph "API Endpoints"
        ChatAPI["/api/chat"]
        HistoryAPI["/api/history"]
        VoteAPI["/api/vote"]
        FilesAPI["/api/files"]
        AuthAPI["/api/auth"]
    end

    %% Business Logic Layer
    subgraph "Server Logic"
        AIService["AI Service"]
        AuthService["Auth Service"]
        DBQueries["Database Queries"]
        SessionMgmt["Session Management"]
    end

    %% AI Integration
    subgraph "AI Providers"
        XAI["xAI - Grok"]
        Groq["Groq - Reasoning"]
        AISDK["AI SDK"]
    end

    %% Data Layer
    subgraph "Database (PostgreSQL)"
        Users["Users Table"]
        Sessions["Sessions Table"]
        Chats["Chats Table"]
        Messages["Messages Table"]
        Votes["Votes Table"]
        Documents["Documents Table"]
    end

    %% External Storage
    subgraph "External Services"
        VercelBlob["Vercel Blob Storage"]
        VercelPostgres["Vercel Postgres"]
    end

    %% Connections
    UI --> Chat
    UI --> Sidebar
    UI --> Auth
    Chat --> MultiInput
    
    Chat --> ChatRoutes
    Auth --> AuthRoutes
    Sidebar --> ChatRoutes
    
    ChatRoutes --> ChatAPI
    AuthRoutes --> AuthAPI
    ChatAPI --> HistoryAPI
    ChatAPI --> VoteAPI
    
    ChatAPI --> AIService
    AuthAPI --> AuthService
    
    AIService --> AISDK
    AISDK --> XAI
    AISDK --> Groq
    
    AuthService --> SessionMgmt
    AIService --> DBQueries
    AuthService --> DBQueries
    
    DBQueries --> Users
    DBQueries --> Sessions
    DBQueries --> Chats
    DBQueries --> Messages
    DBQueries --> Votes
    DBQueries --> Documents
    
    FilesAPI --> VercelBlob
    DBQueries --> VercelPostgres
```

## Component Hierarchy

### Frontend Architecture
```
src/routes/
├── +layout.svelte (Root layout with themes)
├── (auth)/
│   ├── +layout.svelte (Auth layout)
│   └── [authType]/+page.svelte (Login/Register)
└── (chat)/
    ├── +layout.svelte (Chat layout with sidebar)
    ├── +page.svelte (New chat page)
    └── chat/[chatId]/+page.svelte (Existing chat)
```

### Component Tree
```
App
├── ThemeProvider
├── Toaster
└── Router
    ├── AuthLayout
    │   └── AuthForm
    └── ChatLayout
        ├── AppSidebar
        │   ├── SidebarUserNav
        │   └── SidebarHistory
        └── SidebarInset
            ├── ChatHeader
            ├── Chat
            │   ├── Messages
            │   └── MultimodalInput
            └── SuggestedActions
```

## Data Flow Architecture

### Request Flow
1. **User Input** → Frontend Component
2. **Component** → SvelteKit Route
3. **Route** → API Endpoint
4. **API** → Server Logic
5. **Server** → Database/AI Service
6. **Response** → Streams back through chain

### AI Processing Flow
```mermaid
sequenceDiagram
    participant User
    participant Chat
    participant API
    participant AIService
    participant Provider
    participant DB

    User->>Chat: Send message
    Chat->>API: POST /api/chat
    API->>AIService: Process with AI SDK
    AIService->>Provider: Stream request (xAI/Groq)
    Provider-->>AIService: Stream response
    AIService-->>API: Stream chunks
    API-->>Chat: Real-time updates
    Chat-->>User: Display streaming response
    API->>DB: Save messages
```

## Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Anonymous
    Anonymous --> Login: User clicks login
    Anonymous --> Chat: If anonymous allowed
    Login --> Authenticated: Valid credentials
    Login --> Login: Invalid credentials
    Authenticated --> Chat: Access granted
    Chat --> [*]: Logout
    Authenticated --> [*]: Session expires
```

## File Structure Overview

```
project-root/
├── src/
│   ├── routes/           # SvelteKit routes (pages & API)
│   ├── lib/
│   │   ├── components/   # Reusable UI components
│   │   ├── server/       # Server-side logic
│   │   ├── hooks/        # Svelte hooks and context
│   │   └── utils/        # Utility functions
│   ├── params/           # Route parameter matchers
│   └── app.html          # Root HTML template
├── static/               # Static assets
├── docs/                 # Project documentation
└── drizzle.config.ts     # Database configuration
```

## Key Design Patterns

### 1. **Route Groups**
- `(auth)` - Authentication pages
- `(chat)` - Chat interface pages

### 2. **Server Functions**
- `+page.server.ts` - Server-side data loading
- `+server.ts` - API endpoints

### 3. **Component Composition**
- Layout components for shared UI
- Context-based state management
- Prop drilling minimization

### 4. **Real-time Communication**
- Server-sent events for AI streaming
- WebSocket-like experience via AI SDK

### 5. **Error Handling**
- Result-based error handling with `neverthrow`
- Graceful degradation for offline states
- User-friendly error messages 