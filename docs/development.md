# Development Setup

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (package manager)
- **PostgreSQL**: v14 or higher (for local database)
- **Git**: For version control

### Recommended Tools
- **VS Code**: With Svelte extension
- **Drizzle Studio**: Database management GUI
- **Thunder Client**: API testing (VS Code extension)

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-org/ai-chatbot-svelte.git
cd ai-chatbot-svelte
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup

#### Copy Environment Template
```bash
cp .env.example .env.local
```

#### Required Environment Variables
```bash
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/ai_chatbot

# AI Providers
XAI_API_KEY=xai-your-api-key-here
GROQ_API_KEY=gsk_your-groq-key-here

# Optional
PUBLIC_ALLOW_ANONYMOUS_CHATS=true
```

### 4. Database Setup

#### Start PostgreSQL
```bash
# Using Docker (recommended)
docker run --name postgres-ai-chat \
  -e POSTGRES_USER=chatbot \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_chatbot \
  -p 5432:5432 \
  -d postgres:15

# Or start local PostgreSQL service
sudo systemctl start postgresql
```

#### Run Database Migrations
```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations to database
```

### 5. Start Development Server
```bash
pnpm dev
```

Navigate to `http://localhost:5173`

## Development Workflow

### Project Structure
```
ai-chatbot-svelte/
├── src/
│   ├── routes/           # SvelteKit routes
│   │   ├── (auth)/      # Authentication pages
│   │   ├── (chat)/      # Chat interface
│   │   └── +layout.svelte
│   ├── lib/
│   │   ├── components/  # Reusable components
│   │   ├── server/      # Server-side logic
│   │   │   ├── ai/      # AI integration
│   │   │   ├── auth/    # Authentication
│   │   │   └── db/      # Database layer
│   │   ├── hooks/       # Svelte hooks
│   │   └── utils/       # Utility functions
│   ├── params/          # Route parameter matchers
│   ├── app.css         # Global styles
│   ├── app.d.ts        # Type declarations
│   └── app.html        # HTML template
├── static/              # Static assets
├── docs/               # Documentation
├── drizzle.config.ts   # Database config
├── svelte.config.js    # Svelte config
├── vite.config.ts      # Vite config
├── tailwind.config.js  # Tailwind config
└── package.json
```

### Available Scripts

#### Development
```bash
pnpm dev              # Start dev server with HMR
pnpm dev --host       # Expose on network
pnpm dev --port 3000  # Custom port
```

#### Building
```bash
pnpm build            # Production build
pnpm preview          # Preview production build
```

#### Code Quality
```bash
pnpm lint             # ESLint + Prettier check
pnpm format           # Format code with Prettier
pnpm check            # Svelte type checking
pnpm check:watch      # Type checking in watch mode
```

#### Database Management
```bash
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema changes (dev only)
pnpm db:pull          # Pull schema from database
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:check         # Check migration consistency
```

## Development Tools

### VS Code Extensions
```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Debugging Configuration

#### VS Code Launch Config
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch SvelteKit",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js",
      "args": ["--port", "5173"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Browser Debugging
```bash
# Enable source maps in development
# Already configured in vite.config.ts
```

## Database Development

### Drizzle Studio
```bash
pnpm db:studio
```
Access at `https://local.drizzle.studio`

### Schema Changes
```bash
# 1. Modify schema in src/lib/server/db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Review generated migration in src/lib/server/db/migrations/
# 4. Apply migration
pnpm db:migrate
```

### Database Seeding
```typescript
// Create src/lib/server/db/seed.ts
import { db } from './index.js';
import { user, chat, message } from './schema.js';

export async function seed() {
    // Insert test data
    await db.insert(user).values({
        email: 'test@example.com',
        password: 'hashed_password'
    });
}
```

### Query Testing
```typescript
// Test queries in isolation
import { getUserByEmail } from './queries.js';

const result = await getUserByEmail('test@example.com');
console.log(result);
```

## API Development

### Testing API Endpoints

