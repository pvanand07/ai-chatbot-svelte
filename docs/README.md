# AI Chatbot Svelte - Documentation

This documentation provides comprehensive information for understanding and modifying the AI Chatbot Svelte project.

## 📚 Documentation Index

- [**Architecture Overview**](./architecture.md) - System architecture and component relationships
- [**Database Schema**](./database.md) - Complete database structure and relationships
- [**API Documentation**](./api.md) - All API endpoints and their usage
- [**Component Structure**](./components.md) - Frontend component organization and patterns
- [**Authentication Flow**](./authentication.md) - User authentication and session management
- [**AI Integration**](./ai-integration.md) - AI models, prompts, and streaming implementation
- [**Development Setup**](./development.md) - Local development environment setup
- [**Deployment Guide**](./deployment.md) - Production deployment instructions

## 🎯 Quick Navigation

### For Frontend Changes
- Component structure: [components.md](./components.md)
- UI patterns: [components.md#ui-patterns](./components.md#ui-patterns)
- Svelte 5 usage: [components.md#svelte-5-patterns](./components.md#svelte-5-patterns)

### For Backend Changes
- API endpoints: [api.md](./api.md)
- Database operations: [database.md](./database.md)
- Authentication: [authentication.md](./authentication.md)

### For AI Features
- Model configuration: [ai-integration.md](./ai-integration.md)
- Prompts and responses: [ai-integration.md#prompts](./ai-integration.md#prompts)
- Streaming implementation: [ai-integration.md#streaming](./ai-integration.md#streaming)

## 📋 Project Overview

**Tech Stack**: SvelteKit + Svelte 5, TypeScript, TailwindCSS, PostgreSQL, AI SDK
**Purpose**: Production-ready AI chatbot with authentication, persistence, and multi-model support
**Architecture**: Full-stack SvelteKit application with real-time AI streaming

## 🔧 Key Technologies

- **Frontend**: SvelteKit, Svelte 5 (runes), TypeScript, TailwindCSS, shadcn-svelte
- **Backend**: SvelteKit server functions, Drizzle ORM, PostgreSQL
- **AI**: AI SDK by Vercel, xAI (Grok), Groq
- **Auth**: Custom session-based authentication
- **Storage**: Vercel Postgres, Vercel Blob 