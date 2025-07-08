# Component Structure

## Overview

The frontend is built with **Svelte 5** using modern runes syntax, **TypeScript**, and **shadcn-svelte** for UI components. The component architecture follows a modular, reusable design pattern.

## Component Directory Structure

```
src/lib/components/
├── ui/                    # shadcn-svelte UI primitives
│   ├── button/
│   ├── input/
│   ├── sidebar/
│   └── ...
├── icons/                 # Icon components
├── markdown/              # Markdown rendering
├── messages/              # Message-related components
├── sidebar-history/       # Sidebar history components
├── artifact/              # AI artifact components
├── chat.svelte           # Main chat interface
├── multimodal-input.svelte # Input with file support
├── app-sidebar.svelte    # Application sidebar
└── auth-form.svelte      # Authentication forms
```

## Core Components

### Main Chat Components

#### `chat.svelte`
**Purpose**: Main chat interface container
**Location**: `src/lib/components/chat.svelte`

```typescript
// Props interface
interface Props {
    user: User | undefined;
    chat: DbChat | undefined;
    initialMessages: UIMessage[];
    readonly: boolean;
}
```

**Key Features**:
- Integrates with AI SDK's `Chat` component
- Real-time message streaming
- Error handling with toast notifications
- Message persistence

**Svelte 5 Patterns**:
```svelte
<script lang="ts">
    // Props using $props rune
    let { user, chat, readonly, initialMessages } = $props();
    
    // State using $state rune
    let attachments = $state<Attachment[]>([]);
    
    // Derived values using $derived rune
    const chatClient = $derived(new Chat({
        id: chat?.id,
        initialMessages: untrack(() => initialMessages),
        // ... configuration
    }));
</script>
```

#### `multimodal-input.svelte`
**Purpose**: Chat input with file attachment support
**Location**: `src/lib/components/multimodal-input.svelte`

**Features**:
- Text input with auto-resize
- File drag & drop
- Attachment previews
- Submit button integration
- Keyboard shortcuts (Ctrl+Enter)

**Props**:
```typescript
interface Props {
    attachments: Attachment[];
    user: User | undefined;
    chatClient: Chat;
    class?: string;
}
```

#### `messages.svelte`
**Purpose**: Display chat message history
**Location**: `src/lib/components/messages.svelte`

**Features**:
- Message bubbles with role-based styling
- Markdown rendering for AI responses
- Loading indicators
- Message timestamps
- Vote buttons (upvote/downvote)

### Layout Components

#### `app-sidebar.svelte`
**Purpose**: Application sidebar with navigation
**Location**: `src/lib/components/app-sidebar.svelte`

```svelte
<script lang="ts">
    let { user } = $props();
    
    // Context integration
    const chatHistory = ChatHistory.fromContext();
</script>

<Sidebar>
    <SidebarHeader>
        <SidebarUserNav {user} />
    </SidebarHeader>
    <SidebarContent>
        <SidebarHistory />
    </SidebarContent>
</Sidebar>
```

**Features**:
- User navigation menu
- Chat history list
- Model selection
- Collapsible design
- Theme switching

#### `chat-header.svelte`
**Purpose**: Chat interface header with controls
**Location**: `src/lib/components/chat-header.svelte`

**Features**:
- Chat title display
- Visibility toggle (public/private)
- Model selector
- Chat actions (delete, share)

### Authentication Components

#### `auth-form.svelte`
**Purpose**: Login and registration forms
**Location**: `src/lib/components/auth-form.svelte`

**Features**:
- Tabbed interface (Login/Register)
- Form validation
- Error handling
- Progressive enhancement with SvelteKit forms

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    
    let { form } = $props(); // From page data
</script>

<form method="POST" use:enhance>
    <!-- Form fields -->
</form>
```

## UI Component Library

### shadcn-svelte Components

The project uses **shadcn-svelte** for consistent, accessible UI components:

#### Button Component
```svelte
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
</script>

<Button variant="default" size="sm" onclick={handleClick}>
    Click me
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes**: `sm`, `default`, `lg`, `icon`

#### Input Component
```svelte
<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    
    let value = $state('');
</script>

<Input bind:value placeholder="Enter text..." />
```

#### Sidebar Components
```svelte
<script lang="ts">
    import {
        Sidebar,
        SidebarContent,
        SidebarHeader,
        SidebarProvider
    } from '$lib/components/ui/sidebar';
</script>

<SidebarProvider>
    <Sidebar>
        <SidebarHeader>Header content</SidebarHeader>
        <SidebarContent>Main content</SidebarContent>
    </Sidebar>
</SidebarProvider>
```

