# Database Schema

## Overview

The application uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations. The database is hosted on **Vercel Postgres** (powered by Neon) in production.

## Schema Location
- **Schema Definition**: `src/lib/server/db/schema.ts`
- **Migrations**: `src/lib/server/db/migrations/`
- **Queries**: `src/lib/server/db/queries.ts`

## Database Diagram

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ Chat : owns
    Chat ||--o{ Message : contains
    Message ||--o{ Vote : has
    User ||--o{ Document : creates
    Document ||--o{ Suggestion : has
    User ||--o{ Suggestion : makes

    User {
        uuid id PK
        varchar email UK
        varchar password
    }

    Session {
        text id PK
        uuid userId FK
        timestamp expiresAt
    }

    Chat {
        uuid id PK
        timestamp createdAt
        text title
        uuid userId FK
        varchar visibility
    }

    Message {
        uuid id PK
        uuid chatId FK
        varchar role
        json parts
        json attachments
        timestamp createdAt
    }

    Vote {
        uuid chatId FK
        uuid messageId FK
        boolean isUpvoted
    }

    Document {
        uuid id PK
        timestamp createdAt PK
        text title
        text content
        varchar kind
        uuid userId FK
    }

    Suggestion {
        uuid id PK
        uuid documentId FK
        timestamp documentCreatedAt FK
        text originalText
        text suggestedText
        text description
        boolean isResolved
        uuid userId FK
        timestamp createdAt
    }
```

## Table Definitions

### User Table
```typescript
export const user = pgTable('User', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    email: varchar('email', { length: 64 }).notNull().unique(),
    password: varchar('password', { length: 64 }).notNull()
});
```

**Purpose**: Stores user authentication information
- `id`: UUID primary key (auto-generated)
- `email`: Unique email address (max 64 chars)
- `password`: Hashed password (bcrypt, max 64 chars)

### Session Table
```typescript
export const session = pgTable('Session', {
    id: text('id').primaryKey().notNull(),
    userId: uuid('userId').notNull().references(() => user.id),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date'
    }).notNull()
});
```

**Purpose**: Manages user sessions for authentication
- `id`: Session token hash (primary key)
- `userId`: Foreign key to user table
- `expiresAt`: Session expiration timestamp

### Chat Table
```typescript
export const chat = pgTable('Chat', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    userId: uuid('userId').notNull().references(() => user.id),
    visibility: varchar('visibility', { enum: ['public', 'private'] })
        .notNull()
        .default('private')
});
```

**Purpose**: Stores chat conversations metadata
- `id`: UUID primary key (auto-generated)
- `createdAt`: Chat creation timestamp
- `title`: Chat title (auto-generated from first message)
- `userId`: Chat owner (foreign key to user)
- `visibility`: 'public' or 'private' (default: 'private')

### Message Table
```typescript
export const message = pgTable('Message', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    chatId: uuid('chatId').notNull().references(() => chat.id),
    role: varchar('role').notNull(),
    parts: json('parts').notNull(),
    attachments: json('attachments').notNull(),
    createdAt: timestamp('createdAt').notNull()
});
```

**Purpose**: Stores individual chat messages
- `id`: UUID primary key (auto-generated)
- `chatId`: Foreign key to chat table
- `role`: Message role ('user' or 'assistant')
- `parts`: Message content as JSON (supports rich content)
- `attachments`: File attachments as JSON array
- `createdAt`: Message timestamp

### Vote Table
```typescript
export const vote = pgTable('Vote', {
    chatId: uuid('chatId').notNull().references(() => chat.id),
    messageId: uuid('messageId').notNull().references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull()
}, (table) => [
    {
        pk: primaryKey({ columns: [table.chatId, table.messageId] })
    }
]);
```

**Purpose**: Stores user votes on AI responses
- `chatId`: Foreign key to chat table
- `messageId`: Foreign key to message table
- `isUpvoted`: true for upvote, false for downvote
- **Composite Primary Key**: (chatId, messageId)

### Document Table
```typescript
export const document = pgTable('Document', {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
        .notNull()
        .default('text'),
    userId: uuid('userId').notNull().references(() => user.id)
}, (table) => [
    {
        pk: primaryKey({ columns: [table.id, table.createdAt] })
    }
]);
```

**Purpose**: Stores AI-generated documents and artifacts
- `id`: Document UUID
- `createdAt`: Creation timestamp
- `title`: Document title
- `content`: Document content (optional)
- `kind`: Document type ('text', 'code', 'image', 'sheet')
- `userId`: Document owner
- **Composite Primary Key**: (id, createdAt)

### Suggestion Table
```typescript
export const suggestion = pgTable('Suggestion', {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId').notNull().references(() => user.id),
    createdAt: timestamp('createdAt').notNull()
}, (table) => [
    {
        pk: primaryKey({ columns: [table.id] }),
        documentRef: foreignKey({
            columns: [table.documentId, table.documentCreatedAt],
            foreignColumns: [document.id, document.createdAt]
        })
    }
]);
```

**Purpose**: Stores AI-generated text suggestions for documents
- `id`: Suggestion UUID (primary key)
- `documentId`: Foreign key to document
- `documentCreatedAt`: Foreign key to document (part of composite)
- `originalText`: Original text being suggested for change
- `suggestedText`: AI-suggested replacement text
- `description`: Optional description of the suggestion
- `isResolved`: Whether suggestion has been applied/resolved
- `userId`: User who made the suggestion
- `createdAt`: Suggestion timestamp

## Database Operations

### Connection Configuration
```typescript
// drizzle.config.ts
export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    out: './src/lib/server/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.POSTGRES_URL!
    }
});
```

### Key Query Patterns

#### User Operations
- `getUserByEmail()`: Authentication lookup
- `createUser()`: User registration
- `deleteUser()`: Account deletion

#### Session Management
- `createSession()`: Login session creation
- `validateSessionToken()`: Session validation
- `deleteSession()`: Logout
- `deleteSessionsForUser()`: Logout all devices

#### Chat Operations
- `getChatById()`: Retrieve chat with messages
- `getChatsByUserId()`: User's chat history
- `saveChat()`: Create new chat
- `deleteChatById()`: Delete chat and messages

#### Message Operations
- `saveMessages()`: Bulk message insert
- `getMessagesByChatId()`: Chat message history
- `updateMessage()`: Edit message content

### Migration Management

#### Commands
```bash
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Apply migrations
pnpm db:push        # Push schema changes
pnpm db:studio      # Open Drizzle Studio
```

#### Migration Files
Located in `src/lib/server/db/migrations/`
- Auto-generated SQL migration files
- Version-controlled database changes
- Rollback support

## Environment Variables

```bash
POSTGRES_URL=postgresql://username:password@host:port/database
```

## Performance Considerations

### Indexes
- Primary keys are automatically indexed
- Foreign keys should have indexes for join performance
- Consider composite indexes for frequent query patterns

### Query Optimization
- Use `select()` to limit returned columns
- Implement pagination for large result sets
- Use transactions for multi-table operations

### Connection Pooling
- Vercel Postgres handles connection pooling
- Local development uses direct connections
- Production uses connection pooling for scalability 