#### Using curl
```bash
# Test chat API
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-token" \
  -d '{
    "id": "test-chat-id",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

#### Using Thunder Client (VS Code)
```json
{
  "method": "POST",
  "url": "http://localhost:5173/api/chat",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "session=your-session-token"
  },
  "body": {
    "id": "test-chat-id",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }
}
```

### Mock Data
```typescript
// src/lib/server/mocks/index.ts
export const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
};

export const mockMessages = [
    {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date()
    },
    {
        id: 'msg-2', 
        role: 'assistant',
        content: 'Hi there!',
        createdAt: new Date()
    }
];
```

## Component Development

### Component Creation Template
```svelte
<!-- src/lib/components/NewComponent.svelte -->
<script lang="ts">
    // Props
    interface Props {
        title: string;
        optional?: boolean;
    }
    
    let { title, optional = false }: Props = $props();
    
    // State
    let count = $state(0);
    
    // Derived
    let doubled = $derived(count * 2);
    
    // Effects
    $effect(() => {
        console.log('Count changed:', count);
    });
    
    // Functions
    function handleClick() {
        count++;
    }
</script>

<div class="component">
    <h2>{title}</h2>
    
    {#if optional}
        <p>Optional content</p>
    {/if}
    
    <button onclick={handleClick}>
        Count: {count} (doubled: {doubled})
    </button>
</div>

<style>
    .component {
        /* Component-scoped styles */
        padding: 1rem;
        border: 1px solid var(--border);
    }
</style>
```

### Storybook Setup (Optional)
```bash
npx storybook@latest init
```

```typescript
// .storybook/main.ts
export default {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-svelte-csf'
    ],
    framework: {
        name: '@storybook/sveltekit',
        options: {}
    }
};
```

## Testing Setup

### Unit Testing with Vitest
```bash
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        setupFiles: ['src/test/setup.ts']
    }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Component Testing
```typescript
// src/lib/components/Button.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

test('renders button with text', () => {
    render(Button, { props: { text: 'Click me' } });
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
});

test('handles click events', async () => {
    const { component } = render(Button, { 
        props: { text: 'Click me' } 
    });
    
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    
    // Test component state or emitted events
});
```

### E2E Testing with Playwright
```bash
pnpm add -D @playwright/test
npx playwright install
```

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
});
```

## Hot Reload and Development Experience

### HMR Configuration
```typescript
// vite.config.ts - Already configured
export default defineConfig({
    plugins: [sveltekit()],
    server: {
        hmr: {
            port: 5174  // Separate HMR port
        }
    }
});
```

### Auto-reload on File Changes
- Svelte components: Instant HMR
- TypeScript files: Fast rebuild
- CSS/Tailwind: Instant updates
- Route files: Page refresh

### Development Performance
```bash
# Enable faster builds
export NODE_OPTIONS="--max-old-space-size=8192"

# Faster installs
echo "shamefully-hoist=true" >> .npmrc
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
pnpm dev --port 3000
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U chatbot -d ai_chatbot
```

#### TypeScript Errors
```bash
# Clear SvelteKit cache
rm -rf .svelte-kit

# Rebuild types
pnpm check
```

#### Build Errors
```bash
# Clear all caches
rm -rf .svelte-kit node_modules/.vite dist

# Reinstall and rebuild
pnpm install
pnpm build
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=vite:* pnpm dev

# Database query debugging
DEBUG=drizzle:* pnpm dev
```

## Git Workflow

### Recommended Branches
```bash
main          # Production-ready code
develop       # Integration branch
feature/*     # Feature development
hotfix/*      # Production fixes
```

### Commit Conventions
```bash
feat: add user authentication
fix: resolve chat message ordering
docs: update API documentation
style: format code with prettier
refactor: extract auth utilities
test: add component unit tests
```

### Pre-commit Hooks
```bash
# Install husky
pnpm add -D husky lint-staged

# Setup pre-commit
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,svelte}": ["prettier --write", "eslint --fix"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
``` 