## Svelte 5 Patterns

### State Management
```svelte
<script lang="ts">
    // Reactive state
    let count = $state(0);
    
    // Derived state
    let doubled = $derived(count * 2);
    
    // Side effects
    $effect(() => {
        console.log('Count changed:', count);
    });
</script>
```

### Props and Context
```svelte
<script lang="ts">
    // Component props
    let { title, items = [] } = $props();
    
    // Context usage
    const theme = getContext('theme');
    setContext('data', items);
</script>
```

### Event Handling
```svelte
<!-- Modern event syntax (no colons) -->
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={handleSubmit}>
```

### Snippets (Replacing Slots)
```svelte
<!-- Define snippet -->
{#snippet item(data)}
    <div class="item">{data.name}</div>
{/snippet}

<!-- Use snippet -->
{#each items as item}
    {@render item(item)}
{/each}
```

## Component Communication Patterns

### Props Down, Events Up
```svelte
<!-- Parent component -->
<script lang="ts">
    let value = $state('');
    
    function handleChange(newValue: string) {
        value = newValue;
    }
</script>

<ChildComponent {value} onchange={handleChange} />

<!-- Child component -->
<script lang="ts">
    let { value, onchange } = $props();
</script>

<input {value} oninput={(e) => onchange(e.currentTarget.value)} />
```

### Context for Deep Props
```svelte
<!-- Provider -->
<script lang="ts">
    import { setContext } from 'svelte';
    
    const chatHistory = new ChatHistory(data.chats);
    setContext('chatHistory', chatHistory);
</script>

<!-- Consumer -->
<script lang="ts">
    import { getContext } from 'svelte';
    
    const chatHistory = getContext('chatHistory');
</script>
```

### Reactive Classes Pattern
```svelte
<script lang="ts">
    let { active, disabled } = $props();
</script>

<!-- Object-style classes -->
<div class:active class:disabled>Content</div>

<!-- Or with object syntax -->
<div class={{ active, disabled, 'custom-class': true }}>Content</div>
```

## Form Handling

### SvelteKit Forms Integration
```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    
    let { form } = $props(); // From +page.server.ts
</script>

<form method="POST" use:enhance>
    <input name="email" type="email" />
    <input name="password" type="password" />
    <button type="submit">Submit</button>
</form>

{#if form?.error}
    <p class="error">{form.error}</p>
{/if}
```

### Client-side Validation
```svelte
<script lang="ts">
    let email = $state('');
    let isValid = $derived(email.includes('@'));
</script>

<input bind:value={email} class:invalid={!isValid} />
```

## Styling Patterns

### TailwindCSS Integration
```svelte
<div class="flex items-center justify-between p-4 bg-background border rounded-lg">
    <h2 class="text-lg font-semibold">Title</h2>
    <Button variant="outline" size="sm">Action</Button>
</div>
```

### CSS Custom Properties
```svelte
<style>
    .component {
        --primary-color: theme(colors.primary);
        --border-radius: theme(borderRadius.md);
    }
</style>
```

### Component-scoped Styles
```svelte
<style>
    /* Scoped to this component */
    .local-style {
        color: red;
    }
    
    /* Global styles */
    :global(.global-style) {
        color: blue;
    }
</style>
```

## Performance Considerations

### Lazy Loading
```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    
    let Component: any = $state(null);
    
    onMount(async () => {
        const module = await import('./HeavyComponent.svelte');
        Component = module.default;
    });
</script>

{#if Component}
    <svelte:component this={Component} />
{/if}
```

### Virtual Lists (for large datasets)
```svelte
<script lang="ts">
    import VirtualList from '@sveltejs/svelte-virtual-list';
    
    let { items } = $props();
</script>

<VirtualList {items} let:item>
    <MessageComponent message={item} />
</VirtualList>
```

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/svelte';
import Component from './Component.svelte';

test('renders correctly', () => {
    render(Component, { props: { title: 'Test' } });
    expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### User Interaction Testing
```typescript
import { fireEvent } from '@testing-library/svelte';

test('handles click', async () => {
    const { component } = render(Component);
    const button = screen.getByRole('button');
    
    await fireEvent.click(button);
    
    expect(component.clicked).toBe(true);
});
``` 